import { getDb } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/crm/activity-log";

/**
 * Coaching payment ledger.
 *
 * client_payments/{paymentId}: one row per money movement (a Stripe checkout,
 * a paid Stripe invoice, or a payment the coach logs by hand, such as a bank
 * transfer). Doc ids are derived from the Stripe invoice/session id or the
 * admin's idempotency key, so a replay never writes a second row.
 *
 * payment_schedules/{email}__{packageId}: manual installment plans only.
 * Stripe bills its own installments, so Stripe plans have no schedule here.
 */
export const CLIENT_PAYMENTS = "client_payments";
export const PAYMENT_SCHEDULES = "payment_schedules";
export const PAYMENT_TIMEZONE = "America/New_York";

/** "manual": logged by the coach (bank transfer, wire, cash, an outside invoice). */
export type PaymentMethod = "stripe" | "manual";
export type PaymentPlanId = "full" | "3pay" | "6pay";

export function asPaymentPlanId(value: unknown): PaymentPlanId {
  return value === "3pay" || value === "6pay" ? value : "full";
}

export function planInstallmentCount(planId: PaymentPlanId): number {
  switch (planId) {
    case "3pay":
      return 3;
    case "6pay":
      return 6;
    case "full":
      return 1;
    default: {
      const exhaustive: never = planId;
      return exhaustive;
    }
  }
}

export interface ClientPaymentRow {
  email: string;
  method: PaymentMethod;
  /** USD cents. */
  amount: number;
  currency: "usd";
  paidAt: string;
  packageId: string;
  planId: PaymentPlanId;
  installmentNumber: number | null;
  stripeInvoiceId: string | null;
  stripeSessionId: string | null;
  stripeSubscriptionId: string | null;
  /** Bank reference, invoice number or similar, for manual payments. */
  reference: string | null;
  note: string;
  source: "stripe_webhook" | "admin_log";
  actor: string | null;
  createdAt: string;
}

export interface ScheduleInstallment {
  number: number;
  /** USD cents. */
  amount: number;
  /** Calendar date in America/New_York, YYYY-MM-DD. */
  dueDate: string;
  paidAt: string | null;
  paymentId: string | null;
}

export interface PaymentSchedule {
  email: string;
  name: string;
  packageId: string;
  packageName: string;
  planId: PaymentPlanId;
  method: "manual";
  startDate: string;
  installments: ScheduleInstallment[];
  createdAt: string;
  updatedAt: string;
}

export type DueStatus = "overdue" | "due_soon" | "upcoming";

export interface PaymentDueItem {
  scheduleId: string;
  email: string;
  name: string;
  packageId: string;
  packageName: string;
  planId: PaymentPlanId;
  installmentNumber: number;
  installments: number;
  amount: number;
  dueDate: string;
  status: DueStatus;
  /** Positive when overdue, negative when due in the future. */
  daysLate: number;
}

export function normalizePaymentEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function scheduleDocId(email: string, packageId: string): string {
  return `${normalizePaymentEmail(email)}__${packageId}`;
}

export function stripePaymentDocId(args: {
  invoiceId?: string | null;
  sessionId?: string | null;
}): string | null {
  if (args.invoiceId) return `stripe_inv_${args.invoiceId}`;
  if (args.sessionId) return `stripe_cs_${args.sessionId}`;
  return null;
}

/** YYYY-MM-DD for an instant, in America/New_York. */
export function dateInTimezone(at: Date, timeZone = PAYMENT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Hour of day 0-23 in America/New_York. */
export function hourInTimezone(at: Date, timeZone = PAYMENT_TIMEZONE): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(at);
  return Number(hour) % 24;
}

