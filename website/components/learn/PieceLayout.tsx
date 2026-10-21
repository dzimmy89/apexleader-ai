import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/system";
import type { LearnCourse } from "@/lib/learn/catalog";
import type { LessonSection } from "@/lib/learn/blocks";
import type { CourseLock } from "@/lib/learn/gate";
import type { LearnProgress } from "@/lib/learn/progress";
import { CourseOutline, type OutlineCurrent } from "./CourseOutline";
import { LessonMobileBar, OutlineScroller } from "./LessonPanels";
import { OnThisPage } from "./OnThisPage";

/**
 * Shell shared by lesson, exercise and quiz pages: the course outline on the
 * left, the piece in the middle, and its sections on the right. Below lg both
 * side panels fold into a sticky bar; between lg and xl the sections sit in a
 * box above the piece.
 */
export function PieceLayout({
  course,
  current,
  progress,
  lock,
  sections = [],
  lockedFrom,
  eyebrow,
  title,
  minutes,
  children,
  prev,
  next,
  nextIsPrimary = false,
}: {
  course: LearnCourse;
  current: OutlineCurrent;
  progress: LearnProgress | null;
  lock: CourseLock;
  sections?: LessonSection[];
  /** Sections from this index on are not in the locked preview. */
  lockedFrom?: number;
  eyebrow: string;
  title: string;
  minutes?: number;
  children: React.ReactNode;
  prev?: { href: string; label: string } | null;
  next?: { href: string; label: string } | null;
  /** The piece is already complete, so "next" is the main action instead of "Mark complete". */
  nextIsPrimary?: boolean;
}) {
  const outline = <CourseOutline course={course} current={current} progress={progress} lock={lock} />;
  const hasSections = sections.length > 0;

  return (
    <section className="px-6 pb-[var(--space-section)] pt-6 lg:pt-10">
      <a
        href="#lesson-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-[var(--color-bg)] focus:p-3 focus:text-[var(--color-accent)]"
      >
        Skip to lesson
      </a>
      <div
        // The right rail keeps its column even when a piece has no sections, so the
        // text column sits in the same place on lessons, exercises and quizzes.
        className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_220px]"
      >
        <aside className="hidden lg:block">
          <OutlineScroller className="no-scrollbar lesson-panel sticky overflow-y-auto pr-2">
            <div className="panel ui-surface">{outline}</div>
          </OutlineScroller>
        </aside>

        <div className="min-w-0">
          <LessonMobileBar outline={outline} sections={sections} lockedFrom={lockedFrom} />
          <div id="lesson-content" className="mx-auto max-w-3xl scroll-mt-[calc(var(--site-header-h)+4rem)]">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/university" className="inline-flex min-h-[44px] items-center hover:text-[var(--color-accent)]">
                    University
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="min-w-0">
                  <Link
                    href={`/university/${course.id}`}
                    className="inline-flex min-h-[44px] items-center font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
                  >
                    {course.title}
                  </Link>
                </li>
              </ol>
            </nav>
            <header>
              <p className="section-eyebrow">{eyebrow}</p>
              <h1 className="mt-3 text-[2.125rem] leading-[1.08] md:text-[3rem]">{title}</h1>
              {minutes ? (
                <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                  About {minutes} min
                </p>
              ) : null}
            </header>
            <div className="mt-10">
              {hasSections ? (
                <div className="hidden lg:block xl:hidden">
                  <OnThisPage sections={sections} lockedFrom={lockedFrom} variant="inline" />
                </div>
              ) : null}
              {children}
            </div>
            {prev || next ? (
              <nav
                className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)]"
                aria-label="Lesson navigation"
              >
                {prev ? (
                  <Link
                    href={prev.href}
                    className="inline-flex min-h-[44px] max-w-[45%] items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                  >
                    <ArrowLeft size={16} aria-hidden="true" className="shrink-0" />
                    <span className="min-w-0">{prev.label}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <ButtonLink href={next.href} tone={nextIsPrimary ? "primary" : "secondary"} className="max-w-full whitespace-normal text-left">
                    <span className="min-w-0">{next.label}</span>
                    <ArrowRight size={16} aria-hidden="true" className="shrink-0" />
                  </ButtonLink>
                ) : null}
              </nav>
            ) : null}
          </div>
        </div>

        {hasSections ? (
          <aside className="hidden xl:block">
            <div className="no-scrollbar lesson-panel sticky overflow-y-auto">
              <OnThisPage sections={sections} lockedFrom={lockedFrom} variant="panel" />
            </div>
          </aside>
        ) : (
          <aside className="hidden xl:block" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
