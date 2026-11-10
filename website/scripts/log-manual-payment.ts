import { getDb } from "@/lib/firebase-admin";
import { getPackage } from "@/lib/coaching/packages";
import { logManualPayment } from "@/lib/coaching/manual-payments";
import { normalizeEmail } from "@/lib/account/access";

// Logs one hand-taken coaching payment (crypto, bank transfer, cash) the same
// way Admin > Contacts > Log payment does: client record, course access,
// pipeline card moved to won, payment schedule, timeline and agreement email.
//
// Run via the "Log a manual coaching payment" workflow, or locally:
//   npx tsx scripts/log-manual-payment.ts --email a@b.com --name "A B" \
//     --package build_launch --plan 2pay --amount 1250 --paid-at 2026-11-03 \
//     --installment 1 --reference "USDC tx 0x..." [--apply]
// Each flag can also come from PAY_<NAME> (PAY_PAID_AT for --paid-at).
// Without --apply it only prints what it would write.

function arg(name: string): string {
  const i = process.argv.indexOf(`--${name}`);
  const fromArgs = i >= 0 ? process.argv[i + 1] || "" : "";
  const env = process.env[`PAY_${name.toUpperCase().replace(/-/g, "_")}`] || "";
  return (fromArgs || env).trim();
}

async function main() {
  const apply = process.argv.includes("--apply");
  const email = normalizeEmail(arg("email"));
  const installment = arg("installment") || "1";
  const input = {
    email,
    name: arg("name"),
    packageId: arg("package"),
    planId: arg("plan") || "full",
    amountUsd: arg("amount"),
    paidAt: arg("paid-at"),
    installmentNumber: installment,
    reference: arg("reference"),
    note: arg("note") || "Logged from the manual payment workflow.",
    // Same inputs, same payment: a re-run never writes a second row.
    idempotencyKey: `workflow:${arg("package")}:${arg("paid-at")}:${installment}:${arg("amount")}`,
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("[log-manual-payment] Pass --email someone@example.com");
    process.exit(1);
  }
  const pkg = await getPackage(input.packageId);
  if (!pkg) {
    console.error(`[log-manual-payment] Unknown package "${input.packageId}"`);
    process.exit(1);
  }
  const plan = pkg.paymentPlans.find((p) => p.id === input.planId);
  if (!plan) {
    console.error(
      `[log-manual-payment] ${pkg.name} has no plan "${input.planId}" (plans: ${pkg.paymentPlans.map((p) => p.id).join(", ")})`
    );
    process.exit(1);
  }

  const db = getDb();
  const before = await db.collection("client_records").doc(email).get();
  const prev = before.data() || {};
  console.log(`[log-manual-payment] ${email} (${apply ? "apply" : "dry run"})`);
  console.log(
    `  client record now: ${before.exists ? `status=${String(prev.status || "")}, package=${String(prev.packageName || "")}` : "none"}`
  );
  console.log(
    `  package: ${pkg.name} (${pkg.id}), ${pkg.priceDisplay}, ${pkg.sessionCount} sessions over ${pkg.durationWeeks} weeks`
  );
  console.log(`  plan: ${plan.label}, ${plan.installments} x $${plan.perPayment}`);
  console.log(
    `  payment: $${input.amountUsd} on ${input.paidAt}, installment ${installment}, reference "${input.reference}"`
  );
  if (!apply) {
    console.log("[log-manual-payment] Dry run, nothing written. Pass --apply to write.");
    return;
  }

  const result = await logManualPayment(input, "manual-payment-workflow");
  if (!result.ok) {
    console.error(`[log-manual-payment] FAILED (${result.status}): ${result.error}`);
    process.exit(1);
  }
  console.log(`[log-manual-payment] Done: ${JSON.stringify(result)}`);
  const after = (await db.collection("client_records").doc(email).get()).data() || {};
  console.log(
    `  client record: status=${String(after.status)}, package=${String(after.packageName)}, sessions ${String(after.sessionsRemaining)}/${String(after.sessionsTotal)}`
  );
  if (result.emailWarning) {
    console.log(`::warning::Agreement email not sent: ${result.emailWarning}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
