import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { SectionReveal } from "@/components/SectionReveal";
import { AgentCard } from "@/components/brand/AgentCard";
import { FinalCta } from "@/components/editorial/FinalCta";
import { AGENT_TEAM, MODULES, TOOLS, TRACKS } from "@/content/course";
import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const JOURNEY = [
  { step: "Idea", detail: "Research and validate", modules: "Module 2" },
  { step: "Product", detail: "Build it with coding agents", modules: "Modules 3–4" },
  { step: "Customers", detail: "AI marketing and sales", modules: "Modules 5–6" },
  { step: "Revenue", detail: "AI accounting and cash", modules: "Module 7" },
];

export default function HomePage() {
  const heroTeam = [AGENT_TEAM[0], AGENT_TEAM[3], AGENT_TEAM[4]];

  return (
    <>
      <section className="blueprint-grid relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-[var(--space-section)] lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="mono-label">The one-person company course</p>
            <h1 className="mt-5 text-[length:var(--text-display)] text-[var(--color-text)]">
              Your business, <span className="signal-text">staffed by AI.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[length:var(--text-lead)] leading-[1.6] text-[var(--color-text-muted)]">
              Learn to build and run a business on your own with Claude, Claude Duet, OpenAI Dots,
              Grok Bot, Gemini and the coding agents behind them. You make the calls. Your AI team
              does the work.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/course" size="lg" track="internal" location="hero_home_course">
                See the course
              </CTAButton>
              <CTAButton href={URLS.coachingDiscovery} variant="ghost" size="lg" location="hero_home_call">
                Book a free call
              </CTAButton>
            </div>
          </div>

          <div className="relative" aria-label="An example AI team">
            <p className="mono-label mb-4">Today · 3 agents working</p>
            <div className="grid gap-4">
              {heroTeam.map((agent, i) => (
                <div key={agent.role} style={{ marginLeft: `${i * 1.25}rem` }}>
                  <AgentCard agent={agent} status={i === 1 ? "Waiting for your OK" : "Working"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionReveal>
        <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <p className="section-eyebrow">From AI to business</p>
          <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
            One path from an idea to a business that pays you.
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {JOURNEY.map((stage, i) => (
              <li key={stage.step} className="panel relative p-6">
                <span className="mono-label">0{i + 1}</span>
                <h3 className="mt-3 text-2xl text-[var(--color-text)]">
                  {stage.step}
                  {i < JOURNEY.length - 1 ? (
                    <span aria-hidden="true" className="signal-text"> →</span>
                  ) : null}
                </h3>
                <p className="mt-2 font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
                  {stage.detail}
                </p>
                <p className="mono-label mt-4 normal-case tracking-normal">{stage.modules}</p>
              </li>
            ))}
          </ol>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="border-y border-[var(--color-border)] bg-[var(--color-panel)]/40">
          <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
            <p className="section-eyebrow">Your AI team</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-2xl text-[length:var(--text-h2)] text-[var(--color-text)]">
                Six hires. No payroll.
              </h2>
              <p className="max-w-md font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
                Each agent gets one job, the logins it needs and a rule for when it asks you first.
                You finish the course with this team set up and working.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AGENT_TEAM.map((agent) => (
                <AgentCard key={agent.role} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <p className="section-eyebrow">The course</p>
          <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
            Seven modules. Every one ends with something your business keeps.
          </h2>
          <ol className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {MODULES.map((module) => (
              <li
                key={module.number}
                className={`grid gap-3 py-6 md:grid-cols-[4rem_1.2fr_1fr_auto] md:items-baseline md:gap-8 ${TRACKS[module.track].className}`}
              >
                <span className="mono-label">M{module.number}</span>
                <h3 className="text-2xl text-[var(--color-text)]">{module.title}</h3>
                <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                  {module.deliverable}
                </p>
                <span className="track-tag justify-self-start">{TRACKS[module.track].label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Link href="/course" className="btn btn-secondary">
              See every lesson and exercise
            </Link>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="mx-auto max-w-6xl px-6 pb-[var(--space-section)]">
          <p className="section-eyebrow">The toolkit</p>
          <h2 className="mt-3 text-[length:var(--text-h3)] text-[var(--color-text)]">
            Every major AI tool, taught by the job it does for you.
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TOOLS.map((tool) => (
              <li key={tool.name} className="panel p-4">
                <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text)]">
                  {tool.name}
                </p>
                <p className="mono-label mt-1 normal-case tracking-normal">{tool.maker}</p>
                <p className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
                  {tool.job}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="mx-auto max-w-6xl px-6">
          <div className="parchment-card grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
            <div>
              <p className="section-eyebrow">1-on-1 coaching</p>
              <h2 className="mt-3 text-[length:var(--text-h2)]">
                Want {BRAND.coachFirstName} to set up your AI team with you?
              </h2>
              <p className="mt-4 max-w-xl font-[family-name:var(--font-ui)] text-[var(--color-text-muted-on-parchment)]">
                Private coaching takes the course and fits it to your business: weekly sessions, a
                plan built around your goals and a coach who has set these tools up before.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <CTAButton href={URLS.coachingDiscovery} size="lg" surface="parchment" location="home_coaching_call">
                Book a free 30-minute call
              </CTAButton>
              <CTAButton href="/coaching" variant="ghost" surface="parchment" location="home_coaching_more">
                How coaching works
              </CTAButton>
            </div>
          </div>
        </section>
      </SectionReveal>

      <FinalCta
        title={
          <>
            Start your one-person company <span className="signal-text">today.</span>
          </>
        }
        intro="Module 1 is free. Set up your first AI hire in an afternoon."
      >
        <CTAButton href="/university" size="lg" track="internal" location="final_home_start">
          Start Module 1 free
        </CTAButton>
        <CTAButton href="/course" variant="ghost" size="lg" location="final_home_course">
          See the curriculum
        </CTAButton>
      </FinalCta>
    </>
  );
}
