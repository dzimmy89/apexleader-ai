import { getAccountEmail } from "@/lib/account/session";
import { getAccess, type AccessState } from "@/lib/account/access";
import { isFreeCourse, type LearnCourse } from "@/lib/learn/catalog";

export interface Viewer {
  email: string | null;
  access: AccessState | null;
}

export async function getViewer(): Promise<Viewer> {
  const email = await getAccountEmail();
  if (!email) return { email: null, access: null };
  const access = await getAccess(email).catch((e) => {
    console.error("[learn/gate] access lookup failed", e);
    return null;
  });
  return { email, access };
}

export type CourseLock = "open" | "sign-in" | "members";

/** Free stages need a sign-in; every other stage needs coaching (or a manual grant). */
export function courseLock(course: LearnCourse, viewer: Viewer): CourseLock {
  if (!viewer.email) return isFreeCourse(course) ? "sign-in" : "members";
  if (isFreeCourse(course)) return "open";
  return viewer.access?.hasCourseAccess ? "open" : "members";
}