function parseYmd(ymd: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Add whole months to a YYYY-MM-DD date. The day clamps to the last day of
 * the target month, so Jan 31 + 1 month is Feb 28 (or 29).
 */
export function addMonthsToDate(ymd: string, months: number): string {
  const parsed = parseYmd(ymd);
  if (!parsed) throw new Error(`Invalid date: ${ymd}`);
  const zeroBased = parsed.m - 1 + months;
  const year = parsed.y + Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(parsed.d, lastDay);
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** Whole days from a to b (b - a) for YYYY-MM-DD dates. */
export function daysBetween(a: string, b: string): number {
  const pa = parseYmd(a);
  const pb = parseYmd(b);
  if (!pa || !pb) return 0;
  const ta = Date.UTC(pa.y, pa.m - 1, pa.d);
  const tb = Date.UTC(pb.y, pb.m - 1, pb.d);
  return Math.round((tb - ta) / 86400000);
}

export function buildInstallmentSchedule(args: {
  email: string;
  name?: string;
  packageId: string;
  packageName?: string;
  planId: PaymentPlanId;
  installments: number;
  /** USD cents per installment. */
  perPayment: number;
  /** YYYY-MM-DD of installment 1. */
  startDate: string;
  nowIso?: string;
}): PaymentSchedule {
  const now = args.nowIso || new Date().toISOString();
  const count = Math.max(1, Math.floor(args.installments));
  const installments: ScheduleInstallment[] = [];
  for (let i = 0; i < count; i += 1) {
    installments.push({
      number: i + 1,
      amount: args.perPayment,
      dueDate: addMonthsToDate(args.startDate, i),
      paidAt: null,
      paymentId: null,
    });
  }
  return {
    email: normalizePaymentEmail(args.email),
    name: args.name || "",
    packageId: args.packageId,
    packageName: args.packageName || "",
    planId: args.planId,
    method: "manual",
    startDate: args.startDate,
    installments,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Mark one installment paid. A payment id already on the schedule is a
 * replay and changes nothing. When the requested installment is already
 * paid (or none is given), the first unpaid installment is marked.
 */
export function markInstallmentPaid(
  schedule: PaymentSchedule,
  args: { installmentNumber?: number | null; paidAt: string; paymentId: string; nowIso?: string }
): { schedule: PaymentSchedule; marked: number | null; replay: boolean } {
  const existing = schedule.installments.find((i) => i.paymentId === args.paymentId);
  if (existing) {
    return { schedule, marked: existing.number, replay: true };
  }
  const requested =
    typeof args.installmentNumber === "number"
      ? schedule.installments.find(
          (i) => i.number === args.installmentNumber && !i.paidAt
        )
      : undefined;
  const target = requested || schedule.installments.find((i) => !i.paidAt);
  if (!target) {
    return { schedule, marked: null, replay: false };
  }
  const installments = schedule.installments.map((i) =>
    i.number === target.number
      ? { ...i, paidAt: args.paidAt, paymentId: args.paymentId }
      : i
  );
  return {
    schedule: {
      ...schedule,
      installments,
      updatedAt: args.nowIso || new Date().toISOString(),
    },
    marked: target.number,
    replay: false,
  };
}

export function nextUnpaidInstallment(
  schedule: Pick<PaymentSchedule, "installments">
): ScheduleInstallment | null {
  return schedule.installments.find((i) => !i.paidAt) || null;
}

/** Unpaid installments that are overdue or due within `windowDays`. */
export function scheduleDueItems(
  schedules: Array<{ id: string; schedule: PaymentSchedule }>,
  today: string,
  windowDays = 7
): PaymentDueItem[] {
  const items: PaymentDueItem[] = [];
  for (const { id, schedule } of schedules) {
    for (const inst of schedule.installments) {
      if (inst.paidAt) continue;
      const daysUntil = daysBetween(today, inst.dueDate);
      if (daysUntil > windowDays) continue;
      items.push({
        scheduleId: id,
        email: schedule.email,
        name: schedule.name,
        packageId: schedule.packageId,
        packageName: schedule.packageName,
        planId: schedule.planId,
        installmentNumber: inst.number,
        installments: schedule.installments.length,
        amount: inst.amount,
        dueDate: inst.dueDate,
        status: daysUntil < 0 ? "overdue" : "due_soon",
        daysLate: -daysUntil,
      });
    }
  }
  return items.sort((a, b) =>
    a.dueDate === b.dueDate ? a.email.localeCompare(b.email) : a.dueDate < b.dueDate ? -1 : 1
  );
}

/**
 * The next unpaid installment of each plan that is further out than the due
 * window, so a plan with nothing due this week still shows when it is next due.
 */
export function scheduleUpcomingItems(
  schedules: Array<{ id: string; schedule: PaymentSchedule }>,
  today: string,
  windowDays = 7
): PaymentDueItem[] {
  const items: PaymentDueItem[] = [];
  for (const { id, schedule } of schedules) {
    const next = nextUnpaidInstallment(schedule);
    if (!next) continue;
    const daysUntil = daysBetween(today, next.dueDate);
    if (daysUntil <= windowDays) continue;
    items.push({
      scheduleId: id,
      email: schedule.email,
      name: schedule.name,
      packageId: schedule.packageId,
      packageName: schedule.packageName,
      planId: schedule.planId,
      installmentNumber: next.number,
      installments: schedule.installments.length,
      amount: next.amount,
      dueDate: next.dueDate,
      status: "upcoming",
      daysLate: -daysUntil,
    });
  }
  return items.sort((a, b) =>
    a.dueDate === b.dueDate ? a.email.localeCompare(b.email) : a.dueDate < b.dueDate ? -1 : 1
  );
}

export interface ContactMoneySummary {
  packageId: string | null;
  planId: PaymentPlanId | null;
  /** USD cents. */
  paid: number;
  /** USD cents. Plan total for the current package, or null when unknown. */
  total: number | null;
  /** USD cents. */
  owed: number;
  nextDue: { dueDate: string; amount: number; source: "schedule" | "stripe_estimate" } | null;
}

/**
 * Paid, owed, and next due for one contact's current package. Stripe
 * installments have no schedule, so their next date is estimated one month
 * after the latest Stripe payment.
 */
export function summarizeContactPayments(args: {
  payments: Array<Pick<ClientPaymentRow, "amount" | "packageId" | "method" | "paidAt">>;
  packageId: string | null;
  planId: PaymentPlanId | null;
  /** USD cents for the whole plan. */
  planTotal: number | null;
  perPayment: number | null;
  schedule: Pick<PaymentSchedule, "installments"> | null;
}): ContactMoneySummary {
  const forPackage = args.packageId
    ? args.payments.filter((p) => p.packageId === args.packageId)
    : args.payments;
  const paid = forPackage.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const total = args.planTotal;
  const owed = total != null ? Math.max(0, total - paid) : 0;
  let nextDue: ContactMoneySummary["nextDue"] = null;
  const next = args.schedule ? nextUnpaidInstallment(args.schedule) : null;
  if (next) {
    nextDue = { dueDate: next.dueDate, amount: next.amount, source: "schedule" };
  } else if (owed > 0) {
    const lastStripe = forPackage
      .filter((p) => p.method === "stripe" && p.paidAt)
      .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1))[0];
    if (lastStripe) {
      nextDue = {
        dueDate: addMonthsToDate(dateInTimezone(new Date(lastStripe.paidAt)), 1),
        amount: Math.min(args.perPayment ?? owed, owed),
        source: "stripe_estimate",
      };
    }
  }
  return {
    packageId: args.packageId,
    planId: args.planId,
    paid,
    total,
    owed,
    nextDue,
  };
}

export function formatUsdCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

type Db = ReturnType<typeof getDb>;

/** Write a payment row once. Returns false when the id already exists. */
export async function recordClientPayment(
  db: Db,
  paymentId: string,
  row: ClientPaymentRow
): Promise<{ created: boolean; row: ClientPaymentRow }> {
  const ref = db.collection(CLIENT_PAYMENTS).doc(paymentId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      return { created: false, row: snap.data() as ClientPaymentRow };
    }
    tx.set(ref, row);
    return { created: true, row };
  });
}

