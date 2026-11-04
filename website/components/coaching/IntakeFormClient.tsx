"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { BRAND } from "@/lib/brand";

type Level = { id: string; label: string; hint: string };
type Stage = { id: string; number: number; title: string };
type Course = { id: string; title: string; stageNumber: number };

interface Answers {
  goals: string[];
  targetOutcome: string;
  targetDate: string;
  hoursPerWeek: number;
  level: string;
  business: string;
  tools: string;
  technical: string;
  focusStageIds: string[];
  knownCourseIds: string[];
  concerns: string;
  learningStyle: string;
}

interface LoadResponse {
  ok: boolean;
  error?: string;
  name?: string;
  packageName?: string;
  answers?: Partial<Answers>;
  submittedAt?: string | null;
  levels?: Level[];
  stages?: Stage[];
  courses?: Course[];
}

const TECHNICAL = [
  { value: "low", label: "I stick to apps with no code" },
  { value: "medium", label: "I can follow a guide to set up an integration or a simple script" },
  { value: "high", label: "I write code, or I'm happy to learn" },
];

const EMPTY: Answers = {
  goals: ["", "", ""],
  targetOutcome: "",
  targetDate: "",
  hoursPerWeek: 3,
  level: "beginner",
  business: "",
  tools: "",
  technical: "",
  focusStageIds: [],
  knownCourseIds: [],
  concerns: "",
  learningStyle: "",
};

