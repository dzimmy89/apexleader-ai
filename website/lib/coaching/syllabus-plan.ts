import {
  exerciseKey,
  findLesson,
  findLessonByExercise,
  findModuleByQuiz,
  getCourse,
  getStages,
  lessonKey,
  quizKey,
  PASSING_QUIZ_SCORE,
  PREREQS,
} from "@/lib/learn/catalog";
import type { LearnProgress } from "@/lib/learn/progress";

/**
 * The week by week plan stored on a syllabus. Pure functions only, so the
 * admin editor, the client's account and the tests share one set of rules.
 *
 * Catalog items (lessons, exercises, quizzes) point at the course library
 * and are done when the client's learn_progress says so. Tasks are David's
 * own steps that are not in the library; milestones mark the end of a phase.
 * Both are ticked off in the syllabus's tasksDone map, and a milestone also
 * counts as reached once everything before it is done.
 */
export type PlanItemKind = "lesson" | "exercise" | "quiz" | "task" | "milestone";

export interface PlanItem {
  id: string;
  kind: PlanItemKind;
  /** Catalog items only. */
  courseId: string | null;
  /** Lesson slug, exercise slug or quiz id. */
  slug: string | null;
  /** Tasks and milestones; catalog items take their title from the catalog. */
  title: string;
  detail: string;
  /** Tasks only; catalog items take minutes from the catalog. */
  minutes: number;
  /** "Already knows it": stays visible but does not count. */
  skipped: boolean;
}

export interface PlanWeek {
  /** One line the client sees at the top of the week. */
  goal: string;
  /** A note to the client for this week. */
  note: string;
  /** What to cover in this week's coaching session. Admin only. */
  sessionPlan: string;
  /** A paused week holds no work and pushes the rest back. */
  paused: boolean;
  items: PlanItem[];
}

export const QUIZ_MINUTES = 10;
export const MAX_WEEKS = 104;
const MAX_ITEMS_PER_WEEK = 80;
const CATALOG_KINDS = new Set<PlanItemKind>(["lesson", "exercise", "quiz"]);

/** Stages each stage assumes; kept in the catalog. */
export { PREREQS };

export function isCatalogKind(kind: PlanItemKind): boolean {
  return CATALOG_KINDS.has(kind);
}

export function catalogItemId(kind: PlanItemKind, courseId: string, slug: string): string {
  return `${kind}:${courseId}/${slug}`;
}

