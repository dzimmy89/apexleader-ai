import { BRAND } from "@/lib/brand";
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
  bestFor: string;
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
  tagline: `Explore which ${BRAND.name} coaching tier fits your goals.`,
  priceDisplay: "",
  durationWeeks: 0,
  sessionCount: 0,
  bestFor: "",
  summaryLine: `Exploring ${BRAND.name} private coaching options`,
};

function toContext(pkg: CoachingPackage): DiscoveryPackageContext {
  return {
    id: pkg.id,
    name: pkg.name,
    tagline: pkg.tagline,
    priceDisplay: pkg.priceDisplay,
    durationWeeks: pkg.durationWeeks,
    sessionCount: pkg.sessionCount,
    bestFor: pkg.bestFor,
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
  return `${BRAND.name} Discovery Call — ${who}`;
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
    : `You're exploring ${BRAND.name} private coaching options.`;

  const fitLine = args.packageContext.id
    ? `We'll discuss your business, what you want AI to do in it, and whether ${args.packageContext.name} is the right fit.`
    : "We'll discuss your business, what you want AI to do in it, and which coaching tier might fit.";

  const lines = [
    greeting,
    "",
    `You're confirmed for a 30-minute discovery call with ${BRAND.name}.`,
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
    : `Your ${BRAND.name} discovery call is confirmed`;

  const packageParagraph = args.packageContext.id
    ? `<p>You're exploring the <strong>${args.packageContext.name}</strong> tier (${args.packageContext.priceDisplay} · ${args.packageContext.durationWeeks} weeks · ${args.packageContext.sessionCount} sessions).</p>`
    : `<p>You're exploring ${BRAND.name} private coaching options.</p>`;

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
      : `You're exploring ${BRAND.name} private coaching options.`,
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

  const subject = `We received your ${tier} application`;

  const html = [
    `<p>Hi ${hi},</p>`,
    `<p>Thanks for applying to the <strong>${tier}</strong> tier.</p>`,
    `<p>We've saved your application. The next step is to book a 30-minute discovery call so we can review fit together.</p>`,
    `<p><strong>Book your call</strong> on the apply page if you haven't already, or use the prep guide below before we meet:</p>`,
    `<p><a href="${args.prepUrl}">${args.prepUrl}</a></p>`,
    `<p>${tier} is application-only — we'll discuss your business, your goals, and whether this tier is the right fit on the call.</p>`,
  ].join("");

  const text = [
    `Hi ${hi},`,
    "",
    `Thanks for applying to the ${tier} tier.`,
    "",
    "We've saved your application. The next step is to book a 30-minute discovery call so we can review fit together.",
    "",
    "Book your call on the apply page if you haven't already, or review this prep guide before we meet:",
    args.prepUrl,
    "",
    `${tier} is application-only — we'll discuss your business, your goals, and whether this tier is the right fit on the call.`,
  ].join("\n");

  return { subject, html, text };
}

const PREP_BY_PACKAGE: Record<PackageId | "general", DiscoveryPrepContent> = {
  general: {
    headline: "Prepare for your discovery call",
    intro:
      "A short conversation about your business, what you want AI to do in it, and whether private coaching is the right next step.",
    checklist: [
      "What your business does and who does the work today",
      "Two or three tasks that eat the most time each week",
      "AI tools you have tried, and what worked or did not",
      "What you would like to be able to build yourself in the next 3 months",
      "How much time a week you can give to coaching and practice",
    ],
    callAgenda: [
      "Your business and where AI could help first",
      "Which coaching package might fit",
      "How sessions, your syllabus and support between sessions work",
      "Next steps if you decide to move forward",
    ],
  },
  foundations: {
    headline: "Prepare for your Kickstart discovery call",
    intro:
      "Kickstart is the smallest way to start private coaching: a short engagement to get AI working on one real part of your business.",
    checklist: [
      "The one process you most want AI to help with",
      "The tools and accounts your business already uses",
      "AI tools you have tried so far",
      "What a good result looks like at the end of a month",
    ],
    callAgenda: [
      "Whether Kickstart fits your goals",
      "What the sessions cover and what you build between them",
      "How support between sessions works",
    ],
  },
  mastery: {
    headline: "Prepare for your Operator discovery call",
    intro:
      "Operator is a longer engagement: a syllabus built around your business, regular sessions, and build projects on your own processes.",
    checklist: [
      "The processes you want AI to take on, in order of priority",
      "Who else on your team would use what you build",
      "Data and tools the work would touch",
      "Your timeline and how much time a week you can commit",
    ],
    callAgenda: [
      "Whether Operator fits your goals",
      "Session cadence, your syllabus and the course library",
      "Payment options and next steps after the call",
    ],
  },
  institutional: {
    headline: "Prepare for your Inner Circle discovery call",
    intro: `Inner Circle is the deepest engagement: regular sessions with ${BRAND.coachFirstName} and build work across your business.`,
    checklist: [
      "Why you want Inner Circle rather than Operator",
      "The biggest change you want AI to make in your business this year",
      "The systems, data and people involved",
      "What you want from working together over several months",
    ],
    callAgenda: [
      "Fit and goals",
      "How build projects across your business would run",
      "Session cadence and how to reach the coach between sessions",
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