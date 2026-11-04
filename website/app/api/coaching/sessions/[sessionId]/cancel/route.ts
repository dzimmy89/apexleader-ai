import { NextRequest, NextResponse } from "next/server";
import { crossSiteRejection, isSameOriginRequest } from "@/lib/account/request-guard";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { bookingErrorStatus, cancelCoachingSession } from "@/lib/coaching/calendar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// POST /api/coaching/sessions/:sessionId/cancel
// The signed-in client cancels one of their own booked sessions.
export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  if (!isSameOriginRequest(request)) return crossSiteRejection();
  const email = await getAccountEmail();
  if (!email) return NextResponse.json({ error: "Sign in to change a session." }, { status: 401, headers: NO_STORE });

  const access = await getAccess(email);
  const clientEmails = [...new Set([email, ...(access.emails || []), access.clientEmail].filter((e): e is string => Boolean(e)))];
  const result = await cancelCoachingSession({ clientEmails, sessionId: decodeURIComponent((await params).sessionId) });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: bookingErrorStatus(result.code), headers: NO_STORE });
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
