import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { XLinkBuilder, type XLinkCourse } from "@/components/admin/crm/XLinkBuilder";
import { allLessons, getCoursesInOrder } from "@/lib/learn/catalog";
import { SITE_URL } from "@/lib/seo/site-url";

export const metadata = { title: "X links — Mission Control" };

export default function XLinksPage() {
  const courses: XLinkCourse[] = getCoursesInOrder().map((course) => ({
    id: course.id,
    title: course.title,
    lessons: allLessons(course).map((l) => ({ slug: l.slug, number: l.number, title: l.title, minutes: l.minutes })),
  }));
  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="X links"
        description="Pick the lesson that matches what they posted about, type their handle, copy the link into your reply or DM. When they sign up, the handle and campaign show on their record and in the new-lead email."
      />
      <XLinkBuilder courses={courses} origin={SITE_URL} />
    </div>
  );
}
