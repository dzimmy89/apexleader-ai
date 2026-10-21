import { getDb } from "@/lib/firebase-admin";
import { grantIsLive, type AccessState } from "@/lib/account/access";
import { getSkoolRecord, isManagedSeat } from "@/lib/account/skool-access";
import {
  addMonthsToDate,
  asPaymentPlanId,
  getSchedule,
  listClientPayments,
  nextUnpaidInstallment,
  planInstallmentCount,
  type PaymentMethod,
  type PaymentPlanId,
} from "@/lib/coaching/payments";

/**
 * "Your plans and billing" on /account: every way this person is connected
 * to DeFi University, read across their linked emails. Read-only; the only
 * action is the Stripe customer portal (lib/account/stripe-portal.ts).
 */
export interface SkoolPlan {
  /** A live "skool" grant: they pay for the membership on Skool. */
  paying: boolean;
  lastSeenAt: string | null;
  /** A Skool seat that comes with coaching and ends with it. */
  coachingSeat: { endsAt: string; status: "to_add" | "invited" | "in_skool" } | null;
}

export interface CoachingPayment {
  paidAt: string;
  /** USD cents. */
  amount: number;
  method: PaymentMethod;
  installmentNumber: number | null;
}

export interface CoachingPlan {
  email: string;
  packageId: string;
  packageName: string;
  status: string;
  statusLabel: string;
  sessionsRemaining: number;
  sessionsTotal: number;
  /** When coaching and the course access that comes with it end. */
  accessEndsAt: string | null;
  planId: PaymentPlanId;
  installments: number;
  installmentsPaid: number;
  method: PaymentMethod | null;
  /** Next installment: exact for crypto schedules, estimated for card plans. */
  nextDue: { amount: number | null; dueDate: string; estimated: boolean } | null;
  lastPaymentFailed: boolean;
  payments: CoachingPayment[];
  /** A Stripe customer exists, so the card and invoice portal can open. */
  hasStripeCustomer: boolean;
  /** Granted by the coach (Grant full access), not bought. */
  fullAccess: boolean;
}

export interface BillingSummary {
  skool: SkoolPlan | null;
  coaching: CoachingPlan | null;
  /** Manual grant from the coach: null expiry means it never ends. */
  manual: { endsAt: string | null } | null;
}

export function coachingStatusLabel(status: string): string {
  switch (status) {
    case "paid_pending_contract":
      return "Paid, agreement to sign";
    case "onboarded":
    case "active":
    case "paid":
      return "Active";
    case "completed":
      return "Completed";
    case "subscription_cancelled":
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return status ? status.replace(/_/g, " ") : "Active";
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

async function loadCoaching(access: AccessState): Promise<CoachingPlan | null> {
  const email = access.clientEmail;
  if (!email) return null;
  const db = getDb();
  const snap = await db.collection("client_records").doc(email).get();
  const record = (snap.data() || {}) as Record<string, unknown>;
  const packageId = str(record.packageId);
  const planId = asPaymentPlanId(record.planId);
  const [payments, schedule] = await Promise.all([
    listClientPayments(db, email).catch(() => []),
    packageId ? getSchedule(db, email, packageId).catch(() => null) : Promise.resolve(null),
  ]);
  const forPackage = payments.filter((p) => !packageId || p.packageId === packageId);
  const installments = planInstallmentCount(planId);
  const method: PaymentMethod | null =
    forPackage[0]?.method || (str(record.paymentSource) === "crypto" ? "crypto" : record.stripeCustomerId ? "stripe" : null);

  let installmentsPaid = Math.min(installments, forPackage.length);
  let nextDue: CoachingPlan["nextDue"] = null;
  if (schedule) {
    installmentsPaid = schedule.installments.filter((i) => i.paidAt).length;
    const next = nextUnpaidInstallment(schedule);
    if (next) nextDue = { amount: next.amount, dueDate: next.dueDate, estimated: false };
  } else if (installments > 1 && installmentsPaid > 0 && installmentsPaid < installments) {
    // Stripe bills card plans monthly from the first charge.
    const first = forPackage.map((p) => p.paidAt).filter(Boolean).sort()[0];
    if (first) {
      nextDue = {
        amount: forPackage[0]?.amount ?? null,
        dueDate: addMonthsToDate(first.slice(0, 10), installmentsPaid),
        estimated: true,
      };
    }
  }

  const coachingGrant = access.grants
    .filter((g) => g.source === "coaching")
    .map((g) => g.expiresAt)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  const status = str(record.status);
  return {
    email,
    packageId,
    packageName: str(record.packageName) || (record.fullAccess ? "Full access" : "Private coaching"),
    status,
    statusLabel: coachingStatusLabel(status),
    sessionsRemaining: Number(record.sessionsRemaining || 0),
    sessionsTotal: Number(record.sessionsTotal || 0),
    accessEndsAt: coachingGrant || null,
    planId,
    installments,
    installmentsPaid,
    method,
    nextDue,
    lastPaymentFailed: str(record.lastPaymentStatus) === "failed",
    payments: forPackage.slice(0, 12).map((p) => ({
      paidAt: p.paidAt,
      amount: p.amount,
      method: p.method,
      installmentNumber: p.installmentNumber,
    })),
    hasStripeCustomer: !!str(record.stripeCustomerId) || forPackage.some((p) => p.method === "stripe"),
    fullAccess: record.fullAccess === true,
  };
}

async function loadSkool(access: AccessState, now: number): Promise<SkoolPlan | null> {
  const paying = access.grants.some((g) => g.source === "skool" && grantIsLive(g, now));
  const seats = await Promise.all(access.emails.map((e) => getSkoolRecord(e).catch(() => null)));
  const seat = seats.find((r) => isManagedSeat(r) && Date.parse(r!.endsAt) > now) || null;
  if (!paying && !seat) return null;
  return {
    paying,
    lastSeenAt: access.skoolLastSeenAt,
    coachingSeat: seat ? { endsAt: seat.endsAt, status: seat.status as "to_add" | "invited" | "in_skool" } : null,
  };
}

export async function getBillingSummary(access: AccessState, now = Date.now()): Promise<BillingSummary> {
  const [coaching, skool] = await Promise.all([loadCoaching(access), loadSkool(access, now)]);
  const manualGrants = access.grants.filter((g) => g.source === "manual" && grantIsLive(g, now));
  const manual = manualGrants.length
    ? { endsAt: manualGrants.some((g) => !g.expiresAt) ? null : manualGrants.map((g) => g.expiresAt!).sort().at(-1)! }
    : null;
  return { skool, coaching, manual };
}
