import { NextRequest, NextResponse } from "next/server";
import { listSessions } from "@/lib/coaching/sessions";
import { resolvePortalSession } from "@/lib/coaching/portal-auth";

// GET /api/coaching/sessions?clientId=...&token=...&status=...
// Public but token-gated: only the portal-holder (matching clientId) can read
// their own sessions.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const clientId = (url.searchParams.get("clientId") || "").trim().toLowerCase();
  const token = url.searchParams.get("token") || "";
  const status = url.searchParams.get("status") as
    | "scheduled"
    | "completed"
    | "cancelled"
    | "no-show"
    | null;

  if (!clientId || !token) {
    return NextResponse.json(
      { error: "clientId and token are required" },
      { status: 400 }
    );
  }

  // Validate the portal token maps to this clientId.
  const session = await resolvePortalSession(token);
  if (!session.ok || session.clientId !== clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await listSessions({
    clientId,
    status: status || undefined,
  });

  // Strip private notes — only shared notes are visible to the client.
  return NextResponse.json({
    sessions: sessions.filter((s) => !s.ignored).map((s) => ({
      id: s.id,
      scheduledAt: s.scheduledAt,
      durationMins: s.durationMins,
      status: s.status,
      sharedNotes: s.sharedNotes || "",
      meetUrl: s.meetUrl || undefined,
    })),
  });
}
