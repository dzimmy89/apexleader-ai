import { getPackage, type CoachingPackage, type PackageId } from "@/lib/coaching/packages";
import {
  COACH_TIMEZONE,
  formatBookingDateTime,
  getDiscoveryPrepUrl,
} from "@/lib/coaching/discovery-shared";

export { COACH_TIMEZONE, getDiscoveryPrepUrl } from "@/lib/coaching/discovery-shared";
export interface DiscoveryPackageContext {
  id: PackageId | null;
  name: string;
  tagline: string;
  priceDisplay: string;
  durationWeeks: number;
  sessionCount: number;
  targetCapital: string;
  summaryLine: string;
}

export interface DiscoveryPrepContent {
  headline: string;
  intro: string;
  checklist: string[];
  callAgenda: string[];
}

const GENERAL_CONTEXT: DiscoveryPackageContext = {
  id: null,
  name: "Private Coaching",
  tagline: "Explore which DeFi University coaching tier fits your goals.",
  priceDisplay: "",
  durationWeeks: 0,
  sessionCount: 0,
  targetCapital: "",
  summaryLine: "Exploring DeFi University private coaching options",
};

function toContext(pkg: CoachingPackage): DiscoveryPackageContext {
  return {
    id: pkg.id,
    name: pkg.name,
    tagline: pkg.tagline,
    priceDisplay: pkg.priceDisplay,
    durationWeeks: pkg.durationWeeks,
    sessionCount: pkg.sessionCount,
    targetCapital: pkg.targetCapital,
    summaryLine: `${pkg.name} (${pkg.priceDisplay} · ${pkg.durationWeeks} weeks · ${pkg.sessionCount} sessions)`,
  };
}

export async function resolvePackageContext(
  packageId?: string
): Promise<DiscoveryPackageContext> {
  if (!packageId) return GENERAL_CONTEXT;
  const pkg = await getPackage(packageId);
  return pkg ? toContext(pkg) : GENERAL_CONTEXT;
}

export function getDiscoveryEventTitle(args: {
  name: string;
  packageContext: DiscoveryPackageContext;
}): string {
  const who = args.name.trim() || "Discovery Call";
  if (args.packageContext.id) {
    return `${args.packageContext.name} Coaching Discovery Call — ${who}`;
  }
  return `DeFi University Discovery Call — ${who}`;
}

export function getDiscoveryEventDescription(args: {
  name: string;
  packageContext: DiscoveryPackageContext;
  prepUrl: string;
  meetUrl?: string;
}): string {
  const greeting = args.name.trim() ? `Hi ${args.name.trim()},` : "Hi there,";
  const packageLine = args.packageContext.id
    ? `Package you're exploring: ${args.packageContext.summaryLine}`
    : "You're exploring DeFi University private coaching options.";

  const fitLine = args.packageContext.id
    ? `We'll discuss your DeFi goals, where you are today, and whether ${args.packageContext.name} is the right fit.`
    : "We'll discuss your DeFi goals, where you are today, and which coaching tier might fit.";

  const lines = [
    greeting,
    "",
    "You're confirmed for a 30-minute discovery call with DeFi University.",
    "",
    packageLine,
    fitLine,
    "No pressure, no obligation.",
    "",
    "Before your call, review this short prep guide:",
    args.prepUrl,
  ];

  if (args.meetUrl) {
    lines.push("", `Join via Google Meet: ${args.meetUrl}`);
  }

  lines.push("", "Educational only — not financial advice.");
  return lines.join("\n");
}

