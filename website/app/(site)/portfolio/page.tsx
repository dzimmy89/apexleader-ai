import type { Metadata } from "next";
import { CTAButton } from "@/components/CTAButton";
import { SectionReveal } from "@/components/SectionReveal";
import { FinalCta } from "@/components/editorial/FinalCta";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PORTFOLIO, PORTFOLIO_OWNER_LINE } from "@/content/portfolio";
import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `Businesses ${BRAND.coachName} built and runs with the tools and steps taught in the ${BRAND.name} course.`,
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  const live = PORTFOLIO.filter((b) => b.status !== "building");
  const building = PORTFOLIO.filter((b) => b.status === "building");

  return (
    <>
      <section className="blueprint-grid border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <p className="mono-label">Portfolio</p>
          <h1 className="mt-5 max-w-4xl text-[length:var(--text-display)] text-[var(--color-text)]">
            Businesses built with <span className="signal-text">this exact stack.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-[1.6] text-[var(--color-text-muted)]">
            Each one was built by one person with the tools and steps in the course. Every case study shows what was
            built, which modules built it and which AI tools do the work.
          </p>
          <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-faint)]">
            {PORTFOLIO_OWNER_LINE}
          </p>
        </div>
      </section>

      <SectionReveal>
        <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <p className="section-eyebrow">Running now</p>
          <h2 className="mt-3 text-[length:var(--text-h2)] text-[var(--color-text)]">Live businesses</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {live.map((business) => (
              <li key={business.slug} className="min-w-0">
                <PortfolioCard business={business} />
              </li>
            ))}
          </ul>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="border-y border-[var(--color-border)] bg-[var(--color-panel)]/40">
          <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
            <p className="section-eyebrow">On the bench</p>
            <h2 className="mt-3 text-[length:var(--text-h2)] text-[var(--color-text)]">In progress</h2>
            <p className="mt-4 max-w-2xl font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
              Built or being validated, and most are not public yet. Shown so you can see the early modules at work.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {building.map((business) => (
                <li key={business.slug} className="min-w-0">
                  <PortfolioCard business={business} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </SectionReveal>

      <section className="mx-auto max-w-6xl px-6 pt-[var(--space-section)]">
        <p className="max-w-3xl font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-faint)]">
          These are the founder&apos;s own businesses, not client results. We describe what was built and how, and show a
          figure only where we can back it with a date and a source. Your results depend on your business and how you
          apply the course.
        </p>
      </section>

      <FinalCta title="Build yours the same way." intro="Start with Module 1 free, or book a call to plan your build.">
        <CTAButton href="/university" size="lg" track="internal" location="portfolio_final_start">
          Start Module 1 free
        </CTAButton>
        <CTAButton href={URLS.coachingDiscovery} variant="ghost" size="lg" location="portfolio_final_call">
          Book a free call
        </CTAButton>
      </FinalCta>
    </>
  );
}
