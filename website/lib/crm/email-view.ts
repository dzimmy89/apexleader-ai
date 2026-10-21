import { google, type gmail_v1 } from "googleapis";
import { SENDER_EMAIL } from "@/lib/env";
import { getDb } from "@/lib/firebase-admin";
import { EMAIL_BODIES } from "@/lib/gmail";

/**
 * One sent email as the recipient got it, for the admin email viewer.
 *
 * Emails sent since bodies were stored come from email_bodies. Older ones
 * only have a subject and a Gmail message id, so they are read back from
 * hello@'s Sent mail, which needs the gmail.readonly scope on the service
 * account's domain-wide delegation. Without it the viewer says so.
 */
export const GMAIL_READ_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export interface SentEmailView {
  id: string;
  to: string;
  subject: string;
  status: string;
  source: string;
  sentAt: string;
  html: string | null;
  text: string | null;
  /** Where the body came from, or why there is none. */
  bodyFrom: "stored" | "gmail" | "missing" | "gmail_access_needed";
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function decode(data: string | null | undefined): string {
  return data ? Buffer.from(data, "base64url").toString("utf-8") : "";
}

/** The text/html and text/plain parts of a Gmail message payload. */
export function bodiesFromPayload(payload: gmail_v1.Schema$MessagePart | undefined): { html: string; text: string } {
  let html = "";
  let text = "";
  const walk = (part: gmail_v1.Schema$MessagePart | undefined) => {
    if (!part) return;
    if (part.mimeType === "text/html" && !html) html = decode(part.body?.data);
    else if (part.mimeType === "text/plain" && !text) text = decode(part.body?.data);
    for (const child of part.parts || []) walk(child);
  };
  walk(payload);
  return { html, text };
}

function gmailReader() {
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
    scopes: [GMAIL_READ_SCOPE],
    clientOptions: { subject: SENDER_EMAIL },
  });
  return google.gmail({ version: "v1", auth });
}

let gmailFetchForTests: ((messageId: string) => Promise<{ html: string; text: string }>) | undefined;

export function setGmailFetchForTests(fn: typeof gmailFetchForTests): void {
  if (process.env.NODE_ENV === "production") return;
  gmailFetchForTests = fn;
}

async function fetchFromGmail(messageId: string): Promise<{ html: string; text: string }> {
  if (gmailFetchForTests) return gmailFetchForTests(messageId);
  const gmail = gmailReader();
  if (!gmail) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  const res = await gmail.users.messages.get({ userId: "me", id: messageId, format: "full" });
  return bodiesFromPayload(res.data.payload);
}

export async function getSentEmail(id: string): Promise<SentEmailView | null> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  const db = getDb();
  const [logSnap, bodySnap] = await Promise.all([
    db.collection("emailLog").doc(id).get(),
    db.collection(EMAIL_BODIES).doc(id).get(),
  ]);
  if (!logSnap.exists) return null;
  const log = (logSnap.data() || {}) as Record<string, unknown>;
  const view: SentEmailView = {
    id,
    to: str(log.to),
    subject: str(log.subject),
    status: str(log.status),
    source: str(log.source),
    sentAt: str(log.sentAt),
    html: null,
    text: str(log.bodyText) || null,
    bodyFrom: "missing",
  };
  if (bodySnap.exists) {
    const body = (bodySnap.data() || {}) as Record<string, unknown>;
    return { ...view, html: str(body.html) || null, text: str(body.text) || view.text, bodyFrom: "stored" };
  }
  const messageId = str(log.messageId);
  if (!messageId || messageId === "dev-log-only") return view;
  try {
    const fetched = await fetchFromGmail(messageId);
    if (!fetched.html && !fetched.text) return view;
    // Save it so the next open does not call Gmail again.
    await db.collection(EMAIL_BODIES).doc(id).set({
      to: view.to,
      subject: view.subject,
      html: fetched.html.slice(0, 900_000),
      text: fetched.text.slice(0, 200_000),
      sentAt: view.sentAt,
      messageId,
      fetchedFromGmail: true,
    });
    return { ...view, html: fetched.html || null, text: fetched.text || view.text, bodyFrom: "gmail" };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (/unauthorized_client|insufficient|access_denied|invalid_scope|permission|403|401/i.test(message)) {
      return { ...view, bodyFrom: "gmail_access_needed" };
    }
    console.error("[email-view] gmail fetch failed", message);
    return view;
  }
}
