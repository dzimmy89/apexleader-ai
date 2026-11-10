"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RecordDetailLayout } from "@/components/admin/crm/RecordDetailLayout";
import { StageBadge } from "@/components/admin/crm/StageBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TimelineEvent } from "@/lib/crm/timeline";
import { formatPhone } from "@/lib/phone";

interface PersonData {
  email: string;
  lead: Record<string, unknown> | null;
  member: Record<string, unknown> | null;
  applications: Record<string, unknown>[];
  clients: Record<string, unknown>[];
  flows: Record<string, unknown>[];
  timeline: TimelineEvent[];
}

export default function PersonDetailPage() {
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  const [data, setData] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/subscribers/${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email]);

  if (loading) {
    return <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-400">Failed to load person.</p>;
  }

  const app = data.applications?.[0] as Record<string, unknown> | undefined;
  const client = data.clients?.[0] as Record<string, unknown> | undefined;
  const lead = data.lead;
  const member = data.member;
  const name =
    (lead?.name as string) ||
    (member?.name as string) ||
    (app?.name as string) ||
    email;
  const source =
    (lead?.source as string) ||
    (app?.source as string) ||
    undefined;

  const properties = [
    { label: "Email", value: email },
    {
      label: "Type",
      value: (
        <div className="flex flex-wrap gap-1">
          {lead && <Badge variant="secondary">Lead</Badge>}
          {member && <Badge variant="outline">Member</Badge>}
          {app && <StageBadge status={(app.status as string) || "applied"} />}
          {client && <Badge>Client</Badge>}
        </div>
      ),
    },
    { label: "Source", value: source },
    {
      label: "Mobile",
      value: lead?.phone
        ? `${formatPhone(String(lead.phone))} · ${
            (lead.smsConsent as { given?: boolean } | undefined)?.given ? "texts OK" : "no texts"
          }`
        : "—",
    },
    {
      label: "First lesson",
      value: (lead?.firstLesson as { title?: string } | undefined)?.title || "—",
    },
    {
      label: "Campaign",
      value: (() => {
        const utm = (lead?.lastUtm || lead?.utm) as { source?: string; campaign?: string } | undefined;
        return utm?.source || utm?.campaign ? [utm.source, utm.campaign].filter(Boolean).join(" · ") : "—";
      })(),
    },
    {
      label: "X handle",
      value: (() => {
        const utm = (lead?.lastUtm || lead?.utm) as { source?: string; content?: string } | undefined;
        const handle = utm?.content && /^(x|twitter)$/i.test(utm.source || "") ? utm.content.replace(/^@/, "") : "";
        return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? (
          <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">
            @{handle}
          </a>
        ) : (
          "—"
        );
      })(),
    },
    {
      label: "Landing path",
      value: (lead?.landingPath as string) || "—",
    },
    {
      label: "Email status",
      value: (lead?.status as string) || "legacy",
    },
    {
      label: "Consent",
      value: lead?.consent
        ? String(
            (lead.consent as { confirmedAt?: string; requestedAt?: string })
              .confirmedAt ||
              (lead.consent as { requestedAt?: string }).requestedAt ||
              "—"
          )
        : "—",
    },
    {
      label: "Tier",
      value: (member?.tier as string) || "—",
    },
    {
      label: "Active flows",
      value: data.flows?.filter((f) => f.status === "active").length ?? 0,
    },
    {
      label: "Deal value",
      value:
        typeof app?.closeValue === "number"
          ? `$${(app.closeValue as number).toLocaleString()}`
          : "—",
    },
    {
      label: "Next action",
      value: app?.nextActionAt
        ? new Date(app.nextActionAt as string).toLocaleString()
        : "—",
    },
  ];

  return (
    <RecordDetailLayout
      backHref="/admin/people"
      backLabel="People"
      title={name}
      subtitle={
        <>
          {email}
          {source && <> · source: {source}</>}
        </>
      }
      badges={
        app?.status ? <StageBadge status={app.status as string} /> : undefined
      }
      timeline={data.timeline || []}
      properties={properties}
      propertyActions={
        <>
          <Button
            size="sm"
            className="w-full"
            render={<Link href={`/admin/contacts/${encodeURIComponent(email)}`} />}
          >
            Open contact page
          </Button>
          {app && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={
                <Link
                  href={`/admin/coaching/${encodeURIComponent(
                    (client?.id as string) || email
                  )}`}
                />
              }
            >
              View in pipeline
            </Button>
          )}
          {client && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={
                <Link
                  href={`/admin/coaching/${encodeURIComponent(client.id as string)}`}
                />
              }
            >
              Open client record
            </Button>
          )}
        </>
      }
    />
  );
}
