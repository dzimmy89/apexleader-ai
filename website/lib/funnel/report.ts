/**
 * Mission Control's funnel table: the funnel_daily counters added up per
 * lesson and per campaign over a date range. The aggregation is pure.
 */
import { getDb } from "@/lib/firebase-admin";
import { FUNNEL_COLLECTION, FUNNEL_STEPS, funnelDay, type FunnelStep } from "@/lib/funnel/events";

export type StepCounts = Record<FunnelStep, number>;

export interface FunnelDoc {
  day: string;
  courseId: string;
  lessonSlug: string;
  campaign: string;
  counts?: Partial<Record<string, number>>;
}

export interface FunnelRow {
  key: string;
  label: string;
  counts: StepCounts;
}

export function emptyCounts(): StepCounts {
  return Object.fromEntries(FUNNEL_STEPS.map((s) => [s, 0])) as StepCounts;
}

function add(into: StepCounts, from: FunnelDoc["counts"]) {
  for (const s of FUNNEL_STEPS) into[s] += Number(from?.[s] || 0);
}

/** Totals, plus rows by lesson and by campaign, busiest first. */
export function aggregateFunnel(
  docs: FunnelDoc[],
  lessonLabel: (courseId: string, lessonSlug: string) => string
): { total: StepCounts; byLesson: FunnelRow[]; byCampaign: FunnelRow[] } {
  const total = emptyCounts();
  const lessons = new Map<string, FunnelRow>();
  const campaigns = new Map<string, FunnelRow>();
  for (const d of docs) {
    add(total, d.counts);
    const lk = `${d.courseId}/${d.lessonSlug}`;
    if (!lessons.has(lk)) lessons.set(lk, { key: lk, label: lessonLabel(d.courseId, d.lessonSlug), counts: emptyCounts() });
    add(lessons.get(lk)!.counts, d.counts);
    const ck = d.campaign || "direct";
    if (!campaigns.has(ck)) campaigns.set(ck, { key: ck, label: ck, counts: emptyCounts() });
    add(campaigns.get(ck)!.counts, d.counts);
  }
  const order = (a: FunnelRow, b: FunnelRow) =>
    b.counts.email_given - a.counts.email_given || b.counts.lesson_view - a.counts.lesson_view || a.label.localeCompare(b.label);
  return { total, byLesson: [...lessons.values()].sort(order), byCampaign: [...campaigns.values()].sort(order) };
}

/** "12%" style share, or "–" when there is nothing to divide by. */
export function rate(part: number, whole: number): string {
  if (!whole) return "–";
  const pct = (part / whole) * 100;
  return `${pct >= 10 || pct === 0 ? Math.round(pct) : pct.toFixed(1)}%`;
}

export async function loadFunnelDocs(days: number, now = new Date()): Promise<FunnelDoc[]> {
  const since = funnelDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
  const snap = await getDb().collection(FUNNEL_COLLECTION).where("day", ">=", since).limit(5000).get();
  return snap.docs.map((d) => d.data() as FunnelDoc);
}
