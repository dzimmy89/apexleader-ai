"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarPicker } from "@/components/coaching/CalendarPicker";

const NOTICE_MS = 24 * 60 * 60 * 1000;

/**
 * Moves one booked session to a new time, at least 24 hours before it
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
  const [open, setOpen] = useState(false);
  // Read once when the panel renders; a page left open past the cutoff still gets a clear server error.
  const [tooLate] = useState(() => Date.parse(scheduledAt) - Date.now() < NOTICE_MS);

  if (tooLate) {
    return (
      <a
        href={`mailto:${coachEmail}?subject=Reschedule%20my%20coaching%20session`}
        className={compact ? "text-[var(--color-accent)] underline underline-offset-4" : "btn btn-ghost"}
      >
        {compact ? "Email David to move it" : "Less than 24 hours away? Email David"}
      </a>
    );
  }
  if (!open) {
    return (
      <button
        type="button"
        className={compact ? "text-[var(--color-accent)] underline underline-offset-4" : "btn btn-secondary"}
        onClick={() => setOpen(true)}
      >
        Reschedule
      </button>
    );
  }
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
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
        Keep the current time
      </button>
    </div>
  );
}
