import { NextRequest, NextResponse } from "next/server";
import { confirmLeadByEmail } from "@/lib/crm/leads";
import { confirmLandingPath } from "@/lib/crm/confirm-redirect";
import { LEAD_CONFIRM_PURPOSE, verifyEmailToken } from "@/lib/email-tokens";
import { getSiteOrigin } from "@/lib/env";
import { getDb, leadDocId } from "@/lib/firebase-admin";
import { applyReaderCookie, createReaderSession } from "@/lib/learn/reader";

/**
 * The "Confirm my email" link in the double opt-in email. Confirms the lead
 * (which starts the follow-up series for their lesson), opens exercises in
 * this browser too (the mail app's browser is often not the one they used on
 * X), and lands them on the exercise the email promised.
 */
export async function GET(request: NextRequest) {
  const origin = getSiteOrigin();
  const token = request.nextUrl.searchParams.get("token") || "";
  const verified = await verifyEmailToken(token, LEAD_CONFIRM_PURPOSE);
  if (!verified.ok) {
    return NextResponse.redirect(new URL(confirmLandingPath(null, "expired"), origin), 303);
  }

  let lastLesson: { courseId?: string; lessonSlug?: string } | undefined;
  try {
    const result = await confirmLeadByEmail(verified.email);
    if (!result.ok) {
      return NextResponse.redirect(new URL(confirmLandingPath(null, "unknown"), origin), 303);
    }
    const snap = await getDb().collection("leads").doc(leadDocId(verified.email)).get();
    lastLesson = snap.data()?.lastLesson as typeof lastLesson;
  } catch (e) {
    console.error("[lead/confirm] failed", e);
    return NextResponse.redirect(new URL(confirmLandingPath(null, "unknown"), origin), 303);
  }

  const response = NextResponse.redirect(new URL(confirmLandingPath(lastLesson, "confirmed"), origin), 303);
  try {
    applyReaderCookie(response, await createReaderSession(verified.email));
  } catch (e) {
    console.error("[lead/confirm] reader cookie failed", e);
  }
  return response;
}
