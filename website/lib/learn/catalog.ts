import catalogJson from "@/content/learn/catalog.json";

/**
 * The Learn catalog imported from TheNode-University by
 * scripts/import-learn-courses.ts. Pure data, safe on client and server.
 */
export interface LearnLesson {
  number: number;
  title: string;
  slug: string;
  minutes: number;
  exercise: string | null;
  exerciseMinutes: number;
}

export interface LearnModule {
  number: number;
  title: string;
  quiz: string | null;
  lessons: LearnLesson[];
}

export interface LearnCourse {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedHours: number;
  lessonCount: number;
  stageId: string;
  stageNumber: number;
  modules: LearnModule[];
}

export interface LearnStage {
  id: string;
  number: number;
  title: string;
  blurb: string;
  level: "beginner" | "intermediate" | "advanced";
  courseIds: string[];
}

interface Catalog {
  source: { repo: string; branch: string; commit: string };
  stages: LearnStage[];
  courses: Record<string, LearnCourse>;
}

const catalog = catalogJson as unknown as Catalog;

/** Stage 1 is free with a sign-in; every later stage needs the membership. */
export const FREE_STAGE_IDS = new Set(["foundations"]);

export function getStages(): LearnStage[] {
  return catalog.stages;
}

export function getStage(id: string): LearnStage | null {
  return catalog.stages.find((s) => s.id === id) ?? null;
}

export function getCourse(id: string): LearnCourse | null {
  return catalog.courses[id] ?? null;
}

export function getCoursesInOrder(): LearnCourse[] {
  return catalog.stages.flatMap((s) => s.courseIds.map((id) => catalog.courses[id]!).filter(Boolean));
}

export function getCatalogSource() {
  return catalog.source;
}

export function isFreeCourse(course: LearnCourse): boolean {
  return FREE_STAGE_IDS.has(course.stageId);
}

export function allLessons(course: LearnCourse): (LearnLesson & { module: number })[] {
  return course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.number })));
}

export function findLesson(course: LearnCourse, slug: string) {
  const lessons = allLessons(course);
  const index = lessons.findIndex((l) => l.slug === slug);
  if (index < 0) return null;
  return { lesson: lessons[index]!, prev: lessons[index - 1] ?? null, next: lessons[index + 1] ?? null };
}

export function findLessonByExercise(course: LearnCourse, exerciseSlug: string) {
  return allLessons(course).find((l) => l.exercise === exerciseSlug) ?? null;
}

export function findModuleByQuiz(course: LearnCourse, quizId: string): LearnModule | null {
  return course.modules.find((m) => m.quiz === quizId) ?? null;
}

/** Old site slugs were lesson-NN-<old title>; send them to the lesson with the same number. */
export function lessonByLegacySlug(course: LearnCourse, slug: string): LearnLesson | null {
  const match = slug.match(/^lesson-(\d+)-/);
  if (!match) return null;
  const n = Number(match[1]);
  return allLessons(course).find((l) => l.number === n) ?? null;
}

export type OutlineKind = "lesson" | "exercise" | "quiz";

export interface OutlineItem {
  kind: OutlineKind;
  slug: string;
  href: string;
  /** Short label shown in the outline: the lesson title, "Exercise 3" or "Module 2 quiz". */
  label: string;
  number: number;
  minutes: number;
}

export interface OutlineModule {
  number: number;
  title: string;
  items: OutlineItem[];
}

/** The course in reading order: each lesson, then its exercise, then the module quiz. */
export function courseOutline(course: LearnCourse): OutlineModule[] {
  const base = `/university/${course.id}`;
  return course.modules.map((m) => {
    const items: OutlineItem[] = [];
    for (const l of m.lessons) {
      items.push({ kind: "lesson", slug: l.slug, href: `${base}/lessons/${l.slug}`, label: l.title, number: l.number, minutes: l.minutes });
      if (l.exercise) {
        items.push({
          kind: "exercise",
          slug: l.exercise,
          href: `${base}/exercises/${l.exercise}`,
          label: `Exercise ${l.number}`,
          number: l.number,
          minutes: l.exerciseMinutes,
        });
      }
    }
    if (m.quiz) {
      items.push({ kind: "quiz", slug: m.quiz, href: `${base}/quizzes/${m.quiz}`, label: `Module ${m.number} quiz`, number: m.number, minutes: 0 });
    }
    return { number: m.number, title: m.title, items };
  });
}

/** Progress keys shared by the progress store, dashboards and the syllabus. */
export const lessonKey = (courseId: string, slug: string) => `${courseId}/${slug}`;
export const exerciseKey = (courseId: string, slug: string) => `${courseId}/${slug}`;
export const quizKey = (courseId: string, quizId: string) => `${courseId}/${quizId}`;

export const PASSING_QUIZ_SCORE = 70;
