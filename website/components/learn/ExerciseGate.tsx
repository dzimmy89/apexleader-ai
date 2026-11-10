"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Notice } from "@/components/system";
import { LESSON_EMAIL_CONSENT_NOTE, SMS_CONSENT_TEXT } from "@/lib/consent";
import { cn } from "@/lib/utils";

/**
 * The ask on a lesson: the exercise, named, opens with an email and then a
 * mobile. Two steps so an email is saved even if the reader stops at the
 * mobile field. The same form appears twice on a lesson (an early ask after
 * the first section and the full block at the end); both share one state,
 * so finishing step one in either moves both to step two.
 */

const STORE_KEY = "fatb_gate_email";
const STORE_EVENT = "fatb-gate";

function readStoredEmail(): string {
  try {
    return window.sessionStorage.getItem(STORE_KEY) || "";
  } catch {
    return "";
  }
}

function storeEmail(email: string) {
  try {
    if (email) window.sessionStorage.setItem(STORE_KEY, email);
    else window.sessionStorage.removeItem(STORE_KEY);
  } catch {
    /* private mode: the form still works, it just won't remember */
  }
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: email }));
}

/** Report a funnel step once per page view. */
const reported = new Set<string>();
export function reportFunnelStep(step: string, courseId: string, lessonSlug: string) {
  const key = `${step}:${courseId}/${lessonSlug}`;
  if (reported.has(key)) return;
  reported.add(key);
  fetch("/api/funnel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step, courseId, lessonSlug }),
    keepalive: true,
  }).catch(() => undefined);
}

export interface ExerciseGateProps {
  variant: "early" | "full";
  courseId: string;
  lessonSlug: string;
  exerciseHref: string;
  exerciseMinutes?: number;
  lessonNumber: number;
  /** The exercise's own title: "Build and approve your first 30-day calendar". */
  offerTitle: string;
  /** What they leave with, one sentence. */
  offerResult?: string | null;
  /** Full variant only: what else comes with the email. */
  perks?: string[];
  signInHref: string;
}

