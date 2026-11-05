import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/html";
import { clientIpFromHeaders, isLeadRateLimited } from "@/lib/lead-rate-limit";
import { captureLead } from "@/lib/crm/leads";
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution-cookie";
import { LESSON_EMAIL_CONSENT_VERSION, SMS_CONSENT_VERSION } from "@/lib/consent";
import { findLesson, getCourse } from "@/lib/learn/catalog";
import { applyReaderCookie, createReaderSession } from "@/lib/learn/reader";
import { normalizePhone } from "@/lib/phone";

const SOURCE = "lesson_gate";

/**
 * POST { email, phone, emailConsent, smsConsent, courseId, lessonSlug, website }
 * from the exercise gate on a lesson. Saves the lead (with the mobile, both
 * consents, the lesson and the first-touch attribution cookie) and sets the
 * reader cookie that opens exercises.
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromHeaders(request.headers);
  if (isLeadRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (String(body.website || "").trim()) return NextResponse.json({ ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  const phone = normalizePhone(body.phone);
  if (!phone) return NextResponse.json({ error: "Enter a mobile number with its area code" }, { status: 400 });
  if (body.emailConsent !== true) {
    return NextResponse.json({ error: "Tick the email box so we can send you the exercise" }, { status: 400 });
  }
  const smsConsent = body.smsConsent === true;

  const course = getCourse(String(body.courseId || ""));
  const found = course ? findLesson(course, String(body.lessonSlug || "")) : null;
  if (!course || !found) return NextResponse.json({ error: "Unknown lesson" }, { status: 400 });

  const nowIso = new Date().toISOString();
  const attribution = parseAttribution(request.cookies.get(ATTRIBUTION_COOKIE)?.value);
  const lessonPath = `/university/${course.id}/lessons/${found.lesson.slug}`;

  try {
    await captureLead({
      email,
      source: SOURCE,
      leadMagnet: `lesson:${course.id}/${found.lesson.slug}`,
      phone,
      smsConsent: {
        given: smsConsent,
        textVersion: SMS_CONSENT_VERSION,
        formSource: SOURCE,
        requestedAt: nowIso,
      },
      lesson: { courseId: course.id, lessonSlug: found.lesson.slug, title: found.lesson.title, at: nowIso },
      utm: attribution.utm,
      referrer: attribution.referrer,
      landingPath: attribution.landingPath || lessonPath,
      ip,
      userAgent: request.headers.get("user-agent") || undefined,
      consentTextVersion: LESSON_EMAIL_CONSENT_VERSION,
    });
  } catch (e) {
    console.error("[lead/lesson-gate] capture failed", e);
    return NextResponse.json({ error: "We could not save that. Try again." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  try {
    applyReaderCookie(response, await createReaderSession(email));
  } catch (e) {
    console.error("[lead/lesson-gate] reader cookie failed", e);
    return NextResponse.json({ error: "We saved your details but could not open the exercise. Try again." }, { status: 500 });
  }
  return response;
}
