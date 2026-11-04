/**
 * The one place that names the business. Pure data, safe on client and
 * server. Copy, emails, metadata and AI prompts read from here, so a new
 * business only edits this file (plus content/ for page copy).
 */
export const BRAND = {
  /** Shown in the header, emails, metadata and agreements. */
  name: "FromAItoBusiness",
  /** Legal name on agreements and email footers. */
  legalName: "FromAItoBusiness.com",
  domain: "fromaitobusiness.com",
  origin: "https://fromaitobusiness.com",
  /**
   * The coach's inbox: sender, reply-to, admin Google sign-in and calendar
   * owner. Stays on the existing mailbox until fromaitobusiness.com has mail.
   */
  email: "hello@fromaitobusiness.com",
  coachName: "David Zimmerman",
  coachFirstName: "David",
  /** What the coaching is about, used in AI prompts and page copy. */
  subject: "using AI tools and agents to build and run a business on their own",
  /** One line under the name. */
  tagline: "Your business, staffed by AI",
  /** Telegram handle clients message from /account (no @). */
  telegramHandle: "m00nsh0t777",
} as const;

export type Brand = typeof BRAND;
