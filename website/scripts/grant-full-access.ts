import { getDb } from "@/lib/firebase-admin";
import { ACCOUNTS, grantAccess, normalizeEmail, readAccount } from "@/lib/account/access";

// Gives one email permanent access to everything a signed-in person can see:
// the members-only courses (a "manual" grant with no expiry) and the private
// coaching area on /account (an active client_records doc).
//
// For David's own account and anyone else who should never lose access.
// The client record is marked internal and has no package, payment or
// sessions, so it adds nothing to payments due or revenue.
//
// Run via the "Grant full access" workflow, or locally:
//   npx tsx scripts/grant-full-access.ts --email hello@defiuniversity.xyz [--apply]
// Without --apply it only prints what it would change.

const ENDED_CLIENT_STATUSES = new Set(["cancelled", "subscription_cancelled", "refunded", "completed"]);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = normalizeEmail(arg("email") || process.env.GRANT_EMAIL || "");
  const apply = process.argv.includes("--apply");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("[grant-full-access] Pass --email someone@example.com");
    process.exit(1);
  }
  const name = arg("name") || "";
  const db = getDb();
  const clientRef = db.collection("client_records").doc(email);
  const [accountSnap, clientSnap] = await Promise.all([
    db.collection(ACCOUNTS).doc(email).get(),
    clientRef.get(),
  ]);
  const account = readAccount(email, accountSnap.data());
  const client = clientSnap.exists ? (clientSnap.data() as Record<string, unknown>) : null;
  console.log(`[grant-full-access] ${email} (${apply ? "apply" : "dry run"})`);
  console.log(`  grants now: ${JSON.stringify(account.grants)}`);
  console.log(`  client record now: ${client ? `status=${String(client.status || "")}` : "none"}`);

  const now = new Date().toISOString();
  const clientPatch: Record<string, unknown> = client
    ? ENDED_CLIENT_STATUSES.has(String(client.status || ""))
      ? { status: "active", fullAccess: true, updatedAt: now }
      : { fullAccess: true, updatedAt: now }
    : {
        email,
        name,
        packageId: "",
        packageName: "Private coaching (full access)",
        status: "active",
        internal: true,
        fullAccess: true,
        sessionsRemaining: 0,
        sessionsTotal: 0,
        paidAt: null,
        contractSignedAt: null,
        signedContractPdfUrl: null,
        createdAt: now,
        updatedAt: now,
      };
  console.log(`  membership: manual grant, never expires`);
  console.log(`  client record patch: ${JSON.stringify(clientPatch)}`);
  if (!apply) {
    console.log("[grant-full-access] Dry run, nothing written. Pass --apply to write.");
    return;
  }

  // Drop any dated manual grant first: grantAccess keeps the later expiry of
  // two dated grants, but never replaces a dated one with "no expiry".
  const ref = db.collection(ACCOUNTS).doc(email);
  if (account.grants.some((g) => g.source === "manual" && g.expiresAt)) {
    await ref.set({ grants: account.grants.filter((g) => g.source !== "manual") }, { merge: true });
  }
  await grantAccess(email, { source: "manual", expiresAt: null, note: "Full access (never expires)", name: name || undefined });
  await clientRef.set(clientPatch, { merge: true });

  const after = readAccount(email, (await ref.get()).data());
  const manual = after.grants.find((g) => g.source === "manual");
  if (!manual || manual.expiresAt) throw new Error("manual grant did not save without an expiry");
  console.log(`[grant-full-access] Done. Grants: ${JSON.stringify(after.grants)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
