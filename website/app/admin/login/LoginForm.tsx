"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase-client";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";
import { GoogleMark } from "@/components/GoogleMark";

function ServerMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="6" rx="1.2" />
      <rect x="3" y="14" width="18" height="6" rx="1.2" />
      <circle cx="7" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LoginFormInner({ passwordEnabled }: { passwordEnabled: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeAdminNextPath(searchParams.get("next"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordEnabled) return;
    setError("");
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Invalid credentials");
        return;
      }
      router.refresh();
      router.push(next);
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, getGoogleProvider());
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/admin/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google sign-in failed");
        return;
      }
      router.refresh();
      router.push(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Google sign-in failed";
      if (msg.includes("popup-closed")) {
        setError("Sign-in popup was closed");
      } else {
        setError(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mc-login-card w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.02] p-8">
      <div className="flex items-center gap-2 text-zinc-200">
        <span className="text-zinc-400">
          <ServerMark />
        </span>
        <h1 className="font-[family-name:var(--font-admin-display)] text-base font-medium tracking-wide text-zinc-100">
          DeFi U Mission Control
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <label className="block text-left text-sm text-zinc-400">
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!passwordEnabled}
            className="mt-1.5 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="username"
          />
        </label>
        <label className="mt-4 block text-left text-sm text-zinc-400">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!passwordEnabled}
            className="mt-1.5 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="current-password"
          />
        </label>
        {!passwordEnabled && (
          <p className="mt-3 text-left text-xs text-zinc-500">
            Password sign-in is not configured on this deployment. Use Google.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={!passwordEnabled || passwordLoading}
          className="mc-btn-primary mt-6 w-full rounded-md py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {passwordLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-zinc-500">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-transparent py-2 text-sm text-zinc-100 hover:border-white/30 disabled:opacity-60"
      >
        <GoogleMark />
        {googleLoading ? "Signing in…" : "Sign in with Google"}
      </button>
      <p className="mt-3 text-left text-xs text-zinc-500">
        Google access is limited to authorized @defiuniversity.xyz accounts.
      </p>
    </div>
  );
}

export function LoginForm({ passwordEnabled }: { passwordEnabled: boolean }) {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
      <LoginFormInner passwordEnabled={passwordEnabled} />
    </Suspense>
  );
}
