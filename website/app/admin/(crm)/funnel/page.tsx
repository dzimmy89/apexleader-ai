import Link from "next/link";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { findLesson, getCourse } from "@/lib/learn/catalog";
import { aggregateFunnel, loadFunnelDocs, rate, type FunnelRow, type StepCounts } from "@/lib/funnel/report";
import { NO_LESSON } from "@/lib/coaching/booking-answers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Funnel — Mission Control" };

const RANGES = [7, 30, 90] as const;

function lessonLabel(courseId: string, lessonSlug: string): string {
  if (courseId === NO_LESSON.courseId && lessonSlug === NO_LESSON.lessonSlug) return "Booked without a lesson";
  const course = getCourse(courseId);
  const found = course ? findLesson(course, lessonSlug) : null;
  return found ? `${found.lesson.title} · ${course!.title}` : `${courseId}/${lessonSlug}`;
}

const COLUMNS: { step: keyof StepCounts; label: string; of?: keyof StepCounts }[] = [
  { step: "lesson_view", label: "Lesson views" },
  { step: "ask_seen", label: "Saw the ask", of: "lesson_view" },
  { step: "email_given", label: "Gave email", of: "lesson_view" },
  { step: "mobile_given", label: "Gave mobile", of: "email_given" },
  { step: "exercise_view", label: "Opened exercise" },
  { step: "call_booked", label: "Booked a call", of: "mobile_given" },
];

function Table({ title, rows, first }: { title: string; rows: FunnelRow[]; first: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-[var(--color-text-on-obsidian)]">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border-muted)]">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <tr>
              <th className="px-3 py-2">{first}</th>
              {COLUMNS.map((c) => (
                <th key={c.step} className="px-3 py-2 text-right">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-6 text-center text-[var(--color-text-muted)]">
                  No visits counted in this range yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key} className="border-t border-[var(--color-border-muted)]">
                  <td className="max-w-[320px] truncate px-3 py-2 text-[var(--color-text-on-obsidian)]" title={r.label}>
                    {r.label}
                  </td>
                  {COLUMNS.map((c) => (
                    <td key={c.step} className="px-3 py-2 text-right tabular-nums text-[var(--color-text-on-obsidian)]">
                      {r.counts[c.step]}
                      {c.of ? (
                        <span className="ml-1.5 text-xs text-[var(--color-text-muted)]">{rate(r.counts[c.step], r.counts[c.of])}</span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function FunnelPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: raw } = await searchParams;
  const days = (RANGES as readonly number[]).includes(Number(raw)) ? Number(raw) : 7;
  let error = "";
  let docs: Awaited<ReturnType<typeof loadFunnelDocs>> = [];
  try {
    docs = await loadFunnelDocs(days);
  } catch (e) {
    console.error("[admin/funnel] load failed", e);
    error = "Could not load the counts. Try again in a minute.";
  }
  const { total, byLesson, byCampaign } = aggregateFunnel(docs, lessonLabel);
  const totalRow: FunnelRow = { key: "total", label: "All lessons", counts: total };

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Funnel"
        description="People, not page loads: lesson views and the steps after them, counted on this site (bots filtered, no personal data). Percentages compare each step with the one it depends on."
        actions={
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin/funnel?days=${r}`}
                className={`rounded-md border px-3 py-1.5 text-xs ${
                  r === days
                    ? "border-[var(--color-accent)] text-[var(--color-text-on-obsidian)]"
                    : "border-[var(--color-border-muted)] text-[var(--color-text-muted)]"
                }`}
              >
                {r} days
              </Link>
            ))}
          </div>
        }
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Table title={`Last ${days} days`} rows={[totalRow]} first="" />
      <Table title="By campaign" rows={byCampaign} first="Campaign" />
      <Table title="By lesson" rows={byLesson} first="Lesson" />
    </div>
  );
}
