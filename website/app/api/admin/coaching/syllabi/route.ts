import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { getProgress } from "@/lib/learn/progress";
import { INTAKE } from "@/lib/coaching/intake";
import { SYLLABI, getSyllabus, syllabusStatus } from "@/lib/coaching/syllabus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ENDED = new Set(["cancelled", "subscription_cancelled", "refunded", "completed", "ended"]);

type SyllabusQueueGroup = "needs-intake" | "needs-syllabus" | "unpublished" | "behind" | "on-track" | "done";

// GET /api/admin/coaching/syllabi: every current coaching client and where their syllabus stands.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  const db = getDb();
  const [clients, intakes, syllabi] = await Promise.all([
    db.collection("client_records").limit(500).get(),
    db.collection(INTAKE).get(),
    db.collection(SYLLABI).get(),
  ]);
  const intakeStatus = new Map(intakes.docs.map((d) => [d.id, String((d.data() || {}).status || "empty")]));
  const hasSyllabus = new Set(syllabi.docs.map((d) => d.id));

  const rows = await Promise.all(
    clients.docs
      .map((d) => ({ email: d.id, data: (d.data() || {}) as Record<string, unknown> }))
      .filter((c) => c.email.includes("@") && !ENDED.has(String(c.data.status || "")))
      .map(async ({ email, data }) => {
        const syllabus = hasSyllabus.has(email) ? await getSyllabus(email).catch(() => null) : null;
        const status = syllabus ? syllabusStatus(syllabus, await getProgress(email).catch(() => null)) : null;
        const intake = intakeStatus.get(email) || "empty";
        let group: SyllabusQueueGroup;
        if (!syllabus && intake !== "confirmed") group = "needs-intake";
        else if (!syllabus || syllabus.version === 0) group = "needs-syllabus";
        else if (syllabus.status !== "published" || syllabus.unpublishedChanges) group = "unpublished";
        else if (status?.pace === "behind") group = "behind";
        else if (status?.pace === "done") group = "done";
        else group = "on-track";
        return {
          email,
          name: String(data.name || ""),
          packageName: String(data.packageName || data.packageId || ""),
          clientStatus: String(data.status || ""),
          intake,
          group,
          published: syllabus?.status === "published",
          version: syllabus?.version || 0,
          pace: status?.pace || null,
          done: status?.done || 0,
          total: status?.total || 0,
          overdue: status?.overdue || 0,
          currentWeek: status?.currentWeek || 0,
          weeks: status?.weeks.length || 0,
          next: status?.next ? `${status.next.courseTitle ? `${status.next.courseTitle}: ` : ""}${status.next.title}` : "",
          updatedAt: syllabus?.updatedAt || "",
        };
      })
  );
  return NextResponse.json({ clients: rows }, { headers: { "Cache-Control": "no-store" } });
}
