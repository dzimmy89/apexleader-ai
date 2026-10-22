"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Check, Calendar, ExternalLink, Loader2, Video } from "lucide-react";
import Link from "next/link";
import {
  COACH_TIMEZONE,
  COMMON_TIMEZONES,
  formatTimezoneLabel,
  getDiscoveryPrepUrl,
} from "@/lib/coaching/discovery-shared";
import { cn } from "@/lib/utils";

interface Slot {
  start: string;
  end: string;
}

export interface CalendarPickerPackageContext {
  id: string;
  name: string;
  tagline: string;
  priceDisplay: string;
  durationWeeks: number;
  sessionCount: number;
  bestFor?: string;
}

export interface BookedSession {
  startTime: string;
  durationMins: number;
  meetUrl?: string;
}

interface CalendarPickerProps {
  packageId?: string;
  packageContext?: CalendarPickerPackageContext | null;
  source?: string;
  defaultDurationMins?: number;
  /** Override calendar event title (e.g. client portal sessions). */
  eventTitle?: string;
  defaultName?: string;
  defaultEmail?: string;
  applicationId?: string;
  /**
   * A signed-in coaching client booking one of their sessions from /account.
   * The account cookie identifies them, so name and email are not asked.
   */
  accountBooking?: boolean;
  /** Called once a booking is confirmed (the account page refreshes its session list). */
  onBooked?: (booking: BookedSession) => void;
  /** Parchment (the default, for /coaching/book) or the charcoal panel on /account. */
  surface?: "parchment" | "dark";
}

type Status = "idle" | "loading-slots" | "submitting" | "booked" | "error";
type ViewStatus = "form" | "success";

const DAYS_AHEAD = 28;

function formatDateLabel(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTimeLabel(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return COACH_TIMEZONE;
  }
}

function durationLabel(mins: number): string {
  if (mins % 60 === 0) return mins === 60 ? "1 hour" : `${mins / 60} hours`;
  return `${mins} minutes`;
}

