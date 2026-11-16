import { getDb } from "@/lib/firebase-admin";
import { effectiveCloseValue } from "@/lib/crm/pipeline-utils";
import {
  FEED_SCHEMA_VERSION,
  coachingBlock,
  followUpsBlock,
  funnelBlock,
  isDashboardTestEmail,
  leadBlocks,
  moneyBlocks,
  needsOwnerBlock,
  receivablesBlock,
  safeLabel,
  toMs,
  type CoachingBlock,
  type FollowUpsBlock,
  type FunnelBlock,
  type LeadsDetailBlock,
  type NeedsOwnerItem,
  type PaymentsBlock,
  type ReceivablesBlock,
  type RevenueMonth,
} from "@/lib/crm/dashboard-feed";
import { FUNNEL_COLLECTION } from "@/lib/funnel/events";
import { INTAKE_FORM_LINKS } from "@/lib/coaching/intake-form";
import { SMS_LOG, SMS_SENDS_ENV } from "@/lib/sms";

/**
 * Totals only, for the all-business dashboard's 6-hour refresh.
 * No names, emails or ids leave this function: every value is a count, a sum
 * or a fixed label. The adding up lives in lib/crm/dashboard-feed.ts; this file
 * only reads Firestore. Owner and test logins are left out of every count.
 */

const DAY_MS = 86400000;
const MAX_DOCS = 5000;

type Row = Record<string, unknown>;

function inRange(value: unknown, from: number, to: number): boolean {
  const t = toMs(value);
  return t !== null && t >= from && t < to;
}

export interface DashboardSummary {
  schemaVersion: number;
  business: string;
  generatedAt: string;
  windowDays: number;
  windowStart: string;
  leads: { total: number; newInWindow: number };
  members: { total: number };
  pipeline: {
    open: number;
    openValueUsd: number;
    byStage: Record<string, number>;
    newInWindow: number;
    wonInWindow: number;
    lostInWindow: number;
    wonValueInWindowUsd: number;
  };
  discoveryCalls: { inWindow: number; next7Days: number };
  sessions: {
    completedInWindow: number;
    cancelledOrNoShowInWindow: number;
    scheduledNext7Days: number;
    activeClients30Days: number;
  };
  payments: PaymentsBlock;
  emails: { sentInWindow: number };
  funnel: FunnelBlock | null;
  leadsDetail: LeadsDetailBlock;
  followUps: FollowUpsBlock | null;
  revenue: { months: RevenueMonth[] } | null;
  receivables: ReceivablesBlock | null;
  coaching: CoachingBlock | null;
  needsOwner: NeedsOwnerItem[];
  warnings: string[];
}

/** A block that can't be read becomes null plus a warning, never a wrong zero. */
async function safely<T>(name: string, warnings: string[], read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch (err) {
    console.error(`[dashboard-summary] ${name}`, err);
    warnings.push(`${name} could not be read`);
    return null;
  }
}

function docs(snap: FirebaseFirestore.QuerySnapshot): Row[] {
  return snap.docs.map((d) => d.data() as Row);
}

