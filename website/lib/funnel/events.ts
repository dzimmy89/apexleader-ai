/**
 * First-party funnel counts: how many people reach each step of the lesson
 * funnel, per day, per lesson and per campaign. No outside tracker, no
 * personal data: one Firestore document per (day, lesson, campaign) with a
 * counter per step. Mission Control reads these for the funnel table.
 */
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import type { Attribution } from "@/lib/attribution-cookie";

export const FUNNEL_COLLECTION = "funnel_daily";

/** In the order a visitor meets them. */
export const FUNNEL_STEPS = [
  "lesson_view",
  "ask_seen",
  "email_given",
  "mobile_given",
  "exercise_view",
  "call_booked",
] as const;
export type FunnelStep = (typeof FUNNEL_STEPS)[number];

/** Steps a browser may report. The rest are counted on the server where they happen. */
export const CLIENT_STEPS = new Set<FunnelStep>(["lesson_view", "ask_seen", "exercise_view"]);

export function isFunnelStep(value: unknown): value is FunnelStep {
  return typeof value === "string" && (FUNNEL_STEPS as readonly string[]).includes(value);
}

export interface FunnelContext {
  courseId: string;
  lessonSlug: string;
  attribution?: Attribution;
}

/** "x/dm/marketing" style label for the campaign, or "direct". */
export function campaignLabel(attribution?: Attribution): string {
  const utm = attribution?.utm;
  if (!utm?.source && !utm?.campaign) {
    let host = "";
    try {
      host = new URL(attribution?.referrer || "").hostname.toLowerCase();
    } catch {
      host = "";
    }
    if (/^(www\.|mobile\.)?(x\.com|twitter\.com|t\.co)$/.test(host)) return "x";
    return host ? `ref/${host}`.slice(0, 120) : "direct";
  }
  return [utm.source, utm.medium, utm.campaign].filter(Boolean).join("/").slice(0, 120);
}

function safeKey(value: string): string {
  return value.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80) || "none";
}

/** UTC day, YYYY-MM-DD. */
export function funnelDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function funnelDocId(day: string, ctx: FunnelContext, campaign: string): string {
  return [day, safeKey(ctx.courseId), safeKey(ctx.lessonSlug), safeKey(campaign)].join("__");
}

/** Add one to a step. Never throws: counting must not break the page or the form. */
export async function countFunnelStep(step: FunnelStep, ctx: FunnelContext, now = new Date()): Promise<void> {
  try {
    const day = funnelDay(now);
    const campaign = campaignLabel(ctx.attribution);
    const ref = getDb().collection(FUNNEL_COLLECTION).doc(funnelDocId(day, ctx, campaign));
    await ref.set(
      {
        day,
        courseId: ctx.courseId,
        lessonSlug: ctx.lessonSlug,
        campaign,
        counts: { [step]: FieldValue.increment(1) },
        updatedAt: now.toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("[funnel] count failed", step, e);
  }
}

/** Crawlers, link-preview fetchers and monitors: not people. */
export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true;
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|headless|lighthouse|pingdom|uptime/i.test(
    ua
  );
}
