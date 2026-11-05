import Link from "next/link";
import { allLessons, getCourse, getStage, type LearnCourse, type LearnLesson } from "@/lib/learn/catalog";

interface Related {
  href: string;
  label: string;
  title: string;
  minutes: number;
}

/**
 * Three more lessons on the same problem: the ones that follow in this
 * course, then the first lessons of the other courses in the same stage.
 * Every one is open to read, so a visitor who came for one lesson can keep
 * going without an account.
 */
export function relatedLessons(course: LearnCourse, current: LearnLesson, count = 3): Related[] {
  const out: Related[] = [];
  const lessons = allLessons(course);
  const index = lessons.findIndex((l) => l.slug === current.slug);
  for (const l of lessons.slice(index + 1)) {
    if (out.length >= count) break;
    out.push({ href: `/university/${course.id}/lessons/${l.slug}`, label: `${course.title} · ${l.number}`, title: l.title, minutes: l.minutes });
  }
  const stage = getStage(course.stageId);
  if (stage) {
    for (const id of stage.courseIds) {
      if (out.length >= count) break;
      if (id === course.id) continue;
      const other = getCourse(id);
      const first = other ? allLessons(other)[0] : undefined;
      if (!other || !first) continue;
      out.push({ href: `/university/${other.id}/lessons/${first.slug}`, label: `${other.title} · 1`, title: first.title, minutes: first.minutes });
    }
  }
  return out.slice(0, count);
}

export function RelatedLessons({ items }: { items: Related[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-14">
      <p id="related-heading" className="section-eyebrow">
        Same problem, next lessons
      </p>
      <ol className="mt-3 divide-y divide-[var(--color-border)] border-y border-[var(--color-border-strong)]">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 font-[family-name:var(--font-ui)] text-[length:var(--text-small)]"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">{item.title}</span>
                <span className="text-[var(--color-text-muted)]">{item.label}</span>
              </span>
              <span className="mono-label normal-case tracking-normal">{item.minutes} min · open</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
