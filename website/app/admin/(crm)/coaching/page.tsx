"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ExternalLink,
  GripVertical,
  LayoutGrid,
  List,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AddClientDialog } from "@/components/admin/crm/AddClientDialog";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/crm/DataTable";
import { ListToolbar } from "@/components/admin/crm/ListToolbar";
import { SmartViewTabs } from "@/components/admin/crm/SmartViewTabs";
import { StageBadge } from "@/components/admin/crm/StageBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPanel,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  PIPELINE_COLUMNS,
  applySmartView,
  columnAggregate,
  effectiveCloseValue,
  isDiscoverySoon,
  isOverdue,
  pipelineMetrics,
  type PipelineApplication,
  type SmartViewId,
} from "@/lib/crm/pipeline-utils";
import { cn } from "@/lib/utils";

type ViewMode = "board" | "list";

function displayValue(app: PipelineApplication): number {
  return effectiveCloseValue(app);
}

function contactHref(email: string): string {
  return `/admin/contacts/${encodeURIComponent(email.trim().toLowerCase())}`;
}

export default function CoachingKanbanPage() {
  const [apps, setApps] = useState<PipelineApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [smartView, setSmartView] = useState<SmartViewId>("all");
  const [search, setSearch] = useState("");
  const [pendingMove, setPendingMove] = useState<{
    id: string;
    status: string;
    email: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PipelineApplication | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [lossReason, setLossReason] = useState("");
  const [wonNote, setWonNote] = useState("");
  const [paymentsDue, setPaymentsDue] = useState<{ overdue: number; dueSoon: number } | null>(
    null
  );

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coaching?limit=300");
    const data = (await res.json()) as { applications?: PipelineApplication[] };
    setApps(data.applications || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    fetch("/api/admin/coaching/payments-due")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { overdue?: number; dueSoon?: number } | null) => {
        if (d) setPaymentsDue({ overdue: d.overdue || 0, dueSoon: d.dueSoon || 0 });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setViewMode("list");
    }
  }, []);

  const filteredApps = useMemo(() => {
    let result = applySmartView(apps, smartView);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.email.toLowerCase().includes(q) ||
          (a.name || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [apps, smartView, search]);

  const metrics = pipelineMetrics(apps);
  const smartCounts = useMemo(
    () => ({
      overdue: applySmartView(apps, "overdue").length,
      discovery_week: applySmartView(apps, "discovery_week").length,
      proposal_stale: applySmartView(apps, "proposal_stale").length,
      new_7d: applySmartView(apps, "new_7d").length,
    }),
    [apps]
  );

  async function moveStatus(id: string, status: string, extra?: Record<string, unknown>) {
    const prev = apps;
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status, ...extra } : a)));
    const res = await fetch("/api/admin/coaching", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...extra }),
    });
    if (!res.ok) {
      setApps(prev);
      toast.error("Failed to update stage");
    } else {
      toast.success("Stage updated");
    }
  }

  function requestMove(id: string, status: string, email: string) {
    if (status === "lost" || status === "won") {
      setPendingMove({ id, status, email });
      setLossReason("");
      setWonNote("");
      return;
    }
    void moveStatus(id, status);
  }

  function confirmMove() {
    if (!pendingMove) return;
    if (pendingMove.status === "lost" && !lossReason.trim()) {
      toast.error("Loss reason is required");
      return;
    }
    void moveStatus(pendingMove.id, pendingMove.status, {
      ...(pendingMove.status === "lost" ? { lossReason: lossReason.trim() } : {}),
      ...(pendingMove.status === "won" && wonNote.trim()
        ? { notes: wonNote.trim() }
        : {}),
    });
    setPendingMove(null);
  }

  function handleDrop(status: string) {
    if (!draggedId) return;
    const app = apps.find((a) => a.id === draggedId);
    if (app && app.status !== status) requestMove(draggedId, status, app.email);
    setDraggedId(null);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const prev = apps;
    setApps((p) => p.filter((a) => a.id !== pendingDelete.id));
    try {
      const res = await fetch("/api/admin/coaching", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDelete.id }),
      });
      if (!res.ok) {
        setApps(prev);
        toast.error("Failed to delete lead");
      } else {
        toast.success("Lead deleted from pipeline");
        setPendingDelete(null);
      }
    } catch {
      setApps(prev);
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  }

  const listColumns: DataTableColumn<PipelineApplication>[] = [
    {
      id: "name",
      header: "Name",
      cell: (a) => (
        <span className="flex items-center gap-1">
          <Link
            href={contactHref(a.email)}
            className="text-[var(--color-accent)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {a.name || a.email}
          </Link>
          {a.paymentFailedAt ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400">
              <AlertTriangle size={10} /> Payment failed
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: "stage",
      header: "Stage",
      cell: (a) => <StageBadge status={a.status} />,
    },
    {
      id: "value",
      header: "Value",
      cell: (a) => {
        const v = displayValue(a);
        return v > 0 ? `$${v.toLocaleString()}` : "—";
      },
    },
    {
      id: "next",
      header: "Next action",
      cell: (a) =>
        a.nextActionAt ? new Date(a.nextActionAt).toLocaleDateString() : "—",
    },
    {
      id: "move",
      header: "Move",
      cell: (a) => (
        <select
          className="rounded border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-1 py-0.5 text-xs"
          value={a.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => requestMove(a.id, e.target.value, a.email)}
        >
          {PIPELINE_COLUMNS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      id: "delete",
      header: "",
      className: "w-10",
      cell: (a) => (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${a.email}`}
          onClick={(e) => {
            e.stopPropagation();
            setPendingDelete(a);
          }}
        >
          <Trash2 size={14} />
        </Button>
      ),
    },
  ];

  const colCount = PIPELINE_COLUMNS.length;

  return (
    <div>
      <CrmPageHeader
        title="Coaching Pipeline"
        description="Drag the handle to move cards between columns, or use list view. Click a card to open the contact page."
        actions={
          <>
            <AddClientDialog onAdded={() => void load()} />
            <div className="flex rounded-md border border-[var(--color-border-muted)]">
              <Button
                variant={viewMode === "board" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("board")}
              >
                <LayoutGrid size={14} /> Board
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List size={14} /> List
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/admin/coaching/payments-due" />}
            >
              Payments due
              {paymentsDue && paymentsDue.overdue + paymentsDue.dueSoon > 0 ? (
                <span
                  className={cn(
                    "ml-1 rounded-sm px-1 font-mono text-[10px]",
                    paymentsDue.overdue > 0
                      ? "bg-red-500/20 text-red-400"
                      : "bg-amber-500/20 text-amber-400"
                  )}
                >
                  {paymentsDue.overdue + paymentsDue.dueSoon}
                </span>
              ) : null}
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/admin/coaching/clients" />}
            >
              <ExternalLink size={12} /> Clients
            </Button>
          </>
        }
      />

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
        <span>
          <strong className="text-[var(--color-accent)]">
            ${metrics.totalValue.toLocaleString()}
          </strong>{" "}
          pipeline
        </span>
        <span>{metrics.openCount} open</span>
        <span className={metrics.overdueCount > 0 ? "text-red-400" : ""}>
          {metrics.overdueCount} overdue
        </span>
        {paymentsDue && paymentsDue.overdue + paymentsDue.dueSoon > 0 ? (
          <Link href="/admin/coaching/payments-due" className="hover:underline">
            <span className={paymentsDue.overdue > 0 ? "text-red-400" : ""}>
              {paymentsDue.overdue} payments overdue
            </span>
            {" · "}
            <span className={paymentsDue.dueSoon > 0 ? "text-amber-400" : ""}>
              {paymentsDue.dueSoon} due in 7 days
            </span>
          </Link>
        ) : null}
      </div>

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search pipeline…" />
      <SmartViewTabs
        value={smartView}
        onChange={setSmartView}
        counts={smartCounts}
        className="mb-4"
      />

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      ) : viewMode === "list" ? (
        <DataTable
          columns={listColumns}
          data={filteredApps}
          keyExtractor={(a) => a.id}
          rowClassName={(a) =>
            cn(
              isOverdue(a.nextActionAt) && "bg-red-500/5",
              isDiscoverySoon(a.discoveryCallAt) && "bg-amber-500/5"
            )
          }
          emptyMessage="No applications match this view."
        />
      ) : (
        <div
          className="grid gap-3 overflow-x-auto"
          style={{
            gridTemplateColumns: `repeat(${colCount}, minmax(140px, 1fr))`,
          }}
        >
          {PIPELINE_COLUMNS.map((col) => {
            const items = filteredApps.filter((a) => a.status === col.id);
            const agg = columnAggregate(filteredApps, col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className="flex min-h-[200px] min-w-[140px] flex-col border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]"
              >
                <div className="border-b border-[var(--color-border-muted)] p-2">
                  <h2 className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                    {col.label}
                  </h2>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {agg.count}
                    {agg.value > 0 && ` · $${agg.value.toLocaleString()}`}
                  </span>
                </div>
                <ul className="flex-1 space-y-2 p-2">
                  {items.map((app) => {
                    const value = displayValue(app);
                    return (
                      <li
                        key={app.id}
                        className={cn(
                          "border border-[var(--color-border-muted)] bg-[var(--color-bg)] text-xs",
                          isOverdue(app.nextActionAt) && "border-red-500/50",
                          app.paymentFailedAt && "border-red-500",
                          isDiscoverySoon(app.discoveryCallAt) && "border-amber-500/50",
                          draggedId === app.id && "opacity-60"
                        )}
                      >
                        <div className="flex items-start gap-1 p-2">
                          <button
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              setDraggedId(app.id);
                            }}
                            onDragEnd={() => setDraggedId(null)}
                            className="mt-0.5 cursor-grab touch-none text-[var(--color-text-muted)] active:cursor-grabbing"
                            aria-label="Drag to move stage"
                          >
                            <GripVertical size={14} />
                          </button>
                          <Link href={contactHref(app.email)} className="min-w-0 flex-1">
                            <p className="text-[var(--color-text-on-obsidian)]">
                              {app.name || app.email}
                            </p>
                            {app.name && (
                              <p className="truncate text-[var(--color-text-muted)]">
                                {app.email}
                              </p>
                            )}
                            {value > 0 && (
                              <p className="mt-1 text-[10px] text-[var(--color-positive)]">
                                ${value.toLocaleString()}
                              </p>
                            )}
                            {app.discoveryCallAt && (
                              <p className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-coaching)]">
                                <Calendar size={10} />
                                {new Date(app.discoveryCallAt).toLocaleDateString()}
                              </p>
                            )}
                            {isOverdue(app.nextActionAt) && (
                              <p className="mt-1 text-[10px] text-red-400">
                                Overdue follow-up
                              </p>
                            )}
                            {app.paymentFailedAt && (
                              <p className="mt-1 flex items-center gap-1 text-[10px] text-red-400">
                                <AlertTriangle size={10} /> Payment failed
                              </p>
                            )}
                          </Link>
                          <button
                            type="button"
                            className="mt-0.5 text-[var(--color-text-muted)] hover:text-red-400"
                            aria-label="Delete from pipeline"
                            onClick={() => setPendingDelete(app)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                  {items.length === 0 && (
                    <li className="py-4 text-center text-[10px] text-[var(--color-text-muted)]">
                      —
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!pendingMove} onOpenChange={() => setPendingMove(null)}>
        <DialogPopup className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
          <DialogHeader>
            <DialogTitle>
              {pendingMove?.status === "lost" ? "Mark as lost" : "Mark as won"}
            </DialogTitle>
            <DialogDescription>
              {pendingMove?.status === "lost"
                ? "Please provide a loss reason for reporting."
                : "Optional note before onboarding checklist."}
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            {pendingMove?.status === "lost" ? (
              <Textarea
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                placeholder="Loss reason…"
                className="min-h-24 border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)]"
              />
            ) : (
              <Textarea
                value={wonNote}
                onChange={(e) => setWonNote(e.target.value)}
                placeholder="Win notes (optional)…"
                className="min-h-24 border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)]"
              />
            )}
          </DialogPanel>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMove(null)}>
              Cancel
            </Button>
            <Button onClick={confirmMove}>Confirm</Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>

      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogPopup className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
          <DialogHeader>
            <DialogTitle>Delete pipeline lead?</DialogTitle>
            <DialogDescription>
              Removes {pendingDelete?.name || pendingDelete?.email} from the
              coaching pipeline only. Their People record is not deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
