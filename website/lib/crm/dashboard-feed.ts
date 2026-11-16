import { BRAND } from "@/lib/brand";
import { isExcludedCrmEmail } from "@/lib/crm/excluded-accounts";
import { FUNNEL_STEPS, type FunnelStep } from "@/lib/funnel/events";

/**
 * Pure adders for the all-business dashboard feed (schema version 2).
 * Every function here takes plain rows and returns counts, sums in US dollars
 * or fixed labels (a lesson slug, a package id, a cleaned campaign label).
 * Nothing that names a person (name, email, phone, X handle, document id)
 * may appear in what these return: scripts/test-dashboard-feed.ts checks it.
 */

export const FEED_SCHEMA_VERSION = 2;

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

type Row = Record<string, unknown>;

/** Owner and test logins that must never be counted as leads, clients or revenue. */
export function isDashboardTestEmail(raw: unknown): boolean {
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!email) return false;
  if (email === BRAND.email.toLowerCase()) return true;
  if (/^[^\s@]+\+test[^\s@]*@/.test(email)) return true;
  return isExcludedCrmEmail(email);
}

/** ISO strings and Firestore Timestamps both appear in older documents. */
export function toMs(value: unknown): number | null {
  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : t;
  }
  if (value && typeof value === "object") {
    const v = value as { toMillis?: () => number; toDate?: () => Date };
    if (typeof v.toMillis === "function") return v.toMillis();
    if (typeof v.toDate === "function") return v.toDate().getTime();
  }
  return null;
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function usd(cents: number): number {
  return Math.round(cents) / 100;
}

/** Lowercase, safe characters only, never anything that looks like a handle or an email. */
export function safeLabel(raw: unknown, fallback = "other"): string {
  const text = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!text || text.includes("@")) return fallback;
  const cleaned = text.replace(/[^a-z0-9/_.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return cleaned || fallback;
}

/** YYYY-MM-DD in a time zone (bookings and installments use New York dates). */
export function dateIn(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(ms)
  );
}

// ---------------------------------------------------------------- funnel

export type StepTotals = Record<FunnelStep, number>;

function emptySteps(): StepTotals {
  return Object.fromEntries(FUNNEL_STEPS.map((s) => [s, 0])) as StepTotals;
}

function addSteps(into: StepTotals, counts: unknown) {
  if (!counts || typeof counts !== "object") return;
  for (const step of FUNNEL_STEPS) into[step] += num((counts as Row)[step]);
}

export interface FunnelGroup {
  key: string;
  last7Days: StepTotals;
  last30Days: StepTotals;
}

export interface FunnelLessonGroup extends FunnelGroup {
  courseId: string;
  lessonSlug: string;
}

export interface FunnelBlock {
  steps: readonly FunnelStep[];
  last7Days: StepTotals;
  last30Days: StepTotals;
  byLesson: FunnelLessonGroup[];
  byCampaign: FunnelGroup[];
}

/** funnel_daily rows: { day, courseId, lessonSlug, campaign, counts }. */
export function funnelBlock(docs: Row[], now: number, top = 20): FunnelBlock {
  const since7 = dateIn(now - 6 * DAY_MS, "UTC");
  const since30 = dateIn(now - 29 * DAY_MS, "UTC");
  const last7Days = emptySteps();
  const last30Days = emptySteps();
  const lessons = new Map<string, FunnelLessonGroup>();
  const campaigns = new Map<string, FunnelGroup>();

  for (const d of docs) {
    const day = typeof d.day === "string" ? d.day : "";
    if (!day || day < since30) continue;
    const in7 = day >= since7;
    const courseId = safeLabel(d.courseId, "none");
    const lessonSlug = safeLabel(d.lessonSlug, "none");
    const lk = `${courseId}/${lessonSlug}`;
    const ck = typeof d.campaign === "string" && d.campaign.trim() ? safeLabel(d.campaign, "other") : "direct";
    if (!lessons.has(lk)) lessons.set(lk, { key: lk, courseId, lessonSlug, last7Days: emptySteps(), last30Days: emptySteps() });
    if (!campaigns.has(ck)) campaigns.set(ck, { key: ck, last7Days: emptySteps(), last30Days: emptySteps() });
    const lesson = lessons.get(lk)!;
    const campaign = campaigns.get(ck)!;
    addSteps(last30Days, d.counts);
    addSteps(lesson.last30Days, d.counts);
    addSteps(campaign.last30Days, d.counts);
    if (in7) {
      addSteps(last7Days, d.counts);
      addSteps(lesson.last7Days, d.counts);
      addSteps(campaign.last7Days, d.counts);
    }
  }

  const order = (a: FunnelGroup, b: FunnelGroup) =>
    b.last30Days.lesson_view - a.last30Days.lesson_view ||
    b.last30Days.email_given - a.last30Days.email_given ||
    a.key.localeCompare(b.key);
  return {
    steps: FUNNEL_STEPS,
    last7Days,
    last30Days,
    byLesson: [...lessons.values()].sort(order).slice(0, top),
    byCampaign: [...campaigns.values()].sort(order).slice(0, top),
  };
}