export async function listClientPayments(
  db: Db,
  email: string
): Promise<Array<ClientPaymentRow & { id: string }>> {
  const snap = await db
    .collection(CLIENT_PAYMENTS)
    .where("email", "==", normalizePaymentEmail(email))
    .limit(200)
    .get();
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as ClientPaymentRow),
  }));
  return rows.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
}

/** Earliest recorded payment date for one package, or null. */
export async function firstPaymentAt(
  db: Db,
  email: string,
  packageId: string
): Promise<string | null> {
  const rows = await listClientPayments(db, email);
  const dates = rows
    .filter((r) => r.packageId === packageId && r.paidAt)
    .map((r) => r.paidAt)
    .sort();
  return dates[0] || null;
}

export function readSchedule(data: Record<string, unknown> | undefined): PaymentSchedule | null {
  if (!data || !Array.isArray(data.installments)) return null;
  const installments = (data.installments as Record<string, unknown>[]).map((i, index) => ({
    number: Number(i.number) || index + 1,
    amount: Number(i.amount) || 0,
    dueDate: String(i.dueDate || ""),
    paidAt: typeof i.paidAt === "string" && i.paidAt ? i.paidAt : null,
    paymentId: typeof i.paymentId === "string" && i.paymentId ? i.paymentId : null,
  }));
  return {
    email: String(data.email || ""),
    name: String(data.name || ""),
    packageId: String(data.packageId || ""),
    packageName: String(data.packageName || ""),
    planId: asPaymentPlanId(data.planId),
    method: "manual",
    startDate: String(data.startDate || installments[0]?.dueDate || ""),
    installments,
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  };
}

