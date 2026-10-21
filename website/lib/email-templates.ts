import { URLS, POSTAL_ADDRESS, isPostalAddressPlaceholder } from "@/content/site";
import {
  emailShell,
  marketingPlaintext,
  MARKETING_RECEIVING_REASON_LEAD,
  MARKETING_RECEIVING_REASON_MEMBER,
} from "@/lib/email-layout";
import { getSiteOrigin } from "@/lib/env";
import { FLOW_TEMPLATE_IDS } from "@/lib/flow-definitions";
import { LEAD_CONFIRM_SUBJECT } from "@/lib/consent";
import { escapeHtml } from "@/lib/html";
import { assertLegacyLeadWelcomeAllowed } from "@/lib/legacy-welcome";

export interface EmailContext {
  email: string;
  firstName?: string;
  unsubscribeUrl?: string;
  receivingReason?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text?: string;
}

function cta(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;padding:12px 24px;background:#c9a227;color:#0f0f0f;text-decoration:none;font-weight:bold;border-radius:4px;">${label}</a></p>`;
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

function skoolCta(_ctx: EmailContext): string {
  return cta(URLS.skoolPlans, "Join DeFi University on Skool");
}

function coachingCta(_ctx: EmailContext): string {
  const origin = getSiteOrigin();
  return cta(`${origin}/coaching`, "Explore Private Coaching");
}

function discoveryCta(_ctx: EmailContext): string {
  const origin = getSiteOrigin();
  return cta(`${origin}${URLS.coachingDiscovery}`, "Book a Free Discovery Call");
}

function universityLink(): string {
  const origin = getSiteOrigin();
  return `<p style="margin:16px 0;font-size:14px;">Prefer self-paced study first? Browse our <a href="${origin}/university" style="color:#c9a227;">free University courses</a>.</p>`;
}

function hi(ctx: EmailContext): string {
  return ctx.firstName || "there";
}

function checklistUrl(): string {
  return `${getSiteOrigin()}/checklists/defi-safety-checklist.html`;
}

function signoff(): string {
  return `<p>— The DeFi University team</p>`;
}

function eduLine(): string {
  return `<p>Educational only — not financial advice. You keep self-custody of your assets. No guaranteed outcomes.</p>`;
}

function duWelcomeD0(ctx: EmailContext): RenderedEmail {
  const magnet = checklistUrl();
  return wrap(
    "Your DeFi Safety Checklist (and where to start)",
    `<p>Hi ${hi(ctx)},</p>
<p>Welcome to DeFi University. Here's the checklist you asked for: <a href="${magnet}" style="color:#c9a227;">${magnet}</a></p>
<p>We teach DeFi security first, because the most common way people get hurt in this space is a bad signature or a leaked seed phrase.</p>
<p>Two things to do today:</p>
<ol>
<li>Work through the checklist. It takes about 15 minutes.</li>
<li>Pick the one item you're weakest on and fix it before you try anything new.</li>
</ol>
<p>Over the next three weeks we'll send a short lesson every few days. If you have a question, just reply. A real person reads every reply.</p>
${signoff()}`,
    ctx,
    "Security first. Everything else second."
  );
}

function duWelcomeD2(ctx: EmailContext): RenderedEmail {
  const coursesLine =
    "<p>Lessons like these are what the Course Hub is built on. Members work through 5 courses in order, from investor mindset through advanced DeFi topics.</p>";
  return wrap(
    "The three wallet mistakes we see most",
    `<p>Hi ${hi(ctx)},</p>
<p>The same three mistakes come up again and again:</p>
<ol>
<li><strong>One hot wallet for everything.</strong> Long-term holdings belong on a hardware wallet. Keep a separate hot wallet for experiments.</li>
<li><strong>Unlimited approvals.</strong> Old token approvals are an open door. Review and revoke them monthly.</li>
<li><strong>Blind signing.</strong> If you can't read what you're signing, don't sign it.</li>
</ol>
${coursesLine}
${signoff()}`,
    ctx,
    "None of them are about picking the wrong token."
  );
}

function duWelcomeD5(ctx: EmailContext): RenderedEmail {
  const coursesLine =
    "<p>That's the idea behind the DeFi University community on Skool: 5 structured courses and a community of people learning the same material. Members also join live calls with David on Monday, Wednesday, and Friday, 5–6 PM ET (times are on the Skool Calendar).</p>";
  return wrap(
    "Why structure beats more YouTube",
    `<p>Hi ${hi(ctx)},</p>
<p>Free content is everywhere. What's harder to find is a sequence that takes you from "I've heard of it" to "I understand it well enough to act carefully."</p>
${coursesLine}
<p>Take a look: <a href="https://www.skool.com/defiuniversity" style="color:#c9a227;">https://www.skool.com/defiuniversity</a></p>
${signoff()}`,
    ctx
  );
}

function duWelcomeD8(ctx: EmailContext): RenderedEmail {
  const trialLine =
    '<p>Every membership starts with a 7-day free trial, so you can sit in on a live call before you pay. Live calls run 5–6 PM ET; check the Skool Calendar for current times. Join here: <a href="https://www.skool.com/defiuniversity/plans" style="color:#c9a227;">https://www.skool.com/defiuniversity/plans</a></p>';
  return wrap(
    "One membership, every live call",
    `<p>Hi ${hi(ctx)},</p>
<p>If you'd like to go deeper, there is one way to join:</p>
<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#e8e4dc;">
<tr><th align="left">Plan</th><th align="left">Price</th><th align="left">What's included</th></tr>
<tr><td>Membership</td><td>$97/month</td><td>Live calls with David Monday, Wednesday, and Friday, the community, and the Course Hub (5 courses)</td></tr>
</table>
${trialLine}
${signoff()}
${eduLine()}`,
    ctx,
    "Every live call and every course, one plan."
  );
}

function duWelcomeD12(ctx: EmailContext): RenderedEmail {
  return wrap(
    "Three live calls a week with David",
    `<p>Hi ${hi(ctx)},</p>
<p>Members bring their questions to live calls with David every Monday, Wednesday, and Friday. It's one plan, $97/month, and the first 7 days are free: <a href="https://www.skool.com/defiuniversity/plans" style="color:#c9a227;">https://www.skool.com/defiuniversity/plans</a></p>
${signoff()}
${eduLine()}`,
    ctx
  );
}

function duWelcomeD16(ctx: EmailContext): RenderedEmail {
  return wrap(
    "When you'd rather learn one-on-one",
    `<p>Hi ${hi(ctx)},</p>
<p>Some people learn best with a teacher in the room. They have specific questions about their setup and process, and not much time.</p>
<p>That's what private coaching is for. It's education only. You keep self-custody the whole time, and nobody manages anything for you.</p>
<ul>
<li><strong>Kickstart: $750.</strong> Two 60-minute one-on-one sessions within 30 days, covering a security and self-custody setup baseline. The full fee counts toward Operator if you upgrade within 30 days.</li>
<li><strong>Operator: $2,500.</strong> Eight one-on-one education sessions over 12 weeks on setup, risk frameworks, and process, plus three months of the membership. Enroll directly or start with a free call.</li>
<li><strong>Inner Circle: $7,500.</strong> Six months of weekly sessions directly with David. It starts with a free call.</li>
</ul>
<p>Book a free discovery call: <a href="https://defiuniversity.xyz/coaching/book" style="color:#c9a227;">https://defiuniversity.xyz/coaching/book</a></p>
${signoff()}
${eduLine()}`,
    ctx,
    "Private education sessions, starting with a free discovery call."
  );
}

function duWelcomeD21(ctx: EmailContext): RenderedEmail {
  const unsub = ctx.unsubscribeUrl || "";
  return wrap(
    "Should we keep sending these?",
    `<p>Hi ${hi(ctx)},</p>
<p>It's been three weeks. We'd rather send fewer emails to people who want them than more to people who don't.</p>
<ul>
<li><strong>Keep me on the list:</strong> no action needed. You'll get an occasional educational email from us.</li>
<li><strong>I'd like to learn with others:</strong> <a href="https://www.skool.com/defiuniversity" style="color:#c9a227;">https://www.skool.com/defiuniversity</a></li>
<li><strong>Not for me right now:</strong> unsubscribe here: <a href="${unsub}" style="color:#c9a227;">${unsub}</a></li>
</ul>
<p>Thanks for reading.</p>
${signoff()}`,
    ctx,
    "One click either way."
  );
}

const templates: Record<string, (ctx: EmailContext) => RenderedEmail> = {
  welcome: (ctx) =>
    wrap(
      "Welcome to DeFi University",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Your membership is active. You now have access to live Q&A, structured courses, and a community of serious learners.</p>
${skoolCta(ctx)}
<p>We teach frameworks and risk thinking — not hype.</p>`,
      ctx,
      "Your Skool membership is live"
    ),
  skool_orientation: (ctx) =>
    wrap(
      "How to get the most from Skool",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Show up with one question. Live calls with David run Monday, Wednesday, and Friday. Confirm times on the Skool Calendar.</p>
${skoolCta(ctx)}
${universityLink()}`,
      ctx,
      "Three live calls a week, times on the Skool Calendar"
    ),
  university_cta: (ctx) =>
    wrap(
      "Ready for 1-on-1 coaching?",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>If Skool live calls are clicking and you want a personal plan, book a free discovery call. Private coaching runs from Kickstart at $750 to Operator at $2,500. Education only — not financial advice.</p>
${discoveryCta(ctx)}
${skoolCta(ctx)}`,
      ctx,
      "Skool community or private coaching — pick your path"
    ),
  engagement_check: (ctx) =>
    wrap(
      "Still with us?",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>If you have not joined a live call yet, pick one this week. The community moves faster when you participate.</p>
${skoolCta(ctx)}`,
      ctx
    ),
  cancel_confirm: (ctx) =>
    wrap(
      "We are sorry to see you go",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Your subscription has ended. You can rejoin anytime — the community and live calls will be here.</p>
${skoolCta(ctx)}`,
      ctx
    ),
  what_you_missed: (ctx) =>
    wrap(
      "What you missed this week",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Members continued live Q&A and course discussions. Rejoin to pick up where you left off.</p>
${skoolCta(ctx)}`,
      ctx
    ),
  final_nudge: (ctx) =>
    wrap(
      "Last chance to rejoin",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>This is our final note for now. When you are ready, the door is open.</p>
${skoolCta(ctx)}`,
      ctx
    ),
  watchlist_waiting: (ctx) =>
    wrap(
      "We have not seen you lately",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>It's been a while since we saw you in the DeFi University community. Your courses and the community threads are there whenever you want to pick back up. If your plan includes live calls, the times are on the Skool Calendar.</p>
${cta("https://www.skool.com/defiuniversity", "Open DeFi University on Skool")}`,
      { ...ctx, receivingReason: MARKETING_RECEIVING_REASON_MEMBER }
    ),
  intro_course_nudge: (ctx) =>
    wrap(
      "Join DeFi University on Skool: $97/month",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Members get the Course Hub lessons, the community, and live Q&A with David every Monday, Wednesday, and Friday. One plan: $97/month, billed monthly by Skool, with a 7-day free trial. Cancel anytime.</p>
${skoolCta(ctx)}
${universityLink()}`,
      ctx,
      "One plan, every live call"
    ),
  newsletter_upsell: (ctx) =>
    wrap(
      "Ready for live mentorship?",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Members get live Q&A with David every Monday, Wednesday, and Friday (times on the Skool Calendar). Education only, no hype.</p>
${skoolCta(ctx)}`,
      ctx
    ),
  learn_library_nudge: (ctx) =>
    wrap(
      "Live calls beat solo study",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Courses help — but live questions compound faster. Members get Mon/Wed/Fri live Q&A with David, plus the Course Hub and community, for $97/month.</p>
${skoolCta(ctx)}
${universityLink()}`,
      ctx
    ),
  lead_final_subscribe: (ctx) =>
    wrap(
      "Join when you are ready",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Last note from us for now. The membership is $97/month with a 7-day free trial — cancel anytime. Want a personal plan instead? Book a discovery call; private coaching starts at $750.</p>
${skoolCta(ctx)}
${discoveryCta(ctx)}`,
      ctx
    ),
  sample_subscribe_nudge: (ctx) =>
    wrap(
      "Liked the sample? Go deeper",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Skool adds live calls with David on Monday, Wednesday, and Friday, structured Course Hub lessons, and a community of learners. One plan: $97/month, 7 days free.</p>
${skoolCta(ctx)}`,
      ctx
    ),
  sample_social_proof: (ctx) =>
    wrap(
      "Structured education, not headcount",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Learners use DeFi University for structured education — not signals or guaranteed returns.</p>
${skoolCta(ctx)}`,
      ctx
    ),
  sample_final_nudge: (ctx) =>
    wrap(
      "Your invitation stands",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Whenever you are ready, join the membership on Skool ($97/month, 7 days free). Prefer 1-on-1? Book a discovery call — Operator is $2,500 and includes three months of the membership.</p>
${skoolCta(ctx)}
${discoveryCta(ctx)}`,
      ctx
    ),
  coaching_reminder: (ctx) =>
    wrap(
      "Coaching applications open",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Private 1-on-1 coaching with David Zimmerman is open. Three packages — Kickstart ($750), Operator ($2,500), and Inner Circle ($7,500) — each with process education, a risk-framework workshop, and self-custody setup. Not portfolio management.</p>
${discoveryCta(ctx)}`,
      ctx
    ),
  coaching_newsletter_bridge: (ctx) =>
    wrap(
      "Skool or coaching?",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Not sure which path fits? Coaching is intensive 1:1 education. Start with a discovery call (Operator is $2,500). The membership is the community plus live Q&A three days a week for $97/month.</p>
${discoveryCta(ctx)}
${skoolCta(ctx)}`,
      ctx
    ),
  coaching_foundations_offer: (ctx) =>
    wrap(
      "Start with Kickstart — $750",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Kickstart is the lowest-risk way to experience private DeFi coaching. Two 60-minute sessions, a personalized risk-parameter profile, and a leverage-aware risk plan you practice before you act. If you move up to Operator within 30 days, the full $750 counts toward it.</p>
${coachingCta(ctx)}
<p>Educational only — not financial advice.</p>`,
      ctx,
      "Two sessions, $750, credited toward Operator"
    ),
  coaching_testimonial_social_proof: (ctx) =>
    wrap(
      "How clients use their coaching",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Clients use private coaching to build judgment — not to chase tips.</p>
${discoveryCta(ctx)}
<p>Individual results vary. Past performance is not indicative of future results. Educational only — not financial advice.</p>`,
      ctx
    ),
  coaching_institutional_positioning: (ctx) =>
    wrap(
      "Inner Circle vs. the high-ticket competitors",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>If you've looked at high-ticket DeFi coaching ($18K–$21K), you should see how Inner Circle compares: 24 weekly sessions over 6 months, direct founder access, custom protocol due-diligence, and a token-gated HNWI mastermind — for $7,500.</p>
${coachingCta(ctx)}`,
      ctx,
      "24 weekly sessions, listed at $7,500",
    ),
  coaching_final_discovery_nudge: (ctx) =>
    wrap(
      "Last note: book your discovery call",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>This is our final note for now. A free 30-minute discovery call is the lowest-risk way to figure out whether private coaching fits — no pressure, no obligation.</p>
${discoveryCta(ctx)}`,
      ctx
    ),
  coaching_post_call_thanks: (ctx) =>
    wrap(
      "Thanks for the call",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Great speaking with you today. I've sent over a summary of what we discussed, and I'm working on a personalized recommendation for which tier fits your goals.</p>
<p>Meanwhile, you can review packages anytime:</p>
${coachingCta(ctx)}
<p>Talk soon,<br />David</p>`,
      ctx,
      "Your discovery call recap is on the way"
    ),
  coaching_post_call_recap: (ctx) =>
    wrap(
      "Your discovery call recap",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>Thanks again for the conversation. Based on what we covered, here's a quick recap of your goals and the next step.</p>
<p>You'll have a personalized recommendation from me within 48 hours.</p>
${coachingCta(ctx)}`,
      ctx
    ),
  coaching_post_call_proposal: (ctx) =>
    wrap(
      "Your coaching recommendation",
      `<p>Hi ${ctx.firstName || "there"},</p>
<p>I've reviewed your goals, capital, and timeline. Based on our conversation, I recommend Operator ($2,500, or 3 payments of $834) or the package we discussed — you can review the details and complete checkout directly.</p>
${coachingCta(ctx)}
<p>If you'd like to adjust the plan or discuss payment options, just reply to this email.</p>`,
      ctx
    ),
  du_welcome_d0: (ctx) => duWelcomeD0(ctx),
  du_welcome_d2: (ctx) => duWelcomeD2(ctx),
  du_welcome_d5: (ctx) => duWelcomeD5(ctx),
  du_welcome_d8: (ctx) => duWelcomeD8(ctx),
  du_welcome_d12: (ctx) => duWelcomeD12(ctx),
  du_welcome_d16: (ctx) => duWelcomeD16(ctx),
  du_welcome_d21: (ctx) => duWelcomeD21(ctx),
};

export function getTemplate(stepId: string, ctx: EmailContext): RenderedEmail {
  const fn = templates[stepId];
  if (!fn) throw new Error(`Unknown email template: ${stepId}`);
  return fn({
    ...ctx,
    firstName: ctx.firstName ? escapeHtml(ctx.firstName) : ctx.firstName,
  });
}

export function buildLeadWelcomeEmail(ctx: EmailContext): RenderedEmail {
  assertLegacyLeadWelcomeAllowed();
  const origin = getSiteOrigin();
  const name = ctx.firstName ? escapeHtml(ctx.firstName) : "there";
  return wrap(
    "Welcome to DeFi University",
    `<p>Hi ${name},</p>
<p>Thanks for your interest. Two paths that convert serious learners:</p>
<ul>
<li><strong>Membership on Skool</strong> — $97/month: live Q&A Monday, Wednesday, and Friday, the Course Hub, and the community. 7-day free trial.</li>
<li><strong>Private Coaching</strong> — Kickstart at $750, Operator at $2,500, and Inner Circle at $7,500. Start with a discovery call.</li>
</ul>
${skoolCta(ctx)}
${discoveryCta(ctx)}
<p style="margin:16px 0;font-size:14px;">You can also browse <a href="${origin}/university" style="color:#c9a227;">free University courses</a> anytime.</p>
<p>Educational content only — not financial advice.</p>`,
    ctx,
    "Skool community or private coaching"
  );
}

export function buildLeadConfirmEmail(ctx: {
  email: string;
  firstName?: string;
  confirmUrl: string;
}): RenderedEmail {
  const name = ctx.firstName ? escapeHtml(ctx.firstName) : "there";
  const entityLine = `<p>DeFi University LLC${isPostalAddressPlaceholder() ? "" : ` · ${POSTAL_ADDRESS}`} · hello@defiuniversity.xyz</p>`;
  const body = `<p>Hi ${name},</p>
<p>Someone asked for the DeFi Safety Checklist at defiuniversity.xyz using this email address. We hope it was you.</p>
<p>Please confirm your email to get the checklist and DeFi University's educational emails:</p>
${cta(ctx.confirmUrl, "Confirm my email")}
<p>This link expires in 7 days.</p>
<p>Didn't ask for this? Just ignore this email. You won't be subscribed unless you click the link.</p>
<p>— The DeFi University team</p>
<p>Educational only — not financial advice.</p>
${entityLine}`;
  const html = emailShell({
    purpose: "transactional",
    bodyHtml: body,
    previewText: "One click to confirm. If this wasn't you, ignore it.",
  });
  const text = `Hi ${ctx.firstName || "there"},

Someone asked for the DeFi Safety Checklist at defiuniversity.xyz using this email address. We hope it was you.

Please confirm your email to get the checklist and DeFi University's educational emails:

Confirm my email → ${ctx.confirmUrl}

This link expires in 7 days.

Didn't ask for this? Just ignore this email. You won't be subscribed unless you click the link.

— The DeFi University team

Educational only — not financial advice.
DeFi University LLC${isPostalAddressPlaceholder() ? "" : ` · ${POSTAL_ADDRESS}`} · hello@defiuniversity.xyz`;
  return {
    subject: LEAD_CONFIRM_SUBJECT,
    html,
    text,
  };
}

export function listTemplateIds(): string[] {
  return [...FLOW_TEMPLATE_IDS];
}

export { FLOW_TEMPLATE_IDS };
