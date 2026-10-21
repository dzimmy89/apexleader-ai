"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { URLS } from "@/content/site";

type Queue = "add" | "remove" | "ending" | "active" | "keep" | "removed" | "lapsed";

interface Seat {
  email: string;
  name?: string;
  packageId: string | null;
  endsAt: string;
  status: string;
  invitedAt?: string | null;
  addedAt?: string | null;
  removedAt?: string | null;
  queue: Queue;
}

interface Settings {
  inviteHookUrl: string | null;
  headsUpEmails: boolean;
}

const PACKAGE_NAMES: Record<string, string> = {
  foundations: "Kickstart",
  mastery: "Operator",
  institutional: "Inner Circle",
  manual: "Added by hand",
};

const QUEUE_LABEL: Record<Queue, string> = {
  add: "To add",
  remove: "Remove now",
  ending: "Ends this week",
  active: "In Skool",
  keep: "Paying member",
  removed: "Removed",
  lapsed: "Never added",
};

function day(iso?: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
}

/**
 * Coaching clients' Skool seats: who to add, who to remove, and a way to grant
 * a seat by hand. Skool has no API for removal, so the coach clicks in Skool
 * and then presses Done here.
 */
export function SkoolSeatsPanel() {
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState("");
  const [until, setUntil] = useState("");
  const [hook, setHook] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/membership/skool-access");
    if (!res.ok) return;
    const body = (await res.json()) as { records: Seat[]; settings: Settings };
    setSeats(body.records);
    setSettings(body.settings);
    setHook(body.settings.inviteHookUrl || "");
  }

  useEffect(() => {
    void load();
  }, []);

  async function post(payload: Record<string, unknown>, success: string): Promise<boolean> {
    setBusy(true);
    const res = await fetch("/api/admin/membership/skool-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string; invited?: boolean };
    setBusy(false);
    if (!res.ok) {
      toast.error(body.error || "Could not save");
      return false;
    }
    toast.success(body.invited ? `${success} Zapier sent the Skool invite.` : success);
    await load();
    return true;
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Email copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  const list = seats || [];
  const toAdd = list.filter((s) => s.queue === "add");
  const toRemove = list.filter((s) => s.queue === "remove");
  const ending = list.filter((s) => s.queue === "ending");

  const row = (s: Seat, actions: React.ReactNode) => (
    <li
      key={s.email}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] py-2 text-sm"
    >
      <div className="min-w-0">
        <a className="hover:underline" href={`/admin/contacts/${encodeURIComponent(s.email)}`}>
          {s.name ? `${s.name} · ` : ""}
          {s.email}
        </a>
        <p className="text-xs text-[var(--color-text-muted)]">
          {PACKAGE_NAMES[s.packageId || ""] || s.packageId || "Coaching"} · until {day(s.endsAt)}
          {s.invitedAt ? ` · invited ${day(s.invitedAt)}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => void copy(s.email)}>
          Copy email
        </Button>
        {actions}
      </div>
    </li>
  );

  return (
    <section className="space-y-6 border border-[var(--color-border)] p-4">
      <div className="space-y-1">
        <h2 className="text-lg">Coaching clients in Skool</h2>
        <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
          Private coaching clients get a Skool seat for their coaching period: Kickstart 30 days, Operator 3 months,
          Inner Circle 6 months from the first payment. Add or remove them in{" "}
          <a className="underline" href={`${URLS.skoolCommunity}/-/members`} target="_blank" rel="noopener noreferrer">
            Skool&apos;s member admin
          </a>
          , then press Done. Your 7am email lists these until they are done.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Add to Skool ({toAdd.length})
          </h3>
          {toAdd.length ? (
            <ul className="mt-2">
              {toAdd.map((s) =>
                row(
                  s,
                  <Button size="sm" disabled={busy} onClick={() => void post({ op: "mark", email: s.email, action: "added" }, "Marked as added.")}>
                    Done, added
                  </Button>
                )
              )}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Nobody to add.</p>
          )}
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Remove from Skool ({toRemove.length})
          </h3>
          {toRemove.length ? (
            <ul className="mt-2">
              {toRemove.map((s) =>
                row(
                  s,
                  <>
                    <Button size="sm" disabled={busy} onClick={() => void post({ op: "mark", email: s.email, action: "removed" }, "Marked as removed.")}>
                      Done, removed
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void post({ op: "mark", email: s.email, action: "keep" }, "They keep Skool.")}>
                      Keep (pays for Skool)
                    </Button>
                  </>
                )
              )}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Nobody to remove.</p>
          )}
        </div>
      </div>

      {ending.length ? (
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Ending in the next 7 days ({ending.length})
          </h3>
          <ul className="mt-2">{ending.map((s) => row(s, null))}</ul>
        </div>
      ) : null}

      <div className="space-y-2">
        <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Grant Skool access</h3>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            id="skool-grant-email"
            className="max-w-xs"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="text-xs text-[var(--color-text-muted)]">
            Until (blank = end of their coaching period)
            <Input id="skool-grant-until" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
          </label>
          <Button
            size="sm"
            disabled={!email || busy}
            onClick={async () => {
              if (await post({ op: "grant", email, until }, "Added to the Skool queue.")) {
                setEmail("");
                setUntil("");
              }
            }}
          >
            Grant Skool access
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Hide" : "Show"} all coaching seats ({list.length})
        </button>
        {showAll ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                <tr>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Package</th>
                  <th className="py-2 pr-4">Ends</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.email} className="border-t border-[var(--color-border)]">
                    <td className="py-2 pr-4">{s.name ? `${s.name} · ${s.email}` : s.email}</td>
                    <td className="py-2 pr-4">{PACKAGE_NAMES[s.packageId || ""] || s.packageId || ""}</td>
                    <td className="py-2 pr-4">{day(s.endsAt)}</td>
                    <td className="py-2 pr-4">{QUEUE_LABEL[s.queue]}</td>
                    <td className="py-2 text-right">
                      {s.queue === "keep" || s.queue === "removed" || s.queue === "lapsed" ? null : (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => void post({ op: "mark", email: s.email, action: "keep" }, "They keep Skool.")}>
                          Keep after coaching
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {settings ? (
        <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Automation (optional)</h3>
          <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">
            Auto-invite: make a Zap with a Webhooks by Zapier &quot;Catch Hook&quot; trigger and Skool&apos;s &quot;Invite
            Member&quot; action, map the email field, and paste the hook URL here. New coaching clients are then invited
            the moment they pay. Removal always stays manual because Skool has no way to automate it.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="skool-invite-hook"
              className="max-w-md"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
            />
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void post({ op: "settings", inviteHookUrl: hook }, hook ? "Auto-invite is on." : "Auto-invite is off.")}>
              Save
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              id="skool-heads-up"
              type="checkbox"
              checked={settings.headsUpEmails}
              disabled={busy}
              onChange={(e) =>
                void post(
                  { op: "settings", headsUpEmails: e.target.checked },
                  e.target.checked ? "Heads-up emails are on." : "Heads-up emails are off."
                )
              }
            />
            Email clients 7 days before their coaching access ends, with the link to keep it on the membership
          </label>
        </div>
      ) : null}
    </section>
  );
}
