import { BRAND } from "@/lib/brand";
import { getCourse, getStages } from "@/lib/learn/catalog";
import { aiJson } from "@/lib/coaching/ai";
import {
  INTAKE_FIELDS,
  cleanForm,
  type IntakeEvidence,
  type IntakeField,
  type IntakeForm,
} from "@/lib/coaching/intake";
import { LEVELS } from "@/lib/coaching/syllabus";
import {
  PREREQS,
  applyOps,
  catalogItemExists,
  sanitizePlan,
  type PlanItem,
  type PlanOp,
  type PlanWeek,
} from "@/lib/coaching/syllabus-plan";
import { courseMinutes } from "@/lib/coaching/syllabus";

/**
 * The three Gemini steps of the coaching pipeline: fill the intake form from
 * a discovery call transcript, draft a syllabus from the confirmed form,
 * and suggest changes to a running syllabus. Every answer is checked
 * against the catalog before David sees it; nothing is saved or shown to a
 * client without David.
 */

const VOICE =
  `You work for ${BRAND.coachName}, who runs ${BRAND.name} and coaches private clients one on one on ${BRAND.subject}. ` +
  "Keep advice practical and safe: never suggest putting customer or confidential data into a tool without the client checking its terms, and never promise results. " +
  "Write plainly, in short sentences, in the client's own language where you quote them.";

export interface PackageContext {
  id: string;
  name: string;
  sessions: number;
  weeks: number;
}

/** The course library as compact text: every course, lesson, exercise and quiz with its minutes. */
export function catalogText(): string {
  const lines: string[] = [];
  for (const stage of getStages()) {
    lines.push(`# Stage ${stage.number} ${stage.id}: ${stage.title} (${stage.level}). Builds on: ${(PREREQS[stage.id] || []).join(", ") || "nothing"}`);
    for (const id of stage.courseIds) {
      const c = getCourse(id);
      if (!c) continue;
      lines.push(`## course ${c.id} | ${c.title} | ${courseMinutes(c)} min | ${c.description.replace(/\s+/g, " ").slice(0, 160)}`);
      for (const mod of c.modules) {
        for (const l of mod.lessons) {
          lines.push(`lesson ${l.slug} | ${l.title} | ${l.minutes}m${l.exercise ? ` || exercise ${l.exercise} | ${l.exerciseMinutes}m` : ""}`);
        }
        if (mod.quiz) lines.push(`quiz ${mod.quiz} | module ${mod.number}: ${mod.title} | 10m`);
      }
    }
  }
  return lines.join("\n");
}

function courseList(): string {
  return getStages()
    .flatMap((s) => s.courseIds.map((id) => `${id} (stage ${s.number} ${s.id}): ${getCourse(id)?.title || id}`))
    .join("\n");
}

const STRING = { type: "string" } as const;

function intakeSchema() {
  const stageIds = getStages().map((s) => s.id);
  const fields = INTAKE_FIELDS.filter((f) => f !== "coachNotes");
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "goals",
      "targetOutcome",
      "targetDate",
      "timelineWeeks",
      "hoursPerWeek",
      "level",
      "business",
      "tools",
      "technical",
      "focusStageIds",
      "knownCourseIds",
      "concerns",
      "learningStyle",
      "coachNotes",
      "goalsSummary",
      "evidence",
      "missing",
    ],
    properties: {
      goals: { type: "array", items: STRING },
      targetOutcome: STRING,
      targetDate: STRING,
      timelineWeeks: { type: "integer" },
      hoursPerWeek: { type: "number" },
      level: { type: "string", enum: LEVELS.map((l) => l.id) },
      business: STRING,
      tools: STRING,
      technical: { type: "string", enum: ["unclear", "low", "medium", "high"] },
      focusStageIds: { type: "array", items: { type: "string", enum: stageIds } },
      knownCourseIds: { type: "array", items: STRING },
      concerns: STRING,
      learningStyle: STRING,
      coachNotes: STRING,
      goalsSummary: STRING,
      evidence: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["field", "quote", "at"],
          properties: { field: { type: "string", enum: fields }, quote: STRING, at: STRING },
        },
      },
      missing: { type: "array", items: { type: "string", enum: fields } },
    },
  };
}

export interface IntakeFill {
  form: IntakeForm;
  evidence: IntakeEvidence[];
  missing: IntakeField[];
}

