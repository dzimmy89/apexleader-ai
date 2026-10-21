"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** The client ticks off a task in their syllabus. */
export function SyllabusTaskCheck({ itemId, done, title }: { itemId: string; done: boolean; title: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState(done);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  async function toggle(next: boolean) {
    setChecked(next);
    setError(false);
    const res = await fetch("/api/account/syllabus/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, done: next }),
    }).catch(() => null);
    if (!res?.ok) {
      setChecked(!next);
      setError(true);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <span className="inline-flex items-center">
      <label className="-m-3 inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          className="checkbox"
          checked={checked}
          disabled={pending}
          aria-label={`Mark "${title}" done`}
          onChange={(e) => void toggle(e.target.checked)}
        />
      </label>
      {error ? (
        <span className="ml-2 text-[13px] text-[var(--color-danger)]" role="alert">
          Could not save
        </span>
      ) : null}
    </span>
  );
}
