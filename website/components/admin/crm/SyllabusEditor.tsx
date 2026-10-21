"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceLevel, Syllabus, SyllabusStatus } from "@/lib/coaching/syllabus";
import type { PlanItem, PlanItemKind, PlanOp, PlanWeek } from "@/lib/coaching/syllabus-plan";
import { fieldClass, labelClass, panelClass } from "@/components/admin/crm/client-area-styles";

/**
 * The syllabus for one coaching client, on the contact page. Gemini (or the
 * rule-based planner) drafts it from the confirmed intake; David edits it
 * week by week, asks Gemini for changes as the coaching goes, and publishes
 * versions to the client's /account with a short note on what changed.
 */
interface CatalogCourse {
  id: string;
  title: string;
  stageId: string;
  stageNumber: number;
  minutes: number;
  lessons: number;
  items: { id: string; kind: PlanItemKind; slug: string | null; title: string; minutes: number }[];
}

interface Suggestion {
  op: PlanOp;
  label: string;
  reason: string;
}

interface SyllabusView {
  syllabus: Syllabus | null;
  status: SyllabusStatus | null;
  warnings: string[];
  versions: { version: number; publishedAt: string; changeNote: string }[];
  intake: { status: string; goals: string[]; timelineWeeks: number; hoursPerWeek: number } | null;
  ai: boolean;
  stages: { id: string; number: number; title: string; level: string }[];
  levels: { id: ExperienceLevel; label: string; hint: string }[];
  courses: CatalogCourse[];
  dropped?: string[];
  suggestions?: Suggestion[];
  suggestionSummary?: string;
  emailError?: string | null;
}

const PACE: Record<SyllabusStatus["pace"], { label: string; className: string }> = {
  "not-started": { label: "Starts soon", className: "text-[var(--color-text-muted)]" },
  ahead: { label: "Ahead", className: "text-emerald-400" },
  "on-track": { label: "On track", className: "text-emerald-400" },
  behind: { label: "Behind", className: "text-red-400" },
  done: { label: "Finished", className: "text-emerald-400" },
};

const KIND_LABEL: Record<PlanItemKind, string> = {
  lesson: "Lesson",
  exercise: "Exercise",
  quiz: "Quiz",
  task: "Task",
  milestone: "Milestone",
};