/** Fill the intake form from a discovery call transcript. */
export async function fillIntakeFromTranscript(
  transcript: string,
  ctx: { clientName: string; pkg: PackageContext | null; today: string; current: IntakeForm }
): Promise<IntakeFill> {
  const pkg = ctx.pkg
    ? `${ctx.pkg.name}: ${ctx.pkg.sessions} sessions over about ${ctx.pkg.weeks} weeks.`
    : "Not bought yet; assume 12 weeks.";
  const system = `${VOICE}

You read the transcript of a discovery call between ${BRAND.coachFirstName} and a prospective coaching client and fill in ${BRAND.coachFirstName}'s intake form. Only use what the client actually said. When the call does not answer a field, leave it empty (or the default given) and list it in "missing". For each field you fill, add an "evidence" entry with a short exact quote from the transcript and the timestamp shown near it ("" if there is none).

Fields:
- goals: up to 3 goals, in the client's words.
- targetOutcome: the concrete result they want, and targetDate as YYYY-MM-DD if they named a date or month (else "").
- timelineWeeks: weeks the plan should run. Default to the package length unless the client wants a different pace.
- hoursPerWeek: hours a week they said they can study. Default 3.
- level: ${LEVELS.map((l) => `${l.id} (${l.hint.toLowerCase()})`).join(", ")}.
- business: what their business does, how big the team is, and the processes they want AI to help with.
- tools: the software and AI tools they use now.
- technical: how comfortable they are setting tools up themselves: low (no-code only), medium (some formulas or scripting), high (writes code), or "unclear".
- focusStageIds: the stages of the course library their goals point to.
- knownCourseIds: course ids from the list below that the client clearly already knows.
- concerns: worries and limits (data privacy, cost, time, team buy-in).
- learningStyle: how they like to learn.
- coachNotes: a few lines for ${BRAND.coachFirstName} only: what will matter in coaching this person.
- goalsSummary: 2 to 3 sentences addressed to the client ("You want to..."), for their account page.

Stages:
${getStages()
  .map((s) => `${s.id}: Stage ${s.number}, ${s.title} (${s.level}). ${s.blurb}`)
  .join("\n")}

Courses:
${courseList()}`;
  const prompt = `Client: ${ctx.clientName || "unknown"}
Package: ${pkg}
Today: ${ctx.today}
Defaults: timelineWeeks ${ctx.current.timelineWeeks}, hoursPerWeek ${ctx.current.hoursPerWeek}

<transcript>
${transcript}
</transcript>`;
  const out = await aiJson<Record<string, unknown>>({ system, prompt, schema: intakeSchema(), effort: "medium", maxTokens: 16000 });
  const form = cleanForm({ ...out, coachNotes: out.coachNotes || ctx.current.coachNotes }, ctx.current);
  const evidence = (Array.isArray(out.evidence) ? (out.evidence as Record<string, unknown>[]) : [])
    .filter((e) => INTAKE_FIELDS.includes(e.field as IntakeField) && String(e.quote || "").trim())
    .map((e) => ({ field: e.field as IntakeField, quote: String(e.quote).slice(0, 600), at: String(e.at || "").slice(0, 20) }));
  const missing = (Array.isArray(out.missing) ? (out.missing as string[]) : []).filter((f): f is IntakeField =>
    INTAKE_FIELDS.includes(f as IntakeField)
  );
  return { form, evidence, missing };
}

const ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "courseId", "slug", "title", "detail", "minutes"],
  properties: {
    kind: { type: "string", enum: ["lesson", "exercise", "quiz", "task", "milestone"] },
    courseId: STRING,
    slug: STRING,
    title: STRING,
    detail: STRING,
    minutes: { type: "integer" },
  },
};

const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "weeks", "reasons"],
  properties: {
    summary: STRING,
    weeks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["goal", "note", "sessionPlan", "items"],
        properties: { goal: STRING, note: STRING, sessionPlan: STRING, items: { type: "array", items: ITEM_SCHEMA } },
      },
    },
    reasons: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["courseId", "reason"],
        properties: { courseId: STRING, reason: STRING },
      },
    },
  },
};

const PLAN_RULES = `Plan rules:
- Use only lessons, exercises and quizzes from the catalog, by their exact course id and slug. kind "lesson" uses the lesson slug, kind "exercise" the exercise slug written after "exercise", kind "quiz" the quiz id.
- Keep each course's lessons in catalog order; put a lesson's exercise right after it and a module's quiz after its last lesson. Leave out lessons the client already knows rather than padding.
- Respect "Builds on": a stage's courses come after the stages it builds on, unless the client already knows those.
- Keep each week near the client's hours a week (lesson minutes + exercise minutes + 10 per quiz + task minutes).
- Add tasks (kind "task", courseId and slug "") for real-world steps the library does not cover but the client's goals need, with a short title, a detail line and minutes. Practical steps in their own business (for example "Run this week's customer emails through the prompt you wrote and time it"), with test data before real customer data.
- End each phase or month with a milestone (kind "milestone", minutes 0): a title the client will recognise as progress toward their goal.
- goal: one line for the week, to the client. note: optional encouragement or context for the client ("" if none).
- sessionPlan: for ${BRAND.coachFirstName} only, what to cover in that week's coaching session; "" for weeks without one.`;

