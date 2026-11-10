import { BRAND } from "@/lib/brand";

export const CONSENT_TEXT = `Send me emails from ${BRAND.name} about private coaching. Unsubscribe anytime.`;

export const CONSENT_TEXT_VERSION = "2026-10-v1";

/** The exercise gate on lessons: one line each for email and for texts. */
export const LESSON_EMAIL_CONSENT_TEXT = `Email me from ${BRAND.name} about the course and private coaching. Unsubscribe anytime.`;
export const LESSON_EMAIL_CONSENT_VERSION = "2026-11-lesson-v1";
export const SMS_CONSENT_TEXT =
  "Text me when my exercise is ready and if a new lesson on this topic lands. Reply STOP to end. Message rates may apply.";
export const SMS_CONSENT_VERSION = "2026-11-sms-v1";

export const LEAD_CONFIRM_SUBJECT = `Confirm your email for ${BRAND.name}`;
