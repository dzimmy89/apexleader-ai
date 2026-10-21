import { getDb } from "@/lib/firebase-admin";
import { SENDER_EMAIL, getSiteOrigin } from "@/lib/env";
import { escapeHtml } from "@/lib/html";
import { sendEmail, type SendEmailOptions, type SendEmailResult } from "@/lib/gmail";
import { formatDueDate } from "@/lib/crm/contact-email-templates";
import {
  dateInTimezone,
  formatUsdCents,
  hourInTimezone,
  listPaymentsDue,
  type PaymentDueItem,
} from "@/lib/coaching/payments";
import {
  listSkoolAccess,
  sendHeadsUpEmails,
  sendPendingInvites,
  type SkoolAccessRecord,
} from "@/lib/account/skool-access";

/**
 * Morning email to the owner listing crypto installments that are overdue or
 * due within 7 days, and coaching clients to add to or remove from Skool. Runs from the existing process-flows cron (every 30
 * minutes) and sends at most once per New York calendar day, after 7am.
 * Clients are never emailed by this.
 */
export const PAYMENT_DIGEST_STATE = { collection: "app_state", doc: "payment_digest" } as const;
export const PAYMENT_DIGEST_HOUR = 7;

export type PaymentDigestStatus =
  | "too_early"
  | "already_ran"
  | "nothing_due"
  | "sent"
  | "send_failed";

export interface PaymentDigestResult {
  status: PaymentDigestStatus;
  date: string;
  count?: number;
  error?: string;
}

export interface SkoolDigest {
  add: SkoolAccessRecord[];
  remove: SkoolAccessRecord[];
  ending: SkoolAccessRecord[];
}

export const EMPTY_SKOOL_DIGEST: SkoolDigest = { add: [], remove: [], ending: [] };

export function skoolDigestCount(s: SkoolDigest): number {
  return s.add.length + s.remove.length + s.ending.length;
}

export async function loadSkoolDigest(now: Date): Promise<SkoolDigest> {
  const all = await listSkoolAccess(now.getTime());
  return {
    add: all.filter((r) => r.queue === "add"),
    remove: all.filter((r) => r.queue === "remove"),
    ending: all.filter((r) => r.queue === "ending"),
  };
}

function skoolDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function buildPaymentDigestEmail(
  items: PaymentDueItem[],
  date: string,
  origin: string,
  skool: SkoolDigest = EMPTY_SKOOL_DIGEST
): { subject: string; text: string; html: string } {
  const overdue = items.filter((i) => i.status === "overdue");
  const soon = items.filter((i) => i.status === "due_soon");
  const line = (i: PaymentDueItem) => {
    const who = i.name ? `${i.name} (${i.email})` : i.email;
    const which = i.installments > 1 ? `payment ${i.installmentNumber} of ${i.installments}` : "payment";
    return `${who}: ${i.packageName || i.packageId} ${which}, ${formatUsdCents(i.amount)}, due ${formatDueDate(i.dueDate)}`;
  };
  const link = (i: PaymentDueItem) => `${origin}/admin/contacts/${encodeURIComponent(i.email)}`;
  const parts: string[] = [];
  if (overdue.length) {
    parts.push(`Overdue (${overdue.length})`, ...overdue.map((i) => `- ${line(i)}\n  ${link(i)}`), "");
  }
  if (soon.length) {
    parts.push(`Due in the next 7 days (${soon.length})`, ...soon.map((i) => `- ${line(i)}\n  ${link(i)}`), "");
  }
  const skoolWho = (r: SkoolAccessRecord) => (r.name ? `${r.name} (${r.email})` : r.email);
  const skoolLines: Array<[string, SkoolAccessRecord[], (r: SkoolAccessRecord) => string, string]> = [
    [`Add to Skool (${skool.add.length})`, skool.add, (r) => `${skoolWho(r)}: until ${skoolDay(r.endsAt)}`, "#2f6b48"],
    [`Remove from Skool (${skool.remove.length})`, skool.remove, (r) => `${skoolWho(r)}: coaching ended ${skoolDay(r.endsAt)}`, "#b42318"],
    [`Skool access ending this week (${skool.ending.length})`, skool.ending, (r) => `${skoolWho(r)}: ends ${skoolDay(r.endsAt)}`, "#b54708"],
  ];
  const membershipLink = `${origin}/admin/membership`;
  for (const [title, rows, fmt] of skoolLines) {
    if (rows.length) parts.push(title, ...rows.map((r) => `- ${fmt(r)}`), "");
  }
  if (items.length) parts.push(`All payments due: ${origin}/admin/coaching/payments-due`);
  if (skoolDigestCount(skool)) parts.push(`Skool queue: ${membershipLink}`);
  const subjects: string[] = [];
  if (items.length) subjects.push(`Payments due: ${overdue.length} overdue, ${soon.length} due this week`);
  if (skool.add.length || skool.remove.length) {
    subjects.push(`Skool: ${skool.add.length} to add, ${skool.remove.length} to remove`);
  } else if (skool.ending.length) {
    subjects.push(`Skool: ${skool.ending.length} ending this week`);
  }
  const subject = subjects.join(" · ") || `Payments due: ${overdue.length} overdue, ${soon.length} due this week`;

  const section = (title: string, rows: PaymentDueItem[], color: string) =>
    rows.length
      ? `<h3 style="color:${color}">${escapeHtml(title)}</h3><ul>${rows
          .map(
            (i) =>
              `<li><a href="${escapeHtml(link(i))}">${escapeHtml(line(i))}</a></li>`
          )
          .join("")}</ul>`
      : "";
  const skoolSection = (title: string, rows: SkoolAccessRecord[], fmt: (r: SkoolAccessRecord) => string, color: string) =>
    rows.length
      ? `<h3 style="color:${color}">${escapeHtml(title)}</h3><ul>${rows
          .map((r) => `<li>${escapeHtml(fmt(r))}</li>`)
          .join("")}</ul>`
      : "";
  const html = [
    items.length ? `<p>Crypto installments for ${escapeHtml(formatDueDate(date))}.</p>` : "",
    section(`Overdue (${overdue.length})`, overdue, "#b42318"),
    section(`Due in the next 7 days (${soon.length})`, soon, "#b54708"),
    items.length
      ? `<p><a href="${escapeHtml(`${origin}/admin/coaching/payments-due`)}">Open payments due</a></p>`
      : "",
    ...skoolLines.map(([title, rows, fmt, color]) => skoolSection(title, rows, fmt, color)),
    skoolDigestCount(skool)
      ? `<p><a href="${escapeHtml(membershipLink)}">Open the Skool queue on Members and Skool</a></p>`
      : "",
  ].join("");
  return { subject, text: parts.join("\n"), html };
}

