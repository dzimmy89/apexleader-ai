"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/crm/DataTable";
import { ListToolbar } from "@/components/admin/crm/ListToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPanel,
} from "@/components/ui/dialog";
import { subscribersListErrorMessage } from "@/lib/crm/subscribers-list-error";

interface Person {
  email: string;
  type: string;
  name?: string;
  tier?: string;
  source?: string;
  status?: string;
  consentAt?: string;
  lifecycle?: string;
  lastSeenAt?: string;
  createdAt?: string;
}

const LIFECYCLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  lead: "secondary",
  member: "outline",
  applicant: "default",
  client: "default",
};

export function SubscribersTab() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "lead" | "member">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed">("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [totalApproximate, setTotalApproximate] = useState(false);
  const [indexPending, setIndexPending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [includePipeline, setIncludePipeline] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const params = new URLSearchParams({
      limit: String(limit),
      type: typeFilter,
    });
    if (cursor) params.set("cursor", cursor);
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter === "confirmed") params.set("status", "confirmed");
    try {
      const res = await fetch(`/api/admin/subscribers?${params}`);
      const data = (await res.json().catch(() => ({}))) as {
        error?: unknown;
        people?: Person[];
        total?: number;
        totalApproximate?: boolean;
        indexPending?: boolean;
        hasMore?: boolean;
        nextCursor?: string;
      };
      const error = subscribersListErrorMessage(res.ok, data);
      if (error) {
        setPeople([]);
        setTotal(0);
        setTotalApproximate(false);
        setIndexPending(false);
        setHasMore(false);
        setNextCursor(undefined);
        setLoadError(error);
        return;
      }
      setPeople(data.people || []);
      setTotal(data.total ?? 0);
      setTotalApproximate(Boolean(data.totalApproximate));
      setIndexPending(Boolean(data.indexPending));
      setHasMore(Boolean(data.hasMore));
      setNextCursor(data.nextCursor || undefined);
    } catch {
      setPeople([]);
      setTotal(0);
      setHasMore(false);
      setNextCursor(undefined);
      setLoadError("Could not load people.");
    } finally {
      setLoading(false);
    }
  }, [cursor, search, typeFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    setCursor(undefined);
    setCursorStack([]);
    setNextCursor(undefined);
    setSelected(new Set());
  }, [search, typeFilter, statusFilter]);

  function toggleOne(email: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(email);
      else next.delete(email);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(people.map((p) => p.email)));
  }

  async function confirmDelete() {
    if (!selected.size) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: Array.from(selected),
          includePipeline,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success(`Deleted ${data.deleted?.length ?? selected.size} people`);
      setSelected(new Set());
      setConfirmOpen(false);
      setIncludePipeline(false);
      await load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const allSelected = people.length > 0 && people.every((p) => selected.has(p.email));

  const columns: DataTableColumn<Person>[] = [
    {
      id: "select",
      header: "",
      className: "w-10",
      cell: (p) => (
        <Checkbox
          checked={selected.has(p.email)}
          onCheckedChange={(v) => toggleOne(p.email, v === true)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${p.email}`}
        />
      ),
    },
    {
      id: "name",
      header: "Name",
      cell: (p) => (
        <div>
          <div className="font-medium">{p.name || "—"}</div>
          <Link
            href={`/admin/contacts/${encodeURIComponent(p.email)}`}
            className="text-xs text-[var(--color-accent)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {p.email}
          </Link>
        </div>
      ),
    },
    {
      id: "lifecycle",
      header: "Lifecycle",
      cell: (p) => (
        <Badge variant={LIFECYCLE_VARIANT[p.lifecycle || p.type] || "outline"}>
          {p.lifecycle || p.type}
        </Badge>
      ),
    },
    {
      id: "tier",
      header: "Tier",
      cell: (p) => p.tier || "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (p) => p.status || "legacy",
    },
    {
      id: "source",
      header: "Source",
      cell: (p) => p.source || "—",
    },
    {
      id: "consent",
      header: "Consent",
      cell: (p) =>
        p.consentAt ? new Date(p.consentAt).toLocaleDateString() : "—",
    },
    {
      id: "lastSeen",
      header: "Last seen",
      cell: (p) =>
        p.lastSeenAt ? new Date(p.lastSeenAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="People"
        description="Leads, members, applicants, and clients in one unified list."
      />
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Prefix search email or name…"
        filters={
          <div className="flex gap-1">
            {(["all", "lead", "member"] as const).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(t)}
              >
                {t === "all" ? "All" : t === "lead" ? "Leads" : "Members"}
              </Button>
            ))}
            <Button
              variant={statusFilter === "confirmed" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setStatusFilter((s) => (s === "confirmed" ? "all" : "confirmed"))
              }
            >
              Confirmed
            </Button>
          </div>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAll(!allSelected)}
              disabled={!people.length}
            >
              {allSelected ? "Clear page" : "Select page"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!selected.size}
              onClick={() => setConfirmOpen(true)}
            >
              Delete selected ({selected.size})
            </Button>
          </>
        }
      />
      {loadError ? (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {loadError}
        </p>
      ) : null}
      <DataTable
        columns={columns}
        data={people}
        keyExtractor={(p) => p.email}
        loading={loading}
        onRowClick={(p) => router.push(`/admin/contacts/${encodeURIComponent(p.email)}`)}
        emptyMessage={loadError ? "Could not load this page." : "No people match your filters."}
      />
      {indexPending && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Name search is waiting on Firestore indexes. Email prefix search still
          works.
        </p>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>
          Showing {people.length ? cursorStack.length * limit + 1 : 0}–
          {people.length ? cursorStack.length * limit + people.length : 0} of{" "}
          {totalApproximate ? "~" : ""}
          {total}
          {totalApproximate ? " (approx.)" : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={cursorStack.length === 0}
            onClick={() => {
              const stack = [...cursorStack];
              const prev = stack.pop();
              setCursorStack(stack);
              setCursor(prev || undefined);
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore || !nextCursor}
            onClick={() => {
              setCursorStack((stack) => [...stack, cursor ?? ""]);
              setCursor(nextCursor);
            }}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogPopup className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
          <DialogHeader>
            <DialogTitle>Delete {selected.size} people?</DialogTitle>
            <DialogDescription>
              This removes leads, members, email flows, activity, email send
              history, and attribution for the selected emails. Suppressions
              are kept. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={includePipeline}
                onCheckedChange={(v) => setIncludePipeline(v === true)}
              />
              Also remove coaching applications for these emails
            </label>
          </DialogPanel>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
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
