"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** The emails on this account, and a form to add one (confirmed by email). */
export function LinkedEmails({ primary, linked }: { primary: string; linked: string[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/account/link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    const body = ((await res?.json().catch(() => ({}))) || {}) as { error?: string };
    if (res?.ok) {
      setMessage(`We sent a confirmation link to ${email}. Open it from that inbox to add the email.`);
      setState("sent");
      setEmail("");
      return;
    }
    setMessage(body.error || "Something went wrong. Try again.");
    setState("error");
  }

  async function remove(alias: string) {
    if (!window.confirm(`Remove ${alias} from this account?`)) return;
    const res = await fetch("/api/account/link", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: alias }),
    }).catch(() => null);
    if (res?.ok) {
      router.refresh();
      return;
    }
    const body = ((await res?.json().catch(() => ({}))) || {}) as { error?: string };
    setMessage(body.error || `Could not remove ${alias}. Try again.`);
    setState("error");
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="row">
          <div className="min-w-0">
            <div className="row-label">{primary}</div>
          </div>
          <span className="chip chip-success">Signed in</span>
        </div>
        {linked.map((alias) => (
          <div key={alias} className="row">
            <div className="min-w-0">
              <div className="row-label">{alias}</div>
            </div>
            <button type="button" onClick={() => void remove(alias)} className="btn btn-ghost btn-sm">
              Remove
            </button>
          </div>
        ))}
      </div>
      <p className="text-[15px] text-[var(--color-text-muted)]">
        Paid for coaching with a different email? Add it here and everything shows on this account.
        Signing in with any of these emails opens the same account.
      </p>
      <form onSubmit={(e) => void add(e)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="field flex-1">
          <label htmlFor="link-email">Email to add</label>
          <input
            id="link-email"
            type="email"
            required
            placeholder="another@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="input"
          />
        </div>
        <button type="submit" disabled={state === "sending"} className="btn btn-secondary">
          {state === "sending" ? "Sending…" : "Add email"}
        </button>
      </form>
      {state === "sent" ? (
        <div className="notice notice-success" role="status">
          <span>{message}</span>
        </div>
      ) : state === "error" ? (
        <div className="notice notice-danger" role="alert">
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}