/** Draft a syllabus from a confirmed intake form. */
export async function draftSyllabus(
  form: IntakeForm,
  ctx: { clientName: string; pkg: PackageContext | null; startDate: string }
): Promise<{ plan: PlanWeek[]; dropped: string[]; summary: string; reasons: { courseId: string; reason: string }[] }> {
  const pkg = ctx.pkg
    ? `${ctx.pkg.name}: ${ctx.pkg.sessions} coaching sessions over about ${ctx.pkg.weeks} weeks.`
    : "Private coaching, length not set.";
  const system = `${VOICE}

You design a week by week syllabus through ${BRAND.name}'s course library for one coaching client, from ${BRAND.coachFirstName}'s intake notes.

${PLAN_RULES}
- Plan exactly the client's timeline in weeks, and spread the coaching sessions evenly over those weeks.
- summary: 2 to 4 sentences for ${BRAND.coachFirstName} on the shape of the plan and any trade-off (for example what did not fit the timeline).
- reasons: one short line per course used, saying why it is in this client's plan.

Catalog:
${catalogText()}`;
  const prompt = `Client: ${ctx.clientName || "the client"}
Package: ${pkg}
Week 1 starts: ${ctx.startDate}

Intake:
${JSON.stringify(form, null, 2)}`;
  const out = await aiJson<{ summary?: string; weeks?: unknown[]; reasons?: { courseId: string; reason: string }[] }>({
    system,
    prompt,
    schema: DRAFT_SCHEMA,
    effort: "medium",
    maxTokens: 64000,
  });
  const { plan, dropped } = sanitizePlan(out.weeks);
  if (!plan.some((w) => w.items.length)) throw new Error("Gemini's draft had no usable items");
  const used = new Set(plan.flatMap((w) => w.items.map((i) => i.courseId)).filter(Boolean));
  return {
    plan,
    dropped,
    summary: String(out.summary || "").slice(0, 2000),
    reasons: (out.reasons || []).filter((r) => used.has(r.courseId)).map((r) => ({ courseId: r.courseId, reason: String(r.reason).slice(0, 400) })),
  };
}

const OPS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "changes"],
  properties: {
    summary: STRING,
    changes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["op", "reason", "itemId", "week", "toWeek", "goal", "count", "item"],
        properties: {
          op: { type: "string", enum: ["add", "remove", "move", "skip", "setGoal", "addWeeks"] },
          reason: STRING,
          itemId: STRING,
          week: { type: "integer" },
          toWeek: { type: "integer" },
          goal: STRING,
          count: { type: "integer" },
          item: ITEM_SCHEMA,
        },
      },
    },
  },
};

export interface Suggestion {
  op: PlanOp;
  /** One line for David, e.g. "Move Map It Before You Build to week 6". */
  label: string;
  reason: string;
}

function planForPrompt(plan: PlanWeek[], isDone: (i: PlanItem) => boolean, currentWeek: number): string {
  return plan
    .map((w, i) => {
      const head = `Week ${i + 1}${i + 1 === currentWeek ? " (this week)" : ""}${w.paused ? " (paused)" : ""}: ${w.goal}`;
      const items = w.items.map((it) => {
        const name = it.courseId ? `${it.kind} ${it.courseId}/${it.slug}` : `${it.kind} "${it.title}"`;
        return `  - [${isDone(it) ? "done" : it.skipped ? "skipped" : "open"}] id=${it.id} ${name}`;
      });
      return [head, ...items].join("\n");
    })
    .join("\n");
}

