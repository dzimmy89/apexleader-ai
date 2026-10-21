"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function MarkComplete({
  courseId,
  slug,
  kind,
  initiallyDone,
}: {
  courseId: string;
  slug: string;
  kind: "lesson" | "exercise";
  initiallyDone: boolean;
}) {
  const [done, setDone] = useState(initiallyDone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function toggle() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/learn/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId, slug, kind, done: !done }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save. Try again.");
      return;
    }
    setDone(!done);
    router.refresh();
  }

  const noun = kind === "lesson" ? "Lesson" : "Exercise";

  return (
    <div className="flex flex-wrap items-center gap-4 font-[family-name:var(--font-ui)]">
      {/* Once done, the button steps back so "next" can be the main action. */}
      <button type="button" onClick={() => void toggle()} disabled={saving} className={cn("btn", done ? "btn-secondary" : "btn-primary")}>
        {done ? (
          <>
            <Check size={18} aria-hidden="true" className="text-[var(--color-success)]" />
            {noun} complete
          </>
        ) : (
          `Mark ${kind} complete`
        )}
      </button>
      {error ? (
        <span role="alert" className="text-[length:var(--text-small)] text-[var(--color-danger)]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
