import { google } from "googleapis";
import { SENDER_EMAIL, getSiteOrigin } from "@/lib/env";
import { coachReadCalendarIds, coachWriteCalendarId } from "@/lib/coaching/coach-calendars";
import {
  BUFFER_MS,
  COACH_TIMEZONE,
  filterFreeSlots,
  fitsBusinessHours,
  generateCandidateSlots,
  holdBlockIds,
  isWithinBookingWindow,
  overlapsBusy,
  type AvailabilitySlot,
  type BusyInterval,
} from "@/lib/coaching/availability";
import { recountClientSessions, sessionDocId } from "@/lib/coaching/session-sync";
import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/gmail";
import {
  getDiscoveryEmailContent,
  getDiscoveryEventDescription,
  getDiscoveryEventTitle,
  getDiscoveryPrepUrl,
  resolvePackageContext,
} from "@/lib/coaching/discovery-content";
import { getPackage } from "@/lib/coaching/packages";
import {
  enrollCoachingPostCall,
  leadFlowUserId,
} from "@/lib/lead-flows";
import { exitFlowsForUser } from "@/lib/flows";
import { automatedSendBlockedByManualOnly } from "@/lib/crm/contacts";
import { stampLeadPublicFormSignup } from "@/lib/crm/leads";
import { BRAND } from "@/lib/brand";

export class CalendarUnavailableError extends Error {
  constructor(message = "Calendar unavailable") {
    super(message);
    this.name = "CalendarUnavailableError";
  }
}

const SLOT_LENGTH_MINS = 30;
const HOLD_TTL_MS = 2 * 60 * 1000;
const BUSY_CACHE_TTL_MS = 60 * 1000;
const ALERT_INTERVAL_MS = 60 * 60 * 1000;

export const SLOT_TAKEN_MESSAGE = "That time was just taken. Pick another time.";
export const CALENDAR_UNAVAILABLE_MESSAGE =
  `Scheduling is temporarily unavailable. Please try again in a few minutes, or email ${BRAND.email}.`;

export type { AvailabilitySlot };

export interface CreateBookingInput {
  startTime: string; // ISO 8601
  email: string;
  name: string;
  packageId?: string;
  source?: string;
  durationMins?: number;
  title?: string;
  timezone?: string;
  applicationId?: string;
}

export type BookingErrorCode = "slot_taken" | "calendar_unavailable" | "invalid";

export interface CreateBookingResult {
  ok: boolean;
  eventId?: string;
  meetUrl?: string;
  htmlLink?: string;
  error?: string;
  code?: BookingErrorCode;
}

/** HTTP status for a failed booking. */
export function bookingErrorStatus(code: BookingErrorCode | undefined): number {
  if (code === "slot_taken") return 409;
  if (code === "calendar_unavailable") return 503;
  return 400;
}

export type CalendarSendUpdates = "all" | "none";

export interface CalendarGuestNotifyMode {
  sendUpdates: CalendarSendUpdates;
  includeAttendee: boolean;
}

/** Google Calendar guest notifications for a crm_contacts match. */
export function calendarGuestNotifyMode(manualOnly: boolean): CalendarGuestNotifyMode {
  if (manualOnly) {
    return { sendUpdates: "none", includeAttendee: false };
  }
  return { sendUpdates: "all", includeAttendee: true };
}

async function contactBlocksAutomatedCalendarMail(email: string): Promise<boolean> {
  try {
    return await automatedSendBlockedByManualOnly(email);
  } catch (e) {
    console.error("[calendar] automatedSendBlockedByManualOnly failed", email, e);
    return true;
  }
}

async function sendUpdatesForCalendarEvent(
  calendar: NonNullable<ReturnType<typeof getCalendarClient>>,
  eventId: string
): Promise<CalendarSendUpdates> {
  try {
    const event = await calendar.events.get({
      calendarId: coachWriteCalendarId(),
      eventId,
    });
    const attendees = event.data.attendees ?? [];
    if (attendees.length === 0) return "none";
    for (const attendee of attendees) {
      if (attendee.email && (await contactBlocksAutomatedCalendarMail(attendee.email))) {
        return "none";
      }
    }
    return "all";
  } catch (e) {
    console.error("[calendar] event lookup for sendUpdates failed", eventId, e);
    return "none";
  }
}

function getCalendarClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    credentials = JSON.parse(raw);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    clientOptions: { subject: SENDER_EMAIL },
  });

  return google.calendar({ version: "v3", auth });
}

