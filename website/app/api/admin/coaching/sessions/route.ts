import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  type SessionStatus,
  getSession,
} from "@/lib/coaching/sessions";
import { getDb } from "@/lib/firebase-admin";
import { recountClientSessions } from "@/lib/coaching/session-sync";

const VALID_STATUSES: SessionStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "no-show",
];

// GET /api/admin/coaching/sessions?clientId=&status=&limit=
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") || undefined;
  const status = url.searchParams.get("status") as SessionStatus | null;
  const limit = Number(url.searchParams.get("limit") || 100);

  const sessions = await listSessions({
    clientId: clientId || undefined,
    status: status && VALID_STATUSES.includes(status) ? status : undefined,
    limit,
  });
  return NextResponse.json({ sessions });
}

// POST /api/admin/coaching/sessions
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const clientId = typeof body.clientId === "string" ? body.clientId.trim().toLowerCase() : "";
  const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt : "";

  if (!clientId || !scheduledAt) {
    return NextResponse.json(
      { error: "clientId and scheduledAt are required" },
      { status: 400 }
    );
  }

  const id = await createSession({
    clientId,
    packageId: typeof body.packageId === "string" ? body.packageId : undefined,
    scheduledAt,
    durationMins: typeof body.durationMins === "number" ? body.durationMins : 60,
    coachEmail: typeof body.coachEmail === "string" ? body.coachEmail : undefined,
    calendarEventId: typeof body.calendarEventId === "string" ? body.calendarEventId : undefined,
    meetUrl: typeof body.meetUrl === "string" ? body.meetUrl : undefined,
    isProBono: Boolean(body.isProBono),
  });
  await recountClientSessions(getDb(), clientId);
  return NextResponse.json({ ok: true, id });
}

// PATCH /api/admin/coaching/sessions
// Body: { id, status?, privateNotes?, sharedNotes?, actionItems? }
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.status === "string" && VALID_STATUSES.includes(body.status as SessionStatus)) {
    updates.status = body.status;
    // A status David sets by hand is kept; the calendar sync no longer changes it.
    updates.statusSource = "admin";
  }
  if (typeof body.ignored === "boolean") {
    updates.ignored = body.ignored;
  }
  if (typeof body.privateNotes === "string") {
    updates.privateNotes = body.privateNotes;
  }
  if (typeof body.sharedNotes === "string") {
    updates.sharedNotes = body.sharedNotes;
  }
  if (Array.isArray(body.actionItems)) {
    updates.actionItems = body.actionItems;
  }
  if (typeof body.scheduledAt === "string") {
    updates.scheduledAt = body.scheduledAt;
  }
  if (typeof body.durationMins === "number") {
    updates.durationMins = body.durationMins;
  }

  const before = await getSession(id);
  if (!before) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  await updateSession(id, updates);
  await recountClientSessions(getDb(), before.clientId);
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/coaching/sessions?id=
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "?id= required" }, { status: 400 });
  }
  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ ok: true });
  }
  // A session from the calendar would come back on the next sync, so it is
  // marked "not a session" instead of deleted.
  if (session.calendarEventId) {
    await updateSession(id, { ignored: true });
  } else {
    await deleteSession(id);
  }
  await recountClientSessions(getDb(), session.clientId);
  return NextResponse.json({ ok: true });
}
