import { google, type calendar_v3, type docs_v1 } from "googleapis";
import { SENDER_EMAIL } from "@/lib/env";
import { coachReadCalendarIds } from "@/lib/coaching/coach-calendars";

/**
 * Find and read a client's discovery call transcript in Google Drive.
 *
 * Google Meet saves a "Notes by Gemini" Google Doc per recorded call in the
 * host's Drive ("Meet Recordings" folder). The doc has a Notes tab and a
 * Transcript tab, and Google attaches it to the call's calendar event. The
 * site books discovery calls on the coach calendar with the client as a
 * guest (calendar.ts), so we look for that client's past events, take the
 * docs attached to them, and fall back to notes docs created in the folder
 * within a few hours after one of those calls.
 *
 * Runs as hello@ through the service account's domain-wide delegation. The
 * calendar scope is already granted; Drive and Docs need the two read-only
 * scopes in DRIVE_SCOPES added in Google Admin, and until then every call
 * here throws DriveAccessError with that instruction.
 */
export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents.readonly",
];

const NOTES_FOLDER = "Meet Recordings";
const GOOGLE_DOC = "application/vnd.google-apps.document";
const AFTER_CALL_MS = 3 * 60 * 60 * 1000;
const LOOKBACK_DAYS = 365;

export class DriveAccessError extends Error {
  constructor(detail?: string) {
    super(
      "The site can't read Google Drive yet. In Google Admin → Security → API controls → Domain-wide delegation, add the Drive read-only and Docs read-only scopes to the site's service account." +
        (detail ? ` (${detail})` : "")
    );
    this.name = "DriveAccessError";
  }
}

export interface TranscriptCandidate {
  docId: string;
  title: string;
  url: string;
  /** ISO start of the call it belongs to, when known. */
  callStart: string | null;
  /** How it was found. */
  match: "event" | "folder-time" | "recent";
  eventSummary: string;
}

function credentials(): Record<string, unknown> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new DriveAccessError("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    return JSON.parse(raw);
  }
}

function auth() {
  return new google.auth.GoogleAuth({ credentials: credentials(), scopes: DRIVE_SCOPES, clientOptions: { subject: SENDER_EMAIL } });
}

/** Turn Google's auth failures into the one instruction David needs. */
function rethrow(e: unknown): never {
  const message = e instanceof Error ? e.message : String(e);
  if (/unauthorized_client|insufficient|access_denied|invalid_scope|permission|403|401/i.test(message)) {
    throw new DriveAccessError(message.slice(0, 120));
  }
  throw e instanceof Error ? e : new Error(message);
}

function docUrl(id: string): string {
  return `https://docs.google.com/document/d/${id}/edit`;
}

/** Google Docs attached to the client's past calendar events, newest first. */
export function candidatesFromEvents(events: calendar_v3.Schema$Event[], email: string): TranscriptCandidate[] {
  const who = email.trim().toLowerCase();
  const out: TranscriptCandidate[] = [];
  for (const ev of events) {
    const guests = (ev.attendees || []).map((a) => (a.email || "").toLowerCase());
    if (!guests.includes(who)) continue;
    for (const att of ev.attachments || []) {
      if (att.mimeType !== GOOGLE_DOC || !att.fileId) continue;
      out.push({
        docId: att.fileId,
        title: att.title || "Meeting notes",
        url: att.fileUrl || docUrl(att.fileId),
        callStart: ev.start?.dateTime || ev.start?.date || null,
        match: "event",
        eventSummary: ev.summary || "",
      });
    }
  }
  return out.sort((a, b) => String(b.callStart).localeCompare(String(a.callStart)));
}

/** Pull the text out of a Docs API document, preferring a tab named Transcript. */
export function transcriptFromDocument(doc: docs_v1.Schema$Document): { text: string; fromTab: boolean } {
  const bodyText = (body: docs_v1.Schema$Body | undefined) =>
    (body?.content || [])
      .map((el) => (el.paragraph?.elements || []).map((pe) => pe.textRun?.content || "").join(""))
      .join("")
      .trim();
  const tabs: docs_v1.Schema$Tab[] = [];
  const walk = (list: docs_v1.Schema$Tab[] | undefined) => {
    for (const t of list || []) {
      tabs.push(t);
      walk(t.childTabs);
    }
  };
  walk(doc.tabs);
  const named = tabs.find((t) => /transcript/i.test(t.tabProperties?.title || ""));
  if (named) return { text: bodyText(named.documentTab?.body), fromTab: true };
  const all = tabs.length ? tabs.map((t) => bodyText(t.documentTab?.body)).join("\n\n") : bodyText(doc.body);
  // One-tab docs: keep what follows the Transcript heading, if there is one.
  const at = all.search(/^\W*Transcript\s*$/im);
  return { text: at >= 0 ? all.slice(at).trim() : all, fromTab: false };
}

