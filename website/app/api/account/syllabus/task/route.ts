import { NextRequest, NextResponse } from "next/server";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { effectivePlan, getClientSyllabus, saveTasksDone } from "@/lib/coaching/syllabus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// POST /api/account/syllabus/task { itemId, done }: the signed-in client ticks a task in their published syllabus.
export async function POST(request: NextRequest) {
  const signedIn = await getAccountEmail();
  if (!signedIn) return NextResponse.json({ error: "Sign in first" }, { status: 401, headers: NO_STORE });
  // The syllabus lives under the coaching email, which may be a linked one.
  const email = (await getAccess(signedIn)).clientEmail || signedIn;
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const syllabus = await getClientSyllabus(email);
  const itemId = String(body.itemId || "");
  const item = syllabus ? effectivePlan(syllabus).flatMap((w) => w.items).find((i) => i.id === itemId) : null;
  // Clients tick their own tasks; milestones are David's to mark.
  if (!syllabus || !item || item.kind !== "task") {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  }
  const tasksDone = { ...syllabus.tasksDone };
  if (body.done) tasksDone[itemId] = new Date().toISOString();
  else delete tasksDone[itemId];
  await saveTasksDone(email, tasksDone);
  return NextResponse.json({ ok: true, done: Boolean(body.done) }, { headers: NO_STORE });
}