function hours(minutes: number): string {
  return `${Math.round((minutes / 60) * 10) / 10} h`;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function taskId(kind: "task" | "milestone"): string {
  return `${kind}:${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function emptyWeek(): PlanWeek {
  return { goal: "", note: "", sessionPlan: "", paused: false, items: [] };
}

export function SyllabusEditor({ email }: { email: string }) {
  const base = `/api/admin/contacts/${encodeURIComponent(email)}/syllabus`;
  const [view, setView] = useState<SyllabusView | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanWeek[]>([]);
  const [dirty, setDirty] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [perWeek, setPerWeek] = useState("3");
  const [note, setNote] = useState("");
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [suggestionSummary, setSuggestionSummary] = useState("");
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [instruction, setInstruction] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [emailClient, setEmailClient] = useState(true);

  const apply = useCallback((next: SyllabusView) => {
    setView(next);
    const s = next.syllabus;
    if (s && next.status) {
      setPlan(
        next.status.weeks.map((w) => ({
          goal: w.goal,
          note: w.note,
          sessionPlan: w.sessionPlan,
          paused: w.paused,
          items: w.items.map(({ id, kind, courseId, slug, title, detail, minutes, skipped }) => ({
            id,
            kind,
            courseId,
            slug,
            title,
            detail,
            minutes,
            skipped,
          })),
        }))
      );
      setStartDate(s.startDate);
      setPerWeek(String(s.inputs.hoursPerWeek));
      setNote(s.note);
      const current = next.status.currentWeek;
      setOpenWeeks((prev) => (prev.size ? prev : new Set([Math.max(1, Math.min(current, next.status!.weeks.length))])));
    } else {
      setPlan([]);
      if (next.intake) setPerWeek(String(next.intake.hoursPerWeek));
    }
    setDirty(false);
    if (next.dropped?.length) toast.warning(`Left out ${next.dropped.length} item(s) that are not in the library.`);
    if (next.emailError) toast.error(`Published, but the email did not send: ${next.emailError}`);
  }, []);

  useEffect(() => {
    fetch(base)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(apply)
      .catch(() => toast.error("Could not load the syllabus"));
  }, [base, apply]);

  const catalog = useMemo(() => {
    const map = new Map<string, { title: string; minutes: number; courseTitle: string }>();
    for (const c of view?.courses || []) for (const i of c.items) map.set(i.id, { title: i.title, minutes: i.minutes, courseTitle: c.title });
    return map;
  }, [view]);

  const doneIds = useMemo(() => {
    const set = new Set<string>();
    for (const w of view?.status?.weeks || []) for (const i of w.items) if (i.done) set.add(i.id);
    return set;
  }, [view]);

  async function send(label: string, body: Record<string, unknown>, done?: string): Promise<SyllabusView | null> {
    setBusy(label);
    try {
      const res = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
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

  function edit(next: PlanWeek[]) {
    setPlan(next);
    setDirty(true);
  }

  function updateWeek(index: number, patch: Partial<PlanWeek>) {
    edit(plan.map((w, i) => (i === index ? { ...w, ...patch } : w)));
  }

  function updateItem(weekIndex: number, itemIndex: number, patch: Partial<PlanItem>) {
    edit(plan.map((w, i) => (i === weekIndex ? { ...w, items: w.items.map((it, j) => (j === itemIndex ? { ...it, ...patch } : it)) } : w)));
  }

  function moveItem(weekIndex: number, itemIndex: number, delta: -1 | 1) {
    const next = plan.map((w) => ({ ...w, items: [...w.items] }));
    const items = next[weekIndex]!.items;
    const target = itemIndex + delta;
    if (target >= 0 && target < items.length) {
      [items[itemIndex], items[target]] = [items[target]!, items[itemIndex]!];
    } else {
      const toWeek = weekIndex + delta;
      if (toWeek < 0) return;
      while (next.length <= toWeek) next.push(emptyWeek());
      const [item] = items.splice(itemIndex, 1);
      if (delta < 0) next[toWeek]!.items.push(item!);
      else next[toWeek]!.items.unshift(item!);
      setOpenWeeks(new Set([...openWeeks, toWeek + 1]));
    }
    edit(next);
  }

  function moveToWeek(weekIndex: number, itemIndex: number, toWeek: number) {
    const next = plan.map((w) => ({ ...w, items: [...w.items] }));
    while (next.length < toWeek) next.push(emptyWeek());
    const [item] = next[weekIndex]!.items.splice(itemIndex, 1);
    next[toWeek - 1]!.items.push(item!);
    edit(next);
  }

  function removeItem(weekIndex: number, itemIndex: number) {
    edit(plan.map((w, i) => (i === weekIndex ? { ...w, items: w.items.filter((_, j) => j !== itemIndex) } : w)));
  }

  function addItems(weekIndex: number, items: PlanItem[]) {
    const present = new Set(plan.flatMap((w) => w.items.map((i) => i.id)));
    const fresh = items.filter((i) => !present.has(i.id));
    if (!fresh.length) {
      toast.info("Already in the plan");
      return;
    }
    const next = plan.map((w) => ({ ...w, items: [...w.items] }));
    while (next.length <= weekIndex) next.push(emptyWeek());
    next[weekIndex]!.items.push(...fresh);
    edit(next);
    setOpenWeeks(new Set([...openWeeks, weekIndex + 1]));
  }

  function toggleWeek(n: number) {
    const next = new Set(openWeeks);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    setOpenWeeks(next);
  }

  if (!view) return <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>;
  const { syllabus, status, intake } = view;
  const intakeConfirmed = intake?.status === "confirmed";
  const hoursNum = Number(perWeek) || 3;
  const settingsDirty = Boolean(syllabus) && (startDate !== syllabus!.startDate || note !== syllabus!.note || hoursNum !== syllabus!.inputs.hoursPerWeek);

  const itemTitle = (it: PlanItem) => (it.courseId ? catalog.get(it.id)?.title || it.slug || it.id : it.title);
  const itemMinutes = (it: PlanItem) => (it.courseId ? catalog.get(it.id)?.minutes || 0 : it.minutes);
  const weekMinutes = (w: PlanWeek) => w.items.filter((i) => !i.skipped).reduce((n, i) => n + itemMinutes(i), 0);

  return (
    <div className="space-y-4">
      {/* Draft */}
      <div className={panelClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-sm font-medium">{syllabus ? "Redraft the syllabus" : "Draft the syllabus"}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {intakeConfirmed
                ? `From the confirmed intake: ${intake!.goals.join("; ") || "no goals"} · ${intake!.timelineWeeks} weeks at ${intake!.hoursPerWeek} h a week.`
                : "Confirm the intake form first (Intake tab) so the draft is built from the client's goals. You can still plan from the quick answers below."}
              {syllabus ? " A redraft replaces the open items; anything the client has finished stays." : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {intakeConfirmed ? (
              <>
                <Button
                  disabled={Boolean(busy) || !view.ai}
                  title={view.ai ? undefined : "Gemini is not set up yet"}
                  onClick={() => {
                    if (syllabus && !window.confirm("Replace the open items with a new draft from Gemini?")) return;
                    void send("draft", { action: "draft", startDate, note: syllabus ? note : undefined }, "Draft ready. Review it below.");
                  }}
                >
                  {busy === "draft" ? "Gemini is drafting…" : "Draft with Gemini"}
                </Button>
                <Button
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() => {
                    if (syllabus && !window.confirm("Replace the open items with a rule-based plan?")) return;
                    void send("plan", { action: "plan", startDate, note }, "Planned");
                  }}
                >
                  Plan by rules
                </Button>
              </>
            ) : null}
          </div>
        </div>
        {!view.ai && intakeConfirmed ? (
          <p className="mt-2 text-xs text-amber-400">Gemini is not set up yet, so drafts use the rule-based planner.</p>
        ) : null}
        {!intakeConfirmed ? <QuickPlan view={view} busy={Boolean(busy)} startDate={startDate} note={note} onPlan={(b) => void send("plan", b, "Planned")} /> : null}
        {busy === "draft" ? <p className="mt-2 text-xs text-[var(--color-text-muted)]">This can take a minute or two.</p> : null}
      </div>

      {syllabus && status ? (
        <>
          {/* Status and settings */}
          <div className={panelClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm">
                  <span className="font-medium">
                    {syllabus.status === "published"
                      ? syllabus.unpublishedChanges
                        ? `Version ${syllabus.version} is live · your edits are not published yet`
                        : `Published · version ${syllabus.version}`
                      : syllabus.version
                        ? "Hidden from the client"
                        : "Draft"}
                  </span>
                  {" · "}
                  {status.weeks.length} weeks · {status.done} of {status.total} done · <span className={PACE[status.pace].className}>{PACE[status.pace].label}</span>
                  {status.currentWeek > 0 && status.currentWeek <= status.weeks.length ? ` · week ${status.currentWeek}` : ""}
                  {status.overdue ? ` · ${status.overdue} overdue` : ""}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Made {syllabus.source === "ai" ? "by Gemini" : syllabus.source === "manual" ? "by rules, then edited" : "by rules"}
                  {status.next ? ` · next for the client: ${status.next.courseTitle ? `${status.next.courseTitle}, ` : ""}${status.next.title}` : ""}
                </p>
              </div>
            </div>
            {syllabus.summary ? <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-muted)]">{syllabus.summary}</p> : null}
            {view.warnings.length ? (
              <ul className="mt-2 space-y-0.5 text-xs text-amber-400">
                {view.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3 grid gap-3 md:grid-cols-[auto_auto_1fr]">
              <label>
                <span className={labelClass}>Week 1 starts</span>
                <Input className="mt-1" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                <span className={labelClass}>Hours / week</span>
                <Input className="mt-1 w-24" type="number" min={0.5} max={40} step={0.5} value={perWeek} onChange={(e) => setPerWeek(e.target.value)} />
              </label>
              <label>
                <span className={labelClass}>Note to the client (shown above the plan)</span>
                <Textarea className="mt-1" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
            </div>
            {syllabus.reasons.length ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-[var(--color-text-muted)]">Why each course is in the plan</summary>
                <ul className="mt-1 space-y-0.5 text-xs text-[var(--color-text-muted)]">
                  {syllabus.reasons.map((r) => (
                    <li key={r.courseId}>
                      <span className="text-[var(--color-text-on-obsidian)]">{view.courses.find((c) => c.id === r.courseId)?.title || r.courseId}:</span> {r.reason}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>

          {/* Weeks */}
          <div className={panelClass}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className={labelClass}>Week by week</p>
              <div className="flex gap-2 text-xs">
                <button type="button" className="underline" onClick={() => setOpenWeeks(new Set(plan.map((_, i) => i + 1)))}>
                  Open all
                </button>
                <button type="button" className="underline" onClick={() => setOpenWeeks(new Set())}>
                  Close all
                </button>
              </div>
            </div>
            <ol className="divide-y divide-[var(--color-border-muted)]">
              {plan.map((w, wi) => {
                const n = wi + 1;
                const minutes = weekMinutes(w);
                const over = minutes > hoursNum * 60 * 1.15;
                const open = openWeeks.has(n);
                return (
                  <li key={wi} className="py-2 text-sm">
                    <button type="button" className="flex w-full items-center justify-between gap-2 text-left" onClick={() => toggleWeek(n)}>
                      <span className="min-w-0">
                        <span className="font-medium">Week {n}</span>
                        <span className="text-[var(--color-text-muted)]"> · {addDays(startDate, wi * 7)}</span>
                        {status.currentWeek === n ? <span className="ml-2 text-xs text-[var(--color-accent)]">this week</span> : null}
                        {w.paused ? <span className="ml-2 text-xs text-amber-400">paused</span> : null}
                        {w.goal ? <span className="block truncate text-xs text-[var(--color-text-muted)]">{w.goal}</span> : null}
                      </span>
                      <span className={`shrink-0 text-xs ${over ? "text-amber-400" : "text-[var(--color-text-muted)]"}`}>
                        {w.items.filter((i) => doneIds.has(i.id)).length}/{w.items.length} · {hours(minutes)}
                      </span>
                    </button>
                    {open ? (
                      <div className="mt-2 space-y-2 pl-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <label>
                            <span className={labelClass}>Goal for the week</span>
                            <Input className="mt-1" value={w.goal} onChange={(e) => updateWeek(wi, { goal: e.target.value })} />
                          </label>
                          <label>
                            <span className={labelClass}>Note to the client</span>
                            <Input className="mt-1" value={w.note} onChange={(e) => updateWeek(wi, { note: e.target.value })} />
                          </label>
                          <label className="md:col-span-2">
                            <span className={labelClass}>Session plan (only you see this)</span>
                            <Textarea className="mt-1" rows={2} value={w.sessionPlan} onChange={(e) => updateWeek(wi, { sessionPlan: e.target.value })} />
                          </label>
                        </div>
                        <ul className="space-y-1">
                          {w.items.map((it, ii) => {
                            const done = doneIds.has(it.id);
                            const isTask = it.kind === "task" || it.kind === "milestone";
                            return (
                              <li key={it.id} className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-border-muted)] px-2 py-1.5">
                                {isTask ? (
                                  <input
                                    type="checkbox"
                                    checked={done}
                                    disabled={Boolean(busy) || dirty}
                                    title={dirty ? "Save your edits first" : "Mark done for the client"}
                                    aria-label={`Mark ${itemTitle(it)} done`}
                                    onChange={(e) => void send("tick", { action: "toggleTask", itemId: it.id, done: e.target.checked })}
                                  />
                                ) : (
                                  <span aria-hidden="true" className={done ? "text-emerald-400" : "text-[var(--color-text-muted)]"}>
                                    {done ? "✓" : "○"}
                                  </span>
                                )}
                                <span className={`min-w-0 flex-1 ${it.skipped ? "line-through opacity-60" : ""}`}>
                                  <span className="mr-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{KIND_LABEL[it.kind]}</span>
                                  {isTask ? (
                                    <Input
                                      className="inline-block h-7 w-full max-w-md text-sm"
                                      value={it.title}
                                      onChange={(e) => updateItem(wi, ii, { title: e.target.value })}
                                    />
                                  ) : (
                                    itemTitle(it)
                                  )}
                                  <span className="block text-xs text-[var(--color-text-muted)]">
                                    {it.courseId ? `${catalog.get(it.id)?.courseTitle || it.courseId} · ` : ""}
                                    {it.kind === "milestone" ? "milestone" : `${itemMinutes(it)} min`}
                                    {it.skipped ? " · already knows it" : ""}
                                    {done ? " · done" : ""}
                                  </span>
                                  {it.kind === "task" ? (
                                    <span className="mt-1 flex gap-2">
                                      <Input
                                        className="h-7 flex-1 text-xs"
                                        placeholder="Detail for the client"
                                        value={it.detail}
                                        onChange={(e) => updateItem(wi, ii, { detail: e.target.value })}
                                      />
                                      <Input
                                        className="h-7 w-20 text-xs"
                                        type="number"
                                        min={0}
                                        aria-label="Minutes"
                                        value={it.minutes}
                                        onChange={(e) => updateItem(wi, ii, { minutes: Number(e.target.value) })}
                                      />
                                    </span>
                                  ) : null}
                                </span>
                                <span className="flex shrink-0 items-center gap-1 text-xs">
                                  <button type="button" className="px-1" aria-label="Move up" onClick={() => moveItem(wi, ii, -1)}>
                                    ↑
                                  </button>
                                  <button type="button" className="px-1" aria-label="Move down" onClick={() => moveItem(wi, ii, 1)}>
                                    ↓
                                  </button>
                                  <select
                                    className="rounded border border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)] px-1 py-0.5"
                                    value=""
                                    aria-label="Move to week"
                                    onChange={(e) => e.target.value && moveToWeek(wi, ii, Number(e.target.value))}
                                  >
                                    <option value="">Week…</option>
                                    {Array.from({ length: plan.length + 1 }, (_, k) => k + 1)
                                      .filter((k) => k !== n)
                                      .map((k) => (
                                        <option key={k} value={k}>
                                          {k > plan.length ? `New week ${k}` : `Week ${k}`}
                                        </option>
                                      ))}
                                  </select>
                                  {!isTask ? (
                                    <button type="button" className="px-1 underline" onClick={() => updateItem(wi, ii, { skipped: !it.skipped })}>
                                      {it.skipped ? "include" : "knows it"}
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    className="px-1 text-red-400 disabled:opacity-30"
                                    disabled={done && it.kind !== "milestone"}
                                    title={done && it.kind !== "milestone" ? "Finished work stays in the plan" : "Remove"}
                                    aria-label={`Remove ${itemTitle(it)}`}
                                    onClick={() => removeItem(wi, ii)}
                                  >
                                    ✕
                                  </button>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        <AddItem courses={view.courses} onAdd={(items) => addItems(wi, items)} />
                        <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                          {w.paused && !w.items.length ? (
                            <button type="button" className="underline" onClick={() => edit(plan.filter((_, i) => i !== wi))}>
                              Remove this paused week
                            </button>
                          ) : null}
                          {!w.items.length && !w.paused ? (
                            <button type="button" className="underline" onClick={() => edit(plan.filter((_, i) => i !== wi))}>
                              Remove this empty week
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--color-border-muted)] pt-3">
              <Button
                disabled={Boolean(busy) || (!dirty && !settingsDirty)}
                onClick={() => void send("save", { action: "savePlan", plan, startDate, note, hoursPerWeek: hoursNum }, "Saved")}
              >
                Save changes
              </Button>
              {dirty ? (
                <Button variant="outline" disabled={Boolean(busy)} onClick={() => apply(view)}>
                  Undo edits
                </Button>
              ) : null}
              <Button variant="outline" size="sm" disabled={Boolean(busy)} onClick={() => edit([...plan, emptyWeek()])}>
                Add a week
              </Button>
              <WeekTools
                weeks={plan.length}
                currentWeek={status.currentWeek}
                hours={hoursNum}
                disabled={Boolean(busy) || dirty}
                onPause={(beforeWeek, count) => void send("pause", { action: "pause", beforeWeek, count }, "Paused weeks added")}
                onRespread={(fromWeek, h) => void send("respread", { action: "respread", fromWeek, hoursPerWeek: h }, "Re-paced")}
              />
            </div>
            {dirty ? <p className="mt-1 text-xs text-amber-400">Unsaved edits.</p> : null}
          </div>

          {/* Gemini suggestions */}
          <div className={panelClass}>
            <p className="text-sm font-medium">Adjust with Gemini</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Say what changed, or paste a session&apos;s notes or transcript. Gemini suggests changes; nothing is saved until you apply them.
            </p>
            <Textarea
              className="mt-2"
              rows={2}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="She already knows lending; add more on perps and slow down after week 6."
            />
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-[var(--color-text-muted)]">Add a session&apos;s notes or transcript</summary>
              <Textarea className="mt-2" rows={4} value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} />
            </details>
            <Button
              className="mt-2"
              disabled={Boolean(busy) || !view.ai || dirty || (!instruction.trim() && !sessionNotes.trim())}
              title={dirty ? "Save your edits first" : undefined}
              onClick={async () => {
                const res = await send("suggest", { action: "suggest", instruction, sessionNotes });
                if (res) {
                  setSuggestions(res.suggestions || []);
                  setSuggestionSummary(res.suggestionSummary || "");
                  setPicked(new Set((res.suggestions || []).map((_, i) => i)));
                }
              }}
            >
              {busy === "suggest" ? "Gemini is thinking…" : "Suggest changes"}
            </Button>
            {!view.ai ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">Gemini is not set up yet.</p> : null}
            {suggestions ? (
              <div className="mt-3 border-t border-[var(--color-border-muted)] pt-3">
                {suggestionSummary ? <p className="mb-2 text-sm text-[var(--color-text-muted)]">{suggestionSummary}</p> : null}
                {suggestions.length ? (
                  <>
                    <ul className="space-y-1.5 text-sm">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <label className="flex gap-2">
                            <input
                              type="checkbox"
                              checked={picked.has(i)}
                              onChange={(e) => {
                                const next = new Set(picked);
                                if (e.target.checked) next.add(i);
                                else next.delete(i);
                                setPicked(next);
                              }}
                            />
                            <span>
                              {s.label}
                              {s.reason ? <span className="block text-xs text-[var(--color-text-muted)]">{s.reason}</span> : null}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        disabled={Boolean(busy) || !picked.size}
                        onClick={async () => {
                          const ops = suggestions.filter((_, i) => picked.has(i)).map((s) => s.op);
                          const res = await send("applyOps", { action: "applyOps", ops }, "Changes applied. Publish when ready.");
                          if (res) {
                            setSuggestions(null);
                            setInstruction("");
                            setSessionNotes("");
                          }
                        }}
                      >
                        Apply {picked.size} change{picked.size === 1 ? "" : "s"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSuggestions(null)}>
                        Dismiss
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No changes suggested.</p>
                )}
              </div>
            ) : null}
          </div>

          {/* Publish */}
          <div className={panelClass}>
            <p className="text-sm font-medium">Publish to the client</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              The client sees the last published version in their account. Each publish is kept as a version.
            </p>
            <label className="mt-2 block">
              <span className={labelClass}>What changed (shown to the client)</span>
              <Input
                className="mt-1"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder={syllabus.version ? "Moved perps up and added a test trade task." : "Your first plan, built from our call."}
              />
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={emailClient} onChange={(e) => setEmailClient(e.target.checked)} />
              Email the client that it is ready
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                disabled={Boolean(busy) || dirty || (syllabus.status === "published" && !syllabus.unpublishedChanges && !changeNote.trim())}
                title={dirty ? "Save your edits first" : undefined}
                onClick={async () => {
                  const res = await send("publish", { action: "publish", changeNote, emailClient }, `Published version ${syllabus.version + 1}`);
                  if (res) setChangeNote("");
                }}
              >
                {syllabus.status === "published" ? "Publish a new version" : "Publish to the client"}
              </Button>
              {syllabus.status === "published" ? (
                <Button variant="outline" disabled={Boolean(busy)} onClick={() => void send("unpublish", { action: "unpublish" }, "Hidden from the client")}>
                  Hide from the client
                </Button>
              ) : null}
              <Button
                variant="outline"
                disabled={Boolean(busy)}
                onClick={() => {
                  if (window.confirm("Delete this syllabus? Their course progress is kept.")) void send("delete", { action: "delete" }, "Deleted");
                }}
              >
                Delete
              </Button>
            </div>
            {view.versions.length ? (
              <ul className="mt-3 space-y-0.5 border-t border-[var(--color-border-muted)] pt-2 text-xs text-[var(--color-text-muted)]">
                {view.versions.map((v) => (
                  <li key={v.version}>
                    Version {v.version} · {new Date(v.publishedAt).toLocaleDateString()}
                    {v.changeNote ? ` · ${v.changeNote}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Add a lesson, exercise, quiz, a whole course, a task or a milestone to a week. */
function AddItem({ courses, onAdd }: { courses: CatalogCourse[]; onAdd: (items: PlanItem[]) => void }) {
  const [mode, setMode] = useState<"" | "course" | "task" | "milestone">("");
  const [courseId, setCourseId] = useState("");
  const [itemId, setItemId] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("30");
  const course = courses.find((c) => c.id === courseId);

  function reset() {
    setMode("");
    setCourseId("");
    setItemId("");
    setTitle("");
  }

  if (!mode) {
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" className="underline" onClick={() => setMode("course")}>
          + Course material
        </button>
        <button type="button" className="underline" onClick={() => setMode("task")}>
          + Task
        </button>
        <button type="button" className="underline" onClick={() => setMode("milestone")}>
          + Milestone
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-dashed border-[var(--color-border-muted)] p-2 text-xs">
      {mode === "course" ? (
        <>
          <select className={`${fieldClass} mt-0 w-auto`} value={courseId} onChange={(e) => (setCourseId(e.target.value), setItemId(""))}>
            <option value="">Course…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                Stage {c.stageNumber}: {c.title}
              </option>
            ))}
          </select>
          {course ? (
            <select className={`${fieldClass} mt-0 w-auto max-w-xs`} value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">Item…</option>
              <option value="*">The whole course ({hours(course.minutes)})</option>
              {course.items.map((i) => (
                <option key={i.id} value={i.id}>
                  {KIND_LABEL[i.kind]}: {i.title} ({i.minutes} min)
                </option>
              ))}
            </select>
          ) : null}
          <Button
            size="sm"
            disabled={!course || !itemId}
            onClick={() => {
              const pick = itemId === "*" ? course!.items : course!.items.filter((i) => i.id === itemId);
              onAdd(
                pick.map((i) => ({ id: i.id, kind: i.kind, courseId: course!.id, slug: i.slug, title: "", detail: "", minutes: 0, skipped: false }))
              );
              reset();
            }}
          >
            Add
          </Button>
        </>
      ) : (
        <>
          <Input
            className="h-8 min-w-[16rem] flex-1 text-sm"
            placeholder={mode === "task" ? "Make a test transfer with $20 on Base" : "You can lend and borrow on your own"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {mode === "task" ? (
            <Input className="h-8 w-20 text-sm" type="number" min={0} aria-label="Minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          ) : null}
          <Button
            size="sm"
            disabled={!title.trim()}
            onClick={() => {
              onAdd([
                {
                  id: taskId(mode),
                  kind: mode,
                  courseId: null,
                  slug: null,
                  title: title.trim(),
                  detail: "",
                  minutes: mode === "task" ? Math.max(0, Number(minutes) || 0) : 0,
                  skipped: false,
                },
              ]);
              reset();
            }}
          >
            Add
          </Button>
        </>
      )}
      <button type="button" className="underline" onClick={reset}>
        Cancel
      </button>
    </div>
  );
}

function WeekTools({
  weeks,
  currentWeek,
  hours: currentHours,
  disabled,
  onPause,
  onRespread,
}: {
  weeks: number;
  currentWeek: number;
  hours: number;
  disabled: boolean;
  onPause: (beforeWeek: number, count: number) => void;
  onRespread: (fromWeek: number, hours: number) => void;
}) {
  const start = String(Math.min(Math.max(currentWeek, 1), Math.max(weeks, 1)));
  const [pauseAt, setPauseAt] = useState(start);
  const [pauseCount, setPauseCount] = useState("1");
  const [fromWeek, setFromWeek] = useState(start);
  const [h, setH] = useState(String(currentHours));
  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-[var(--color-text-muted)]">Pause or re-pace</summary>
      <div className="mt-2 space-y-2">
        <div className="flex flex-wrap items-center gap-1">
          Pause
          <Input className="h-7 w-14" type="number" min={1} max={12} value={pauseCount} onChange={(e) => setPauseCount(e.target.value)} />
          week(s) before week
          <Input className="h-7 w-16" type="number" min={1} max={weeks + 1} value={pauseAt} onChange={(e) => setPauseAt(e.target.value)} />
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => onPause(Number(pauseAt), Number(pauseCount))}>
            Pause
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          Re-spread open work from week
          <Input className="h-7 w-16" type="number" min={1} max={weeks} value={fromWeek} onChange={(e) => setFromWeek(e.target.value)} />
          at
          <Input className="h-7 w-16" type="number" min={0.5} max={40} step={0.5} value={h} onChange={(e) => setH(e.target.value)} />
          h a week
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => onRespread(Number(fromWeek), Number(h))}>
            Re-pace
          </Button>
        </div>
      </div>
    </details>
  );
}

