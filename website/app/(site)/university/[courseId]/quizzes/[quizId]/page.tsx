import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { LockedNotice } from "@/components/learn/LockedNotice";
import { PieceLayout } from "@/components/learn/PieceLayout";
import { QuizRunner } from "@/components/learn/QuizRunner";
import { findModuleByQuiz, getCourse, quizKey, PASSING_QUIZ_SCORE } from "@/lib/learn/catalog";
import { parseQuiz } from "@/lib/learn/blocks";
import { readPiece } from "@/lib/learn/content";
import { courseLock, getViewer } from "@/lib/learn/gate";
import { getProgress } from "@/lib/learn/progress";

interface PageProps {
  params: Promise<{ courseId: string; quizId: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId, quizId } = await params;
  const course = getCourse(courseId);
  const mod = course ? findModuleByQuiz(course, quizId) : null;
  if (!course || !mod) return { title: "Quiz" };
  return { title: `Module ${mod.number} quiz | ${course.title}`, robots: { index: false } };
}

export default async function QuizPage({ params }: PageProps) {
  const { courseId, quizId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();
  const mod = findModuleByQuiz(course, quizId);
  if (!mod) permanentRedirect(`/university/${course.id}`);
  const md = readPiece(course.id, "quizzes", quizId);
  if (!md) notFound();
  const quiz = parseQuiz(md);
  const viewer = await getViewer();
  const lock = courseLock(course, viewer);
  const progress = viewer.email ? await getProgress(viewer.email).catch(() => null) : null;
  const best = lock === "open" ? (progress?.quizzes[quizKey(course.id, quizId)]?.best ?? null) : null;
  const nextModule = course.modules.find((m) => m.number === mod.number + 1);
  const nextHref = nextModule ? `/university/${course.id}/lessons/${nextModule.lessons[0]!.slug}` : `/university/${course.id}`;

  return (
    <PieceLayout
      course={course}
      current={{ kind: "quiz", slug: quizId }}
      progress={progress}
      lock={lock}
      eyebrow={`Module ${mod.number} quiz · ${quiz.questions.length} questions`}
      title={mod.title}
    >
      {quiz.subtitle ? (
        <p className="mb-8 max-w-2xl text-[length:var(--text-lead)] leading-[1.55] text-[var(--color-text-muted)]">{quiz.subtitle}</p>
      ) : null}
      {lock === "open" ? (
        <QuizRunner
          courseId={course.id}
          quizId={quizId}
          questions={quiz.questions}
          passing={PASSING_QUIZ_SCORE}
          bestScore={best}
          nextHref={nextHref}
          canSave={!!viewer.email}
        />
      ) : (
        <LockedNotice lock={lock} next={`/university/${course.id}/quizzes/${quizId}`} />
      )}
    </PieceLayout>
  );
}
