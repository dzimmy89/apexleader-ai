import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ExerciseGate } from "@/components/learn/ExerciseGate";
import { LessonBody } from "@/components/learn/LessonBody";
import { LessonStrip } from "@/components/learn/LessonStrip";
import { MarkComplete } from "@/components/learn/MarkComplete";
import { PaidStep } from "@/components/learn/PaidStep";
import { PieceLayout } from "@/components/learn/PieceLayout";
import { RelatedLessons, relatedLessons } from "@/components/learn/RelatedLessons";
import { findLesson, getCourse, lessonByLegacySlug, lessonKey } from "@/lib/learn/catalog";
import { lessonBody, lessonSections } from "@/lib/learn/blocks";
import { readPiece } from "@/lib/learn/content";
import { canPlayClips, courseLock, exerciseLock, getViewer } from "@/lib/learn/gate";
import { getProgress, recordVisit } from "@/lib/learn/progress";
import { withSignedLearnVideos, withoutLearnVideoSlots } from "@/lib/learn/video-urls";

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

  // Every lesson is open to read. The course lock decides quizzes, progress
  // and coached notes; the exercise lock decides the exercise and the clips.
  const viewer = await getViewer();
  const lock = courseLock(course, viewer);
  const exLock = exerciseLock(course, viewer);
  const isClient = !!viewer.access?.isCoachingClient;
  const href = `/university/${course.id}/lessons/${lesson.slug}`;
  const progress = viewer.email ? await getProgress(viewer.email).catch(() => null) : null;
  const done = lock === "open" && !!progress?.lessons[lessonKey(course.id, lesson.slug)];
  if (lock === "open" && viewer.email) {
    await recordVisit(viewer.email, href, `${course.title}: ${lesson.title}`).catch(() => undefined);
  }

  // Clips play once the exercises are open; the text is there for everyone.
  const shown = canPlayClips(course, viewer) ? await withSignedLearnVideos(body) : withoutLearnVideoSlots(body);

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
      exercisesOpen={exLock === "open"}
      sections={lessonSections(body)}
      eyebrow={`Module ${moduleOf.number} · Lesson ${lesson.number}`}
      title={lesson.title}
      minutes={lesson.minutes}
      prev={prev ? { href: `/university/${course.id}/lessons/${prev.slug}`, label: prev.title } : null}
      next={nextLink}
      // Once the lesson is complete, moving on is the main thing to do.
      nextIsPrimary={done}
      above={lock === "open" ? null : <LessonStrip course={course} lessonNumber={lesson.number} />}
    >
      <LessonBody body={shown} />
      {lock === "open" && viewer.email ? (
        <div className="mt-12">
          <MarkComplete courseId={course.id} slug={lesson.slug} kind="lesson" initiallyDone={done} />
        </div>
      ) : null}
      {exLock === "gate" && lesson.exercise ? (
        <ExerciseGate
          courseId={course.id}
          lessonSlug={lesson.slug}
          exerciseHref={`/university/${course.id}/exercises/${lesson.exercise}`}
          exerciseMinutes={lesson.exerciseMinutes}
          lessonNumber={lesson.number}
          headline="Now do it in your business."
          perks={[
            `Every exercise in ${course.title}, open as you go`,
            "New lessons by email as they land, unsubscribe anytime",
            "A text when your exercise is ready, only if you tick the box",
          ]}
          signInHref={`/login?next=${encodeURIComponent(href)}`}
        />
      ) : null}
      {isClient ? null : (
        <>
          <PaidStep courseTitle={course.title} />
          <RelatedLessons items={relatedLessons(course, lesson)} />
        </>
      )}
    </PieceLayout>
  );
}
