import { google, type calendar_v3 } from "googleapis";
import { SENDER_EMAIL } from "@/lib/env";
import { getDb } from "@/lib/firebase-admin";
import { coachReadCalendarIds } from "@/lib/coaching/coach-calendars";
import type { CoachingSessionDoc, SessionStatus } from "@/lib/coaching/sessions";

/**
 * Coaching sessions from the coach calendar.
 *
 * Every event on the coach calendars (hello@'s primary calendar and the
 * group calendar site bookings go to, see coach-calendars.ts) with a
 * coaching client as a guest becomes
 * a coaching_sessions row (doc id cal_{eventId}), whoever created it: the
 * client portal, David in Google Calendar, or an invite the client accepted.
 * Moving the event moves the session, deleting or declining it cancels the
 * session, and a session whose end has passed is marked completed. Runs from
 * the cron and from Sessions → "Sync calendar". Uses the calendar scope the
 * site already has.
 */
export const COACHING_SESSIONS = "coaching_sessions";
export const MIN_SESSION_MINS = 30;
const LATE_CANCEL_MS = 24 * 60 * 60 * 1000;
const LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;
const LOOKAHEAD_MS = 90 * 24 * 60 * 60 * 1000;

export interface CoachEventAttachment {
  fileId: string;
  title: string;
  mimeType: string;
  fileUrl: string;
}

export interface CoachEvent {
  id: string;
  status: "confirmed" | "tentative" | "cancelled";
  summary: string;
  /** ISO start; null for all-day events. */
  start: string | null;
  end: string | null;
  attendees: Array<{ email: string; responseStatus: string }>;
  meetUrl: string | null;
  attachments: CoachEventAttachment[];
}

export type SyncedSession = CoachingSessionDoc & {
  id: string;
  source?: string;
  statusSource?: "calendar" | "admin";
  ignored?: boolean;
  lateCancel?: boolean;
  cancelledAt?: string | null;
  title?: string;
  recordingFileId?: string | null;
  recordingCheckedAt?: string | null;
};

export function sessionDocId(eventId: string): string {
  return `cal_${eventId.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 120)}`;
}

export function toCoachEvent(e: calendar_v3.Schema$Event): CoachEvent | null {
  if (!e.id) return null;
  const status = e.status === "cancelled" ? "cancelled" : e.status === "tentative" ? "tentative" : "confirmed";
  const start = e.start?.dateTime ? new Date(e.start.dateTime).toISOString() : null;
  const end = e.end?.dateTime ? new Date(e.end.dateTime).toISOString() : null;
  const meetUrl =
    e.hangoutLink ||
    e.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri ||
    null;
  return {
    id: e.id,
    status,
    summary: e.summary || "",
    start,
    end,
    attendees: (e.attendees || [])
      .filter((a) => a.email)
      .map((a) => ({ email: String(a.email).trim().toLowerCase(), responseStatus: a.responseStatus || "needsAction" })),
    meetUrl,
    attachments: (e.attachments || [])
      .filter((a) => a.fileId)
      .map((a) => ({
        fileId: String(a.fileId),
        title: a.title || "",
        mimeType: a.mimeType || "",
        fileUrl: a.fileUrl || "",
      })),
  };
}

export function isDiscoveryEvent(summary: string): boolean {
  return /discovery/i.test(summary);
}

/** The first guest who is a coaching client. The coach is never a client. */
export function matchEventToClient(
  event: Pick<CoachEvent, "attendees">,
  clientEmails: Set<string>,
  coachEmail = SENDER_EMAIL
): string | null {
  const coach = coachEmail.trim().toLowerCase();
  for (const a of event.attendees) {
    if (a.email !== coach && clientEmails.has(a.email)) return a.email;
  }
  return null;
}

export type SessionPlan =
  | { kind: "create"; id: string; doc: Record<string, unknown> }
  | { kind: "update"; id: string; patch: Record<string, unknown> }
  | { kind: "none" };

