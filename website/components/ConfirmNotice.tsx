"use client";

import { useEffect, useState } from "react";

type Notice = "confirmed" | "expired" | "unknown";

const COPY: Record<Notice, string> = {
  confirmed: "Email confirmed. Your exercise is open on this device too.",
  expired: "That confirm link has expired. Open any lesson's exercise with your email and a fresh one is sent.",
  unknown: "We couldn't confirm that email. Open any lesson's exercise with your email and a fresh link is sent.",
};

/**
 * A one-line notice after the "Confirm my email" click (?confirmed=1 or
 * ?confirm=expired|unknown). Removes the query so a reload or share doesn't
 * repeat it.
 */
export function ConfirmNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const value: Notice | null = url.searchParams.get("confirmed") === "1"
      ? "confirmed"
      : url.searchParams.get("confirm") === "expired"
        ? "expired"
        : url.searchParams.get("confirm") === "unknown"
          ? "unknown"
          : null;
    if (!value) return;
    setNotice(value);
    url.searchParams.delete("confirmed");
    url.searchParams.delete("confirm");
    window.history.replaceState(null, "", url.pathname + (url.search || "") + url.hash);
  }, []);
  if (!notice) return null;
  return (
    <div
      role="status"
      className={`border-b px-4 py-3 text-center font-[family-name:var(--font-ui)] text-[length:var(--text-small)] ${
        notice === "confirmed"
          ? "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text)]"
          : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-muted)]"
      }`}
    >
      {COPY[notice]}
      <button type="button" onClick={() => setNotice(null)} className="ml-3 underline underline-offset-2" aria-label="Dismiss">
        OK
      </button>
    </div>
  );
}
