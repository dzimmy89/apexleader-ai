import { getDb } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/account/access";

// Deletes every Firestore record (and signed agreement PDF) that belongs to a
// TEST client, so it stops showing in payments due, revenue and the CRM.
// Only addresses with "+test" before the @ are accepted, so a real client
// can never be removed with it.
//
// Run via the "Remove a test client" workflow, or locally:
//   npx tsx scripts/remove-test-client.ts --email hello+testclient@fromaitobusiness.com [--apply]
// Without --apply it only lists what it would delete.

const EMAIL_FIELDS = ["email", "clientEmail", "contactEmail", "customerEmail", "buyerEmail", "signerEmail", "to", "recipient"];
const ARRAY_FIELDS = ["linkedEmails", "emails"];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function gsPaths(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (/^gs:\/\/[^/]+\/.+/.test(value)) out.add(value);
  } else if (Array.isArray(value)) {
    for (const v of value) gsPaths(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) gsPaths(v, out);
  }
}

async function main() {
  const email = normalizeEmail(arg("email") || process.env.REMOVE_EMAIL || "");
  const apply = process.argv.includes("--apply");
  if (!/^[^\s@]+\+test[^\s@]*@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`[remove-test-client] Refusing "${email}": only addresses like name+test...@domain can be removed.`);
    process.exit(1);
  }
  const db = getDb();
  console.log(`[remove-test-client] ${email} (${apply ? "apply" : "dry run"})`);

  const found = new Map<string, FirebaseFirestore.DocumentReference>();
  const files = new Set<string>();
  const collections = await db.listCollections();
  for (const col of collections) {
    const snaps: FirebaseFirestore.DocumentSnapshot[] = [];
    const byId = await col.doc(email).get();
    if (byId.exists) snaps.push(byId);
    for (const field of EMAIL_FIELDS) {
      const q = await col.where(field, "==", email).limit(200).get();
      snaps.push(...q.docs);
    }
    for (const field of ARRAY_FIELDS) {
      const q = await col.where(field, "array-contains", email).limit(200).get();
      snaps.push(...q.docs);
    }
    for (const s of snaps) {
      if (found.has(s.ref.path)) continue;
      found.set(s.ref.path, s.ref);
      gsPaths(s.data(), files);
    }
  }

  if (found.size === 0) {
    console.log("  nothing found");
    return;
  }
  for (const path of [...found.keys()].sort()) console.log(`  doc  ${path}`);
  for (const f of [...files].sort()) console.log(`  file ${f}`);
  if (!apply) {
    console.log(`[remove-test-client] dry run: would delete ${found.size} docs and ${files.size} files`);
    return;
  }

  for (const ref of found.values()) await db.recursiveDelete(ref);
  if (files.size) {
    const { Storage } = await import("@google-cloud/storage");
    const storage = new Storage();
    for (const f of files) {
      const [, bucket, path] = /^gs:\/\/([^/]+)\/(.+)$/.exec(f)!;
      try {
        await storage.bucket(bucket!).file(path!).delete({ ignoreNotFound: true });
      } catch (e) {
        console.error(`  could not delete ${f}:`, e instanceof Error ? e.message : e);
      }
    }
  }
  console.log(`[remove-test-client] deleted ${found.size} docs and ${files.size} files`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
