import { google } from "googleapis";
import { getDb } from "@/lib/firebase-admin";
import { SENDER_EMAIL, SENDER_NAME } from "@/lib/env";
import { isSuppressed } from "@/lib/suppression";
import { buildMimeHeaders } from "@/lib/email-mime";
import { evaluateSendGates } from "@/lib/send-gates";
import { manualOnlyBlockReason } from "@/lib/crm/contacts";

export interface SendEmailLog {
  source: string;
  stepId?: string;
  flowType?: string;
  flowDocId?: string;
  userId?: string;
  crmContactId?: string;
  actor?: string;
  bodyText?: string;
  approvedByDavid?: boolean;
  holdingsEducationAck?: boolean;
  holdingsHits?: string[];
  personalOfferAck?: boolean;
  personalOfferHits?: string[];
  adKind?: string;
}

export type EmailPurpose = "marketing" | "transactional";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
  unsubscribeUrl?: string;
  purpose?: EmailPurpose;
  /** When true, apply MARKETING_SENDS_ENABLED + postal/token guards even for transactional mail. */
  requireSendEnabled?: boolean;
  /**
   * Bypass the crm_contacts.manualOnly guard. Only for an explicit 1:1 admin
   * compose. Broadcast, template tests, crons, capture, and coaching mail
   * must omit this flag.
   */
  allowManualOnlyContact?: boolean;
  log: SendEmailLog;
}

export interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  /** When false, caller should not retry. Defaults to true for unknown errors. */
  retryable?: boolean;
  /** Gmail message id when the provider accepted the send. */
  messageId?: string;
  /** Gmail thread id when the provider accepted the send. */
  threadId?: string;
}

function getGmailClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    try {
      credentials = JSON.parse(raw);
    } catch (e) {
      console.error("[gmail] invalid GOOGLE_SERVICE_ACCOUNT_KEY", e);
      return null;
    }
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    clientOptions: { subject: SENDER_EMAIL },
  });

  return google.gmail({ version: "v1", auth });
}

export { buildMimeHeaders } from "@/lib/email-mime";

export function buildMime(opts: SendEmailOptions): string {
  const boundary = "apex_boundary_" + Date.now();
  const headers = buildMimeHeaders({
    fromEmail: opts.fromEmail || SENDER_EMAIL,
    fromName: opts.fromName || SENDER_NAME,
    to: opts.to,
    subject: opts.subject,
    unsubscribeUrl: opts.unsubscribeUrl,
    purpose: opts.purpose,
  });

  if (opts.text) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    const body = [
      headers.join("\r\n"),
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "",
      opts.text,
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "",
      opts.html,
      `--${boundary}--`,
    ].join("\r\n");
    return Buffer.from(body).toString("base64url");
  }

  headers.push("Content-Type: text/html; charset=UTF-8");
  const body = headers.join("\r\n") + "\r\n\r\n" + opts.html;
  return Buffer.from(body).toString("base64url");
}

/** email_bodies/{emailLogId}: the HTML and text of each sent email. */
export const EMAIL_BODIES = "email_bodies";

async function writeEmailLog(
  opts: SendEmailOptions,
  status: "sent" | "failed" | "skipped",
  extra?: { error?: string; messageId?: string; threadId?: string }
): Promise<void> {
  try {
    const db = getDb();
    const ref = await db.collection("emailLog").add({
      to: opts.to,
      subject: opts.subject,
      status,
      source: opts.log.source,
      sentAt: new Date().toISOString(),
      stepId: opts.log.stepId ?? null,
      flowType: opts.log.flowType ?? null,
      flowDocId: opts.log.flowDocId ?? null,
      userId: opts.log.userId ?? null,
      error: extra?.error ?? null,
      messageId: extra?.messageId ?? null,
      threadId: extra?.threadId ?? null,
      crmContactId: opts.log.crmContactId ?? null,
      actor: opts.log.actor ?? null,
      bodyText: opts.log.bodyText ?? null,
      approvedByDavid: opts.log.approvedByDavid ?? null,
      holdingsEducationAck: opts.log.holdingsEducationAck ?? null,
      holdingsHits: opts.log.holdingsHits ?? null,
      personalOfferAck: opts.log.personalOfferAck ?? null,
      personalOfferHits: opts.log.personalOfferHits ?? null,
      adKind: opts.log.adKind ?? null,
    });
    // Keep exactly what went out so the admin can open it later. Kept apart
    // from emailLog so timeline queries stay small.
    if (status === "sent") {
      await db.collection(EMAIL_BODIES).doc(ref.id).set({
        to: opts.to,
        subject: opts.subject,
        html: opts.html.slice(0, 900_000),
        text: (opts.text || "").slice(0, 200_000),
        sentAt: new Date().toISOString(),
        messageId: extra?.messageId ?? null,
      });
    }
  } catch (e) {
    console.error("[gmail] emailLog write failed", e);
  }
}