export function getDiscoveryEmailContent(args: {
  name: string;
  packageContext: DiscoveryPackageContext;
  start: Date;
  prepUrl: string;
  meetUrl?: string;
  htmlLink?: string;
  viewerTimezone?: string;
}): { subject: string; html: string; text: string } {
  const tz = args.viewerTimezone || COACH_TIMEZONE;
  const when = formatBookingDateTime(args.start, tz);
  const coachWhen = formatBookingDateTime(args.start, COACH_TIMEZONE);
  const hi = args.name.trim() || "there";

  const subject = args.packageContext.id
    ? `Your ${args.packageContext.name} discovery call is confirmed`
    : "Your DeFi University discovery call is confirmed";

  const packageParagraph = args.packageContext.id
    ? `<p>You're exploring the <strong>${args.packageContext.name}</strong> tier (${args.packageContext.priceDisplay} · ${args.packageContext.durationWeeks} weeks · ${args.packageContext.sessionCount} sessions).</p>`
    : `<p>You're exploring DeFi University private coaching options.</p>`;

  const timeNote =
    tz !== COACH_TIMEZONE
      ? `<p><em>Coach availability is Mon–Fri, 9am–6pm Eastern (${coachWhen}).</em></p>`
      : "";

  const html = [
    `<p>Hi ${hi},</p>`,
    `<p>Your 30-minute discovery call is confirmed for <strong>${when}</strong>.</p>`,
    packageParagraph,
    args.meetUrl
      ? `<p><strong>Google Meet:</strong> <a href="${args.meetUrl}">${args.meetUrl}</a></p>`
      : "",
    args.htmlLink
      ? `<p><a href="${args.htmlLink}">Add to Google Calendar</a></p>`
      : "",
    `<p><strong>Before your call</strong>, review what to prepare:</p>`,
    `<p><a href="${args.prepUrl}">${args.prepUrl}</a></p>`,
    timeNote,
    "<p>A separate calendar invite should also arrive from Google Calendar.</p>",
    "<p>Educational only — not financial advice.</p>",
  ]
    .filter(Boolean)
    .join("");

  const text = [
    `Hi ${hi},`,
    "",
    `Your 30-minute discovery call is confirmed for ${when}.`,
    "",
    args.packageContext.id
      ? `You're exploring the ${args.packageContext.name} tier (${args.packageContext.summaryLine}).`
      : "You're exploring DeFi University private coaching options.",
    "",
    args.meetUrl ? `Google Meet: ${args.meetUrl}` : "",
    args.htmlLink ? `Calendar: ${args.htmlLink}` : "",
    "",
    "Before your call, review what to prepare:",
    args.prepUrl,
    "",
    tz !== COACH_TIMEZONE
      ? `Coach availability is Mon–Fri, 9am–6pm Eastern (${coachWhen}).`
      : "",
    "",
    "A separate calendar invite should also arrive from Google Calendar.",
    "",
    "Educational only — not financial advice.",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export function getInstitutionalApplicationEmailContent(args: {
  name: string;
  packageContext: DiscoveryPackageContext;
  prepUrl: string;
}): { subject: string; html: string; text: string } {
  const hi = args.name.trim() || "there";
  const tier = args.packageContext.name;
  const capitalNote = args.packageContext.targetCapital
    ? ` (${args.packageContext.targetCapital} target capital band)`
    : "";

  const subject = `We received your ${tier} application`;

  const html = [
    `<p>Hi ${hi},</p>`,
    `<p>Thanks for applying to the <strong>${tier}</strong> tier${capitalNote ? ` — ${args.packageContext.targetCapital} target capital band` : ""}.</p>`,
    `<p>We've saved your application. The next step is to book a 30-minute discovery call so we can review fit together.</p>`,
    `<p><strong>Book your call</strong> on the apply page if you haven't already, or use the prep guide below before we meet:</p>`,
    `<p><a href="${args.prepUrl}">${args.prepUrl}</a></p>`,
    `<p>${tier} is application-only — we'll discuss your goals, capital range, and whether this tier is the right fit on the call.</p>`,
    "<p>Educational only — not financial advice.</p>",
  ].join("");

  const text = [
    `Hi ${hi},`,
    "",
    `Thanks for applying to the ${tier} tier${capitalNote}.`,
    "",
    "We've saved your application. The next step is to book a 30-minute discovery call so we can review fit together.",
    "",
    "Book your call on the apply page if you haven't already, or review this prep guide before we meet:",
    args.prepUrl,
    "",
    `${tier} is application-only — we'll discuss your goals, capital range, and whether this tier is the right fit on the call.`,
    "",
    "Educational only — not financial advice.",
  ].join("\n");

  return { subject, html, text };
}

const PREP_BY_PACKAGE: Record<PackageId | "general", DiscoveryPrepContent> = {
  general: {
    headline: "Prepare for your discovery call",
    intro:
      "A short conversation to understand your DeFi goals and whether private coaching is the right next step. Come ready to talk about where you are and what you want to build.",
    checklist: [
      "Your DeFi experience level (beginner, intermediate, or advanced)",
      "What you want to achieve in the next 3–6 months",
      "Approximate capital range you're working with",
      "Whether you self-custody today (wallet setup, security habits)",
      "Your biggest blocker right now (strategy, risk, time, knowledge)",
    ],
    callAgenda: [
      "Your goals and current DeFi activity",
      "Which coaching package might fit (Kickstart, Operator, or Inner Circle)",
      "How sessions, deliverables, and async support work",
      "Next steps if you decide to move forward",
    ],
  },
  foundations: {
    headline: "Prepare for your Kickstart discovery call",
    intro:
      "Kickstart is the smallest way to start private 1-on-1 coaching — two focused 60-minute sessions within 30 days for traders building their first structured DeFi approach. The full fee counts toward Operator if you upgrade within 30 days.",
    checklist: [
      "Your DeFi goals for the next 3–6 months",
      "Capital range you're working with ($1K–$25K target band)",
      "Current wallet setup and self-custody comfort level",
      "Protocols or strategies you've tried (and what went wrong or right)",
      "Your biggest risk concern (IL, leverage, smart-contract risk, etc.)",
    ],
    callAgenda: [
      "Whether Kickstart matches your capital range and goals",
      "What the two sessions cover",
      "Deliverables: risk-parameter profile practiced as education — not a managed portfolio",
      "How async Slack support works during the 30-day engagement",
    ],
  },
  mastery: {
    headline: "Prepare for your Operator discovery call",
    intro:
      "Operator is a 12-week education program with eight 1-on-1 sessions, three months of the DeFi University membership, a guided risk-framework blueprint, and curated research. You keep self-custody. Not portfolio management.",
    checklist: [
      "Current allocation notes you are willing to discuss as a case study",
      "Protocols and strategies you are studying today",
      "Gaps in your research process or due diligence",
      "What a risk-framework blueprint would need to cover for your process",
      "Your timeline and commitment for a 12-week engagement",
    ],
    callAgenda: [
      "Whether Operator fits your capital range and goals",
      "Session cadence, deliverables, and the membership live calls",
      "Smart-contract audit checklist and research bulletins",
      "Payment options and next steps after the call",
    ],
  },
  institutional: {
    headline: "Prepare for your Inner Circle discovery call",
    intro:
      "Inner Circle is six months of weekly 1-on-1 sessions with direct access to David, six months of the membership, and due-diligence walkthroughs on the protocols you bring.",
    checklist: [
      "Why you want Inner Circle rather than Operator",
      "Capital deployment timeline and approximate portfolio size ($100K+)",
      "Specific tokens or protocols you want due diligence on",
      "What you want from six months of weekly sessions",
      "Your experience with high-touch coaching or advisory relationships",
    ],
    callAgenda: [
      "Fit and capital range",
      "Due-diligence walkthroughs on the protocols you bring",
      "24-session cadence and founder involvement",
      "Next steps if there's mutual fit",
    ],
  },
};

export function getDiscoveryPrepContent(
  packageId?: string
): DiscoveryPrepContent {
  if (!packageId) return PREP_BY_PACKAGE.general;
  const key = packageId as PackageId;
  return PREP_BY_PACKAGE[key] ?? PREP_BY_PACKAGE.general;
}