import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Chip, Meter } from "@/components/system";
import { allLessons, getCourse, getStages, lessonKey, FREE_STAGE_IDS, type LearnCourse } from "@/lib/learn/catalog";
import type { LearnProgress } from "@/lib/learn/progress";

interface CourseRow {
  course: LearnCourse;
  done: number;
  total: number;
  /** Latest lesson completion in this course, ISO. */
  lastAt: string;
  open: boolean;
}

function rowsFor(progress: LearnProgress | null, hasCourseAccess: boolean) {
  return getStages().map((stage) => {
    const open = FREE_STAGE_IDS.has(stage.id) || hasCourseAccess;
    const rows: CourseRow[] = stage.courseIds
      .map((id) => getCourse(id))
      .filter((c): c is LearnCourse => Boolean(c))
      .map((course) => {
        const lessons = allLessons(course);
        const stamps = progress ? lessons.map((l) => progress.lessons[lessonKey(course.id, l.slug)]).filter(Boolean) : [];
        return { course, done: stamps.length, total: lessons.length, lastAt: stamps.sort().at(-1) || "", open };
      });
    return { stage, open, rows };
  });
}

function hoursLabel(course: LearnCourse): string {
  const h = course.estimatedHours;
  return h ? `about ${h % 1 === 0 ? h : h.toFixed(1)} hour${h === 1 ? "" : "s"}` : "";
}

/** Your courses on /account: what you are in the middle of first, then every stage. */
export function CoursesSection({
  progress,
  hasCourseAccess,
}: {
  progress: LearnProgress | null;
  hasCourseAccess: boolean;
}) {
  const stages = rowsFor(progress, hasCourseAccess);
  const inProgress = stages
    .flatMap((s) => s.rows)
    .filter((r) => r.open && r.done > 0 && r.done < r.total)
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .slice(0, 3);
  const firstOpenUnfinished = stages.find((s) => s.open && s.rows.some((r) => r.done < r.total))?.stage.id;

  return (
    <div id="courses" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">University</p>
          <h2 className="mt-2 text-[length:var(--text-h2)] leading-[1.08]">Your courses</h2>
        </div>
        <Link href="/university" className="btn btn-secondary btn-sm">
          Browse all 31 courses
        </Link>
      </div>

      {inProgress.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {inProgress.map((r) => (
            <div key={r.course.id} className="panel flex flex-col p-5">
              <p className="ui-label">In progress</p>
              <Link href={`/university/${r.course.id}`} className="mt-2 font-[family-name:var(--font-display)] text-[22px] leading-tight hover:text-[var(--color-accent)]">
                {r.course.title}
              </Link>
              <p className="mt-2 font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
                {r.done} of {r.total} lessons done
              </p>
              <Meter value={r.done} max={r.total} className="mt-2" />
              <Link href={`/university/${r.course.id}`} className="btn btn-primary btn-sm mt-4 self-start">
                Continue
              </Link>
            </div>
          ))}
        </div>
      ) : progress?.lastVisited ? (
        <div className="panel p-5">
          <p className="ui-label">Pick up where you left off</p>
          <Link href={progress.lastVisited.href} className="mt-2 block font-[family-name:var(--font-display)] text-[22px] leading-tight hover:text-[var(--color-accent)]">
            {progress.lastVisited.title}
          </Link>
          <Link href={progress.lastVisited.href} className="btn btn-primary btn-sm mt-4">
            Continue
          </Link>
        </div>
      ) : null}

      <div className="space-y-3">
        {stages.map(({ stage, open, rows }) => {
          const done = rows.filter((r) => r.total > 0 && r.done >= r.total).length;
          const started = rows.filter((r) => r.done > 0).length;
          return (
            <details key={stage.id} className="panel group" open={stage.id === firstOpenUnfinished}>
              <summary className="flex min-h-[64px] cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <span className="block font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Stage {stage.number}
                  </span>
                  <span className="mt-0.5 block font-[family-name:var(--font-display)] text-[26px] leading-tight">{stage.title}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {open ? (
                    done === rows.length && rows.length ? (
                      <Chip tone="success">
                        <Check size={14} aria-hidden /> Complete
                      </Chip>
                    ) : (
                      <span className="font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
                        {started ? `${done} of ${rows.length} courses done` : `${rows.length} courses`}
                      </span>
                    )
                  ) : (
                    <Chip>
                      <Lock size={14} aria-hidden /> Members
                    </Chip>
                  )}
                  <span className="font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)] group-open:hidden">Show</span>
                  <span className="hidden font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)] group-open:inline">Hide</span>
                </span>
              </summary>
              <div className="border-t border-[var(--color-border)] px-5 pb-2">
                {rows.map((r) => (
                  <div key={r.course.id} className={`row ${open ? "" : "opacity-70"}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/university/${r.course.id}`} className="row-label block hover:text-[var(--color-accent)]">
                          {r.course.title}
                        </Link>
                        {r.total && r.done >= r.total ? (
                          <Chip tone="success" className="shrink-0">
                            <Check size={14} aria-hidden /> Done
                          </Chip>
                        ) : null}
                      </div>
                      <div className="row-meta">
                        {[`${r.total} lessons`, hoursLabel(r.course), r.done && r.done < r.total ? `${r.done} done` : ""].filter(Boolean).join(" · ")}
                      </div>
                      {r.done ? <Meter value={r.done} max={r.total} label={`${r.course.title} progress`} className="mt-2 max-w-xs" /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