/** Classify Gmail/API errors for retry policy. */
export function isRetryableSendError(message: string): boolean {
  const m = message.toLowerCase();
  if (
    m.includes("gmail not configured") ||
    m.includes("invalid_grant") ||
    m.includes("unauthorized_client") ||
    m.includes("access_denied") ||
    m.includes("forbidden") ||
    m.includes("invalid argument") ||
    m.includes("invalid_request")
  ) {
    return false;
  }
  if (
    m.includes("429") ||
    m.includes("rate") ||
    m.includes("quota") ||
    m.includes("503") ||
    m.includes("500") ||
    m.includes("backend error") ||
    m.includes("timeout") ||
    m.includes("econnreset") ||
    m.includes("socket")
  ) {
    return true;
  }
  // Unknown errors: allow capped retries.
  return true;
}

let sendEmailForTests: ((opts: SendEmailOptions) => Promise<SendEmailResult>) | undefined;

/** Test-only: intercept Gmail sends without hitting the provider. */
export function setSendEmailForTests(
  fn: ((opts: SendEmailOptions) => Promise<SendEmailResult>) | undefined
): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  sendEmailForTests = fn;
}

export async function sendEmail(
  opts: SendEmailOptions
): Promise<SendEmailResult> {
  const to = opts.to.trim().toLowerCase();
  const purpose = opts.purpose ?? "transactional";
  if (!opts.allowManualOnlyContact) {
    const manualBlock = await manualOnlyBlockReason(
      to,
      purpose === "marketing" ? "confirmed_or_paid" : "self_signup"
    );
    if (manualBlock) {
      await writeEmailLog(opts, "skipped", { error: manualBlock });
      return {
        ok: false,
        skipped: true,
        error: manualBlock,
        retryable: false,
      };
    }
  }
  const suppressedEarly = await isSuppressed(to);
  if (suppressedEarly) {
    await writeEmailLog(opts, "skipped", { error: "suppressed" });
    return {
      ok: false,
      skipped: true,
      error: "suppressed",
      retryable: false,
    };
  }
  if (sendEmailForTests) {
    const result = await sendEmailForTests(opts);
    if (opts.log.source === "admin_1to1") {
      if (result.ok) {
        await writeEmailLog(opts, "sent", {
          messageId: result.messageId,
          threadId: result.threadId,
        });
      } else if (result.skipped) {
        await writeEmailLog(opts, "skipped", { error: result.error });
      } else {
        await writeEmailLog(opts, "failed", { error: result.error });
      }
    }
    return result;
  }
  const gate = evaluateSendGates({
    purpose,
    requireSendEnabled: opts.requireSendEnabled,
    suppressed: false,
    unsubscribeUrl: opts.unsubscribeUrl,
  });
  if (gate.skip) {
    await writeEmailLog(opts, "skipped", { error: gate.error });
    return {
      ok: false,
      skipped: true,
      error: gate.error,
      retryable: false,
    };
  }

  const gmail = getGmailClient();
  if (!gmail) {
    if (process.env.NODE_ENV === "production") {
      await writeEmailLog(opts, "failed", { error: "Gmail not configured" });
      return {
        ok: false,
        error: "Gmail not configured",
        retryable: false,
      };
    }
    console.warn("[gmail] dev mode — logging only", opts.subject, to);
    await writeEmailLog(opts, "sent", { messageId: "dev-log-only", threadId: "dev-log-only" });
    return { ok: true, messageId: "dev-log-only", threadId: "dev-log-only" };
  }

  try {
    const sent = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: buildMime({ ...opts, to, purpose }) },
    });
    const messageId = sent.data.id || undefined;
    const threadId = sent.data.threadId || undefined;
    await writeEmailLog(opts, "sent", { messageId, threadId });
    return { ok: true, messageId, threadId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await writeEmailLog(opts, "failed", { error: msg });
    // Do not record rate_limit suppression — that permanently skipped flow steps.
    return {
      ok: false,
      error: msg,
      retryable: isRetryableSendError(msg),
    };
  }
}
