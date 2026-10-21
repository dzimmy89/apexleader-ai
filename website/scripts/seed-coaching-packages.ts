import { getDb } from "@/lib/firebase-admin";
import { fallbackPackages } from "@/content/site-fallback";

// Seeds the coaching_packages Firestore collection from the fallback config.
// Idempotent: uses doc(id) with set + merge, so re-running only updates fields.
// Run via: npx tsx website/scripts/seed-coaching-packages.ts
async function main() {
  const db = getDb();
  const batch = db.batch();
  const now = new Date().toISOString();

  for (const pkg of fallbackPackages) {
    const ref = db.collection("coaching_packages").doc(pkg.id);
    batch.set(ref, { ...pkg, createdAt: now, updatedAt: now }, { merge: true });
  }

  await batch.commit();
  console.log(
    `Seeded ${fallbackPackages.length} coaching packages to Firestore (project: ${
      process.env.GCP_PROJECT_ID || "apexleader-prod"
    })`
  );
}

main().catch((e) => {
  console.error("[seed-coaching-packages] FAILED", e);
  process.exit(1);
});
