"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildXLessonLink, cleanHandle, isValidHandle, type XLinkMedium } from "@/lib/learn/x-links";

export interface XLinkCourse {
  id: string;
  title: string;
  lessons: { slug: string; number: number; title: string; minutes: number }[];
}

const FIELD =
  "h-10 w-full rounded-md border border-[var(--color-border-muted)] bg-[var(--color-surface-1,#11151f)] px-3 text-sm text-[var(--color-text-on-obsidian)]";
const LABEL = "mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]";

export function XLinkBuilder({ courses, origin }: { courses: XLinkCourse[]; origin: string }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const course = courses.find((c) => c.id === courseId) || courses[0];
  const [lessonSlug, setLessonSlug] = useState(course?.lessons[0]?.slug || "");
  const [handle, setHandle] = useState("");
  const [medium, setMedium] = useState<XLinkMedium>("dm");
  const [copied, setCopied] = useState(false);

  const lesson = course?.lessons.find((l) => l.slug === lessonSlug) || course?.lessons[0];
  const clean = cleanHandle(handle);
  const handleOk = !clean || isValidHandle(clean);
  const link = useMemo(
    () =>
      course && lesson
        ? buildXLessonLink({ origin, courseId: course.id, lessonSlug: lesson.slug, handle: clean, medium })
        : "",
    [origin, course, lesson, clean, medium]
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!course || !lesson) return <p className="text-sm text-[var(--color-text-muted)]">No lessons found.</p>;

  return (
    <div className="max-w-3xl space-y-5 rounded-lg border border-[var(--color-border-muted)] p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="xl-course">
            Course
          </label>
          <select
            id="xl-course"
            className={FIELD}
            value={course.id}
            onChange={(e) => {
              setCourseId(e.target.value);
              const next = courses.find((c) => c.id === e.target.value);
              setLessonSlug(next?.lessons[0]?.slug || "");
            }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="xl-lesson">
            Lesson
          </label>
          <select id="xl-lesson" className={FIELD} value={lesson.slug} onChange={(e) => setLessonSlug(e.target.value)}>
            {course.lessons.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.number}. {l.title} ({l.minutes} min)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="xl-handle">
            Their X handle
          </label>
          <input
            id="xl-handle"
            className={FIELD}
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@handle or profile link"
            autoComplete="off"
          />
          {!handleOk ? <p className="mt-1 text-xs text-red-400">That doesn&apos;t look like an X handle. It is left off the link.</p> : null}
        </div>
        <div>
          <span className={LABEL}>Sent as</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Sent as">
            {(["dm", "reply", "post"] as XLinkMedium[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={medium === m}
                onClick={() => setMedium(m)}
                className={`h-10 flex-1 rounded-md border text-sm ${
                  medium === m
                    ? "border-[var(--color-accent)] text-[var(--color-text-on-obsidian)]"
                    : "border-[var(--color-border-muted)] text-[var(--color-text-muted)]"
                }`}
              >
                {m === "dm" ? "DM" : m === "reply" ? "Reply" : "Post"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <span className={LABEL}>Link</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <code className="min-w-0 flex-1 break-all rounded-md border border-[var(--color-border-muted)] px-3 py-2 text-xs text-[var(--color-text-on-obsidian)]">
            {link}
          </code>
          <Button type="button" onClick={copy} className="shrink-0">
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          X shows the lesson&apos;s card with its title and &ldquo;Free lesson · {lesson.minutes} min read&rdquo;.{" "}
          <a href={link} target="_blank" rel="noreferrer" className="underline">
            Open the lesson
          </a>
        </p>
      </div>
    </div>
  );
}