// ---------------------------------------------------------------- leads

export type LeadSource = "x" | "direct" | "referral" | "other";

export function leadSource(lead: Row): LeadSource {
  const utm = (lead.utm && typeof lead.utm === "object" ? lead.utm : {}) as Row;
  const src = typeof utm.source === "string" ? utm.source.trim().toLowerCase() : "";
  if (src === "x" || src === "twitter" || src === "t.co") return "x";
  if (src) return "other";
  let host = "";
  try {
    host = new URL(typeof lead.referrer === "string" ? lead.referrer : "").hostname.toLowerCase();
  } catch {
    host = "";
  }
  if (/^(www\.|mobile\.)?(x\.com|twitter\.com|t\.co)$/.test(host)) return "x";
  return host ? "referral" : "direct";
}

export interface LeadsBlock {
  total: number;
  newInWindow: number;
}

export interface LeadsDetailBlock {
  newBySource: Record<LeadSource, number>;
  newByFirstCourse: Record<string, number>;
  totalByFirstCourse: Record<string, number>;
  withMobile: number;
  textConsent: number;
  emailConfirmed: number;
  unsubscribedOrBounced: number;
}

export function leadBlocks(leads: Row[], windowStart: number): { leads: LeadsBlock; leadsDetail: LeadsDetailBlock } {
  const real = leads.filter((l) => !isDashboardTestEmail(l.email));
  const detail: LeadsDetailBlock = {
    newBySource: { x: 0, direct: 0, referral: 0, other: 0 },
    newByFirstCourse: {},
    totalByFirstCourse: {},
    withMobile: 0,
    textConsent: 0,
    emailConfirmed: 0,
    unsubscribedOrBounced: 0,
  };
  let newInWindow = 0;
  for (const l of real) {
    const created = toMs(l.createdAt);
    const isNew = created !== null && created >= windowStart;
    const first = (l.firstLesson && typeof l.firstLesson === "object" ? l.firstLesson : null) as Row | null;
    const course = first ? safeLabel(first.courseId, "none") : "none";
    detail.totalByFirstCourse[course] = (detail.totalByFirstCourse[course] ?? 0) + 1;
    if (isNew) {
      newInWindow += 1;
      detail.newBySource[leadSource(l)] += 1;
      detail.newByFirstCourse[course] = (detail.newByFirstCourse[course] ?? 0) + 1;
    }
    if (typeof l.phone === "string" && l.phone) detail.withMobile += 1;
    const sms = (l.smsConsent && typeof l.smsConsent === "object" ? l.smsConsent : {}) as Row;
    if (sms.given === true && !l.smsOptOutAt) detail.textConsent += 1;
    if (l.status === "confirmed") detail.emailConfirmed += 1;
    if (l.status === "unsubscribed" || l.status === "bounced" || l.status === "complained") detail.unsubscribedOrBounced += 1;
  }
  return { leads: { total: real.length, newInWindow }, leadsDetail: detail };
}

// ---------------------------------------------------------------- follow-ups

export interface SeriesCounts {
  active: number;
  completed: number;
  exited: number;
  exitedBooked: number;
  overdue: number;
}

export interface FollowUpsBlock {
  bySeries: Record<string, SeriesCounts>;
  active: number;
  overdue: number;
  emailsSentInWindowBySource: Record<string, number>;
  textsSentInWindow: number;
  textsEnabled: boolean;
  lastJobRunAt: string | null;
}

/** A step this long past its send time, still unsent, means the job is behind. */
const OVERDUE_GRACE_MS = HOUR_MS;

