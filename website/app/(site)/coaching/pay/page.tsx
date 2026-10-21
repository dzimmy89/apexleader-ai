import type { Metadata } from "next";
import { PayChooser } from "@/components/coaching/PayChooser";
import type { PackageCardData } from "@/components/coaching/PackageCard";
import { PageHeader } from "@/components/system";
import { getPackages, type PackageId } from "@/lib/coaching/packages";
import { absoluteUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pay for private coaching",
  description: "Pay for private AI coaching by card, in full or in monthly installments.",
  alternates: { canonical: "/coaching/pay" },
  openGraph: {
    title: "Pay for private coaching",
    description: "Pay for private AI coaching by card, in full or in monthly installments.",
    url: absoluteUrl("/coaching/pay"),
    type: "website",
  },
};

function isPackageId(id: string | undefined): id is PackageId {
  return id === "foundations" || id === "mastery" || id === "institutional";
}

async function loadPackages(): Promise<PackageCardData[]> {
  const packages = await getPackages({ activeOnly: true });
  return packages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    tagline: pkg.tagline,
    price: pkg.price,
    priceDisplay: pkg.priceDisplay,
    durationWeeks: pkg.durationWeeks,
    sessionCount: pkg.sessionCount,
    sessionLengthMins: pkg.sessionLengthMins,
    requiresDiscoveryCall: pkg.requiresDiscoveryCall,
    applicationOnly: pkg.applicationOnly,
    cadence: pkg.cadence,
    features: pkg.features,
    deliverables: pkg.deliverables,
    bestFor: pkg.bestFor,
    badge: pkg.badge,
    paymentPlans: pkg.paymentPlans.map((plan) => ({
      id: plan.id,
      label: plan.label,
      installments: plan.installments,
      perPayment: plan.perPayment,
      total: plan.total,
    })),
  }));
}

export default async function CoachingPayPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const params = await searchParams;
  const packages = await loadPackages();
  const initialPackageId = isPackageId(params.package) ? params.package : "foundations";

  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Private coaching"
          title="Pay for private coaching"
          intro="Pay by card on Stripe, in full or in 3 or 6 monthly payments."
        />
        <PayChooser packages={packages} initialPackageId={initialPackageId} />
        <div className="mt-12 max-w-2xl space-y-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
          <p>Refund terms for each package are in the coaching agreement you sign before sessions begin.</p>
        </div>
      </div>
    </section>
  );
}
