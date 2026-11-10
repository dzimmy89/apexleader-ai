import { URLS, POSTAL_ADDRESS, isPostalAddressPlaceholder } from "@/content/site";
import { BRAND } from "@/lib/brand";
import { emailShell, marketingPlaintext, MARKETING_RECEIVING_REASON_LEAD } from "@/lib/email-layout";
import { getSiteOrigin } from "@/lib/env";
import { FLOW_TEMPLATE_IDS } from "@/lib/flow-definitions";
import { LEAD_CONFIRM_SUBJECT } from "@/lib/consent";
import { escapeHtml } from "@/lib/html";
import {
  lessonEmailStepIds,
  parseLessonStepId,
  renderLessonEmail,
  type SeriesLesson,
} from "@/lib/lesson-series/messages";

export interface EmailContext {
  email: string;
  firstName?: string;
  unsubscribeUrl?: string;
  receivingReason?: string;
  /** Lesson series only: the lesson the lead came in through. */
  lesson?: SeriesLesson | null;
  /** Lesson series only: the lead's reader link token, so links open exercises in any browser. */
  readerToken?: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text?: string;
}

function cta(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;padding:12px 24px;background:#fe7222;color:#0b0f18;text-decoration:none;font-weight:bold;border-radius:999px;">${label}</a></p>`;
}

function wrap(subject: string, body: string, ctx: EmailContext, preview?: string): RenderedEmail {
  if (!ctx.unsubscribeUrl) {
    throw new Error("emailShell requires unsubscribeUrl for marketing templates");
  }
  const html = emailShell({
    purpose: "marketing",
    bodyHtml: body,
    previewText: preview || subject,
    unsubscribeUrl: ctx.unsubscribeUrl,
    receivingReason: ctx.receivingReason || MARKETING_RECEIVING_REASON_LEAD,
  });
  const text = marketingPlaintext({
    bodyHtml: body,
    unsubscribeUrl: ctx.unsubscribeUrl,
  });
  return { subject, html, text };
}

function coachingCta(): string {
  return cta(`${getSiteOrigin()}/coaching`, "See private coaching");
}

function discoveryCta(): string {
  return cta(`${getSiteOrigin()}${URLS.coachingDiscovery}`, "Book a free discovery call");
}

function hi(ctx: EmailContext): string {
  return ctx.firstName || "there";
}

/**
 * Coaching flow emails (lib/flow-definitions.ts). Placeholder copy to edit
 * before go-live; every step id in FLOW_TEMPLATE_IDS needs one entry.
 */
const templates: Record<(typeof FLOW_TEMPLATE_IDS)[number], (ctx: EmailContext) => RenderedEmail> = {
  coaching_reminder: (ctx) =>
    wrap(
      "Your free discovery call",
      `<p>Hi ${hi(ctx)},</p>
<p>Thanks for asking about private coaching with ${BRAND.coachName}. The next step is a free 30-minute call: we look at your business, what you want AI to do in it, and whether coaching fits.</p>
${discoveryCta()}`,
      ctx
    ),
  coaching_foundations_offer: (ctx) =>
    wrap(
      "Start small: Kickstart",
      `<p>Hi ${hi(ctx)},</p>
<p>Kickstart is the smallest way to start: two sessions and one build project on a real part of your business. If you move up to Operator within 30 days, the full fee counts toward it.</p>
${coachingCta()}`,
      ctx,
      "Two sessions, one real build"
    ),
  coaching_what_clients_build: (ctx) =>
    wrap(
      "What clients build in coaching",
      `<p>Hi ${hi(ctx)},</p>
<p>Clients leave coaching with AI doing real work in their business: drafting replies, sorting leads, writing reports, and small internal tools they built themselves. Every syllabus starts from the discovery call.</p>
${discoveryCta()}
<p>Individual results vary.</p>`,
      ctx
    ),
  coaching_final_discovery_nudge: (ctx) =>
    wrap(
      "Last note: book your discovery call",
      `<p>Hi ${hi(ctx)},</p>
<p>This is our final note for now. A free 30-minute call is the easiest way to find out whether private coaching fits. No pressure, no obligation.</p>
${discoveryCta()}`,
      ctx
    ),
  coaching_post_call_thanks: (ctx) =>
    wrap(
      "Thanks for the call",
      `<p>Hi ${hi(ctx)},</p>
<p>Great speaking with you today. I'm putting together a recommendation for which package fits your goals.</p>
<p>Meanwhile, you can review the packages anytime:</p>
${coachingCta()}
<p>Talk soon,<br />${escapeHtml(BRAND.coachFirstName)}</p>`,
      ctx,
      "Your recommendation is on the way"
    ),
  coaching_post_call_recap: (ctx) =>
    wrap(
      "Your discovery call recap",
      `<p>Hi ${hi(ctx)},</p>
<p>Thanks again for the conversation. You'll have my recommendation within 48 hours, with a first draft of what your syllabus would cover.</p>
${coachingCta()}`,
      ctx
    ),
  coaching_post_call_proposal: (ctx) =>
    wrap(
      "Your coaching recommendation",
      `<p>Hi ${hi(ctx)},</p>
<p>Based on our conversation, here is the package I recommend. You can review the details and check out directly, in full or in installments.</p>
${coachingCta()}
<p>If you'd like to adjust the plan or talk about payment options, just reply to this email.</p>`,
      ctx
    ),
};

