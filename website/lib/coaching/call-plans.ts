import { BRAND } from "@/lib/brand";
import { SENDER_EMAIL, getSiteOrigin } from "@/lib/env";
import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/gmail";
import { escapeHtml } from "@/lib/html";
import { aiJson } from "@/lib/coaching/ai";
import { automatedSendBlockedByManualOnly } from "@/lib/crm/contacts";
import {
  findTranscriptCandidates,
  readTranscriptDoc,
  type TranscriptCandidate,
} from "@/lib/coaching/meet-transcripts";

/**
 * The written one-page AI plan every prospect gets after a discovery call.
 *
 * The homepage promises it, so it has to happen without David remembering:
 *   1. A booking marks its coaching_applications row callPlanState "pending"
 *      (calendar.ts) and the Meet room records itself (meet-space.ts).
 *   2. After the call, the cron (process-flows) calls processCallPlans. It
 *      finds the call's transcript in Drive (meet-transcripts.ts: the doc
 *      Google attaches to the calendar event, or one saved to "Meet
 *      Recordings" right after the call).
 *   3. Gemini turns the transcript into a one-page plan (draftCallPlan),
 *      using only what was said on the call.
 *   4. The plan is emailed to the prospect from David, a copy goes to David,
 *      and the plan is saved on the application row.
 *
 * If no transcript shows up within a day of the call (recording was off, or
 * nobody joined) David gets one email saying so, and the row keeps being
 * checked for two weeks in case the call was moved. CALL_PLAN_MODE=review
 * sends the plan to David only, for him to forward.
 */
export const APPLICATIONS = "coaching_applications";

const CALL_LENGTH_MS = 30 * 60 * 1000;
/** Google needs a few minutes after a call to write the transcript. */
const SETTLE_MS = 10 * 60 * 1000;
const RECHECK_MS = 25 * 60 * 1000;
const ALERT_AFTER_MS = 24 * 60 * 60 * 1000;
const GIVE_UP_AFTER_MS = 14 * 24 * 60 * 60 * 1000;
/** A transcript shorter than this is a no-show or a dropped call, not a conversation. */
export const MIN_TRANSCRIPT_CHARS = 1200;
const MAX_TRANSCRIPT_CHARS = 120_000;
const MAX_PER_RUN = 3;

export type CallPlanState = "pending" | "sent" | "review" | "skipped" | "no_transcript";

export interface CallPlan {
  /** One line naming where AI should start in this business. */
  headline: string;
  /** Two or three sentences playing back what the prospect said. */
  situation: string;
  firstJob: { title: string; why: string };
  tools: Array<{ name: string; job: string }>;
  /** Ordered steps to get the first job running. */
  steps: string[];
  /** What to hand to AI after the first job works. */
  next: string[];
  /** Things to check before starting (data, cost, terms). */
  watchOuts: string[];
  /** Whether and how coaching fits, as discussed on the call. Empty when it was not discussed. */
  coaching: string;
}

export interface PendingApplication {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  discoveryCallAt: string;
  callPlanState?: CallPlanState;
  callPlanCheckedAt?: string | null;
  callPlanAlertedAt?: string | null;
  status?: string;
}

export type CallPlanDecision = "wait" | "look" | "give_up";

/** Whether to look for this call's transcript now. Pure, so it is tested directly. */
export function decideCallPlan(app: PendingApplication, nowMs: number): CallPlanDecision {
  const callAt = Date.parse(app.discoveryCallAt);
  if (Number.isNaN(callAt)) return "give_up";
  if (app.status === "cancelled") return "give_up";
  const readyAt = callAt + CALL_LENGTH_MS + SETTLE_MS;
  if (nowMs < readyAt) return "wait";
  if (nowMs > readyAt + GIVE_UP_AFTER_MS) return "give_up";
  const checked = app.callPlanCheckedAt ? Date.parse(app.callPlanCheckedAt) : 0;
  if (checked && nowMs - checked < RECHECK_MS) return "wait";
  return "look";
}

/**
 * The transcript doc for this booking: one found through the prospect's own
 * calendar event (never the "recent docs" guesses), from a call that started
 * after they booked, newest first.
 */
