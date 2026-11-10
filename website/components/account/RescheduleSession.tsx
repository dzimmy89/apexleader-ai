"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CalendarPicker } from "@/components/coaching/CalendarPicker";

const NOTICE_MS = 24 * 60 * 60 * 1000;

/**
 * Reschedule or cancel one booked session, at least 24 hours before it
 * starts (the agreement's notice period). Closer than that, the client
 * emails David instead.
 */
export function RescheduleSession({
  sessionId,
  scheduledAt,
  durationMins = 60,
  packageId,
  coachEmail,
  compact = false,
}: {
  sessionId: string;
  scheduledAt: string;
  durationMins?: number;
  packageId?: string;
  coachEmail: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "reschedule" | "confirmCancel" | "cancelling">("idle");
  const [error, setError] = useState("");
  // Read once when the panel renders; a page left open past the cutoff still gets a clear server error.
  const [tooLate] = useState(() => Date.parse(scheduledAt) - Date.now() < NOTICE_MS);

  const link = compact ? "text-[var(--color-accent)] underline underline-offset-4" : "btn btn-secondary";
  const quiet = compact ? "text-[var(--color-accent)] underline underline-offset-4" : "btn btn-ghost";

  if (tooLate) {
    return (
      <a href={`mailto:${coachEmail}?subject=Change%20my%20coaching%20session`} className={quiet}>
        {compact ? "Email David to change it" : "Less than 24 hours away? Email David to change it"}
      </a>
    );
  }

  async function cancel() {
    setMode("cancelling");
    setError("");
    try {
      const res = await fetch(`/api/coaching/sessions/${encodeURIComponent(sessionId)}/cancel`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "We couldn't cancel it. Try again.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't cancel it. Try again.");
      setMode("confirmCancel");
    }
  }

  if (mode === "reschedule") {
    return (
      <div className="mt-4 w-full space-y-3">
        <CalendarPicker
          packageId={packageId}
          source="account"
          defaultDurationMins={durationMins}
          accountBooking
          rescheduleSessionId={sessionId}
          surface="dark"
          onBooked={() => router.refresh()}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode("idle")}>
          Keep the current time
        </button>
      </div>
    );
  }

  if (mode === "confirmCancel" || mode === "cancelling") {
    return (
      <span className={compact ? "inline" : "flex w-full flex-wrap items-center gap-3"}>
        <span>Cancel this session? It won&apos;t count against your package.</span>{" "}
        <button type="button" className={compact ? link : "btn btn-danger btn-sm"} disabled={mode === "cancelling"} onClick={cancel}>
          {mode === "cancelling" ? (
            <>
              <Loader2 size={14} className="inline animate-spin" aria-hidden /> Cancelling…
            </>
          ) : (
            "Yes, cancel it"
          )}
        </button>{" "}
        <button type="button" className={compact ? quiet : "btn btn-ghost btn-sm"} disabled={mode === "cancelling"} onClick={() => setMode("idle")}>
          Keep it
        </button>
        {error ? (
          <span role="alert" className="block w-full text-[var(--color-danger)]">
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <>
      <button type="button" className={link} onClick={() => setMode("reschedule")}>
        Reschedule
      </button>
      {compact ? " · " : null}
      <button type="button" className={quiet} onClick={() => setMode("confirmCancel")}>
        Cancel
      </button>
    </>
  );
}