type CalendarClient = NonNullable<ReturnType<typeof getCalendarClient>>;

// Busy blocks for the open-times list only, so clicking between days doesn't
// call Google every time. The booking-time check never reads this.
const busyCache = new Map<string, { at: number; busy: BusyInterval[] }>();

/**
 * Busy blocks across every calendar in coachReadCalendarIds(). Google's
 * free/busy already leaves out events marked Free and invites hello@ declined.
 * A calendar Google can't read fails the whole check: skipping it would offer
 * times that may be taken.
 */
export async function fetchBusyIntervals(
  calendar: Pick<CalendarClient, "freebusy">,
  timeMin: Date,
  timeMax: Date
): Promise<BusyInterval[]> {
  const ids = coachReadCalendarIds();
  let data;
  try {
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: ids.map((id) => ({ id })),
      },
    });
    data = res.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[calendar] freebusy failed", msg);
    throw new CalendarUnavailableError(`freebusy failed: ${msg}`);
  }
  const busy: BusyInterval[] = [];
  for (const id of ids) {
    const cal = data.calendars?.[id];
    if (!cal || (cal.errors && cal.errors.length > 0)) {
      const reason = cal?.errors?.map((err) => err.reason).join(", ") || "missing from response";
      console.error("[calendar] freebusy could not read", id, reason);
      throw new CalendarUnavailableError(`could not read calendar ${id}: ${reason}`);
    }
    for (const b of cal.busy ?? []) {
      if (b.start && b.end) busy.push({ start: b.start, end: b.end });
    }
  }
  return busy;
}

/** Emails hello@ at most once an hour while the calendar check is failing. */
async function alertCalendarCheckFailed(reason: string): Promise<void> {
  try {
    const db = getDb();
    const ref = db.collection("app_state").doc("calendar_check_alert");
    const snap = await ref.get();
    const last = snap.exists ? Date.parse(String(snap.data()?.lastSentAt || "")) : NaN;
    if (Number.isFinite(last) && Date.now() - last < ALERT_INTERVAL_MS) return;
    await ref.set({ lastSentAt: new Date().toISOString(), reason }, { merge: true });
    await sendEmail({
      to: SENDER_EMAIL,
      purpose: "transactional",
      subject: "Discovery call booking can't check your calendar",
      text: `The booking page at ${getSiteOrigin()}/coaching/book couldn't check your Google Calendar, so it is showing no times and refusing bookings until the check works again.\n\nReason: ${reason}\n\nThis email is sent at most once an hour while the problem lasts.`,
      html: `<p>The booking page at <a href="${getSiteOrigin()}/coaching/book">${getSiteOrigin()}/coaching/book</a> couldn't check your Google Calendar, so it is showing no times and refusing bookings until the check works again.</p><p>Reason: ${reason.replace(/[<>&]/g, "")}</p><p>This email is sent at most once an hour while the problem lasts.</p>`,
      log: { source: "calendar_check_alert" },
    });
  } catch (e) {
    console.error("[calendar] alert email failed", e);
  }
}