export function pickTranscript(
  candidates: TranscriptCandidate[],
  app: Pick<PendingApplication, "createdAt">
): TranscriptCandidate | null {
  const bookedAt = Date.parse(app.createdAt) || 0;
  const own = candidates
    .filter((c) => c.match === "event" || c.match === "folder-time")
    .filter((c) => c.callStart && Date.parse(c.callStart) >= bookedAt - 60_000)
    .sort((a, b) => String(b.callStart).localeCompare(String(a.callStart)));
  // Meet attaches both a notes doc and a transcript doc; prefer the transcript.
  return own.find((c) => /transcript/i.test(c.title)) || own[0] || null;
}

const STRING = { type: "string" } as const;
const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["usable", "headline", "situation", "firstJob", "tools", "steps", "next", "watchOuts", "coaching"],
  properties: {
    usable: { type: "boolean" },
    headline: STRING,
    situation: STRING,
    firstJob: {
      type: "object",
      additionalProperties: false,
      required: ["title", "why"],
      properties: { title: STRING, why: STRING },
    },
    tools: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "job"],
        properties: { name: STRING, job: STRING },
      },
    },
    steps: { type: "array", items: STRING },
    next: { type: "array", items: STRING },
    watchOuts: { type: "array", items: STRING },
    coaching: STRING,
  },
} as const;

const clip = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const list = (v: unknown, maxItems: number, maxLen: number) =>
  (Array.isArray(v) ? v : []).map((x) => clip(x, maxLen)).filter(Boolean).slice(0, maxItems);

/** Trim the model's answer to one page. Returns null when there is no plan in it. */
export function cleanCallPlan(raw: Record<string, unknown>): CallPlan | null {
  if (raw.usable === false) return null;
  const firstJob = (raw.firstJob || {}) as Record<string, unknown>;
  const plan: CallPlan = {
    headline: clip(raw.headline, 140),
    situation: clip(raw.situation, 520),
    firstJob: { title: clip(firstJob.title, 120), why: clip(firstJob.why, 360) },
    tools: (Array.isArray(raw.tools) ? (raw.tools as Record<string, unknown>[]) : [])
      .map((t) => ({ name: clip(t?.name, 40), job: clip(t?.job, 160) }))
      .filter((t) => t.name && t.job)
      .slice(0, 4),
    steps: list(raw.steps, 6, 220),
    next: list(raw.next, 3, 180),
    watchOuts: list(raw.watchOuts, 3, 200),
    coaching: clip(raw.coaching, 360),
  };
  if (!plan.headline || !plan.firstJob.title || plan.steps.length < 2) return null;
  return plan;
}

/** Turn a discovery call transcript into the one-page plan. */
export async function draftCallPlan(
  transcript: string,
  ctx: { prospectName: string; today: string }
): Promise<CallPlan | null> {
  const system = `You work for ${BRAND.coachName}, who runs ${BRAND.name} and coaches business owners one on one on ${BRAND.subject}.

You read the transcript of a free 30-minute discovery call between ${BRAND.coachFirstName} and a prospect, and write the one-page AI plan ${BRAND.coachFirstName} promised to send them. It is written in ${BRAND.coachFirstName}'s voice ("I", "we", "you"), to the prospect, and it must be useful even if they never buy coaching.

Rules:
- Use only what was said on the call. Never invent facts, numbers, tools the prospect uses, or commitments. If something was not discussed, leave that part short or empty.
- The plan picks ONE first job to hand to AI: the one the call pointed to, or if none was agreed, the most repetitive low-risk job the prospect described.
- Recommend tools that were named on the call. If none were, suggest at most two mainstream ones that fit the job and say they are a suggestion.
- Steps are concrete actions the prospect can do alone, in order, each one sentence, starting with a verb. 3 to 6 steps.
- Never promise results, revenue, savings or time saved as a number unless the prospect said that number themselves.
- Never tell them to put customer or confidential data into a tool without checking that tool's terms first. Put any such caution in watchOuts.
- coaching: one or two sentences on which coaching package ${BRAND.coachFirstName} said fits and why, only if it came up on the call. Otherwise an empty string. No selling beyond what was said.
- Plain words, short sentences, no hype, no emoji, no headings inside fields.
- Set usable to false (and leave the rest empty) when the transcript is not a real conversation about the prospect's business: a no-show, a wrong meeting, a few lines of small talk.

Fields:
- headline: one line, at most 14 words, naming where AI starts in their business.
- situation: 2 to 3 sentences playing back their business and the problem, in their words.
- firstJob.title: the job, in a few words. firstJob.why: why this one first, 1 to 2 sentences.
- tools: up to 4, each with the job it does in this plan.
- steps: the ordered steps for the first job.
- next: up to 3 things to hand to AI after the first job works.
- watchOuts: up to 3 things to check before starting.`;
  const prompt = `Prospect: ${ctx.prospectName || "unknown"}
Today: ${ctx.today}

<transcript>
${transcript.slice(0, MAX_TRANSCRIPT_CHARS)}
</transcript>`;
  const out = await aiJson<Record<string, unknown>>({
    system,
    prompt,
    schema: PLAN_SCHEMA as unknown as Record<string, unknown>,
    effort: "medium",
    maxTokens: 8000,
  });
  return cleanCallPlan(out);
}