/** What one calendar event means for its session row. Pure, so it is tested directly. */
export function planSessionFromEvent(
  event: CoachEvent,
  existing: SyncedSession | null,
  clientId: string,
  nowMs: number
): SessionPlan {
  if (existing?.ignored) return { kind: "none" };
  if (!event.start || !event.end) return { kind: "none" };
  const startMs = Date.parse(event.start);
  const endMs = Date.parse(event.end);
  const durationMins = Math.round((endMs - startMs) / 60000);
  const client = event.attendees.find((a) => a.email === clientId);
  const cancelled = event.status === "cancelled" || client?.responseStatus === "declined";
  const nowIso = new Date(nowMs).toISOString();

  if (!existing) {
    if (cancelled || durationMins < MIN_SESSION_MINS || isDiscoveryEvent(event.summary)) {
      return { kind: "none" };
    }
    const done = endMs <= nowMs;
    return {
      kind: "create",
      id: sessionDocId(event.id),
      doc: {
        clientId,
        packageId: null,
        coachEmail: SENDER_EMAIL,
        calendarEventId: event.id,
        scheduledAt: event.start,
        durationMins,
        status: done ? "completed" : "scheduled",
        privateNotes: "",
        sharedNotes: "",
        actionItems: [],
        meetUrl: event.meetUrl,
        isProBono: false,
        groupSize: 1,
        completedAt: done ? event.end : null,
        title: event.summary,
        source: "calendar",
        statusSource: "calendar",
        ignored: false,
        lateCancel: false,
        cancelledAt: null,
        recordingFileId: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    };
  }

  const patch: Record<string, unknown> = {};
  if (Date.parse(existing.scheduledAt) !== startMs) patch.scheduledAt = event.start;
  if (existing.durationMins !== durationMins) patch.durationMins = durationMins;
  if (!existing.meetUrl && event.meetUrl) patch.meetUrl = event.meetUrl;
  if (event.summary && existing.title !== event.summary) patch.title = event.summary;

  if (existing.statusSource !== "admin") {
    if (cancelled && existing.status !== "cancelled") {
      patch.status = "cancelled";
      patch.cancelledAt = nowIso;
      patch.lateCancel = startMs - nowMs < LATE_CANCEL_MS;
    } else if (!cancelled && existing.status === "cancelled") {
      patch.status = endMs <= nowMs ? "completed" : "scheduled";
      patch.cancelledAt = null;
      patch.lateCancel = false;
      if (endMs <= nowMs) patch.completedAt = event.end;
    } else if (!cancelled && existing.status === "scheduled" && endMs <= nowMs) {
      patch.status = "completed";
      patch.completedAt = event.end;
    }
  }
  if (Object.keys(patch).length === 0) return { kind: "none" };
  patch.updatedAt = nowIso;
  return { kind: "update", id: existing.id, patch };
}

const USES_A_SESSION: SessionStatus[] = ["scheduled", "completed", "no-show"];

/** Booked, completed and no-show sessions count; cancellations count only when late. */
export function countUsedSessions(
  sessions: Array<Pick<SyncedSession, "status" | "ignored" | "lateCancel">>
): number {
  return sessions.filter(
    (s) => !s.ignored && (USES_A_SESSION.includes(s.status) || (s.status === "cancelled" && s.lateCancel))
  ).length;
}

type Db = ReturnType<typeof getDb>;

export async function listClientSessions(db: Db, email: string): Promise<SyncedSession[]> {
  const snap = await db
    .collection(COACHING_SESSIONS)
    .where("clientId", "==", email.trim().toLowerCase())
    .limit(200)
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<SyncedSession, "id">) }))
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
}

/**
 * Sessions held before a client moved onto the site. Calendar
 * sessions before the cutoff are already inside legacySessionsUsed, so only
 * later ones are counted on top.
 */
export function sessionsAfterCutoff<T extends Pick<SyncedSession, "scheduledAt">>(
  sessions: T[],
  cutoff: unknown
): T[] {
  const cut = typeof cutoff === "string" ? Date.parse(cutoff) : NaN;
  if (Number.isNaN(cut)) return sessions;
  return sessions.filter((s) => Date.parse(s.scheduledAt) >= cut);
}

