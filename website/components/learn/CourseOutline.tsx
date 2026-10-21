import Link from "next/link";
import { Check, ChevronRight, Lock } from "lucide-react";
import { ProgressBar } from "@/components/learn/ProgressBar";
import {
  courseOutline,
  exerciseKey,
  lessonKey,
  quizKey,
  PASSING_QUIZ_SCORE,
  type LearnCourse,
  type OutlineItem,
  type OutlineKind,
} from "@/lib/learn/catalog";
import type { CourseLock } from "@/lib/learn/gate";
import type { LearnProgress } from "@/lib/learn/progress";
import { cn } from "@/lib/utils";

export interface OutlineCurrent {
  kind: OutlineKind;
  slug: string;
}

function itemDone(courseId: string, item: OutlineItem, progress: LearnProgress | null): boolean {
  if (!progress) return false;
  if (item.kind === "lesson") return !!progress.lessons[lessonKey(courseId, item.slug)];
  if (item.kind === "exercise") return !!progress.exercises[exerciseKey(courseId, item.slug)];
  return (progress.quizzes[quizKey(courseId, item.slug)]?.best ?? 0) >= PASSING_QUIZ_SCORE;
}

/** Big courses open only the current module so the list stays short. */
const OPEN_ALL_UP_TO = 3;

/**
 * Every lesson, exercise and quiz in a course, grouped by module, with the
 * current piece highlighted and ticks from the reader's progress. Sans
 * throughout (it is a list to scan); the parent gives it a panel.
 */
export function CourseOutline({
  course,
  current,
  progress,
  lock,
}: {
  course: LearnCourse;
  current: OutlineCurrent;
  progress: LearnProgress | null;
  lock: CourseLock;
}) {
  const modules = courseOutline(course);
  const all = modules.flatMap((m) => m.items);
  const doneCount = all.filter((item) => itemDone(course.id, item, progress)).length;

  return (
    <nav aria-label="Course outline" className="ui-surface">
      <div className="border-b border-[var(--color-border)] px-4 pb-4 pt-4">
        <p className="ui-label">Course outline</p>
        <Link
          href={`/university/${course.id}`}
          className="mt-1 block font-[family-name:var(--font-display)] text-[1.25rem] leading-snug text-[var(--color-text)] hover:text-[var(--color-accent)]"
        >
          {course.title}
        </Link>
        {progress && lock === "open" ? (
          <div className="mt-3">
            <ProgressBar done={doneCount} total={all.length} label="Course progress" unit="done" />
          </div>
        ) : null}
      </div>
      <div className="py-2">
        {modules.map((mod) => {
          const hasCurrent = mod.items.some((i) => i.kind === current.kind && i.slug === current.slug);
          const modDone = mod.items.filter((item) => itemDone(course.id, item, progress)).length;
          return (
            <details key={mod.number} open={hasCurrent || modules.length <= OPEN_ALL_UP_TO} className="group">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-[length:var(--text-small)] font-semibold leading-snug text-[var(--color-text)] hover:bg-[var(--color-panel-raised)] [&::-webkit-details-marker]:hidden">
                <span className="flex items-start gap-2">
                  <ChevronRight
                    size={14}
                    aria-hidden="true"
                    className="mt-[3px] shrink-0 text-[var(--color-text-muted)] group-open:rotate-90 motion-safe:transition-transform"
                  />
                  <span>
                    Module {mod.number}: {mod.title}
                  </span>
                </span>
                {progress && lock === "open" ? (
                  <span className="shrink-0 text-[length:var(--text-caption)] font-medium tabular-nums text-[var(--color-text-muted)]">
                    {modDone}/{mod.items.length}
                  </span>
                ) : null}
              </summary>
              <ol className="pb-2">
                {mod.items.map((item) => {
                  const isCurrent = item.kind === current.kind && item.slug === current.slug;
                  const done = lock === "open" && itemDone(course.id, item, progress);
                  const best = item.kind === "quiz" ? progress?.quizzes[quizKey(course.id, item.slug)]?.best : undefined;
                  return (
                    <li key={`${item.kind}-${item.slug}`}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent ? "page" : undefined}
                        data-outline-current={isCurrent ? "" : undefined}
                        className={cn(
                          "flex min-h-[44px] items-start gap-2 border-l-[3px] py-2.5 pr-3 text-[length:var(--text-small)] leading-snug",
                          item.kind === "exercise" ? "pl-8" : "pl-4",
                          isCurrent
                            ? "border-[var(--color-accent)] bg-[var(--color-panel-raised)] font-semibold text-[var(--color-text)]"
                            : "border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-panel-raised)] hover:text-[var(--color-text)]"
                        )}
                      >
                        <span className="mt-px flex w-5 shrink-0 justify-center text-[length:var(--text-caption)] tabular-nums">
                          {lock !== "open" ? (
                            <>
                              <Lock size={13} aria-hidden="true" className="mt-0.5" />
                              <span className="sr-only">Locked: </span>
                            </>
                          ) : done ? (
                            <>
                              <Check size={15} aria-hidden="true" className="mt-0.5 text-[var(--color-success)]" />
                              <span className="sr-only">Done: </span>
                            </>
                          ) : item.kind === "lesson" ? (
                            item.number
                          ) : (
                            <span aria-hidden="true">○</span>
                          )}
                        </span>
                        <span className="min-w-0">
                          {item.label}
                          {best !== undefined ? (
                            <span className="ml-1 text-[length:var(--text-caption)] font-normal text-[var(--color-text-muted)]">· best {best}%</span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </div>
    </nav>
  );
}
