import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonBody } from "@/components/learn/LessonBody";
import { LessonMarkdown } from "@/components/learn/LessonMarkdown";
import { LockedNotice } from "@/components/learn/LockedNotice";
import { MarkComplete } from "@/components/learn/MarkComplete";
import { PieceLayout } from "@/components/learn/PieceLayout";
import { Panel } from "@/components/system";
import { exerciseKey, findLesson, findLessonByExercise, getCourse } from "@/lib/learn/catalog";
import { lessonBody, lessonSections, previewBody } from "@/lib/learn/blocks";
import { readPiece } from "@/lib/learn/content";
import { courseLock, getViewer } from "@/lib/learn/gate";
import { getProgress } from "@/lib/learn/progress";

interface PageProps {
  params: Promise<{ courseId: string; exerciseSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId, exerciseSlug } = await params;
  const course = getCourse(courseId);
  const lesson = course ? findLessonByExercise(course, exerciseSlug) : null;
  if (!course || !lesson) return { title: "Exercise" };
  return { title: `Exercise ${lesson.number}: ${lesson.title} | ${course.title}`, robots: { index: false } };
}

interface ExerciseBrief {
  /** What the exercise asks for, from the opening :::key-concept block. */
  summary: string | null;
  /** "Time", "You'll need", "Builds on" and the like, from the bold meta line. */
  facts: { label: string; value: string }[];
  /** The body with the summary and meta line removed, so they are not shown twice. */
  rest: string;
}

/**
 * Every exercise opens with a key-concept block saying what you will do and a
 * line like "**Time:** 15 min · **You'll need:** a calculator". Lift both into
 * the "Your task" panel; when a file is shaped differently, show it as it is.
 */
function exerciseBrief(body: string): ExerciseBrief {
  let rest = body.replace(/^\s+/, "");
  let summary: string | null = null;
  const callout = rest.match(/^:::key-concept[ \t]*\n([\s\S]*?)\n:::[ \t]*\n?/);
  if (callout) {
    summary = callout[1]!.trim();
    rest = rest.slice(callout[0].length).replace(/^\s+/, "");
  }
  const facts: { label: string; value: string }[] = [];
  const meta = rest.match(/^\*\*[^*\n]+:\*\*[^\n]*\n?/);
  if (meta) {
    for (const part of meta[0].trim().split(/\s+·\s+/)) {
      const m = part.match(/^\*\*([^*]+?):\*\*\s*(.*)$/);
      if (m) facts.push({ label: m[1]!.trim(), value: m[2]!.trim() });
    }
    if (facts.length) rest = rest.slice(meta[0].length).replace(/^\s+/, "");
  }
  return { summary, facts, rest };
}

export default async function ExercisePage({ params }: PageProps) {
  const { courseId, exerciseSlug } = await params;
  const course = getCourse(courseId);
  const lesson = course ? findLessonByExercise(course, exerciseSlug) : null;
  if (!course || !lesson) notFound();
  const raw = readPiece(course.id, "exercises", exerciseSlug);
  if (!raw) notFound();
  const { title, body } = lessonBody(raw);
  const brief = exerciseBrief(body);
  const viewer = await getViewer();
  const lock = courseLock(course, viewer);
  const progress = viewer.email ? await getProgress(viewer.email).catch(() => null) : null;
  const done = lock === "open" && !!progress?.exercises[exerciseKey(course.id, exerciseSlug)];
  const nav = findLesson(course, lesson.slug)!;
  const moduleOf = course.modules.find((m) => m.lessons.some((l) => l.slug === lesson.slug))!;
  const lastInModule = moduleOf.lessons.at(-1)?.slug === lesson.slug;
  const next =
    lastInModule && moduleOf.quiz
      ? { href: `/university/${course.id}/quizzes/${moduleOf.quiz}`, label: `Module ${moduleOf.number} quiz` }
      : nav.next
        ? { href: `/university/${course.id}/lessons/${nav.next.slug}`, label: nav.next.title }
        : null;
  const hasBrief = brief.summary !== null || brief.facts.length > 0;
  const facts = brief.facts.length
    ? brief.facts
    : lesson.exerciseMinutes
      ? [{ label: "Time", value: `${lesson.exerciseMinutes} min` }]
      : [];

  return (
    <PieceLayout
      course={course}
      current={{ kind: "exercise", slug: exerciseSlug }}
      progress={progress}
      lock={lock}
      sections={lessonSections(body)}
      lockedFrom={lock === "open" ? undefined : 1}
      eyebrow={`Exercise ${lesson.number}`}
      title={title.replace(/^Exercise \d+:\s*/, "") || lesson.title}
      minutes={lesson.exerciseMinutes}
      prev={{ href: `/university/${course.id}/lessons/${lesson.slug}`, label: `Lesson ${lesson.number}` }}
      next={lock === "open" ? next : null}
      nextIsPrimary={done}
    >
      {hasBrief ? (
        <Panel title="Your task" className="mb-10">
          {brief.summary ? (
            <div className="lesson-prose [&_p]:mb-0 [&_p]:text-[var(--color-text)]">
              <LessonMarkdown text={brief.summary} />
            </div>
          ) : null}
          {facts.length ? (
            <dl className="mt-5 grid gap-x-8 gap-y-3 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] sm:grid-cols-[auto_minmax(0,1fr)]">
              {facts.map((fact) => (
                <div key={fact.label} className="contents">
                  <dt className="ui-label">{fact.label}</dt>
                  <dd className="text-[var(--color-text)]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Panel>
      ) : null}
      <LessonBody
        body={lock === "open" ? brief.rest : previewBody(brief.rest)}
        showCoached={lock === "open" && !!viewer.access?.isCoachingClient}
      />
      {lock === "open" ? (
        viewer.email ? (
          <div className="mt-12">
            <MarkComplete courseId={course.id} slug={exerciseSlug} kind="exercise" initiallyDone={done} />
          </div>
        ) : null
      ) : (
        <LockedNotice lock={lock} next={`/university/${course.id}/exercises/${exerciseSlug}`} />
      )}
    </PieceLayout>
  );
}