/** Turn a model's change into a PlanOp, or null when it does not make sense. */
export function toOp(raw: Record<string, unknown>): PlanOp | null {
  const reason = String(raw.reason || "").slice(0, 300);
  switch (raw.op) {
    case "add": {
      const item = (raw.item || {}) as Record<string, unknown>;
      const kind = String(item.kind || "");
      if (["lesson", "exercise", "quiz"].includes(kind)) {
        if (!catalogItemExists(kind as PlanItem["kind"], String(item.courseId || ""), String(item.slug || ""))) return null;
      } else if (!["task", "milestone"].includes(kind) || !String(item.title || "").trim()) return null;
      return { op: "add", week: Number(raw.week) || 1, item: item as PlanOp extends { item: infer I } ? I : never, reason };
    }
    case "remove":
    case "skip":
      return raw.itemId ? { op: raw.op, itemId: String(raw.itemId), reason } : null;
    case "move":
      return raw.itemId && Number(raw.toWeek) > 0 ? { op: "move", itemId: String(raw.itemId), toWeek: Number(raw.toWeek), reason } : null;
    case "setGoal":
      return Number(raw.week) > 0 ? { op: "setGoal", week: Number(raw.week), goal: String(raw.goal || ""), reason } : null;
    case "addWeeks":
      return Number(raw.count) > 0 ? { op: "addWeeks", count: Number(raw.count), reason } : null;
    default:
      return null;
  }
}

export function describeOp(op: PlanOp, plan: PlanWeek[]): string {
  const items = plan.flatMap((w) => w.items);
  const name = (id: string) => {
    const it = items.find((i) => i.id === id);
    if (!it) return id;
    if (!it.courseId) return `"${it.title}"`;
    return `${getCourse(it.courseId)?.title || it.courseId} ${it.kind} ${it.slug}`;
  };
  switch (op.op) {
    case "add": {
      const it = op.item;
      const what = it.courseId ? `${getCourse(String(it.courseId))?.title || it.courseId} ${it.kind} ${it.slug}` : `${it.kind} "${it.title}"`;
      return `Add ${what} to week ${op.week}`;
    }
    case "remove":
      return `Remove ${name(op.itemId)}`;
    case "move":
      return `Move ${name(op.itemId)} to week ${op.toWeek}`;
    case "skip":
      return `Mark ${name(op.itemId)} as already known`;
    case "setGoal":
      return `Week ${op.week} goal: ${op.goal}`;
    case "addWeeks":
      return `Add ${op.count} week${op.count === 1 ? "" : "s"} at the end`;
  }
}

/** Suggest changes to a running syllabus from David's note and/or a session's notes. */
export async function suggestChanges(opts: {
  plan: PlanWeek[];
  isDone: (item: PlanItem) => boolean;
  currentWeek: number;
  hoursPerWeek: number;
  form: IntakeForm | null;
  instruction: string;
  sessionNotes: string;
}): Promise<{ summary: string; suggestions: Suggestion[] }> {
  const system = `${VOICE}

${BRAND.coachFirstName} is coaching a client through a week by week syllabus. He tells you what has changed (and may attach the notes or transcript of a coaching session). Suggest the smallest set of changes to the syllabus that responds to it. Never remove or move items marked done. Refer to existing items by their id.

Change types (fill unused fields with "" or 0, and item with empty values):
- add: put "item" in "week".
- remove: take out "itemId" (only open items).
- move: move "itemId" to "toWeek".
- skip: mark "itemId" as already known by the client.
- setGoal: set the goal line of "week" to "goal".
- addWeeks: add "count" weeks at the end.

${PLAN_RULES}
- The client studies about ${opts.hoursPerWeek} hours a week.

Catalog:
${catalogText()}`;
  const prompt = `Current syllabus:
${planForPrompt(opts.plan, opts.isDone, opts.currentWeek)}

${opts.form ? `Intake:\n${JSON.stringify({ goals: opts.form.goals, targetOutcome: opts.form.targetOutcome, targetDate: opts.form.targetDate, concerns: opts.form.concerns }, null, 2)}\n` : ""}
${BRAND.coachFirstName} says: ${opts.instruction || "(nothing; use the session notes)"}
${opts.sessionNotes ? `\n<session_notes>\n${opts.sessionNotes.slice(0, 150_000)}\n</session_notes>` : ""}`;
  const out = await aiJson<{ summary?: string; changes?: Record<string, unknown>[] }>({
    system,
    prompt,
    schema: OPS_SCHEMA,
    effort: "medium",
    maxTokens: 16000,
  });
  const suggestions: Suggestion[] = [];
  for (const raw of out.changes || []) {
    const op = toOp(raw);
    if (!op) continue;
    // Drop changes that would do nothing (unknown ids, finished items).
    const before = JSON.stringify(opts.plan);
    if (JSON.stringify(applyOps(opts.plan, [op], opts.isDone)) === before && op.op !== "add") continue;
    suggestions.push({ op, label: describeOp(op, opts.plan), reason: String(raw.reason || "") });
  }
  return { summary: String(out.summary || ""), suggestions };
}