function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || "";
}

/** The plan as an email: one printable page on paper, David's words above it. */
export function renderCallPlanEmail(
  plan: CallPlan,
  ctx: { name: string; reviewOnly?: boolean; prospectEmail?: string }
): { subject: string; html: string; text: string } {
  const first = firstNameOf(ctx.name);
  const hi = first ? `Hi ${first},` : "Hi,";
  const origin = getSiteOrigin();
  const coachingUrl = `${origin}/coaching?utm_source=call_plan&utm_medium=email`;
  const subject = ctx.reviewOnly
    ? `Plan to review for ${ctx.name || ctx.prospectEmail || "your call"}: ${plan.headline}`
    : `Your one-page AI plan: ${plan.headline}`;
  const intro = ctx.reviewOnly
    ? `This is the plan drafted from your call with ${ctx.name || ctx.prospectEmail}. It has not been sent to them. Forward it when you're happy with it.`
    : "Thanks for the call. Here is the written plan I promised, built from what you told me. It is yours to use, with me or on your own.";
  const outro = plan.coaching
    ? plan.coaching
    : "If you want help building this, reply to this email and we'll pick it up from here.";

  const e = escapeHtml;
  const ink = "#1c2030";
  const muted = "#5b6072";
  const line = "#e3ddd0";
  const accent = "#c2410c";
  const label = (t: string) =>
    `<p style="margin:26px 0 8px;font:600 11px/1.3 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${accent};">${e(t)}</p>`;
  const ol = (items: string[]) =>
    `<ol style="margin:0;padding-left:22px;">${items.map((s) => `<li style="margin:0 0 8px;">${e(s)}</li>`).join("")}</ol>`;
  const ul = (items: string[]) =>
    `<ul style="margin:0;padding-left:20px;">${items.map((s) => `<li style="margin:0 0 6px;">${e(s)}</li>`).join("")}</ul>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><meta name="color-scheme" content="light" /></head>
<body style="margin:0;padding:0;background:#efeadf;">
<div style="display:none;max-height:0;overflow:hidden;">${e(plan.firstJob.title)}: the first job to hand to AI, and the steps.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efeadf;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
<tr><td style="padding:0 6px 18px;font:16px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${ink};">
<p style="margin:0 0 12px;">${e(hi)}</p>
<p style="margin:0;">${e(intro)}</p>
</td></tr>
<tr><td style="background:#fbf8f1;border:1px solid ${line};border-radius:14px;padding:30px 32px 28px;font:15.5px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${ink};">
<p style="margin:0;font:600 11px/1.3 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${muted};">One-page AI plan${ctx.name ? ` · ${e(ctx.name)}` : ""}</p>
<h1 style="margin:10px 0 0;font:800 26px/1.15 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:-.01em;color:${ink};">${e(plan.headline)}</h1>
${plan.situation ? `${label("Where you are")}<p style="margin:0;">${e(plan.situation)}</p>` : ""}
${label("The first job to hand to AI")}
<p style="margin:0;font-weight:700;font-size:18px;line-height:1.3;">${e(plan.firstJob.title)}</p>
${plan.firstJob.why ? `<p style="margin:6px 0 0;color:${muted};">${e(plan.firstJob.why)}</p>` : ""}
${
  plan.tools.length
    ? `${label("Tools")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${plan.tools
        .map(
          (t) =>
            `<tr><td style="padding:7px 12px 7px 0;border-top:1px solid ${line};font-weight:700;white-space:nowrap;vertical-align:top;">${e(t.name)}</td><td style="padding:7px 0;border-top:1px solid ${line};color:${muted};">${e(t.job)}</td></tr>`
        )
        .join("")}</table>`
    : ""
}
${label("Steps")}${ol(plan.steps)}
${plan.next.length ? `${label("After that works")}${ul(plan.next)}` : ""}
${plan.watchOuts.length ? `${label("Check before you start")}${ul(plan.watchOuts)}` : ""}
</td></tr>
<tr><td style="padding:20px 6px 0;font:16px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${ink};">
<p style="margin:0 0 12px;">${e(outro)}</p>
<p style="margin:0 0 12px;"><a href="${coachingUrl}" style="color:${accent};font-weight:600;">See the coaching packages</a></p>
<p style="margin:0;">${e(BRAND.coachFirstName)}<br /><span style="color:${muted};">${e(BRAND.name)}</span></p>
<p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:${muted};">This plan was drafted from the recording of our call. Results depend on your business and how you apply it; nothing here is a guarantee. Check each AI tool's terms before putting customer or confidential data into it.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  const num = (items: string[]) => items.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const dash = (items: string[]) => items.map((s) => `- ${s}`).join("\n");
  const text = [
    hi,
    "",
    intro,
    "",
    `ONE-PAGE AI PLAN: ${plan.headline}`,
    plan.situation ? `\nWHERE YOU ARE\n${plan.situation}` : "",
    `\nTHE FIRST JOB TO HAND TO AI\n${plan.firstJob.title}${plan.firstJob.why ? `\n${plan.firstJob.why}` : ""}`,
    plan.tools.length ? `\nTOOLS\n${plan.tools.map((t) => `- ${t.name}: ${t.job}`).join("\n")}` : "",
    `\nSTEPS\n${num(plan.steps)}`,
    plan.next.length ? `\nAFTER THAT WORKS\n${dash(plan.next)}` : "",
    plan.watchOuts.length ? `\nCHECK BEFORE YOU START\n${dash(plan.watchOuts)}` : "",
    "",
    outro,
    `Coaching packages: ${coachingUrl}`,
    "",
    BRAND.coachFirstName,
    BRAND.name,
    "",
    "This plan was drafted from the recording of our call. Results depend on your business and how you apply it; nothing here is a guarantee.",
  ]
    .filter((l) => l !== "")
    .join("\n");
  return { subject, html, text };
}

export interface CallPlanRun {
  checked: number;
  sent: number;
  review: number;
  waiting: number;
  alerted: number;
  closed: number;
  errors: number;
}

export interface CallPlanDeps {
  findCandidates: (email: string, now: Date) => Promise<TranscriptCandidate[]>;
  readDoc: (docId: string) => Promise<{ title: string; text: string; url: string }>;
}

const realDeps: CallPlanDeps = {
  findCandidates: findTranscriptCandidates,
  readDoc: readTranscriptDoc,
};

function reviewMode(): boolean {
  return (process.env.CALL_PLAN_MODE || "").toLowerCase() === "review";
}

async function tellCoachNoTranscript(app: PendingApplication): Promise<void> {
  const who = app.name ? `${app.name} (${app.email})` : app.email;
  const when = new Date(app.discoveryCallAt).toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const body = `No transcript was found for the discovery call with ${who} on ${when} ET, so their one-page plan has not been sent.\n\nIf the call happened, the recording was probably off. Send their plan by hand, and check that the call was recorded and transcribed in Google Meet.\nIf the call was moved, nothing to do: the plan goes out after the new time.\nIf they did not show, nothing to do.`;
  await sendEmail({
    to: SENDER_EMAIL,
    purpose: "transactional",
    subject: `No transcript for ${app.name || app.email}'s call: plan not sent`,
    text: body,
    html: body
      .split("\n\n")
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
      .join(""),
    allowManualOnlyContact: true,
    log: { source: "coaching_call_plan_alert" },
  });
}

