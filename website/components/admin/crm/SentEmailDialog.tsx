"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SentEmailView } from "@/lib/crm/email-view";

const MISSING_COPY: Record<SentEmailView["bodyFrom"], string> = {
  stored: "",
  gmail: "",
  missing: "The body of this email was not saved. Emails sent from now on are kept in full.",
  gmail_access_needed:
    "This email was sent before bodies were saved. To open it from your Sent mail, add the Gmail read-only scope (https://www.googleapis.com/auth/gmail.readonly) to the site's service account in Google Admin → Security → API controls → Domain-wide delegation.",
};

/** A sent email as the recipient saw it. Scripts never run: the iframe is sandboxed. */
export function SentEmailDialog({ emailLogId, onClose }: { emailLogId: string | null; onClose: () => void }) {
  const [email, setEmail] = useState<SentEmailView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emailLogId) return;
    setEmail(null);
    setError(null);
    fetch(`/api/admin/emails/${encodeURIComponent(emailLogId)}`)
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as SentEmailView & { error?: string };
        if (!res.ok) setError(body.error || "Could not open this email.");
        else setEmail(body);
      })
      .catch(() => setError("Could not open this email."));
  }, [emailLogId]);

  const srcDoc = email?.html ? `<base target="_blank">${email.html}` : null;

  return (
    <Dialog open={Boolean(emailLogId)} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogPopup className="max-w-3xl border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
        <DialogHeader>
          <DialogTitle>{email?.subject || (error ? "Email" : "Loading…")}</DialogTitle>
          {email ? (
            <DialogDescription>
              To {email.to} · {email.sentAt ? new Date(email.sentAt).toLocaleString() : ""} · {email.status}
              {email.source ? ` · ${email.source}` : ""}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogPanel>
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {email && srcDoc ? (
            <iframe
              title={email.subject || "Sent email"}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              srcDoc={srcDoc}
              className="h-[60vh] w-full rounded border border-[var(--color-border-muted)] bg-white"
            />
          ) : null}
          {email && !srcDoc && email.text ? (
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded border border-[var(--color-border-muted)] p-3 text-sm">
              {email.text}
            </pre>
          ) : null}
          {email && MISSING_COPY[email.bodyFrom] && !srcDoc ? (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">{MISSING_COPY[email.bodyFrom]}</p>
          ) : null}
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
