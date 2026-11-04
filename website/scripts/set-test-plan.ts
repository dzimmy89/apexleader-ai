import { getDb } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/account/access";
import { BRAND } from "@/lib/brand";
import { getPackage } from "@/lib/coaching/packages";

// Puts the coach's own address (or a +test address) on a coaching package as
// a brand-new client would be right after paying: agreement not signed yet,
// every session left, no full-access shortcut. So /account and Mission Control
// show exactly what a client sees, and the agreement can be signed for real.
//
// The record is marked internal + testAccount and gets no payment or payment
// schedule, so it adds nothing to revenue or payments due. Course access
// (learn_accounts) is not touched. Run "Grant full access" to undo.
//
// Run via the "Set a test coaching plan" workflow, or locally:
//   npx tsx scripts/set-test-plan.ts --email hello@fromaitobusiness.com --package mastery [--apply]

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = normalizeEmail(arg("email") || process.env.TEST_EMAIL || "");
  const packageId = arg("package") || process.env.TEST_PACKAGE || "mastery";
  const apply = process.argv.includes("--apply");
  const allowed = email === normalizeEmail(BRAND.email) || /^[^\s@]+\+test[^\s@]*@[^\s@]+$/.test(email);
  if (!allowed) {
    console.error(`[set-test-plan] Refusing "${email}": only ${BRAND.email} or name+test...@domain addresses.`);
    process.exit(1);
  }
  const pkg = await getPackage(packageId);
  if (!pkg) {
    console.error(`[set-test-plan] Unknown package "${packageId}"`);
    process.exit(1);
  }

  const db = getDb();
  const ref = db.collection("client_records").doc(email);
  const snap = await ref.get();
  const existing = (snap.data() || {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    email,
    name: typeof existing.name === "string" && existing.name ? existing.name : BRAND.coachFirstName,
    packageId: pkg.id,
    packageName: pkg.name,
    planId: "full",
    status: "paid_pending_contract",
    internal: true,
    testAccount: true,
    fullAccess: false,
    sessionsTotal: pkg.sessionCount,
    sessionsRemaining: pkg.sessionCount,
    paidAt: now,
    contractSentAt: null,
    pendingSignatureId: null,
    contractSignedAt: null,
    signatureId: null,
    signedContractPdfUrl: null,
    createdAt: existing.createdAt || now,
    updatedAt: now,
  };
  console.log(`[set-test-plan] ${email} -> ${pkg.name} (${pkg.id}), ${pkg.sessionCount} sessions (${apply ? "apply" : "dry run"})`);
  console.log(`  record now: ${snap.exists ? `status=${String(existing.status || "")} package=${String(existing.packageId || "") || "none"} fullAccess=${String(existing.fullAccess === true)}` : "none"}`);
  console.log(`  patch: ${JSON.stringify(patch)}`);
  if (!apply) {
    console.log("[set-test-plan] Dry run, nothing written. Pass --apply to write.");
    return;
  }
  await ref.set(patch, { merge: true });
  console.log("[set-test-plan] Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
