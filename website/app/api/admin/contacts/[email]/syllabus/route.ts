import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCourse, getStages } from "@/lib/learn/catalog";
import { getProgress, type LearnProgress } from "@/lib/learn/progress";
import { sendEmail } from "@/lib/gmail";
import { getSiteOrigin } from "@/lib/env";
import { escapeHtml } from "@/lib/html";
import { aiConfigured, AiUnavailableError } from "@/lib/coaching/ai";
import { draftSyllabus, suggestChanges, toOp } from "@/lib/coaching/coaching-ai";
import { clientContext, getIntake, type IntakeForm } from "@/lib/coaching/intake";
import { DriveAccessError, readTranscriptDoc } from "@/lib/coaching/meet-transcripts";
import {
  LEVELS,
  buildCourseList,
  clampInputs,
  courseMinutes,
  deleteSyllabus,
  effectivePlan,
  getSyllabus,
  itemIsDone,
  listSyllabusVersions,
  planCourseIds,
  publishSyllabus,
  saveSyllabus,
  saveTasksDone,
  syllabusStatus,
  type Syllabus,
  type SyllabusInputs,
} from "@/lib/coaching/syllabus";
import {
  applyOps,
  courseItems,
  keepFinished,
  pausePlan,
  planFromCourses,
  planWarnings,
  resolveItem,
  respreadPlan,
  sanitizePlan,
  type PlanItem,
  type PlanOp,
  type PlanWeek,
} from "@/lib/coaching/syllabus-plan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 600;

const NO_STORE = { "Cache-Control": "no-store" };

let catalogCache: ReturnType<typeof buildCatalog> | null = null;

/** Every course with its lessons, exercises and quizzes, for the editor's add menu. */
function buildCatalog() {
  return getStages().flatMap((s) =>
    s.courseIds.map((id) => {
      const c = getCourse(id)!;
      return {
        id,
        title: c.title,
        stageId: s.id,
        stageNumber: s.number,
        minutes: courseMinutes(c),
        lessons: c.lessonCount,
        items: courseItems(id).map((i) => {
          const r = resolveItem(i);
          return { id: i.id, kind: i.kind, slug: i.slug, title: r.title, minutes: r.minutes };
        }),
      };
    })
  );
}

async function view(email: string, syllabus: Syllabus | null, extra: Record<string, unknown> = {}) {
  const [progress, versions, intake] = await Promise.all([
    getProgress(email).catch(() => null),
    syllabus ? listSyllabusVersions(email).catch(() => []) : Promise.resolve([]),
    getIntake(email).catch(() => null),
  ]);
  catalogCache ??= buildCatalog();
  return {
    syllabus,
    status: syllabus ? syllabusStatus(syllabus, progress) : null,
    warnings: syllabus ? planWarnings(effectivePlan(syllabus), syllabus.inputs.hoursPerWeek) : [],
    versions: versions.map((v) => ({ version: v.version, publishedAt: v.publishedAt, changeNote: v.changeNote })),
    intake: intake ? { status: intake.status, goals: intake.form.goals, timelineWeeks: intake.form.timelineWeeks, hoursPerWeek: intake.form.hoursPerWeek } : null,
    ai: aiConfigured(),
    stages: getStages().map((s) => ({ id: s.id, number: s.number, title: s.title, level: s.level })),
    levels: LEVELS,
    courses: catalogCache,
    ...extra,
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function validDate(raw: unknown): string | null {
  return typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw)) ? raw : null;
}

function fail(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : String(error);
  const code = error instanceof DriveAccessError ? "drive_access" : error instanceof AiUnavailableError ? "ai_unavailable" : undefined;
  return NextResponse.json({ error: message, code }, { status, headers: NO_STORE });
}

function inputsFromIntake(form: IntakeForm): SyllabusInputs {
  return clampInputs({
    goals: [...form.goals, form.targetOutcome].filter(Boolean).join("\n"),
    level: form.level,
    focusStageIds: form.focusStageIds,
    timelineWeeks: form.timelineWeeks,
    hoursPerWeek: form.hoursPerWeek,
  });
}

function doneCheck(progress: LearnProgress | null, tasksDone: Record<string, string>) {
  return (item: PlanItem) => itemIsDone(item, progress, tasksDone);
}

async function notifyClient(email: string, name: string, changeNote: string, first: boolean): Promise<string | null> {
  const url = `${getSiteOrigin()}/account`;
  const hello = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
  const lead = first ? "Your coaching syllabus is ready in your account." : "I've updated your coaching syllabus.";
  const sent = await sendEmail({
    to: email,
    purpose: "transactional",
    subject: first ? "Your FromAItoBusiness syllabus is ready" : "Your syllabus was updated",
    text: `${hello}\n\n${lead}${changeNote ? `\n\n${changeNote}` : ""}\n\nSee it here: ${url}\n\nDavid`,
    html: `<p>${escapeHtml(hello)}</p><p>${escapeHtml(lead)}</p>${changeNote ? `<p>${escapeHtml(changeNote)}</p>` : ""}<p><a href="${escapeHtml(url)}">Open your syllabus</a></p><p>David</p>`,
    log: { source: "coaching_syllabus", flowType: "coaching_syllabus" },
  });
  return sent.ok ? null : sent.error || "The email did not send";
}

