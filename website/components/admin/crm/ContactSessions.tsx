"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ContactSession } from "@/lib/crm/contact-detail";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

const SOURCE_LABEL: Record<string, string> = {
  portal: "Booked in portal",
  calendar: "From your calendar",
};

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The client's sessions on their contact page, with quick status changes. */
export function ContactSessions({
  sessions,
  sessionsRemaining,
  sessionsTotal,
  onChanged,
}: {
  sessions: ContactSession[];
  sessionsRemaining: number | null;
  sessionsTotal: number | null;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const now = Date.now();
  const upcoming = sessions.filter((s) => s.status === "scheduled" && Date.parse(s.scheduledAt) >= now).reverse();
  const past = sessions.filter((s) => !upcoming.includes(s));

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/coaching/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) toast.error("Could not update the session");
      else onChanged();
    } finally {
      setBusy(null);
    }
  }

  function row(s: ContactSession) {
    return (
      <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
        <span className="min-w-0">
          <span className="block">{when(s.scheduledAt)} · {s.durationMins} min</span>
          <span className="block text-xs text-[var(--color-text-muted)]">
            {[SOURCE_LABEL[s.source] || "Added by hand", s.recordingFileId ? "recording in their account" : "", s.lateCancel ? "late cancel, counted" : ""]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs",
              s.status === "completed" && "text-[var(--color-skool)]",
              s.status === "scheduled" && "text-[var(--color-coaching)]",
              (s.status === "cancelled" || s.status === "no-show") && "text-red-400"
            )}
          >
            {STATUS_LABEL[s.status] || s.status}
          </span>
          {s.status === "completed" ? (
            <Button size="xs" variant="outline" disabled={busy === s.id} onClick={() => void patch(s.id, { status: "no-show" })}>
              No-show
            </Button>
          ) : null}
          <Button size="xs" variant="ghost" disabled={busy === s.id} onClick={() => void patch(s.id, { ignored: true })}>
            Not a session
          </Button>
        </span>
      </li>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">
        {sessionsTotal
          ? `${sessionsRemaining ?? 0} of ${sessionsTotal} sessions left. `
          : ""}
        Sessions come from your Google Calendar (any event with this client as a guest) and from the client portal.
        Booked and completed sessions count; cancellations count only when made less than 24 hours ahead.
      </p>
      <div>
        <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Upcoming</h3>
        {upcoming.length ? (
          <ul className="divide-y divide-[var(--color-border-muted)]">{upcoming.map(row)}</ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Nothing booked.</p>
        )}
      </div>
      <div>
        <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Past</h3>
        {past.length ? (
          <ul className="divide-y divide-[var(--color-border-muted)]">{past.map(row)}</ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">No past sessions.</p>
        )}
      </div>
      <Button size="sm" variant="outline" render={<Link href="/admin/coaching/sessions" />}>
        Notes and all sessions
      </Button>
    </div>
  );
}
