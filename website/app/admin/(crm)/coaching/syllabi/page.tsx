"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";

interface QueueRow {
  email: string;
  name: string;
  packageName: string;
  intake: string;
  group: "needs-intake" | "needs-syllabus" | "unpublished" | "behind" | "on-track" | "done";
  version: number;
  pace: string | null;
  done: number;
  total: number;
  overdue: number;
  currentWeek: number;
  weeks: number;
  next: string;
}

const GROUPS: { id: QueueRow["group"]; title: string; hint: string; tab: string }[] = [
  { id: "needs-intake", title: "Needs intake", hint: "Add the discovery call and confirm the form.", tab: "intake" },
  { id: "needs-syllabus", title: "Needs a syllabus", hint: "The intake is confirmed; draft and publish the plan.", tab: "syllabus" },
  { id: "unpublished", title: "Edits not published", hint: "The client still sees the last published version.", tab: "syllabus" },
  { id: "behind", title: "Falling behind", hint: "Work from past weeks is still open.", tab: "syllabus" },
  { id: "on-track", title: "On track", hint: "", tab: "syllabus" },
  { id: "done", title: "Finished", hint: "", tab: "syllabus" },
];

export default function SyllabiQueuePage() {
  const [rows, setRows] = useState<QueueRow[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/coaching/syllabi")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: { clients: QueueRow[] }) => setRows(json.clients))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Syllabi"
        description="Every current coaching client, from discovery call intake to a published syllabus and how they are keeping pace."
      />
      {rows === null ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No current coaching clients.</p>
      ) : (
        GROUPS.map((g) => {
          const list = rows.filter((r) => r.group === g.id);
          if (!list.length) return null;
          return (
            <section key={g.id} className="rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4">
              <h2 className="text-sm font-medium">
                {g.title} <span className="text-[var(--color-text-muted)]">· {list.length}</span>
              </h2>
              {g.hint ? <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{g.hint}</p> : null}
              <ul className="mt-3 divide-y divide-[var(--color-border-muted)]">
                {list.map((r) => (
                  <li key={r.email} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                    <Link
                      href={`/admin/contacts/${encodeURIComponent(r.email)}?tab=${g.tab}`}
                      className="min-w-0 flex-1 hover:text-[var(--color-accent)]"
                    >
                      <span className="font-medium">{r.name || r.email}</span>
                      <span className="block truncate text-xs text-[var(--color-text-muted)]">
                        {[r.packageName, r.name ? r.email : "", r.next ? `Next: ${r.next}` : ""].filter(Boolean).join(" · ")}
                      </span>
                    </Link>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {r.total
                        ? `${r.done}/${r.total} done${r.weeks && r.currentWeek > 0 && r.currentWeek <= r.weeks ? ` · week ${r.currentWeek} of ${r.weeks}` : ""}${
                            r.overdue ? ` · ${r.overdue} overdue` : ""
                          }`
                        : r.intake === "empty"
                          ? "No transcript yet"
                          : `Intake ${r.intake}`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
