"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PackageCardData } from "@/components/coaching/PackageCard";
import { Notice, Panel } from "@/components/system";
import { URLS } from "@/content/site";
import { trackCoachingCheckoutStart } from "@/lib/gtm";
import { useRadioKeys } from "@/lib/use-radio-keys";

function usd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/** Sans segmented control: one gold-bordered option, arrow keys move the choice. */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
}) {
  const { onKeyDown, register } = useRadioKeys(
    options.map((option) => option.id),
    value,
    onChange
  );
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="segmented"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            ref={register(option.id)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function PayChooser({
  packages,
  initialPackageId,
}: {
  packages: PackageCardData[];
  initialPackageId: string;
}) {
  const initial =
    packages.find((pkg) => pkg.id === initialPackageId)?.id ||
    packages[0]?.id ||
    "foundations";
  const [packageId, setPackageId] = useState(initial);
  const [planId, setPlanId] = useState<"full" | "3pay" | "6pay">("full");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const pkg = packages.find((item) => item.id === packageId) || packages[0];
  const plan = pkg?.paymentPlans.find((item) => item.id === planId) || pkg?.paymentPlans[0];

  const mailto = useMemo(() => {
    if (!pkg || !plan) return `mailto:${URLS.email}`;
    const due =
      plan.installments > 1
        ? `${usd(plan.perPayment)} (${plan.label}, total ${usd(plan.total)})`
        : pkg.priceDisplay;
    const subject = `Invoice for ${pkg.name}`;
    const body = `Name:\nCompany:\nPackage: ${pkg.name}\nSchedule: ${plan.label}\nAmount this payment: ${due}\n`;
    return `mailto:${URLS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [pkg, plan]);

  async function payWithCard() {
    if (!pkg || !plan) return;
    setPayError("");
    setPaying(true);
    trackCoachingCheckoutStart({
      packageId: pkg.id,
      packageName: pkg.name,
      value: pkg.price,
      planId: plan.id,
      location: "coaching_pay_page",
    });
    try {
      const res = await fetch("/api/coaching/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          planId: plan.id,
          email: "",
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setPayError(data.error || "Checkout could not start. Try again.");
        setPaying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setPayError("Checkout could not start. Try again.");
      setPaying(false);
    }
  }

  if (!pkg || !plan) return null;

  const dueToday = plan.installments > 1 ? usd(plan.perPayment) : pkg.priceDisplay;
  const schedule =
    plan.installments > 1
      ? `Then ${usd(plan.perPayment)} each month, stopping after ${plan.installments} payments. Total ${usd(plan.total)}.`
      : `Paid once. Total ${pkg.priceDisplay}.`;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="space-y-2">
          <p className="ui-label">Package</p>
          <Segmented
            label="Coaching package"
            options={packages.map((item) => ({ id: item.id, label: item.name }))}
            value={pkg.id}
            onChange={setPackageId}
          />
        </div>
        <p className="mt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          {pkg.sessionCount} sessions · {pkg.durationWeeks} weeks · {pkg.cadence}
        </p>

        <div className="stat mt-8">
          <span className="stat-value text-[2.5rem] md:text-[3.75rem]">{dueToday}</span>
          <span className="stat-label text-[length:var(--text-ui)]">due today</span>
        </div>
        <p className="mt-3 max-w-xl font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)]">
          {schedule}
        </p>

        <div className="mt-8 space-y-2">
          <p className="ui-label">Payment schedule</p>
          <Segmented
            label="Payment option"
            options={pkg.paymentPlans.map((item) => ({ id: item.id, label: item.label }))}
            value={plan.id}
            onChange={setPlanId}
          />
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => void payWithCard()}
            disabled={paying}
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            {paying ? "Opening checkout" : "Pay with card"}
          </button>
          {payError ? (
            <Notice tone="danger" role="alert" className="mt-3">
              {payError}
            </Notice>
          ) : null}
        </div>

        <p className="mt-6 font-[family-name:var(--font-ui)] text-[15px]">
          <Link
            href="/coaching#packages"
            className="text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
          >
            Back to packages
          </Link>
        </p>
      </div>

      <div className="lg:col-span-5">
        <Panel title="Need an invoice?" bodyClassName="panel-body space-y-4">
          <p className="font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)]">
            If your business pays by bank transfer or needs an invoice first, email us with the package and schedule. We
            send the invoice and mark each payment when it arrives.
          </p>
          <a href={mailto} className="btn btn-secondary w-full sm:w-auto">
            Ask for an invoice
          </a>
        </Panel>
      </div>
    </div>
  );
}