export function followUpsBlock(input: {
  flows: Row[];
  emailLog: Row[];
  smsLog: Row[];
  windowStart: number;
  now: number;
  textsEnabled: boolean;
  lastJobRunAt: string | null;
}): FollowUpsBlock {
  const bySeries: Record<string, SeriesCounts> = {};
  let active = 0;
  let overdue = 0;
  for (const f of input.flows) {
    if (isDashboardTestEmail(f.email)) continue;
    const key = safeLabel(f.flowType, "unknown");
    const s = (bySeries[key] ??= { active: 0, completed: 0, exited: 0, exitedBooked: 0, overdue: 0 });
    if (f.status === "active") {
      s.active += 1;
      active += 1;
      const steps = Array.isArray(f.steps) ? (f.steps as Row[]) : [];
      const late = steps.some((st) => {
        if (st.sentAt || st.skipped) return false;
        const at = toMs(st.sendAt);
        return at !== null && at < input.now - OVERDUE_GRACE_MS;
      });
      if (late) {
        s.overdue += 1;
        overdue += 1;
      }
    } else if (f.status === "completed") {
      s.completed += 1;
    } else if (f.status === "exited") {
      s.exited += 1;
      if (f.exitReason === "booked_discovery_call") s.exitedBooked += 1;
    }
  }

  const emailsSentInWindowBySource: Record<string, number> = {};
  for (const e of input.emailLog) {
    if (e.status !== undefined && e.status !== "sent") continue;
    const at = toMs(e.sentAt);
    if (at === null || at < input.windowStart) continue;
    const key = safeLabel(e.source, "other");
    emailsSentInWindowBySource[key] = (emailsSentInWindowBySource[key] ?? 0) + 1;
  }
  let textsSentInWindow = 0;
  for (const t of input.smsLog) {
    const at = toMs(t.sentAt);
    if (t.status === "sent" && at !== null && at >= input.windowStart) textsSentInWindow += 1;
  }

  return {
    bySeries,
    active,
    overdue,
    emailsSentInWindowBySource,
    textsSentInWindow,
    textsEnabled: input.textsEnabled,
    lastJobRunAt: input.lastJobRunAt,
  };
}

// ---------------------------------------------------------------- money

export type PaymentKind = "stripe" | "crypto" | "manual";

export interface RevenueMonth {
  month: string;
  method: PaymentKind;
  payments: number;
  grossUsd: number;
  refundsUsd: number;
  netUsd: number;
}

export interface PaymentsBlock {
  countInWindow: number;
  amountInWindowUsd: number;
  inWindowByMethod: Record<PaymentKind, { count: number; amountUsd: number }>;
}

/** Crypto transfers are logged as manual payments; a confirmed notice links its payment id. */
export function paymentKind(id: string, row: Row, cryptoPaymentIds: Set<string>): PaymentKind {
  if (row.method === "stripe") return "stripe";
  if (cryptoPaymentIds.has(id)) return "crypto";
  return "manual";
}

export function moneyBlocks(input: {
  payments: Array<{ id: string; data: Row }>;
  cryptoPaymentIds: Set<string>;
  windowStart: number;
  now: number;
  months?: number;
}): { payments: PaymentsBlock; revenue: { months: RevenueMonth[] } } {
  const monthsBack = input.months ?? 13;
  const d = new Date(input.now);
  const firstMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - (monthsBack - 1), 1)).getTime();
  const monthKeys: string[] = [];
  for (let i = 0; i < monthsBack; i++) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - (monthsBack - 1) + i, 1));
    monthKeys.push(m.toISOString().slice(0, 7));
  }
  const kinds: PaymentKind[] = ["stripe", "crypto", "manual"];
  const cells = new Map<string, { payments: number; gross: number; refunds: number }>();
  for (const m of monthKeys) for (const k of kinds) cells.set(`${m}|${k}`, { payments: 0, gross: 0, refunds: 0 });

  const inWindowByMethod: PaymentsBlock["inWindowByMethod"] = {
    stripe: { count: 0, amountUsd: 0 },
    crypto: { count: 0, amountUsd: 0 },
    manual: { count: 0, amountUsd: 0 },
  };
  let countInWindow = 0;
  let windowCents = 0;
  const windowCentsBy: Record<PaymentKind, number> = { stripe: 0, crypto: 0, manual: 0 };

  for (const { id, data } of input.payments) {
    if (isDashboardTestEmail(data.email)) continue;
    const at = toMs(data.paidAt);
    if (at === null) continue;
    const amount = num(data.amount);
    const refunded = num(data.amountRefunded ?? data.refundedAmount);
    const kind = paymentKind(id, data, input.cryptoPaymentIds);
    if (at >= input.windowStart && at <= input.now + DAY_MS) {
      countInWindow += 1;
      windowCents += amount;
      inWindowByMethod[kind].count += 1;
      windowCentsBy[kind] += amount;
    }
    if (at < firstMonth) continue;
    const cell = cells.get(`${new Date(at).toISOString().slice(0, 7)}|${kind}`);
    if (!cell) continue;
    cell.payments += 1;
    cell.gross += amount;
    cell.refunds += refunded;
  }
  for (const k of kinds) inWindowByMethod[k].amountUsd = usd(windowCentsBy[k]);

  const months: RevenueMonth[] = [];
  for (const m of monthKeys) {
    for (const k of kinds) {
      const c = cells.get(`${m}|${k}`)!;
      months.push({
        month: m,
        method: k,
        payments: c.payments,
        grossUsd: usd(c.gross),
        refundsUsd: usd(c.refunds),
        netUsd: usd(c.gross - c.refunds),
      });
    }
  }
  return {
    payments: { countInWindow, amountInWindowUsd: usd(windowCents), inWindowByMethod },
    revenue: { months },
  };
}

