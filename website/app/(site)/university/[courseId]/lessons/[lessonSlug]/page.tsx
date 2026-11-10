import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ExerciseGate, FunnelBeacon, GateBar } from "@/components/learn/ExerciseGate";
import { LessonBody } from "@/components/learn/LessonBody";
import { LessonStrip } from "@/components/learn/LessonStrip";
import { MarkComplete } from "@/components/learn/MarkComplete";
import { PaidStep } from "@/components/learn/PaidStep";
import { PieceLayout } from "@/components/learn/PieceLayout";
import { RelatedLessons, relatedLessons } from "@/components/learn/RelatedLessons";
import { findLesson, getCourse, lessonByLegacySlug, lessonKey } from "@/lib/learn/catalog";
import { lessonBody, lessonSections } from "@/lib/learn/blocks";
import { readPiece } from "@/lib/learn/content";
import { exerciseOffer, lessonDescription, lessonPromise, splitAfterFirstSection } from "@/lib/learn/landing";
import { BRAND } from "@/lib/brand";
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
  const raw = readPiece(course.id, "lessons", found.lesson.slug);
  const description = lessonDescription(raw ? lessonBody(raw).body : "", `Lesson ${found.lesson.number} of ${course.title}.`);
  const title = `${found.lesson.title} | ${course.title}`;
  const path = `/university/${course.id}/lessons/${found.lesson.slug}`;
  // The link card X shows when David sends this lesson: title, the key idea, and the image beside this file.
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", title: found.lesson.title, description, url: path, siteName: BRAND.name },
    twitter: { card: "summary_large_image", title: found.lesson.title, description },
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
  // Visitors from outside (no course access) get the page as a landing page:
  // a promise under the title, an early ask after the first section, and a
  // pinned bar on phones. Everyone with access sees the lesson as before.
  const outsider = lock !== "open";
  const gated = exLock === "gate" && !!lesson.exercise;
  const { head, rest } = gated ? splitAfterFirstSection(shown) : { head: shown, rest: "" };
  const exerciseRaw = lesson.exercise ? readPiece(course.id, "exercises", lesson.exercise) : null;
  const offer = exerciseRaw
    ? exerciseOffer(exerciseRaw, `Exercise ${lesson.number}`)
    : { title: `Exercise ${lesson.number}`, result: null };
  const exerciseHref = lesson.exercise ? `/university/${course.id}/exercises/${lesson.exercise}` : href;
  const gateProps = {
    courseId: course.id,
    lessonSlug: lesson.slug,
    exerciseHref,
    exerciseMinutes: lesson.exerciseMinutes,
    lessonNumber: lesson.number,
    offerTitle: offer.title,
    offerResult: offer.result,
    signInHref: `/login?next=${encodeURIComponent(href)}`,
  };

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
      above={outsider ? <LessonStrip course={course} lessonNumber={lesson.number} /> : null}
      promise={outsider ? lessonPromise(body, lesson.minutes) : null}
      hideBreadcrumbOnPhone={outsider}
    >
      <FunnelBeacon step="lesson_view" courseId={course.id} lessonSlug={lesson.slug} />
      <LessonBody body={head} />
      {gated && rest ? (
        <>
          <ExerciseGate variant="early" {...gateProps} />
          <LessonBody body={rest} />
        </>
      ) : null}
      {lock === "open" && viewer.email ? (
        <div className="mt-12">
          <MarkComplete courseId={course.id} slug={lesson.slug} kind="lesson" initiallyDone={done} />
        </div>
      ) : null}
      {gated ? (
        <ExerciseGate
          variant="full"
          {...gateProps}
          perks={[
            `Every exercise in ${course.title}, open as you go`,
            "New lessons on this topic by email, unsubscribe anytime",
            "Texts only if you tick the box",
          ]}
        />
      ) : null}
      {gated ? <GateBar label={`Exercise ${lesson.number} · ${lesson.exerciseMinutes ? `${lesson.exerciseMinutes} min · ` : ""}free`} /> : null}
      {isClient ? null : (
        <>
          <PaidStep courseTitle={course.title} />
          <RelatedLessons items={relatedLessons(course, lesson)} />
        </>
      )}
    </PieceLayout>
  );
}
