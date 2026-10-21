import { getDb } from "@/lib/firebase-admin";
import { ACCOUNTS, normalizeEmail, readLinkedEmails } from "@/lib/account/access";

/**
 * More than one email on one account.
 *
 * account_links/{alias}: { primary } for every confirmed extra email.
 * learn_accounts/{primary}.linkedEmails lists the aliases. Signing in with
 * an alias opens the primary account; access and coaching records
 * are read across all of them (getAccess).
 */
export const ACCOUNT_LINKS = "account_links";
export const MAX_LINKED_EMAILS = 5;

/** The account an email signs in to: its primary when linked, else itself. */
export async function primaryEmailFor(rawEmail: string): Promise<string> {
  const email = normalizeEmail(rawEmail);
  const snap = await getDb().collection(ACCOUNT_LINKS).doc(email).get();
  const primary = snap.exists ? String((snap.data() || {}).primary || "") : "";
  return primary ? normalizeEmail(primary) : email;
}

/** Why `alias` cannot be added to `primary`, or null when it can. */
export async function linkBlocker(rawPrimary: string, rawAlias: string): Promise<string | null> {
  const primary = normalizeEmail(rawPrimary);
  const alias = normalizeEmail(rawAlias);
  if (alias === primary) return "That is already the email you are signed in with.";
  const db = getDb();
  const [primarySnap, aliasSnap, aliasLink] = await Promise.all([
    db.collection(ACCOUNTS).doc(primary).get(),
    db.collection(ACCOUNTS).doc(alias).get(),
    db.collection(ACCOUNT_LINKS).doc(alias).get(),
  ]);
  const linked = readLinkedEmails(primarySnap.data());
  if (linked.includes(alias)) return "That email is already on your account.";
  if (linked.length >= MAX_LINKED_EMAILS) return `An account can have up to ${MAX_LINKED_EMAILS} extra emails.`;
  if (aliasLink.exists) return "That email is already part of another account. Sign in with it and remove it there first.";
  if (readLinkedEmails(aliasSnap.data()).length) {
    return "That email has its own extra emails. Sign in with it and add this email there instead.";
  }
  return null;
}

/** Join `alias` to `primary`. Callers confirm the alias owns the inbox first. */
export async function linkEmail(rawPrimary: string, rawAlias: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const primary = normalizeEmail(rawPrimary);
  const alias = normalizeEmail(rawAlias);
  const blocker = await linkBlocker(primary, alias);
  if (blocker) return { ok: false, error: blocker };
  const db = getDb();
  const now = new Date().toISOString();
  const primaryRef = db.collection(ACCOUNTS).doc(primary);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(primaryRef);
    const linked = readLinkedEmails(snap.data());
    tx.set(db.collection(ACCOUNT_LINKS).doc(alias), { primary, linkedAt: now });
    tx.set(
      primaryRef,
      {
        email: primary,
        linkedEmails: [...new Set([...linked, alias])],
        ...(snap.exists ? {} : { createdAt: now, grants: [] }),
        updatedAt: now,
      },
      { merge: true }
    );
  });
  return { ok: true };
}

export async function unlinkEmail(rawPrimary: string, rawAlias: string): Promise<boolean> {
  const primary = normalizeEmail(rawPrimary);
  const alias = normalizeEmail(rawAlias);
  const db = getDb();
  const primaryRef = db.collection(ACCOUNTS).doc(primary);
  const linkRef = db.collection(ACCOUNT_LINKS).doc(alias);
  return db.runTransaction(async (tx) => {
    const [snap, link] = await Promise.all([tx.get(primaryRef), tx.get(linkRef)]);
    const linked = readLinkedEmails(snap.data());
    if (!linked.includes(alias)) return false;
    tx.set(primaryRef, { linkedEmails: linked.filter((e) => e !== alias), updatedAt: new Date().toISOString() }, { merge: true });
    if (link.exists && normalizeEmail(String((link.data() || {}).primary || "")) === primary) tx.delete(linkRef);
    return true;
  });
}