export interface ReceivablesBlock {
  dueNext30Days: { count: number; amountUsd: number };
  overdue: { count: number; amountUsd: number; oldestDueDate: string | null };
  cryptoNoticesUnconfirmed: { count: number; amountUsd: number; oldestAt: string | null };
}

export function receivablesBlock(input: { schedules: Row[]; cryptoNotices: Row[]; now: number }): ReceivablesBlock {
  const today = dateIn(input.now, "America/New_York");
  const in30 = dateIn(input.now + 30 * DAY_MS, "America/New_York");
  const out: ReceivablesBlock = {
    dueNext30Days: { count: 0, amountUsd: 0 },
    overdue: { count: 0, amountUsd: 0, oldestDueDate: null },
    cryptoNoticesUnconfirmed: { count: 0, amountUsd: 0, oldestAt: null },
  };
  let dueCents = 0;
  let overdueCents = 0;
  for (const s of input.schedules) {
    if (isDashboardTestEmail(s.email)) continue;
    const installments = Array.isArray(s.installments) ? (s.installments as Row[]) : [];
    for (const i of installments) {
      if (i.paidAt) continue;
      const due = typeof i.dueDate === "string" ? i.dueDate : "";
      if (!due) continue;
      if (due < today) {
        out.overdue.count += 1;
        overdueCents += num(i.amount);
        if (!out.overdue.oldestDueDate || due < out.overdue.oldestDueDate) out.overdue.oldestDueDate = due;
      } else if (due <= in30) {
        out.dueNext30Days.count += 1;
        dueCents += num(i.amount);
      }
    }
  }
  out.dueNext30Days.amountUsd = usd(dueCents);
  out.overdue.amountUsd = usd(overdueCents);

  let noticeUsd = 0;
  for (const n of input.cryptoNotices) {
    if (n.status === "confirmed" || isDashboardTestEmail(n.email)) continue;
    out.cryptoNoticesUnconfirmed.count += 1;
    noticeUsd += num(n.amountUsd);
    const at = toMs(n.createdAt);
    if (at !== null) {
      const iso = new Date(at).toISOString();
      if (!out.cryptoNoticesUnconfirmed.oldestAt || iso < out.cryptoNoticesUnconfirmed.oldestAt) {
        out.cryptoNoticesUnconfirmed.oldestAt = iso;
      }
    }
  }
  out.cryptoNoticesUnconfirmed.amountUsd = Math.round(noticeUsd * 100) / 100;
  return out;
}

// ---------------------------------------------------------------- coaching

export interface CoachingBlock {
  clientsByStatus: Record<string, number>;
  activeByPackage: Record<string, number>;
  agreementsPending: { count: number; oldestAt: string | null };
  intakeFormsWaiting: number;
}

const ACTIVE_CLIENT_STATUSES = new Set(["paid_pending_contract", "onboarded", "active", "paid"]);

