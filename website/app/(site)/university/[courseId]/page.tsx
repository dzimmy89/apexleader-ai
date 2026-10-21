import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { SectionReveal } from "@/components/SectionReveal";
import { LockedNotice } from "@/components/learn/LockedNotice";
import { ProgressBar } from "@/components/learn/ProgressBar";
import { ButtonLink, Chip, Panel } from "@/components/system";
import { allLessons, exerciseKey, getCourse, getStage, lessonKey, quizKey, PASSING_QUIZ_SCORE } from "@/lib/learn/catalog";
import { courseLock, getViewer } from "@/lib/learn/gate";
import { getProgress } from "@/lib/learn/progress";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export const dynamic = "force-dynamic";

const LEVEL: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) return { title: "Course" };
  return { title: course.title, description: course.description, alternates: { canonical: `/university/${course.id}` } };
}

/* Sans meta inside a lesson row: duration and the exercise link. */
const META = "font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]";

export default async function CoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();
  const stage = getStage(course.stageId)!;
  const viewer = await getViewer();
  const lock = courseLock(course, viewer);
  const progress = viewer.email ? await getProgress(viewer.email).catch(() => null) : null;
  const lessons = allLessons(course);
  const done = progress ? lessons.filter((l) => progress.lessons[lessonKey(course.id, l.slug)]).length : 0;
  const firstOpen = lessons.find((l) => !progress?.lessons[lessonKey(course.id, l.slug)]) ?? lessons[0]!;
  const hours = course.estimatedHours;

  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-4xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/university"
                className="inline-flex min-h-[44px] items-center font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
              >
                University
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              Stage {stage.number}: {stage.title}
            </li>
          </ol>
        </nav>

        <SectionReveal className="page-header mb-12">
          <div className="min-w-0">
            <p className="section-eyebrow">
              Stage {stage.number} · {LEVEL[stage.level]}
            </p>
            <h1 className="page-title">
              <span aria-hidden="true">{course.icon} </span>
              {course.title}
            </h1>
            <p className="page-intro">{course.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip>{course.modules.length} modules</Chip>
              <Chip>{course.lessonCount} lessons</Chip>
              <Chip>
                About {hours} {hours === 1 ? "hour" : "hours"}
              </Chip>
              {lock === "open" ? (
                <Chip tone="success">Open</Chip>
              ) : (
                <Chip>
                  <Lock size={12} aria-hidden="true" />
                  {lock === "sign-in" ? "Free with sign-in" : "Members"}
                </Chip>
              )}
            </div>
            {progress ? (
              <div className="mt-6 max-w-sm">
                <ProgressBar done={done} total={lessons.length} label="Course progress" />
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            {/* When the course is locked the notice below carries the primary action. */}
            <ButtonLink href={`/university/${course.id}/lessons/${firstOpen.slug}`} tone={lock === "open" ? "primary" : "secondary"}>
              {done > 0 ? "Continue" : "Start lesson 1"}
            </ButtonLink>
          </div>
        </SectionReveal>

        {lock !== "open" ? <LockedNotice lock={lock} next={`/university/${course.id}`} /> : null}

        <div className="space-y-8">
          {course.modules.map((mod) => {
            const quizBest = mod.quiz ? progress?.quizzes[quizKey(course.id, mod.quiz)]?.best : undefined;
            const quizPassed = quizBest !== undefined && quizBest >= PASSING_QUIZ_SCORE;
            const modDone = progress ? mod.lessons.filter((l) => !!progress.lessons[lessonKey(course.id, l.slug)]).length : 0;
            return (
              <Panel
                key={mod.number}
                id={`module-${mod.number}`}
                eyebrow={`Module ${mod.number}`}
                title={mod.title}
                bodyClassName=""
                action={
                  progress ? (
                    <span className={cn(META, "tabular-nums")}>
                      {modDone} of {mod.lessons.length} done
                    </span>
                  ) : undefined
                }
              >
                <ol>
                  {mod.lessons.map((lesson) => {
                    const lessonDone = !!progress?.lessons[lessonKey(course.id, lesson.slug)];
                    const exDone = lesson.exercise ? !!progress?.exercises[exerciseKey(course.id, lesson.exercise)] : false;
                    const isNext = lesson.slug === firstOpen.slug;
                    return (
                      <li
                        key={lesson.slug}
                        className={cn(
                          "row flex-wrap border-l-[3px]",
                          isNext ? "border-l-[var(--color-accent)] bg-[var(--color-accent-subtle)]" : "border-l-transparent"
                        )}
                      >
                        <Link
                          href={`/university/${course.id}/lessons/${lesson.slug}`}
                          className="-my-2 flex min-h-[44px] min-w-0 flex-1 basis-full items-center gap-3 sm:basis-0 text-[1.0625rem] font-medium leading-snug text-[var(--color-text)] hover:text-[var(--color-accent)]"
                        >
                          <span className="flex w-6 shrink-0 justify-center text-[length:var(--text-caption)] tabular-nums text-[var(--color-text-muted)]">
                            {lessonDone ? (
                              <>
                                <Check size={16} aria-hidden="true" className="text-[var(--color-success)]" />
                                <span className="sr-only">Done: </span>
                              </>
                            ) : (
                              lesson.number
                            )}
                          </span>
                          <span className="min-w-0">{lesson.title}</span>
                        </Link>
                        <span className={cn("flex shrink-0 items-center gap-4 pl-9 sm:pl-0", META)}>
                          {isNext ? <Chip tone="warning">{done > 0 ? "Up next" : "Start here"}</Chip> : null}
                          <span className="tabular-nums">{lesson.minutes} min</span>
                          {lesson.exercise ? (
                            <Link
                              href={`/university/${course.id}/exercises/${lesson.exercise}`}
                              className="-my-2 inline-flex min-h-[44px] items-center gap-1 font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
                            >
                              {exDone ? (
                                <>
                                  <Check size={14} aria-hidden="true" className="text-[var(--color-success)]" />
                                  <span className="sr-only">Done: </span>
                                </>
                              ) : null}
                              Exercise
                            </Link>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                  {mod.quiz ? (
                    <li className="row flex-wrap border-l-[3px] border-l-transparent">
                      <Link
                        href={`/university/${course.id}/quizzes/${mod.quiz}`}
                        className="-my-2 flex min-h-[44px] min-w-0 flex-1 basis-full items-center gap-3 sm:basis-0 text-[1.0625rem] font-medium leading-snug text-[var(--color-text)] hover:text-[var(--color-accent)]"
                      >
                        <span className="flex w-6 shrink-0 justify-center text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
                          {quizPassed ? (
                            <>
                              <Check size={16} aria-hidden="true" className="text-[var(--color-success)]" />
                              <span className="sr-only">Passed: </span>
                            </>
                          ) : (
                            <span aria-hidden="true">?</span>
                          )}
                        </span>
                        <span className="min-w-0">Module {mod.number} quiz</span>
                      </Link>
                      <span className="flex shrink-0 items-center pl-9 sm:pl-0">
                        {quizBest !== undefined ? (
                          <Chip tone={quizPassed ? "success" : "warning"}>{quizPassed ? `Passed · ${quizBest}%` : `Best ${quizBest}%`}</Chip>
                        ) : (
                          <Chip tone="info">Quiz</Chip>
                        )}
                      </span>
                    </li>
                  ) : null}
                </ol>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
