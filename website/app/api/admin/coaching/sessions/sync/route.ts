import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { syncCoachingCalendar } from "@/lib/coaching/session-sync";
import { findMeetRecording, publishMeetRecording } from "@/lib/coaching/meet-recordings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// GET /api/admin/coaching/sessions/sync  (when the calendar was last read)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const snap = await getDb().collection("app_state").doc("coaching_calendar_sync").get();
  return NextResponse.json(snap.exists ? snap.data() : {}, { headers: NO_STORE });
}

// POST /api/admin/coaching/sessions/sync  (read the coach calendar now)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  try {
    const result = await syncCoachingCalendar({
      findRecording: findMeetRecording,
      publishRecording: publishMeetRecording,
    });
    return NextResponse.json({ ok: true, result }, { headers: NO_STORE });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sessions/sync]", message);
    return NextResponse.json({ error: `Could not read the calendar: ${message.slice(0, 200)}` }, { status: 502, headers: NO_STORE });
  }
}
