"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/crm/DataTable";
import { Badge } from "@/components/ui/badge";

interface Send {
  id: string;
  to: string;
  subject: string;
  status: string;
  source: string;
  sentAt: string;
  error?: string | null;
}

const ERROR_COL_MAX = 80;

function truncateError(text: string): string {
  if (text.length <= ERROR_COL_MAX) return text;
  return `${text.slice(0, ERROR_COL_MAX)}…`;
}

export function SendsTab() {
  const [sends, setSends] = useState<Send[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sends?limit=100")
      .then((r) => r.json())
      .then((d) => {
        setSends(d.sends || []);
        setLoading(false);
      });
  }, []);

  const columns: DataTableColumn<Send>[] = [
    {
      id: "to",
      header: "To",
      cell: (s) => (
        <Link
          href={`/admin/people/${encodeURIComponent(s.to)}`}
          className="text-[var(--color-accent)] hover:underline"
        >
          {s.to}
        </Link>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: (s) => <span className="max-w-xs truncate block">{s.subject}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (s) => (
        <Badge variant={s.status === "sent" ? "default" : "destructive"}>
          {s.status}
        </Badge>
      ),
    },
    {
      id: "source",
      header: "Source",
      cell: (s) => <span className="font-mono text-xs">{s.source}</span>,
    },
    {
      id: "sent",
      header: "Sent",
      cell: (s) => (
        <span className="font-mono text-xs">
          {s.sentAt ? new Date(s.sentAt).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      id: "error",
      header: "Error",
      cell: (s) => {
        const err = typeof s.error === "string" ? s.error.trim() : "";
        if (!err) return <span className="text-[var(--color-text-muted)]">—</span>;
        return (
          <span className="max-w-xs truncate block font-mono text-xs" title={err}>
            {truncateError(err)}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <CrmPageHeader title="Sends" description="Email send log with links to person records." />
      <DataTable
        columns={columns}
        data={sends}
        keyExtractor={(s) => s.id}
        loading={loading}
        emptyMessage="No sends logged yet."
      />
    </div>
  );
}