export function newTaskId(kind: "task" | "milestone" = "task"): string {
  return `${kind}:${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function text(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

/** Does this catalog reference exist? */
export function catalogItemExists(kind: PlanItemKind, courseId: string, slug: string): boolean {
  const course = getCourse(courseId);
  if (!course) return false;
  if (kind === "lesson") return Boolean(findLesson(course, slug));
  if (kind === "exercise") return Boolean(findLessonByExercise(course, slug));
  if (kind === "quiz") return Boolean(findModuleByQuiz(course, slug));
  return false;
}

/**
 * Clean a plan that came from the editor, Claude or Firestore: unknown
 * catalog references are dropped, each catalog item appears once, every
 * item has an id and strings are capped.
 */
export function sanitizePlan(raw: unknown): { plan: PlanWeek[]; dropped: string[] } {
  const dropped: string[] = [];
  const seen = new Set<string>();
  const weeks = Array.isArray(raw) ? raw.slice(0, MAX_WEEKS) : [];
  const plan = weeks.map((w): PlanWeek => {
    const week = (w && typeof w === "object" ? w : {}) as Record<string, unknown>;
    const items: PlanItem[] = [];
    for (const r of (Array.isArray(week.items) ? week.items : []).slice(0, MAX_ITEMS_PER_WEEK)) {
      const it = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
      const kind = String(it.kind || "") as PlanItemKind;
      if (CATALOG_KINDS.has(kind)) {
        const courseId = text(it.courseId, 120);
        const slug = text(it.slug, 200);
        const id = catalogItemId(kind, courseId, slug);
        if (!catalogItemExists(kind, courseId, slug)) {
          dropped.push(`${kind} ${courseId}/${slug}`);
          continue;
        }
        if (seen.has(id)) continue;
        seen.add(id);
        items.push({ id, kind, courseId, slug, title: "", detail: text(it.detail, 600), minutes: 0, skipped: it.skipped === true });
      } else if (kind === "task" || kind === "milestone") {
        const title = text(it.title, 200);
        if (!title) continue;
        let id = text(it.id, 80);
        if (!id.startsWith(`${kind}:`) || seen.has(id)) id = newTaskId(kind);
        seen.add(id);
        const minutes = kind === "task" ? Math.min(600, Math.max(0, Math.round(Number(it.minutes) || 0))) : 0;
        items.push({ id, kind, courseId: null, slug: null, title, detail: text(it.detail, 1200), minutes, skipped: it.skipped === true });
      }
    }
    return {
      goal: text(week.goal, 300),
      note: text(week.note, 2000),
      sessionPlan: text(week.sessionPlan, 2000),
      paused: week.paused === true,
      items,
    };
  });
  return { plan, dropped };
}

export interface ResolvedItem extends PlanItem {
  courseTitle: string;
  href: string | null;
  done: boolean;
}

/** Fill in titles, links and minutes from the catalog. */
export function resolveItem(item: PlanItem, done = false): ResolvedItem {
  if (!item.courseId || !item.slug) return { ...item, courseTitle: "", href: null, done };
  const course = getCourse(item.courseId);
  const courseTitle = course?.title || item.courseId;
  if (course && item.kind === "lesson") {
    const lesson = findLesson(course, item.slug)?.lesson;
    return {
      ...item,
      courseTitle,
      title: lesson?.title || item.slug,
      minutes: lesson?.minutes || 0,
      href: `/university/${course.id}/lessons/${item.slug}`,
      done,
    };
  }
  if (course && item.kind === "exercise") {
    const lesson = findLessonByExercise(course, item.slug);
    return {
      ...item,
      courseTitle,
      title: `Exercise: ${lesson?.title || item.slug}`,
      minutes: lesson?.exerciseMinutes || 0,
      href: `/university/${course.id}/exercises/${item.slug}`,
      done,
    };
  }
  if (course && item.kind === "quiz") {
    const mod = findModuleByQuiz(course, item.slug);
    return {
      ...item,
      courseTitle,
      title: mod ? `Module ${mod.number} quiz: ${mod.title}` : item.slug,
      minutes: QUIZ_MINUTES,
      href: `/university/${course.id}/quizzes/${item.slug}`,
      done,
    };
  }
  return { ...item, courseTitle, href: null, done };
}

export function itemMinutes(item: PlanItem): number {
  return isCatalogKind(item.kind) ? resolveItem(item).minutes : item.minutes;
}

/** The plan items for whole courses, in lesson order: each lesson, its exercise, then the module quiz. */
export function courseItems(courseId: string): PlanItem[] {
  const course = getCourse(courseId);
  if (!course) return [];
  const items: PlanItem[] = [];
  const base = { title: "", detail: "", minutes: 0, skipped: false };
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      items.push({ ...base, id: catalogItemId("lesson", courseId, lesson.slug), kind: "lesson", courseId, slug: lesson.slug });
      if (lesson.exercise) {
        items.push({ ...base, id: catalogItemId("exercise", courseId, lesson.exercise), kind: "exercise", courseId, slug: lesson.exercise });
      }
    }
    if (mod.quiz) items.push({ ...base, id: catalogItemId("quiz", courseId, mod.quiz), kind: "quiz", courseId, slug: mod.quiz });
  }
  return items;
}

/**
 * Pack items into weeks of hoursPerWeek in order. A lesson and its exercise
 * stay in the same week, a week never starts empty, and milestones (no
 * minutes) stay right after the item before them.
 */
export function packWeeks(items: PlanItem[], hoursPerWeek: number): PlanWeek[] {
  const perWeek = Math.max(30, hoursPerWeek * 60);
  const weeks: PlanWeek[] = [];
  let current: PlanWeek | null = null;
  let used = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    let unit = itemMinutes(item);
    const next = items[i + 1];
    const pairsWithNext = item.kind === "lesson" && next?.kind === "exercise" && next.courseId === item.courseId;
    if (pairsWithNext) unit += itemMinutes(next!);
    const startNew = !current || (current.items.length > 0 && item.kind !== "milestone" && used + unit > perWeek);
    if (startNew) {
      current = { goal: "", note: "", sessionPlan: "", paused: false, items: [] };
      weeks.push(current);
      used = 0;
    }
    current!.items.push(item);
    if (pairsWithNext) {
      current!.items.push(next!);
      i++;
    }
    used += unit;
  }
  return weeks;
}

/** A plan from a list of courses (the rule-based planner and old syllabi). */
export function planFromCourses(courseIds: string[], hoursPerWeek: number): PlanWeek[] {
  return packWeeks(courseIds.flatMap(courseItems), hoursPerWeek);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekStart(startDate: string, index: number): string {
  return addDays(startDate, index * 7);
}

export function catalogItemDone(item: PlanItem, progress: LearnProgress | null): boolean {
  if (!progress || !item.courseId || !item.slug) return false;
  if (item.kind === "lesson") return Boolean(progress.lessons[lessonKey(item.courseId, item.slug)]);
  if (item.kind === "exercise") return Boolean(progress.exercises[exerciseKey(item.courseId, item.slug)]);
  if (item.kind === "quiz") return (progress.quizzes[quizKey(item.courseId, item.slug)]?.best ?? 0) >= PASSING_QUIZ_SCORE;
  return false;
}

/** Items that count toward progress: not skipped, not milestones. */
export function counts(item: PlanItem): boolean {
  return !item.skipped && item.kind !== "milestone";
}

export interface PlanStatusWeek {
  number: number;
  /** YYYY-MM-DD */
  starts: string;
  minutes: number;
  goal: string;
  note: string;
  sessionPlan: string;
  paused: boolean;
  items: ResolvedItem[];
  /** Counted items done / counted items. */
  done: number;
  total: number;
}

export type Pace = "not-started" | "ahead" | "on-track" | "behind" | "done";

export interface PlanStatus {
  weeks: PlanStatusWeek[];
  total: number;
  done: number;
  /** 1-based week the calendar is in (0 before the start, weeks+1 after the end). */
  currentWeek: number;
  /** Counted items planned in weeks that have already ended. */
  dueByNow: number;
  /** Counted items not done in weeks that have already ended. */
  overdue: number;
  pace: Pace;
  /** The first unfinished counted item. */
  next: ResolvedItem | null;
  milestones: { id: string; title: string; week: number; done: boolean }[];
}

export function planStatus(
  plan: PlanWeek[],
  startDate: string,
  progress: LearnProgress | null,
  tasksDone: Record<string, string> = {},
  now: Date = new Date()
): PlanStatus {
  // Walk in order so a milestone knows whether everything before it is done.
  let allBeforeDone = true;
  const weeks: PlanStatusWeek[] = plan.map((w, index) => {
    const items = w.items.map((item) => {
      let done: boolean;
      if (item.kind === "milestone") done = Boolean(tasksDone[item.id]) || allBeforeDone;
      else if (item.kind === "task") done = Boolean(tasksDone[item.id]);
      else done = catalogItemDone(item, progress);
      if (counts(item) && !done) allBeforeDone = false;
      return resolveItem(item, done);
    });
    const counted = items.filter(counts);
    return {
      number: index + 1,
      starts: weekStart(startDate, index),
      minutes: counted.reduce((n, i) => n + i.minutes, 0),
      goal: w.goal,
      note: w.note,
      sessionPlan: w.sessionPlan,
      paused: w.paused,
      items,
      done: counted.filter((i) => i.done).length,
      total: counted.length,
    };
  });
  const counted = weeks.flatMap((w) => w.items.filter(counts));
  const done = counted.filter((i) => i.done).length;
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const elapsedDays = Math.floor((now.getTime() - start) / 86_400_000);
  const currentWeek = elapsedDays < 0 ? 0 : Math.min(weeks.length + 1, Math.floor(elapsedDays / 7) + 1);
  const ended = weeks.filter((w) => w.number < currentWeek);
  const dueByNow = ended.reduce((n, w) => n + w.total, 0);
  const overdue = ended.reduce((n, w) => n + (w.total - w.done), 0);
  let pace: Pace;
  if (counted.length > 0 && done === counted.length) pace = "done";
  else if (currentWeek === 0) pace = "not-started";
  else if (done < dueByNow) pace = "behind";
  else if (done > dueByNow + (weeks[currentWeek - 1]?.total ?? 0)) pace = "ahead";
  else pace = "on-track";
  return {
    weeks,
    total: counted.length,
    done,
    currentWeek,
    dueByNow,
    overdue,
    pace,
    next: counted.find((i) => !i.done) ?? null,
    milestones: weeks.flatMap((w) =>
      w.items.filter((i) => i.kind === "milestone").map((i) => ({ id: i.id, title: i.title, week: w.number, done: i.done }))
    ),
  };
}

export const PACE_LABEL: Record<Pace, string> = {
  "not-started": "Starts soon",
  ahead: "Ahead",
  "on-track": "On track",
  behind: "Behind",
  done: "Finished",
};

/** Notes for David: weeks well over the client's hours, and courses that come before their prerequisites. */
export function planWarnings(plan: PlanWeek[], hoursPerWeek: number): string[] {
  const warnings: string[] = [];
  const cap = hoursPerWeek * 60 * 1.15;
  plan.forEach((w, i) => {
    const minutes = w.items.filter(counts).reduce((n, it) => n + itemMinutes(it), 0);
    if (!w.paused && minutes > cap && w.items.filter(counts).length > 1) {
      warnings.push(`Week ${i + 1} is about ${Math.round(minutes / 6) / 10} h, more than ${hoursPerWeek} h a week.`);
    }
  });
  const stageOf = new Map(getStages().flatMap((s) => s.courseIds.map((id) => [id, s] as const)));
  const firstAt = new Map<string, number>();
  const order: string[] = [];
  plan.flatMap((w) => w.items).forEach((it, index) => {
    if (!it.courseId) return;
    const stage = stageOf.get(it.courseId);
    if (stage && !firstAt.has(stage.id)) firstAt.set(stage.id, index);
    if (!order.includes(it.courseId)) order.push(it.courseId);
  });
  for (const [stageId, index] of firstAt) {
    for (const pre of PREREQS[stageId] || []) {
      const preAt = firstAt.get(pre);
      if (preAt !== undefined && preAt > index) {
        const a = getStages().find((s) => s.id === stageId)?.title || stageId;
        const b = getStages().find((s) => s.id === pre)?.title || pre;
        warnings.push(`${a} starts before ${b}, which it builds on.`);
      }
    }
  }
  return warnings;
}

/**
 * Finished items are never lost: anything done in the old plan that the new
 * plan leaves out goes back into the week it was in.
 */
export function keepFinished(oldPlan: PlanWeek[], newPlan: PlanWeek[], isDone: (item: PlanItem) => boolean): PlanWeek[] {
  const kept = newPlan.map((w) => ({ ...w, items: [...w.items] }));
  const present = new Set(kept.flatMap((w) => w.items.map((i) => i.id)));
  oldPlan.forEach((w, index) => {
    for (const item of w.items) {
      if (item.kind === "milestone" || present.has(item.id) || !isDone(item)) continue;
      while (kept.length <= index) kept.push({ goal: "", note: "", sessionPlan: "", paused: false, items: [] });
      kept[index]!.items.push(item);
      present.add(item.id);
    }
  });
  return kept;
}

/** Insert empty paused weeks before week `beforeWeek` (1-based), pushing the rest back. */
export function pausePlan(plan: PlanWeek[], beforeWeek: number, count: number): PlanWeek[] {
  const at = Math.min(plan.length, Math.max(0, beforeWeek - 1));
  const n = Math.min(12, Math.max(1, Math.round(count)));
  const paused = Array.from({ length: n }, (): PlanWeek => ({ goal: "Paused", note: "", sessionPlan: "", paused: true, items: [] }));
  return [...plan.slice(0, at), ...paused, ...plan.slice(at)].slice(0, MAX_WEEKS);
}

/**
 * Re-spread the unfinished work from week `fromWeek` (1-based) on at a new
 * pace. Earlier weeks, paused weeks and finished items stay where they are;
 * week goals and notes stay on their week numbers.
 */
export function respreadPlan(
  plan: PlanWeek[],
  fromWeek: number,
  hoursPerWeek: number,
  isDone: (item: PlanItem) => boolean
): PlanWeek[] {
  const at = Math.min(plan.length, Math.max(0, fromWeek - 1));
  const head = plan.slice(0, at);
  const tail = plan.slice(at);
  const finished = tail.map((w) => ({ ...w, items: w.items.filter((i) => i.kind !== "milestone" && isDone(i)) }));
  const remaining = tail.filter((w) => !w.paused).flatMap((w) => w.items.filter((i) => i.kind === "milestone" || !isDone(i)));
  const packed = packWeeks(remaining, hoursPerWeek);
  const length = Math.max(packed.length, finished.filter((w) => w.items.length || w.paused).length);
  const out: PlanWeek[] = [];
  for (let i = 0; i < length; i++) {
    const old = tail[i];
    out.push({
      goal: old?.goal || "",
      note: old?.note || "",
      sessionPlan: old?.sessionPlan || "",
      paused: false,
      items: [...(finished[i]?.items || []), ...(packed[i]?.items || [])],
    });
  }
  return [...head, ...out].slice(0, MAX_WEEKS);
}

export type PlanOp =
  | { op: "add"; week: number; item: Partial<PlanItem> & { kind: PlanItemKind }; reason?: string }
  | { op: "remove"; itemId: string; reason?: string }
  | { op: "move"; itemId: string; toWeek: number; reason?: string }
  | { op: "skip"; itemId: string; reason?: string }
  | { op: "setGoal"; week: number; goal: string; reason?: string }
  | { op: "addWeeks"; count: number; reason?: string };

/** Apply suggested changes. Finished items are never removed. */
export function applyOps(plan: PlanWeek[], ops: PlanOp[], isDone: (item: PlanItem) => boolean): PlanWeek[] {
  let weeks = plan.map((w) => ({ ...w, items: w.items.map((i) => ({ ...i })) }));
  const ensure = (n: number) => {
    while (weeks.length < Math.min(MAX_WEEKS, n)) weeks.push({ goal: "", note: "", sessionPlan: "", paused: false, items: [] });
  };
  const take = (itemId: string): PlanItem | null => {
    for (const w of weeks) {
      const i = w.items.findIndex((it) => it.id === itemId);
      if (i >= 0) return w.items.splice(i, 1)[0]!;
    }
    return null;
  };
  const find = (itemId: string) => weeks.flatMap((w) => w.items).find((it) => it.id === itemId) ?? null;
  for (const op of ops) {
    if (op.op === "add") {
      const week = Math.min(MAX_WEEKS, Math.max(1, Math.round(op.week)));
      ensure(week);
      const { plan: clean } = sanitizePlan([{ items: [op.item] }]);
      const item = clean[0]?.items[0];
      if (item && !find(item.id)) weeks[week - 1]!.items.push(item);
    } else if (op.op === "remove") {
      const item = find(op.itemId);
      if (item && !(item.kind !== "milestone" && isDone(item))) take(op.itemId);
    } else if (op.op === "move") {
      const week = Math.min(MAX_WEEKS, Math.max(1, Math.round(op.toWeek)));
      const item = take(op.itemId);
      if (item) {
        ensure(week);
        weeks[week - 1]!.items.push(item);
      }
    } else if (op.op === "skip") {
      const item = find(op.itemId);
      if (item) item.skipped = true;
    } else if (op.op === "setGoal") {
      const week = Math.round(op.week);
      if (weeks[week - 1]) weeks[week - 1]!.goal = String(op.goal || "").slice(0, 300);
    } else if (op.op === "addWeeks") {
      ensure(weeks.length + Math.min(12, Math.max(1, Math.round(op.count))));
    }
  }
  weeks = sanitizePlan(weeks).plan;
  return weeks;
}

/** Total minutes of a list of courses, for the rule-based planner. */
export function coursesMinutes(courseIds: string[]): number {
  return courseIds.flatMap(courseItems).reduce((n, i) => n + itemMinutes(i), 0);
}

