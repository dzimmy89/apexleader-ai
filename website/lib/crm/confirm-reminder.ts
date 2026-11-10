/**
 * One reminder for a lesson lead who hasn't clicked "Confirm my email" a day
 * after it was sent. Only one, ever, per lead; never to someone suppressed,
 * unsubscribed or already confirmed. Runs from the process-flows cron.
 */
import { buildLeadConfirmEmail } from "@/lib/email-templates";
import { confirmUrlFor } from "@/lib/email-tokens";
import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/gmail";
import { isSuppressed } from "@/lib/suppression";

const HOUR = 60 * 60 * 1000;
export const CONFIRM_REMINDER_AFTER_MS = 24 * HOUR;
/** The first email's link lasts 7 days; a reminder after 6 is too late to help. */
export const CONFIRM_REMINDER_UNTIL_MS = 6 * 24 * HOUR;
const BATCH = 40;

export interface ReminderLead {
  email?: string;
  status?: string;
  leadMagnet?: string;
  lastConfirmEmailSentAt?: string;
  confirmReminderSentAt?: string;
}

export function confirmReminderDue(lead: ReminderLead, nowMs: number): boolean {
  if (lead.status !== "pending" || lead.confirmReminderSentAt) return false;
  if (!lead.leadMagnet?.startsWith("lesson:")) return false;
  const sent = lead.lastConfirmEmailSentAt ? Date.parse(lead.lastConfirmEmailSentAt) : NaN;
  if (!Number.isFinite(sent)) return false;
  const age = nowMs - sent;
  return age >= CONFIRM_REMINDER_AFTER_MS && age < CONFIRM_REMINDER_UNTIL_MS;
}

export async function sendConfirmReminders(now = new Date()): Promise<{ sent: number; checked: number }> {
  const db = getDb();
  const nowMs = now.getTime();
  const since = new Date(nowMs - CONFIRM_REMINDER_UNTIL_MS).toISOString();
  const until = new Date(nowMs - CONFIRM_REMINDER_AFTER_MS).toISOString();
  // One range on one field (no composite index); the rest is checked here.
  const snap = await db
    .collection("leads")
    .where("lastConfirmEmailSentAt", ">=", since)
    .where("lastConfirmEmailSentAt", "<=", until)
    .limit(200)
    .get();
  let sent = 0;
  let checked = 0;
  for (const doc of snap.docs) {
    if (sent >= BATCH) break;
    const lead = doc.data() as ReminderLead & { firstName?: string; lastLesson?: { title?: string } };
    checked++;
    if (!confirmReminderDue(lead, nowMs)) continue;
    const email = String(lead.email || doc.id);
    if (await isSuppressed(email)) continue;
    // Claim first so two cron runs can't both send.
    const claimed = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(doc.ref);
      if (fresh.data()?.confirmReminderSentAt) return false;
      tx.set(doc.ref, { confirmReminderSentAt: now.toISOString() }, { merge: true });
      return true;
    });
    if (!claimed) continue;
    try {
      const rendered = buildLeadConfirmEmail({
        email,
        firstName: lead.firstName,
        confirmUrl: await confirmUrlFor(email),
        lessonTitle: lead.lastLesson?.title,
        reminder: true,
      });
      const result = await sendEmail({
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        purpose: "transactional",
        log: { source: "lead_confirm_reminder", userId: `lead:${encodeURIComponent(email)}` },
      });
      if (result.ok) sent++;
      else console.error("[confirm-reminder] send failed", email, result.error);
    } catch (e) {
      console.error("[confirm-reminder] send failed", email, e);
    }
  }
  return { sent, checked };
}
