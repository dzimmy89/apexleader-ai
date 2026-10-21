"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ContactPackageOption } from "@/lib/crm/contact-detail";

const fieldClass =
  "rounded border border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)] px-2 py-1 text-xs text-[var(--color-text-on-obsidian)]";

/**
 * Fix the plan on a client's crypto payments. The server rebuilds the
 * installment schedule from the payments already logged.
 */
export function ChangePaymentPlanForm({
  email,
  pkg,
  currentPlanId,
  onChanged,
}: {
  email: string;
  pkg: ContactPackageOption;
  currentPlanId: string | null;
  onChanged: () => void;
}) {
  const [planId, setPlanId] = useState(currentPlanId || "full");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(email)}/payment-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, planId }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; installmentsPaid?: number };
      if (!res.ok) {
        toast.error(body.error || "Could not change the plan");
        return;
      }
      toast.success("Plan changed. The schedule was rebuilt from the payments logged.");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
      <label htmlFor="change-plan">Crypto plan for {pkg.name}</label>
      <select id="change-plan" className={fieldClass} value={planId} onChange={(e) => setPlanId(e.target.value)}>
        {pkg.plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
            {p.installments > 1 ? ` of $${p.perPayment.toLocaleString("en-US")}` : ""}
          </option>
        ))}
      </select>
      <Button size="xs" variant="outline" disabled={busy || planId === (currentPlanId || "full")} onClick={() => void save()}>
        {busy ? "Saving…" : "Change plan"}
      </Button>
    </div>
  );
}
