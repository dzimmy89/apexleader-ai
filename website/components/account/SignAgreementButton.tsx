"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Takes the signed-in client straight to their signing page; no email hunt. */
export function SignAgreementButton({
  className,
  size = "md",
  tone = "primary",
  children = "Sign your agreement",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "secondary";
  children?: React.ReactNode;
}) {
  const [state, setState] = useState<"idle" | "opening" | "error">("idle");
  const [error, setError] = useState("");

  async function open() {
    setState("opening");
    setError("");
    const res = await fetch("/api/account/contract/request", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).catch(
      () => null
    );
    const body = ((await res?.json().catch(() => ({}))) || {}) as { signUrl?: string; signed?: boolean; error?: string };
    if (res?.ok && body.signUrl) {
      window.location.assign(body.signUrl);
      return;
    }
    if (res?.ok && body.signed) {
      window.location.reload();
      return;
    }
    setError(body.error || "We could not open the agreement. Try again or email hello@apexleader.ai.");
    setState("error");
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void open()}
        disabled={state === "opening"}
        className={cn("btn", tone === "primary" ? "btn-primary" : "btn-secondary", size === "sm" && "btn-sm", size === "lg" && "btn-lg", className)}
      >
        {state === "opening" ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden /> Opening…
          </>
        ) : (
          children
        )}
      </button>
      {state === "error" ? (
        <span className="text-[14px] font-medium text-[var(--color-text)]" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
