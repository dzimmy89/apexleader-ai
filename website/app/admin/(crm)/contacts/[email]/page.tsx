"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Mail } from "lucide-react";
import { toast } from "sonner";
import { ContactClientArea } from "@/components/admin/crm/ContactClientArea";
import { ContactEmailComposer } from "@/components/admin/crm/ContactEmailComposer";
import { ChangePaymentPlanForm } from "@/components/admin/crm/ChangePaymentPlanForm";
import { ContactSessions } from "@/components/admin/crm/ContactSessions";
import { LogCryptoPaymentForm } from "@/components/admin/crm/LogCryptoPaymentForm";
import { RecordDetailLayout } from "@/components/admin/crm/RecordDetailLayout";
import { StageBadge } from "@/components/admin/crm/StageBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ContactDetail } from "@/lib/crm/contact-detail";
import {
  formatDueDate,
  isContactEmailTemplateId,
  type ContactEmailTemplateId,
} from "@/lib/crm/contact-email-templates";
import { cn } from "@/lib/utils";

const BLOCK_COPY: Record<string, string> = {
  do_not_contact: "Do not contact",
  opted_out: "Opted out of email",
  internal: "Internal address",
  suppressed: "On the suppression list",
};

const TABS = ["payments", "log", "sessions", "contracts", "intake", "syllabus", "recordings"] as const;
type ContactTab = (typeof TABS)[number];

