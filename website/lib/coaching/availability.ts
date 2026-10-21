/**
 * Slot rules for discovery calls and portal coaching sessions. Pure, so the
 * busy-time logic is tested directly (scripts/test-coaching-availability.ts).
 *
 *  - min 24h notice, max 30-day horizon
 *  - Mon–Fri, 9am–6pm coach-local time; the whole call must fit inside
 *  - 30-min buffer before and after every busy block on the read calendars
 */
export const MIN_NOTICE_MS = 24 * 60 * 60 * 1000;
export const MAX_HORIZON_MS = 30 * 24 * 60 * 60 * 1000;
export const BUFFER_MS = 30 * 60 * 1000;
export const SLOT_STEP_MINS = 30;
export const BUSINESS_HOURS = { startHour: 9, endHour: 18 }; // coach-local time, 24h

export const COACH_TIMEZONE = process.env.COACH_TIMEZONE || "America/New_York";

export interface AvailabilitySlot {
  start: string; // ISO 8601
  end: string; // ISO 8601
}

export interface BusyInterval {
  start: string;
  end: string;
}

/** Call lengths a booking may ask for. Anything else falls back to the default. */
export function normalizeDurationMins(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  const rounded = Math.round(n);
  if (rounded < 15 || rounded > 120) return fallback;
  return rounded;
}

export function isWithinBookingWindow(start: Date, now: Date): boolean {
  const notice = start.getTime() - now.getTime();
  return notice >= MIN_NOTICE_MS && notice <= MAX_HORIZON_MS;
}

function localParts(d: Date, timeZone: string): { day: string; weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"),
    minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10),
  };
}

/** True when the call starts and ends on the same weekday inside business hours. */
export function fitsBusinessHours(start: Date, end: Date, timeZone = COACH_TIMEZONE): boolean {
  const s = localParts(start, timeZone);
  const e = localParts(end, timeZone);
  if (s.weekday === "Sat" || s.weekday === "Sun") return false;
  if (s.day !== e.day) return false;
  return s.minutes >= BUSINESS_HOURS.startHour * 60 && e.minutes <= BUSINESS_HOURS.endHour * 60;
}

/** True when [start, end] padded by the buffer touches any busy block. */
export function overlapsBusy(
  start: Date,
  end: Date,
  busy: BusyInterval[],
  bufferMs = BUFFER_MS
): boolean {
  const s = start.getTime() - bufferMs;
  const e = end.getTime() + bufferMs;
  return busy.some((b) => s < new Date(b.end).getTime() && e > new Date(b.start).getTime());
}

/** Every slot start on the 30-minute grid that passes notice, horizon and business hours. */
export function generateCandidateSlots(
  rangeStart: Date,
  rangeEnd: Date,
  durationMins: number,
  now = new Date(),
  timeZone = COACH_TIMEZONE
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const stepMs = SLOT_STEP_MINS * 60 * 1000;
  const cursor = new Date(Math.ceil(rangeStart.getTime() / stepMs) * stepMs);
  while (cursor < rangeEnd) {
    const start = new Date(cursor);
    const end = new Date(start.getTime() + durationMins * 60 * 1000);
    if (isWithinBookingWindow(start, now) && fitsBusinessHours(start, end, timeZone)) {
      slots.push({ start: start.toISOString(), end: end.toISOString() });
    }
    cursor.setTime(cursor.getTime() + stepMs);
  }
  return slots;
}

export function filterFreeSlots(
  candidates: AvailabilitySlot[],
  busy: BusyInterval[],
  bufferMs = BUFFER_MS
): AvailabilitySlot[] {
  return candidates.filter((slot) => !overlapsBusy(new Date(slot.start), new Date(slot.end), busy, bufferMs));
}

/** The 30-minute blocks a call covers, used as booking hold ids. */
export function holdBlockIds(start: Date, end: Date): string[] {
  const stepMs = SLOT_STEP_MINS * 60 * 1000;
  const ids: string[] = [];
  for (let t = Math.floor(start.getTime() / stepMs) * stepMs; t < end.getTime(); t += stepMs) {
    ids.push(new Date(t).toISOString());
  }
  return ids;
}