type Sender = (opts: SendEmailOptions) => Promise<SendEmailResult>;

export async function maybeSendPaymentDigest(
  opts: { now?: Date; send?: Sender } = {}
): Promise<PaymentDigestResult> {
  const now = opts.now || new Date();
  const date = dateInTimezone(now);
  if (hourInTimezone(now) < PAYMENT_DIGEST_HOUR) {
    return { status: "too_early", date };
  }
  const db = getDb();
  const ref = db.collection(PAYMENT_DIGEST_STATE.collection).doc(PAYMENT_DIGEST_STATE.doc);

  // Claim today first so two overlapping cron runs cannot both send.
  const claim = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = (snap.data() || {}) as Record<string, unknown>;
    if (data.lastRunDate === date) return { claimed: false, previous: null as string | null };
    tx.set(
      ref,
      { lastRunDate: date, claimedAt: now.toISOString() },
      { merge: true }
    );
    return {
      claimed: true,
      previous: typeof data.lastRunDate === "string" ? data.lastRunDate : null,
    };
  });
  if (!claim.claimed) {
    return { status: "already_ran", date };
  }

  // Daily Skool chores ride on the same once-a-day claim. Best effort.
  const send = opts.send || sendEmail;
  try {
    await sendPendingInvites(undefined, now);
    await sendHeadsUpEmails(send, now);
  } catch (e) {
    console.error("[payment-digest] skool chores", e);
  }
  const items = await listPaymentsDue(db, now);
  const skool = await loadSkoolDigest(now).catch((e) => {
    console.error("[payment-digest] skool queue", e);
    return EMPTY_SKOOL_DIGEST;
  });
  const count = items.length + skoolDigestCount(skool);
  if (count === 0) {
    await ref.set({ lastResult: "nothing_due", lastCheckedAt: now.toISOString() }, { merge: true });
    return { status: "nothing_due", date, count: 0 };
  }

  const email = buildPaymentDigestEmail(items, date, getSiteOrigin(), skool);
  const result = await send({
    to: SENDER_EMAIL,
    subject: email.subject,
    text: email.text,
    html: email.html,
    purpose: "transactional",
    log: { source: "payment_digest" },
  });
  if (!result.ok) {
    // Release the day so the next cron run tries again, unless the failure
    // will not change on retry (suppressed, not configured, and so on).
    const retry = result.retryable !== false && !result.skipped;
    await ref.set(
      {
        lastRunDate: retry ? claim.previous : date,
        lastResult: "send_failed",
        lastError: result.error || "send_failed",
        lastCheckedAt: now.toISOString(),
      },
      { merge: true }
    );
    return { status: "send_failed", date, count, error: result.error };
  }
  await ref.set(
    {
      lastResult: "sent",
      lastSentAt: now.toISOString(),
      lastSentDate: date,
      lastCount: count,
    },
    { merge: true }
  );
  return { status: "sent", date, count };
}
