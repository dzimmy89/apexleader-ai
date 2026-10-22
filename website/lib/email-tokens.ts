import { hkdfSync } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { URLS } from "@/content/site";
import { getSiteOrigin } from "@/lib/env";

export const LEAD_CONFIRM_PURPOSE = "lead_confirm" as const;
export const UNSUBSCRIBE_PURPOSE = "unsubscribe" as const;
export const EMAIL_TOKEN_AUD = "apex-email-tokens";
export const EMAIL_TOKEN_ISS = "apexleader.ai";

export type EmailTokenPurpose =
  | typeof LEAD_CONFIRM_PURPOSE
  | typeof UNSUBSCRIBE_PURPOSE;

const CONFIRM_TTL = "7d";

export function emailTokenSecretAvailable(): boolean {
  return Boolean(process.env.JWT_SECRET);
}

/**
 * Dedicated signing key derived with HKDF from JWT_SECRET.
 * No hardcoded fallback. ADMIN_PASSWORD is not used.
 */
function getEmailTokenSecret(): Uint8Array {
  const ikm = process.env.JWT_SECRET;
  if (!ikm) {
    throw new Error("missing_email_token_secret");
  }
  return new Uint8Array(
    hkdfSync(
      "sha256",
      ikm,
      "apex-email-tokens-salt",
      "apex-email-token-key",
      32
    )
  );
}

export async function signEmailToken(
  email: string,
  purpose: EmailTokenPurpose
): Promise<string> {
  if (!emailTokenSecretAvailable()) {
    throw new Error("missing_email_token_secret");
  }
  const normalized = email.trim().toLowerCase();
  const jwt = new SignJWT({ email: normalized, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(normalized)
    .setAudience(EMAIL_TOKEN_AUD)
    .setIssuer(EMAIL_TOKEN_ISS)
    .setIssuedAt();
  if (purpose === LEAD_CONFIRM_PURPOSE) {
    jwt.setExpirationTime(CONFIRM_TTL);
  }
  return jwt.sign(getEmailTokenSecret());
}

export async function verifyEmailToken(
  token: string,
  purpose: EmailTokenPurpose
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  if (!token) return { ok: false, error: "missing_token" };
  if (!emailTokenSecretAvailable()) {
    return { ok: false, error: "missing_email_token_secret" };
  }
  try {
    const { payload } = await jwtVerify(token, getEmailTokenSecret(), {
      algorithms: ["HS256"],
      audience: EMAIL_TOKEN_AUD,
      issuer: EMAIL_TOKEN_ISS,
    });
    if (payload.purpose !== purpose) {
      return { ok: false, error: "wrong_purpose" };
    }
    const email = String(payload.email || payload.sub || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      return { ok: false, error: "invalid_email" };
    }
    return { ok: true, email };
  } catch {
    return { ok: false, error: "invalid_or_expired" };
  }
}

export async function confirmUrlFor(email: string): Promise<string> {
  const token = await signEmailToken(email, LEAD_CONFIRM_PURPOSE);
  return `${getSiteOrigin()}/api/lead/confirm?token=${encodeURIComponent(token)}`;
}

export async function unsubscribeUrlFor(email: string): Promise<string> {
  const token = await signEmailToken(email, UNSUBSCRIBE_PURPOSE);
  return `${getSiteOrigin()}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function unsubscribeMailto(): string {
  return URLS.unsubscribeMailto;
}

export function listUnsubscribeHeaderValue(httpsUrl: string): string {
  return `<${httpsUrl}>, <${unsubscribeMailto()}>`;
}
