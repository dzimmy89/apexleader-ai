import { SENDER_EMAIL } from "@/lib/env";

/**
 * Which Google calendars the site reads and writes for coaching.
 *
 * COACH_CALENDAR_ID is the calendar site bookings are written to. In
 * production that is the "FromAItoBusiness — Discovery Calls" group calendar,
 * while calls David sets up by hand sit on hello@'s
 * primary calendar. Anything that needs every coaching call reads all of
 * coachReadCalendarIds(): COACH_READ_CALENDAR_IDS (comma separated) when set,
 * otherwise hello@'s primary calendar plus COACH_CALENDAR_ID.
 */
export function coachWriteCalendarId(): string {
  return process.env.COACH_CALENDAR_ID || SENDER_EMAIL;
}

export function coachReadCalendarIds(): string[] {
  const configured = (process.env.COACH_READ_CALENDAR_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const ids = configured.length ? configured : [SENDER_EMAIL, coachWriteCalendarId()];
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

/**
 * Calendars a new booking must not clash with. That is every calendar in
 * coachReadCalendarIds() plus COACH_BUSY_CALENDAR_IDS (comma separated):
 * David's calendars on other domains (hello@defiuniversity.xyz,
 * david@thenode.pro). Those are only checked through free/busy, never listed,
 * so they need nothing more than "See only free/busy" shared with hello@.
 */
export function coachBusyCalendarIds(): string[] {
  const extra = (process.env.COACH_BUSY_CALENDAR_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return [...new Set([...coachReadCalendarIds(), ...extra])];
}
