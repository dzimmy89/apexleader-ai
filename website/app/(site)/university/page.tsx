import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { SectionReveal } from "@/components/SectionReveal";
import { TrackedLink } from "@/components/TrackedLink";
import { Chip, PageHeader } from "@/components/system";
import { membershipPlan, SKOOL_TRIAL_DAYS, URLS } from "@/content/site";
import { getCourse, getStages, FREE_STAGE_IDS } from "@/lib/learn/catalog";

export const metadata: Metadata = {
  title: "University",
  alternates: { canonical: "/university" },
  description:
    "31 DeFi University courses in eight stages, from money basics to DeFi yield, trading and quant. Stage 1 is free with an email; the membership opens the rest.",
};

const LEVEL: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

function hours(n: number): string {
  return `${n} ${n === 1 ? "hour" : "hours"}`;
}

// Static on purpose (CI checks it): progress lives on /account
// and each course page.
export default function UniversityPage() {
  const stages = getStages();
  const courseCount = stages.reduce((n, s) => n + s.courseIds.length, 0);
  const firstCourseId = stages[0]?.courseIds[0] ?? "";

  return (
    <section className="px-6 pb-[var(--space-section)] pt-16 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Course library"
          title="DeFi University Courses"
          intro={`${courseCount} courses in eight stages, each lesson with an exercise and each module with a quiz. Stage 1 is free with your email. The membership opens every stage.`}
          action={
            <>
              <TrackedLink href={`/university/${firstCourseId}`} location="university_start" className="btn btn-primary">
                Start with Stage 1
              </TrackedLink>
              <Link href="/login?next=/university" className="btn btn-secondary">
                Sign in
              </Link>
            </>
          }
        />
        <p className="mt-6 max-w-2xl font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          Sign in to open the courses and save your progress. Skool members: use your Skool email.
        </p>

        <div className="mt-16 space-y-20">
          {stages.map((stage) => {
            const free = FREE_STAGE_IDS.has(stage.id);
            const headingId = `stage-${stage.id}`;
            return (
              <SectionReveal key={stage.id}>
                <section aria-labelledby={headingId}>
                  <div className="max-w-2xl">
                    <p className="section-eyebrow">
                      Stage {stage.number} · {LEVEL[stage.level]} · {free ? "Free with sign-in" : "Members"}
                    </p>
                    <h2 id={headingId} className="mt-2 text-[length:var(--text-h2)] leading-[1.08]">
                      {stage.title}
                    </h2>
                    <p className="mt-3 text-[length:var(--text-lead)] leading-[1.55] text-[var(--color-text-muted)]">{stage.blurb}</p>
                  </div>
                  <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stage.courseIds.map((id) => {
                      const course = getCourse(id)!;
                      return (
                        <li key={id} className="flex">
                          <Link
                            href={`/university/${id}`}
                            className="panel group flex w-full flex-col p-6 transition-colors hover:border-[var(--color-border-strong)]"
                          >
                            <h3 className="text-[1.375rem] leading-[1.2] text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
                              <span aria-hidden="true">{course.icon} </span>
                              {course.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
                              {course.description}
                            </p>
                            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
                              <span>
                                {course.lessonCount} lessons · about {hours(course.estimatedHours)}
                              </span>
                              {free ? (
                                <Chip tone="success">Free</Chip>
                              ) : (
                                <Chip>
                                  <Lock size={12} aria-hidden="true" />
                                  Members
                                </Chip>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </SectionReveal>
            );
          })}

          <SectionReveal>
            <div className="parchment-card p-6 md:p-10">
              <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="max-w-2xl">
                  <p className="section-eyebrow">Membership</p>
                  <h2 className="mt-3 text-[length:var(--text-h2)] leading-[1.08] text-on-parchment">
                    Every stage, {membershipPlan.priceDisplay} a month.
                  </h2>
                  <p className="mt-4 text-[length:var(--text-lead)] leading-[1.55] text-muted-on-parchment">
                    {membershipPlan.summary} {SKOOL_TRIAL_DAYS} days free, then {membershipPlan.priceDisplay} a month. Stage 1 stays free
                    with your email.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <CTAButton
                    variant="skool"
                    href={URLS.skoolPlans}
                    external
                    location="university_membership"
                    skoolPlanId={membershipPlan.id}
                    skoolValue={membershipPlan.price}
                  >
                    Start your free week ↗
                  </CTAButton>
                  <Link href="/login?next=/university" className="btn btn-secondary">
                    Already a member? Sign in
                  </Link>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
