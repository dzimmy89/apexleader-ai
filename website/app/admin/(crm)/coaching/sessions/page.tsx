"use client";

import { useEffect, useState, useTransition } from "react";
import { Save, CheckCircle2, Trash2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { IcfLogExport } from "@/components/admin/coaching/IcfLogExport";
import { Button } from "@/components/ui/button";

interface SessionRow {
  id: string;
  clientId: string;
  clientName?: string;
  packageId?: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  privateNotes?: string;
  sharedNotes?: string;
  actionItems?: string[];
  completedAt?: string;
  calendarEventId?: string | null;
  title?: string;
  source?: string;
  ignored?: boolean;
  recordingFileId?: string | null;
}

interface SyncState {
  lastRunAt?: string;
  lastResult?: { created?: number; updated?: number; recordings?: number; recordingError?: string | null };
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SessionRow | null>(null);

  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const qs = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/coaching/sessions${qs}`);
    const data = (await res.json()) as { sessions?: SessionRow[] };
    setSessions((data.sessions || []).filter((s) => !s.ignored));
    setLoading(false);
  }

  async function loadSyncState() {
    const res = await fetch("/api/admin/coaching/sessions/sync");
    if (res.ok) setSyncState((await res.json()) as SyncState);
  }

  async function syncNow() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/coaching/sessions/sync", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        result?: { created: number; updated: number; recordings: number; recordingError: string | null };
      };
      if (!res.ok || !body.result) {
        toast.error(body.error || "Could not read the calendar");
        return;
      }
      const r = body.result;
      toast.success(`Calendar read: ${r.created} new, ${r.updated} changed, ${r.recordings} recordings added.`);
      if (r.recordingError) toast.message(r.recordingError);
      await Promise.all([load(), loadSyncState()]);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    void load();
  }, [filter]);

  useEffect(() => {
    void loadSyncState();
  }, []);

  return (
    <div>
      <CrmPageHeader
        title="Sessions"
        description="Sessions come from your Google Calendar: any event with a coaching client as a guest. Moved events move the session, deleted or declined ones cancel it, and finished ones are marked completed."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAdding((v) => !v)}>
              <Plus size={14} /> Add session
            </Button>
            <Button size="sm" onClick={() => void syncNow()} disabled={syncing}>
              <RefreshCw size={14} className={syncing ? "animate-spin" : undefined} /> {syncing ? "Reading calendar…" : "Sync calendar"}
            </Button>
          </>
        }
      />
      <p className="mb-4 text-xs text-[var(--color-text-muted)]">
        {syncState?.lastRunAt
          ? `Calendar last read ${new Date(syncState.lastRunAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}. It is read again every 30 minutes.`
          : "The calendar has not been read yet. It is read every 30 minutes, or press Sync calendar."}
        {syncState?.lastResult?.recordingError ? ` Recordings: ${syncState.lastResult.recordingError}` : ""}
      </p>
      {adding ? (
        <AddSessionForm
          onAdded={() => {
            setAdding(false);
            void load();
          }}
        />
      ) : null}
      <div className="mb-6">
        <IcfLogExport />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["", "scheduled", "completed", "cancelled", "no-show"].map((s) => (
            <Button
              key={s || "all"}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s || "All"}
            </Button>
          ))}
        </div>

        <ul className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto">
          {loading ? (
            <li className="text-sm text-[var(--color-text-muted)]">Loading…</li>
          ) : sessions.length === 0 ? (
            <li className="text-sm text-[var(--color-text-muted)]">
              No sessions found.
            </li>
          ) : (
            sessions.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s)}
                  className={`w-full border p-3 text-left transition-colors ${
                    selected?.id === s.id
                      ? "border-[var(--color-coaching)] bg-[var(--color-coaching-subtle)]"
                      : "border-[var(--color-border-muted)] hover:border-[var(--color-coaching)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text)]">
                      {s.clientName || s.clientId}
                      {s.recordingFileId ? (
                        <span className="ml-2 text-xs text-[var(--color-text-muted)]">· recording</span>
                      ) : null}
                    </span>
                    <StatusPill status={s.status} />
                  </div>
                  <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                    {new Date(s.scheduledAt).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div>
        {selected ? (
          <SessionNotesEditor
            key={selected.id}
            session={selected}
            onSaved={() => load()}
          />
        ) : (
          <div className="border border-[var(--color-border-muted)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            Select a session to view or edit notes.
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

function SessionNotesEditor({
  session,
  onSaved,
}: {
  session: SessionRow;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(session.status);
  const [privateNotes, setPrivateNotes] = useState(session.privateNotes || "");
  const [sharedNotes, setSharedNotes] = useState(session.sharedNotes || "");
  const [actionItems, setActionItems] = useState<string[]>(
    session.actionItems || []
  );
  const [newAction, setNewAction] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await fetch("/api/admin/coaching/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: session.id,
          ...(status !== session.status ? { status } : {}),
          privateNotes,
          sharedNotes,
          actionItems,
        }),
      });
      onSaved();
    });
  }

  function handleDelete() {
    if (
      !confirm(
        session.calendarEventId
          ? "Mark this as not a coaching session? It stops counting toward the client's sessions and the calendar sync leaves it out."
          : "Delete this session? This cannot be undone."
      )
    )
      return;
    startTransition(async () => {
      await fetch(`/api/admin/coaching/sessions?id=${session.id}`, {
        method: "DELETE",
      });
      onSaved();
    });
  }

  return (
    <div className="border border-[var(--color-border-muted)] p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            {session.clientName || session.clientId}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {new Date(session.scheduledAt).toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
          title="Delete session"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <label className="mt-6 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        Status
      </label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mt-1 min-h-[40px] w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
      >
        <option value="scheduled">Scheduled</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no-show">No-show</option>
      </select>

      <label className="mt-4 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        Private notes (coach only)
      </label>
      <textarea
        value={privateNotes}
        onChange={(e) => setPrivateNotes(e.target.value)}
        rows={6}
        className="mt-1 w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-2 text-sm text-[var(--color-text)]"
      />

      <label className="mt-4 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        Shared notes (visible to client in portal)
      </label>
      <textarea
        value={sharedNotes}
        onChange={(e) => setSharedNotes(e.target.value)}
        rows={4}
        className="mt-1 w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-2 text-sm text-[var(--color-text)]"
      />

      <label className="mt-4 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        Action items
      </label>
      <ul className="mt-2 space-y-1">
        {actionItems.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between border border-[var(--color-border-muted)] p-2 text-sm text-[var(--color-text)]"
          >
            <span>{item}</span>
            <button
              onClick={() =>
                setActionItems(actionItems.filter((_, idx) => idx !== i))
              }
              className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
          placeholder="Add action item…"
          className="min-h-[36px] flex-1 border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newAction.trim()) {
              e.preventDefault();
              setActionItems([...actionItems, newAction.trim()]);
              setNewAction("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (newAction.trim()) {
              setActionItems([...actionItems, newAction.trim()]);
              setNewAction("");
            }
          }}
          className="inline-flex items-center gap-1 border border-[var(--color-border-muted)] px-3 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-coaching)]"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={pending}
          className="inline-flex min-h-[44px] items-center gap-2 bg-[var(--color-coaching)] px-6 py-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--color-bg)] hover:brightness-110 disabled:opacity-50"
        >
          {pending ? (
            <>Saving…</>
          ) : (
            <>
              <Save size={14} /> Save notes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    scheduled: "text-[var(--color-coaching)]",
    completed: "text-[var(--color-positive)]",
    cancelled: "text-[var(--color-danger)]",
    "no-show": "text-[var(--color-danger)]",
  };
  const color = colors[status] || "text-[var(--color-text-muted)]";
  const Icon = status === "completed" ? CheckCircle2 : undefined;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      {Icon && <Icon size={12} />}
      {status}
    </span>
  );
}

function AddSessionForm({ onAdded }: { onAdded: () => void }) {
  const [clientId, setClientId] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState("60");
  const [busy, setBusy] = useState(false);
  const field =
    "mt-1 block w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]";

  async function submit() {
    if (!clientId.trim() || !when) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/coaching/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId.trim().toLowerCase(),
          scheduledAt: new Date(when).toISOString(),
          durationMins: Number(duration) || 60,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(body.error || "Could not add the session");
        return;
      }
      toast.success("Session added");
      onAdded();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="mb-6 grid gap-3 border border-[var(--color-border-muted)] p-4 sm:grid-cols-[2fr_1.5fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="text-xs text-[var(--color-text-muted)]">
        Client email
        <input id="add-session-client" type="email" required className={field} value={clientId} onChange={(e) => setClientId(e.target.value)} />
      </label>
      <label className="text-xs text-[var(--color-text-muted)]">
        Date and time
        <input id="add-session-when" type="datetime-local" required className={field} value={when} onChange={(e) => setWhen(e.target.value)} />
      </label>
      <label className="text-xs text-[var(--color-text-muted)]">
        Minutes
        <input id="add-session-duration" type="number" min={15} max={240} className={field} value={duration} onChange={(e) => setDuration(e.target.value)} />
      </label>
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "Adding…" : "Add"}
      </Button>
      <p className="text-xs text-[var(--color-text-muted)] sm:col-span-4">
        For a session that is not on your Google Calendar. Sessions on the calendar are added by the sync.
      </p>
    </form>
  );
}