/** sessionsRemaining = sessionsTotal minus sessions used, so it never drifts. */
export async function recountClientSessions(
  db: Db,
  email: string
): Promise<{ used: number; remaining: number } | null> {
  const id = email.trim().toLowerCase();
  const ref = db.collection("client_records").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  const total = Number(data.sessionsTotal || 0);
  if (total <= 0) return null;
  const legacyUsed = Math.max(0, Number(data.legacySessionsUsed || 0));
  const sessions = sessionsAfterCutoff(await listClientSessions(db, id), data.legacySessionsCutoff);
  const used = legacyUsed + countUsedSessions(sessions);
  const remaining = Math.max(0, total - used);
  await ref.set({ sessionsUsed: used, sessionsRemaining: remaining, updatedAt: new Date().toISOString() }, { merge: true });
  return { used, remaining };
}

function calendarCredentials(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    return JSON.parse(raw);
  }
}

/**
 * One list from several calendars. The same event can sit on two of them (a
 * call on the group calendar with hello@ invited); a live copy wins over a
 * cancelled one.
 */
export function mergeCalendarEvents(lists: CoachEvent[][]): CoachEvent[] {
  const byId = new Map<string, CoachEvent>();
  for (const list of lists) {
    for (const event of list) {
      const seen = byId.get(event.id);
      if (!seen || (seen.status === "cancelled" && event.status !== "cancelled")) byId.set(event.id, event);
    }
  }
  return [...byId.values()];
}

/** Events on every coach calendar between two instants, deleted ones included. */
export async function listCoachEvents(timeMin: Date, timeMax: Date): Promise<CoachEvent[]> {
  const credentials = calendarCredentials();
  if (!credentials) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    clientOptions: { subject: SENDER_EMAIL },
  });
  const calendar = google.calendar({ version: "v3", auth });
  const lists: CoachEvent[][] = [];
  for (const calendarId of coachReadCalendarIds()) {
    const events: CoachEvent[] = [];
    let pageToken: string | undefined;
    do {
      const res = await calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        showDeleted: true,
        maxResults: 2500,
        pageToken,
      });
      for (const item of res.data.items || []) {
        const event = toCoachEvent(item);
        if (event) events.push(event);
      }
      pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);
    lists.push(events);
  }
  return mergeCalendarEvents(lists);
}

export interface RecordingFinder {
  (args: { event: CoachEvent; session: SyncedSession; clientName: string }): Promise<
    { fileId: string; title: string } | null
  >;
}

export interface RecordingPublisher {
  (args: { session: SyncedSession; fileId: string; clientName: string; sessionNumber: number }): Promise<string>;
}

export interface SyncResult {
  events: number;
  matched: number;
  created: number;
  updated: number;
  completed: number;
  clients: number;
  recordings: number;
  recordingError: string | null;
}

/** How far back a finished session is still checked for its recording. */
const RECORDING_LOOKBACK_MS = 3 * 24 * 60 * 60 * 1000;
/** Google can take a while to process a recording, so do not check too eagerly. */
const RECORDING_RECHECK_MS = 20 * 60 * 1000;

