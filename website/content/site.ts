export const URLS = {
  /** Member feed (sign-in). Never link prospects to the Skool about page. */
  skoolCommunity: "https://www.skool.com/defiuniversity",
  skoolPlans: "https://www.skool.com/defiuniversity/plans",
  // Native coaching book + Stripe checkout (see /coaching/book and
  // /api/coaching/checkout).
  coachingBook: "/coaching/book",
  coachingDiscovery: "/coaching/book",
  coachingPortalAccess: "/coaching/portal-access",
  email: "hello@defiuniversity.xyz",
  unsubscribeMailto: "mailto:hello@defiuniversity.xyz?subject=unsubscribe",
} as const;

/** CAN-SPAM physical postal address for marketing email footers. */
export const POSTAL_ADDRESS =
  "30 N Gould Street, Suite R, Sheridan, Wyoming 82801";

export function isPostalAddressPlaceholder(
  address: string = POSTAL_ADDRESS
): boolean {
  const trimmed = address.trim();
  return !trimmed || trimmed.startsWith("TODO:");
}

/**
 * The one paid plan: the DeFi University membership on Skool
 * (https://www.skool.com/defiuniversity/plans). Set by David on 13 Oct 2026,
 * replacing Standard $7 / Premium $29 / VIP $97. Private coaching is a separate
 * offer (see privateTiers and /coaching).
 */
export const membershipPlan = {
  id: "membership",
  name: "Membership",
  price: 97,
  priceDisplay: "$97",
  summary:
    "Every live call with David, all 31 courses, and the community.",
  features: [
    "Live Q&A with David every Monday, Wednesday, and Friday (times on the Skool Calendar)",
    "All 31 courses on defiuniversity.xyz, in eight stages from Foundations to the Quant Lab",
    "The DeFi University community on Skool",
    "Month-to-month · cancel anytime",
  ],
} as const;

export type MembershipPlan = typeof membershipPlan;

/** Set by David on 13 Oct 2026: the membership starts with a one-week free trial on Skool. */
export const SKOOL_TRIAL_DAYS = 7;

export type LadderRung = {
  id: "free" | "membership" | "private";
  label: string;
  price: string;
  priceNote: string;
  forYou: string;
  includes: readonly string[];
  cta:
    | { kind: "link"; label: string; href: string; variant: "skool" | "coaching" | "ghost" }
    | { kind: "skool"; label: string; planId: string; value: number };
};

export const offerLadder: readonly LadderRung[] = [
  {
    id: "free",
    label: "Start free",
    price: "$0",
    priceNote: "No card, just an email sign-in",
    forYou: "You want the fundamentals before you pay for anything.",
    includes: [
      "Stage 1: four Foundations courses, from money basics to staying safe",
      "The DeFi Safety Checklist",
    ],
    cta: { kind: "link", label: "Browse the courses", href: "/university", variant: "ghost" },
  },
  {
    id: "membership",
    label: "Membership",
    price: membershipPlan.priceDisplay,
    priceNote: "per month on Skool",
    forYou: "You want to bring your questions to David, live, three days a week.",
    includes: [
      "Live Q&A Monday, Wednesday, and Friday",
      "Skool community and all 31 courses",
      `${SKOOL_TRIAL_DAYS}-day free trial · cancel anytime`,
    ],
    cta: {
      kind: "skool",
      label: "Start your free week ↗",
      planId: membershipPlan.id,
      value: membershipPlan.price,
    },
  },
  {
    id: "private",
    label: "Private coaching",
    price: "From $750",
    priceNote: "Paid once or in installments",
    forYou: "You want 1-on-1 sessions built around your questions.",
    includes: [
      "Kickstart: $750, two sessions",
      "Operator: $2,500, eight sessions plus 3 months of membership",
      "Inner Circle: $7,500, 24 sessions directly with David",
      "Not sure which? Start with a free 30-minute call",
    ],
    cta: { kind: "link", label: "Compare the packages", href: "/coaching", variant: "coaching" },
  },
];

export const founderBio = [
  "David Zimmerman founded DeFi University and hosts every live call. He has spent the last cycle coaching DeFi learners from their first self-custody setup to protocol due diligence.",
  "His method is risk first and process driven: unscripted Q&A in the group, and 1-on-1 work for people who want it. Not tips, not signals, not predictions — education only.",
] as const;

