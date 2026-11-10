"use client";

import { useId, useState } from "react";
import type { PackageCardData } from "@/components/coaching/PackageCard";
import { Notice, Panel } from "@/components/system";
import {
  CRYPTO_NETWORK_LABEL as NETWORK_LABEL,
  CRYPTO_PAY_PAGES,
  CRYPTO_RECEIVE_ADDRESSES,
  type CryptoNetwork,
} from "@/content/crypto-payments";
import { trackCoachingCryptoAddressCopy, trackCoachingCryptoNoticeSubmit } from "@/lib/gtm";

type Plan = PackageCardData["paymentPlans"][number];

function usd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function dueCopy(plan: Plan, priceDisplay: string): string {
  if (plan.installments <= 1) {
    return `Due today ${priceDisplay}. Total ${priceDisplay}.`;
  }
  const due = usd(plan.perPayment);
  return `Due today ${due}. Then ${due} each month. Stops after ${plan.installments} payments. Total ${usd(plan.total)}.`;
}

function pageHost(url: string): string {
  return url.replace(/^https:\/\//, "");
}

/**
 * Crypto option on /coaching/pay. Addresses come only from
 * content/crypto-payments.ts, which CI checks against pinned copies.
 * A notice is saved unconfirmed; the coach confirms it in the admin after
 * seeing the transfer on chain.
 */
export function CryptoPayPanel({
  pkg,
  plan,
  emailHref,
}: {
  pkg: PackageCardData;
  plan: Plan;
  emailHref: string;
}) {
  const ids = useId();
  const [copied, setCopied] = useState<CryptoNetwork | null>(null);
  const [notice, setNotice] = useState({
    name: "",
    email: "",
    network: "evm" as CryptoNetwork,
    txHash: "",
  });
  const [noticeState, setNoticeState] = useState<"idle" | "sending" | "sent">("idle");
  const [noticeError, setNoticeError] = useState("");

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
    trackCoachingCryptoAddressCopy({ network, packageId: pkg.id });
  }

  async function submitNotice(event: React.FormEvent) {
    event.preventDefault();
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
          planId: plan.id,
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
      trackCoachingCryptoNoticeSubmit({ packageId: pkg.id, network: notice.network });
      setNoticeState("sent");
    } catch {
      setNoticeError("Could not save the notice.");
      setNoticeState("idle");
    }
  }

  const pages = CRYPTO_PAY_PAGES.map(pageHost);

  return (
    <Panel title="Pay in crypto" bodyClassName="panel-body space-y-5">
      <Notice tone="warning">
        These are our only addresses. They appear only on {pages.join(" and on ")}. We never send
        a different address by email, DM, or support chat.
      </Notice>

      <div className="space-y-2 font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)]">
        <p>{dueCopy(plan, pkg.priceDisplay)}</p>
        <p className="text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          USDC and USDT count 1:1 with the USD amount due today. For Bitcoin, send that USD amount
          in BTC. You convert it. Other tokens are not credited.
        </p>
        {plan.installments > 1 ? (
          <p className="text-[length:var(--text-small)] text-[var(--color-text-muted)]">
            Send this amount now, then the same amount each month until {plan.installments}{" "}
            payments are in. Submit a notice for each transfer.
          </p>
        ) : null}
      </div>

      <ul className="-mx-5 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {CRYPTO_RECEIVE_ADDRESSES.map((row) => (
          <li key={row.network} className="px-5 py-4 font-[family-name:var(--font-ui)]">
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
        Compare the first 6 and last 6 characters with this page before you send. Crypto transfers
        cannot be reversed.
      </p>

      <div>
        <h3 className="font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] font-semibold text-[var(--color-text)]">
          Tell us about your transfer
        </h3>
        <p className="mt-1 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          Submit the transaction hash here, or{" "}
          <a
            href={emailHref}
            className="text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
          >
            email it to us
          </a>
          .
        </p>
      </div>

      {noticeState === "sent" ? (
        <Notice tone="success" title="We got your notice">
          We credit this payment once we see the transfer arrive, and then email your coaching
          agreement.
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
              onChange={(event) => setNotice((current) => ({ ...current, name: event.target.value }))}
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
              onChange={(event) => setNotice((current) => ({ ...current, email: event.target.value }))}
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
            <label htmlFor={`${ids}-tx`}>Transaction hash</label>
            <input
              id={`${ids}-tx`}
              className="input font-[family-name:var(--font-mono)] text-[14px] [font-variant-ligatures:none]"
              name="txHash"
              required
              spellCheck={false}
              autoComplete="off"
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
  );
}