export function coachingBlock(input: {
  clients: Array<{ id: string; data: Row }>;
  signatures: Row[];
  intakeLinks: Row[];
  now: number;
}): CoachingBlock {
  const out: CoachingBlock = {
    clientsByStatus: {},
    activeByPackage: {},
    agreementsPending: { count: 0, oldestAt: null },
    intakeFormsWaiting: 0,
  };
  for (const { id, data } of input.clients) {
    if (isDashboardTestEmail(data.email ?? id)) continue;
    const status = safeLabel(data.status, "unknown");
    out.clientsByStatus[status] = (out.clientsByStatus[status] ?? 0) + 1;
    if (ACTIVE_CLIENT_STATUSES.has(status)) {
      const pkg = data.fullAccess === true && !data.packageId ? "full-access" : safeLabel(data.packageId, "none");
      out.activeByPackage[pkg] = (out.activeByPackage[pkg] ?? 0) + 1;
    }
  }
  for (const s of input.signatures) {
    if (s.status !== "pending") continue;
    if (isDashboardTestEmail(s.signerEmail ?? s.clientEmail ?? s.email ?? s.clientId)) continue;
    const exp = toMs(s.expiresAt);
    if (exp !== null && exp < input.now) continue;
    out.agreementsPending.count += 1;
    const at = toMs(s.createdAt);
    if (at !== null) {
      const iso = new Date(at).toISOString();
      if (!out.agreementsPending.oldestAt || iso < out.agreementsPending.oldestAt) out.agreementsPending.oldestAt = iso;
    }
  }
  for (const l of input.intakeLinks) {
    if (l.submittedAt || isDashboardTestEmail(l.email)) continue;
    const exp = toMs(l.expiresAt);
    if (exp !== null && exp < input.now) continue;
    out.intakeFormsWaiting += 1;
  }
  return out;
}

// ---------------------------------------------------------------- needs owner

export interface NeedsOwnerItem {
  id: string;
  level: "act" | "watch";
  item: string;
  since: string | null;
}

/** The follow-up job runs every 15 minutes; two hours without a run means it has stopped. */
export const JOB_STALE_MS = 2 * HOUR_MS;
/** calendar_check_alert is written at most hourly while bookings are refused. */
export const CALENDAR_ALERT_FRESH_MS = 2 * HOUR_MS;
const AGREEMENT_LATE_MS = 3 * DAY_MS;

export function needsOwnerBlock(input: {
  receivables: ReceivablesBlock;
  coaching: CoachingBlock;
  followUps: FollowUpsBlock;
  calendarAlertAt: string | null;
  now: number;
}): NeedsOwnerItem[] {
  const items: NeedsOwnerItem[] = [];
  const r = input.receivables;
  if (r.cryptoNoticesUnconfirmed.count > 0) {
    items.push({
      id: "fatb-crypto-unconfirmed",
      level: "act",
      item: `${r.cryptoNoticesUnconfirmed.count} crypto payment notice${r.cryptoNoticesUnconfirmed.count === 1 ? "" : "s"} waiting for you to confirm in Mission Control.`,
      since: r.cryptoNoticesUnconfirmed.oldestAt,
    });
  }
  if (r.overdue.count > 0) {
    items.push({
      id: "fatb-installment-overdue",
      level: "act",
      item: `${r.overdue.count} coaching installment${r.overdue.count === 1 ? " is" : "s are"} past due ($${r.overdue.amountUsd.toLocaleString("en-US")}).`,
      since: r.overdue.oldestDueDate,
    });
  }
  const a = input.coaching.agreementsPending;
  if (a.count > 0) {
    const old = a.oldestAt ? Date.parse(a.oldestAt) : NaN;
    items.push({
      id: "fatb-agreement-unsigned",
      level: Number.isFinite(old) && input.now - old > AGREEMENT_LATE_MS ? "act" : "watch",
      item: `${a.count} coaching agreement${a.count === 1 ? " is" : "s are"} sent but not signed yet.`,
      since: a.oldestAt,
    });
  }
  const alertAt = input.calendarAlertAt ? Date.parse(input.calendarAlertAt) : NaN;
  if (Number.isFinite(alertAt) && input.now - alertAt < CALENDAR_ALERT_FRESH_MS) {
    items.push({
      id: "fatb-booking-calendar",
      level: "act",
      item: "Call booking is paused because the site can't check your Google Calendar.",
      since: input.calendarAlertAt,
    });
  }
  const ran = input.followUps.lastJobRunAt ? Date.parse(input.followUps.lastJobRunAt) : NaN;
  if (!Number.isFinite(ran) || input.now - ran > JOB_STALE_MS) {
    items.push({
      id: "fatb-followup-job",
      level: "act",
      item: "The follow-up job has not run for over 2 hours, so follow-up emails and reminders are waiting.",
      since: input.followUps.lastJobRunAt,
    });
  }
  if (!input.followUps.textsEnabled) {
    items.push({
      id: "fatb-texts-off",
      level: "watch",
      item: "Texts to leads are off until the Twilio toll-free number is verified.",
      since: null,
    });
  }
  return items;
}
