"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/crm/DataTable";
import { Button } from "@/components/ui/button";
import { formatDueDate } from "@/lib/crm/contact-email-templates";
import type { PaymentDueItem } from "@/lib/coaching/payments";
import { cn } from "@/lib/utils";

function usd(cents: number): string {
  const value = cents / 100;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function contactHref(email: string, query: string): string {
  return `/admin/contacts/${encodeURIComponent(email)}?${query}`;
}

export default function PaymentsDuePage() {
  const [items, setItems] = useState<PaymentDueItem[]>([]);
  const [upcoming, setUpcoming] = useState<PaymentDueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/coaching/payments-due")
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as {
          items?: PaymentDueItem[];
          upcoming?: PaymentDueItem[];
          error?: string;
        };
        if (!res.ok) {
          setError(body.error || "Could not load payments due.");
          return;
        }
        setItems(body.items || []);
        setUpcoming(body.upcoming || []);
      })
      .catch(() => setError("Could not load payments due."))
      .finally(() => setLoading(false));
  }, []);

  const overdue = items.filter((i) => i.status === "overdue");
  const soon = items.filter((i) => i.status === "due_soon");

  const columns: DataTableColumn<PaymentDueItem>[] = [
    {
      id: "name",
      header: "Name",
      cell: (i) => (
        <Link
          href={`/admin/contacts/${encodeURIComponent(i.email)}`}
          className="text-[var(--color-accent)] hover:underline"
        >
          {i.name || i.email}
        </Link>
      ),
    },
    {
      id: "package",
      header: "Package",
      cell: (i) =>
        `${i.packageName || i.packageId} · ${i.installmentNumber} of ${i.installments}`,
    },
    { id: "amount", header: "Amount", cell: (i) => usd(i.amount) },
    {
      id: "due",
      header: "Due",
      cell: (i) => (
        <span
          className={
            i.status === "overdue"
              ? "text-red-400"
              : i.status === "due_soon"
                ? "text-amber-400"
                : "text-[var(--color-text-muted)]"
          }
        >
          {formatDueDate(i.dueDate)}
          {i.status === "overdue"
            ? ` · ${i.daysLate} ${i.daysLate === 1 ? "day" : "days"} late`
            : i.daysLate === 0
              ? " · today"
              : ` · in ${-i.daysLate} ${i.daysLate === -1 ? "day" : "days"}`}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (i) => (
        <div className="flex flex-wrap gap-2">
          <Button size="xs" variant="outline" render={<Link href={contactHref(i.email, "tab=log")} />}>
            Log payment
          </Button>
          <Button
            size="xs"
            variant="outline"
            render={<Link href={contactHref(i.email, "compose=payment_reminder")} />}
          >
            Send reminder
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="Payments due"
        description="Crypto installments that are overdue or due in the next 7 days, then the next payment on every other crypto plan. Stripe bills its own installments, so they are not listed here."
        actions={
          <Button variant="outline" size="sm" render={<Link href="/admin/coaching" />}>
            Pipeline
          </Button>
        }
      />
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
        <span className={cn(overdue.length > 0 && "text-red-400")}>{overdue.length} overdue</span>
        <span className={cn(soon.length > 0 && "text-amber-400")}>{soon.length} due in 7 days</span>
        <span>{upcoming.length} upcoming</span>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(i) => `${i.scheduleId}-${i.installmentNumber}`}
          loading={loading}
          rowClassName={(i) => (i.status === "overdue" ? "bg-red-500/5" : "bg-amber-500/5")}
          emptyMessage="Nothing is overdue or due in the next 7 days."
        />
      </div>
      <h2 className="mt-8 font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
        Upcoming
      </h2>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        The next unpaid installment on each crypto plan that is not due this week.
      </p>
      <div className="mt-3">
        <DataTable
          columns={columns}
          data={upcoming}
          keyExtractor={(i) => `up-${i.scheduleId}-${i.installmentNumber}`}
          loading={loading}
          emptyMessage="No other crypto plans have a payment left."
        />
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        The owner gets this list by email each morning after 7am New York time when something is due.
        Clients are never emailed automatically.
      </p>
    </div>
  );
}
