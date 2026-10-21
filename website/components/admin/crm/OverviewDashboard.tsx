"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { StatCard, StatCardSkeleton } from "@/components/admin/crm/StatCard";
import { StageBadge } from "@/components/admin/crm/StageBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  leadsCount: number;
  membersCount: number;
  activeFlows: number;
  emailsLast7d: number;
  coachingNew: number;
  recentSends?: { id: string; to: string; subject: string; sentAt: string }[];
  overdueApplications?: {
    id: string;
    email: string;
    name?: string;
    nextActionAt?: string;
    status?: string;
  }[];
  discoveryToday?: {
    id: string;
    email: string;
    name?: string;
    discoveryCallAt?: string;
  }[];
  discoveryWeekCount?: number;
  pipelineByStage?: Record<string, { count: number; value: number }>;
}

export function OverviewDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setStats(d);
      })
      .catch(() => setError("Failed to load"));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;

  const cards = stats
    ? [
        { label: "Leads", value: stats.leadsCount, href: "/admin/people" },
        { label: "Members", value: stats.membersCount, href: "/admin/people" },
        { label: "Active flows", value: stats.activeFlows, href: "/admin/email/flows" },
        { label: "Email log rows", value: stats.emailsLast7d, href: "/admin/email/sends" },
        { label: "Coaching (new)", value: stats.coachingNew, href: "/admin/coaching" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <CrmPageHeader
        title="Overview"
        description="Today's priorities and pipeline health at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats
          ? cards.map((c) => (
              <StatCard key={c.label} label={c.label} value={c.value} href={c.href} />
            ))
          : Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-[family-name:var(--font-display)]">
                Overdue follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(stats.overdueApplications?.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">None — you&apos;re caught up.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.overdueApplications?.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/admin/coaching/${encodeURIComponent(a.email)}`}
                        className="flex items-center justify-between text-sm hover:text-[var(--color-accent)]"
                      >
                        <span>{a.name || a.email}</span>
                        {a.status && <StageBadge status={a.status} />}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-[family-name:var(--font-display)]">
                Discovery calls today ({stats.discoveryToday?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(stats.discoveryToday?.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  No discovery calls today. {stats.discoveryWeekCount ?? 0} this week.
                </p>
              ) : (
                <ul className="space-y-2">
                  {stats.discoveryToday?.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/admin/coaching/${encodeURIComponent(a.email)}`}
                        className="flex items-center justify-between text-sm hover:text-[var(--color-accent)]"
                      >
                        <span>{a.name || a.email}</span>
                        <span className="font-mono text-xs text-[var(--color-text-muted)]">
                          {a.discoveryCallAt &&
                            new Date(a.discoveryCallAt).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-[family-name:var(--font-display)]">
                Recent sends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stats.recentSends?.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <Link
                      href={`/admin/people/${encodeURIComponent(s.to)}`}
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      {s.to}
                    </Link>
                    <span className="truncate text-[var(--color-text-muted)]">{s.subject}</span>
                    <span className="font-mono text-xs text-[var(--color-text-muted)]">
                      {s.sentAt ? new Date(s.sentAt).toLocaleString() : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {stats.pipelineByStage && Object.keys(stats.pipelineByStage).length > 0 && (
            <Card className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-[family-name:var(--font-display)]">
                  Pipeline by stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(stats.pipelineByStage).map(([stage, data]) => (
                    <Link
                      key={stage}
                      href="/admin/coaching"
                      className="rounded-md border border-[var(--color-border-muted)] px-3 py-2 text-sm hover:border-[var(--color-accent)]/40"
                    >
                      <StageBadge status={stage} />
                      <span className="ml-2 text-[var(--color-text-muted)]">
                        {data.count}
                        {data.value > 0 && ` · $${data.value.toLocaleString()}`}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