export function IntakeFormClient({ token }: { token: string }) {
  const [data, setData] = useState<LoadResponse | null>(null);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [status, setStatus] = useState<"loading" | "idle" | "submitting" | "done" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/coaching/intake/${token}`)
      .then((r) => r.json().catch(() => ({ ok: false, error: "We could not load your form. Refresh to try again." })))
      .then((json: LoadResponse) => {
        if (cancelled) return;
        setData(json);
        if (!json.ok) {
          setStatus("error");
          setError(json.error || "We could not load your form.");
          return;
        }
        const a = json.answers || {};
        const goals = [...(a.goals || []), "", "", ""].slice(0, 3);
        setAnswers({ ...EMPTY, ...a, goals } as Answers);
        setStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setError("We could not load your form. Refresh to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => setAnswers((prev) => ({ ...prev, [key]: value }));
  const toggle = (key: "focusStageIds" | "knownCourseIds", id: string) =>
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((x) => x !== id) : [...prev[key], id],
    }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!answers.goals.some((g) => g.trim())) {
      setError("Tell us at least one goal.");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch(`/api/coaching/intake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { ...answers, goals: answers.goals.map((g) => g.trim()).filter(Boolean) } }),
      });
      const json = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || `We could not save your answers. Try again or email ${BRAND.email}.`);
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "We could not save your answers.");
    }
  }

  if (status === "loading") {
    return (
      <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <Loader2 size={18} className="animate-spin" aria-hidden /> Loading your form…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="notice notice-danger" role="alert">
        <AlertCircle size={18} aria-hidden />
        <span>{error}</span>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="parchment-card ui-surface p-6 md:p-10">
        <span className="chip chip-success">
          <Check size={14} aria-hidden /> Sent
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-h2)] leading-tight">
          Thanks. Your answers are in.
        </h1>
        <p className="mt-3 text-[17px] text-[var(--color-text-muted)]">
          {BRAND.coachFirstName} will use them to build your syllabus. It will appear in your account once it&apos;s ready.
        </p>
        <div className="mt-6">
          <a href="/account" className="btn btn-primary">
            Go to your account
          </a>
        </div>
      </div>
    );
  }

  const first = (data?.name || "").split(" ")[0];
  const levels = data?.levels || [];
  const stages = data?.stages || [];
  const courses = data?.courses || [];

  return (
    <form className="space-y-8" onSubmit={submit}>
      <div className="page-header">
        <div>
          <p className="section-eyebrow">{data?.packageName ? `${data.packageName} coaching` : "Coaching"} intake</p>
          <h1 className="page-title">{first ? `${first}, tell us about you` : "Tell us about you"}</h1>
          <p className="page-intro">
            About 10 minutes. Your answers shape your syllabus. Only {BRAND.coachFirstName} sees them.
            {data?.submittedAt ? " You already sent this once. Change anything and send it again." : ""}
          </p>
        </div>
      </div>

      <div className="parchment-card ui-surface space-y-5 p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight text-on-parchment">Your goals</h2>
        {answers.goals.map((goal, i) => (
          <div className="field" key={i}>
            <label htmlFor={`goal-${i}`}>{i === 0 ? "Your main goal for coaching" : `Another goal (optional)`}</label>
            <input
              id={`goal-${i}`}
              className="input"
              value={goal}
              required={i === 0}
              onChange={(e) => set("goals", answers.goals.map((g, j) => (j === i ? e.target.value : g)))}
            />
          </div>
        ))}
        <div className="field">
          <label htmlFor="targetOutcome">What will be different when coaching is done?</label>
          <textarea id="targetOutcome" className="input" rows={3} value={answers.targetOutcome} onChange={(e) => set("targetOutcome", e.target.value)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="targetDate">A date you&apos;re working toward (optional)</label>
            <input id="targetDate" type="date" className="input" value={answers.targetDate} onChange={(e) => set("targetDate", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="hoursPerWeek">Hours a week you can put in</label>
            <input
              id="hoursPerWeek"
              type="number"
              min={0.5}
              max={40}
              step={0.5}
              className="input"
              value={answers.hoursPerWeek}
              onChange={(e) => set("hoursPerWeek", Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="parchment-card ui-surface space-y-5 p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight text-on-parchment">Your business</h2>
        <div className="field">
          <label htmlFor="business">What does your business do, how big is the team, and which jobs would you like AI to take on?</label>
          <textarea id="business" className="input" rows={5} value={answers.business} onChange={(e) => set("business", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="tools">Which tools and apps do you use today?</label>
          <textarea id="tools" className="input" rows={3} value={answers.tools} onChange={(e) => set("tools", e.target.value)} />
          <span className="field-hint">For example Gmail, Notion, Shopify, QuickBooks, ChatGPT.</span>
        </div>
      </div>

      <div className="parchment-card ui-surface space-y-5 p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight text-on-parchment">Where you are with AI</h2>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="field-label mb-2">How much do you use AI for work today?</legend>
          <div className="space-y-2">
            {levels.map((l) => (
              <label key={l.id} className="flex items-start gap-3 text-[15px] text-on-parchment">
                <input type="radio" name="level" className="mt-1" checked={answers.level === l.id} onChange={() => set("level", l.id)} />
                <span>
                  <strong>{l.label}.</strong> {l.hint}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="field-label mb-2">How comfortable are you setting tools up yourself?</legend>
          <div className="space-y-2">
            {TECHNICAL.map((t) => (
              <label key={t.value} className="flex items-start gap-3 text-[15px] text-on-parchment">
                <input type="radio" name="technical" className="mt-1" checked={answers.technical === t.value} onChange={() => set("technical", t.value)} />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {stages.length ? (
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="field-label mb-2">Which areas matter most to you right now? (optional)</legend>
            <div className="space-y-2">
              {stages.map((s) => (
                <label key={s.id} className="flex items-start gap-3 text-[15px] text-on-parchment">
                  <input type="checkbox" className="checkbox mt-0.5" checked={answers.focusStageIds.includes(s.id)} onChange={() => toggle("focusStageIds", s.id)} />
                  <span>{s.title}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        {courses.length ? (
          <details>
            <summary className="field-label cursor-pointer">Courses you already know well (optional)</summary>
            <div className="mt-3 space-y-2">
              {courses.map((c) => (
                <label key={c.id} className="flex items-start gap-3 text-[15px] text-on-parchment">
                  <input type="checkbox" className="checkbox mt-0.5" checked={answers.knownCourseIds.includes(c.id)} onChange={() => toggle("knownCourseIds", c.id)} />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
          </details>
        ) : null}
      </div>

      <div className="parchment-card ui-surface space-y-5 p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight text-on-parchment">Anything else</h2>
        <div className="field">
          <label htmlFor="concerns">Anything that worries you, or has held you back so far?</label>
          <textarea id="concerns" className="input" rows={3} value={answers.concerns} onChange={(e) => set("concerns", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="learningStyle">How do you like to learn?</label>
          <input id="learningStyle" className="input" value={answers.learningStyle} onChange={(e) => set("learningStyle", e.target.value)} />
          <span className="field-hint">For example short videos, reading, doing it live together.</span>
        </div>

        {error ? (
          <div className="notice notice-danger" role="alert">
            <span>{error}</span>
          </div>
        ) : null}

        <button type="submit" className="btn btn-primary btn-lg" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            "Send my answers"
          )}
        </button>
      </div>
    </form>
  );
}
