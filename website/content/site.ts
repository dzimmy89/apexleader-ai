import { BRAND } from "@/lib/brand";

export const URLS = {
  // Native coaching book + Stripe checkout (see /coaching/book and
  // /api/coaching/checkout).
  coachingBook: "/coaching/book",
  coachingDiscovery: "/coaching/book",
  coachingPortalAccess: "/coaching/portal-access",
  email: BRAND.email,
  unsubscribeMailto: `mailto:${BRAND.email}?subject=unsubscribe`,
} as const;

/**
 * CAN-SPAM physical postal address for marketing email footers. Left as a
 * TODO until the business has its own address; while it starts with "TODO:"
 * the footers leave it out.
 */
export const POSTAL_ADDRESS = "TODO: business postal address";

export function isPostalAddressPlaceholder(
  address: string = POSTAL_ADDRESS
): boolean {
  const trimmed = address.trim();
  return !trimmed || trimmed.startsWith("TODO:");
}

// Placeholder founder copy until the real bio is written.
export const founderBio = [
  `${BRAND.coachName} founded ${BRAND.name} and runs every coaching session himself. He helps owners find the hours AI can give back and build the workflows that do it.`,
  "His method is process first: map how the work gets done today, automate one piece well, measure it, then do the next. No hype, no tool-of-the-week.",
] as const;

/** Default questions for the FAQ accordion; /coaching passes its own. */
export const faq = [
  {
    question: "Do I need to be technical?",
    answer:
      "No. Most clients start with chat assistants and no-code tools. If you or your team write code, the plan goes further into building your own automations.",
  },
  {
    question: "What happens on the free call?",
    answer: `${BRAND.coachFirstName} asks how your business runs and where the time goes, and you leave with a first idea of where AI fits, whether or not you buy coaching.`,
  },
  {
    question: "Do you guarantee results?",
    answer:
      "No. We measure the time a workflow takes before and after so you can see what changed, but outcomes depend on your business and how the work is adopted.",
  },
] as const;

export const disclaimer = `${BRAND.name} provides coaching and education. Results depend on your business and how you apply what you learn; we make no guarantees about outcomes. Check each AI tool's terms before putting customer or confidential data into it.`;
