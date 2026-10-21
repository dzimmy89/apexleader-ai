import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/lib/firebase-admin";
import { getSiteOrigin } from "@/lib/env";
import { sendEmail } from "@/lib/gmail";
import { escapeHtml } from "@/lib/html";
import { ACCOUNTS, normalizeEmail } from "@/lib/account/access";
import { linkEmail, primaryEmailFor } from "@/lib/account/links";

/** learn_login_tokens/{sha256(token)}: one-time sign-in links, 30 minutes. */
const TOKENS = "learn_login_tokens";
const TOKEN_TTL_MS = 30 * 60 * 1000;

export function hashLoginToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Only same-site paths, never protocol-relative or admin. */
export function safeNextPath(next: unknown): string {
  const value = typeof next === "string" ? next : "";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/admin") || value.startsWith("/api")) {
    return "/account";
  }
  return value.slice(0, 300);
}

/**
 * Email a one-time sign-in link. With `linkTo`, the link instead confirms
 * that `rawEmail` belongs to the signed-in account `linkTo`.
 */
export async function sendLoginLink(
  rawEmail: string,
  next: string,
  opts: { linkTo?: string } = {}
): Promise<{ ok: boolean; error?: string }> {
  const email = normalizeEmail(rawEmail);
  const linkTo = opts.linkTo ? normalizeEmail(opts.linkTo) : null;
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  await getDb()
    .collection(TOKENS)
    .doc(hashLoginToken(token))
    .set({
      email,
      next: safeNextPath(next),
      linkTo,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(),
      usedAt: null,
    });
  const url = `${getSiteOrigin()}/api/account/verify?token=${token}`;
  const sent = linkTo
    ? await sendEmail({
        to: email,
        purpose: "transactional",
        subject: "Confirm this email for your DeFi University account",
        text: `${linkTo} asked to add this email to their DeFi University account. Confirm it: ${url}\n\nAfter you confirm, signing in with either email opens the same account, and a Skool membership or coaching under this email shows there. The link works once and expires in 30 minutes. If you did not ask for this, ignore this email.\n\nEducation only. This is not financial advice.`,
        html: `<p>${escapeHtml(linkTo)} asked to add this email to their DeFi University account.</p><p><a href="${escapeHtml(url)}">Confirm this email</a></p><p>After you confirm, signing in with either email opens the same account, and a Skool membership or coaching under this email shows there. The link works once and expires in 30 minutes. If you did not ask for this, ignore this email.</p><p>Education only. This is not financial advice.</p>`,
        log: { source: "account_link", flowType: "account_login" },
      })
    : await sendEmail({
        to: email,
        purpose: "transactional",
        subject: "Your DeFi University sign-in link",
        text: `Sign in to DeFi University: ${url}\n\nThe link works once and expires in 30 minutes. If you did not ask for it, ignore this email.\n\nEducation only. This is not financial advice.`,
        html: `<p>Sign in to DeFi University:</p><p><a href="${escapeHtml(url)}">Sign in</a></p><p>The link works once and expires in 30 minutes. If you did not ask for it, ignore this email.</p><p>Education only. This is not financial advice.</p>`,
        log: { source: "account_login", flowType: "account_login" },
      });
  return sent.ok ? { ok: true } : { ok: false, error: sent.error || "Could not send the sign-in email" };
}

/** Record a sign-in on the account doc, creating it on the first one. */
export async function touchAccount(rawEmail: string, extra: Record<string, unknown> = {}): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const now = new Date().toISOString();
  const ref = getDb().collection(ACCOUNTS).doc(email);
  const account = await ref.get();
  await ref.set(
    { email, lastSignInAt: now, ...extra, ...(account.exists ? {} : { createdAt: now, grants: [] }) },
    { merge: true }
  );
}

/**
 * Use a sign-in token once. Returns the account email to sign in as (the
 * primary when the email is linked) and where to go next. A link token adds
 * the email to its account first; `linkError` says why when it could not.
 */
export async function redeemLoginToken(
  token: string
): Promise<{ email: string; next: string; linked?: string; linkError?: string } | null> {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const db = getDb();
  const ref = db.collection(TOKENS).doc(hashLoginToken(token));
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const data = snap.data() as Record<string, unknown>;
    if (data.usedAt) return null;
    if (new Date(String(data.expiresAt)).getTime() < Date.now()) return null;
    tx.update(ref, { usedAt: new Date().toISOString() });
    return {
      email: String(data.email),
      next: safeNextPath(data.next),
      linkTo: typeof data.linkTo === "string" && data.linkTo ? data.linkTo : null,
    };
  });
  if (!result) return null;
  if (result.linkTo) {
    const linked = await linkEmail(result.linkTo, result.email);
    await touchAccount(result.linkTo);
    return linked.ok
      ? { email: result.linkTo, next: "/account", linked: result.email }
      : { email: result.linkTo, next: "/account", linkError: linked.error };
  }
  const email = await primaryEmailFor(result.email);
  await touchAccount(email);
  return { email, next: result.next };
}