export async function getDashboardSummary(opts: {
  business: string;
  windowDays: number;
  packagePrices?: Record<string, number>;
}): Promise<DashboardSummary> {
  const db = getDb();
  const now = Date.now();
  const windowStart = new Date(now - opts.windowDays * DAY_MS);
  const from = windowStart.getTime();
  const next7 = now + 7 * DAY_MS;
  const last30 = now - 30 * DAY_MS;
  const sessionsFrom = new Date(Math.min(from, last30)).toISOString();
  const thirteenMonthsAgo = new Date(now - 400 * DAY_MS).toISOString();
  const thirtyOneDaysAgo = new Date(now - 31 * DAY_MS).toISOString().slice(0, 10);
  const warnings: string[] = [];

  // The core blocks the dashboard already reads: a failure here fails the answer.
  const [leadsSnap, membersSnap, emailsSnap, appsSnap, sessionsSnap, paymentsSnap, noticesSnap] = await Promise.all([
    db.collection("leads").limit(MAX_DOCS).get(),
    db.collection("members").limit(MAX_DOCS).get(),
    db.collection("emailLog").where("sentAt", ">=", windowStart.toISOString()).limit(MAX_DOCS).get(),
    db.collection("coaching_applications").limit(1000).get(),
    db
      .collection("coaching_sessions")
      .where("scheduledAt", ">=", sessionsFrom)
      .orderBy("scheduledAt", "asc")
      .limit(2000)
      .get(),
    db.collection("client_payments").where("paidAt", ">=", thirteenMonthsAgo).limit(MAX_DOCS).get(),
    db.collection("crypto_payment_notices").limit(1000).get(),
  ]);

  // The newer blocks: each one may fail alone.
  const [funnelDocs, flowsDocs, smsDocs, schedulesDocs, clientDocs, signatureDocs, intakeDocs, appState] =
    await Promise.all([
      safely("funnel", warnings, async () =>
        docs(await db.collection(FUNNEL_COLLECTION).where("day", ">=", thirtyOneDaysAgo).limit(MAX_DOCS).get())
      ),
      safely("follow-up flows", warnings, async () => docs(await db.collection("flows").limit(MAX_DOCS).get())),
      safely("texts", warnings, async () =>
        docs(await db.collection(SMS_LOG).where("sentAt", ">=", windowStart.toISOString()).limit(MAX_DOCS).get())
      ),
      safely("payment schedules", warnings, async () => docs(await db.collection("payment_schedules").limit(1000).get())),
      safely("coaching clients", warnings, async () =>
        (await db.collection("client_records").limit(1000).get()).docs.map((d) => ({ id: d.id, data: d.data() as Row }))
      ),
      safely("agreements", warnings, async () =>
        docs(
          await db
            .collection("contract_signatures")
            .where("status", "==", "pending")
            .select("status", "signerEmail", "createdAt", "expiresAt")
            .limit(1000)
            .get()
        )
      ),
      safely("intake forms", warnings, async () =>
        docs(await db.collection(INTAKE_FORM_LINKS).where("submittedAt", "==", null).limit(1000).get())
      ),
      safely("job state", warnings, async () => {
        const [sync, alert] = await Promise.all([
          db.collection("app_state").doc("coaching_calendar_sync").get(),
          db.collection("app_state").doc("calendar_check_alert").get(),
        ]);
        const str = (v: unknown) => (typeof v === "string" ? v : null);
        return { lastJobRunAt: str(sync.data()?.lastRunAt), calendarAlertAt: str(alert.data()?.lastSentAt) };
      }),
    ]);

  // Leads and members
  const { leads, leadsDetail } = leadBlocks(docs(leadsSnap), from);
  const membersTotal = membersSnap.docs.filter((d) => {
    const m = d.data() as Row;
    const meta = (m.metadata && typeof m.metadata === "object" ? m.metadata : {}) as Row;
    return !isDashboardTestEmail(m.email) && meta.source !== "loop";
  }).length;

  // Pipeline and discovery calls
  const prices = opts.packagePrices ?? {};
  const byStage: Record<string, number> = {};
  let open = 0;
  let openValueUsd = 0;
  let newInWindow = 0;
  let wonInWindow = 0;
  let lostInWindow = 0;
  let wonValueInWindowUsd = 0;
  let discoveryInWindow = 0;
  let discoveryNext7 = 0;

  for (const doc of appsSnap.docs) {
    const a = doc.data();
    if (isDashboardTestEmail(a.email)) continue;
    const status = (a.status as string) || "new";
    const value = effectiveCloseValue(
      {
        closeValue: a.closeValue as number | undefined,
        packageId: a.packageId as string | undefined,
      },
      prices
    );
    if (inRange(a.createdAt, from, now + 1)) newInWindow += 1;
    if (inRange(a.discoveryCallAt, from, now)) discoveryInWindow += 1;
    if (inRange(a.discoveryCallAt, now, next7)) discoveryNext7 += 1;
    if (status === "won") {
      if (inRange(a.updatedAt, from, now + 1)) {
        wonInWindow += 1;
        wonValueInWindowUsd += value;
      }
      continue;
    }
    if (status === "lost") {
      if (inRange(a.updatedAt, from, now + 1)) lostInWindow += 1;
      continue;
    }
    open += 1;
    openValueUsd += value;
    const stage = safeLabel(status, "new");
    byStage[stage] = (byStage[stage] ?? 0) + 1;
  }

  // Sessions
  let completedInWindow = 0;
  let cancelledOrNoShowInWindow = 0;
  let scheduledNext7Days = 0;
  const activeClients = new Set<string>();
  for (const doc of sessionsSnap.docs) {
    const s = doc.data();
    if (s.ignored || isDashboardTestEmail(s.clientId)) continue;
    const at = s.scheduledAt as string;
    if (s.status === "completed" && inRange(at, from, now + 1)) completedInWindow += 1;
    if ((s.status === "cancelled" || s.status === "no-show") && inRange(at, from, now + 1)) {
      cancelledOrNoShowInWindow += 1;
    }
    if (s.status === "scheduled" && inRange(at, now, next7)) scheduledNext7Days += 1;
    if (s.status !== "cancelled" && inRange(at, last30, next7) && s.clientId) {
      activeClients.add(String(s.clientId));
    }
  }

  // Money
  const notices = docs(noticesSnap);
  const cryptoPaymentIds = new Set(
    notices
      .filter((n) => n.status === "confirmed" && typeof n.paymentId === "string")
      .map((n) => n.paymentId as string)
  );
  const money = moneyBlocks({
    payments: paymentsSnap.docs.map((d) => ({ id: d.id, data: d.data() as Row })),
    cryptoPaymentIds,
    windowStart: from,
    now,
  });
  const receivables = schedulesDocs ? receivablesBlock({ schedules: schedulesDocs, cryptoNotices: notices, now }) : null;

  // Follow-ups and coaching
  const emailRows = docs(emailsSnap);
  const followUps =
    flowsDocs && appState
      ? followUpsBlock({
          flows: flowsDocs,
          emailLog: emailRows,
          smsLog: smsDocs ?? [],
          windowStart: from,
          now,
          textsEnabled: process.env[SMS_SENDS_ENV] === "true",
          lastJobRunAt: appState.lastJobRunAt,
        })
      : null;
  const coaching =
    clientDocs && signatureDocs && intakeDocs
      ? coachingBlock({ clients: clientDocs, signatures: signatureDocs, intakeLinks: intakeDocs, now })
      : null;
  const needsOwner =
    receivables && coaching && followUps
      ? needsOwnerBlock({ receivables, coaching, followUps, calendarAlertAt: appState?.calendarAlertAt ?? null, now })
      : [];
  if (!(receivables && coaching && followUps)) warnings.push("needs-you list is incomplete");

  return {
    schemaVersion: FEED_SCHEMA_VERSION,
    business: opts.business,
    generatedAt: new Date(now).toISOString(),
    windowDays: opts.windowDays,
    windowStart: windowStart.toISOString(),
    leads,
    members: { total: membersTotal },
    pipeline: {
      open,
      openValueUsd,
      byStage,
      newInWindow,
      wonInWindow,
      lostInWindow,
      wonValueInWindowUsd,
    },
    discoveryCalls: { inWindow: discoveryInWindow, next7Days: discoveryNext7 },
    sessions: {
      completedInWindow,
      cancelledOrNoShowInWindow,
      scheduledNext7Days,
      activeClients30Days: activeClients.size,
    },
    payments: money.payments,
    emails: { sentInWindow: emailRows.filter((e) => e.status === undefined || e.status === "sent").length },
    funnel: funnelDocs ? funnelBlock(funnelDocs, now) : null,
    leadsDetail,
    followUps,
    revenue: money.revenue,
    receivables,
    coaching,
    needsOwner,
    warnings,
  };
}
