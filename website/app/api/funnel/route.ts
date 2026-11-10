import { NextRequest, NextResponse } from "next/server";
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution-cookie";
import { CLIENT_STEPS, countFunnelStep, isBotUserAgent, isFunnelStep } from "@/lib/funnel/events";
import { findLesson, getCourse } from "@/lib/learn/catalog";
import { clientIpFromHeaders } from "@/lib/lead-rate-limit";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/**
 * POST { step, courseId, lessonSlug } from a lesson or exercise page.
 * Counts a step the browser sees (page view, ask scrolled into view). No
 * personal data is stored. Always answers 204 so it never shows as an error.
 */
export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  if (isBotUserAgent(request.headers.get("user-agent"))) return done;
  if (limited(clientIpFromHeaders(request.headers) || "unknown")) return done;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return done;
  }
  const step = body.step;
  if (!isFunnelStep(step) || !CLIENT_STEPS.has(step)) return done;
  const course = getCourse(String(body.courseId || ""));
  const found = course ? findLesson(course, String(body.lessonSlug || "")) : null;
  if (!course || !found) return done;
  await countFunnelStep(step, {
    courseId: course.id,
    lessonSlug: found.lesson.slug,
    attribution: parseAttribution(request.cookies.get(ATTRIBUTION_COOKIE)?.value),
  });
  return done;
}
