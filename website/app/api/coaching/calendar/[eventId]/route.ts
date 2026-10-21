import { NextRequest, NextResponse } from "next/server";
import { bookingErrorStatus, cancelBooking, rescheduleBooking } from "@/lib/coaching/calendar";
import { COOKIE_NAME, verifyAdminSession } from "@/lib/auth/admin-session-cookie";

// Cancelling or moving a calendar event is admin-only: anyone holding an
// event id could otherwise cancel or move David's calls.
async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = await verifyAdminSession(request.cookies.get(COOKIE_NAME)?.value);
  if (session.valid) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// DELETE /api/coaching/calendar/[eventId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { eventId } = await params;
  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }
  const result = await cancelBooking(eventId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// PATCH /api/coaching/calendar/[eventId]
// Body: { newStart: ISO }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { eventId } = await params;
  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const newStart = typeof body.newStart === "string" ? body.newStart : "";
  if (!newStart) {
    return NextResponse.json({ error: "newStart required" }, { status: 400 });
  }

  const result = await rescheduleBooking(eventId, newStart);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: bookingErrorStatus(result.code) }
    );
  }
  return NextResponse.json(result);
}
