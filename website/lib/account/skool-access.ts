import { getDb } from "@/lib/firebase-admin";
import { ACCOUNTS, grantIsLive, normalizeEmail, readAccount } from "@/lib/account/access";
import { membershipPlan, URLS } from "@/content/site";
import { escapeHtml } from "@/lib/html";
import type { SendEmailOptions, SendEmailResult } from "@/lib/gmail";

/**
 * Skool community access for private coaching clients.
 *
 * Skool has no API and Zapier can invite but never remove, so the site keeps
 * one record per client with the window it should last (the coaching period,
 * same end date as course access) and tells the coach whom to add and remove.
 *
 * skool_access/{email}
 *   status: to_add -> invited (Zapier sent the invite) -> in_skool -> removed
 *           keep = already a paying Skool member before coaching; never removed
 *   endsAt: later end date wins, so a second package never shortens access
 */
export const SKOOL_ACCESS = "skool_access";
export const SKOOL_SETTINGS = { collection: "app_state", doc: "skool_settings" } as const;
export const ENDING_SOON_DAYS = 7;
const DAY = 86_400_000;

export type SkoolStatus = "to_add" | "invited" | "in_skool" | "removed" | "keep";
/** What the coach needs to do now, derived from status and dates. */
export type SkoolQueue = "add" | "remove" | "ending" | "active" | "keep" | "removed" | "lapsed";

export interface SkoolHistoryEntry {
  at: string;
  action: string;
  by: string;
}

export interface SkoolAccessRecord {
  email: string;
  name?: string;
  packageId: string | null;
  startsAt: string;
  endsAt: string;
  status: SkoolStatus;
  invitedAt?: string | null;
  addedAt?: string | null;
  removedAt?: string | null;
  headsUpSentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  history: SkoolHistoryEntry[];
}

export interface SkoolSettings {
  /** Zapier "Catch Hook" URL whose Zap runs Skool's Invite Member action. */
  inviteHookUrl: string | null;
  /** Email clients 7 days before their Skool and course access end. */
  headsUpEmails: boolean;
}

const STATUSES = new Set<SkoolStatus>(["to_add", "invited", "in_skool", "removed", "keep"]);

export function readSkoolRecord(email: string, data: Record<string, unknown> | undefined): SkoolAccessRecord | null {
  if (!data) return null;
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  const status = STATUSES.has(data.status as SkoolStatus) ? (data.status as SkoolStatus) : "to_add";
  return {
    email,
    ...(str(data.name) ? { name: str(data.name)! } : {}),
    packageId: str(data.packageId),
    startsAt: str(data.startsAt) || "",
    endsAt: str(data.endsAt) || "",
    status,
    invitedAt: str(data.invitedAt),
    addedAt: str(data.addedAt),
    removedAt: str(data.removedAt),
    headsUpSentAt: str(data.headsUpSentAt),
    createdAt: str(data.createdAt) || undefined,
    updatedAt: str(data.updatedAt) || undefined,
    history: Array.isArray(data.history) ? (data.history as SkoolHistoryEntry[]) : [],
  };
}

export function skoolQueue(rec: SkoolAccessRecord, now = Date.now()): SkoolQueue {
  if (rec.status === "keep") return "keep";
  if (rec.status === "removed") return "removed";
  const ends = Date.parse(rec.endsAt);
  const ended = Number.isNaN(ends) || ends <= now;
  if (rec.status === "to_add") return ended ? "lapsed" : "add";
  // invited or in_skool: they may be in the group, so removal is due at the end.
  if (ended) return "remove";
  if (ends - now <= ENDING_SOON_DAYS * DAY) return "ending";
  return "active";
}

/** Short status line for the contact page. */
export function skoolLabel(rec: SkoolAccessRecord | null, now = Date.now()): string {
  if (!rec) return "Not tracked";
  const until = day(rec.endsAt);
  switch (skoolQueue(rec, now)) {
    case "add":
      return `To add (until ${until})`;
    case "remove":
      return `Remove now (ended ${until})`;
    case "ending":
      return `In Skool, ends ${until}`;
    case "active":
      return rec.status === "invited" ? `Invited, until ${until}` : `In Skool until ${until}`;
    case "keep":
      return "Paying member, keeps Skool";
    case "removed":
      return `Removed ${day(rec.removedAt || "")}`.trim();
    case "lapsed":
      return `Never added, ended ${until}`;
  }
}