export async function getAvailability(
  rangeStart: Date,
  rangeEnd: Date,
  durationMins = SLOT_LENGTH_MINS
): Promise<AvailabilitySlot[]> {
  const candidates = generateCandidateSlots(rangeStart, rangeEnd, durationMins);
  if (candidates.length === 0) return [];

  const calendar = getCalendarClient();
  if (!calendar) {
    if (process.env.NODE_ENV === "production") {
      await alertCalendarCheckFailed("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
      throw new CalendarUnavailableError("Calendar not configured");
    }
    // Dev mode without creds — return candidates so the UI is testable.
    return candidates;
  }

  const timeMin = new Date(rangeStart.getTime() - BUFFER_MS);
  const timeMax = new Date(rangeEnd.getTime() + BUFFER_MS);
  const key = `${timeMin.toISOString()}|${timeMax.toISOString()}|${coachReadCalendarIds().join(",")}`;
  const cached = busyCache.get(key);
  let busy: BusyInterval[];
  if (cached && Date.now() - cached.at < BUSY_CACHE_TTL_MS) {
    busy = cached.busy;
  } else {
    try {
      busy = await fetchBusyIntervals(calendar, timeMin, timeMax);
    } catch (e) {
      if (e instanceof CalendarUnavailableError) await alertCalendarCheckFailed(e.message);
      throw e;
    }
    busyCache.set(key, { at: Date.now(), busy });
    if (busyCache.size > 200) busyCache.clear();
  }
  return filterFreeSlots(candidates, busy);
}

export type SlotCheck = { ok: true } | { ok: false; code: BookingErrorCode; error: string };

/**
 * Fresh check, right before an event is written, that nothing on the read
 * calendars overlaps [start, end] plus buffers. `ignore` drops one busy block
 * (the event being rescheduled) from the result.
 */
export async function checkSlotFree(
  calendar: Pick<CalendarClient, "freebusy">,
  start: Date,
  end: Date,
  ignore?: BusyInterval
): Promise<SlotCheck> {
  let busy: BusyInterval[];
  try {
    busy = await fetchBusyIntervals(
      calendar,
      new Date(start.getTime() - BUFFER_MS),
      new Date(end.getTime() + BUFFER_MS)
    );
  } catch (e) {
    if (e instanceof CalendarUnavailableError) {
      await alertCalendarCheckFailed(e.message);
      return { ok: false, code: "calendar_unavailable", error: CALENDAR_UNAVAILABLE_MESSAGE };
    }
    throw e;
  }
  if (ignore) {
    const s = new Date(ignore.start).getTime();
    const e = new Date(ignore.end).getTime();
    busy = busy.filter((b) => new Date(b.start).getTime() !== s || new Date(b.end).getTime() !== e);
  }
  if (overlapsBusy(start, end, busy)) {
    return { ok: false, code: "slot_taken", error: SLOT_TAKEN_MESSAGE };
  }
  return { ok: true };
}

/**
 * Holds the 30-minute blocks a call covers for a short time, so two visitors
 * who click Book at the same moment can't both get the slot. Only the first
 * transaction wins; the hold is released when `fn` finishes.
 */
export async function withSlotHold<T extends { ok: boolean; error?: string; code?: BookingErrorCode }>(
  start: Date,
  end: Date,
  fn: () => Promise<T>
): Promise<T | { ok: false; code: BookingErrorCode; error: string }> {
  const db = getDb();
  const refs = holdBlockIds(start, end).map((id) => db.collection("booking_holds").doc(id));
  const holdId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const now = Date.now();
  let held = false;
  try {
    held = await db.runTransaction(async (tx) => {
      for (const ref of refs) {
        const snap = await tx.get(ref);
        const expiresAt = snap.exists ? Date.parse(String(snap.data()?.expiresAt || "")) : NaN;
        if (Number.isFinite(expiresAt) && expiresAt > now) return false;
      }
      for (const ref of refs) {
        tx.set(ref, { holdId, expiresAt: new Date(now + HOLD_TTL_MS).toISOString() });
      }
      return true;
    });
  } catch (e) {
    console.error("[calendar] booking hold failed", e);
    return { ok: false, code: "calendar_unavailable", error: CALENDAR_UNAVAILABLE_MESSAGE };
  }
  if (!held) return { ok: false, code: "slot_taken", error: SLOT_TAKEN_MESSAGE };
  try {
    return await fn();
  } finally {
    for (const ref of refs) {
      try {
        const snap = await ref.get();
        if (snap.exists && snap.data()?.holdId === holdId) await ref.delete();
      } catch (e) {
        console.error("[calendar] releasing booking hold failed", e);
      }
    }
  }
}

export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const start = new Date(input.startTime);
  const now = new Date();
  const durationMins = input.durationMins ?? SLOT_LENGTH_MINS;
  const end = new Date(start.getTime() + durationMins * 60 * 1000);

  if (Number.isNaN(start.getTime())) {
    return { ok: false, code: "invalid", error: "Invalid start time" };
  }
  if (!isWithinBookingWindow(start, now)) {
    return { ok: false, code: "invalid", error: "Slot is outside the bookable window" };
  }
  if (!fitsBusinessHours(start, end)) {
    return { ok: false, code: "invalid", error: "Slot is outside coach business hours" };
  }

  const calendar = getCalendarClient();
  if (!calendar) {
    // Dev mode: synthesize a fake event id and Meet URL.
    if (process.env.NODE_ENV !== "production") {
      const eventId = `dev_${Date.now()}`;
      await stampLeadPublicFormSignup({
        email: input.email,
        source: input.source || "coaching_book",
        name: input.name,
      });
      await writeBookingToCrm({
        eventId,
        input,
        meetUrl: "https://meet.google.com/dev-mode",
      });
      return {
        ok: true,
        eventId,
        meetUrl: "https://meet.google.com/dev-mode",
      };
    }
    return { ok: false, code: "calendar_unavailable", error: CALENDAR_UNAVAILABLE_MESSAGE };
  }

  return withSlotHold(start, end, async (): Promise<CreateBookingResult> => {
    const check = await checkSlotFree(calendar, start, end);
    if (!check.ok) return check;
    const packageContext = await resolvePackageContext(input.packageId);
    const prepUrl = getDiscoveryPrepUrl(input.packageId);
    const title =
      input.title?.trim() ||
      getDiscoveryEventTitle({
        name: input.name || input.email,
        packageContext,
      });
    const description = getDiscoveryEventDescription({
      name: input.name || "",
      packageContext,
      prepUrl,
    });
    await stampLeadPublicFormSignup({
      email: input.email,
      source: input.source || "coaching_book",
      name: input.name,
    });
    const notify = calendarGuestNotifyMode(
      await contactBlocksAutomatedCalendarMail(input.email)
    );

    try {
      const event = await calendar.events.insert({
        calendarId: coachWriteCalendarId(),
        conferenceDataVersion: 1,
        sendUpdates: notify.sendUpdates,
        requestBody: {
          summary: title,
          description,
          start: { dateTime: start.toISOString(), timeZone: COACH_TIMEZONE },
          end: { dateTime: end.toISOString(), timeZone: COACH_TIMEZONE },
          ...(notify.includeAttendee
            ? { attendees: [{ email: input.email, displayName: input.name }] }
            : {}),
          conferenceData: {
            createRequest: {
              requestId: `apex-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      });

      const eventId = event.data.id || "";
      const meetUrl =
        event.data.conferenceData?.entryPoints?.find(
          (ep: { entryPointType?: string | null }) => ep.entryPointType === "video"
        )?.uri || undefined;
      const htmlLink = event.data.htmlLink || undefined;

      if (meetUrl && eventId) {
        try {
          await calendar.events.patch({
            calendarId: coachWriteCalendarId(),
            eventId,
            sendUpdates: "none",
            requestBody: {
              description: getDiscoveryEventDescription({
                name: input.name || "",
                packageContext,
                prepUrl,
                meetUrl,
              }),
            },
          });
        } catch (e) {
          console.error("[createBooking] description patch failed", e);
        }
      }

      await writeBookingToCrm({ eventId, input, meetUrl, htmlLink });
      try {
        await sendBookingConfirmationEmail({
          input,
          start,
          meetUrl,
          htmlLink,
          packageContext,
          prepUrl,
        });
      } catch (e) {
        console.error("[createBooking] confirmation email failed", e);
      }

      return { ok: true, eventId, meetUrl, htmlLink };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[createBooking] insert failed", msg);
      return { ok: false, error: msg };
    }
  });
}

async function sendBookingConfirmationEmail(args: {
  input: CreateBookingInput;
  start: Date;
  meetUrl?: string;
  htmlLink?: string;
  packageContext: Awaited<ReturnType<typeof resolvePackageContext>>;
  prepUrl: string;
}): Promise<void> {
  const { subject, html, text } = getDiscoveryEmailContent({
    name: args.input.name || "",
    packageContext: args.packageContext,
    start: args.start,
    prepUrl: args.prepUrl,
    meetUrl: args.meetUrl,
    htmlLink: args.htmlLink,
    viewerTimezone: args.input.timezone,
  });

  await sendEmail({
    to: args.input.email,
    subject,
    html,
    text,
    log: { source: "coaching_booking_confirmation" },
  });
}

async function writeBookingToCrm(args: {
  eventId: string;
  input: CreateBookingInput;
  meetUrl?: string;
  htmlLink?: string;
}): Promise<void> {
  const db = getDb();
  const email = args.input.email.trim().toLowerCase();
  const now = new Date().toISOString();

  try {
    if (args.input.applicationId) {
      await db
        .collection("coaching_applications")
        .doc(args.input.applicationId)
        .update({
          status: "scheduled",
          discoveryCallId: args.eventId,
          discoveryCallAt: args.input.startTime,
          meetUrl: args.meetUrl ?? null,
          htmlLink: args.htmlLink ?? null,
          updatedAt: now,
        });

      try {
        await exitFlowsForUser(
          leadFlowUserId(email),
          "coaching_nurture",
          "booked_discovery_call"
        );
        await enrollCoachingPostCall(email);
      } catch (e) {
        console.error("[writeBookingToCrm] post-booking flow hook failed", e);
      }
      return;
    }

    let closeValue: number | undefined;
    if (args.input.packageId) {
      try {
        const pkg = await getPackage(args.input.packageId);
        if (pkg) closeValue = pkg.price;
      } catch {
        /* ignore */
      }
    }

    await db.collection("coaching_applications").add({
      email,
      name: args.input.name || "",
      status: "scheduled",
      packageId: args.input.packageId || null,
      source: args.input.source || "direct",
      discoveryCallId: args.eventId,
      discoveryCallAt: args.input.startTime,
      meetUrl: args.meetUrl ?? null,
      htmlLink: args.htmlLink ?? null,
      ...(typeof closeValue === "number" ? { closeValue } : {}),
      createdAt: now,
      updatedAt: now,
    });
  } catch (e) {
    console.error("[writeBookingToCrm] failed", e);
  }
}

export async function cancelBooking(eventId: string): Promise<{ ok: boolean; error?: string }> {
  const calendar = getCalendarClient();
  if (!calendar) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[cancelBooking] dev mode — no calendar configured");
      return { ok: true };
    }
    return { ok: false, error: "Calendar not configured" };
  }

  try {
    const sendUpdates = await sendUpdatesForCalendarEvent(calendar, eventId);
    await calendar.events.delete({
      calendarId: coachWriteCalendarId(),
      eventId,
      sendUpdates,
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[cancelBooking] failed", msg);
    return { ok: false, error: msg };
  }
}

export async function rescheduleBooking(
  eventId: string,
  newStart: string,
  durationMins = SLOT_LENGTH_MINS
): Promise<CreateBookingResult> {
  const calendar = getCalendarClient();
  if (!calendar) {
    return { ok: false, code: "calendar_unavailable", error: "Calendar not configured" };
  }

  const start = new Date(newStart);
  const end = new Date(start.getTime() + durationMins * 60 * 1000);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, code: "invalid", error: "Invalid start time" };
  }
  if (!isWithinBookingWindow(start, new Date())) {
    return { ok: false, code: "invalid", error: "Slot is outside the bookable window" };
  }
  if (!fitsBusinessHours(start, end)) {
    return { ok: false, code: "invalid", error: "Slot is outside coach business hours" };
  }

  // The event's current time shows as busy too; leave it out of the check.
  let current: BusyInterval | undefined;
  try {
    const existing = await calendar.events.get({ calendarId: coachWriteCalendarId(), eventId });
    const s = existing.data.start?.dateTime;
    const e = existing.data.end?.dateTime;
    if (s && e) current = { start: s, end: e };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }

  return withSlotHold(start, end, async (): Promise<CreateBookingResult> => {
    const check = await checkSlotFree(calendar, start, end, current);
    if (!check.ok) return check;
    try {
      const sendUpdates = await sendUpdatesForCalendarEvent(calendar, eventId);
      const event = await calendar.events.patch({
        calendarId: coachWriteCalendarId(),
        eventId,
        requestBody: {
          start: { dateTime: start.toISOString(), timeZone: COACH_TIMEZONE },
          end: { dateTime: end.toISOString(), timeZone: COACH_TIMEZONE },
        },
        sendUpdates,
      });

      const meetUrl =
        event.data.conferenceData?.entryPoints?.find(
          (ep: { entryPointType?: string | null }) => ep.entryPointType === "video"
        )?.uri || undefined;

      return { ok: true, eventId, meetUrl };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
    }
  });
}

export interface CoachingSessionBookingInput {
  clientId: string;
  name: string;
  startTime: string;
  durationMins?: number;
  timezone?: string;
}

/**
 * A coaching session booked from the client portal. Unlike createBooking
 * (discovery calls), it writes the coaching_sessions row (cal_{eventId}, the
 * same id the calendar sync uses), leaves the pipeline alone, and sends
 * session wording rather than discovery-call wording.
 */
export async function createCoachingSessionBooking(
  input: CoachingSessionBookingInput
): Promise<CreateBookingResult & { sessionId?: string }> {
  const start = new Date(input.startTime);
  const now = new Date();
  if (Number.isNaN(start.getTime())) return { ok: false, code: "invalid", error: "Invalid start time" };
  const email = input.clientId.trim().toLowerCase();
  const durationMins = input.durationMins ?? 60;
  const end = new Date(start.getTime() + durationMins * 60 * 1000);
  if (!isWithinBookingWindow(start, now)) {
    return { ok: false, code: "invalid", error: "Slot is outside the bookable window" };
  }
  if (!fitsBusinessHours(start, end)) {
    return { ok: false, code: "invalid", error: "Slot is outside coach business hours" };
  }
  const who = input.name.trim() || email;
  const title = `Coaching session: ${who}`;

  const calendar = getCalendarClient();
  let eventId: string;
  let meetUrl: string | undefined;
  let htmlLink: string | undefined;
  if (!calendar) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, code: "calendar_unavailable", error: CALENDAR_UNAVAILABLE_MESSAGE };
    }
    eventId = `dev_${Date.now()}`;
    meetUrl = "https://meet.google.com/dev-mode";
  } else {
    const inserted = await withSlotHold(start, end, async (): Promise<CreateBookingResult> => {
      const check = await checkSlotFree(calendar, start, end);
      if (!check.ok) return check;
      const notify = calendarGuestNotifyMode(await contactBlocksAutomatedCalendarMail(email));
      try {
        const event = await calendar.events.insert({
          calendarId: coachWriteCalendarId(),
          conferenceDataVersion: 1,
          sendUpdates: notify.sendUpdates,
          requestBody: {
            summary: title,
            description: `Private coaching session with ${who}. The recording will be added to your account at ${getSiteOrigin()}/account after the call.`,
            start: { dateTime: start.toISOString(), timeZone: COACH_TIMEZONE },
            end: { dateTime: end.toISOString(), timeZone: COACH_TIMEZONE },
            ...(notify.includeAttendee ? { attendees: [{ email, displayName: input.name }] } : {}),
            conferenceData: {
              createRequest: {
                requestId: `apex-session-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          },
        });
        return {
          ok: true,
          eventId: event.data.id || "",
          meetUrl:
            event.data.conferenceData?.entryPoints?.find(
              (ep: { entryPointType?: string | null }) => ep.entryPointType === "video"
            )?.uri || undefined,
          htmlLink: event.data.htmlLink || undefined,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[createCoachingSessionBooking] insert failed", msg);
        return { ok: false, error: msg };
      }
    });
    if (!inserted.ok) return inserted;
    eventId = inserted.eventId || "";
    meetUrl = inserted.meetUrl;
    htmlLink = inserted.htmlLink;
  }
  if (!eventId) return { ok: false, error: "Calendar did not return an event" };

  const db = getDb();
  const sessionId = sessionDocId(eventId);
  const nowIso = now.toISOString();
  const client = await db.collection("client_records").doc(email).get();
  const clientData = (client.data() || {}) as Record<string, unknown>;
  await db.collection("coaching_sessions").doc(sessionId).set({
    clientId: email,
    clientName: input.name || String(clientData.name || ""),
    packageId: clientData.packageId || null,
    coachEmail: SENDER_EMAIL,
    calendarEventId: eventId,
    scheduledAt: start.toISOString(),
    durationMins,
    status: "scheduled",
    privateNotes: "",
    sharedNotes: "",
    actionItems: [],
    meetUrl: meetUrl ?? null,
    isProBono: false,
    groupSize: 1,
    completedAt: null,
    title,
    source: "portal",
    statusSource: "calendar",
    ignored: false,
    lateCancel: false,
    cancelledAt: null,
    recordingFileId: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
  await recountClientSessions(db, email);

  const when = `${start.toLocaleString("en-US", {
    timeZone: input.timezone || COACH_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })}`;
  try {
    await sendEmail({
      to: email,
      purpose: "transactional",
      subject: `Coaching session booked: ${when}`,
      text: `Your coaching session with David is booked for ${when}.${meetUrl ? `\n\nJoin on Google Meet: ${meetUrl}` : ""}\n\nThe recording will be in your account afterwards: ${getSiteOrigin()}/account`,
      html: `<p>Your coaching session with David is booked for <strong>${when}</strong>.</p>${
        meetUrl ? `<p><a href="${meetUrl}">Join on Google Meet</a></p>` : ""
      }<p>The recording will be in <a href="${getSiteOrigin()}/account">your account</a> afterwards.</p>`,
      log: { source: "coaching_session_booked" },
    });
  } catch (e) {
    console.error("[createCoachingSessionBooking] confirmation email failed", e);
  }
  return { ok: true, eventId, meetUrl, htmlLink, sessionId };
}
