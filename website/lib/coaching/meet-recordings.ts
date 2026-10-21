import { google } from "googleapis";
import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/gmail";
import { getSiteOrigin } from "@/lib/env";
import { automatedSendBlockedByManualOnly } from "@/lib/crm/contacts";
import { CLIENT_FILES } from "@/lib/coaching/client-files";
import { MEET_RECORDINGS_FOLDER, rethrowDriveError, workspaceAuth } from "@/lib/coaching/meet-transcripts";
import type { CoachEvent, RecordingFinder, RecordingPublisher } from "@/lib/coaching/session-sync";

/**
 * Google Meet recordings of coaching sessions.
 *
 * Meet saves each recording as a video in the host's "Meet Recordings" Drive
 * folder and attaches it to the calendar event. After a session ends the
 * calendar sync looks for it (event attachment first, then a video created in
 * that folder within three hours after the call), adds it to the client's
 * Recordings, and the client watches it on /account. The site streams the
 * video from Drive after checking the client's sign-in, so the file is never
 * shared and the client needs no Google account. Needs the drive.readonly
 * scope on the service account (the same one the syllabus intake uses).
 */
const AFTER_CALL_MS = 3 * 60 * 60 * 1000;

export function recordingFromAttachments(event: Pick<CoachEvent, "attachments">): { fileId: string; title: string } | null {
  const video = event.attachments.find((a) => a.mimeType.startsWith("video/"));
  return video ? { fileId: video.fileId, title: video.title } : null;
}

export const findMeetRecording: RecordingFinder = async ({ event }) => {
  const attached = recordingFromAttachments(event);
  if (attached) return attached;
  if (!event.start || !event.end) return null;
  const drive = google.drive({ version: "v3", auth: workspaceAuth() });
  try {
    const folders = await drive.files.list({
      q: `name = '${MEET_RECORDINGS_FOLDER}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id)",
      pageSize: 5,
    });
    const inFolder = (folders.data.files || [])
      .map((f) => f.id)
      .filter(Boolean)
      .map((id) => `'${id}' in parents`)
      .join(" or ");
    if (!inFolder) return null;
    const after = event.start;
    const before = new Date(Date.parse(event.end) + AFTER_CALL_MS).toISOString();
    const res = await drive.files.list({
      q: `(${inFolder}) and mimeType contains 'video/' and trashed = false and createdTime > '${after}' and createdTime < '${before}'`,
      fields: "files(id,name,createdTime)",
      orderBy: "createdTime",
      pageSize: 10,
    });
    const files = res.data.files || [];
    // Meet names the file after the event title, so prefer that one.
    const title = event.summary.trim().toLowerCase();
    const best = files.find((f) => title && (f.name || "").toLowerCase().startsWith(title)) || files[0];
    return best?.id ? { fileId: best.id, title: best.name || "" } : null;
  } catch (e) {
    rethrowDriveError(e);
  }
};

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
}

/** Add the recording to the client's files (id rec_{sessionId}) and tell the client. */
export const publishMeetRecording: RecordingPublisher = async ({ session, fileId, clientName, sessionNumber }) => {
  const db = getDb();
  const id = `rec_${session.id}`.slice(0, 64);
  const ref = db.collection(CLIENT_FILES).doc(id);
  const existing = await ref.get();
  if (existing.exists) return id;
  const sessionDate = new Date(session.scheduledAt).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const title = `Session ${sessionNumber} · ${dayLabel(session.scheduledAt)}`;
  await ref.set({
    email: session.clientId,
    kind: "recording",
    title,
    note: "",
    sessionDate,
    url: null,
    storagePath: null,
    driveFileId: fileId,
    sessionId: session.id,
    source: "meet_auto",
    hidden: false,
    fileName: null,
    contentType: "video/mp4",
    size: null,
    createdAt: new Date().toISOString(),
  });

  if (!(await automatedSendBlockedByManualOnly(session.clientId).catch(() => true))) {
    const first = clientName.trim().split(/\s+/)[0] || "there";
    const link = `${getSiteOrigin()}/account`;
    await sendEmail({
      to: session.clientId,
      purpose: "transactional",
      subject: `Your replay is ready: ${title}`,
      text: `Hi ${first},\n\nThe recording of your coaching session on ${dayLabel(session.scheduledAt)} is ready. Watch it in your account: ${link}\n\nDavid\nDeFi University\n\nEducation only. This is not financial advice.`,
      html: `<p>Hi ${first.replace(/[<>&"]/g, "")},</p><p>The recording of your coaching session on ${dayLabel(session.scheduledAt)} is ready.</p><p><a href="${link}">Watch it in your account</a></p><p>David<br>DeFi University</p><p>Education only. This is not financial advice.</p>`,
      log: { source: "coaching_replay_ready" },
    }).catch((e) => console.error("[meet-recordings] replay email failed", e));
  }
  return id;
};

/**
 * Stream a Drive video, honoring a Range header so the browser can seek.
 * Returns the upstream status (200 or 206) and the headers to pass on.
 */
export async function streamDriveFile(
  fileId: string,
  range: string | null
): Promise<{ status: number; headers: Record<string, string>; body: ReadableStream<Uint8Array> }> {
  const drive = google.drive({ version: "v3", auth: workspaceAuth() });
  try {
    const meta = await drive.files.get({ fileId, fields: "id,name,mimeType,size" });
    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream", ...(range ? { headers: { Range: range } } : {}) }
    );
    const headers: Record<string, string> = {
      "Content-Type": meta.data.mimeType?.startsWith("video/") ? meta.data.mimeType : "video/mp4",
      "Accept-Ranges": "bytes",
    };
    const upstream = res.headers as Record<string, string | undefined>;
    if (upstream["content-range"]) headers["Content-Range"] = String(upstream["content-range"]);
    if (upstream["content-length"]) headers["Content-Length"] = String(upstream["content-length"]);
    else if (!range && meta.data.size) headers["Content-Length"] = String(meta.data.size);
    const { Readable } = await import("stream");
    return {
      status: res.status === 206 ? 206 : 200,
      headers,
      body: Readable.toWeb(res.data as unknown as import("stream").Readable) as ReadableStream<Uint8Array>,
    };
  } catch (e) {
    rethrowDriveError(e);
  }
}
