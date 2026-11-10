import { NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/env";
import { findLesson, getCourse } from "@/lib/learn/catalog";
import { applyReaderCookie, createReaderSession } from "@/lib/learn/reader";
import { applyGateEmailCookie, leadForReaderLink, safeReaderPath } from "@/lib/learn/reader-links";

/** For an exercise path, the lesson it belongs to (where the form is). */
function lessonForExercise(path: string): string | null {
  const m = path.match(/^\/university\/([a-z0-9-]+)\/exercises\/([a-z0-9-]+)$/);
  if (!m) return null;
  const course = getCourse(m[1]!);
  if (!course) return null;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.exercise === m[2]);
    if (lesson && findLesson(course, lesson.slug)) return `/university/${course.id}/lessons/${lesson.slug}`;
  }
  return null;
}

/**
 * /r/<token>/<site path>: a follow-up email or text link. Opens exercises in
 * this browser for a lead who has given a mobile; a lead with only an email
 * lands on the lesson's form at step two instead. Unknown tokens still
 * redirect, so an old link never dead-ends.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string; path: string[] }> }) {
  const { token, path } = await params;
  const origin = getSiteOrigin();
  const target = safeReaderPath(path || []);
  const search = request.nextUrl.search;

  let lead: Awaited<ReturnType<typeof leadForReaderLink>> = null;
  try {
    lead = await leadForReaderLink(token);
  } catch (e) {
    console.error("[reader-link] lookup failed", e);
  }
  const blocked = lead?.status === "unsubscribed" || lead?.status === "bounced" || lead?.status === "complained";

  if (lead && !blocked && !lead.hasPhone) {
    const lessonPath = lessonForExercise(target);
    if (lessonPath) {
      const res = NextResponse.redirect(new URL(`${lessonPath}${search}#exercise-ask`, origin), 303);
      applyGateEmailCookie(res, lead.email);
      return res;
    }
  }

  const res = NextResponse.redirect(new URL(`${target}${search}`, origin), 303);
  if (lead && !blocked && lead.hasPhone) {
    try {
      applyReaderCookie(res, await createReaderSession(lead.email));
    } catch (e) {
      console.error("[reader-link] cookie failed", e);
    }
  }
  return res;
}
