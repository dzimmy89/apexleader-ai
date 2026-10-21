import { NextRequest, NextResponse } from "next/server";
import { crossSiteRejection, isSameOriginRequest } from "@/lib/account/request-guard";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { bookingBlocker, findCoachingClient } from "@/lib/account/coaching-client";
import { bookingErrorStatus, createCoachingSessionBooking } from "@/lib/coaching/calendar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// POST /api/coaching/sessions/book
// Body: { startTime, durationMins?, timezone? }
// The signed-in coaching client books a session from /account. The account
// cookie says who they are; the coaching email may be a linked one.
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return crossSiteRejection();
  const email = await getAccountEmail();
  if (!email) return NextResponse.json({ error: "Sign in to book a session." }, { status: 401, headers: NO_STORE });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: NO_STORE });
  }
  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  if (!startTime) return NextResponse.json({ error: "startTime is required" }, { status: 400, headers: NO_STORE });

  const access = await getAccess(email);
  const client = await findCoachingClient(access);
  if (!client) {
    return NextResponse.json({ error: "Only private coaching clients can book sessions here." }, { status: 403, headers: NO_STORE });
  }
  const blocker = bookingBlocker(client);
  if (blocker) return NextResponse.json({ error: blocker }, { status: 403, headers: NO_STORE });

  const durationMins =
    typeof body.durationMins === "number" && body.durationMins >= 30 && body.durationMins <= 120
      ? Math.round(body.durationMins)
      : 60;
  const result = await createCoachingSessionBooking({
    clientId: client.email,
    name: client.name,
    startTime,
    durationMins,
    timezone: typeof body.timezone === "string" ? body.timezone : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: bookingErrorStatus(result.code), headers: NO_STORE });
  }
  return NextResponse.json({ ok: true, meetUrl: result.meetUrl, sessionId: result.sessionId }, { headers: NO_STORE });
}