/** Plan by rules without an intake: the old quick form. */
function QuickPlan({
  view,
  busy,
  startDate,
  note,
  onPlan,
}: {
  view: SyllabusView;
  busy: boolean;
  startDate: string;
  note: string;
  onPlan: (body: Record<string, unknown>) => void;
}) {
  const s = view.syllabus;
  const [goals, setGoals] = useState(s?.inputs.goals || "");
  const [level, setLevel] = useState<ExperienceLevel>(s?.inputs.level || "beginner");
  const [focus, setFocus] = useState<string[]>(s?.inputs.focusStageIds || []);
  const [weeks, setWeeks] = useState(String(s?.inputs.timelineWeeks || 12));
  const [perWeek, setPerWeek] = useState(String(s?.inputs.hoursPerWeek || 3));
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs text-[var(--color-text-muted)]">Plan by rules from quick answers</summary>
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className={labelClass}>Goals</span>
          <Textarea className="mt-1" rows={2} value={goals} onChange={(e) => setGoals(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Experience</span>
          <select className={fieldClass} value={level} onChange={(e) => setLevel(e.target.value as ExperienceLevel)}>
            {view.levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}: {l.hint}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className={labelClass}>Weeks</span>
            <Input className="mt-1" type="number" min={1} max={104} value={weeks} onChange={(e) => setWeeks(e.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Hours / week</span>
            <Input className="mt-1" type="number" min={0.5} max={40} step={0.5} value={perWeek} onChange={(e) => setPerWeek(e.target.value)} />
          </label>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          {view.stages.map((st) => {
            const on = focus.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setFocus(on ? focus.filter((f) => f !== st.id) : [...focus, st.id])}
                className={`rounded border px-2.5 py-1 text-xs ${
                  on ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-[var(--color-border-muted)] text-[var(--color-text-muted)]"
                }`}
              >
                {st.number}. {st.title}
              </button>
            );
          })}
        </div>
      </div>
      <Button
        className="mt-2"
        size="sm"
        disabled={busy}
        onClick={() => {
          if (s && !window.confirm("Replace the open items with a plan from these answers?")) return;
          onPlan({
            action: "plan",
            inputs: { goals, level, focusStageIds: focus, timelineWeeks: Number(weeks), hoursPerWeek: Number(perWeek) },
            startDate,
            note,
          });
        }}
      >
        {s ? "Re-plan from these answers" : "Plan the syllabus"}
      </Button>
    </details>
  );
}
