"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SessionRow {
  id: string;
  clientId: string;
  clientName?: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  packageId?: string;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
  sessions: SessionRow[];
}

export default function SessionsCalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Fetch a generous window so we can build the month grid.
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
      const res = await fetch(
        `/api/admin/coaching/sessions?limit=300`
      );
      const data = (await res.json()) as { sessions?: SessionRow[] };
      const inRange = (data.sessions || []).filter((s) => {
        const at = new Date(s.scheduledAt);
        return at >= monthStart && at <= monthEnd;
      });
      setSessions(inRange);
      setLoading(false);
    }
    void load();
  }, [cursor]);

  const cells = buildCalendar(cursor, sessions);

  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Sessions Calendar
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
              )
            }
            className="inline-flex h-8 w-8 items-center justify-center border border-[var(--color-border-muted)] text-[var(--color-text-muted)] hover:border-[var(--color-coaching)]"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="min-w-[160px] text-center font-[family-name:var(--font-display)] text-lg text-[var(--color-text)]">
            {cursor.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
              )
            }
            className="inline-flex h-8 w-8 items-center justify-center border border-[var(--color-border-muted)] text-[var(--color-text-muted)] hover:border-[var(--color-coaching)]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`min-h-[100px] border p-1 ${
              cell.inMonth
                ? "border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]"
                : "border-[var(--color-border-muted)] opacity-40"
            }`}
          >
            <div className="text-right font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-muted)]">
              {cell.date.getDate()}
            </div>
            <ul className="mt-1 space-y-1">
              {cell.sessions.slice(0, 3).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/admin/coaching/${encodeURIComponent(s.clientId)}`}
                    className="block bg-[var(--color-coaching-subtle)] px-1 py-0.5 text-[10px] text-[var(--color-text)] hover:bg-[var(--color-coaching)] hover:text-[var(--color-bg)]"
                  >
                    {new Date(s.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    {s.clientName || s.clientId.split("@")[0]}
                  </Link>
                </li>
              ))}
              {cell.sessions.length > 3 && (
                <li className="text-[10px] text-[var(--color-text-muted)]">
                  +{cell.sessions.length - 3} more
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {loading && (
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">Loading…</p>
      )}
    </div>
  );
}

function buildCalendar(monthStart: Date, sessions: SessionRow[]): DayCell[] {
  const firstDay = new Date(monthStart);
  const startWeekday = firstDay.getDay();
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startWeekday);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59);
    const daySessions = sessions.filter((s) => {
      const at = new Date(s.scheduledAt);
      return at >= dayStart && at <= dayEnd;
    });
    cells.push({
      date,
      inMonth: date.getMonth() === monthStart.getMonth(),
      sessions: daySessions,
    });
  }
  return cells;
}
