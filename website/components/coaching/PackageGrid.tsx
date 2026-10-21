"use client";

import { useState } from "react";
import { PackageCard, type PackageCardData } from "@/components/coaching/PackageCard";
import { PricingToggle } from "@/components/coaching/PricingToggle";

export function PackageGrid({
  packages,
}: {
  packages: PackageCardData[];
}) {
  const has6pay = packages.some((p) =>
    p.paymentPlans.some((plan) => plan.id === "6pay")
  );
  const hasInstallments = packages.some((p) =>
    p.paymentPlans.some((plan) => plan.installments > 1)
  );
  const [plan, setPlan] = useState<"full" | "3pay" | "6pay">("full");

  const highlightedId =
    packages.find((p) => /popular|chosen/i.test(p.badge ?? ""))?.id ||
    packages[Math.floor(packages.length / 2)]?.id;

  return (
    <div>
      {hasInstallments ? (
        <div className="mb-8 flex justify-center">
          <PricingToggle
            value={plan}
            onChange={(v) => setPlan(v)}
            has6pay={has6pay}
          />
        </div>
      ) : null}
      <div data-sticky-guard className="grid gap-5 lg:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            highlighted={pkg.id === highlightedId}
            selectedPlanId={plan}
          />
        ))}
      </div>
      <dl className="mx-auto mt-10 grid max-w-4xl gap-6 font-[family-name:var(--font-ui)] text-[15px] leading-relaxed text-[var(--color-text-muted)] md:grid-cols-2">
        <div>
          <dt className="ui-label text-[var(--color-text)]">Refunds</dt>
          <dd className="mt-1">
            Kickstart and Operator: full refund within 14 days if no session has been held.
            Inner Circle is non-refundable.
          </dd>
        </div>
        <div>
          <dt className="ui-label text-[var(--color-text)]">Rescheduling</dt>
          <dd className="mt-1">
            Reschedule in the client portal with at least 24 hours&apos; notice. Sessions
            cancelled later may be forfeited.
          </dd>
        </div>
      </dl>
      <p className="mx-auto mt-6 max-w-4xl text-center font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
        All packages include a personalized kickoff and async support for the package duration. Educational only — not financial advice.
      </p>
    </div>
  );
}
