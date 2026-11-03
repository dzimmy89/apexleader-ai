import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTAButton } from "@/components/CTAButton";
import { SectionReveal } from "@/components/SectionReveal";
import { AgentCard } from "@/components/brand/AgentCard";
import { FinalCta } from "@/components/editorial/FinalCta";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { MODULES, TRACKS } from "@/content/course";
import {
  PORTFOLIO,
  PORTFOLIO_OWNER_LINE,
  PORTFOLIO_STATUS,
  getPortfolioBusiness,
  portfolioHost,
} from "@/content/portfolio";
import { URLS } from "@/content/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return PORTFOLIO.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = getPortfolioBusiness(slug);
  if (!business) return { title: "Portfolio" };
  return {
    title: `${business.name} | Portfolio`,
    description: business.oneLine,
    alternates: { canonical: `/portfolio/${business.slug}` },
  };
}

export default async function PortfolioCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getPortfolioBusiness(slug);
  if (!business) notFound();

  const status = PORTFOLIO_STATUS[business.status];
  const firstModule = business.modules[0]?.number ?? 1;
  const others = PORTFOLIO.filter((b) => b.slug !== business.slug && b.status !== "building").slice(0, 3);

  return (
    <>
      <section className="blueprint-grid border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <Link href="/portfolio" className="mono-label hover:text-[var(--color-text)]">
            ← Portfolio
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`chip ${status.chip}`}>{status.label}</span>
            {business.url ? (
              <a
                href={business.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-label min-w-0 break-all normal-case tracking-normal text-[var(--color-accent)] hover:underline"
              >
                {portfolioHost(business.url)} ↗
              </a>
            ) : (
              <span className="mono-label normal-case tracking-normal">Not public yet</span>
            )}
          </div>
          <h1 className="mt-5 text-[length:var(--text-display)] text-[var(--color-text)]">{business.name}</h1>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-[1.6] text-[var(--color-text-muted)]">
            {business.oneLine}
          </p>
          <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-faint)]">
            {PORTFOLIO_OWNER_LINE}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-[var(--space-section)] md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-[length:var(--text-body)] leading-[1.7] text-[var(--color-text)]">
          <p className="section-eyebrow">What it is</p>
          {business.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className="panel flex flex-col gap-6 self-start p-6">
          <div>
            <p className="ui-label">Built with</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {business.tools.map((tool) => (
                <li key={tool} className="chip">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ui-label">Runs on</p>
            <p className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
              {business.stack.join(" · ")}
            </p>
          </div>
          <div>
            <p className="ui-label">Next</p>
            <p className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
              {business.next}
            </p>
          </div>
        </aside>
      </section>

      <SectionReveal>
        <section className="border-y border-[var(--color-border)] bg-[var(--color-panel)]/40">
          <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
            <p className="section-eyebrow">The AI team</p>
            <h2 className="mt-3 text-[length:var(--text-h2)] text-[var(--color-text)]">Who does the work</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {business.team.map((agent) => (
                <AgentCard key={`${agent.role}-${agent.tool}`} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
          <p className="section-eyebrow">Module by module</p>
          <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
            How the course built it
          </h2>
          <ol className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {business.modules.map((m) => {
              const courseModule = MODULES.find((x) => x.number === m.number);
              if (!courseModule) return null;
              return (
                <li
                  key={m.number}
                  className={`grid gap-3 py-6 md:grid-cols-[4rem_1fr_1.3fr_auto] md:items-baseline md:gap-8 ${TRACKS[courseModule.track].className}`}
                >
                  <span className="mono-label">M{courseModule.number}</span>
                  <h3 className="text-xl text-[var(--color-text)]">
                    <Link href={`/course#module-${courseModule.number}`} className="hover:text-[var(--color-accent)]">
                      {courseModule.title}
                    </Link>
                  </h3>
                  <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                    {m.built}
                  </p>
                  <span className="track-tag justify-self-start">{TRACKS[courseModule.track].label}</span>
                </li>
              );
            })}
          </ol>
        </section>
      </SectionReveal>

      {business.results.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 pb-[var(--space-section)]">
          <p className="section-eyebrow">Results</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {business.results.map((r) => (
              <div key={r.label} className="panel p-6">
                <dt className="ui-label">{r.label}</dt>
                <dd className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--color-text)] tabular-nums">
                  {r.value}
                </dd>
                <dd className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-faint)]">
                  {r.source}, as of {r.asOf}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-faint)]">
            Individual results vary.
          </p>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6">
          <p className="section-eyebrow">More from the portfolio</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {others.map((b) => (
              <li key={b.slug} className="min-w-0">
                <PortfolioCard business={b} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <FinalCta
        title="Build yours the same way."
        intro={`Start with the module that began ${business.name}, or book a call to plan your own build.`}
      >
        <CTAButton href={`/course#module-${firstModule}`} size="lg" track="internal" location="portfolio_case_module">
          See Module {firstModule}
        </CTAButton>
        <CTAButton href={URLS.coachingDiscovery} variant="ghost" size="lg" location="portfolio_case_call">
          Book a free call
        </CTAButton>
      </FinalCta>
    </>
  );
}
