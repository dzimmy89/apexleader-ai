import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="mb-3 text-[var(--color-text-muted)]">{icon}</div>}
      <p className="font-[family-name:var(--font-display)] text-lg text-[var(--color-text-on-obsidian)]">
        {title}
      </p>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Button render={<Link href={actionHref} />} className="mt-4" size="sm">
          {actionLabel}
        </Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
