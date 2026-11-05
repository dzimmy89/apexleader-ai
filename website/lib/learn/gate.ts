import { getAccountEmail } from "@/lib/account/session";
import { getAccess, type AccessState } from "@/lib/account/access";
import { getReader, type Reader } from "@/lib/learn/reader";
import { isFreeCourse, type LearnCourse } from "@/lib/learn/catalog";

export interface Viewer {
  email: string | null;
  access: AccessState | null;
  /** Someone who left an email and mobile at an exercise gate; may be null. */
  reader?: Reader | null;
}

export async function getViewer(): Promise<Viewer> {
  const [email, reader] = await Promise.all([getAccountEmail(), getReader()]);
  if (!email) return { email: null, access: null, reader };
  const access = await getAccess(email).catch((e) => {
    console.error("[learn/gate] access lookup failed", e);
    return null;
  });
  return { email, access, reader };
}

/**
 * Who may open the whole course: lessons, exercises, quizzes, clips and
 * progress. Free stages need a sign-in; every other stage needs coaching (or
 * a manual grant).
 */
export type CourseLock = "open" | "sign-in" | "members";

export function courseLock(course: LearnCourse, viewer: Viewer): CourseLock {
  if (!viewer.email) return isFreeCourse(course) ? "sign-in" : "members";
  if (isFreeCourse(course)) return "open";
  return viewer.access?.hasCourseAccess ? "open" : "members";
}

/**
 * Lessons are open to read for everyone, so a link from a social post lands
 * on the whole lesson. The exercise is the ask: it opens for anyone who has
 * left an email and mobile at the gate (a reader), as well as for everyone
 * the course is open to.
 */
export type ExerciseLock = "open" | "gate";

export function exerciseLock(course: LearnCourse, viewer: Viewer): ExerciseLock {
  if (courseLock(course, viewer) === "open") return "open";
  return viewer.reader ? "open" : "gate";
}

/** Lesson clips play for readers and for everyone the course is open to. */
export function canPlayClips(course: LearnCourse, viewer: Viewer): boolean {
  return exerciseLock(course, viewer) === "open";
}
