import { getDb } from "@/lib/firebase-admin";
import { allLessons, getCourse, getPlannerConfig, getStages, type LearnCourse } from "@/lib/learn/catalog";
import type { LearnProgress } from "@/lib/learn/progress";
import {
  PACE_LABEL,
  PREREQS,
  QUIZ_MINUTES,
  catalogItemDone,
  planFromCourses,
  planStatus,
  sanitizePlan,
  type PlanItem,
  type PlanStatus,
  type PlanWeek,
} from "@/lib/coaching/syllabus-plan";

/**
 * client_syllabi/{email}: a coaching client's plan through the course library.
 *
 * The plan is stored week by week (see syllabus-plan.ts): lessons, exercises
 * and quizzes from the library plus David's own tasks and milestones. It is
 * drafted by Gemini from the client's intake (coaching-ai.ts), or by the
 * rules below when Gemini is not available, and David edits it before he
 * publishes. Syllabi saved before the weekly plan existed only have
 * courseIds; their weeks are rebuilt from those until the first edit saves
 * a plan. A syllabus is a draft until David publishes it; only published
 * ones show in the client's account, and every publish is kept in
 * client_syllabus_versions.
 */
export const SYLLABI = "client_syllabi";
export const SYLLABUS_VERSIONS = "client_syllabus_versions";

export { PACE_LABEL, QUIZ_MINUTES };

export type ExperienceLevel = "new" | "beginner" | "intermediate" | "advanced";

export const LEVELS: { id: ExperienceLevel; label: string; hint: string }[] = [
  { id: "new", label: "New", hint: "Has not used AI tools for work yet" },
  { id: "beginner", label: "Beginner", hint: "Uses a chat assistant now and then" },
  { id: "intermediate", label: "Intermediate", hint: "Uses AI tools every week, wants workflows" },
  { id: "advanced", label: "Advanced", hint: "Builds automations or agents, wants to scale them" },
];

export interface SyllabusInputs {
  goals: string;
  level: ExperienceLevel;
  /** Stage ids the client wants to get to. */
  focusStageIds: string[];
  timelineWeeks: number;
  hoursPerWeek: number;
}

export interface Syllabus {
  email: string;
  inputs: SyllabusInputs;
  courseIds: string[];
  /** Courses that fit after the timeline, shown as "next". */
  laterCourseIds: string[];
  /** Week by week plan; null on syllabi saved before plans existed. */
  plan: PlanWeek[] | null;
  /** Task and milestone ids → ISO time ticked off. */
  tasksDone: Record<string, string>;
  /** YYYY-MM-DD, week 1 starts here. */
  startDate: string;
  note: string;
  /** How the current draft was made. */
  source: "rules" | "ai" | "manual";
  /** Gemini's short summary of the plan, for David. */
  summary: string;
  /** Why each course is in the plan, for David. */
  reasons: { courseId: string; reason: string }[];
  status: "draft" | "published";
  /** Number of the last published version (0 = never published). */
  version: number;
  /** The note shown to the client with the last publish. */
  changeNote: string;
  /** True when the draft has edits the client has not seen yet. */
  unpublishedChanges: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}


export function clampInputs(raw: Partial<SyllabusInputs>): SyllabusInputs {
  const level = LEVELS.some((l) => l.id === raw.level) ? (raw.level as ExperienceLevel) : "beginner";
  const stageIds = new Set(getStages().map((s) => s.id));
  const focus = (Array.isArray(raw.focusStageIds) ? raw.focusStageIds : []).filter((id) => stageIds.has(id));
  return {
    goals: String(raw.goals || "").slice(0, 4000),
    level,
    focusStageIds: focus,
    timelineWeeks: Math.min(104, Math.max(1, Math.round(Number(raw.timelineWeeks) || 12))),
    hoursPerWeek: Math.min(40, Math.max(0.5, Number(raw.hoursPerWeek) || 3)),
  };
}

export function courseMinutes(course: LearnCourse): number {
  const lessons = allLessons(course).reduce((n, l) => n + l.minutes + l.exerciseMinutes, 0);
  const quizzes = course.modules.filter((m) => m.quiz).length * QUIZ_MINUTES;
  return lessons + quizzes;
}

/** The ordered courses for these inputs, split into what fits the timeline and what comes after. */
export function buildCourseList(
  inputs: SyllabusInputs,
  opts: { skipCourseIds?: string[] } = {}
): { courseIds: string[]; laterCourseIds: string[] } {
  const stages = getStages();
  const planner = getPlannerConfig();
  const fallback = planner.defaultFocusByLevel[inputs.level] || stages[0]?.id;
  const focus = inputs.focusStageIds.length ? inputs.focusStageIds : fallback ? [fallback] : [];
  const wanted = new Set<string>();
  for (const id of focus) {
    wanted.add(id);
    for (const pre of PREREQS[id] || []) wanted.add(pre);
  }
  const skip = new Set([...(planner.skipByLevel[inputs.level] || []), ...(opts.skipCourseIds || [])]);
  const ordered = stages
    .filter((s) => wanted.has(s.id))
    .flatMap((s) => s.courseIds)
    .filter((id) => !skip.has(id) && getCourse(id));

  const budget = inputs.timelineWeeks * inputs.hoursPerWeek * 60;
  const courseIds: string[] = [];
  const laterCourseIds: string[] = [];
  let used = 0;
  for (const id of ordered) {
    const minutes = courseMinutes(getCourse(id)!);
    // Always plan at least one course, and keep path order: once one
    // course spills over, everything after it is "later".
    if (laterCourseIds.length === 0 && (courseIds.length === 0 || used + minutes <= budget)) {
      courseIds.push(id);
      used += minutes;
    } else {
      laterCourseIds.push(id);
    }
  }
  return { courseIds, laterCourseIds };
}

