import { createHash } from "node:crypto";
import { getDb } from "@/lib/firebase-admin";
import { getPackage, paymentPlanAddsUp, type PackageId } from "@/lib/coaching/packages";
import { grantCoachingPurchase, persistPaidCheckoutMember } from "@/lib/coaching/stripe";
import { ensureCoachingAgreementEmail } from "@/lib/coaching/contract-email";
import { grantCoachingMembership } from "@/lib/account/access";
import { logActivity } from "@/lib/crm/activity-log";
import { isValidEmail } from "@/lib/html";
import {
  applyManualPaymentToSchedule,
  firstPaymentAt,
  formatUsdCents,
  markPipelineWon,
  recordClientPayment,
} from "@/lib/coaching/payments";

/**
 * Payments that do not go through Stripe (a bank transfer, a wire, an
 * outside invoice). The coach logs each one on the contact page; installment
 * plans get a schedule so Payments due and the morning email can track them.
 */
const PACKAGE_IDS: PackageId[] = ["foundations", "mastery", "institutional"];

function isPackageId(id: string): id is PackageId {
  return PACKAGE_IDS.some((known) => known === id);
}

export interface LogManualPaymentInput {
  email: unknown;
  name?: unknown;
  amountUsd: unknown;
  /** Bank reference, invoice number or similar. Optional. */
  reference?: unknown;
  /** YYYY-MM-DD (America/New_York) or an ISO timestamp. */
  paidAt: unknown;
  packageId: unknown;
  planId: unknown;
  installmentNumber?: unknown;
  note?: unknown;
  /** One per payment, so a double submit writes one row. */
  idempotencyKey?: unknown;
}

export type LogManualPaymentResult =
  | {
      ok: true;
      paymentId: string;
      created: boolean;
      installmentNumber: number | null;
      granted: "granted" | "replay";
      emailWarning?: string;
    }
  | { ok: false; status: number; error: string };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Noon UTC on a YYYY-MM-DD date keeps it on the same calendar day in New York. */
function paidAtFromInput(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const iso = `${raw}T16:00:00.000Z`;
    return Number.isNaN(Date.parse(iso)) ? null : iso;
  }
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

export function manualPaymentDocId(email: string, idempotencyKey: string): string {
  return `manual_${createHash("sha256").update(`${email}\0${idempotencyKey}`).digest("hex").slice(0, 40)}`;
}

/**
 * The coach logs a payment by hand. The first payment for a package grants
 * it (grantKey manual:{email}:{packageId}), so a second log never grants twice.
 */