/** Illustrative only; the live agenda is whatever members bring that week. */
export const callTopicExamples: Record<string, readonly string[]> = {
  "defi-concepts": ["Is my wallet set up safely?", "What actually happens when I bridge?"],
  "investor-mindset": [
    "How do I stop chasing every new launch?",
    "How do I write my rules down before I act?",
  ],
  "liquidity-provision": [
    "Why did my LP position lose value when the price moved?",
    "How does a narrow range change the risk?",
  ],
  "money-markets": [
    "How close to liquidation is too close?",
    "How do I read a lending market's risk parameters?",
  ],
  "perpetual-futures": [
    "How do funding rates work?",
    "What does leverage do to my liquidation price?",
  ],
};

/** Static summary for static pages; /coaching renders the live package catalog. */
export const privateTiers = [
  {
    id: "foundations",
    name: "Kickstart",
    price: "$750",
    sessions: "2 × 60-minute sessions within 30 days",
    gate: "Enroll directly · full fee counts toward Operator",
  },
  {
    id: "mastery",
    name: "Operator",
    price: "$2,500",
    sessions: "8 × 60-minute sessions over 12 weeks + 3 months of membership",
    gate: "Enroll directly or start with a free call · 3 payments available",
  },
  {
    id: "institutional",
    name: "Inner Circle",
    price: "$7,500",
    sessions: "24 × 60-minute sessions over 6 months, directly with David",
    gate: "Starts with a free call · 3 or 6 payments",
  },
] as const;

export const faq = [
  {
    question: "What does the membership include?",
    answer:
      "One plan, $97 a month on Skool: live Q&A with David every Monday, Wednesday, and Friday, all 31 courses, and the DeFi University community. Check the Skool Calendar inside the group for current call times.",
  },
  {
    question: "Is there a free trial?",
    answer: `Yes. The membership starts with a ${SKOOL_TRIAL_DAYS}-day free trial on Skool, so you can join a live call before you pay. After that it is month-to-month and you can cancel anytime in your Skool settings.`,
  },
  {
    question: "Membership or private coaching?",
    answer:
      "The membership is live group Q&A on Skool, billed monthly. Private coaching is a separate offer: a set number of 1-on-1 sessions with David, paid in full or in installments through Stripe on this site, starting with a free 30-minute call.",
  },
  {
    question: "Are sessions recorded?",
    answer:
      "Do not assume every call is recorded. Show up live when you can. We do not promise a full replay library.",
  },
  {
    question: "Who leads the calls?",
    answer:
      "David Zimmerman hosts every session. He shares educational perspectives from his experience trading and building in DeFi — not personalized financial advice or investment recommendations.",
  },
  {
    question: "Is this financial advice or investment guidance?",
    answer:
      "No. DeFi University LLC provides educational content and training only. We do not provide financial advice, investment recommendations, or portfolio management services. All content is for informational and educational purposes.",
  },
  {
    question: "Will I make money from these courses?",
    answer:
      "We make no guarantees about financial outcomes. Our courses teach technical concepts, risk management frameworks, and protocol analysis. What you do with this knowledge is entirely up to you, and all outcomes depend on individual decisions and market conditions beyond our control.",
  },
  {
    question: "What will I learn?",
    answer:
      "Skool's Course Hub has 5 courses, from investor mindset through more advanced DeFi topics. The membership also opens all 31 self-paced courses at /university, in eight stages from Foundations to the Quant Lab. Stage 1 is free with an email sign-in. Educational only — not financial advice. You keep self-custody of your assets. No guaranteed outcomes.",
  },
  {
    question: "Can I cancel my membership?",
    answer:
      "Yes. The membership is month-to-month at $97 with no long-term contract. You can cancel at any time through your Skool account settings or by contacting hello@defiuniversity.xyz. No cancellation fees apply.",
  },
] as const;

export const disclaimer =
  "DeFi University LLC provides educational content only. We do not provide financial advice, investment recommendations, or portfolio management services. All digital asset education involves high risk. Past performance is not indicative of future results.";
