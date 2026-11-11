/**
 * The two optional answers on the public booking form (mobile and one
 * question), and what a booking adds to the lead record and the funnel.
 */
import type { Attribution } from "@/lib/attribution-cookie";
import type { LeadRecord } from "@/lib/crm/lead-lifecycle";
import { getDb, leadDocId } from "@/lib/firebase-admin";
import { countFunnelStep, type FunnelContext } from "@/lib/funnel/events";
import { normalizePhone } from "@/lib/phone";

export const BOOKING_NOTE_MAX = 500;

/** Funnel row for a call booked by someone who never left an email on a lesson. */
export const NO_LESSON = { courseId: "none", lessonSlug: "none" } as const;

export type BookingAnswers =
  | { ok: true; phone?: string; note?: string }
  | { ok: false; error: string };

/** Mobile is optional, but a typed number must be a real one. */
export function parseBookingAnswers(body: Record<string, unknown>): BookingAnswers {
  const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  if (rawPhone && !phone) return { ok: false, error: "Enter a mobile number with its area code, or leave it blank" };
  const note =
    typeof body.note === "string" ? body.note.replace(/\s+/g, " ").trim().slice(0, BOOKING_NOTE_MAX) : "";
  return { ok: true, ...(phone ? { phone } : {}), ...(note ? { note } : {}) };
}

/** Which lesson a booking is credited to in the funnel: the last one they read, if any. */
export function bookingFunnelContext(lead: Pick<LeadRecord, "lastLesson"> | undefined, attribution?: Attribution): FunnelContext {
  const lesson = lead?.lastLesson;
  return lesson?.courseId && lesson.lessonSlug
    ? { courseId: lesson.courseId, lessonSlug: lesson.lessonSlug, attribution }
    : { ...NO_LESSON, attribution };
}

/**
 * After a public booking: keep a new mobile and the answer on the lead (an
 * existing mobile is never replaced, and no text consent is implied), then
 * count the call in the funnel. Never throws: the booking already stands.
 */
export async function recordBookedCall(args: {
  email: string;
  phone?: string;
  note?: string;
  attribution?: Attribution;
}): Promise<void> {
  let lead: LeadRecord | undefined;
  try {
    const ref = getDb().collection("leads").doc(leadDocId(args.email));
    const snap = await ref.get();
    lead = snap.exists ? (snap.data() as LeadRecord) : undefined;
    const update: Record<string, unknown> = {};
    if (args.phone && !lead?.phone) update.phone = args.phone;
    if (args.note) update.bookingNote = args.note;
    if (Object.keys(update).length) {
      await ref.set({ ...update, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (e) {
    console.error("[recordBookedCall] lead update failed", e);
  }
  await countFunnelStep("call_booked", bookingFunnelContext(lead, args.attribution));
}
