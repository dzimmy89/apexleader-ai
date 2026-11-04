import { NextRequest, NextResponse } from "next/server";
import { getCourse, getStages } from "@/lib/learn/catalog";
import { LEVELS } from "@/lib/coaching/syllabus";
import { IntakeLinkError, loadIntakeForm, submitIntakeForm } from "@/lib/coaching/intake-form";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const NO_STORE = { "Cache-Control": "no-store" };

function fail(e: unknown) {
  if (e instanceof IntakeLinkError) {
    return NextResponse.json({ ok: false, error: e.message, code: e.code }, { status: e.code === "expired" ? 410 : 404, headers: NO_STORE });
  }
  const message = e instanceof Error ? e.message : "Something went wrong. Try again in a minute.";
  return NextResponse.json({ ok: false, error: message }, { status: 400, headers: NO_STORE });
}

// GET /api/coaching/intake/:token  the client's intake form, with what they already answered
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const form = await loadIntakeForm((await params).token);
    return NextResponse.json(
      {
        ok: true,
        ...form,
        levels: LEVELS,
        stages: getStages().map((s) => ({ id: s.id, number: s.number, title: s.title })),
        courses: getStages().flatMap((s) => s.courseIds.map((id) => ({ id, title: getCourse(id)?.title || id, stageNumber: s.number }))),
      },
      { headers: NO_STORE }
    );
  } catch (e) {
    return fail(e);
  }
}

// POST /api/coaching/intake/:token  { answers }
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const body = (await request.json().catch(() => ({}))) as { answers?: unknown };
  try {
    await submitIntakeForm((await params).token, body.answers);
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (e) {
    if (!(e instanceof IntakeLinkError)) console.error("[intake-form] submit failed", e);
    return fail(e);
  }
}
