"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Intake, IntakeEvidence, IntakeField, IntakeForm } from "@/lib/coaching/intake";
import type { TranscriptCandidate } from "@/lib/coaching/meet-transcripts";
import { fieldClass, labelClass, panelClass } from "@/components/admin/crm/client-area-styles";

/**
 * Discovery call intake for one client: bring in the call transcript (from
 * the Meet notes doc in Drive, a paste or a file), let Gemini fill the form
 * with a quote for each answer, then David corrects and confirms it. The
 * confirmed form is what the syllabus draft is built from.
 */
interface IntakeView {
  intake: Intake;
  ai: boolean;
  stages: { id: string; number: number; title: string }[];
  levels: { id: string; label: string; hint: string }[];
  courses: { id: string; title: string; stageNumber: number }[];
  candidates?: TranscriptCandidate[];
}

const MATCH_LABEL: Record<TranscriptCandidate["match"], string> = {
  event: "Attached to their call",
  "folder-time": "Made right after their call",
  recent: "Recent notes doc",
};

function when(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function Field({
  label,
  evidence,
  missing,
  wide,
  children,
}: {
  label: string;
  evidence: IntakeEvidence[];
  missing: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <span className={labelClass}>
        {label}
        {missing ? <span className="ml-2 normal-case text-amber-400">not covered on the call</span> : null}
      </span>
      {children}
      {evidence.map((e, i) => (
        <p key={i} className="mt-1 text-xs italic text-[var(--color-text-muted)]">
          “{e.quote}”{e.at ? ` · ${e.at}` : ""}
        </p>
      ))}
    </div>
  );
}

export function ClientIntake({ email, onConfirmed }: { email: string; onConfirmed?: () => void }) {
  const base = `/api/admin/contacts/${encodeURIComponent(email)}/intake`;
  const [view, setView] = useState<IntakeView | null>(null);
  const [form, setForm] = useState<IntakeForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<TranscriptCandidate[] | null>(null);
  const [driveError, setDriveError] = useState("");
  const [paste, setPaste] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  const apply = useCallback((next: IntakeView) => {
    setView(next);
    setForm(next.intake.form);
    setDirty(false);
    if (next.candidates) setCandidates(next.candidates);
  }, []);

  useEffect(() => {
    fetch(base)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(apply)
      .catch(() => toast.error("Could not load the intake"));
  }, [base, apply]);

  async function send(label: string, init: RequestInit, done?: string): Promise<IntakeView | null> {
    setBusy(label);
    try {
      const res = await fetch(base, init);
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "drive_access") setDriveError(json.error);
        throw new Error(json.error || "Failed");
      }
      apply(json);
      if (done) toast.success(done);
      return json;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      return null;
    } finally {
      setBusy(null);
    }
  }

  function post(label: string, body: Record<string, unknown>, done?: string) {
    return send(label, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, done);
  }

  if (!view || !form) return <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>;
  const { intake } = view;
  const confirmed = intake.status === "confirmed";
  const evidence = (field: IntakeField) => intake.evidence.filter((e) => e.field === field);
  const missing = new Set(intake.missing);
  const set = <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => {
    setForm({ ...form, [key]: value });
    setDirty(true);
  };

  const meta = (field: IntakeField) => ({
    evidence: evidence(field),
    missing: missing.has(field) && Boolean(intake.filledByAiAt),
  });

  return (
    <div className="space-y-4">
      <div className={panelClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Discovery call transcript</p>
            {intake.transcript ? (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {intake.transcript.docUrl ? (
                  <a href={intake.transcript.docUrl} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">
                    {intake.transcript.docTitle}
                  </a>
                ) : (
                  intake.transcript.docTitle
                )}
                {intake.transcript.callDate ? ` · ${when(intake.transcript.callDate)}` : ""} · {Math.round(intake.transcript.text.length / 1000)}k characters
                {" · "}
                <button type="button" className="underline" onClick={() => setShowTranscript(!showTranscript)}>
                  {showTranscript ? "hide" : "read it"}
                </button>
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Turn on transcription when you record the call in Meet. Its notes doc lands in Meet Recordings in your Drive.
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => void post("find", { action: "find" })}>
            {busy === "find" ? "Looking…" : "Find it in Google Drive"}
          </Button>
        </div>

        {showTranscript && intake.transcript ? (
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded border border-[var(--color-border-muted)] p-3 text-xs">
            {intake.transcript.text}
          </pre>
        ) : null}

        {driveError ? <p className="mt-3 rounded border border-amber-500/40 p-2 text-xs text-amber-400">{driveError}</p> : null}

        {candidates ? (
          candidates.length ? (
            <ul className="mt-3 divide-y divide-[var(--color-border-muted)] text-sm">
              {candidates.map((c) => (
                <li key={c.docId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="min-w-0 flex-1">
                    <a href={c.url} target="_blank" rel="noreferrer" className="hover:text-[var(--color-accent)]">
                      {c.title}
                    </a>
                    <span className="block text-xs text-[var(--color-text-muted)]">
                      {MATCH_LABEL[c.match]}
                      {c.callStart ? ` · ${when(c.callStart)}` : ""}
                      {c.eventSummary ? ` · ${c.eventSummary}` : ""}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    disabled={Boolean(busy)}
                    onClick={() => void post("import", { action: "import", docId: c.docId, callDate: c.callStart }, "Transcript added")}
                  >
                    Use this one
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              No notes docs found for this client. Paste the transcript or upload the file below.
            </p>
          )
        ) : null}

        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-[var(--color-text-muted)]">Paste or upload a transcript instead</summary>
          <Textarea className="mt-2" rows={5} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste the call transcript here" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={Boolean(busy) || !paste.trim()}
              onClick={() => void post("paste", { action: "paste", text: paste }, "Transcript added").then((ok) => ok && setPaste(""))}
            >
              Use this text
            </Button>
            <label className="text-xs text-[var(--color-text-muted)]">
              or upload .txt, .vtt, .srt, .md, .docx{" "}
              <input
                type="file"
                accept=".txt,.vtt,.srt,.md,.docx,text/plain"
                className="ml-1 text-xs"
                disabled={Boolean(busy)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const data = new FormData();
                  data.set("file", file);
                  void send("upload", { method: "POST", body: data }, "Transcript added");
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </details>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border-muted)] pt-3">
          <Button
            disabled={Boolean(busy) || !intake.transcript || !view.ai}
            onClick={() => {
              if (dirty && !window.confirm("Gemini will replace the answers in the form. Continue?")) return;
              void post("fill", { action: "fill" }, "Form filled from the call. Check each answer.");
            }}
          >
            {busy === "fill" ? "Gemini is reading the call…" : intake.filledByAiAt ? "Fill again with Gemini" : "Fill the form with Gemini"}
          </Button>
          <span className="text-xs text-[var(--color-text-muted)]">
            {!view.ai
              ? "Gemini is not set up yet. Fill the form by hand."
              : intake.filledByAiAt
                ? `Filled ${when(intake.filledByAiAt)}. Quotes under each answer show where it came from.`
                : "Takes up to a minute or two."}
          </span>
        </div>
      </div>

      <div className={panelClass}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Intake form{" "}
            <span className={confirmed ? "text-emerald-400" : "text-[var(--color-text-muted)]"}>
              · {confirmed ? `Confirmed ${when(intake.confirmedAt)}` : intake.status === "draft" ? "Draft" : "Empty"}
            </span>
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field {...meta("goals")} label="Goals (up to 3, in their words)" wide>
            {[0, 1, 2].map((i) => (
              <Input
                key={i}
                className="mt-1"
                value={form.goals[i] || ""}
                placeholder={`Goal ${i + 1}`}
                onChange={(e) => {
                  const goals = [...form.goals];
                  goals[i] = e.target.value;
                  set("goals", goals.slice(0, 3));
                }}
              />
            ))}
          </Field>
          <Field {...meta("targetOutcome")} label="Target outcome" wide>
            <Input className="mt-1" value={form.targetOutcome} onChange={(e) => set("targetOutcome", e.target.value)} />
          </Field>
          <Field {...meta("targetDate")} label="By when">
            <Input className="mt-1" type="date" value={form.targetDate} onChange={(e) => set("targetDate", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field {...meta("timelineWeeks")} label="Weeks">
              <Input
                className="mt-1"
                type="number"
                min={1}
                max={104}
                value={form.timelineWeeks}
                onChange={(e) => set("timelineWeeks", Number(e.target.value))}
              />
            </Field>
            <Field {...meta("hoursPerWeek")} label="Hours / week">
              <Input
                className="mt-1"
                type="number"
                min={0.5}
                max={40}
                step={0.5}
                value={form.hoursPerWeek}
                onChange={(e) => set("hoursPerWeek", Number(e.target.value))}
              />
            </Field>
          </div>
          <Field {...meta("level")} label="AI experience">
            <select className={fieldClass} value={form.level} onChange={(e) => set("level", e.target.value as IntakeForm["level"])}>
              {view.levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}: {l.hint}
                </option>
              ))}
            </select>
          </Field>
          <Field {...meta("technical")} label="Technical comfort">
            <select className={fieldClass} value={form.technical} onChange={(e) => set("technical", e.target.value as IntakeForm["technical"])}>
              <option value="">Not discussed</option>
              <option value="low">No-code only</option>
              <option value="medium">Some formulas or scripting</option>
              <option value="high">Writes code</option>
            </select>
          </Field>
          <Field {...meta("business")} label="Their business and what they want AI to help with" wide>
            <textarea className={`${fieldClass} min-h-[72px]`} value={form.business} onChange={(e) => set("business", e.target.value)} />
          </Field>
          <Field {...meta("tools")} label="Software and AI tools they use" wide>
            <Input className="mt-1" value={form.tools} onChange={(e) => set("tools", e.target.value)} />
          </Field>
          <Field {...meta("focusStageIds")} label="Where they want to get to" wide>
            <div className="mt-2 flex flex-wrap gap-2">
              {view.stages.map((s) => {
                const on = form.focusStageIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set("focusStageIds", on ? form.focusStageIds.filter((f) => f !== s.id) : [...form.focusStageIds, s.id])}
                    className={`rounded border px-2.5 py-1 text-xs ${
                      on ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-[var(--color-border-muted)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {s.number}. {s.title}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field {...meta("knownCourseIds")} label="Courses they already know (left out of the plan)" wide>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {form.knownCourseIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="rounded border border-[var(--color-border-muted)] px-2 py-0.5 text-xs"
                  onClick={() => set("knownCourseIds", form.knownCourseIds.filter((k) => k !== id))}
                  aria-label={`Remove ${id}`}
                >
                  {view.courses.find((c) => c.id === id)?.title || id} ✕
                </button>
              ))}
              <select
                className="rounded border border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)] px-2 py-0.5 text-xs"
                value=""
                onChange={(e) => e.target.value && set("knownCourseIds", [...form.knownCourseIds, e.target.value])}
              >
                <option value="">Add a course…</option>
                {view.courses
                  .filter((c) => !form.knownCourseIds.includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Stage {c.stageNumber}: {c.title}
                    </option>
                  ))}
              </select>
            </div>
          </Field>
          <Field {...meta("concerns")} label="Worries and limits" wide>
            <Textarea className="mt-1" rows={2} value={form.concerns} onChange={(e) => set("concerns", e.target.value)} />
          </Field>
          <Field {...meta("learningStyle")} label="How they like to learn" wide>
            <Input className="mt-1" value={form.learningStyle} onChange={(e) => set("learningStyle", e.target.value)} />
          </Field>
          <Field {...meta("coachNotes")} label="Your notes (only you see these)" wide>
            <Textarea className="mt-1" rows={3} value={form.coachNotes} onChange={(e) => set("coachNotes", e.target.value)} />
          </Field>
          <Field {...meta("goalsSummary")} label="“Your goals” summary the client sees in their account" wide>
            <Textarea className="mt-1" rows={3} value={form.goalsSummary} onChange={(e) => set("goalsSummary", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" disabled={Boolean(busy) || !dirty} onClick={() => void post("save", { action: "save", form }, "Saved")}>
            Save
          </Button>
          {confirmed ? (
            <>
              {dirty ? (
                <Button disabled={Boolean(busy)} onClick={() => void post("confirm", { action: "confirm", form }, "Saved and confirmed")}>
                  Save and keep confirmed
                </Button>
              ) : null}
              <Button variant="outline" disabled={Boolean(busy)} onClick={() => void post("reopen", { action: "reopen" })}>
                Mark as draft again
              </Button>
              {onConfirmed ? (
                <Button variant="outline" onClick={onConfirmed}>
                  Go to the syllabus →
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              disabled={Boolean(busy)}
              onClick={() =>
                void post("confirm", { action: "confirm", form }, "Confirmed. Draft the syllabus next.").then((ok) => ok && onConfirmed?.())
              }
            >
              Confirm and go to the syllabus
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
