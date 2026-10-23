// Bot Care: a monthly plan for coaching clients who want the bots they built
// kept working. It is its own Stripe subscription, tagged product=bot_care, and
// the webhook keeps it apart from package payments so starting, paying for or
// cancelling Bot Care never changes a client's package, sessions or access.

export const BOT_CARE_PRODUCT = "bot_care";
export const BOT_CARE_PRICE_ENV_VAR = "STRIPE_PRICE_BOT_CARE_MONTHLY";

export const BOT_CARE = {
  name: "Bot Care",
  priceMonthly: 1000,
  priceDisplay: "$1,000",
  tagline: "Keep the AI bots you built working, improving and up to date, month after month.",
  eligibility: "For coaching clients. Start it during or after any package.",
  features: [
    "A 60-minute review session with your coach each month",
    "A monthly check of every bot you built: what ran, what broke, what to change",
    "Bot instructions updated when Grok Bot, Claude, Cursor or Gemini change",
    "New bot templates for your kind of business as we build them",
    "Messages between sessions",
  ],
  terms: "Billed monthly by card. Cancel any time by messaging your coach; the month you paid for runs to its end.",
} as const;

export function isBotCareMetadata(
  metadata: Record<string, string> | null | undefined
): boolean {
  return metadata?.product === BOT_CARE_PRODUCT;
}

/** Checkout opens once the Stripe price id is set (scripts/setup-coaching-stripe.ts). */
export function isBotCareCheckoutOpen(): boolean {
  return Boolean(process.env[BOT_CARE_PRICE_ENV_VAR]);
}
