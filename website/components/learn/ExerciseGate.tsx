"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Notice } from "@/components/system";
import { LESSON_EMAIL_CONSENT_TEXT, SMS_CONSENT_TEXT } from "@/lib/consent";

/**
 * The one ask on a lesson: email and mobile open the exercise. The one
 * parchment block on the screen. On success the server sets the reader
 * cookie and we go to the exercise.
 */
export function ExerciseGate({
  courseId,
  lessonSlug,
  exerciseHref,
  exerciseMinutes,
  lessonNumber,
  headline,
  perks,
  signInHref,
}: {
  courseId: string;
  lessonSlug: string;
  exerciseHref: string;
  exerciseMinutes?: number;
  lessonNumber: number;
  headline: string;
  perks: string[];
  signInHref: string;
}) {
  const router = useRouter();
  const ids = { email: useId(), phone: useId(), emailConsent: useId(), smsConsent: useId(), website: useId() };
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailConsent, setEmailConsent] = useState(true);
  const [smsConsent, setSmsConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await fetch("/api/lead/lesson-gate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, phone, emailConsent, smsConsent, courseId, lessonSlug, website }),
    }).catch(() => null);
    if (res?.ok) {
      setState("done");
      router.push(`${exerciseHref}?opened=1`);
      router.refresh();
      return;
    }
    const body = ((await res?.json().catch(() => ({}))) ?? {}) as { error?: string };
    setError(body.error || "Something went wrong. Try again.");
    setState("error");
  }

  const busy = state === "sending" || state === "done";

  return (
    <div className="parchment-card my-10 p-6 md:p-8" id="exercise-gate">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start">
        <div>
          <p className="section-eyebrow">
            Exercise {lessonNumber}
            {exerciseMinutes ? ` · ${exerciseMinutes} min` : ""}
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-[1.15] text-on-parchment md:text-[1.75rem]">
            {headline}
          </p>
          <p className="mt-3 text-muted-on-parchment">Leave your email and mobile and the exercise opens here. You also get:</p>
          <ul className="mt-3 space-y-1.5 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-on-parchment">
            {perks.map((perk) => (
              <li key={perk} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--color-coaching-ink)]">
                  ·
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="field">
            <label htmlFor={ids.email}>Email</label>
            <input
              id={ids.email}
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
            />
          </div>
          <div className="field">
            <label htmlFor={ids.phone}>
              Mobile <span className="font-normal text-muted-on-parchment">· for one text, no calls</span>
            </label>
            <input
              id={ids.phone}
              className="input"
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 010-0000"
            />
          </div>
          {/* Honeypot: bots fill it, people never see it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor={ids.website}>Website</label>
            <input id={ids.website} name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <label htmlFor={ids.emailConsent} className="flex gap-2.5 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] leading-snug text-muted-on-parchment">
            <input
              id={ids.emailConsent}
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent-ink)]"
              checked={emailConsent}
              onChange={(e) => setEmailConsent(e.target.checked)}
            />
            <span>{LESSON_EMAIL_CONSENT_TEXT}</span>
          </label>
          <label htmlFor={ids.smsConsent} className="flex gap-2.5 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] leading-snug text-muted-on-parchment">
            <input
              id={ids.smsConsent}
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent-ink)]"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
            />
            <span>{SMS_CONSENT_TEXT}</span>
          </label>
          {state === "error" ? (
            <Notice tone="danger" role="alert">
              {error}
            </Notice>
          ) : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {state === "sending" ? "Opening…" : state === "done" ? "Opening the exercise" : "Open the exercise"}
          </button>
          <p className="text-center font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-muted-on-parchment">
            Coaching client or signed up before?{" "}
            <Link href={signInHref} className="underline underline-offset-2 hover:text-on-parchment">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
