import type { Metadata } from "next";
import { Check } from "lucide-react";
import Link from "next/link";
import { CalendarPicker } from "@/components/coaching/CalendarPicker";
import { SectionReveal } from "@/components/SectionReveal";
import { PageHeader, Panel } from "@/components/system";
import { getPackage, getPackages } from "@/lib/coaching/packages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Discovery Call",
  description:
    "Schedule a free discovery call with DeFi University to discuss your DeFi coaching goals. Educational only — not financial advice.",
  robots: { index: false },
};

interface BookPageProps {
  searchParams: Promise<{
    packageId?: string;
    discovery?: string;
    source?: string;
  }>;
}

interface PackageContext {
  id: string;
  name: string;
  tagline: string;
  priceDisplay: string;
  durationWeeks: number;
  sessionCount: number;
  targetCapital: string;
}

const CALL_POINTS = [
  "30 minutes on Google Meet",
  "Your goals, your setup, and which package fits",
  "No pressure to buy on the call",
];

function PackageFacts({ pkg }: { pkg: PackageContext }) {
  return (
    <div className="font-[family-name:var(--font-ui)]">
      <p className="ui-label">Package you&apos;re exploring</p>
      <p className="mt-1 text-[15px] font-medium text-[var(--color-text)]">
        {pkg.name} · {pkg.priceDisplay} · {pkg.durationWeeks} weeks · {pkg.sessionCount} sessions
      </p>
      <p className="mt-1 text-[length:var(--text-small)] text-[var(--color-text-muted)]">{pkg.tagline}</p>
      {pkg.targetCapital ? (
        <p className="mt-1 text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          Typical capital range: {pkg.targetCapital}
        </p>
      ) : null}
    </div>
  );
}

export default async function BookDiscoveryCallPage({
  searchParams,
}: BookPageProps) {
  const params = await searchParams;
  const packageId = params.packageId;
  const isDiscovery = params.discovery !== "false";
  const source = params.source || "coaching_book_page";

  let packageContext: PackageContext | null = null;

  if (packageId) {
    const pkg = await getPackage(packageId);
    if (pkg) {
      packageContext = {
        id: pkg.id,
        name: pkg.name,
        tagline: pkg.tagline,
        priceDisplay: pkg.priceDisplay,
        durationWeeks: pkg.durationWeeks,
        sessionCount: pkg.sessionCount,
        targetCapital: pkg.targetCapital,
      };
    }
  }

  const allPackages =
    isDiscovery && !packageContext ? await getPackages({ activeOnly: true }) : [];

  const title = isDiscovery
    ? packageContext
      ? `Schedule your ${packageContext.name} discovery call`
      : "Schedule your discovery call"
    : packageContext
      ? `Book your ${packageContext.name} kickoff`
      : "Schedule your call";

  const intro = packageContext
    ? isDiscovery
      ? `A free 30-minute conversation about the ${packageContext.name} tier: your goals, where you are today, and whether it's the right fit. No pressure, no obligation.`
      : "Pick a time that works for you. A calendar invite with the Google Meet link will be sent to your email."
    : isDiscovery
      ? "A free 30-minute conversation to understand your goals, review where you are, and decide whether private coaching is the right fit. No pressure, no obligation."
      : "Pick a time that works for you. A calendar invite with the Google Meet link will be sent to your email.";

  const eyebrow = isDiscovery
    ? packageContext
      ? `${packageContext.name} discovery call`
      : "Discovery call"
    : "Coaching";

  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-3xl">
        <SectionReveal className="mb-8">
          <PageHeader eyebrow={eyebrow} title={title} intro={intro} />
        </SectionReveal>

        {isDiscovery ? (
          <Panel
            className="mb-6"
            title="What happens on the call"
            footer={packageContext ? <PackageFacts pkg={packageContext} /> : undefined}
          >
            <ul className="space-y-3 font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)]">
              {CALL_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : packageContext ? (
          <Panel className="mb-6" title="Your package">
            <PackageFacts pkg={packageContext} />
          </Panel>
        ) : null}

        {allPackages.length > 0 && (
          <div className="mb-6">
            <p className="ui-label">Considering a package? Optional.</p>
            <div
              role="group"
              aria-label="Considering a package? Optional."
              className="segmented mt-2"
            >
              {allPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/coaching/book?packageId=${pkg.id}`}
                  aria-current={pkg.id === packageId ? "true" : undefined}
                >
                  <span>{pkg.name}</span>
                  <span className="text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
                    {pkg.priceDisplay}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <CalendarPicker
          packageId={packageId}
          packageContext={packageContext}
          source={source}
          defaultDurationMins={30}
        />

        <p className="mt-6 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          Bookings require 24 hours notice. Times show in your timezone once you pick a day. Educational
          only — not financial advice.
        </p>
      </div>
    </section>
  );
}
