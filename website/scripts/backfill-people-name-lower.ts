/**
 * Manual backfill of `nameLower` on `leads` and `members`.
 *
 * People name prefix search uses this field. New captures write it automatically.
 * Older documents will not appear in name search until this script is applied.
 * Email prefix search does not need this field (document IDs are lowercase emails).
 *
 * DO NOT run from CI, Depot, Cloud Run, or any automatic deploy.
 * Atlas / an operator runs it against a chosen project after reviewing --dry-run.
 *
 * Usage (from website/):
 *   npx tsx scripts/backfill-people-name-lower.ts --dry-run
 *   npx tsx scripts/backfill-people-name-lower.ts --apply
 *
 * Requires Application Default Credentials or GOOGLE_SERVICE_ACCOUNT_KEY
 * and GCP_PROJECT_ID (defaults to defi-university-prod).
 */
import { getDb } from "../lib/firebase-admin";
import { personNameLower } from "../lib/crm/people-search";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const APPLY = process.argv.includes("--apply");
const PAGE = 400;

async function backfillCollection(name: "leads" | "members"): Promise<{
  scanned: number;
  wouldWrite: number;
  wrote: number;
}> {
  const db = getDb();
  let scanned = 0;
  let wouldWrite = 0;
  let wrote = 0;
  let last: QueryDocumentSnapshot | undefined;

  for (;;) {
    let q = db.collection(name).orderBy("__name__").limit(PAGE);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    const batch = db.batch();
    let batchWrites = 0;
    for (const doc of snap.docs) {
      scanned += 1;
      const data = doc.data();
      const next = personNameLower(
        data.nameLower as string | undefined,
        data.firstName as string | undefined,
        data.name as string | undefined
      );
      const current = typeof data.nameLower === "string" ? data.nameLower : "";
      if (!next || current === next) continue;
      wouldWrite += 1;
      if (APPLY) {
        batch.set(doc.ref, { nameLower: next }, { merge: true });
        batchWrites += 1;
      }
    }
    if (APPLY && batchWrites > 0) {
      await batch.commit();
      wrote += batchWrites;
    }
    last = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE) break;
  }

  return { scanned, wouldWrite, wrote };
}

async function main() {
  if (!APPLY) {
    console.log("dry-run: pass --apply to write nameLower");
  }
  const leads = await backfillCollection("leads");
  const members = await backfillCollection("members");
  console.log(JSON.stringify({ apply: APPLY, leads, members }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
