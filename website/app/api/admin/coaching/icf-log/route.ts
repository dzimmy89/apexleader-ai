import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listSessions } from "@/lib/coaching/sessions";
import { getDb } from "@/lib/firebase-admin";

// GET /api/admin/coaching/icf-log?from=&to=&coachEmail=
// Exports a CSV of coaching sessions in an ICF coaching-log format.
// Columns mirror the ICF sample log: date, duration, client type, role,
// modality, coach.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const coachEmail = url.searchParams.get("coachEmail");

  const sessions = await listSessions({ limit: 500 });
  const filtered = sessions.filter((s) => {
    if (s.status !== "completed") return false;
    if (coachEmail && s.coachEmail !== coachEmail) return false;
    const at = new Date(s.scheduledAt);
    if (from && at < new Date(from)) return false;
    if (to && at > new Date(to)) return false;
    return true;
  });

  // Enrich with client names from client_records.
  const db = getDb();
  const clientIds = Array.from(new Set(filtered.map((s) => s.clientId)));
  const clientDocs = await Promise.all(
    clientIds.map((id) => db.collection("client_records").doc(id).get())
  );
  const clientNames = new Map<string, string>();
  clientDocs.forEach((d) => {
    if (d.exists) {
      const data = d.data() as Record<string, unknown>;
      clientNames.set(
        d.id,
        String(data.name || data.email || d.id)
      );
    }
  });

  const coachName = process.env.COACH_NAME || "David Zimmerman";

  const header = [
    "Date",
    "Duration (min)",
    "Client Type",
    "Client Initials",
    "Role",
    "Modality",
    "Coach",
  ];
  const rows = filtered.map((s) => [
    new Date(s.scheduledAt).toLocaleDateString("en-US"),
    String(s.durationMins),
    s.isProBono ? "Pro Bono" : "Paying",
    initials(clientNames.get(s.clientId) || s.clientId),
    "Coach",
    "Virtual (Google Meet)",
    coachName,
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");

  const filename = `icf-coaching-log-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function initials(name: string): string {
  const parts = name.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
