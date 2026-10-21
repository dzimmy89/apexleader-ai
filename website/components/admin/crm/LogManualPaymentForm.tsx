"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactPackageOption } from "@/lib/crm/contact-detail";

const fieldClass =
  "mt-1 block w-full rounded border border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)] px-2 py-1.5 text-sm text-[var(--color-text-on-obsidian)]";

function todayInNewYork(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export interface LogManualPaymentFormProps {
  email: string;
  name: string;
  packages: ContactPackageOption[];
  defaultPackageId?: string | null;
  defaultPlanId?: string | null;
  /** Installment the schedule expects next, when one exists. */
  defaultInstallment?: number | null;
  onLogged?: () => void;
}

/**
 * Log a payment made outside Stripe (bank transfer, wire, outside invoice). The
 * server writes the payment row, grants the package on the first payment,
 * updates the schedule, and moves the pipeline card to won.
 */
export function LogManualPaymentForm({
  email,
  name,
  packages,
  defaultPackageId,
  defaultPlanId,
  defaultInstallment,
  onLogged,
}: LogManualPaymentFormProps) {
  const [packageId, setPackageId] = useState(defaultPackageId || packages[0]?.id || "");
  const [planId, setPlanId] = useState(defaultPlanId || "full");
  const [installment, setInstallment] = useState(String(defaultInstallment || 1));
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(todayInNewYork());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const pkg = packages.find((p) => p.id === packageId);
  const plan = useMemo(() => pkg?.plans.find((p) => p.id === planId), [pkg, planId]);

  useEffect(() => {
    if (plan && !amount) setAmount(String(plan.perPayment));
    // Only prefill an empty amount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(email)}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          packageId,
          planId,
          installmentNumber: plan && plan.installments > 1 ? Number(installment) : 1,
          amountUsd: Number(amount),
          reference: reference.trim() || undefined,
          paidAt,
          note: note.trim() || undefined,
          idempotencyKey,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        created?: boolean;
        emailWarning?: string;
        installmentNumber?: number | null;
      };
      if (!res.ok) {
        setError(data.error || "Could not log payment.");
        return;
      }
      if (data.created === false) {
        toast.message("This payment was already logged.");
      } else {
        toast.success(
          data.installmentNumber && plan && plan.installments > 1
            ? `Payment logged as installment ${data.installmentNumber} of ${plan.installments}.`
            : "Payment logged."
        );
      }
      if (data.emailWarning) toast.message(data.emailWarning);
      setReference("");
      setNote("");
      setAmount("");
      setIdempotencyKey(crypto.randomUUID());
      onLogged?.();
    } catch {
      setError("Could not log payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="text-xs text-[var(--color-text-muted)]">
        Package
        <select className={fieldClass} value={packageId} onChange={(e) => setPackageId(e.target.value)}>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (${p.price.toLocaleString("en-US")})
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-[var(--color-text-muted)]">
        Plan
        <select className={fieldClass} value={planId} onChange={(e) => setPlanId(e.target.value)}>
          {(pkg?.plans || []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
              {p.installments > 1 ? ` of $${p.perPayment.toLocaleString("en-US")}` : ""}
            </option>
          ))}
        </select>
      </label>
      {plan && plan.installments > 1 ? (
        <label className="text-xs text-[var(--color-text-muted)]">
          Installment number
          <select className={fieldClass} value={installment} onChange={(e) => setInstallment(e.target.value)}>
            {Array.from({ length: plan.installments }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} of {plan.installments}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="text-xs text-[var(--color-text-muted)]">
        Amount (USD)
        <Input
          className="mt-1"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="750"
          required
        />
      </label>
      {plan && plan.installments === 1 && Number(amount) > 0 && Number(amount) < plan.total * 0.9 ? (
        <p className="text-xs text-amber-400 sm:col-span-2" role="status">
          This is less than the full price of ${plan.total.toLocaleString("en-US")}. If the client is on
          a payment plan, pick 3 or 6 payments so the next installment shows on Payments due.
        </p>
      ) : null}
      <label className="text-xs text-[var(--color-text-muted)]">
        Date paid
        <Input
          className="mt-1"
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          required
        />
      </label>
      <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
        Reference (optional)
        <Input
          className="mt-1 font-mono"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Bank reference or invoice number"
        />
      </label>
      <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
        Note (optional)
        <Textarea className="mt-1" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {error ? (
        <p className="text-sm text-red-500 sm:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy || !packageId || !amount || !paidAt}>
          {busy ? "Saving…" : "Log payment"}
        </Button>
      </div>
    </form>
  );
}