export interface SyllabusItem {
  kind: "lesson" | "quiz";
  courseId: string;
  courseTitle: string;
  /** Lesson slug or quiz id. */
  slug: string;
  title: string;
  href: string;
  minutes: number;
  /** Lesson's exercise slug, when it has one. */
  exercise: string | null;
  exerciseHref: string | null;
}

export interface SyllabusWeek {
  number: number;
  /** YYYY-MM-DD */
  starts: string;
  minutes: number;
  items: SyllabusItem[];
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Lessons (with their exercise) and quizzes of whole courses, in order. */
export function syllabusItems(courseIds: string[]): SyllabusItem[] {
  const items: SyllabusItem[] = [];
  for (const id of courseIds) {
    const course = getCourse(id);
    if (!course) continue;
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        items.push({
          kind: "lesson",
          courseId: id,
          courseTitle: course.title,
          slug: lesson.slug,
          title: lesson.title,
          href: `/university/${id}/lessons/${lesson.slug}`,
          minutes: lesson.minutes + lesson.exerciseMinutes,
          exercise: lesson.exercise,
          exerciseHref: lesson.exercise ? `/university/${id}/exercises/${lesson.exercise}` : null,
        });
      }
      if (mod.quiz) {
        items.push({
          kind: "quiz",
          courseId: id,
          courseTitle: course.title,
          slug: mod.quiz,
          title: `Module ${mod.number} quiz: ${mod.title}`,
          href: `/university/${id}/quizzes/${mod.quiz}`,
          minutes: QUIZ_MINUTES,
          exercise: null,
          exerciseHref: null,
        });
      }
    }
  }
  return items;
}

/** Spread whole-course items over weeks of hoursPerWeek; a week never starts empty. */
export function planWeeks(courseIds: string[], hoursPerWeek: number, startDate: string): SyllabusWeek[] {
  const perWeek = Math.max(30, hoursPerWeek * 60);
  const weeks: SyllabusWeek[] = [];
  let current: SyllabusWeek | null = null;
  for (const item of syllabusItems(courseIds)) {
    if (!current || (current.items.length > 0 && current.minutes + item.minutes > perWeek)) {
      current = { number: weeks.length + 1, starts: addDays(startDate, weeks.length * 7), minutes: 0, items: [] };
      weeks.push(current);
    }
    current.items.push(item);
    current.minutes += item.minutes;
  }
  return weeks;
}

/** The plan to show: the saved one, or one rebuilt from the course list. */
export function effectivePlan(syllabus: Pick<Syllabus, "courseIds" | "inputs"> & { plan?: PlanWeek[] | null }): PlanWeek[] {
  return syllabus.plan ?? planFromCourses(syllabus.courseIds, syllabus.inputs.hoursPerWeek);
}

export type SyllabusStatus = PlanStatus;

export function syllabusStatus(
  syllabus: Pick<Syllabus, "courseIds" | "startDate" | "inputs"> & { plan?: PlanWeek[] | null; tasksDone?: Record<string, string> },
  progress: LearnProgress | null,
  now: Date = new Date()
): SyllabusStatus {
  return planStatus(effectivePlan(syllabus), syllabus.startDate, progress, syllabus.tasksDone || {}, now);
}

/** Is this plan item done for this client? */
export function itemIsDone(item: PlanItem, progress: LearnProgress | null, tasksDone: Record<string, string>): boolean {
  if (item.kind === "task" || item.kind === "milestone") return Boolean(tasksDone[item.id]);
  return catalogItemDone(item, progress);
}

/** The course ids a plan uses, in first-use order. */
export function planCourseIds(plan: PlanWeek[]): string[] {
  const ids: string[] = [];
  for (const it of plan.flatMap((w) => w.items)) if (it.courseId && !ids.includes(it.courseId)) ids.push(it.courseId);
  return ids;
}