function day(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function later(a: string, b: string): string {
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta)) return b;
  if (Number.isNaN(tb)) return a;
  return tb > ta ? b : a;
}

function entry(action: string, by: string, at: string): SkoolHistoryEntry {
  return { at, action, by };
}

/**
 * Start or extend a client's Skool window. Called wherever a coaching payment
 * grants course access. Returns the record and whether it now waits to be added.
 */
export async function trackCoachingSkool(
  rawEmail: string,
  input: { packageId: string; startsAt: string; endsAt: string; name?: string; by?: string; now?: Date }
): Promise<{ record: SkoolAccessRecord; created: boolean; needsAdd: boolean }> {
  const email = normalizeEmail(rawEmail);
  const db = getDb();
  const ref = db.collection(SKOOL_ACCESS).doc(email);
  const accountRef = db.collection(ACCOUNTS).doc(email);
  const nowDate = input.now || new Date();
  const now = nowDate.toISOString();
  const by = input.by || "system";
  return db.runTransaction(async (tx) => {
    const [snap, accountSnap] = await Promise.all([tx.get(ref), tx.get(accountRef)]);
    const existing = readSkoolRecord(email, snap.data());
    let record: SkoolAccessRecord;
    let created = false;
    if (!existing) {
      created = true;
      const account = readAccount(email, accountSnap.data());
      // A live Skool grant before coaching means they pay for Skool themselves.
      const paying = account.grants.some((g) => g.source === "skool" && grantIsLive(g, nowDate.getTime()));
      record = {
        email,
        ...(input.name ? { name: input.name } : {}),
        packageId: input.packageId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: paying ? "keep" : "to_add",
        invitedAt: null,
        addedAt: null,
        removedAt: null,
        headsUpSentAt: null,
        createdAt: now,
        updatedAt: now,
        history: [entry(paying ? "keep (already a paying Skool member)" : `to add (${input.packageId})`, by, now)],
      };
    } else {
      const endsAt = later(existing.endsAt, input.endsAt);
      const extended = endsAt !== existing.endsAt;
      record = {
        ...existing,
        ...(input.name && !existing.name ? { name: input.name } : {}),
        endsAt,
        packageId: extended ? input.packageId : existing.packageId,
        updatedAt: now,
      };
      if (extended) {
        record.headsUpSentAt = null;
        record.history = [...existing.history, entry(`extended to ${endsAt.slice(0, 10)} (${input.packageId})`, by, now)];
        // Coming back after removal, or after a window that lapsed: add again.
        if (existing.status === "removed" && Date.parse(endsAt) > nowDate.getTime()) {
          record.status = "to_add";
          record.removedAt = null;
          record.invitedAt = null;
          record.history.push(entry("to add again", by, now));
        }
      }
    }
    tx.set(ref, record as unknown as Record<string, unknown>);
    return { record, created, needsAdd: skoolQueue(record, nowDate.getTime()) === "add" };
  });
}

export type SkoolAction = "added" | "removed" | "keep" | "to_add";

/** The coach marks a step done (or puts someone back in the add queue). */
export async function markSkool(
  rawEmail: string,
  action: SkoolAction,
  by: string,
  now = new Date()
): Promise<SkoolAccessRecord | null> {
  const email = normalizeEmail(rawEmail);
  const db = getDb();
  const ref = db.collection(SKOOL_ACCESS).doc(email);
  const at = now.toISOString();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const rec = readSkoolRecord(email, snap.data());
    if (!rec) return null;
    const next: SkoolAccessRecord = { ...rec, updatedAt: at, history: [...rec.history, entry(action, by, at)] };
    if (action === "added") {
      next.status = "in_skool";
      next.addedAt = at;
    } else if (action === "removed") {
      next.status = "removed";
      next.removedAt = at;
    } else if (action === "keep") {
      next.status = "keep";
    } else {
      next.status = "to_add";
      next.addedAt = null;
      next.removedAt = null;
      next.invitedAt = null;
    }
    tx.set(ref, next as unknown as Record<string, unknown>);
    return next;
  });
}

