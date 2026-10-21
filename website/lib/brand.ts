/**
 * The one place that names the business. Pure data, safe on client and
 * server. Copy, emails, metadata and AI prompts read from here, so a new
 * business only edits this file (plus content/ for page copy).
 */
export const BRAND = {
  /** Shown in the header, emails, metadata and agreements. */
  name: "ApexLeader.ai",
  /** Legal name on agreements and email footers. */
  legalName: "ApexLeader.ai",
  domain: "apexleader.ai",
  origin: "https://apexleader.ai",
  /** The coach's inbox: sender, reply-to, admin Google sign-in and calendar owner. */
  email: "hello@apexleader.ai",
  coachName: "David Zimmerman",
  coachFirstName: "David",
  /** What the coaching is about, used in AI prompts and page copy. */
  subject: "using AI and building with AI in their own business",
  /** One line under the name. */
  tagline: "Private AI coaching for business owners",
  /** Telegram handle clients message from /account (no @). */
  telegramHandle: "m00nsh0t777",
} as const;

export type Brand = typeof BRAND;