export function CalendarPicker({
  packageId,
  packageContext,
  source = "coaching_book",
  defaultDurationMins = 30,
  eventTitle,
  defaultName,
  defaultEmail,
  applicationId,
  accountBooking = false,
  onBooked,
  surface = "parchment",
}: CalendarPickerProps) {
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [viewerTimezone, setViewerTimezone] = useState(COACH_TIMEZONE);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [view, setView] = useState<ViewStatus>("form");
  const [confirmation, setConfirmation] = useState<{ meetUrl?: string; at?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const parchment = surface === "parchment";

  useEffect(() => {
    setViewerTimezone(detectTimezone());
  }, []);

  const timezoneOptions = useMemo(() => {
    const local = detectTimezone();
    const set = new Set<string>([local, ...COMMON_TIMEZONES]);
    return Array.from(set);
  }, []);

  const prepUrl = getDiscoveryPrepUrl(packageId);

  const dayStrip: Date[] = useMemo(
    () => Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(startOfDay(new Date()), i + 1)),
    []
  );

  const loadSlots = useCallback(
    async (day: Date) => {
      setStatus("loading-slots");
      setErrorMsg("");
      setSelectedSlot(null);
      const start = startOfDay(day);
      const end = addDays(start, 1);
      try {
        const res = await fetch(
          `/api/coaching/calendar?start=${start.toISOString()}&end=${end.toISOString()}&duration=${defaultDurationMins}`
        );
        const data = (await res.json()) as { slots?: Slot[]; error?: string };
        if (!res.ok) {
          throw new Error(
            data.error ||
              (res.status === 503
                ? "Scheduling is temporarily unavailable. Please try again later."
                : "Failed to load availability")
          );
        }
        setSlots(data.slots || []);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Unknown error");
        setSlots([]);
      } finally {
        setStatus("idle");
      }
    },
    [defaultDurationMins]
  );

  useEffect(() => {
    if (selectedDate) {
      void loadSlots(selectedDate);
    }
  }, [selectedDate, loadSlots]);

  const canBook = Boolean(selectedSlot) && (accountBooking || Boolean(email));

  async function handleBook() {
    if (!selectedSlot || !canBook) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = accountBooking
        ? await fetch("/api/coaching/sessions/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startTime: selectedSlot.start,
              durationMins: defaultDurationMins,
              timezone: viewerTimezone,
            }),
          })
        : await fetch("/api/coaching/calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startTime: selectedSlot.start,
              email,
              name,
              packageId,
              source,
              durationMins: defaultDurationMins,
              timezone: viewerTimezone,
              title: eventTitle,
              applicationId,
            }),
          });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
        if (res.status === 409 && selectedDate) {
          // Someone else, or a new event on David's calendar, took the time:
          // reload the day so it disappears, then show why.
          await loadSlots(selectedDate);
        }
        throw new Error(body.error || "Booking failed");
      }
      const data = (await res.json()) as { meetUrl?: string };
      setConfirmation({ meetUrl: data.meetUrl, at: selectedSlot.start });
      setView("success");
      onBooked?.({ startTime: selectedSlot.start, durationMins: defaultDurationMins, meetUrl: data.meetUrl });
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  const shell = cn("ui-surface p-6 md:p-8", parchment ? "parchment-card" : "panel");
  const muted = parchment ? "text-muted-on-parchment" : "text-[var(--color-text-muted)]";
  const optionBase = cn(
    "min-h-[48px] border px-2 text-center font-[family-name:var(--font-ui)] text-[15px] font-medium transition-colors",
    parchment
      ? "border-[var(--color-border-on-parchment)] text-on-parchment hover:border-[var(--color-coaching-ink)]"
      : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
  );
  const optionActive = parchment
    ? "border-[var(--color-coaching-ink)] bg-[var(--color-coaching-subtle)]"
    : "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]";

  if (view === "success" && confirmation) {
    const coachTime =
      confirmation.at &&
      `${formatDateLabel(confirmation.at, COACH_TIMEZONE)} at ${formatTimeLabel(confirmation.at, COACH_TIMEZONE)} ET`;

    return (
      <div className={shell} role="status">
        <span className={cn("chip chip-success")}>
          <Check size={14} aria-hidden /> Booked
        </span>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight">
          {accountBooking ? "Your session is booked." : "Your discovery call is booked."}
        </h3>
        {packageContext && !accountBooking && (
          <p className={cn("mt-2", muted)}>
            Discovery call for <strong>{packageContext.name}</strong>
          </p>
        )}
        <p className="mt-4 text-[17px]">
          <Calendar size={18} className="mr-2 inline-block align-[-3px] text-[var(--color-accent)]" aria-hidden />
          {confirmation.at &&
            `${formatDateLabel(confirmation.at, viewerTimezone)} at ${formatTimeLabel(confirmation.at, viewerTimezone)}`}
          {viewerTimezone !== COACH_TIMEZONE && coachTime ? (
            <span className={cn("block pl-7 text-[14px]", muted)}>{coachTime}</span>
          ) : null}
        </p>
        <p className={cn("mt-3", muted)}>
          A calendar invite with the Google Meet link is on its way to <strong>{email || "your inbox"}</strong>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {confirmation.meetUrl ? (
            <a href={confirmation.meetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <Video size={18} aria-hidden /> Join on Google Meet
            </a>
          ) : null}
          {accountBooking ? null : (
            <Link href={prepUrl} className="btn btn-secondary">
              <ExternalLink size={16} aria-hidden /> What to prepare
            </Link>
          )}
        </div>
        <p className={cn("mt-6 text-[14px]", muted)}>
          Need to reschedule? Reply to your confirmation email.
        </p>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className={cn("grid gap-8", accountBooking ? "" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]")}>
        {accountBooking ? null : (
          <div className="min-w-0 space-y-5">
            <div className="field">
              <label htmlFor="booking-name">Full name</label>
              <input
                id="booking-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={Boolean(defaultName)}
                placeholder="Jane Trader"
                autoComplete="name"
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor="booking-email">Email</label>
              <input
                id="booking-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={Boolean(defaultEmail)}
                placeholder="you@email.com"
                autoComplete="email"
                className="input"
              />
              <p className="field-hint">The calendar invite and Google Meet link go here.</p>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <p className="ui-label">Pick a day</p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7" role="group" aria-label="Day">
            {dayStrip.map((day) => {
              const iso = day.toISOString();
              const active = selectedDate?.toISOString() === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  aria-pressed={active}
                  className={cn(optionBase, "py-2", active && optionActive)}
                >
                  <span className="block text-[12px] font-medium uppercase tracking-[0.06em] opacity-80">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="mt-0.5 block font-[family-name:var(--font-display)] text-[22px] leading-none">
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="ui-label">Pick a time</p>
                <label className="flex min-w-0 max-w-full items-center gap-2 text-[14px]">
                  <span className={cn("shrink-0", muted)}>Timezone</span>
                  <select
                    value={viewerTimezone}
                    onChange={(e) => setViewerTimezone(e.target.value)}
                    className="input min-h-[40px] w-auto min-w-0 max-w-full py-1 text-[14px]"
                  >
                    {timezoneOptions.map((tz) => (
                      <option key={tz} value={tz}>
                        {formatTimezoneLabel(tz)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className={cn("mt-1 text-[14px]", muted)}>David takes calls Monday to Friday, 9am to 6pm Eastern.</p>
              <div className="mt-3">
                {status === "loading-slots" ? (
                  <div className={cn("flex items-center gap-2 py-4", muted)}>
                    <Loader2 size={16} className="animate-spin" aria-hidden /> Loading times…
                  </div>
                ) : slots.length === 0 && !errorMsg ? (
                  <p className={cn("py-4", muted)}>No openings on this day. Try another date.</p>
                ) : slots.length === 0 ? null : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="Time">
                    {slots.map((slot) => {
                      const active = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={slot.start}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          aria-pressed={active}
                          className={cn(optionBase, active && optionActive)}
                        >
                          {formatTimeLabel(slot.start, viewerTimezone)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="notice notice-danger mt-6" role="alert">
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleBook}
          disabled={!canBook || status === "submitting"}
          className="btn btn-primary btn-lg"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Booking…
            </>
          ) : (
            "Confirm booking"
          )}
        </button>
        <span className={cn("text-[15px]", selectedSlot ? "" : muted)}>
          {selectedSlot
            ? `${formatDateLabel(selectedSlot.start, viewerTimezone)} at ${formatTimeLabel(selectedSlot.start, viewerTimezone)} · ${durationLabel(defaultDurationMins)}`
            : `${durationLabel(defaultDurationMins)} on Google Meet. Pick a day and a time first.`}
        </span>
      </div>
    </div>
  );
}