export async function syncCoachingCalendar(
  opts: {
    now?: Date;
    listEvents?: (timeMin: Date, timeMax: Date) => Promise<CoachEvent[]>;
    findRecording?: RecordingFinder;
    publishRecording?: RecordingPublisher;
  } = {}
): Promise<SyncResult> {
  const db = getDb();
  const now = opts.now || new Date();
  const nowMs = now.getTime();
  const coach = SENDER_EMAIL.trim().toLowerCase();

  const clientSnap = await db.collection("client_records").limit(1000).get();
  const clientNames = new Map<string, string>();
  for (const doc of clientSnap.docs) {
    const id = doc.id.trim().toLowerCase();
    if (id === coach) continue;
    clientNames.set(id, String((doc.data() || {}).name || ""));
  }
  const clientEmails = new Set(clientNames.keys());

  const sessionSnap = await db.collection(COACHING_SESSIONS).limit(2000).get();
  const sessions = sessionSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SyncedSession, "id">) }));
  const byEvent = new Map<string, SyncedSession>();
  for (const s of sessions) {
    if (s.calendarEventId) byEvent.set(s.calendarEventId, s);
  }

  const listEvents = opts.listEvents || listCoachEvents;
  const events = await listEvents(new Date(nowMs - LOOKBACK_MS), new Date(nowMs + LOOKAHEAD_MS));
  const eventById = new Map<string, CoachEvent>();
  const touched = new Set<string>();
  const result: SyncResult = {
    events: events.length,
    matched: 0,
    created: 0,
    updated: 0,
    completed: 0,
    clients: 0,
    recordings: 0,
    recordingError: null,
  };

  for (const event of events) {
    eventById.set(event.id, event);
    const existing = byEvent.get(event.id) || null;
    const clientId = existing?.clientId || matchEventToClient(event, clientEmails, coach);
    if (!clientId) continue;
    result.matched += 1;
    const plan = planSessionFromEvent(event, existing, clientId, nowMs);
    if (plan.kind === "create") {
      await db.collection(COACHING_SESSIONS).doc(plan.id).set({
        ...plan.doc,
        clientName: clientNames.get(clientId) || "",
      });
      const row = { id: plan.id, ...(plan.doc as Omit<SyncedSession, "id">) };
      sessions.push(row);
      byEvent.set(event.id, row);
      result.created += 1;
      touched.add(clientId);
    } else if (plan.kind === "update") {
      await db.collection(COACHING_SESSIONS).doc(plan.id).set(plan.patch, { merge: true });
      Object.assign(existing as SyncedSession, plan.patch);
      result.updated += 1;
      touched.add(clientId);
    }
  }

  // Sessions added by hand (no calendar event) complete when their time passes.
  for (const s of sessions) {
    if (s.calendarEventId || s.ignored || s.status !== "scheduled" || s.statusSource === "admin") continue;
    const endMs = Date.parse(s.scheduledAt) + (Number(s.durationMins) || 60) * 60000;
    if (endMs > nowMs) continue;
    const patch = { status: "completed", completedAt: new Date(endMs).toISOString(), updatedAt: now.toISOString() };
    await db.collection(COACHING_SESSIONS).doc(s.id).set(patch, { merge: true });
    Object.assign(s, patch);
    result.completed += 1;
    touched.add(s.clientId);
  }

  for (const email of touched) {
    if (await recountClientSessions(db, email)) result.clients += 1;
  }

  if (opts.findRecording && opts.publishRecording) {
    const byClient = new Map<string, SyncedSession[]>();
    for (const s of sessions) {
      const list = byClient.get(s.clientId) || [];
      list.push(s);
      byClient.set(s.clientId, list);
    }
    for (const s of sessions) {
      if (s.status !== "completed" || s.ignored || s.recordingFileId || !s.calendarEventId) continue;
      const endMs = Date.parse(s.scheduledAt) + (Number(s.durationMins) || 60) * 60000;
      if (nowMs - endMs > RECORDING_LOOKBACK_MS) continue;
      if (s.recordingCheckedAt && nowMs - Date.parse(s.recordingCheckedAt) < RECORDING_RECHECK_MS) continue;
      const event = eventById.get(s.calendarEventId);
      if (!event) continue;
      const clientName = clientNames.get(s.clientId) || "";
      try {
        const found = await opts.findRecording({ event, session: s, clientName });
        if (!found) {
          await db.collection(COACHING_SESSIONS).doc(s.id).set({ recordingCheckedAt: now.toISOString() }, { merge: true });
          continue;
        }
        const done = (byClient.get(s.clientId) || [])
          .filter((x) => !x.ignored && (x.status === "completed" || x.status === "no-show"))
          .sort((a, b) => (a.scheduledAt < b.scheduledAt ? -1 : 1));
        const sessionNumber = Math.max(1, done.findIndex((x) => x.id === s.id) + 1);
        const fileId = await opts.publishRecording({ session: s, fileId: found.fileId, clientName, sessionNumber });
        await db
          .collection(COACHING_SESSIONS)
          .doc(s.id)
          .set({ recordingFileId: fileId, recordingCheckedAt: now.toISOString() }, { merge: true });
        s.recordingFileId = fileId;
        result.recordings += 1;
      } catch (e) {
        result.recordingError = e instanceof Error ? e.message : String(e);
        // Drive access missing is the same for every session; stop after the first.
        break;
      }
    }
  }

  await db.collection("app_state").doc("coaching_calendar_sync").set(
    {
      lastRunAt: now.toISOString(),
      lastResult: result,
    },
    { merge: true }
  );
  return result;
}
