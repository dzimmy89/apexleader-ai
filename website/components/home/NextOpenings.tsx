"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackCoachingClick } from "@/lib/gtm";
import { cn } from "@/lib/utils";

interface Slot {
  start: string;
  end: string;
}

interface Day {
  key: string;
  label: string;
  slots: Slot[];
}

const LOOKAHEAD_DAYS = 10;

/** Up to `max` times spread across the day, so morning and afternoon both show. */
export function spreadSlots(slots: Slot[], max: number): Slot[] {
  if (slots.length <= max) return slots;
  const picked: Slot[] = [];
  for (let i = 0; i < max; i++) {
    picked.push(slots[Math.round((i * (slots.length - 1)) / (max - 1))]);
  }
  return picked;
}

function groupByDay(slots: Slot[], days: number, perDay: number): Day[] {
  const byDay = new Map<string, Day>();
  for (const slot of slots) {
    const at = new Date(slot.start);
    const key = at.toLocaleDateString("en-CA");
    if (!byDay.has(key)) {
      byDay.set(key, {
        key,
        label: at.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        slots: [],
      });
    }
    byDay.get(key)!.slots.push(slot);
  }
  return Array.from(byDay.values())
    .slice(0, days)
    .map((d) => ({ ...d, slots: spreadSlots(d.slots, perDay) }));
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function zoneLabel(): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return part?.value || "your time";
  } catch {
    return "your time";
  }
}

/**
 * The next open discovery-call times, read live from the coach calendar
 * (the same list /coaching/book shows). Tapping a time opens the booking
 * page with that time already selected. If the calendar can't be read, the
 * times are replaced by one button to the booking page, so the page never
 * shows a broken state.
 */
export function NextOpenings({
  days = 2,
  perDay = 3,
  surface = "dark",
  location,
  className,
}: {
  days?: number;
  perDay?: number;
  surface?: "dark" | "paper";
  /** Names this placement in analytics and on the booking record. */
  location: string;
  className?: string;
}) {
  const [state, setState] = useState<"loading" | "ready" | "none">("loading");
  const [list, setList] = useState<Day[]>([]);
  const [zone, setZone] = useState("");

  useEffect(() => {
    let alive = true;
    const start = new Date();
    const end = new Date(start.getTime() + LOOKAHEAD_DAYS * 86_400_000);
    setZone(zoneLabel());
    fetch(`/api/coaching/calendar?start=${start.toISOString()}&end=${end.toISOString()}&duration=30`)
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { slots?: Slot[] };
        const grouped = groupByDay(data.slots || [], days, perDay);
        if (!alive) return;
        setList(grouped);
        setState(grouped.length ? "ready" : "none");
      })
      .catch(() => {
        if (alive) setState("none");
      });
    return () => {
      alive = false;
    };
  }, [days, perDay]);

  const paper = surface === "paper";
  const bookHref = `/coaching/book?source=${encodeURIComponent(location)}`;
  const slotClass = cn(
    "inline-flex min-h-[44px] items-center rounded-[var(--radius-md)] border px-3.5 font-[family-name:var(--font-ui)] text-[15px] font-medium tabular-nums transition-colors",
    paper
      ? "border-[var(--color-border-on-parchment)] bg-[var(--color-surface-raised)] text-[var(--color-text-on-parchment)] hover:border-[var(--color-coaching-ink)]"
      : "border-[var(--color-border)] bg-[var(--color-panel-raised)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
  );
  const dayClass = cn(
    "mono-label",
    paper && "text-[var(--color-text-muted-on-parchment)]"
  );

  return (
    <div className={cn("grid gap-4", className)}>
      {state === "loading" ? (
        <div className="grid gap-4" aria-hidden="true">
          {Array.from({ length: days }).map((_, i) => (
            <div key={i} className="grid gap-2">
              <span className={cn(dayClass, "opacity-0")}>Loading</span>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: perDay }).map((__, j) => (
                  <span key={j} className={cn(slotClass, "w-[5.75rem] opacity-40")} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : state === "ready" ? (
        list.map((day) => (
          <div key={day.key} className="grid gap-2">
            <span className={dayClass}>{day.label}</span>
            <div className="flex flex-wrap gap-2">
              {day.slots.map((slot) => (
                <Link
                  key={slot.start}
                  href={`${bookHref}&slot=${encodeURIComponent(new Date(slot.start).toISOString())}`}
                  className={slotClass}
                  onClick={() => trackCoachingClick(`${location}_slot`)}
                >
                  {timeLabel(slot.start)}
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : null}

      <Link
        href={bookHref}
        className="btn btn-primary w-full"
        onClick={() => trackCoachingClick(`${location}_all_times`)}
      >
        {state === "ready" ? "See all open times" : "See open times"}
      </Link>
      {state === "ready" ? (
        <p
          className={cn(
            "text-center font-[family-name:var(--font-ui)] text-[length:var(--text-caption)]",
            paper ? "text-[var(--color-text-muted-on-parchment)]" : "text-[var(--color-text-faint)]"
          )}
        >
          Times shown in {zone}. Tap one to book it.
        </p>
      ) : null}
    </div>
  );
}
