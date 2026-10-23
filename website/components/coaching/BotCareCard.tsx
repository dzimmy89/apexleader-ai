"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Notice } from "@/components/system";
import { URLS } from "@/content/site";

export interface BotCareCardData {
  name: string;
  priceDisplay: string;
  tagline: string;
  eligibility: string;
  features: readonly string[];
  terms: string;
}

/**
 * The monthly Bot Care plan beside the packages. Checkout asks for the email
 * the client coaches with; until the Stripe price is set it points to a call.
 */
export function BotCareCard({
  plan,
  checkoutOpen,
  started = false,
}: {
  plan: BotCareCardData;
  checkoutOpen: boolean;
  started?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/coaching/bot-care/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout could not start. Try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout could not start. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="panel grid gap-8 p-6 md:grid-cols-12 md:p-8">
      <div className="md:col-span-7">
        <p className="ui-label">Monthly plan</p>
        <h3 className="mt-2 text-[1.625rem]">{plan.name}</h3>
        <p className="mt-1 font-[family-name:var(--font-ui)] text-[15px] leading-snug text-[var(--color-text-muted)]">
          {plan.tagline}
        </p>
        <ul className="mt-6 space-y-2.5 font-[family-name:var(--font-ui)] text-[15px] leading-snug">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 md:col-span-5">
        <p className="stat">
          <span className="stat-value text-[2.5rem] tabular-nums">{plan.priceDisplay}</span>
          <span className="stat-label">per month</span>
        </p>
        <p className="font-[family-name:var(--font-ui)] text-[15px] leading-snug text-[var(--color-text)]">
          {plan.eligibility}
        </p>

        {started ? (
          <Notice tone="success" title={`${plan.name} is on.`}>
            Your first monthly review will be booked with you by email.
          </Notice>
        ) : checkoutOpen ? (
          <form onSubmit={(e) => void startCheckout(e)} className="flex flex-col gap-3">
            <label htmlFor="bot-care-email" className="ui-label">
              The email you coach with
            </label>
            <input
              id="bot-care-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@yourbusiness.com"
            />
            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              {busy ? "Opening checkout" : `Start ${plan.name}`}
            </button>
            {error ? (
              <Notice tone="danger" role="alert">
                {error}
              </Notice>
            ) : null}
          </form>
        ) : (
          <Link href={URLS.coachingDiscovery} className="btn btn-secondary w-full">
            Ask about {plan.name} on a free call
          </Link>
        )}

        <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
          {plan.terms}
        </p>
      </div>
    </div>
  );
}
