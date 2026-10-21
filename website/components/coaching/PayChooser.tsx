"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type { PackageCardData } from "@/components/coaching/PackageCard";
import { Notice, Panel } from "@/components/system";
import {
  CRYPTO_PAY_PAGE,
  CRYPTO_RECEIVE_ADDRESSES,
  type CryptoNetwork,
} from "@/content/crypto-payments";
import { URLS } from "@/content/site";
import {
  trackCoachingCheckoutStart,
  trackCoachingCryptoAddressCopy,
  trackCoachingCryptoNoticeSubmit,
} from "@/lib/gtm";
import { useRadioKeys } from "@/lib/use-radio-keys";

const NETWORK_LABEL: Record<CryptoNetwork, string> = {
  evm: "Ethereum, Base or Arbitrum",
  solana: "Solana",
  bitcoin: "Bitcoin",
};

function usd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function dueCopy(
  installments: number,
  perPayment: number,
  total: number,
  priceDisplay: string
): string {
  if (installments <= 1) {
    return `Due today ${priceDisplay}. Total ${priceDisplay}.`;
  }
  const due = usd(perPayment);
  return `Due today ${due}. Then ${due} each month. Stops after ${installments} payments. Total ${usd(total)}.`;
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
  const ids = useId();
  const [packageId, setPackageId] = useState(initial);
  const [planId, setPlanId] = useState<"full" | "3pay" | "6pay">("full");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [copied, setCopied] = useState<CryptoNetwork | null>(null);
  const [notice, setNotice] = useState({
    name: "",
    email: "",
    network: "evm" as CryptoNetwork,
    txHash: "",
  });
  const [noticeState, setNoticeState] = useState<"idle" | "sending" | "sent">("idle");
  const [noticeError, setNoticeError] = useState("");

  const pkg = packages.find((item) => item.id === packageId) || packages[0];
  const plan = pkg?.paymentPlans.find((item) => item.id === planId) || pkg?.paymentPlans[0];

  const mailto = useMemo(() => {
    if (!pkg || !plan) return `mailto:${URLS.email}`;
    const due =
      plan.installments > 1
        ? `${usd(plan.perPayment)} (${plan.label}, total ${usd(plan.total)})`
        : pkg.priceDisplay;
    const subject = `Crypto payment ${pkg.name}`;
    const body = `Name:\nPackage: ${pkg.name}\nSchedule: ${plan.label}\nUSD amount this payment: ${due}\nNetwork:\nTx hash:\n`;
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

  async function copyAddress(network: CryptoNetwork, address: string) {
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(address);
      copiedOk = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = address;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      copiedOk = document.execCommand("copy");
      area.remove();
    }
    if (!copiedOk) {
      setCopied(null);
      return;
    }
    setCopied(network);
    if (pkg) {
      trackCoachingCryptoAddressCopy({ network, packageId: pkg.id });
    }
  }

  async function submitNotice(event: React.FormEvent) {
    event.preventDefault();
    if (!pkg) return;
    setNoticeError("");
    setNoticeState("sending");
    try {
      const res = await fetch("/api/coaching/crypto-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: notice.name,
          email: notice.email,
          packageId: pkg.id,
          planId: plan?.id || "full",
          network: notice.network,
          txHash: notice.txHash,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setNoticeError(data.error || "Could not save the notice.");
        setNoticeState("idle");
        return;
      }
      trackCoachingCryptoNoticeSubmit({
        packageId: pkg.id,
        network: notice.network,
      });
      setNoticeState("sent");
    } catch {
      setNoticeError("Could not save the notice.");
      setNoticeState("idle");
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
        <Panel title="Pay in crypto" bodyClassName="panel-body space-y-5">
          <Notice tone="warning">
            These are the only addresses, and only on {CRYPTO_PAY_PAGE}. We do not send a different
            address by email, DM, or support chat.
          </Notice>

          <div className="space-y-2 font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)]">
            <p>{dueCopy(plan.installments, plan.perPayment, plan.total, pkg.priceDisplay)}</p>
            <p className="text-[length:var(--text-small)] text-[var(--color-text-muted)]">
              USDC and USDT count 1:1 with the USD amount due today. For Bitcoin, send that USD
              amount in BTC. You convert it. Other tokens are not credited.
            </p>
            {plan.installments > 1 ? (
              <p className="text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                Send this amount now, then the same amount each month until {plan.installments}{" "}
                payments are in. We track those payments by hand. Submit a notice for each transfer.
              </p>
            ) : null}
          </div>

          <ul className="-mx-5 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {CRYPTO_RECEIVE_ADDRESSES.map((row) => (
              <li
                key={row.network}
                className="px-5 py-4 font-[family-name:var(--font-ui)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                  <div className="min-w-0 flex-1 basis-[12rem]">
                    <p className="flex flex-col items-start gap-1 text-[15px] font-medium text-[var(--color-text)] sm:flex-row sm:items-center sm:gap-2">
                      {NETWORK_LABEL[row.network]}
                      <span className="chip">{row.asset}</span>
                    </p>
                    <p className="mt-1 text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
                      {row.caption}
                    </p>
                    <p className="mt-2 break-all font-[family-name:var(--font-mono)] text-[14px] leading-relaxed text-[var(--color-text)] [font-variant-ligatures:none]">
                      {row.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyAddress(row.network, row.address)}
                    aria-label={`Copy the ${NETWORK_LABEL[row.network]} address`}
                    className="btn btn-secondary btn-sm shrink-0"
                  >
                    {copied === row.network ? "Copied" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
            Compare the first 6 and last 6 characters with this page before you send. Crypto
            transfers cannot be reversed.
          </p>

          <div>
            <h3 className="font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] font-semibold text-[var(--color-text)]">
              Tell us about your transfer
            </h3>
            <p className="mt-1 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
              Submit the tx hash here, or{" "}
              <a
                href={mailto}
                className="text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
              >
                email the tx hash
              </a>
              .
            </p>
          </div>

          {noticeState === "sent" ? (
            <Notice tone="success" title="We got your notice">
              We credit this payment after the transfer is confirmed.
            </Notice>
          ) : (
            <form className="space-y-4" onSubmit={(event) => void submitNotice(event)}>
              <div className="field">
                <label htmlFor={`${ids}-name`}>Name</label>
                <input
                  id={`${ids}-name`}
                  className="input"
                  name="name"
                  autoComplete="name"
                  required
                  value={notice.name}
                  onChange={(event) =>
                    setNotice((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor={`${ids}-email`}>Email</label>
                <input
                  id={`${ids}-email`}
                  className="input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={notice.email}
                  onChange={(event) =>
                    setNotice((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor={`${ids}-network`}>Network</label>
                <select
                  id={`${ids}-network`}
                  className="input"
                  name="network"
                  value={notice.network}
                  onChange={(event) =>
                    setNotice((current) => ({
                      ...current,
                      network: event.target.value as CryptoNetwork,
                    }))
                  }
                >
                  <option value="evm">Ethereum / Base / Arbitrum</option>
                  <option value="solana">Solana</option>
                  <option value="bitcoin">Bitcoin</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor={`${ids}-tx`}>Tx hash</label>
                <input
                  id={`${ids}-tx`}
                  className="input font-[family-name:var(--font-mono)] text-[14px] [font-variant-ligatures:none]"
                  name="txHash"
                  required
                  spellCheck={false}
                  value={notice.txHash}
                  onChange={(event) =>
                    setNotice((current) => ({ ...current, txHash: event.target.value }))
                  }
                />
              </div>
              <button
                type="submit"
                disabled={noticeState === "sending"}
                className="btn btn-secondary w-full sm:w-auto"
              >
                {noticeState === "sending" ? "Sending" : "Submit transfer notice"}
              </button>
              {noticeError ? (
                <Notice tone="danger" role="alert">
                  {noticeError}
                </Notice>
              ) : null}
            </form>
          )}
        </Panel>
      </div>
    </div>
  );
}