/** Find notes docs that may hold this client's discovery call, best matches first. */
export async function findTranscriptCandidates(email: string, now = new Date()): Promise<TranscriptCandidate[]> {
  const a = auth();
  const calendar = google.calendar({ version: "v3", auth: a });
  const drive = google.drive({ version: "v3", auth: a });
  const events: calendar_v3.Schema$Event[] = [];
  const seenEvents = new Set<string>();
  try {
    for (const calendarId of coachReadCalendarIds()) {
      const res = await calendar.events.list({
        calendarId,
        q: email,
        timeMin: new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString(),
        timeMax: now.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 50,
      });
      for (const ev of res.data.items || []) {
        if (ev.id && seenEvents.has(ev.id)) continue;
        if (ev.id) seenEvents.add(ev.id);
        events.push(ev);
      }
    }
  } catch (e) {
    rethrow(e);
  }
  const found = candidatesFromEvents(events, email);
  const seen = new Set(found.map((c) => c.docId));

  try {
    const folders = await drive.files.list({
      q: `name = '${NOTES_FOLDER}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id)",
      pageSize: 5,
    });
    const folderIds = (folders.data.files || []).map((f) => f.id).filter(Boolean) as string[];
    const inFolder = folderIds.map((id) => `'${id}' in parents`).join(" or ");
    if (inFolder) {
      // Docs created within a few hours after one of the client's calls.
      for (const ev of events) {
        const end = ev.end?.dateTime;
        const guests = (ev.attendees || []).map((x) => (x.email || "").toLowerCase());
        if (!end || !guests.includes(email.toLowerCase())) continue;
        const after = new Date(Date.parse(end) - 30 * 60 * 1000).toISOString();
        const before = new Date(Date.parse(end) + AFTER_CALL_MS).toISOString();
        const res = await drive.files.list({
          q: `(${inFolder}) and mimeType = '${GOOGLE_DOC}' and trashed = false and createdTime > '${after}' and createdTime < '${before}'`,
          fields: "files(id,name,webViewLink,createdTime)",
          pageSize: 5,
        });
        for (const f of res.data.files || []) {
          if (!f.id || seen.has(f.id)) continue;
          seen.add(f.id);
          found.push({
            docId: f.id,
            title: f.name || "Meeting notes",
            url: f.webViewLink || docUrl(f.id),
            callStart: ev.start?.dateTime || null,
            match: "folder-time",
            eventSummary: ev.summary || "",
          });
        }
      }
      // The newest notes docs, so David can pick one by hand.
      const recent = await drive.files.list({
        q: `(${inFolder}) and mimeType = '${GOOGLE_DOC}' and trashed = false`,
        orderBy: "createdTime desc",
        fields: "files(id,name,webViewLink,createdTime)",
        pageSize: 10,
      });
      for (const f of recent.data.files || []) {
        if (!f.id || seen.has(f.id)) continue;
        seen.add(f.id);
        found.push({
          docId: f.id,
          title: f.name || "Meeting notes",
          url: f.webViewLink || docUrl(f.id),
          callStart: f.createdTime || null,
          match: "recent",
          eventSummary: "",
        });
      }
    }
  } catch (e) {
    rethrow(e);
  }
  return found;
}

/** Read one notes doc and return its transcript text. */
export async function readTranscriptDoc(docId: string): Promise<{ title: string; text: string; url: string; createdTime: string | null }> {
  if (!/^[\w-]{10,200}$/.test(docId)) throw new Error("That is not a Google Doc id");
  const a = auth();
  try {
    const docs = google.docs({ version: "v1", auth: a });
    const drive = google.drive({ version: "v3", auth: a });
    const [doc, meta] = await Promise.all([
      docs.documents.get({ documentId: docId, includeTabsContent: true }),
      drive.files.get({ fileId: docId, fields: "id,name,webViewLink,createdTime" }),
    ]);
    const { text } = transcriptFromDocument(doc.data);
    return {
      title: meta.data.name || doc.data.title || "Meeting notes",
      text,
      url: meta.data.webViewLink || docUrl(docId),
      createdTime: meta.data.createdTime || null,
    };
  } catch (e) {
    rethrow(e);
  }
}

/** Shared with meet-recordings.ts: the same delegated Drive auth and error mapping. */
export { auth as workspaceAuth, rethrow as rethrowDriveError, NOTES_FOLDER as MEET_RECORDINGS_FOLDER };
