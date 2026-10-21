"use client";

import { useEffect, useState } from "react";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";

interface Flow {
  id: string;
  email: string;
  flowType: string;
  status: string;
  triggeredAt: string;
  steps?: { stepId: string; sendAt: string; sentAt: string | null }[];
}

export function FlowsTab() {
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    fetch("/api/admin/flows?status=active")
      .then((r) => r.json())
      .then((d) => setFlows(d.flows || []));
  }, []);

  return (
    <div>
      <CrmPageHeader title="Flows" description="Active email automation enrollments." />
      <div className="mt-2 space-y-4">
        {flows.map((f) => (
          <div
            key={f.id}
            className="border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4"
          >
            <p className="font-mono text-sm">
              <span className="text-[var(--color-accent)]">{f.flowType}</span> — {f.email}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {f.status} · {f.triggeredAt}
            </p>
            {f.steps && (
              <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-muted)]">
                {f.steps.map((s) => (
                  <li key={s.stepId}>
                    {s.stepId} — send {s.sendAt}
                    {s.sentAt ? " ✓" : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {flows.length === 0 && (
          <p className="text-[var(--color-text-muted)]">No active flows.</p>
        )}
      </div>
    </div>
  );
}
