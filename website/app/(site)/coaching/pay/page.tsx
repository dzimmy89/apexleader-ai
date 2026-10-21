import type { Metadata } from "next";
import { PayChooser } from "@/components/coaching/PayChooser";
import type { PackageCardData } from "@/components/coaching/PackageCard";
import { PageHeader } from "@/components/system";
import { getPackages, type PackageId } from "@/lib/coaching/packages";
import { absoluteUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pay for private coaching",
  description:
    "Pay for private DeFi coaching: Kickstart $750, Operator $2,500, or Inner Circle $7,500. Card or crypto. Education only, not financial advice.",
  alternates: { canonical: "/coaching/pay" },
  openGraph: {
    title: "Pay for private coaching",
    description:
      "Kickstart $750, Operator $2,500, Inner Circle $7,500. Education-only payment. Not financial advice.",
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
    targetCapital: pkg.targetCapital,
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
          intro="Pay by card, or send crypto to the addresses below. Pay in full, or in 3 or 6 payments; the schedule you pick applies to both."
        />
        <PayChooser packages={packages} initialPackageId={initialPackageId} />
        <div className="mt-12 max-w-2xl space-y-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
          <p>
            Education only. Not financial advice. Not portfolio management. You keep self-custody of
            your assets: this payment is the coaching fee, not a deposit for us to manage.
          </p>
          <p>
            Kickstart and Operator: full refund within 14 days if no session has been held.
            Installment refunds cover payments collected in that window. Inner Circle is
            non-refundable. A crypto refund, when the policy allows one, is manual and returns the
            same asset.
          </p>
        </div>
      </div>
    </section>
  );
}
