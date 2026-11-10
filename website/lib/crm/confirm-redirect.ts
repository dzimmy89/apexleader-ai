import { findLesson, getCourse } from "@/lib/learn/catalog";

/**
 * Where a confirm click lands: the exercise of the lesson the lead came in
 * through (that is what the confirm email promises), else the lesson, else
 * the course library. A lead with no mobile yet lands on the lesson's form
 * at step two instead, because exercises open with email and mobile.
 * Pure, so it can be tested.
 */
export function confirmLandingPath(
  lastLesson: { courseId?: string; lessonSlug?: string } | null | undefined,
  status: "confirmed" | "expired" | "unknown",
  hasPhone = true
): string {
  const q = status === "confirmed" ? "confirmed=1" : `confirm=${status}`;
  const course = lastLesson?.courseId ? getCourse(lastLesson.courseId) : null;
  const found = course && lastLesson?.lessonSlug ? findLesson(course, lastLesson.lessonSlug) : null;
  if (course && found) {
    if (!hasPhone && found.lesson.exercise) {
      return `/university/${course.id}/lessons/${found.lesson.slug}?${q}#exercise-ask`;
    }
    const path = found.lesson.exercise
      ? `/university/${course.id}/exercises/${found.lesson.exercise}`
      : `/university/${course.id}/lessons/${found.lesson.slug}`;
    return `${path}?${q}`;
  }
  return `/university?${q}`;
}
