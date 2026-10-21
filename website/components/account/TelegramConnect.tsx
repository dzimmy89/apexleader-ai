"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { COACH_TELEGRAM_HANDLE } from "@/lib/account/telegram";

/**
 * Messages: one tap opens a Telegram chat with David. The client can save
 * their own username so David knows who is writing before the first line.
 */
export function TelegramConnect({ deepLink, savedHandle }: { deepLink: string; savedHandle: string | null }) {
  const router = useRouter();
  const [handle, setHandle] = useState(savedHandle ? `@${savedHandle}` : "");
  const [editing, setEditing] = useState(!savedHandle);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError("");
    const res = await fetch("/api/account/telegram", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handle }),
    }).catch(() => null);
    const body = ((await res?.json().catch(() => ({}))) || {}) as { handle?: string; error?: string };
    if (res?.ok && body.handle) {
      setHandle(`@${body.handle}`);
      setEditing(false);
      setState("idle");
      router.refresh();
      return;
    }
    setError(body.error || "Could not save. Try again.");
    setState("error");
  }

  async function forget() {
    setState("saving");
    const res = await fetch("/api/account/telegram", { method: "DELETE" }).catch(() => null);
    setState("idle");
    if (res?.ok) {
      setHandle("");
      setEditing(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <a href={deepLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg btn-wrap max-w-full">
          <Send size={18} aria-hidden /> Message David on Telegram
        </a>
        <span className="text-[15px] text-[var(--color-text-muted)]">
          Opens a chat with{" "}
          <a
            href={`https://t.me/${COACH_TELEGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-mono)] text-[var(--color-text)] underline underline-offset-4"
          >
            @{COACH_TELEGRAM_HANDLE}
          </a>
          . He replies there, usually the same day.
        </span>
      </div>

      {editing ? (
        <form onSubmit={(e) => void save(e)} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="field flex-1">
            <label htmlFor="telegram-handle">Your Telegram username</label>
            <input
              id="telegram-handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@yourname"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="input"
            />
            <p className="field-hint">Optional. Saved to your client record so David knows it is you when you write.</p>
          </div>
          <div className="flex gap-2 sm:pt-[1.625rem]">
            <button type="submit" disabled={state === "saving" || !handle.trim()} className="btn btn-secondary">
              {state === "saving" ? "Saving…" : "Save username"}
            </button>
            {savedHandle ? (
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="row">
          <div className="min-w-0">
            <div className="row-label">
              Connected as <span className="whitespace-nowrap font-[family-name:var(--font-mono)]">{handle}</span>
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="chip chip-success">Saved</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
              Change
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void forget()} disabled={state === "saving"}>
              Remove
            </button>
          </div>
        </div>
      )}
      {state === "error" ? (
        <div className="notice notice-danger" role="alert">
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
