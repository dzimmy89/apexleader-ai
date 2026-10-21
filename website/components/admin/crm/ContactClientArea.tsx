"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ClientFile } from "@/lib/coaching/client-files";
import { ClientIntake } from "@/components/admin/crm/ClientIntake";
import { SyllabusEditor } from "@/components/admin/crm/SyllabusEditor";
import { fieldClass, labelClass, panelClass } from "@/components/admin/crm/client-area-styles";

/**
 * The coaching client tabs on the contact page: the discovery call intake,
 * the syllabus editor, and recordings and materials shared with the client.
 */
export interface ContactClientAreaProps {
  email: string;
  section: "intake" | "syllabus" | "recordings";
  /** Called when David confirms the intake, to move on to the syllabus. */
  onIntakeConfirmed?: () => void;
}

export function ContactClientArea({ email, section, onIntakeConfirmed }: ContactClientAreaProps) {
  if (section === "intake") return <ClientIntake email={email} onConfirmed={onIntakeConfirmed} />;
  return section === "syllabus" ? <SyllabusEditor email={email} /> : <ClientFiles email={email} />;
}

function ClientFiles({ email }: { email: string }) {
  const base = `/api/admin/contacts/${encodeURIComponent(email)}/files`;
  const [files, setFiles] = useState<ClientFile[] | null>(null);
  const [mode, setMode] = useState<"link" | "upload">("link");
  const [kind, setKind] = useState<"recording" | "material">("recording");
  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch(base)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setFiles(json.files))
      .catch(() => toast.error("Could not load recordings"));
  }, [base]);

  useEffect(load, [load]);

  async function add() {
    setBusy(true);
    try {
      let res: Response;
      if (mode === "upload") {
        if (!file) throw new Error("Choose a file");
        const form = new FormData();
        form.set("file", file);
        form.set("kind", kind);
        form.set("title", title || file.name);
        form.set("note", note);
        form.set("sessionDate", kind === "recording" ? sessionDate : "");
        res = await fetch(base, { method: "POST", body: form });
      } else {
        res = await fetch(base, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, title, note, url, sessionDate: kind === "recording" ? sessionDate : null }),
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success("Added to their account");
      setTitle("");
      setUrl("");
      setNote("");
      setFile(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function setHidden(id: string, hidden: boolean) {
    const res = await fetch(base, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, hidden }),
    });
    if (res.ok) load();
    else toast.error("Could not change it");
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this from their account?")) return;
    const res = await fetch(`${base}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) load();
    else toast.error("Could not remove it");
  }

  return (
    <div className="space-y-4">
      <div className={panelClass}>
        <p className="mb-3 text-sm text-[var(--color-text-muted)]">
          Google Meet recordings of sessions on your calendar are added here by themselves after the call, and the client
          gets an email when the replay is ready. To add something else, paste a link or upload a PDF or small file (up to
          30 MB). Only this client can open them, after signing in.
        </p>
        <div className="mb-3 flex gap-2">
          <Button variant={mode === "link" ? "default" : "outline"} size="sm" onClick={() => setMode("link")}>
            Add a link
          </Button>
          <Button variant={mode === "upload" ? "default" : "outline"} size="sm" onClick={() => setMode("upload")}>
            Upload a file
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className={labelClass}>Type</span>
            <select className={fieldClass} value={kind} onChange={(e) => setKind(e.target.value as "recording" | "material")}>
              <option value="recording">Call recording</option>
              <option value="material">Material</option>
            </select>
          </label>
          {kind === "recording" ? (
            <label>
              <span className={labelClass}>Session date</span>
              <Input className="mt-1" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            </label>
          ) : (
            <div />
          )}
          <label className="md:col-span-2">
            <span className={labelClass}>Title</span>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session 3: lending risk" />
          </label>
          {mode === "link" ? (
            <label className="md:col-span-2">
              <span className={labelClass}>Link</span>
              <Input className="mt-1" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/…" />
            </label>
          ) : (
            <label className="md:col-span-2">
              <span className={labelClass}>File</span>
              <input className={fieldClass} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          )}
          <label className="md:col-span-2">
            <span className={labelClass}>Note (optional)</span>
            <Textarea className="mt-1" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>
        <Button className="mt-3" disabled={busy} onClick={() => void add()}>
          {busy ? "Saving…" : "Add to their account"}
        </Button>
      </div>

      <div className={panelClass}>
        {files === null ? (
          <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Nothing shared yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border-muted)]">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <a href={`/api/account/files/${f.id}`} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">
                    {f.title}
                  </a>{" "}
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {f.kind === "recording" ? `Recording${f.sessionDate ? ` · ${f.sessionDate}` : ""}` : "Material"}
                    {f.driveFileId ? " · Meet recording" : f.url ? " · link" : f.size ? ` · ${Math.ceil(f.size / 1024)} KB` : ""}
                    {f.hidden ? " · hidden from client" : ""}
                  </span>
                </span>
                <span className="flex shrink-0 gap-3">
                  <button type="button" className="text-xs text-[var(--color-text-muted)] hover:underline" onClick={() => void setHidden(f.id, !f.hidden)}>
                    {f.hidden ? "Show" : "Hide"}
                  </button>
                  <button type="button" className="text-xs text-red-400" onClick={() => void remove(f.id)}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
