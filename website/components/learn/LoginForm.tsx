"use client";

import { useId, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase-client";
import { GoogleMark } from "@/components/GoogleMark";
import { Notice } from "@/components/system";

function googleErrorMessage(e: unknown): string | null {
  const code = (e as { code?: string })?.code || "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null;
  if (code === "auth/popup-blocked") return "Your browser blocked the Google window. Allow pop-ups for this site, or use the email link below.";
  if (code === "auth/unauthorized-domain") return "Google sign-in is not switched on for this address yet. Use the email link below.";
  return "Google sign-in did not go through. Try again, or use the email link below.";
}

/**
 * One panel: Google first (the gold button), then the email link. The
 * honeypot (`website`) travels in the JSON body so the server's bot check
 * in app/api/account/login/route.ts can see it.
 */
export function LoginForm({ next }: { next: string }) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [google, setGoogle] = useState<"idle" | "working">("idle");
  const [googleError, setGoogleError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/account/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, next, website }),
    });
    if (res.ok) {
      setState("sent");
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setError(body.error || "Something went wrong. Try again.");
    setState("error");
  }

  async function continueWithGoogle() {
    setGoogleError("");
    setGoogle("working");
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, getGoogleProvider());
      const idToken = await result.user.getIdToken();
      // The site keeps its own session cookie; the Firebase session is not needed after this.
      await signOut(auth).catch(() => undefined);
      const res = await fetch("/api/account/login/google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken, next }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; next?: string };
      if (!res.ok) {
        setGoogleError(body.error || "Google sign-in did not go through. Try again.");
        setGoogle("idle");
        return;
      }
      window.location.assign(body.next || next);
    } catch (e) {
      const message = googleErrorMessage(e);
      if (message) setGoogleError(message);
      setGoogle("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="panel">
        <div className="panel-body">
          <Notice tone="success" title="Check your email">
            We sent a sign-in link to <strong>{email}</strong>. It works once and expires in 30 minutes.
          </Notice>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-body space-y-5">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => void continueWithGoogle()}
            disabled={google === "working"}
            className="btn btn-primary btn-block"
          >
            <GoogleMark tile />
            {google === "working" ? "Signing in" : "Continue with Google"}
          </button>
          {googleError ? (
            <Notice tone="danger" role="alert">
              {googleError}
            </Notice>
          ) : null}
        </div>

        <p className="text-center font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          or
        </p>

        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="field">
            <label htmlFor={emailId}>Email</label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <button type="submit" disabled={state === "sending"} className="btn btn-secondary btn-block">
            {state === "sending" ? "Sending" : "Email me a sign-in link"}
          </button>
          {state === "error" ? (
            <Notice tone="danger" role="alert">
              {error}
            </Notice>
          ) : null}
        </form>

        <p className="field-hint">
          Either option creates your account. Members and coaching clients: use the email you joined with, or add it on
          your account page. Free learners also get our DeFi lesson emails; unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
