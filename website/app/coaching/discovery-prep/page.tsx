import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { URLS } from "@/content/site";
import { SectionReveal } from "@/components/SectionReveal";
import { PageHeader, Panel, Row } from "@/components/system";
import {
  getDiscoveryPrepContent,
  resolvePackageContext,
} from "@/lib/coaching/discovery-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discovery Call Prep",
  description:
    "What to prepare before your DeFi University discovery call. Educational only — not financial advice.",
  robots: { index: false },
};

interface PrepPageProps {
  searchParams: Promise<{ packageId?: string }>;
}

export default async function DiscoveryPrepPage({ searchParams }: PrepPageProps) {
  const { packageId } = await searchParams;
  const prep = getDiscoveryPrepContent(packageId);
  const packageContext = await resolvePackageContext(packageId);

  const bookHref = packageId
    ? `${URLS.coachingDiscovery}?packageId=${encodeURIComponent(packageId)}`
    : URLS.coachingDiscovery;

  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-2xl">
        <SectionReveal className="mb-8">
          <PageHeader eyebrow="Discovery call" title={prep.headline} intro={prep.intro} />
        </SectionReveal>

        {packageContext.id && (
          <Panel className="mb-8" title="Your package" bodyClassName="">
            <Row label="Package" value={packageContext.name} />
            {packageContext.priceDisplay ? <Row label="Price" value={packageContext.priceDisplay} /> : null}
            {packageContext.sessionCount > 0 ? (
              <Row
                label="Format"
                value={`${packageContext.sessionCount} sessions over ${packageContext.durationWeeks} weeks`}
              />
            ) : null}
            {packageContext.targetCapital ? (
              <Row label="Typical capital range" value={packageContext.targetCapital} />
            ) : null}
            <p className="px-5 pb-4 pt-1 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
              {packageContext.tagline}
            </p>
          </Panel>
        )}

        <div className="space-y-6">
          <div className="parchment-card p-6 md:p-8">
            <h2 className="panel-title text-on-parchment">What to prepare</h2>
            <p className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-muted-on-parchment">
              Spend a few minutes thinking through these before we meet. No need to write an essay,
              just come ready to talk.
            </p>
            <ul className="mt-5 space-y-3 font-[family-name:var(--font-ui)] text-[15px] text-on-parchment">
              {prep.checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-coaching-ink)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Panel title="What we'll cover on the call">
            <ul className="list-disc space-y-2 pl-5 font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)] marker:text-[var(--color-accent)]">
              {prep.callAgenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href={bookHref} className="btn btn-primary btn-lg">
            {packageContext.id ? "Book your call" : "Schedule a discovery call"}
          </Link>
          <Link
            href="/coaching"
            className="inline-flex min-h-11 items-center font-[family-name:var(--font-ui)] text-[15px] font-medium text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
          >
            View coaching packages
          </Link>
        </div>

        <p className="mt-8 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          Educational only — not financial advice. Questions before your call? Reply to your
          confirmation email.
        </p>
      </div>
    </section>
  );
}
