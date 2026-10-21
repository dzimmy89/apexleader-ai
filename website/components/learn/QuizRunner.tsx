"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Chip, Notice, Stat } from "@/components/system";
import type { QuizQuestion } from "@/lib/learn/blocks";
import { cn } from "@/lib/utils";

export function QuizRunner({
  courseId,
  quizId,
  questions,
  passing,
  bestScore,
  nextHref,
  canSave,
}: {
  courseId: string;
  quizId: string;
  questions: QuizQuestion[];
  passing: number;
  bestScore: number | null;
  nextHref: string;
  canSave: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ correct: number; total: number; score: number; best?: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const answered = questions.filter((q) => answers[String(q.number)]).length;
  const allAnswered = answered === questions.length;
  const graded = result !== null;

  async function submit() {
    const correct = questions.filter((q) => answers[String(q.number)] === q.answer).length;
    const local = { correct, total: questions.length, score: Math.round((correct / Math.max(1, questions.length)) * 100) };
    setResult(local);
    if (!canSave) return;
    setSaving(true);
    const res = await fetch("/api/learn/quiz", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId, quizId, answers }),
    });
    setSaving(false);
    if (res.ok) setResult((await res.json()) as typeof local & { best: number });
  }

  function retake() {
    setAnswers({});
    setResult(null);
  }

  const passed = result ? result.score >= passing : false;

  return (
    <div className="ui-surface space-y-6">
      {bestScore !== null ? (
        <div className="flex flex-wrap items-center gap-3 text-[var(--color-text-muted)]">
          <Chip tone={bestScore >= passing ? "success" : "warning"}>Best score {bestScore}%</Chip>
          <span>{passing}% passes.</span>
        </div>
      ) : null}

      {questions.map((q) => {
        const picked = answers[String(q.number)];
        const gotIt = picked === q.answer;
        const labelId = `quiz-q${q.number}`;
        return (
          <section key={q.number} role="group" aria-labelledby={labelId} className="panel">
            <div className="panel-body">
              <p className="ui-label">
                Question {q.number} of {questions.length}
              </p>
              <p id={labelId} className="mt-2 font-[family-name:var(--font-display)] text-[1.25rem] leading-[1.3] text-[var(--color-text)]">
                {q.question}
              </p>
              <div className="mt-5 space-y-2">
                {q.options.map((opt) => {
                  const selected = picked === opt.letter;
                  const isAnswer = opt.letter === q.answer;
                  const tone = !graded
                    ? selected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-text)]"
                      : "border-[var(--color-border-strong)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                    : isAnswer
                      ? "border-[var(--color-success)] bg-[var(--color-success-subtle)] text-[var(--color-text)]"
                      : selected
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-subtle)] text-[var(--color-text)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)]";
                  return (
                    <label
                      key={opt.letter}
                      className={cn(
                        "flex min-h-[48px] items-center gap-3 border px-4 py-2 leading-snug transition-colors",
                        graded ? "cursor-default" : "cursor-pointer",
                        tone
                      )}
                    >
                      <input
                        type="radio"
                        name={`q${q.number}`}
                        value={opt.letter}
                        disabled={graded}
                        checked={selected}
                        onChange={() => setAnswers((a) => ({ ...a, [String(q.number)]: opt.letter }))}
                        className="checkbox"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold">{opt.letter})</span> {opt.text}
                      </span>
                      {graded && isAnswer ? <Check size={18} aria-hidden="true" className="shrink-0 text-[var(--color-success)]" /> : null}
                    </label>
                  );
                })}
              </div>
              {graded ? (
                <Notice tone={gotIt ? "success" : "danger"} title={gotIt ? "Right." : "Not quite."} className="mt-4">
                  {q.explanation}
                </Notice>
              ) : null}
            </div>
          </section>
        );
      })}

      {result ? (
        <section className="panel-raised" role="status" aria-label="Quiz result">
          <div className="panel-body flex flex-wrap items-center gap-x-8 gap-y-4">
            <Stat value={`${result.score}%`} label={`${result.correct} of ${result.total} right`} />
            <Chip tone={passed ? "success" : "warning"}>{passed ? "Passed" : "Try again"}</Chip>
            <p className="w-full text-[var(--color-text-muted)]">
              {passed ? "Passed." : `${passing}% passes. Review the lessons and try again.`}
              {!canSave ? " Sign in to save your score." : saving ? " Saving." : ""}
            </p>
          </div>
          <div className="panel-foot flex flex-wrap gap-3">
            {/* One main action: move on when passed, retake when not. */}
            <Link href={nextHref} className={cn("btn", passed ? "btn-primary" : "btn-secondary")}>
              Continue
            </Link>
            <button type="button" className={cn("btn", passed ? "btn-secondary" : "btn-primary")} onClick={retake}>
              Try again
            </button>
          </div>
        </section>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" disabled={!allAnswered} onClick={() => void submit()} className="btn btn-primary">
            Check answers
          </button>
          {!allAnswered ? (
            <span className="field-hint">
              {answered} of {questions.length} answered
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