/**
 * Send the plan for every discovery call whose transcript is ready. Safe to
 * run as often as the cron fires: each row is claimed before its email goes.
 */
export async function processCallPlans(
  opts: { now?: Date; deps?: Partial<CallPlanDeps> } = {}
): Promise<CallPlanRun> {
  const now = opts.now ?? new Date();
  const nowIso = now.toISOString();
  const deps = { ...realDeps, ...opts.deps };
  const db = getDb();
  const run: CallPlanRun = { checked: 0, sent: 0, review: 0, waiting: 0, alerted: 0, closed: 0, errors: 0 };

  const snap = await db.collection(APPLICATIONS).where("callPlanState", "==", "pending").get();
  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const app: PendingApplication = {
      id: doc.id,
      email: String(data.email || "").trim().toLowerCase(),
      name: String(data.name || ""),
      createdAt: String(data.createdAt || data.updatedAt || ""),
      discoveryCallAt: String(data.discoveryCallAt || ""),
      callPlanCheckedAt: (data.callPlanCheckedAt as string) || null,
      callPlanAlertedAt: (data.callPlanAlertedAt as string) || null,
      status: data.status ? String(data.status) : undefined,
    };
    const ref = db.collection(APPLICATIONS).doc(doc.id);
    const decision = app.email ? decideCallPlan(app, now.getTime()) : "give_up";
    if (decision === "give_up") {
      await ref.set({ callPlanState: "no_transcript", callPlanClosedAt: nowIso }, { merge: true });
      run.closed++;
      continue;
    }
    if (decision === "wait" || run.checked >= MAX_PER_RUN) {
      run.waiting++;
      continue;
    }

    run.checked++;
    try {
      const candidate = pickTranscript(await deps.findCandidates(app.email, now), app);
      const doc2 = candidate ? await deps.readDoc(candidate.docId) : null;
      const transcript = (doc2?.text || "").trim();
      if (!candidate || transcript.length < MIN_TRANSCRIPT_CHARS) {
        const overdue =
          now.getTime() - (Date.parse(app.discoveryCallAt) + CALL_LENGTH_MS) > ALERT_AFTER_MS && !app.callPlanAlertedAt;
        if (overdue) {
          await tellCoachNoTranscript(app);
          run.alerted++;
        }
        await ref.set(
          { callPlanCheckedAt: nowIso, ...(overdue ? { callPlanAlertedAt: nowIso } : {}) },
          { merge: true }
        );
        run.waiting++;
        continue;
      }

      const plan = await draftCallPlan(transcript, {
        prospectName: app.name,
        today: nowIso.slice(0, 10),
      });
      if (!plan) {
        // A real doc with no plan in it (no-show, wrong meeting): stop here.
        await ref.set(
          { callPlanState: "skipped", callPlanClosedAt: nowIso, callPlanDocId: candidate.docId },
          { merge: true }
        );
        run.closed++;
        continue;
      }

      const blocked = await automatedSendBlockedByManualOnly(app.email).catch(() => true);
      let reviewOnly = reviewMode() || blocked;
      // Claim the row first, so a second cron run can never send the plan twice.
      await ref.set(
        {
          callPlanState: reviewOnly ? "review" : "sent",
          callPlan: plan,
          callPlanDocId: candidate.docId,
          callPlanDocUrl: doc2?.url || candidate.url,
          callPlanSentAt: nowIso,
        },
        { merge: true }
      );

      const toProspect = renderCallPlanEmail(plan, { name: app.name });
      if (!reviewOnly) {
        const res = await sendEmail({
          to: app.email,
          purpose: "transactional",
          ...toProspect,
          log: { source: "coaching_call_plan" },
        }).catch((e) => ({ ok: false, skipped: false, error: e instanceof Error ? e.message : String(e) }));
        if (!res.ok) {
          // Not delivered (suppressed address, Gmail error): hand it to David instead.
          reviewOnly = true;
          await ref.set(
            { callPlanState: "review", callPlanError: String(res.error || "not sent").slice(0, 300) },
            { merge: true }
          );
        }
      }
      // David always gets a copy (or, in review mode, the only copy).
      const toCoach = reviewOnly
        ? renderCallPlanEmail(plan, { name: app.name, prospectEmail: app.email, reviewOnly: true })
        : { ...toProspect, subject: `Sent to ${app.name || app.email}: ${plan.headline}` };
      await sendEmail({
        to: SENDER_EMAIL,
        purpose: "transactional",
        ...toCoach,
        allowManualOnlyContact: true,
        log: { source: "coaching_call_plan_copy" },
      }).catch((e) => console.error("[call-plans] coach copy failed", e));

      if (reviewOnly) run.review++;
      else run.sent++;
    } catch (e) {
      run.errors++;
      console.error("[call-plans] failed for", app.email, e);
      await ref
        .set(
          { callPlanCheckedAt: nowIso, callPlanError: (e instanceof Error ? e.message : String(e)).slice(0, 300) },
          { merge: true }
        )
        .catch(() => undefined);
    }
  }
  return run;
}
