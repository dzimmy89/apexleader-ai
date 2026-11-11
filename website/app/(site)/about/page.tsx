import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { NextOpenings } from "@/components/home/NextOpenings";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { TOOLS } from "@/content/course";
import { FOUNDER_NAMED_RESULTS, PORTFOLIO, PORTFOLIO_STATUS } from "@/content/portfolio";
import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `About ${BRAND.coachName}`,
  alternates: { canonical: "/about" },
  description: `${BRAND.coachName} has built businesses since 2007 and now builds and runs them with an AI team from Wyoming. See what he has built and book a free call.`,
};

/**
 * The founder page answers one question for someone who came from a lesson or
 * the homepage: who is this person and has he done it himself? Every fact
 * here came from David (2026-11-11): based in Wyoming, building businesses
 * since 2007, the businesses in the portfolio, the lesson tools used daily,
 * and the three sites he named as results. Nothing else is claimed.
 */

const METHOD = [
  { step: "1", title: "Map the work", body: "We write down how the work in your week gets done today." },
  { step: "2", title: "Hand over one piece", body: "You give one job to an AI agent and we get it working well, with a rule that keeps it safe." },
  { step: "3", title: "Then the next", body: "Each week you add a piece, and I check what you built before you rely on it." },
];

const RULES = [
  "Every session is with me, not an assistant.",
  "I don't promise results I can't measure.",
  "No customer or private data goes into a tool until you've checked how that tool handles it.",
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="section-eyebrow">{children}</p>;
}

export default function AboutPage() {
  const named = FOUNDER_NAMED_RESULTS.map((slug) => PORTFOLIO.find((b) => b.slug === slug)).filter(
    (b): b is NonNullable<typeof b> => Boolean(b)
  );
  const rest = PORTFOLIO.filter((b) => !FOUNDER_NAMED_RESULTS.includes(b.slug));
  const facts = [
    { label: "Based in", value: "Wyoming, USA" },
    { label: "Building businesses since", value: "2007" },
    { label: "Businesses in the portfolio", value: String(PORTFOLIO.length) },
    { label: "AI tools used every day", value: String(TOOLS.length) },
  ];

  return (
    <>
      {/* Who */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-12 md:grid-cols-[1.2fr_0.8fr] md:items-center md:gap-16 md:pb-20 md:pt-20">
          <div>
            <Kicker>About {BRAND.coachName}</Kicker>
            <h1 className="mt-4 text-[length:var(--text-display)] leading-[1.04] text-[var(--color-text)]">
              I&apos;ve built businesses since 2007.{" "}
              <span className="signal-text">Now I build them with an AI team.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[length:var(--text-lead)] leading-[1.6] text-[var(--color-text-muted)]">
              I&apos;m {BRAND.coachFirstName}, based in Wyoming. I use every tool in these lessons every
              day to build and run my own businesses as one person. {BRAND.name} is where I teach what
              works, one owner at a time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton href={`${URLS.coachingDiscovery}?source=about_hero`} size="lg" location="about_hero_call">
                Pick a time for your free call
              </CTAButton>
              <CTAButton href="#built" variant="ghost" size="lg" track="internal" location="about_hero_built">
                See what I&apos;ve built
              </CTAButton>
            </div>
          </div>
          <Image
            src="/images/david-zimmerman-studio.jpg"
            alt={`${BRAND.coachName}, founder of ${BRAND.name}`}
            width={1056}
            height={1320}
            priority
            sizes="(min-width: 768px) 24rem, 70vw"
            className="w-full max-w-[24rem] justify-self-center rounded-[var(--radius-lg)] object-cover md:justify-self-end"
          />
        </div>
      </section>

      {/* The facts */}
      <section className="border-y border-[var(--color-border-muted)]">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-8 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="mono-label">{f.label}</dt>
              <dd className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.375rem,1.1rem+1vw,1.875rem)] font-bold leading-tight text-[var(--color-text)]">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* What he built */}
      <section id="built" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-[var(--space-section)]">
        <Kicker>Proof you can open</Kicker>
        <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
          I don&apos;t teach this from slides. I built these.
        </h2>
        <p className="mt-4 max-w-2xl font-[family-name:var(--font-ui)] text-[length:var(--text-body)] text-[var(--color-text-muted)]">
          Each one was built with the same tools and steps as the lessons, by one person. Open any of
          them, then read how it was put together.
        </p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {named.map((b) => (
            <li key={b.slug}>
              <PortfolioCard business={b} />
            </li>
          ))}
        </ul>

        <h3 className="mono-label mt-12">Also built this way</h3>
        <ul className="mt-4 divide-y divide-[var(--color-border-muted)] border-y border-[var(--color-border-muted)]">
          {rest.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/portfolio/${b.slug}`}
                className="group grid gap-x-6 gap-y-1 py-4 md:grid-cols-[14rem_1fr_auto] md:items-baseline"
              >
                <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                  {b.name}
                </span>
                <span className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                  {b.oneLine}
                </span>
                <span>
                  <span className={`chip shrink-0 ${PORTFOLIO_STATUS[b.status].chip}`}>{PORTFOLIO_STATUS[b.status].label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)]">
          <Link href="/portfolio" className="font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline">
            See the full portfolio
          </Link>
        </p>
      </section>

      {/* Tools */}
      <section className="border-y border-[var(--color-border-muted)] bg-[var(--color-panel)]/40">
        <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <Kicker>What I use every day</Kicker>
          <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
            Every tool in the lessons is one I work in daily.
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <li key={t.name} className="border-t border-[var(--color-border-muted)] pt-4">
                <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text)]">
                  {t.name} <span className="mono-label ml-1 normal-case tracking-normal">{t.maker}</span>
                </p>
                <p className="mt-1 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                  {t.job}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] text-[var(--color-text-muted)]">
            The lessons that teach them are free to read.{" "}
            <Link href="/university" className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-accent)] underline-offset-4">
              Read the free lessons
            </Link>
          </p>
        </div>
      </section>

      {/* How he works with you */}
      <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
        <Kicker>How I work with you</Kicker>
        <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
          One piece of your week at a time.
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {METHOD.map((m) => (
            <li key={m.step} className="panel rounded-[var(--radius-lg)] p-6">
              <p className="mono-label text-[var(--color-accent)]">Step {m.step}</p>
              <h3 className="mt-2 text-xl text-[var(--color-text)]">{m.title}</h3>
              <p className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
                {m.body}
              </p>
            </li>
          ))}
        </ol>
        <ul className="mt-8 grid gap-3 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] text-[var(--color-text)] md:grid-cols-3">
          {RULES.map((r) => (
            <li key={r} className="border-l-2 border-[var(--color-accent)] pl-4">
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* The ask */}
      <section className="mx-auto max-w-6xl px-6 pb-[var(--space-section)]">
        <div className="parchment-card grid gap-8 rounded-[var(--radius-lg)] p-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-12 md:p-12">
          <div>
            <h2 className="text-[length:var(--text-h2)]">Tell me what takes up your week.</h2>
            <p className="mt-4 max-w-xl font-[family-name:var(--font-ui)] text-[length:var(--text-body)] text-[var(--color-text-muted-on-parchment)]">
              Thirty minutes on your business, free. You leave with a written one-page AI plan,
              whether or not you hire me.
            </p>
          </div>
          <NextOpenings days={1} surface="paper" location="about_closer" />
        </div>
      </section>
    </>
  );
}