export async function getSchedule(
  db: Db,
  email: string,
  packageId: string
): Promise<PaymentSchedule | null> {
  const snap = await db.collection(PAYMENT_SCHEDULES).doc(scheduleDocId(email, packageId)).get();
  if (!snap.exists) return null;
  return readSchedule(snap.data() as Record<string, unknown>);
}

/**
 * Create the manual schedule on the first logged installment and mark the
 * matching installment paid. Full-pay plans have no schedule.
 */
export async function applyManualPaymentToSchedule(
  db: Db,
  args: {
    email: string;
    name?: string;
    packageId: string;
    packageName?: string;
    planId: PaymentPlanId;
    installments: number;
    /** USD cents. */
    perPayment: number;
    paidAt: string;
    paymentId: string;
    installmentNumber?: number | null;
  }
): Promise<{ marked: number | null; replay: boolean } | null> {
  if (args.installments <= 1) return null;
  const ref = db.collection(PAYMENT_SCHEDULES).doc(scheduleDocId(args.email, args.packageId));
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const nowIso = new Date().toISOString();
    let schedule = snap.exists ? readSchedule(snap.data() as Record<string, unknown>) : null;
    if (!schedule) {
      // Installment 1 is the first payment date. When a later installment is
      // the first one logged, count back so the dates still line up.
      const paidDate = dateInTimezone(new Date(args.paidAt));
      const offset = Math.max(0, (args.installmentNumber || 1) - 1);
      schedule = buildInstallmentSchedule({
        email: args.email,
        name: args.name,
        packageId: args.packageId,
        packageName: args.packageName,
        planId: args.planId,
        installments: args.installments,
        perPayment: args.perPayment,
        startDate: addMonthsToDate(paidDate, -offset),
        nowIso,
      });
    }
    const result = markInstallmentPaid(schedule, {
      installmentNumber: args.installmentNumber,
      paidAt: args.paidAt,
      paymentId: args.paymentId,
      nowIso,
    });
    if (!result.replay) {
      tx.set(ref, {
        ...result.schedule,
        ...(args.name && !result.schedule.name ? { name: args.name } : {}),
      });
    }
    return { marked: result.marked, replay: result.replay };
  });
}

export async function listPaymentSchedules(
  db: Db
): Promise<Array<{ id: string; schedule: PaymentSchedule }>> {
  const snap = await db.collection(PAYMENT_SCHEDULES).limit(500).get();
  const rows: Array<{ id: string; schedule: PaymentSchedule }> = [];
  for (const doc of snap.docs) {
    const schedule = readSchedule(doc.data() as Record<string, unknown>);
    if (schedule) rows.push({ id: doc.id, schedule });
  }
  return rows;
}

export async function listPaymentsDue(
  db: Db,
  now = new Date(),
  windowDays = 7
): Promise<PaymentDueItem[]> {
  const schedules = await listPaymentSchedules(db);
  return scheduleDueItems(schedules, dateInTimezone(now), windowDays);
}

export async function listPaymentsUpcoming(
  db: Db,
  now = new Date(),
  windowDays = 7
): Promise<PaymentDueItem[]> {
  const schedules = await listPaymentSchedules(db);
  return scheduleUpcomingItems(schedules, dateInTimezone(now), windowDays);
}

/**
 * Rebuild one package's manual schedule from the manual payments already
 * logged, for a plan that was logged wrong (usually "Paid in full" when it
 * was an installment plan). Payments are applied oldest first; installment 1
 * is the date of the first payment. A full plan removes the schedule.
 */