export function getTemplate(stepId: string, ctx: EmailContext): RenderedEmail {
  if (parseLessonStepId(stepId)) {
    if (!ctx.unsubscribeUrl) throw new Error("lesson series emails need an unsubscribeUrl");
    // renderLessonEmail escapes the first name itself.
    return renderLessonEmail(stepId, {
      firstName: ctx.firstName,
      unsubscribeUrl: ctx.unsubscribeUrl,
      lesson: ctx.lesson,
      readerToken: ctx.readerToken,
    });
  }
  const fn = (templates as Record<string, (ctx: EmailContext) => RenderedEmail>)[stepId];
  if (!fn) throw new Error(`Unknown email template: ${stepId}`);
  return fn({
    ...ctx,
    firstName: ctx.firstName ? escapeHtml(ctx.firstName) : ctx.firstName,
  });
}

/** Double opt-in email for a lead who has not confirmed their address yet. */
export function buildLeadConfirmEmail(ctx: {
  email: string;
  firstName?: string;
  confirmUrl: string;
  /** The lesson whose exercise gate they came through, if any. */
  lessonTitle?: string;
  /** The one reminder, a day after the first confirm email went unclicked. */
  reminder?: boolean;
}): RenderedEmail {
  const name = ctx.firstName ? escapeHtml(ctx.firstName) : "there";
  const lessonLine = ctx.lessonTitle
    ? `<p>Once you confirm, I'll send you the exercise from “${escapeHtml(ctx.lessonTitle)}” and a few short notes on the same topic.</p>\n`
    : "";
  const lessonText = ctx.lessonTitle
    ? `Once you confirm, I'll send you the exercise from "${ctx.lessonTitle}" and a few short notes on the same topic.\n\n`
    : "";
  const entity = `${BRAND.legalName}${isPostalAddressPlaceholder() ? "" : ` · ${POSTAL_ADDRESS}`} · ${BRAND.email}`;
  const opener = ctx.reminder
    ? `<p>Yesterday you asked for ${ctx.lessonTitle ? `the exercise from “${escapeHtml(ctx.lessonTitle)}”` : `notes from ${escapeHtml(BRAND.name)}`}, but the email isn't confirmed yet. This is the only reminder I'll send.</p>`
    : `<p>Someone asked to hear from ${escapeHtml(BRAND.name)} at ${BRAND.domain} using this email address. We hope it was you.</p>`;
  const openerText = ctx.reminder
    ? `Yesterday you asked for ${ctx.lessonTitle ? `the exercise from "${ctx.lessonTitle}"` : `notes from ${BRAND.name}`}, but the email isn't confirmed yet. This is the only reminder I'll send.`
    : `Someone asked to hear from ${BRAND.name} at ${BRAND.domain} using this email address. We hope it was you.`;
  const body = `<p>Hi ${name},</p>
${opener}
<p>Please confirm your email:</p>
${cta(ctx.confirmUrl, "Confirm my email")}
${lessonLine}<p>This link expires ${ctx.reminder ? "within a week of your first request" : "in 7 days"}.</p>
<p>Didn't ask for this? Just ignore this email. You won't be subscribed unless you click the link.</p>
<p>— ${escapeHtml(BRAND.coachFirstName)}, ${escapeHtml(BRAND.name)}</p>
<p>${escapeHtml(entity)}</p>`;
  const html = emailShell({
    purpose: "transactional",
    bodyHtml: body,
    previewText: "One click to confirm. If this wasn't you, ignore it.",
  });
  const text = `Hi ${ctx.firstName || "there"},

${openerText}

Please confirm your email: ${ctx.confirmUrl}

${lessonText}This link expires ${ctx.reminder ? "within a week of your first request" : "in 7 days"}.

Didn't ask for this? Just ignore this email. You won't be subscribed unless you click the link.

— ${BRAND.coachFirstName}, ${BRAND.name}
${entity}`;
  return {
    subject: ctx.reminder
      ? ctx.lessonTitle
        ? `Your exercise is waiting: confirm your email`
        : `Reminder: ${LEAD_CONFIRM_SUBJECT.charAt(0).toLowerCase()}${LEAD_CONFIRM_SUBJECT.slice(1)}`
      : LEAD_CONFIRM_SUBJECT,
    html,
    text,
  };
}

/** Every email step: the coaching flows, then each lesson series (sample lesson). */
export function listTemplateIds(): string[] {
  return [...FLOW_TEMPLATE_IDS, ...lessonEmailStepIds()];
}

export { FLOW_TEMPLATE_IDS };