export function ExerciseGate({
  variant,
  courseId,
  lessonSlug,
  exerciseHref,
  exerciseMinutes,
  lessonNumber,
  offerTitle,
  offerResult,
  perks = [],
  signInHref,
}: ExerciseGateProps) {
  const router = useRouter();
  const ids = { email: useId(), phone: useId(), sms: useId(), website: useId() };
  const box = useRef<HTMLDivElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  // Pick up an email saved earlier in this visit, by this form or its twin.
  useEffect(() => {
    const stored = readStoredEmail();
    if (stored) setSavedEmail(stored);
    const onChange = (e: Event) => setSavedEmail(String((e as CustomEvent).detail || ""));
    window.addEventListener(STORE_EVENT, onChange);
    return () => window.removeEventListener(STORE_EVENT, onChange);
  }, []);

  // Count the ask as seen once it is on screen.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reportFunnelStep("ask_seen", courseId, lessonSlug);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [courseId, lessonSlug]);

  const step: "email" | "mobile" = savedEmail ? "mobile" : "email";

  async function post(payload: Record<string, unknown>) {
    const res = await fetch("/api/lead/lesson-gate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId, lessonSlug, website, emailConsent: true, ...payload }),
    }).catch(() => null);
    if (res?.ok) return { ok: true as const };
    const body = ((await res?.json().catch(() => ({}))) ?? {}) as { error?: string };
    return { ok: false as const, error: body.error || "Something went wrong. Try again." };
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    const value = email.trim().toLowerCase();
    const result = await post({ step: "email", email: value });
    if (!result.ok) {
      setError(result.error);
      setState("error");
      return;
    }
    setState("idle");
    storeEmail(value);
    window.setTimeout(() => phoneInput.current?.focus(), 50);
  }

  async function submitMobile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    const result = await post({ step: "mobile", email: savedEmail, phone, smsConsent });
    if (!result.ok) {
      setError(result.error);
      setState("error");
      return;
    }
    setState("done");
    router.push(`${exerciseHref}?opened=1`);
    router.refresh();
  }

  const busy = state === "sending" || state === "done";
  const full = variant === "full";
  const caption = `Exercise ${lessonNumber}${exerciseMinutes ? ` · ${exerciseMinutes} min` : ""} · free`;

  const form =
    step === "email" ? (
      <form onSubmit={submitEmail} className="grid gap-3" noValidate>
        <div className="field">
          <label htmlFor={ids.email} className={full ? undefined : "sr-only"}>
            Email
          </label>
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
        <Honeypot id={ids.website} value={website} onChange={setWebsite} />
        {state === "error" ? (
          <Notice tone="danger" role="alert">
            {error}
          </Notice>
        ) : null}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {state === "sending" ? "Saving…" : "Send me the exercise"}
        </button>
        <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] leading-snug text-muted-on-parchment">
          {LESSON_EMAIL_CONSENT_NOTE}
        </p>
      </form>
    ) : (
      <form onSubmit={submitMobile} className="grid gap-3" noValidate>
        <p className="flex items-center gap-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] font-semibold text-[var(--color-success-on-parchment,#2c6b3f)]">
          <Check size={16} aria-hidden="true" />
          <span className="min-w-0 truncate">Saved: {savedEmail}</span>
          <button
            type="button"
            onClick={() => storeEmail("")}
            className="ml-auto shrink-0 font-normal text-muted-on-parchment underline underline-offset-2"
          >
            Change
          </button>
        </p>
        <div className="field">
          <label htmlFor={ids.phone}>
            Last step: your mobile <span className="font-normal text-muted-on-parchment">· no calls</span>
          </label>
          <input
            ref={phoneInput}
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
        <Honeypot id={ids.website} value={website} onChange={setWebsite} />
        <label
          htmlFor={ids.sms}
          className="flex gap-2.5 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] leading-snug text-muted-on-parchment"
        >
          <input
            id={ids.sms}
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
        <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-muted-on-parchment">
          We only text if you tick the box.{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>
        </p>
      </form>
    );

  if (!full) {
    return (
      <div ref={box} id="exercise-ask" data-exercise-gate="" className="parchment-card my-10 scroll-mt-28 p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <p className="section-eyebrow">{caption}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-[1.25rem] font-bold leading-[1.2] text-on-parchment md:text-[1.375rem]">
              {offerTitle}
            </p>
            {offerResult ? <p className="mt-2 text-[length:var(--text-small)] text-muted-on-parchment">{offerResult}</p> : null}
          </div>
          {form}
        </div>
      </div>
    );
  }

  return (
    <div ref={box} id="exercise-gate" data-exercise-gate="" className="parchment-card my-10 scroll-mt-28 p-6 md:p-8">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start">
        <div>
          <p className="section-eyebrow">{caption}</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-[1.15] text-on-parchment md:text-[1.75rem]">
            {offerTitle}
          </p>
          {offerResult ? <p className="mt-3 text-muted-on-parchment">{offerResult}</p> : null}
          {perks.length ? (
            <ul className="mt-4 space-y-1.5 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-on-parchment">
              {perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--color-coaching-ink)]">
                    ·
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="grid gap-3">
          {form}
          <p className={cn("text-center font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-muted-on-parchment")}>
            Coaching client or signed up before?{" "}
            <Link href={signInHref} className="underline underline-offset-2 hover:text-on-parchment">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Honeypot({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  // Bots fill it, people never see it.
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={id}>Website</label>
      <input id={id} name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/**
 * Phones: a slim bar pinned to the bottom of the screen while neither form
 * is in view, so the ask is always one tap away. It scrolls to the early
 * ask and puts the cursor in it.
 */
export function GateBar({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const gates = Array.from(document.querySelectorAll<HTMLElement>("[data-exercise-gate]"));
    if (!gates.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<Element>();
    let scrolled = false;
    const update = () => setShow(scrolled && visible.size === 0);
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    gates.forEach((g) => observer.observe(g));
    const onScroll = () => {
      const next = window.scrollY > 500;
      if (next !== scrolled) {
        scrolled = next;
        update();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function go() {
    const target = document.getElementById("exercise-ask") || document.getElementById("exercise-gate");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => target.querySelector<HTMLInputElement>("input:not([tabindex='-1'])")?.focus({ preventScroll: true }), 450);
  }

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-200 lg:hidden",
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 font-[family-name:var(--font-ui)] text-[length:var(--text-small)]">
        <span className="min-w-0 truncate text-[var(--color-text)]">{label}</span>
        <button type="button" onClick={go} tabIndex={show ? 0 : -1} className="btn btn-primary shrink-0 !min-h-[40px] !px-4 !py-2">
          Open with email
        </button>
      </div>
    </div>
  );
}

/** Counts one page view of a lesson or exercise, once, after it renders. */
export function FunnelBeacon({ step, courseId, lessonSlug }: { step: "lesson_view" | "exercise_view"; courseId: string; lessonSlug: string }) {
  useEffect(() => {
    reportFunnelStep(step, courseId, lessonSlug);
  }, [step, courseId, lessonSlug]);
  return null;
}