export async function rebuildManualSchedule(
  db: Db,
  args: {
    email: string;
    name?: string;
    packageId: string;
    packageName?: string;
    planId: PaymentPlanId;
    installments: number;
    /** USD cents per installment. */
    perPayment: number;
  }
): Promise<{ schedule: PaymentSchedule | null; marked: number }> {
  const email = normalizePaymentEmail(args.email);
  const ref = db.collection(PAYMENT_SCHEDULES).doc(scheduleDocId(email, args.packageId));
  const rows = (await listClientPayments(db, email))
    .filter((r) => r.packageId === args.packageId && r.method === "manual" && r.paidAt)
    .sort((a, b) => (a.paidAt < b.paidAt ? -1 : a.paidAt > b.paidAt ? 1 : 0));
  const nowIso = new Date().toISOString();

  if (args.installments <= 1 || rows.length === 0) {
    await ref.delete();
    for (const row of rows) {
      await db
        .collection(CLIENT_PAYMENTS)
        .doc(row.id)
        .set({ planId: args.planId, installmentNumber: args.installments <= 1 ? 1 : null }, { merge: true });
    }
    await db
      .collection("client_records")
      .doc(email)
      .set({ planId: args.planId, manualPlanId: args.planId, updatedAt: nowIso }, { merge: true });
    return { schedule: null, marked: 0 };
  }

  let schedule = buildInstallmentSchedule({
    email,
    name: args.name,
    packageId: args.packageId,
    packageName: args.packageName,
    planId: args.planId,
    installments: args.installments,
    perPayment: args.perPayment,
    startDate: dateInTimezone(new Date(rows[0]!.paidAt)),
    nowIso,
  });
  let marked = 0;
  for (const row of rows) {
    const result = markInstallmentPaid(schedule, { paidAt: row.paidAt, paymentId: row.id, nowIso });
    schedule = result.schedule;
    if (result.marked != null) marked += 1;
    await db
      .collection(CLIENT_PAYMENTS)
      .doc(row.id)
      .set({ planId: args.planId, installmentNumber: result.marked }, { merge: true });
  }
  await ref.set(schedule);
  await db.collection("client_records").doc(email).set(
    {
      planId: args.planId,
      manualPlanId: args.planId,
      manualInstallments: args.installments,
      updatedAt: nowIso,
    },
    { merge: true }
  );
  return { schedule, marked };
}

/**
 * Move every open coaching_applications card for this email to won. When the
 * person has no card, create one so the client shows on the pipeline.
 */
export async function markPipelineWon(
  db: Db,
  args: {
    email: string;
    name?: string;
    packageId: string;
    /** Whole dollars, as the pipeline stores it. */
    closeValue?: number | null;
    source: "stripe" | "manual";
    note: string;
  }
): Promise<{ moved: string[]; created: string | null }> {
  const email = normalizePaymentEmail(args.email);
  const now = new Date().toISOString();
  const snap = await db
    .collection("coaching_applications")
    .where("email", "==", email)
    .limit(20)
    .get();
  const wonFields = {
    status: "won",
    packageId: args.packageId,
    ...(typeof args.closeValue === "number" && args.closeValue > 0
      ? { closeValue: args.closeValue }
      : {}),
    wonSource: args.source,
    wonNote: args.note,
    wonAt: now,
    updatedAt: now,
  };

  if (snap.empty) {
    const id = `paid_${email}`;
    await db
      .collection("coaching_applications")
      .doc(id)
      .set(
        {
          email,
          name: args.name || "",
          source: args.source === "stripe" ? "stripe_checkout" : "manual_payment",
          notes: args.note,
          createdAt: now,
          ...wonFields,
        },
        { merge: true }
      );
    await logActivity({
      email,
      type: "stage_change",
      title: "Added to pipeline as won",
      description: args.note,
      meta: { applicationId: id, to: "won", source: args.source },
    });
    return { moved: [], created: id };
  }

  const moved: string[] = [];
  for (const doc of snap.docs) {
    const data = (doc.data() || {}) as Record<string, unknown>;
    if (data.status === "won") continue;
    await db.collection("coaching_applications").doc(doc.id).set(wonFields, { merge: true });
    moved.push(doc.id);
    await logActivity({
      email,
      type: "stage_change",
      title: "Stage changed to won",
      description: args.note,
      meta: { applicationId: doc.id, from: data.status ?? null, to: "won", source: args.source },
    });
  }
  return { moved, created: null };
}
