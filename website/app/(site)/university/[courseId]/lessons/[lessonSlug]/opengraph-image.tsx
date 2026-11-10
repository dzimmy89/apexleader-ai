import { BRAND } from "@/lib/brand";
import { allLessons, findLesson, getCourse, getCoursesInOrder } from "@/lib/learn/catalog";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `A free ${BRAND.name} lesson`;

/** Every lesson's card is drawn at build time, so X gets it instantly. */
export function generateStaticParams() {
  return getCoursesInOrder().flatMap((course) =>
    allLessons(course).map((lesson) => ({ courseId: course.id, lessonSlug: lesson.slug }))
  );
}

/** The card X shows beside a lesson link: the lesson's name, "free", the time, and who teaches it. */
export default async function Image({ params }: { params: Promise<{ courseId: string; lessonSlug: string }> }) {
  const { courseId, lessonSlug } = await params;
  const course = getCourse(courseId);
  const found = course ? findLesson(course, lessonSlug) : null;
  if (!course || !found) {
    return renderOgImage({ eyebrow: "FREE LESSON", title: `${BRAND.tagline}.`, footer: BRAND.name });
  }
  const { lesson } = found;
  return renderOgImage({
    eyebrow: `FREE LESSON · ${lesson.minutes} MIN READ`,
    title: lesson.title,
    titleSize: lesson.title.length > 34 ? 66 : 80,
    footer: `${course.title} · taught by ${BRAND.coachName}`,
  });
}
