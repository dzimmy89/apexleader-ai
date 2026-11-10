import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import { effectiveCloseValue } from "@/lib/crm/pipeline-utils";

/**
 * Totals only, for the all-business dashboard's 6-hour refresh.
 * No names, emails or ids leave this function: every value is a count or a sum.
 */

const DAY_MS = 86400000;

type CountableQuery = FirebaseFirestore.Query;

/** createdAt is stored as an ISO string on most docs and a Timestamp on some. Count both. */
async function countSince(
  collection: string,
  field: string,
  since: Date
): Promise<number> {
  const db = getDb();
  const col: CountableQuery = db.collection(collection);
  const [asString, asTimestamp] = await Promise.all([
    col.where(field, ">=", since.toISOString()).count().get(),
    col.where(field, ">=", Timestamp.fromDate(since)).count().get(),
  ]);
  return asString.data().count + asTimestamp.data().count;
}

function inRange(value: unknown, from: number, to: number): boolean {
  if (typeof value !== "string") return false;
  const t = new Date(value).getTime();
  return !Number.isNaN(t) && t >= from && t < to;
}

export interface DashboardSummary {
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
  payments: { countInWindow: number; amountInWindowUsd: number };
  emails: { sentInWindow: number };
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

  const [
    leadsTotal,
    leadsNew,
    membersTotal,
    emailsSent,
    appsSnap,
    sessionsSnap,
    paymentsSnap,
  ] = await Promise.all([
    db.collection("leads").count().get(),
    countSince("leads", "createdAt", windowStart),
    db.collection("members").count().get(),
    db.collection("emailLog").where("sentAt", ">=", windowStart.toISOString()).count().get(),
    db.collection("coaching_applications").limit(1000).get(),
    db
      .collection("coaching_sessions")
      .where("scheduledAt", ">=", sessionsFrom)
      .orderBy("scheduledAt", "asc")
      .limit(2000)
      .get(),
    db.collection("client_payments").where("paidAt", ">=", windowStart.toISOString()).limit(2000).get(),
  ]);

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
    byStage[status] = (byStage[status] ?? 0) + 1;
  }

  let completedInWindow = 0;
  let cancelledOrNoShowInWindow = 0;
  let scheduledNext7Days = 0;
  const activeClients = new Set<string>();
  for (const doc of sessionsSnap.docs) {
    const s = doc.data();
    if (s.ignored) continue;
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

  let amountCents = 0;
  for (const doc of paymentsSnap.docs) {
    const amount = doc.data().amount;
    if (typeof amount === "number") amountCents += amount;
  }

  return {
    business: opts.business,
    generatedAt: new Date(now).toISOString(),
    windowDays: opts.windowDays,
    windowStart: windowStart.toISOString(),
    leads: { total: leadsTotal.data().count, newInWindow: leadsNew },
    members: { total: membersTotal.data().count },
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
    payments: {
      countInWindow: paymentsSnap.size,
      amountInWindowUsd: Math.round(amountCents) / 100,
    },
    emails: { sentInWindow: emailsSent.data().count },
  };
}
