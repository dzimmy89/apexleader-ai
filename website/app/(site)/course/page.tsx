import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { FinalCta } from "@/components/editorial/FinalCta";
import { MODULES, TOOLS, TRACKS } from "@/content/course";
import { URLS } from "@/content/site";
import { allLessons, getCourse, getCoursesInOrder, getStage } from "@/lib/learn/catalog";

const LIBRARY = getCoursesInOrder();
const LESSON_COUNT = LIBRARY.reduce((n, c) => n + allLessons(c).length, 0);
const QUIZ_COUNT = LIBRARY.reduce((n, c) => n + c.modules.filter((m) => m.quiz).length, 0);
const TOOL_COURSES = (getStage("tool-mastery")?.courseIds ?? []).map((id) => getCourse(id)!).filter(Boolean);

export const metadata: Metadata = {
  title: "The course",
  description:
    "Fifteen courses on building and running a one-person business with AI: Claude, Claude Duet, OpenAI Dots, Grok Bot, Gemini, Cursor, Codex and GitHub, with full tracks on AI marketing, sales and accounting.",
  alternates: { canonical: "/course" },
};

export default function CoursePage() {
  return (
    <>
      <section className="blueprint-grid border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <p className="mono-label">
            {LIBRARY.length} courses · {LESSON_COUNT} lessons · {LESSON_COUNT} exercises · {QUIZ_COUNT} quizzes
          </p>
          <h1 className="mt-5 max-w-4xl text-[length:var(--text-h1)] text-[var(--color-text)]">
            Build a business on your own, with an <span className="signal-text">AI team</span> doing
            the work.
          </h1>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-[1.6] text-[var(--color-text-muted)]">
            Module 1 sets up your AI team. Eight tool courses teach each tool in depth. Modules 2 to
            4 build the business, and modules 5 to 7 hire the departments that run it: marketing,
            sales and accounting. Every lesson ends with an exercise that leaves your business with
            something real, and every course ends with a quiz.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {Object.values(TRACKS).map((track) => (
              <span key={track.id} className={`track-tag ${track.className}`}>
                {track.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-[var(--space-section)]">
        <p className="section-eyebrow">Tool mastery</p>
        <h2 className="mt-2 max-w-3xl text-[length:var(--text-h3)] text-[var(--color-text)]">
          Learn every tool on its own before you put it to work.
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOL_COURSES.map((course) => (
            <li key={course.id} className="panel p-5">
              <Link href={`/university/${course.id}`} className="font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)]">
                {course.title}
              </Link>
              <p className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                {course.lessonCount} lessons · {course.lessonCount} exercises · quiz
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
        <ol className="grid gap-6">
          {MODULES.map((module) => {
            const track = TRACKS[module.track];
            return (
              <li key={module.number} id={`module-${module.number}`} className={`agent-card ${track.className} p-6 md:p-8`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="mono-label">Module {module.number}</span>
                  <span className="track-tag">{track.label}</span>
                </div>
                <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
                  <div>
                    <h2 className="text-[length:var(--text-h3)] text-[var(--color-text)] md:text-3xl">
                      {module.title}
                    </h2>
                    <p className="mt-3 font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
                      {module.summary}
                    </p>
                    <ol className="mt-5 space-y-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text)]">
                      {module.lessons.map((lesson, i) => (
                        <li key={lesson} className="flex gap-3">
                          <span className="mono-label w-8 shrink-0 normal-case tracking-normal">
                            {module.number}.{i + 1}
                          </span>
                          {lesson}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div>
                      <p className="ui-label">Tools</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {module.tools.map((tool) => (
                          <li key={tool} className="chip">
                            {tool}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                      <p className="ui-label">Exercise · you keep</p>
                      <p className="mt-2 font-[family-name:var(--font-ui)] text-[var(--color-text)]">
                        {module.deliverable}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 panel p-6 md:p-8">
          <p className="section-eyebrow">Capstone</p>
          <h2 className="mt-2 text-[length:var(--text-h3)] text-[var(--color-text)]">
            Run your business for a week from the morning brief.
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
            Your chief of staff agent briefs you each morning, each department agent reports in, and
            you only approve, decide and talk to customers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-[var(--space-section)]">
        <p className="section-eyebrow">Tools covered</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-[length:var(--text-small)]">
            <thead>
              <tr className="border-b border-[var(--color-border-strong)]">
                <th className="ui-label py-3 pr-4">Tool</th>
                <th className="ui-label py-3 pr-4">Made by</th>
                <th className="ui-label py-3">Its job in your business</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((tool) => (
                <tr key={tool.name} className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text)]">
                    <a href={tool.href} target="_blank" rel="noreferrer" className="hover:text-[var(--color-accent)]">
                      {tool.name}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">{tool.maker}</td>
                  <td className="py-3 text-[var(--color-text-muted)]">{tool.job}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-faint)]">
          Tool names are trademarks of their owners. FromAItoBusiness is independent and not affiliated
          with any of them. Products and prices change often; lessons link to each vendor&apos;s
          current plans.
        </p>
      </section>

      <FinalCta
        title="Start with Module 1, free."
        intro="Or book a call and set up your AI team with a coach."
      >
        <CTAButton href="/university" size="lg" track="internal" location="course_final_start">
          Start Module 1 free
        </CTAButton>
        <CTAButton href={URLS.coachingDiscovery} variant="ghost" size="lg" location="course_final_call">
          Book a free call
        </CTAButton>
      </FinalCta>
    </>
  );
}