function usd(cents: number): string {
  const value = cents / 100;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function todayInNewYork(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function dueTone(dueDate: string, today: string): "overdue" | "soon" | "later" {
  if (dueDate < today) return "overdue";
  const soon = new Date(`${today}T12:00:00Z`);
  soon.setUTCDate(soon.getUTCDate() + 7);
  return dueDate <= soon.toISOString().slice(0, 10) ? "soon" : "later";
}

function shortRef(value: string | null | undefined): string {
  if (!value) return "";
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "danger" | "warning" | "good";
}) {
  return (
    <div className="border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
      <p
        className={cn(
          "mt-1 text-sm text-[var(--color-text-on-obsidian)]",
          tone === "danger" && "text-red-400",
          tone === "warning" && "text-amber-400",
          tone === "good" && "text-[var(--color-skool)]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function ContactPage() {
  const params = useParams();
  const email = decodeURIComponent(params.email as string).trim().toLowerCase();
  const [data, setData] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeTemplate, setComposeTemplate] = useState<ContactEmailTemplateId | null>(null);
  const [tab, setTab] = useState<ContactTab>("payments");
  const [planHint, setPlanHint] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [optOutBusy, setOptOutBusy] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(email)}`);
      const body = (await res.json().catch(() => ({}))) as ContactDetail & { error?: string };
      if (!res.ok) {
        setData(null);
        setLoadError(res.status === 404 ? "No record for this email." : body.error || "Could not load contact.");
        return;
      }
      setData(body);
    } catch {
      setLoadError("Could not load contact.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    void load();
  }, [load]);

  // ?compose=payment_reminder opens the composer; ?tab=log opens the payment form.
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const compose = search.get("compose") || "";
    const tabParam = search.get("tab") || "";
    if (isContactEmailTemplateId(compose)) {
      setComposeTemplate(compose);
      setComposerOpen(true);
    }
    if ((TABS as readonly string[]).includes(tabParam)) {
      setTab(tabParam as ContactTab);
    }
    const planParam = search.get("plan") || "";
    if (planParam === "full" || planParam === "3pay" || planParam === "6pay") {
      setPlanHint(planParam);
    }
  }, []);

  async function saveNote() {
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(email)}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(body.error || "Could not save note.");
        return;
      }
      setNoteText("");
      await load();
    } finally {
      setSavingNote(false);
    }
  }

  async function markOptedOut() {
    setOptOutBusy(true);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(email)}/opt-out`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(body.error || "Could not mark opted out.");
        return;
      }
      toast.success("Marked opted out. No more email to this address.");
      await load();
    } finally {
      setOptOutBusy(false);
    }
  }

  function openComposer(template: ContactEmailTemplateId | null) {
    setComposeTemplate(template);
    setComposerOpen(true);
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>;
  }
  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">{loadError || "Could not load contact."}</p>
        <Button variant="outline" size="sm" render={<Link href="/admin/coaching" />}>
          Back to pipeline
        </Button>
      </div>
    );
  }

  const today = todayInNewYork();
  const money = data.money;
  const nextUnpaid = data.schedule?.installments.find((i) => !i.paidAt) || null;
  const currentPackage = data.packages.find((p) => p.id === data.packageId) || null;
  const plan = data.packages
    .find((p) => p.id === data.packageId)
    ?.plans.find((p) => p.id === data.planId);
  const pkgOption = data.packages.find((p) => p.id === data.packageId);
  const paymentFailed = Boolean(data.client?.paymentFailed);
  const nextDueTone = money.nextDue ? dueTone(money.nextDue.dueDate, today) : null;
  const accessLabel = data.access.hasMembership
    ? data.access.membershipExpiresAt
      ? `Member until ${new Date(data.access.membershipExpiresAt).toLocaleDateString()}`
      : "Member"
    : data.access.isCoachingClient
      ? "Course access as a coaching client"
      : "No course access";

  const templateContext = {
    name: data.name,
    packageName: data.packageName || undefined,
    packagePrice: pkgOption?.price ?? null,
    amountDue: money.nextDue?.amount ?? null,
    dueDate: money.nextDue?.dueDate ?? null,
    installmentNumber: nextUnpaid?.number ?? null,
    installments: data.schedule?.installments.length ?? plan?.installments ?? null,
    payUrl: data.payUrl,
  };

  return (
    <>
      <RecordDetailLayout
        backHref="/admin/coaching"
        backLabel="Pipeline"
        title={data.name || data.email}
        subtitle={data.email}
        badges={
          <div className="flex flex-wrap items-center gap-1">
            {data.pipeline ? <StageBadge status={data.pipeline.status} /> : null}
            {data.packageName ? <Badge variant="outline">{data.packageName}</Badge> : null}
            {paymentFailed ? (
              <Badge variant="destructive">
                <AlertTriangle size={12} /> Payment failed
              </Badge>
            ) : null}
            {!data.emailable && data.emailBlockReason ? (
              <Badge variant="outline">{BLOCK_COPY[data.emailBlockReason] || data.emailBlockReason}</Badge>
            ) : null}
          </div>
        }
        headerActions={
          <>
            <Button
              size="sm"
              disabled={!data.emailable}
              title={data.emailable ? undefined : BLOCK_COPY[data.emailBlockReason || ""]}
              onClick={() => openComposer(null)}
            >
              <Mail size={14} /> Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!data.emailable || !money.nextDue}
              onClick={() => openComposer("payment_reminder")}
            >
              Payment reminder
            </Button>
            <Button
              size="sm"
              variant="destructive-outline"
              disabled={optOutBusy || data.emailBlockReason === "opted_out" || data.emailBlockReason === "suppressed"}
              onClick={() => void markOptedOut()}
            >
              {optOutBusy ? "Saving…" : "Mark opted out"}
            </Button>
          </>
        }
        banner={
          <div className="space-y-4">
            {paymentFailed ? (
              <p
                className="border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400"
                role="alert"
              >
                Stripe could not collect the last payment
                {data.client?.paymentFailedAt
                  ? ` on ${new Date(data.client.paymentFailedAt).toLocaleDateString()}`
                  : ""}
                .
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
              <Stat
                label="Stage"
                value={data.pipeline ? <StageBadge status={data.pipeline.status} /> : "Not in pipeline"}
              />
              <Stat
                label="Package"
                value={
                  data.packageName
                    ? `${data.packageName}${plan ? ` · ${plan.label}` : ""}`
                    : "None"
                }
              />
              <Stat label="Paid" value={usd(money.paid)} tone={money.paid > 0 ? "good" : undefined} />
              <Stat
                label="Still owed"
                value={money.total == null ? "Unknown" : usd(money.owed)}
                tone={money.owed > 0 ? "warning" : undefined}
              />
              <Stat
                label="Next payment due"
                value={
                  money.nextDue
                    ? `${formatDueDate(money.nextDue.dueDate)} · ${usd(money.nextDue.amount)}${
                        money.nextDue.source === "stripe_estimate" ? " (Stripe bills it)" : ""
                      }`
                    : "Nothing due"
                }
                tone={
                  nextDueTone === "overdue" ? "danger" : nextDueTone === "soon" ? "warning" : undefined
                }
              />
              <Stat
                label="Access"
                value={accessLabel}
                tone={data.access.hasCourseAccess ? "good" : undefined}
              />
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as ContactTab)}>
              <TabsList className="h-8 bg-[var(--color-bg-obsidian)]">
                <TabsTrigger value="payments" className="text-xs">
                  Payments
                </TabsTrigger>
                <TabsTrigger value="log" className="text-xs">
                  Log crypto payment
                </TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs">
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="contracts" className="text-xs">
                  Contracts
                </TabsTrigger>
                <TabsTrigger value="intake" className="text-xs">
                  Intake
                </TabsTrigger>
                <TabsTrigger value="syllabus" className="text-xs">
                  Syllabus
                </TabsTrigger>
                <TabsTrigger value="recordings" className="text-xs">
                  Recordings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="payments">
                <div className="space-y-4 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4">
                  {data.schedule ? (
                    <div>
                      <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                        Crypto schedule
                      </h3>
                      <ul className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        {data.schedule.installments.map((inst) => {
                          const tone = inst.paidAt ? "paid" : dueTone(inst.dueDate, today);
                          return (
                            <li
                              key={inst.number}
                              className={cn(
                                "border p-2 text-xs",
                                tone === "paid" && "border-[var(--color-skool)]/50 text-[var(--color-skool)]",
                                tone === "overdue" && "border-red-500/60 text-red-400",
                                tone === "soon" && "border-amber-500/60 text-amber-400",
                                tone === "later" && "border-[var(--color-border-muted)] text-[var(--color-text-muted)]"
                              )}
                            >
                              <p className="font-mono">
                                {inst.number} of {data.schedule?.installments.length}
                              </p>
                              <p>{usd(inst.amount)}</p>
                              <p>
                                {inst.paidAt
                                  ? `Paid ${new Date(inst.paidAt).toLocaleDateString()}`
                                  : `Due ${formatDueDate(inst.dueDate)}`}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                      Payments
                    </h3>
                    {data.payments.length === 0 ? (
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">No payments recorded.</p>
                    ) : (
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[var(--color-text-muted)]">
                            <tr>
                              <th className="py-1 pr-3 font-normal">Date</th>
                              <th className="py-1 pr-3 font-normal">Method</th>
                              <th className="py-1 pr-3 font-normal">Amount</th>
                              <th className="py-1 pr-3 font-normal">Installment</th>
                              <th className="py-1 pr-3 font-normal">Reference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.payments.map((p) => (
                              <tr key={p.id} className="border-t border-[var(--color-border-muted)]/50">
                                <td className="py-1.5 pr-3">{new Date(p.paidAt).toLocaleDateString()}</td>
                                <td className="py-1.5 pr-3">
                                  {p.method === "stripe" ? "Stripe" : p.method === "paypal" ? "PayPal" : `Crypto${p.asset ? ` · ${p.asset}` : ""}${p.network ? ` · ${p.network}` : ""}`}
                                </td>
                                <td className="py-1.5 pr-3">{usd(p.amount)}</td>
                                <td className="py-1.5 pr-3">{p.installmentNumber ?? "-"}</td>
                                <td className="py-1.5 pr-3 font-mono" title={p.txHash || p.stripeInvoiceId || p.stripeSessionId || ""}>
                                  {shortRef(p.txHash || p.stripeInvoiceId || p.stripeSessionId) || p.note || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button size="sm" variant="outline" onClick={() => setTab("log")}>
                      Log crypto payment
                    </Button>
                    {currentPackage && data.payments.some((p) => p.method === "crypto" && p.packageId === currentPackage.id) ? (
                      <ChangePaymentPlanForm
                        email={data.email}
                        pkg={currentPackage}
                        currentPlanId={data.planId}
                        onChanged={() => void load()}
                      />
                    ) : null}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="log">
                <div className="rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4">
                  <p className="mb-3 text-xs text-[var(--color-text-muted)]">
                    The first payment for a package opens the client record and grants its sessions.
                    Later payments mark the next unpaid installment paid.
                  </p>
                  <LogCryptoPaymentForm
                    email={data.email}
                    name={data.name}
                    packages={data.packages}
                    defaultPackageId={data.packageId}
                    defaultPlanId={data.planId || planHint}
                    defaultInstallment={nextUnpaid?.number ?? null}
                    onLogged={() => {
                      setTab("payments");
                      void load();
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="sessions">
                <ContactSessions
                  sessions={data.sessions}
                  sessionsRemaining={data.client?.sessionsRemaining ?? null}
                  sessionsTotal={data.client?.sessionsTotal ?? null}
                  onChanged={() => void load()}
                />
              </TabsContent>
              <TabsContent value="contracts">
                <div className="space-y-2 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4">
                  {data.contracts.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">No contract has been sent to this person.</p>
                  ) : (
                    <ul className="divide-y divide-[var(--color-border-muted)]">
                      {data.contracts.map((c) => (
                        <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                          <a
                            href={`/api/admin/coaching/contracts/${c.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--color-accent)] hover:underline"
                          >
                            {c.packageName || "Coaching"} agreement
                          </a>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {c.sentAt ? `Sent ${new Date(c.sentAt).toLocaleDateString()}` : ""}
                            {c.signedAt ? ` · Signed ${new Date(c.signedAt).toLocaleDateString()}` : ` · ${c.status}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Opens the exact contract that was sent. Signed ones open the signed PDF.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="intake">
                <ContactClientArea email={data.email} section="intake" onIntakeConfirmed={() => setTab("syllabus")} />
              </TabsContent>
              <TabsContent value="syllabus">
                <ContactClientArea email={data.email} section="syllabus" />
              </TabsContent>
              <TabsContent value="recordings">
                <ContactClientArea email={data.email} section="recordings" />
              </TabsContent>
            </Tabs>
          </div>
        }
        timeline={data.timeline}
        timelineFooter={
          <div className="space-y-2 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              Add note
            </h3>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Internal note. Only admins see it."
              rows={3}
            />
            <Button size="sm" disabled={savingNote || !noteText.trim()} onClick={() => void saveNote()}>
              {savingNote ? "Saving…" : "Add note"}
            </Button>
          </div>
        }
        properties={[
          { label: "Email", value: data.email },
          {
            label: "Stage",
            value: data.pipeline ? <StageBadge status={data.pipeline.status} /> : "Not in pipeline",
          },
          { label: "Client status", value: data.client?.status?.replace(/_/g, " ") || "No client record" },
          {
            label: "Sessions",
            value: data.client
              ? `${data.client.sessionsRemaining ?? 0} / ${data.client.sessionsTotal ?? 0}`
              : "None",
          },
          {
            label: "Contract",
            value: (() => {
              const label = data.client?.contractSignedAt
                ? `Signed ${new Date(data.client.contractSignedAt).toLocaleDateString()}`
                : data.client
                  ? "Not signed"
                  : "None";
              const latest = data.contracts[0];
              return latest ? (
                <a
                  href={`/api/admin/coaching/contracts/${latest.id}/view`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  {label === "None" ? "Sent" : label}
                </a>
              ) : (
                label
              );
            })(),
          },
          ...(data.client
            ? [
                {
                  label: "Telegram",
                  value: data.client.telegramHandle ? (
                    <a
                      href={`https://t.me/${data.client.telegramHandle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      @{data.client.telegramHandle}
                    </a>
                  ) : (
                    "Not connected"
                  ),
                },
              ]
            : []),
          { label: "Membership", value: data.access.hasMembership ? "Active" : "None" },
          { label: "Course access", value: data.access.hasCourseAccess ? "Yes" : "No" },
          ...(data.skool ? [{ label: "Skool", value: data.skool }] : []),
          {
            label: "Email status",
            value: data.emailable ? "Can email" : BLOCK_COPY[data.emailBlockReason || ""] || "Blocked",
          },
        ]}
        propertyActions={
          <>
            {data.client || data.pipeline ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href={`/admin/coaching/${encodeURIComponent(data.email)}`} />}
              >
                Client record
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href={`/admin/people/${encodeURIComponent(data.email)}`} />}
            >
              People record
            </Button>
            {data.hasCrmContact ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href={`/admin/hubspot-contacts/${encodeURIComponent(data.email)}`} />}
              >
                HubSpot contact
              </Button>
            ) : null}
          </>
        }
      />
      <ContactEmailComposer
        email={data.email}
        open={composerOpen}
        onOpenChange={setComposerOpen}
        initialTemplate={composeTemplate}
        templateContext={templateContext}
        onSent={() => void load()}
      />
    </>
  );
}