function readSyllabus(email: string, data: Record<string, unknown>): Syllabus {
  const plan = Array.isArray(data.plan) ? sanitizePlan(data.plan).plan : null;
  const tasksDone: Record<string, string> = {};
  if (data.tasksDone && typeof data.tasksDone === "object") {
    for (const [k, v] of Object.entries(data.tasksDone as Record<string, unknown>)) if (typeof v === "string") tasksDone[k] = v;
  }
  return {
    email,
    inputs: clampInputs((data.inputs as Partial<SyllabusInputs>) || {}),
    courseIds: Array.isArray(data.courseIds) ? (data.courseIds as string[]).filter((id) => getCourse(id)) : [],
    laterCourseIds: Array.isArray(data.laterCourseIds)
      ? (data.laterCourseIds as string[]).filter((id) => getCourse(id))
      : [],
    plan,
    tasksDone,
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(data.startDate)) ? String(data.startDate) : new Date().toISOString().slice(0, 10),
    note: String(data.note || ""),
    source: data.source === "ai" || data.source === "manual" ? data.source : "rules",
    summary: String(data.summary || ""),
    reasons: Array.isArray(data.reasons)
      ? (data.reasons as Record<string, unknown>[])
          .filter((r) => r && typeof r.courseId === "string")
          .map((r) => ({ courseId: String(r.courseId), reason: String(r.reason || "") }))
      : [],
    status: data.status === "published" ? "published" : "draft",
    version: Number(data.version) || (data.status === "published" ? 1 : 0),
    changeNote: String(data.changeNote || ""),
    unpublishedChanges: data.unpublishedChanges === true,
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
    publishedAt: (data.publishedAt as string) || null,
  };
}

export async function getSyllabus(email: string): Promise<Syllabus | null> {
  const id = email.trim().toLowerCase();
  const snap = await getDb().collection(SYLLABI).doc(id).get();
  return snap.exists ? readSyllabus(id, snap.data() || {}) : null;
}

export async function saveSyllabus(
  email: string,
  patch: Partial<Omit<Syllabus, "email" | "createdAt" | "updatedAt">>
): Promise<Syllabus> {
  const id = email.trim().toLowerCase();
  const ref = getDb().collection(SYLLABI).doc(id);
  const now = new Date().toISOString();
  const existing = await ref.get();
  await ref.set(
    {
      ...patch,
      email: id,
      updatedAt: now,
      ...(existing.exists ? {} : { createdAt: now }),
    },
    { merge: true }
  );
  return (await getSyllabus(id))!;
}

export async function deleteSyllabus(email: string): Promise<void> {
  await getDb().collection(SYLLABI).doc(email.trim().toLowerCase()).delete();
}

export interface SyllabusVersion {
  version: number;
  publishedAt: string;
  changeNote: string;
  startDate: string;
  note: string;
  plan: PlanWeek[];
}

/** Publish the current draft as a new version the client can see. */
export async function publishSyllabus(email: string, changeNote: string): Promise<Syllabus> {
  const id = email.trim().toLowerCase();
  const existing = await getSyllabus(id);
  if (!existing) throw new Error("Plan a syllabus first");
  const plan = effectivePlan(existing);
  const version = existing.version + 1;
  const now = new Date().toISOString();
  await getDb()
    .collection(SYLLABUS_VERSIONS)
    .doc(`${id}__v${version}`)
    .set({ email: id, version, publishedAt: now, changeNote: changeNote.slice(0, 500), startDate: existing.startDate, note: existing.note, plan });
  return saveSyllabus(id, {
    plan,
    status: "published",
    publishedAt: now,
    version,
    changeNote: changeNote.slice(0, 500),
    unpublishedChanges: false,
  });
}

export async function listSyllabusVersions(email: string): Promise<SyllabusVersion[]> {
  const id = email.trim().toLowerCase();
  const snap = await getDb().collection(SYLLABUS_VERSIONS).where("email", "==", id).get();
  return snap.docs
    .map((d) => {
      const data = d.data() || {};
      return {
        version: Number(data.version) || 0,
        publishedAt: String(data.publishedAt || ""),
        changeNote: String(data.changeNote || ""),
        startDate: String(data.startDate || ""),
        note: String(data.note || ""),
        plan: sanitizePlan(data.plan).plan,
      };
    })
    .sort((a, b) => b.version - a.version);
}

/**
 * What the client sees: the last published version. While David has edits
 * he has not published, the client keeps the version they were shown;
 * ticked-off tasks always come from the live doc.
 */
export async function getClientSyllabus(email: string): Promise<Syllabus | null> {
  const syllabus = await getSyllabus(email);
  if (!syllabus || syllabus.status !== "published") return null;
  if (!syllabus.unpublishedChanges || !syllabus.version) return syllabus;
  const id = email.trim().toLowerCase();
  const snap = await getDb().collection(SYLLABUS_VERSIONS).doc(`${id}__v${syllabus.version}`).get();
  if (!snap.exists) return syllabus;
  const v = snap.data() || {};
  return {
    ...syllabus,
    plan: sanitizePlan(v.plan).plan,
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(v.startDate)) ? String(v.startDate) : syllabus.startDate,
    note: String(v.note ?? syllabus.note),
    changeNote: String(v.changeNote ?? syllabus.changeNote),
  };
}

/**
 * Replace the ticked-off tasks. update() swaps the whole map; a merge set
 * would keep keys that were unticked.
 */
export async function saveTasksDone(email: string, tasksDone: Record<string, string>): Promise<Syllabus> {
  const id = email.trim().toLowerCase();
  await getDb().collection(SYLLABI).doc(id).update({ tasksDone, updatedAt: new Date().toISOString() });
  return (await getSyllabus(id))!;
}
