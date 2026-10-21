"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, FileSignature, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { RecordDetailLayout } from "@/components/admin/crm/RecordDetailLayout";
import { StageBadge } from "@/components/admin/crm/StageBadge";
import { Button } from "@/components/ui/button";
import type { TimelineEvent } from "@/lib/crm/timeline";
import { cn } from "@/lib/utils";

interface ClientDetail {
  id: string;
  email?: string;
  name?: string;
  packageId?: string;
  packageName?: string;
  planId?: string;
  status?: string;
  sessionsRemaining?: number;
  sessionsTotal?: number;
  paidAt?: string;
  contractSignedAt?: string | null;
  signedContractPdfUrl?: string | null;
  signatureId?: string;
  stripeCustomerId?: string;
}

interface ClientApplication {
  id: string;
  status: string;
  source?: string;
  applicationData?: Record<string, string>;
}

interface DetailResponse {
  mode: "client" | "application";
  email: string;
  client: ClientDetail | null;
  applications: ClientApplication[];
  sessions: { id: string; scheduledAt: string; status: string }[];
  timeline: TimelineEvent[];
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const [clientId, setClientId] = useState<string>("");
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setClientId(decodeURIComponent(p.clientId)));
  }, [params]);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    fetch(`/api/admin/coaching/clients/${encodeURIComponent(clientId)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [clientId]);

  async function triggerContract() {
    if (!data?.client?.packageId) return;
    await fetch("/api/coaching/contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: data.client.id,
        packageId: data.client.packageId,
        planId: data.client.planId || "full",
        signerName: data.client.name || data.client.email || data.client.id,
        signerEmail: data.client.email || data.client.id,
      }),
    });
    toast.success("Contract signing link created and emailed.");
  }

  async function issueMagicLink() {
    if (!data?.client?.id) return;
    const res = await fetch("/api/admin/coaching/portal-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: data.client.id }),
    });
    if (res.ok) toast.success("Portal magic link issued and emailed.");
    else toast.error("Failed to issue portal link");
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>;
  }

  if (!data || "error" in data) {
    return (
      <div>
        <p className="text-sm text-[var(--color-text-muted)]">Record not found.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          render={<Link href="/admin/coaching" />}
        >
          Back to pipeline
        </Button>
      </div>
    );
  }

  const client = data.client;
  const app = data.applications[0];
  const email = data.email;
  const title =
    client?.name || app?.applicationData?.goals || email || clientId;

  const onboardingSteps = [
    {
      label: "Contract sent",
      done: Boolean(client?.signatureId || client?.contractSignedAt),
    },
    {
      label: "Contract signed",
      done: Boolean(client?.contractSignedAt),
    },
    {
      label: "Portal issued",
      done: Boolean(client?.paidAt),
    },
    {
      label: "First session booked",
      done: (data.sessions?.length ?? 0) > 0,
    },
  ];

  const properties = client
    ? [
        { label: "Package", value: client.packageName || client.packageId || "—" },
        { label: "Status", value: client.status || "—" },
        {
          label: "Sessions",
          value: `${client.sessionsRemaining ?? 0} / ${client.sessionsTotal ?? 0}`,
        },
        {
          label: "Contract",
          value: client.contractSignedAt
            ? `Signed ${new Date(client.contractSignedAt).toLocaleDateString()}`
            : "Pending",
        },
        {
          label: "Paid",
          value: client.paidAt ? new Date(client.paidAt).toLocaleDateString() : "—",
        },
      ]
    : [
        { label: "Email", value: email },
        { label: "Stage", value: app ? <StageBadge status={app.status} /> : "—" },
        { label: "Source", value: app?.source || "—" },
        {
          label: "Team size",
          value: app?.applicationData?.capital || "—",
        },
        {
          label: "Goals",
          value: app?.applicationData?.goals || "—",
        },
      ];

  return (
    <RecordDetailLayout
      backHref="/admin/coaching"
      backLabel="Pipeline"
      title={title}
      subtitle={
        <>
          {email}
          {app?.status && <> · </>}
          {app?.status && <StageBadge status={app.status} />}
        </>
      }
      headerActions={
        client ? (
          <>
            {!client.contractSignedAt && (
              <Button variant="outline" size="sm" onClick={triggerContract}>
                <FileSignature size={12} /> Send contract
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={issueMagicLink}>
              <Send size={12} /> Portal link
            </Button>
          </>
        ) : undefined
      }
      banner={
        client && (app?.status === "won" || client.status === "active") ? (
          <div className="rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              Onboarding checklist
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {onboardingSteps.map((step) => (
                <li
                  key={step.label}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    step.done
                      ? "text-[var(--color-positive)]"
                      : "text-[var(--color-text-muted)]"
                  )}
                >
                  {step.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {step.label}
                </li>
              ))}
            </ul>
          </div>
        ) : undefined
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
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            render={<Link href={`/admin/people/${encodeURIComponent(email)}`} />}
          >
            View person record
          </Button>
          {client?.signedContractPdfUrl && client.signatureId && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={
                <a href={`/api/admin/coaching/contracts/${client.signatureId}/pdf`} />
              }
            >
              <ShieldCheck size={12} /> Download contract
            </Button>
          )}
          {client && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href="/admin/coaching/sessions" />}
            >
              Manage sessions
            </Button>
          )}
        </>
      }
    />
  );
}
