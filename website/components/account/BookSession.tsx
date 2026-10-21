"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarPicker } from "@/components/coaching/CalendarPicker";

/**
 * The signed-in client books one of their coaching sessions. Opens on
 * demand so the sessions panel stays short, and refreshes the page once a
 * booking lands so the new session shows at the top.
 */
export function BookSession({
  packageId,
  durationMins = 60,
  open: openByDefault = false,
}: {
  packageId?: string;
  durationMins?: number;
  open?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(openByDefault);

  if (!open) {
    // Closed by default only when a session is already booked, so "Join" stays
    // the one filled button in the panel and this one is outlined.
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        Book another session
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <CalendarPicker
        packageId={packageId}
        source="account"
        defaultDurationMins={durationMins}
        accountBooking
        surface="dark"
        onBooked={() => router.refresh()}
      />
      {openByDefault ? null : (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Close
        </button>
      )}
    </div>
  );
}