/**
 * "Grant Skool access" on Members and Skool. With no end date, the client's
 * current coaching course access end date is used.
 */
export async function grantSkoolManually(
  rawEmail: string,
  input: { until?: string; name?: string; by: string; now?: Date }
): Promise<{ ok: true; record: SkoolAccessRecord } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail);
  const now = input.now || new Date();
  let endsAt: string | null = null;
  if (input.until) {
    const t = Date.parse(`${input.until}T23:59:59Z`);
    if (Number.isNaN(t)) return { ok: false, error: "Invalid end date" };
    endsAt = new Date(t).toISOString();
  } else {
    const snap = await getDb().collection(ACCOUNTS).doc(email).get();
    const coaching = readAccount(email, snap.data()).grants.find((g) => g.source === "coaching");
    endsAt = coaching?.expiresAt || null;
  }
  if (!endsAt) return { ok: false, error: "No coaching period found for this email. Pick an end date." };
  if (Date.parse(endsAt) <= now.getTime()) return { ok: false, error: "That end date has already passed" };
  const existing = readSkoolRecord(email, (await getDb().collection(SKOOL_ACCESS).doc(email).get()).data());
  const { record } = await trackCoachingSkool(email, {
    packageId: existing?.packageId || "manual",
    startsAt: existing?.startsAt || now.toISOString(),
    endsAt,
    name: input.name,
    by: input.by,
    now,
  });
  return { ok: true, record };
}

export async function getSkoolRecord(rawEmail: string): Promise<SkoolAccessRecord | null> {
  const email = normalizeEmail(rawEmail);
  const snap = await getDb().collection(SKOOL_ACCESS).doc(email).get();
  return readSkoolRecord(email, snap.data());
}

export async function listSkoolAccess(now = Date.now()): Promise<Array<SkoolAccessRecord & { queue: SkoolQueue }>> {
  const snap = await getDb().collection(SKOOL_ACCESS).limit(5000).get();
  return snap.docs
    .map((d) => readSkoolRecord(d.id, d.data()))
    .filter((r): r is SkoolAccessRecord => r !== null)
    .map((r) => ({ ...r, queue: skoolQueue(r, now) }))
    .sort((a, b) => a.endsAt.localeCompare(b.endsAt));
}

/**
 * A coaching client whose Skool seat the site manages. The Skool import and
 * webhook must not turn these into permanent "skool" members, or course
 * access would outlive the coaching period.
 */
export function isManagedSeat(rec: SkoolAccessRecord | null): boolean {
  return !!rec && (rec.status === "to_add" || rec.status === "invited" || rec.status === "in_skool");
}

/** Seen in Skool (export or Zapier): confirm the add if it was still pending. */
export async function confirmSeenInSkool(rawEmail: string, source: string, now = new Date()): Promise<void> {
  const rec = await getSkoolRecord(rawEmail);
  if (rec && (rec.status === "to_add" || rec.status === "invited")) {
    await markSkool(rec.email, "added", source, now);
  }
}

// ---------- Settings, Zapier invite, client heads-up ----------

export function validInviteHookUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === "hooks.zapier.com";
  } catch {
    return false;
  }
}

export async function getSkoolSettings(): Promise<SkoolSettings> {
  const snap = await getDb().collection(SKOOL_SETTINGS.collection).doc(SKOOL_SETTINGS.doc).get();
  const data = (snap.data() || {}) as Record<string, unknown>;
  const url = typeof data.inviteHookUrl === "string" && validInviteHookUrl(data.inviteHookUrl) ? data.inviteHookUrl : null;
  return { inviteHookUrl: url, headsUpEmails: data.headsUpEmails === true };
}

export async function saveSkoolSettings(input: Partial<SkoolSettings>): Promise<SkoolSettings> {
  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.inviteHookUrl !== undefined) patch.inviteHookUrl = input.inviteHookUrl || null;
  if (input.headsUpEmails !== undefined) patch.headsUpEmails = input.headsUpEmails === true;
  await getDb().collection(SKOOL_SETTINGS.collection).doc(SKOOL_SETTINGS.doc).set(patch, { merge: true });
  return getSkoolSettings();
}

