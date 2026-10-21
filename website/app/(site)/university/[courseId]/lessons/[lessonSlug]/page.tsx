import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { LessonBody } from "@/components/learn/LessonBody";
import { LockedNotice } from "@/components/learn/LockedNotice";
import { MarkComplete } from "@/components/learn/MarkComplete";
import { PieceLayout } from "@/components/learn/PieceLayout";
import { findLesson, getCourse, lessonByLegacySlug, lessonKey } from "@/lib/learn/catalog";
import { lessonBody, lessonSections, previewBody } from "@/lib/learn/blocks";
import { readPiece } from "@/lib/learn/content";
import { courseLock, getViewer } from "@/lib/learn/gate";
import { getProgress, recordVisit } from "@/lib/learn/progress";

interface PageProps {
  params: Promise<{ courseId: string; lessonSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId, lessonSlug } = await params;
  const course = getCourse(courseId);
  const found = course ? findLesson(course, lessonSlug) : null;
  if (!course || !found) return { title: "Lesson" };
  return {
    title: `${found.lesson.title} | ${course.title}`,
    description: `Lesson ${found.lesson.number} of ${course.title}.`,
    alternates: { canonical: `/university/${course.id}/lessons/${lessonSlug}` },
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonSlug } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();
  const found = findLesson(course, lessonSlug);
  if (!found) {
    const legacy = lessonByLegacySlug(course, lessonSlug);
    permanentRedirect(legacy ? `/university/${course.id}/lessons/${legacy.slug}` : `/university/${course.id}`);
  }
  const { lesson, prev, next } = found;
  const raw = readPiece(course.id, "lessons", lesson.slug);
  if (!raw) notFound();
  const { body } = lessonBody(raw);

  const viewer = await getViewer();
  const lock = courseLock(course, viewer);
  const href = `/university/${course.id}/lessons/${lesson.slug}`;
  const progress = viewer.email ? await getProgress(viewer.email).catch(() => null) : null;
  const done = lock === "open" && !!progress?.lessons[lessonKey(course.id, lesson.slug)];
  if (lock === "open" && viewer.email) {
    await recordVisit(viewer.email, href, `${course.title}: ${lesson.title}`).catch(() => undefined);
  }

  const moduleOf = course.modules.find((m) => m.lessons.some((l) => l.slug === lesson.slug))!;
  const lastInModule = moduleOf.lessons.at(-1)?.slug === lesson.slug;
  const nextLink = lesson.exercise
    ? { href: `/university/${course.id}/exercises/${lesson.exercise}`, label: `Exercise ${lesson.number}` }
    : lastInModule && moduleOf.quiz
      ? { href: `/university/${course.id}/quizzes/${moduleOf.quiz}`, label: `Module ${moduleOf.number} quiz` }
      : next
        ? { href: `/university/${course.id}/lessons/${next.slug}`, label: next.title }
        : null;

  return (
    <PieceLayout
      course={course}
      current={{ kind: "lesson", slug: lesson.slug }}
      progress={progress}
      lock={lock}
      sections={lessonSections(body)}
      lockedFrom={lock === "open" ? undefined : 1}
      eyebrow={`Module ${moduleOf.number} · Lesson ${lesson.number}`}
      title={lesson.title}
      minutes={lesson.minutes}
      prev={prev ? { href: `/university/${course.id}/lessons/${prev.slug}`, label: prev.title } : null}
      next={lock === "open" ? nextLink : null}
      // Once the lesson is complete, moving on is the main thing to do.
      nextIsPrimary={done}
    >
      <LessonBody body={lock === "open" ? body : previewBody(body)} />
      {lock === "open" ? (
        viewer.email ? (
          <div className="mt-12">
            <MarkComplete courseId={course.id} slug={lesson.slug} kind="lesson" initiallyDone={done} />
          </div>
        ) : null
      ) : (
        <LockedNotice lock={lock} next={href} />
      )}
    </PieceLayout>
  );
}
