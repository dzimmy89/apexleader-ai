import { getDb } from "@/lib/firebase-admin";
import { getPackages } from "@/lib/coaching/packages";
import {
  DEFAULT_PACKAGE_PRICES,
  effectiveCloseValue,
} from "@/lib/crm/pipeline-utils";

export async function getOverviewStats() {
  const db = getDb();
  const [leads, members, flows, sends, coaching, appsSnap, packages] =
    await Promise.all([
      db.collection("leads").count().get(),
      db.collection("members").count().get(),
      db.collection("flows").where("status", "==", "active").count().get(),
      db.collection("emailLog").count().get(),
      db.collection("coaching_applications").where("status", "==", "new").count().get(),
      db.collection("coaching_applications").limit(500).get(),
      getPackages({ activeOnly: false }).catch(() => []),
    ]);

  const priceMap: Record<string, number> = { ...DEFAULT_PACKAGE_PRICES };
  for (const p of packages) {
    priceMap[p.id] = p.price;
  }

  const sentSnap = await db
    .collection("emailLog")
    .orderBy("sentAt", "desc")
    .limit(5)
    .get();

  const now = Date.now();
  const weekEnd = now + 7 * 86400000;
  const dayEnd = now + 86400000;
  type AppRow = Record<string, unknown> & { id: string };
  const apps: AppRow[] = appsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const overdue = apps.filter((a) => {
    const status = a.status as string;
    if (status === "won" || status === "lost") return false;
    const next = a.nextActionAt as string | undefined;
    return next && new Date(next).getTime() < now;
  });

  const discoveryToday = apps.filter((a) => {
    if (!a.discoveryCallAt) return false;
    const t = new Date(a.discoveryCallAt as string).getTime();
    return t >= now && t <= dayEnd;
  });

  const discoveryWeek = apps.filter((a) => {
    if (!a.discoveryCallAt) return false;
    const t = new Date(a.discoveryCallAt as string).getTime();
    return t >= now && t <= weekEnd;
  });

  const pipelineByStage: Record<string, { count: number; value: number }> = {};
  for (const app of apps) {
    const status = (app.status as string) || "new";
    if (status === "won" || status === "lost") continue;
    if (!pipelineByStage[status]) pipelineByStage[status] = { count: 0, value: 0 };
    pipelineByStage[status].count += 1;
    pipelineByStage[status].value += effectiveCloseValue(
      {
        closeValue: app.closeValue as number | undefined,
        packageId: app.packageId as string | undefined,
      },
      priceMap
    );
  }

  return {
    leadsCount: leads.data().count,
    membersCount: members.data().count,
    activeFlows: flows.data().count,
    emailsLast7d: sends.data().count,
    coachingNew: coaching.data().count,
    recentSends: sentSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    overdueApplications: overdue.slice(0, 10).map((a) => ({
      id: a.id as string,
      email: a.email as string,
      name: a.name as string | undefined,
      nextActionAt: a.nextActionAt as string | undefined,
      status: a.status as string | undefined,
    })),
    discoveryToday: discoveryToday.slice(0, 10).map((a) => ({
      id: a.id as string,
      email: a.email as string,
      name: a.name as string | undefined,
      discoveryCallAt: a.discoveryCallAt as string | undefined,
    })),
    discoveryWeekCount: discoveryWeek.length,
    pipelineByStage,
  };
}
