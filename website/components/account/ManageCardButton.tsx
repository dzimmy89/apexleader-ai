"use client";

import { useState } from "react";

/** Opens the Stripe customer portal: update the card, download invoices. */
export function ManageCardButton() {
  const [state, setState] = useState<"idle" | "opening" | "error">("idle");
  const [error, setError] = useState("");

  async function open() {
    setState("opening");
    const res = await fetch("/api/account/billing-portal", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && body.url) {
      window.location.assign(body.url);
      return;
    }
    setError(body.error || "Stripe could not open the billing page. Try again.");
    setState("error");
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={() => void open()} disabled={state === "opening"} className="btn btn-secondary">
        {state === "opening" ? "Opening Stripe…" : "Manage card and invoices"}
      </button>
      {state === "error" ? (
        <p className="text-[14px] text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
