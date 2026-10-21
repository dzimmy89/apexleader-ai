"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  CalendarPicker,
  type CalendarPickerPackageContext,
} from "@/components/coaching/CalendarPicker";
import { Meter, Notice } from "@/components/system";
import { cn } from "@/lib/utils";

interface ApplicationFormProps {
  packageId: string;
  packageContext?: CalendarPickerPackageContext | null;
}

interface FormData {
  name: string;
  email: string;
  capital: string;
  experience: string;
  goals: string;
  timeCommitment: string;
  howHeard: string;
}

const EMPTY: FormData = {
  name: "",
  email: "",
  capital: "",
  experience: "intermediate",
  goals: "",
  timeCommitment: "5-10 hrs/week",
  howHeard: "",
};

const CAPITAL_OPTIONS = [
  { value: "$100K-$500K", label: "$100K–$500K" },
  { value: "$500K-$1M", label: "$500K–$1M" },
  { value: "$1M-$5M", label: "$1M–$5M" },
  { value: "$5M+", label: "$5M+" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner (under 1 year)" },
  { value: "intermediate", label: "Intermediate (1–3 years)" },
  { value: "advanced", label: "Advanced (3+ years)" },
];

const TIME_OPTIONS = [
  { value: "2-5 hrs/week", label: "2–5 hrs/week" },
  { value: "5-10 hrs/week", label: "5–10 hrs/week" },
  { value: "10+ hrs/week", label: "10+ hrs/week" },
];

/**
 * Three short steps on the screen's parchment card. Text fields are .field
 * groups; the option questions are 48px selectable rows; one gold button
 * per step.
 */
export function ApplicationForm({
  packageId,
  packageContext,
}: ApplicationFormProps) {
  const ids = useId();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/coaching/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, packageId }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Submission failed");
      }
      const body = (await res.json()) as { id?: string };
      if (body.id) setApplicationId(body.id);
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="space-y-8">
        <Notice tone="success" title="Application received.">
          Thanks, {data.name.split(" ")[0]}. We saved your application and sent a confirmation to{" "}
          <strong>{data.email}</strong>. Next step: pick a time for your discovery call below.
        </Notice>

        <CalendarPicker
          packageId={packageId}
          packageContext={packageContext}
          source="institutional_apply"
          defaultName={data.name}
          defaultEmail={data.email}
          applicationId={applicationId ?? undefined}
        />
      </div>
    );
  }

  const steps = [
    {
      title: "About you",
      fields: (
        <>
          <Field id={`${ids}-name`} label="Full name">
            <input
              id={`${ids}-name`}
              type="text"
              required
              autoComplete="name"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
            />
          </Field>
          <Field id={`${ids}-email`} label="Email">
            <input
              id={`${ids}-email`}
              type="email"
              required
              autoComplete="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
            />
          </Field>
        </>
      ),
    },
    {
      title: "Your DeFi experience",
      fields: (
        <>
          <Choice
            name="capital"
            legend="Approximate portfolio size"
            hint="Optional"
            options={CAPITAL_OPTIONS}
            value={data.capital}
            onChange={(value) => update("capital", value)}
          />
          <Choice
            name="experience"
            legend="Experience level"
            options={EXPERIENCE_OPTIONS}
            value={data.experience}
            onChange={(value) => update("experience", value)}
          />
          <Choice
            name="timeCommitment"
            legend="Time commitment"
            options={TIME_OPTIONS}
            value={data.timeCommitment}
            onChange={(value) => update("timeCommitment", value)}
          />
        </>
      ),
    },
    {
      title: "Your goals",
      fields: (
        <>
          <Field id={`${ids}-goals`} label="What are you trying to accomplish in the next 6 months?">
            <textarea
              id={`${ids}-goals`}
              required
              value={data.goals}
              onChange={(e) => update("goals", e.target.value)}
              rows={5}
              className="input"
            />
          </Field>
          <Field id={`${ids}-heard`} label="How did you hear about us?">
            <input
              id={`${ids}-heard`}
              type="text"
              value={data.howHeard}
              onChange={(e) => update("howHeard", e.target.value)}
              className="input"
            />
          </Field>
        </>
      ),
    },
  ];

  const current = steps[step]!;
  const last = step === steps.length - 1;

  return (
    <form onSubmit={handleSubmit} className="parchment-card p-6 md:p-8">
      <Meter value={step + 1} max={steps.length} />
      <p className="ui-label mt-4">
        Step {step + 1} of {steps.length}
      </p>
      <h2 className="mt-1 text-[length:var(--text-h3)] text-on-parchment">{current.title}</h2>

      <div className="mt-6 space-y-5">{current.fields}</div>

      {errorMsg ? (
        <Notice tone="danger" role="alert" className="mt-5">
          {errorMsg}
        </Notice>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost">
            Back
          </button>
        ) : (
          <span />
        )}
        {!last ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 0 && (!data.name || !data.email)) ||
              (step === 2 && !data.goals)
            }
            className="btn btn-primary"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn btn-primary"
          >
            {status === "submitting" ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden /> Submitting
              </>
            ) : (
              "Submit application"
            )}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

/** A question with a few answers: each answer is a 48px row, the chosen one has an ink border and a tinted fill. */
function Choice({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  hint?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="field-label mb-2">
        {legend}
        {hint ? (
          <span className="ml-2 font-normal text-muted-on-parchment">{hint}</span>
        ) : null}
      </legend>
      <div className="space-y-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 border px-4 font-[family-name:var(--font-ui)] text-[15px] text-on-parchment transition-colors",
                selected
                  ? "border-[var(--color-coaching-ink)] bg-[var(--color-accent-subtle)] font-medium"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="checkbox accent-[var(--color-coaching-ink)]"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
