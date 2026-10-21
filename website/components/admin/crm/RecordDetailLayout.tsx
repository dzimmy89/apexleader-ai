"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityTimeline } from "@/components/admin/crm/ActivityTimeline";
import { RecordPropertiesPanel, type PropertyRow } from "@/components/admin/crm/RecordPropertiesPanel";
import type { TimelineEvent } from "@/lib/crm/timeline";

interface RecordDetailLayoutProps {
  backHref: string;
  backLabel?: string;
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
  headerActions?: ReactNode;
  timeline: TimelineEvent[];
  properties: PropertyRow[];
  propertyActions?: ReactNode;
  banner?: ReactNode;
  timelineFooter?: ReactNode;
  className?: string;
}

export function RecordDetailLayout({
  backHref,
  backLabel = "Back",
  title,
  subtitle,
  badges,
  headerActions,
  timeline,
  properties,
  propertyActions,
  banner,
  timelineFooter,
  className,
}: RecordDetailLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
      >
        <ArrowLeft size={12} /> {backLabel}
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-text-on-obsidian)] sm:text-3xl">
              {title}
            </h1>
            {badges}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>
        {headerActions && (
          <div className="flex flex-wrap items-center gap-2">{headerActions}</div>
        )}
      </div>

      {banner}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Activity
          </h2>
          <ActivityTimeline events={timeline} />
          {timelineFooter}
        </div>
        <RecordPropertiesPanel
          rows={properties}
          actions={propertyActions}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}
