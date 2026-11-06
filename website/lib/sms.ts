import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/firebase-admin";

/**
 * Texts through Twilio. Credentials come from Secret Manager as
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER (E.164). If any
 * is missing, or SMS_SENDS_ENABLED is not true, every send is skipped cleanly
 * and the flow step is marked skipped, so nothing piles up to go out late.
 *
 * Opt-outs live in sms_suppressions/<E.164>, written by the inbound webhook
 * (STOP) and by Twilio's 21610 error ("recipient unsubscribed").
 */

export const SMS_SENDS_ENV = "SMS_SENDS_ENABLED";
export const SMS_SUPPRESSIONS = "sms_suppressions";
export const SMS_LOG = "smsLog";

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  from: string;
}

export function twilioConfig(env: Record<string, string | undefined> = process.env): TwilioConfig | null {
  const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = env.TWILIO_AUTH_TOKEN?.trim();
  const from = env.TWILIO_FROM_NUMBER?.trim();
  if (!accountSid || !authToken || !from) return null;
  return { accountSid, authToken, from };
}

/** Why texts can't go out right now, or null when they can. Not per-number. */
export function smsSendBlockReason(env: Record<string, string | undefined> = process.env): string | null {
  const v = env[SMS_SENDS_ENV];
  if (v !== "true" && v !== "1") return "sms_sends_disabled";
  if (!twilioConfig(env)) return "sms_not_configured";
  return null;
}

/**
 * Texts only go out 11am to 8pm Eastern, which is 8am to 5pm Pacific: inside
 * the 8am to 9pm window for every US time zone on the mainland.
 */
export function isInsideTextingHours(nowMs: number): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hourCycle: "h23" }).format(
      new Date(nowMs)
    )
  );
  return hour >= 11 && hour < 20;
}

/** STOP words carriers and Twilio treat as opt-out; START words opt back in. */
const STOP_WORDS = new Set(["stop", "stopall", "unsubscribe", "cancel", "end", "quit", "optout", "revoke"]);
const START_WORDS = new Set(["start", "unstop"]);

export function classifyInboundText(body: string): "stop" | "start" | "help" | "message" {
  const word = body.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (STOP_WORDS.has(word)) return "stop";
  if (START_WORDS.has(word)) return "start";
  if (word === "help" || word === "info") return "help";
  return "message";
}

export async function isSmsSuppressed(phone: string): Promise<boolean> {
  try {
    const doc = await getDb().collection(SMS_SUPPRESSIONS).doc(phone).get();
    return doc.exists;
  } catch (e) {
    console.error("[sms] suppression lookup failed", phone, e);
    return true;
  }
}

export async function recordSmsOptOut(phone: string, reason: string): Promise<void> {
  const nowIso = new Date().toISOString();
  const db = getDb();
  await db.collection(SMS_SUPPRESSIONS).doc(phone).set({ reason, updatedAt: nowIso }, { merge: true });
  // Mark every lead on this number so Mission Control shows it.
  const leads = await db.collection("leads").where("phone", "==", phone).get();
  const batch = db.batch();
  leads.docs.forEach((d) => batch.set(d.ref, { smsOptOutAt: nowIso, smsConsent: { ...(d.data().smsConsent || {}), given: false } }, { merge: true }));
  if (!leads.empty) await batch.commit();
}

export async function clearSmsOptOut(phone: string): Promise<void> {
  await getDb().collection(SMS_SUPPRESSIONS).doc(phone).delete();
}

export interface SendSmsOptions {
  to: string;
  body: string;
  log: { source: string; stepId?: string; flowType?: string; flowDocId?: string; userId?: string; email?: string };
}

export interface SendSmsResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  retryable?: boolean;
  messageId?: string;
}

/** Twilio error codes that mean "never text this number again". */
const OPTED_OUT_CODES = new Set([21610]);
/** Twilio error codes for a number that can't get texts (landline, invalid). */
const UNDELIVERABLE_CODES = new Set([21211, 21614, 21612, 21408]);

export async function sendSms(opts: SendSmsOptions, deps: { fetch?: typeof fetch } = {}): Promise<SendSmsResult> {
  const blocked = smsSendBlockReason();
  const config = twilioConfig();
  if (blocked || !config) return logSms(opts, { ok: false, skipped: true, error: blocked || "sms_not_configured" });
  if (!/^\+\d{8,15}$/.test(opts.to)) return logSms(opts, { ok: false, skipped: true, error: "invalid_phone" });
  if (await isSmsSuppressed(opts.to)) return logSms(opts, { ok: false, skipped: true, error: "sms_opted_out" });

  const doFetch = deps.fetch ?? fetch;
  let result: SendSmsResult;
  try {
    const res = await doFetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(config.accountSid)}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: opts.to, From: config.from, Body: opts.body }).toString(),
    });
    const data = (await res.json().catch(() => ({}))) as { sid?: string; code?: number; message?: string };
    if (res.ok && data.sid) {
      result = { ok: true, messageId: data.sid };
    } else if (data.code && OPTED_OUT_CODES.has(data.code)) {
      await recordSmsOptOut(opts.to, "twilio_21610").catch((e) => console.error("[sms] opt-out write", e));
      result = { ok: false, skipped: true, error: "sms_opted_out" };
    } else if (data.code && UNDELIVERABLE_CODES.has(data.code)) {
      result = { ok: false, error: `twilio_${data.code}`, retryable: false };
    } else {
      result = { ok: false, error: `twilio_${data.code ?? res.status}: ${data.message ?? "send failed"}`, retryable: res.status >= 500 || res.status === 429 };
    }
  } catch (e) {
    result = { ok: false, error: e instanceof Error ? e.message : String(e), retryable: true };
  }
  return logSms(opts, result);
}

async function logSms(opts: SendSmsOptions, result: SendSmsResult): Promise<SendSmsResult> {
  try {
    await getDb()
      .collection(SMS_LOG)
      .add({
        to: opts.to,
        body: opts.body,
        direction: "outbound",
        status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
        error: result.error ?? null,
        twilioSid: result.messageId ?? null,
        sentAt: new Date().toISOString(),
        ...opts.log,
      });
  } catch (e) {
    console.error("[sms] log write failed", e);
  }
  return result;
}

/**
 * Twilio request signature: base64 HMAC-SHA1 of the full webhook URL followed
 * by every POST param name and value, sorted by name, keyed by the auth token.
 */
export function twilioSignature(authToken: string, url: string, params: Record<string, string>): string {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], url);
  return createHmac("sha1", authToken).update(Buffer.from(data, "utf-8")).digest("base64");
}

export function verifyTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string | null
): boolean {
  if (!signature) return false;
  const expected = Buffer.from(twilioSignature(authToken, url, params));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
