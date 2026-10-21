import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PropertyRow {
  label: string;
  value: ReactNode;
}

interface RecordPropertiesPanelProps {
  title?: string;
  rows: PropertyRow[];
  actions?: ReactNode;
  className?: string;
}

export function RecordPropertiesPanel({
  title = "Properties",
  rows,
  actions,
  className,
}: RecordPropertiesPanelProps) {
  return (
    <aside
      className={cn(
        "rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4",
        className
      )}
    >
      <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </h2>
      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm text-[var(--color-text-on-obsidian)]">
              {row.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
      {actions && <div className="mt-6 flex flex-col gap-2">{actions}</div>}
    </aside>
  );
}
