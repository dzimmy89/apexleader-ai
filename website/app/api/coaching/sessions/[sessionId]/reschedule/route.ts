import { NextRequest, NextResponse } from "next/server";
import { crossSiteRejection, isSameOriginRequest } from "@/lib/account/request-guard";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { bookingErrorStatus, rescheduleCoachingSession } from "@/lib/coaching/calendar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// POST /api/coaching/sessions/:sessionId/reschedule
// Body: { startTime, timezone? }
// The signed-in client moves one of their own booked sessions.
export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  if (!isSameOriginRequest(request)) return crossSiteRejection();
  const email = await getAccountEmail();
  if (!email) return NextResponse.json({ error: "Sign in to change a session." }, { status: 401, headers: NO_STORE });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  if (!startTime) return NextResponse.json({ error: "startTime is required" }, { status: 400, headers: NO_STORE });

  const access = await getAccess(email);
  const clientEmails = [...new Set([email, ...(access.emails || []), access.clientEmail].filter((e): e is string => Boolean(e)))];
  const result = await rescheduleCoachingSession({
    clientEmails,
    sessionId: decodeURIComponent((await params).sessionId),
    startTime,
    timezone: typeof body.timezone === "string" ? body.timezone : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: bookingErrorStatus(result.code), headers: NO_STORE });
  }
  return NextResponse.json({ ok: true, meetUrl: result.meetUrl }, { headers: NO_STORE });
}
