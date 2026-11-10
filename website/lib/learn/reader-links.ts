import { randomBytes } from "node:crypto";
import type { NextResponse } from "next/server";
import { getDb, leadDocId } from "@/lib/firebase-admin";

/**
 * Links in follow-up emails and texts open exercises in whatever browser the
 * lead taps them in (the mail app's or the SMS app's browser is rarely the
 * one they used on X). Each lead gets one short random token on their lead
 * record; /r/<token>/<path> looks it up, sets the reader cookie when the lead
 * has given a mobile (mobile is required to open exercises), and redirects.
 */
export const READER_LINK_FIELD = "readerLinkToken";
export const GATE_EMAIL_COOKIE = "fatb_gate_email";

const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newReaderLinkToken(): string {
  const bytes = randomBytes(12);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export function isReaderLinkToken(value: string): boolean {
  return /^[a-km-zA-HJ-NP-Z2-9]{12}$/.test(value);
}

function safeDecode(s: string): string | null {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
}

/** Only site paths a follow-up links to; anything else goes to the library. */
export function safeReaderPath(segments: string[]): string {
  const decoded = segments.map(safeDecode);
  if (decoded.some((s) => s === null || s === "" || s.includes(".."))) return "/university";
  const path = `/${(decoded as string[]).map((s) => encodeURIComponent(s)).join("/")}`;
  return /^\/(university|coaching)(\/[A-Za-z0-9._~%-]+)*$/.test(path) ? path : "/university";
}

/** Rewrite a site URL so it goes through the lead's reader link. Leaves other URLs alone. */
export function withReaderToken(url: string, token: string | null | undefined, origin: string): string {
  if (!token) return url;
  const u = new URL(url, origin);
  if (u.origin !== new URL(origin).origin || !u.pathname.startsWith("/university/")) return url;
  u.pathname = `/r/${token}${u.pathname}`;
  return u.toString();
}

/** The lead's token, made on first use. Null when there is no lead. */
export async function readerLinkTokenFor(email: string): Promise<string | null> {
  const ref = getDb().collection("leads").doc(leadDocId(email));
  const snap = await ref.get();
  if (!snap.exists) return null;
  const existing = snap.data()?.[READER_LINK_FIELD];
  if (typeof existing === "string" && isReaderLinkToken(existing)) return existing;
  const token = newReaderLinkToken();
  await ref.set({ [READER_LINK_FIELD]: token }, { merge: true });
  return token;
}

export async function leadForReaderLink(
  token: string
): Promise<{ email: string; hasPhone: boolean; status?: string } | null> {
  if (!isReaderLinkToken(token)) return null;
  const snap = await getDb().collection("leads").where(READER_LINK_FIELD, "==", token).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) return null;
  const data = doc.data();
  return { email: String(data.email || doc.id), hasPhone: Boolean(data.phone), status: data.status as string | undefined };
}

/** Hand the email to the lesson form (step two) for a lead with no mobile yet. */
export function applyGateEmailCookie(response: NextResponse, email: string): void {
  response.cookies.set(GATE_EMAIL_COOKIE, email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });
}
