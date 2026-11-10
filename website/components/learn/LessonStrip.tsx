import Image from "next/image";
import Link from "next/link";
import { FOUNDER_PORTRAIT } from "@/components/editorial/PortraitFrame";
import { BRAND } from "@/lib/brand";
import type { LearnCourse } from "@/lib/learn/catalog";

/**
 * One line above a lesson for visitors who did not come through the course
 * library: what this is part of, who teaches it, and what is free. Hidden
 * for people the course is already open to.
 */
export function LessonStrip({ course, lessonNumber }: { course: LearnCourse; lessonNumber: number }) {
  return (
    <div className="-mt-2 mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--color-border)] pb-3 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)] sm:mb-8 sm:pb-4 sm:text-[length:var(--text-small)]">
      <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <Image
          src={FOUNDER_PORTRAIT.src}
          alt=""
          width={32}
          height={32}
          className="size-6 shrink-0 rounded-full object-cover object-top sm:size-8"
        />
        {/* Phones: one line. Wider screens: the full sentence. */}
        <span className="min-w-0 sm:hidden">
          Free lesson ·{" "}
          <Link href={`/university/${course.id}`} className="font-medium text-[var(--color-text)]">
            {course.title}
          </Link>{" "}
          · by <span className="font-medium text-[var(--color-text)]">{BRAND.coachName}</span>
        </span>
        <span className="hidden min-w-0 sm:inline">
          Lesson {lessonNumber} of{" "}
          <Link href={`/university/${course.id}`} className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]">
            {course.title}
          </Link>
          , a {BRAND.name} course · taught by <span className="font-medium text-[var(--color-text)]">{BRAND.coachName}</span>
        </span>
      </span>
      <span className="hidden sm:ml-auto sm:inline">
        {course.lessonCount} lessons · free to read · exercises with your email
      </span>
    </div>
  );
}
