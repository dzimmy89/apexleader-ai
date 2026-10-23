"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { SignaturePad } from "@/components/coaching/SignaturePad";
import { BRAND } from "@/lib/brand";

interface ContractData {
  ok: boolean;
  signatureId?: string;
  status?: string;
  contractHtml?: string;
  packageName?: string;
  clientId?: string;
  signerName?: string;
  expiresAt?: string;
  error?: string;
}

export function ContractSigner({ token }: { token: string }) {
  const [data, setData] = useState<ContractData | null>(null);
  const [typedName, setTypedName] = useState("");
  const [signatureDataUri, setSignatureDataUri] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState<"loading" | "idle" | "submitting" | "signed" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/coaching/contract/${token}`);
        const json = (await res.json()) as ContractData;
        if (cancelled) return;
        setData(json);
        if (json.ok) {
          setTypedName(json.signerName || "");
          setStatus(json.status === "signed" ? "signed" : "idle");
        } else {
          setStatus("error");
          setErrorMsg(json.error || "Failed to load contract");
        }
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSign() {
    if (!typedName.trim() || !consented) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/coaching/contract/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typedName, signatureDataUri }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Signing failed");
      }
      setStatus("signed");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[300px] items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} aria-hidden />
        <span className="sr-only">Loading your agreement</span>
      </div>
    );
  }

  if (status === "error" && !data?.ok) {
    return (
      <div className="panel ui-surface p-6 md:p-8">
        <AlertCircle size={32} className="text-[var(--color-danger)]" aria-hidden />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-h2)] leading-tight">
          This signing link is not valid
        </h1>
        <p className="mt-3 text-[17px] text-[var(--color-text-muted)]">
          {errorMsg || "The signing link may have expired or already been used."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/account" className="btn btn-primary">
            Open your account for a new link
          </a>
          <a href={`mailto:${BRAND.email}`} className="btn btn-secondary">
            Email {BRAND.email}
          </a>
        </div>
      </div>
    );
  }

  if (status === "signed") {
    return (
      <div className="panel ui-surface p-6 md:p-8" role="status">
        <span className="chip chip-success">
          <Check size={14} aria-hidden /> Signed
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-h2)] leading-tight">
          Your agreement is signed.
        </h1>
        <p className="mt-3 text-[17px] text-[var(--color-text-muted)]">
          A signed PDF copy is in your account under Documents, and you can book your first session there.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/account#sessions" className="btn btn-primary">
            Book your first session
          </a>
          <a href="/account#documents" className="btn btn-secondary">
            See the signed agreement
          </a>
        </div>
        <p className="mt-6 text-[13px] text-[var(--color-text-muted)]">
          Signature ID <code className="font-[family-name:var(--font-mono)]">{data?.signatureId}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <p className="section-eyebrow">{data?.packageName || "Coaching"} agreement</p>
          <h1 className="page-title">Review and sign</h1>
          <p className="page-intro">
            Read the agreement, type your full legal name, sign if you like, and confirm. Takes about two minutes.
          </p>
        </div>
      </div>

      <article
        className="contract-prose parchment-card p-6 md:p-10"
        dangerouslySetInnerHTML={{ __html: data?.contractHtml || "" }}
      />

      <div className="parchment-card ui-surface p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight text-on-parchment">
          Your signature
        </h2>

        <div className="field mt-5">
          <label htmlFor="contract-typed-name">Full legal name</label>
          <input
            id="contract-typed-name"
            type="text"
            required
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Jane Trader"
            autoComplete="name"
            className="input"
          />
        </div>

        <div className="mt-5">
          <p className="field-label">Draw your signature</p>
          <div className="mt-2">
            <SignaturePad value={signatureDataUri} onChange={setSignatureDataUri} />
          </div>
        </div>

        <label className="mt-6 flex items-start gap-3 text-[15px] text-on-parchment">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="checkbox mt-0.5"
          />
          <span>
            By typing my name and choosing &quot;Sign agreement&quot;, I agree to be legally bound by this agreement. This
            is an electronic signature under the ESIGN Act and UETA.
          </span>
        </label>

        {errorMsg && (
          <div className="notice notice-danger mt-5" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSign}
            disabled={!typedName.trim() || !consented || status === "submitting"}
            className="btn btn-primary btn-lg"
          >
            {status === "submitting" ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden /> Signing…
              </>
            ) : (
              "Sign agreement"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
