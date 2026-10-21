"use client";

import { useState } from "react";
import { trackCoachingCheckoutStart, trackCoachingPackageClick } from "@/lib/gtm";
import { Check } from "lucide-react";
import Link from "next/link";
import { URLS } from "@/content/site";
import { cn } from "@/lib/utils";

export interface PackageCardData {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceDisplay: string;
  durationWeeks: number;
  sessionCount: number;
  sessionLengthMins: number;
  requiresDiscoveryCall: boolean;
  applicationOnly: boolean;
  cadence: string;
  features: string[];
  deliverables: string[];
  targetCapital: string;
  badge?: string;
  paymentPlans: Array<{
    id: "full" | "3pay" | "6pay";
    label: string;
    installments: number;
    perPayment: number;
    total: number;
  }>;
}

/**
 * One coaching package. A panel (or, when highlighted, the screen's parchment
 * card): name in serif, the price as a big numeral with a small label, the
 * facts in sans, a check list, and ONE button; the other routes are text links.
 */
export function PackageCard({
  pkg,
  highlighted = false,
  selectedPlanId,
}: {
  pkg: PackageCardData;
  highlighted?: boolean;
  selectedPlanId: "full" | "3pay" | "6pay";
}) {
  const plan =
    pkg.paymentPlans.find((p) => p.id === selectedPlanId) || pkg.paymentPlans[0];

  const showPlansAvailable = pkg.paymentPlans.length > 1;
  const splitOptions = pkg.paymentPlans
    .filter((p) => p.installments > 1)
    .map((p) => `${p.installments}`)
    .join(" or ");

  const ctaHref = pkg.applicationOnly
    ? `/coaching/apply?packageId=${pkg.id}`
    : pkg.requiresDiscoveryCall
    ? `${URLS.coachingDiscovery}?packageId=${pkg.id}`
    : `/api/coaching/checkout`;

  const ctaLabel = pkg.applicationOnly
    ? `Apply for ${pkg.name}`
    : pkg.requiresDiscoveryCall
    ? "Book a free 30-minute call"
    : `Enroll in ${pkg.name}`;

  const discoveryHref = `${URLS.coachingDiscovery}?packageId=${pkg.id}`;

  const packageClick = (location: string) =>
    trackCoachingPackageClick(location, {
      packageId: pkg.id,
      packageName: pkg.name,
      value: pkg.price,
    });

  const mutedClass = highlighted
    ? "text-[var(--color-text-muted-on-parchment)]"
    : "text-[var(--color-text-muted)]";
  const buttonClass = cn("btn w-full", highlighted ? "btn-primary" : "btn-secondary");
  const textLinkClass = cn(
    "inline-flex min-h-[44px] w-full items-center justify-center font-[family-name:var(--font-ui)] text-[15px] font-medium underline-offset-4 hover:underline",
    highlighted ? "text-[var(--color-coaching-ink)]" : "text-[var(--color-accent)]"
  );

  const facts: Array<[string, string]> = [
    ["Duration", `${pkg.durationWeeks} weeks`],
    ["Sessions", `${pkg.sessionCount} × ${pkg.sessionLengthMins} min`],
    ["Cadence", pkg.cadence],
    ["Typical capital range", pkg.targetCapital],
  ];

  return (
    <div className={cn("flex flex-col p-6 md:p-7", highlighted ? "parchment-card" : "panel")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[1.625rem]">{pkg.name}</h3>
          <p className={cn("mt-1 font-[family-name:var(--font-ui)] text-[15px] leading-snug", mutedClass)}>
            {pkg.tagline}
          </p>
        </div>
        {pkg.badge ? <span className="chip chip-success shrink-0">{pkg.badge}</span> : null}
      </div>

      <p className="stat mt-6">
        <span
          className={cn(
            "stat-value text-[2.5rem] tabular-nums",
            highlighted && "text-[var(--color-text-on-parchment)]"
          )}
        >
          {plan && plan.installments > 1
            ? `$${plan.perPayment.toLocaleString()}`
            : pkg.priceDisplay}
        </span>
        <span className={cn("stat-label", highlighted && "text-[var(--color-text-muted-on-parchment)]")}>
          {plan && plan.installments > 1
            ? `per month × ${plan.installments} · $${plan.total.toLocaleString()} total · ${plan.label}`
            : showPlansAvailable
            ? `paid in full · or split into ${splitOptions} payments`
            : "paid in full"}
        </span>
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 font-[family-name:var(--font-ui)]">
        {facts.map(([term, value]) => (
          <div key={term}>
            <dt className={cn("text-[length:var(--text-caption)] font-semibold", mutedClass)}>{term}</dt>
            <dd className="mt-0.5 text-[15px] font-medium leading-snug">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 flex-1 space-y-2.5 font-[family-name:var(--font-ui)] text-[15px] leading-snug">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check
              size={16}
              strokeWidth={2.5}
              className={cn(
                "mt-0.5 shrink-0",
                highlighted ? "text-[var(--color-coaching-ink)]" : "text-[var(--color-accent)]"
              )}
              aria-hidden="true"
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col gap-2">
        {pkg.applicationOnly || pkg.requiresDiscoveryCall ? (
          <>
            <Link
              href={ctaHref}
              onClick={() => packageClick("marketing_package_card")}
              className={buttonClass}
            >
              {ctaLabel}
            </Link>
            {/* Keeps the button row level with the cards that carry the "Not sure yet?" line. */}
            <span aria-hidden="true" className={cn(textLinkClass, "invisible")}>
              Not sure yet?
            </span>
          </>
        ) : (
          <>
            <CheckoutButton
              packageId={pkg.id}
              packageName={pkg.name}
              planId={plan?.id ?? "full"}
              value={pkg.price}
              label={ctaLabel}
              fallbackHref={discoveryHref}
              className={buttonClass}
            />
            <Link
              href={discoveryHref}
              onClick={() => packageClick("marketing_package_card_call")}
              className={textLinkClass}
            >
              Not sure yet? Book a free 30-minute call
            </Link>
          </>
        )}
        <Link
          href={`/coaching/pay?package=${pkg.id}`}
          onClick={() =>
            trackCoachingPackageClick("coaching_tiers_pay_link", {
              packageId: pkg.id,
              packageName: pkg.name,
              value: pkg.price,
              planId: plan?.id,
            })
          }
          className={cn(textLinkClass, "text-[14px]")}
        >
          Pay now
        </Link>
      </div>
    </div>
  );
}

function CheckoutButton({
  packageId,
  packageName,
  planId,
  value,
  label,
  fallbackHref,
  className,
}: {
  packageId: string;
  packageName: string;
  planId: "full" | "3pay" | "6pay";
  value: number;
  label: string;
  fallbackHref: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleStart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setStatus("loading");
    trackCoachingCheckoutStart({
      packageId,
      packageName,
      value,
      planId,
    });

    try {
      const res = await fetch("/api/coaching/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          planId,
          email: "",
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleStart}
        disabled={status === "loading"}
        className={className}
      >
        {status === "loading" ? "Opening checkout…" : label}
      </button>
      {status === "error" && (
        <div role="alert" className="notice notice-danger">
          <p>
            Checkout didn&apos;t open. Try again, or{" "}
            <Link href={fallbackHref} className="font-medium underline underline-offset-4">
              book a free call
            </Link>{" "}
            and David will send you a payment link.
          </p>
        </div>
      )}
    </>
  );
}
