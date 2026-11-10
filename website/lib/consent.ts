import { BRAND } from "@/lib/brand";

export const CONSENT_TEXT = `Send me emails from ${BRAND.name} about private coaching. Unsubscribe anytime.`;

export const CONSENT_TEXT_VERSION = "2026-10-v1";

/** The exercise gate on lessons: one line each for email and for texts. */
export const LESSON_EMAIL_CONSENT_TEXT = `Email me from ${BRAND.name} about the course and private coaching. Unsubscribe anytime.`;
/** Shown under step one of the exercise form; pressing the button is the consent. */
export const LESSON_EMAIL_CONSENT_NOTE = `Step 1 of 2. By continuing you agree to emails from ${BRAND.name} about the course and private coaching. Unsubscribe anytime.`;
export const LESSON_EMAIL_CONSENT_VERSION = "2026-11-lesson-v2";
export const SMS_CONSENT_TEXT =
  "Also text me follow-ups on this topic, about 3 texts over 12 days. Reply STOP to end, HELP for help. Message and data rates may apply.";
export const SMS_CONSENT_VERSION = "2026-11-sms-v2";

export const LEAD_CONFIRM_SUBJECT = `Confirm your email for ${BRAND.name}`;