export async function logManualPayment(
  input: LogManualPaymentInput,
  actor: string
): Promise<LogManualPaymentResult> {
  const email = str(input.email).toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, error: "Invalid email" };
  }
  const packageId = str(input.packageId);
  if (!isPackageId(packageId)) {
    return { ok: false, status: 400, error: "Unknown package" };
  }
  const pkg = await getPackage(packageId);
  if (!pkg) {
    return { ok: false, status: 400, error: "Unknown package" };
  }
  const planRaw = str(input.planId);
  if (planRaw !== "full" && planRaw !== "3pay" && planRaw !== "6pay") {
    return { ok: false, status: 400, error: "Unknown payment plan" };
  }
  const plan = pkg.paymentPlans.find((p) => p.id === planRaw);
  if (!plan || !paymentPlanAddsUp(plan)) {
    return { ok: false, status: 400, error: "Unknown payment plan" };
  }
  const amountUsd = typeof input.amountUsd === "number" ? input.amountUsd : Number(str(input.amountUsd));
  if (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 100000) {
    return { ok: false, status: 400, error: "Amount must be a positive number of dollars" };
  }
  const paidAt = paidAtFromInput(str(input.paidAt));
  if (!paidAt) {
    return { ok: false, status: 400, error: "Date paid is required" };
  }
  if (Date.parse(paidAt) > Date.now() + 36 * 60 * 60 * 1000) {
    return { ok: false, status: 400, error: "Date paid is in the future" };
  }
  let installmentNumber: number | null = null;
  const installmentRaw = input.installmentNumber;
  if (installmentRaw !== undefined && installmentRaw !== null && installmentRaw !== "") {
    const n = typeof installmentRaw === "number" ? installmentRaw : Number(str(installmentRaw));
    if (!Number.isInteger(n) || n < 1 || n > plan.installments) {
      return {
        ok: false,
        status: 400,
        error: `Installment must be between 1 and ${plan.installments}`,
      };
    }
    installmentNumber = n;
  }
  if (plan.installments === 1) installmentNumber = 1;
  const idempotencyKey = str(input.idempotencyKey);
  if (!idempotencyKey) {
    return { ok: false, status: 400, error: "idempotencyKey is required" };
  }
  const paymentId = manualPaymentDocId(email, idempotencyKey);
  const name = str(input.name).slice(0, 120);
  const note = str(input.note).slice(0, 500) || "Logged by admin.";
  const reference = str(input.reference).slice(0, 120);
  const amount = Math.round(amountUsd * 100);

  const db = getDb();
  const granted = await grantCoachingPurchase(db, {
    email,
    clientName: name || undefined,
    packageId,
    packageName: pkg.name,
    planId: plan.id,
    grantKey: `manual:${email}:${packageId}`,
    amountPaid: amount,
    paymentSource: "manual",
  });
  await persistPaidCheckoutMember(db, {
    email,
    clientName: name || undefined,
    packageId,
    planId: plan.id,
  });

  const nowIso = new Date().toISOString();
  const { created, row } = await recordClientPayment(db, paymentId, {
    email,
    method: "manual",
    amount,
    currency: "usd",
    paidAt,
    packageId,
    planId: plan.id,
    installmentNumber,
    stripeInvoiceId: null,
    stripeSessionId: null,
    stripeSubscriptionId: null,
    reference: reference || null,
    note,
    source: "admin_log",
    actor,
    createdAt: nowIso,
  });

  const scheduled = await applyManualPaymentToSchedule(db, {
    email,
    name,
    packageId,
    packageName: pkg.name,
    planId: plan.id,
    installments: plan.installments,
    perPayment: plan.perPayment * 100,
    paidAt: row.paidAt,
    paymentId,
    installmentNumber: row.installmentNumber ?? installmentNumber,
  });
  const marked =
    scheduled?.marked ?? row.installmentNumber ?? (plan.installments <= 1 ? 1 : null);
  if (created && marked !== row.installmentNumber) {
    await db.collection("client_payments").doc(paymentId).set({ installmentNumber: marked }, { merge: true });
  }

  const firstAt = await firstPaymentAt(db, email, packageId);
  await grantCoachingMembership(email, packageId, {
    name: name || undefined,
    from: new Date(firstAt || row.paidAt),
  });
  await markPipelineWon(db, {
    email,
    name,
    packageId,
    closeValue: plan.total ?? pkg.price ?? null,
    source: "manual",
    note,
  });
  if (created) {
    await logActivity({
      email,
      type: "payment",
      title: `Payment ${formatUsdCents(amount)}`,
      description: [
        pkg.name || packageId,
        plan.installments > 1 && marked
          ? `installment ${marked} of ${plan.installments}`
          : plan.installments > 1
            ? "installment"
            : "paid in full",
        reference,
        note,
      ]
        .filter(Boolean)
        .join(" · "),
      meta: { paymentId, method: "manual", amount, actor },
    });
  }

  const mailed = await ensureCoachingAgreementEmail({
    email,
    name: name || email,
    packageId,
    planId: plan.id,
    grantKey: `manual-agreement:${email}:${packageId}`,
  });

  return {
    ok: true,
    paymentId,
    created,
    installmentNumber: marked,
    granted,
    ...(mailed.ok ? {} : { emailWarning: mailed.error || "Agreement email was not sent" }),
  };
}
