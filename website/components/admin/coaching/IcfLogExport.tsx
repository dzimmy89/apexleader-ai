"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function IcfLogExport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const href = `/api/admin/coaching/icf-log${qs.toString() ? `?${qs.toString()}` : ""}`;

  return (
    <div className="border border-[var(--color-border-muted)] p-4">
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-text)]">
        ICF Coaching Log Export
      </h3>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Export completed sessions as a CSV in ICF log format for credentialing
        and renewal.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 min-h-[36px] border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
          />
        </div>
        <div>
          <label className="block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 min-h-[36px] border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
          />
        </div>
        <a
          href={href}
          className="inline-flex min-h-[36px] items-center gap-2 bg-[var(--color-coaching)] px-4 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--color-bg)] hover:brightness-110"
        >
          <Download size={12} /> Download CSV
        </a>
      </div>
    </div>
  );
}
