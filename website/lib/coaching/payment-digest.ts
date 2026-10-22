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

/**
 * Morning email to the owner listing manual installments that are overdue or
 * due within 7 days. Runs from the existing process-flows cron (every 30
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

export function buildPaymentDigestEmail(
  items: PaymentDueItem[],
  date: string,
  origin: string
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
  if (items.length) parts.push(`All payments due: ${origin}/admin/coaching/payments-due`);
  const subject = `Payments due: ${overdue.length} overdue, ${soon.length} due this week`;

  const section = (title: string, rows: PaymentDueItem[], color: string) =>
    rows.length
      ? `<h3 style="color:${color}">${escapeHtml(title)}</h3><ul>${rows
          .map(
            (i) =>
              `<li><a href="${escapeHtml(link(i))}">${escapeHtml(line(i))}</a></li>`
          )
          .join("")}</ul>`
      : "";
  const html = [
    items.length ? `<p>Manual installments for ${escapeHtml(formatDueDate(date))}.</p>` : "",
    section(`Overdue (${overdue.length})`, overdue, "#b42318"),
    section(`Due in the next 7 days (${soon.length})`, soon, "#b54708"),
    items.length
      ? `<p><a href="${escapeHtml(`${origin}/admin/coaching/payments-due`)}">Open payments due</a></p>`
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

  const send = opts.send || sendEmail;
  const items = await listPaymentsDue(db, now);
  const count = items.length;
  if (count === 0) {
    await ref.set({ lastResult: "nothing_due", lastCheckedAt: now.toISOString() }, { merge: true });
    return { status: "nothing_due", date, count: 0 };
  }

  const email = buildPaymentDigestEmail(items, date, getSiteOrigin());
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
