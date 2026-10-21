"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddClientDialog } from "@/components/admin/crm/AddClientDialog";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/crm/DataTable";
import { ListToolbar } from "@/components/admin/crm/ListToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClientRow {
  id: string;
  email?: string;
  name?: string;
  packageId?: string;
  packageName?: string;
  status?: string;
  sessionsRemaining?: number;
  sessionsTotal?: number;
  paidAt?: string;
}

export default function CoachingClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/coaching/clients?q=${encodeURIComponent(q)}`);
    const data = (await res.json()) as { clients?: ClientRow[] };
    let rows = data.clients || [];
    if (statusFilter) {
      rows = rows.filter((c) => c.status === statusFilter);
    }
    setClients(rows);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q, statusFilter]);

  const columns: DataTableColumn<ClientRow>[] = [
    {
      id: "client",
      header: "Client",
      cell: (c) => (
        <div>
          <div className="font-medium">{c.name || c.email || c.id}</div>
          {c.email && c.email !== c.id && (
            <div className="text-xs text-[var(--color-text-muted)]">{c.email}</div>
          )}
        </div>
      ),
    },
    {
      id: "package",
      header: "Package",
      cell: (c) => c.packageName || c.packageId || "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (c) =>
        c.status ? <Badge variant="outline">{c.status}</Badge> : "—",
    },
    {
      id: "sessions",
      header: "Sessions",
      cell: (c) => `${c.sessionsRemaining ?? 0} / ${c.sessionsTotal ?? 0}`,
    },
    {
      id: "paid",
      header: "Paid",
      cell: (c) => (c.paidAt ? new Date(c.paidAt).toLocaleDateString() : "—"),
    },
  ];

  const statuses = [...new Set(clients.map((c) => c.status).filter(Boolean))];

  return (
    <div>
      <CrmPageHeader
        title="Clients"
        description="Active and past coaching clients. Click a row to open detail."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/admin/coaching/paperbell-import" className="text-sm text-[var(--color-accent)] hover:underline">
              Import from Paperbell
            </Link>
            <AddClientDialog />
          </div>
        }
      />
      <ListToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search name, email, or package…"
        filters={
          <div className="flex flex-wrap gap-1">
            <Button
              variant={statusFilter === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("")}
            >
              All
            </Button>
            {statuses.map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s as string)}
              >
                {s}
              </Button>
            ))}
          </div>
        }
      />
      <DataTable
        columns={columns}
        data={clients}
        keyExtractor={(c) => c.id}
        loading={loading}
        onRowClick={(c) =>
          router.push(`/admin/coaching/${encodeURIComponent(c.id)}`)
        }
        emptyMessage="No clients found."
      />
    </div>
  );
}