type Poster = (url: string, body: Record<string, unknown>) => Promise<boolean>;
let posterForTests: Poster | null = null;
export function setSkoolInvitePosterForTests(fn: Poster | null): void {
  posterForTests = fn;
}

async function postInvite(url: string, body: Record<string, unknown>): Promise<boolean> {
  if (posterForTests) return posterForTests(url, body);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send pending adds to the Zapier hook, when one is set. Best effort: a failed
 * post leaves the client in "To add" for the coach and the next run.
 */
export async function sendPendingInvites(
  emails?: string[],
  now = new Date()
): Promise<{ sent: number; failed: number; skipped: boolean }> {
  const settings = await getSkoolSettings();
  if (!settings.inviteHookUrl) return { sent: 0, failed: 0, skipped: true };
  const all = await listSkoolAccess(now.getTime());
  const pending = all.filter((r) => r.queue === "add" && (!emails || emails.includes(r.email)));
  let sent = 0;
  let failed = 0;
  for (const rec of pending) {
    const [firstName, ...rest] = (rec.name || "").split(" ");
    const ok = await postInvite(settings.inviteHookUrl, {
      email: rec.email,
      name: rec.name || "",
      first_name: firstName || "",
      last_name: rest.join(" "),
      ends_at: rec.endsAt,
      package_id: rec.packageId,
    });
    if (!ok) {
      failed++;
      continue;
    }
    sent++;
    const at = now.toISOString();
    await getDb()
      .collection(SKOOL_ACCESS)
      .doc(rec.email)
      .set(
        {
          status: "invited",
          invitedAt: at,
          updatedAt: at,
          history: [...rec.history, entry("invited via Zapier", "system", at)],
        },
        { merge: true }
      );
  }
  return { sent, failed, skipped: false };
}

export function buildHeadsUpEmail(
  rec: Pick<SkoolAccessRecord, "name" | "endsAt">
): { subject: string; text: string; html: string } {
  const first = (rec.name || "").split(" ")[0] || "there";
  const date = day(rec.endsAt);
  const subject = `Your DeFi University access ends on ${date}`;
  const text = [
    `Hi ${first},`,
    "",
    `Your private coaching period ends on ${date}. On that day your seat in the DeFi University Skool community and your access to the courses on defiuniversity.xyz end with it.`,
    "",
    `If you want to keep both, join the ${membershipPlan.priceDisplay}/month membership before then: ${URLS.skoolPlans}`,
    "",
    "Reply to this email if you have any questions.",
    "",
    "David",
  ].join("\n");
  const html = [
    `<p>Hi ${escapeHtml(first)},</p>`,
    `<p>Your private coaching period ends on ${escapeHtml(date)}. On that day your seat in the DeFi University Skool community and your access to the courses on defiuniversity.xyz end with it.</p>`,
    `<p>If you want to keep both, <a href="${escapeHtml(URLS.skoolPlans)}">join the ${escapeHtml(membershipPlan.priceDisplay)}/month membership</a> before then.</p>`,
    "<p>Reply to this email if you have any questions.</p>",
    "<p>David</p>",
  ].join("");
  return { subject, text, html };
}

type Sender = (opts: SendEmailOptions) => Promise<SendEmailResult>;

/** Once per client per window, 7 days out, when the coach has turned it on. */
export async function sendHeadsUpEmails(send: Sender, now = new Date()): Promise<number> {
  const settings = await getSkoolSettings();
  if (!settings.headsUpEmails) return 0;
  const due = (await listSkoolAccess(now.getTime())).filter((r) => r.queue === "ending" && !r.headsUpSentAt);
  let count = 0;
  for (const rec of due) {
    const email = buildHeadsUpEmail(rec);
    const result = await send({
      to: rec.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
      purpose: "transactional",
      log: { source: "skool_heads_up" },
    });
    if (!result.ok) continue;
    count++;
    const at = now.toISOString();
    await getDb()
      .collection(SKOOL_ACCESS)
      .doc(rec.email)
      .set(
        { headsUpSentAt: at, updatedAt: at, history: [...rec.history, entry("heads-up email sent", "system", at)] },
        { merge: true }
      );
  }
  return count;
}
