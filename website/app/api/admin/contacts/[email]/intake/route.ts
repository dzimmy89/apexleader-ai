import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCourse, getStages } from "@/lib/learn/catalog";
import { LEVELS } from "@/lib/coaching/syllabus";
import { aiConfigured, AiUnavailableError } from "@/lib/coaching/ai";
import { fillIntakeFromTranscript } from "@/lib/coaching/coaching-ai";
import {
  MAX_TRANSCRIPT_CHARS,
  cleanForm,
  cleanTranscript,
  clientContext,
  docxText,
  getIntake,
  saveIntake,
  type Intake,
} from "@/lib/coaching/intake";
import { DriveAccessError, findTranscriptCandidates, readTranscriptDoc } from "@/lib/coaching/meet-transcripts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 600;

const NO_STORE = { "Cache-Control": "no-store" };
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const TEXT_TYPES = /\.(txt|vtt|srt|md)$/i;

function view(intake: Intake) {
  return {
    intake,
    ai: aiConfigured(),
    stages: getStages().map((s) => ({ id: s.id, number: s.number, title: s.title })),
    levels: LEVELS,
    courses: getStages().flatMap((s) => s.courseIds.map((id) => ({ id, title: getCourse(id)?.title || id, stageNumber: s.number }))),
  };
}

function fail(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : String(error);
  const code = error instanceof DriveAccessError ? "drive_access" : error instanceof AiUnavailableError ? "ai_unavailable" : undefined;
  return NextResponse.json({ error: message, code }, { status, headers: NO_STORE });
}

async function emailFrom(params: Promise<{ email: string }>): Promise<string> {
  return decodeURIComponent((await params).email).trim().toLowerCase();
}

// GET /api/admin/contacts/:email/intake
export async function GET(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = await emailFrom(params);
  const { packageId } = await clientContext(email);
  return NextResponse.json(view(await getIntake(email, packageId)), { headers: NO_STORE });
}

// POST /api/admin/contacts/:email/intake
// { action: "find" }                  notes docs in Drive that may hold the discovery call
// { action: "import", docId }         read a notes doc's transcript
// { action: "paste", text }           a pasted transcript
// multipart file=<.txt|.vtt|.srt|.md|.docx>   an uploaded transcript
// { action: "fill" }                  Gemini fills the form from the transcript
// { action: "save", form }            David's edits
// { action: "confirm", form? }        the form is right; the syllabus draft can use it
// { action: "reopen" }                back to draft
export async function POST(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = await emailFrom(params);
  if (!email.includes("@")) return fail("Bad email");
  const ctx = await clientContext(email);
  const existing = await getIntake(email, ctx.packageId);
  const now = new Date().toISOString();

  if ((request.headers.get("content-type") || "").startsWith("multipart/form-data")) {
    const data = await request.formData().catch(() => null);
    const file = data?.get("file");
    if (!(file instanceof File)) return fail("Choose a file");
    if (file.size > MAX_UPLOAD_BYTES) return fail("That file is over 5 MB. Paste the transcript instead.");
    let raw: string;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (/\.docx$/i.test(file.name)) raw = docxText(buffer);
      else if (TEXT_TYPES.test(file.name) || file.type.startsWith("text/")) raw = buffer.toString("utf8");
      else return fail("Upload a .txt, .vtt, .srt, .md or .docx file");
    } catch (e) {
      return fail(e);
    }
    const text = cleanTranscript(raw);
    if (!text) return fail("That file has no text in it");
    const saved = await saveIntake(email, {
      transcript: { text, source: "upload", docId: null, docTitle: file.name.slice(0, 200), docUrl: null, callDate: null, importedAt: now },
      status: existing.status === "empty" ? "draft" : existing.status,
    });
    return NextResponse.json(view(saved), { headers: NO_STORE });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    switch (body.action) {
      case "find": {
        const candidates = await findTranscriptCandidates(email);
        return NextResponse.json({ ...view(existing), candidates }, { headers: NO_STORE });
      }
      case "import": {
        const doc = await readTranscriptDoc(String(body.docId || ""));
        const text = cleanTranscript(doc.text);
        if (!text) return fail("That doc has no transcript in it. Was transcription on for the call?");
        const saved = await saveIntake(email, {
          transcript: {
            text,
            source: "drive",
            docId: String(body.docId),
            docTitle: doc.title.slice(0, 200),
            docUrl: doc.url,
            callDate: typeof body.callDate === "string" ? body.callDate : doc.createdTime,
            importedAt: now,
          },
          status: existing.status === "empty" ? "draft" : existing.status,
        });
        return NextResponse.json(view(saved), { headers: NO_STORE });
      }
      case "paste": {
        const text = cleanTranscript(String(body.text || ""));
        if (!text) return fail("Paste the transcript first");
        const saved = await saveIntake(email, {
          transcript: { text, source: "paste", docId: null, docTitle: "Pasted transcript", docUrl: null, callDate: null, importedAt: now },
          status: existing.status === "empty" ? "draft" : existing.status,
        });
        return NextResponse.json(view(saved), { headers: NO_STORE });
      }
      case "fill": {
        if (!existing.transcript?.text) return fail("Add the call transcript first");
        const filled = await fillIntakeFromTranscript(existing.transcript.text.slice(0, MAX_TRANSCRIPT_CHARS), {
          clientName: ctx.clientName,
          pkg: ctx.pkg,
          today: now.slice(0, 10),
          current: existing.form,
        });
        const saved = await saveIntake(email, { ...filled, status: "draft", filledByAiAt: now, confirmedAt: null });
        return NextResponse.json(view(saved), { headers: NO_STORE });
      }
      case "save":
      case "confirm": {
        const form = body.form ? cleanForm(body.form, existing.form) : existing.form;
        if (body.action === "confirm" && !form.goals.length) return fail("Add at least one goal before you confirm");
        const saved = await saveIntake(email, {
          form,
          ...(body.action === "confirm"
            ? { status: "confirmed" as const, confirmedAt: now }
            : { status: existing.status === "empty" ? ("draft" as const) : existing.status }),
        });
        return NextResponse.json(view(saved), { headers: NO_STORE });
      }
      case "reopen": {
        const saved = await saveIntake(email, { status: "draft", confirmedAt: null });
        return NextResponse.json(view(saved), { headers: NO_STORE });
      }
      default:
        return fail("Unknown action");
    }
  } catch (e) {
    const status = e instanceof DriveAccessError || e instanceof AiUnavailableError ? 409 : 502;
    console.error(`[intake] ${String(body.action)} failed for ${email}:`, e);
    return fail(e, status);
  }
}
