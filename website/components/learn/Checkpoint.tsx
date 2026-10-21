"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import type { CheckpointQuestion } from "@/lib/learn/blocks";
import { cn } from "@/lib/utils";

/** "Check yourself" questions inside a lesson: pick an answer, see why. */
export function Checkpoint({ questions }: { questions: CheckpointQuestion[] }) {
  return (
    <section className="panel ui-surface my-10" aria-label="Check yourself">
      <header className="panel-head">
        <p className="panel-title">Check yourself</p>
      </header>
      <div className="panel-body space-y-8">
        {questions.map((q, i) => (
          <CheckpointItem key={i} q={q} />
        ))}
      </div>
    </section>
  );
}

function CheckpointItem({ q }: { q: CheckpointQuestion }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const right = answered && q.options[picked]!.correct;
  return (
    <div>
      <p className="mb-4 font-[family-name:var(--font-body)] text-[length:var(--text-body)] leading-[1.6] text-[var(--color-text)]">{q.question}</p>
      <ul className="space-y-2">
        {q.options.map((opt, i) => {
          const isPicked = i === picked;
          const state = !answered
            ? "border-[var(--color-border-strong)] text-[var(--color-text)] enabled:hover:border-[var(--color-accent)] enabled:hover:bg-[var(--color-accent-subtle)]"
            : opt.correct
              ? "border-[var(--color-success)] bg-[var(--color-success-subtle)] text-[var(--color-text)]"
              : isPicked
                ? "border-[var(--color-danger)] bg-[var(--color-danger-subtle)] text-[var(--color-text)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)]";
          return (
            <li key={i}>
              <button
                type="button"
                disabled={answered}
                onClick={() => setPicked(i)}
                className={cn(
                  "flex min-h-[48px] w-full items-center gap-3 border px-4 py-2 text-left text-[length:var(--text-ui)] leading-snug transition-colors disabled:cursor-default",
                  state
                )}
              >
                <span className="min-w-0 flex-1">{opt.text}</span>
                {answered && opt.correct ? <Check size={18} aria-hidden="true" className="shrink-0 text-[var(--color-success)]" /> : null}
                {answered && isPicked && !opt.correct ? <X size={18} aria-hidden="true" className="shrink-0 text-[var(--color-danger)]" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {answered ? (
        <div role="status" className={cn("notice mt-4", right ? "notice-success" : "notice-danger")}>
          <div className="min-w-0">
            <span className="block font-semibold">{right ? "Right." : "Not quite."}</span>
            <span className="block">{q.why}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