// GET /api/admin/contacts/:email/syllabus
export async function GET(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = decodeURIComponent((await params).email).trim().toLowerCase();
  return NextResponse.json(await view(email, await getSyllabus(email)), { headers: NO_STORE });
}

// POST /api/admin/contacts/:email/syllabus
// { action: "plan", inputs?, startDate?, note? }     rule-based plan (from the confirmed intake when there is one)
// { action: "draft", startDate?, note? }             Gemini drafts the plan from the confirmed intake
// { action: "savePlan", plan, startDate?, note?, hoursPerWeek? }   David's edits in the editor
// { action: "save", courseIds, ... }                 older course-list edit; rebuilds the plan from courses
// { action: "pause", beforeWeek, count }             insert paused weeks
// { action: "respread", fromWeek, hoursPerWeek }     re-pace the unfinished work
// { action: "suggest", instruction, sessionNotes?, sessionDocId? }   Gemini's suggested changes (not saved)
// { action: "applyOps", ops }                        apply the suggestions David accepted
// { action: "toggleTask", itemId, done }             tick a task or milestone for the client
// { action: "publish", changeNote?, emailClient? } | { action: "unpublish" | "delete" }
export async function POST(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = decodeURIComponent((await params).email).trim().toLowerCase();
  if (!email.includes("@")) return fail("Bad email");
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const existing = await getSyllabus(email);
  const progress = await getProgress(email).catch(() => null);
  const isDone = doneCheck(progress, existing?.tasksDone || {});
  const edited = existing?.status === "published" ? { unpublishedChanges: true } : {};
  const note = typeof body.note === "string" ? body.note.slice(0, 4000) : existing?.note || "";
  const startDate = validDate(body.startDate) || existing?.startDate || today();

  /** Save a new plan; finished items in the old plan are kept. */
  async function savePlan(plan: PlanWeek[], patch: Partial<Syllabus> = {}) {
    const merged = existing ? keepFinished(effectivePlan(existing), plan, isDone) : plan;
    const courseIds = planCourseIds(merged);
    return saveSyllabus(email, {
      ...patch,
      plan: merged,
      courseIds,
      laterCourseIds: (patch.laterCourseIds ?? existing?.laterCourseIds ?? []).filter((id) => !courseIds.includes(id)),
      ...edited,
    });
  }

  try {
    switch (body.action) {
      case "plan": {
        const intake = await getIntake(email);
        const fromIntake = !body.inputs && intake.status === "confirmed";
        const inputs = fromIntake ? inputsFromIntake(intake.form) : clampInputs((body.inputs as Record<string, unknown>) || {});
        const { courseIds, laterCourseIds } = buildCourseList(inputs, { skipCourseIds: fromIntake ? intake.form.knownCourseIds : [] });
        const saved = await savePlan(planFromCourses(courseIds, inputs.hoursPerWeek), {
          inputs,
          laterCourseIds,
          startDate,
          note,
          source: "rules",
          summary: "",
          reasons: [],
          status: existing?.status || "draft",
          publishedAt: existing?.publishedAt || null,
        });
        return NextResponse.json(await view(email, saved), { headers: NO_STORE });
      }
      case "draft": {
        const intake = await getIntake(email);
        if (intake.status !== "confirmed") return fail("Confirm the intake form first");
        const ctx = await clientContext(email);
        const draft = await draftSyllabus(intake.form, { clientName: ctx.clientName, pkg: ctx.pkg, startDate });
        const inputs = inputsFromIntake(intake.form);
        const saved = await savePlan(draft.plan, {
          inputs,
          laterCourseIds: [],
          startDate,
          note: note || intake.form.goalsSummary,
          source: "ai",
          summary: draft.summary,
          reasons: draft.reasons,
          status: existing?.status || "draft",
          publishedAt: existing?.publishedAt || null,
        });
        return NextResponse.json(await view(email, saved, { dropped: draft.dropped }), { headers: NO_STORE });
      }
      case "savePlan": {
        if (!existing) return fail("Plan a syllabus first");
        const { plan, dropped } = sanitizePlan(body.plan);
        const inputs = body.hoursPerWeek !== undefined ? clampInputs({ ...existing.inputs, hoursPerWeek: Number(body.hoursPerWeek) }) : existing.inputs;
        const saved = await savePlan(plan, { inputs, startDate, note, source: existing.source === "rules" ? "manual" : existing.source });
        return NextResponse.json(await view(email, saved, { dropped }), { headers: NO_STORE });
      }
      case "save": {
        if (!existing) return fail("Plan a syllabus first");
        const requested = Array.isArray(body.courseIds) ? (body.courseIds as unknown[]).map(String) : existing.courseIds;
        const courseIds = [...new Set(requested.filter((id) => getCourse(id)))];
        const inputs =
          body.hoursPerWeek !== undefined || body.inputs
            ? clampInputs({
                ...existing.inputs,
                ...((body.inputs as object) || {}),
                ...(body.hoursPerWeek !== undefined ? { hoursPerWeek: Number(body.hoursPerWeek) } : {}),
              })
            : existing.inputs;
        const saved = await savePlan(planFromCourses(courseIds, inputs.hoursPerWeek), { inputs, startDate, note });
        return NextResponse.json(await view(email, saved), { headers: NO_STORE });
      }
      case "pause":
      case "respread": {
        if (!existing) return fail("Plan a syllabus first");
        const plan = effectivePlan(existing);
        const hours = Number(body.hoursPerWeek) || existing.inputs.hoursPerWeek;
        const next =
          body.action === "pause"
            ? pausePlan(plan, Number(body.beforeWeek) || 1, Number(body.count) || 1)
            : respreadPlan(plan, Number(body.fromWeek) || 1, hours, isDone);
        const inputs = body.action === "respread" ? clampInputs({ ...existing.inputs, hoursPerWeek: hours }) : existing.inputs;
        const saved = await saveSyllabus(email, { plan: next, courseIds: planCourseIds(next), inputs, ...edited });
        return NextResponse.json(await view(email, saved), { headers: NO_STORE });
      }
      case "suggest": {
        if (!existing) return fail("Plan a syllabus first");
        const instruction = String(body.instruction || "").slice(0, 4000).trim();
        let sessionNotes = String(body.sessionNotes || "").slice(0, 150_000).trim();
        if (body.sessionDocId) sessionNotes = (await readTranscriptDoc(String(body.sessionDocId))).text.slice(0, 150_000);
        if (!instruction && !sessionNotes) return fail("Say what changed, or add a session's notes");
        const intake = await getIntake(email);
        const status = syllabusStatus(existing, progress);
        const result = await suggestChanges({
          plan: effectivePlan(existing),
          isDone,
          currentWeek: status.currentWeek,
          hoursPerWeek: existing.inputs.hoursPerWeek,
          form: intake.status === "empty" ? null : intake.form,
          instruction,
          sessionNotes,
        });
        return NextResponse.json(await view(email, existing, { suggestions: result.suggestions, suggestionSummary: result.summary }), {
          headers: NO_STORE,
        });
      }
      case "applyOps": {
        if (!existing) return fail("Plan a syllabus first");
        const ops = (Array.isArray(body.ops) ? (body.ops as Record<string, unknown>[]) : []).map(toOp).filter((o): o is PlanOp => Boolean(o));
        if (!ops.length) return fail("No changes to apply");
        const next = applyOps(effectivePlan(existing), ops, isDone);
        const saved = await saveSyllabus(email, { plan: next, courseIds: planCourseIds(next), ...edited });
        return NextResponse.json(await view(email, saved), { headers: NO_STORE });
      }
      case "toggleTask": {
        if (!existing) return fail("Plan a syllabus first");
        const itemId = String(body.itemId || "");
        const item = effectivePlan(existing).flatMap((w) => w.items).find((i) => i.id === itemId);
        if (!item || (item.kind !== "task" && item.kind !== "milestone")) return fail("Only tasks and milestones can be ticked");
        const tasksDone = { ...existing.tasksDone };
        if (body.done) tasksDone[itemId] = new Date().toISOString();
        else delete tasksDone[itemId];
        const saved = await saveTasksDone(email, tasksDone);
        return NextResponse.json(await view(email, saved), { headers: NO_STORE });
      }
      case "publish": {
        if (!existing) return fail("Plan a syllabus first");
        if (!effectivePlan(existing).some((w) => w.items.length)) return fail("Add at least one item");
        const changeNote = String(body.changeNote || "").trim();
        const first = existing.version === 0;
        const saved = await publishSyllabus(email, changeNote);
        let emailError: string | null = null;
        if (body.emailClient) {
          const ctx = await clientContext(email);
          emailError = await notifyClient(email, ctx.clientName, changeNote, first).catch((e) => String(e));
        }
        return NextResponse.json(await view(email, saved, { emailError }), { headers: NO_STORE });
      }
      case "unpublish": {
        if (!existing) return fail("Plan a syllabus first");
        const saved = await saveSyllabus(email, { status: "draft" });
        return NextResponse.json(await view(email, saved), { headers: NO_STORE });
      }
      case "delete":
        await deleteSyllabus(email);
        return NextResponse.json(await view(email, null), { headers: NO_STORE });
      default:
        return fail("Unknown action");
    }
  } catch (e) {
    console.error(`[syllabus] ${String(body.action)} failed for ${email}:`, e);
    return fail(e, e instanceof DriveAccessError || e instanceof AiUnavailableError ? 409 : 502);
  }
}
