"use client";

import { cn } from "@/lib/utils";
import type { SmartViewId } from "@/lib/crm/pipeline-utils";

const VIEWS: { id: SmartViewId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "overdue", label: "Overdue" },
  { id: "discovery_week", label: "Discovery this week" },
  { id: "proposal_stale", label: "Proposal stale" },
  { id: "new_7d", label: "New (7d)" },
];

interface SmartViewTabsProps {
  value: SmartViewId;
  onChange: (view: SmartViewId) => void;
  counts?: Partial<Record<SmartViewId, number>>;
  className?: string;
}

export function SmartViewTabs({ value, onChange, counts, className }: SmartViewTabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {VIEWS.map((view) => {
        const active = value === view.id;
        const count = counts?.[view.id];
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs transition-colors",
              active
                ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-panel)] hover:text-[var(--color-text-on-obsidian)]"
            )}
          >
            {view.label}
            {count !== undefined && count > 0 && (
              <span className="ml-1 font-mono opacity-70">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { VIEWS };
