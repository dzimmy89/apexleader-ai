"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ADMIN_1TO1_AD_KIND_HELPER,
  ADMIN_1TO1_FOOTER_TEXT,
  ADMIN_1TO1_PERSONAL_OFFER_ACK_TEXT,
} from "@/lib/crm/admin-1to1-email";
import {
  CONTACT_EMAIL_TEMPLATE_AD_KIND,
  CONTACT_EMAIL_TEMPLATE_IDS,
  CONTACT_EMAIL_TEMPLATE_LABELS,
  contactEmailTemplate,
  type ContactEmailTemplateContext,
  type ContactEmailTemplateId,
} from "@/lib/crm/contact-email-templates";

interface PreviewState {
  subject: string;
  text: string;
  html: string;
  warnings: string[];
  requiresHoldingsAck: boolean;
  requiresPersonalOfferAck: boolean;
}

const ERROR_COPY: Record<string, string> = {
  rate_limited_24h: "This contact got a 1:1 email in the last 24 hours. Try again later.",
  do_not_contact: "This contact is marked do not contact.",
  opted_out: "This contact opted out of email.",
  bounced: "Email to this contact bounced.",
  internal: "This is an internal address.",
  suppressed: "This address is on the suppression list.",
  in_flight: "This email is already sending.",
  reply_subject_not_allowed: "Start a new subject. Re: and Fwd: are not allowed here.",
  ad_kind_required: "Choose Promotional or Personal.",
  sender_not_configured: "The sender address is not configured.",
};

export interface ContactEmailComposerProps {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: ContactEmailTemplateId | null;
  templateContext: ContactEmailTemplateContext;
  onSent?: () => void;
}

/**
 * One-click 1:1 email for the contact page. Uses
 * /api/admin/contacts/:email/send, which runs the same guards, locked footer,
 * logging, and opt-out handling as the HubSpot contact composer.
 */
export function ContactEmailComposer({
  email,
  open,
  onOpenChange,
  initialTemplate,
  templateContext,
  onSent,
}: ContactEmailComposerProps) {
  const [template, setTemplate] = useState<ContactEmailTemplateId | "">("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [adKind, setAdKind] = useState<"promotional" | "personal" | "">("");
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [approvedByDavid, setApprovedByDavid] = useState(false);
  const [holdingsEducationAck, setHoldingsEducationAck] = useState(false);
  const [personalOfferAck, setPersonalOfferAck] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(id: ContactEmailTemplateId | "") {
    setTemplate(id);
    setPreview(null);
    if (!id) return;
    const filled = contactEmailTemplate(id, templateContext);
    setSubject(filled.subject);
    setBody(filled.body);
    setAdKind(CONTACT_EMAIL_TEMPLATE_AD_KIND[id]);
  }

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPreview(null);
    if (initialTemplate) {
      applyTemplate(initialTemplate);
    }
    // Fill once per open; later edits stay with the admin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTemplate]);

  function resetAcks() {
    setApprovedByDavid(false);
    setHoldingsEducationAck(false);
    setPersonalOfferAck(false);
  }

  async function post(payload: Record<string, unknown>) {
    const res = await fetch(`/api/admin/contacts/${encodeURIComponent(email)}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { res, data };
  }

  async function runPreview() {
    setBusy(true);
    setError(null);
    try {
      const { res, data } = await post({ mode: "preview", subject, body, adKind: adKind || undefined });
      if (!res.ok) {
        const code = String(data.error || "");
        setError(ERROR_COPY[code] || code || "Could not preview email.");
        return;
      }
      setPreview({
        subject: String(data.subject || subject),
        text: String(data.text || ""),
        html: String(data.html || ""),
        warnings: Array.isArray(data.warnings) ? (data.warnings as string[]) : [],
        requiresHoldingsAck: Boolean(data.requiresHoldingsAck),
        requiresPersonalOfferAck: Boolean(data.requiresPersonalOfferAck),
      });
      setIdempotencyKey(crypto.randomUUID());
      resetAcks();
    } catch {
      setError("Could not preview email.");
    } finally {
      setBusy(false);
    }
  }

  async function runSend() {
    setBusy(true);
    setError(null);
    try {
      const { res, data } = await post({
        mode: "send",
        subject,
        body,
        adKind,
        approvedByDavid,
        holdingsEducationAck,
        personalOfferAck,
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
      });
      if (!res.ok) {
        const code = String(data.error || "");
        setError(ERROR_COPY[code] || code || "Could not send email.");
        return;
      }
      toast.success(`Email sent to ${email}`);
      setPreview(null);
      setSubject("");
      setBody("");
      setTemplate("");
      setAdKind("");
      resetAcks();
      onOpenChange(false);
      onSent?.();
    } catch {
      setError("Could not send email.");
    } finally {
      setBusy(false);
    }
  }

  const canSend =
    Boolean(preview) &&
    approvedByDavid &&
    (!preview?.requiresHoldingsAck || holdingsEducationAck) &&
    (!preview?.requiresPersonalOfferAck || personalOfferAck);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-2xl border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
        <DialogHeader>
          <DialogTitle>Email {email}</DialogTitle>
          <DialogDescription>
            Pick a template or write your own. Preview shows the exact email with the locked footer.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="space-y-3">
          <label className="block text-xs text-[var(--color-text-muted)]">
            Template
            <select
              className="mt-1 block w-full rounded border border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)] px-2 py-1.5 text-sm text-[var(--color-text-on-obsidian)]"
              value={template}
              onChange={(e) => applyTemplate(e.target.value as ContactEmailTemplateId | "")}
            >
              <option value="">Blank</option>
              {CONTACT_EMAIL_TEMPLATE_IDS.map((id) => (
                <option key={id} value={id}>
                  {CONTACT_EMAIL_TEMPLATE_LABELS[id]}
                </option>
              ))}
            </select>
          </label>
          <Input
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPreview(null);
            }}
            placeholder="Subject"
            aria-label="Subject"
          />
          <Textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setPreview(null);
            }}
            placeholder="Body. The server adds the footer, which you cannot edit."
            aria-label="Body"
            rows={9}
          />
          <fieldset className="space-y-1 text-sm">
            <legend className="text-xs text-[var(--color-text-muted)]">Ad identification</legend>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contactAdKind"
                checked={adKind === "promotional"}
                onChange={() => {
                  setAdKind("promotional");
                  setPreview(null);
                }}
              />
              Promotional
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contactAdKind"
                checked={adKind === "personal"}
                onChange={() => {
                  setAdKind("personal");
                  setPreview(null);
                }}
              />
              Personal (not promotional)
            </label>
            <p className="text-xs text-[var(--color-text-muted)]">{ADMIN_1TO1_AD_KIND_HELPER}</p>
          </fieldset>
          <p className="whitespace-pre-wrap rounded-md border border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)] p-3 text-xs text-[var(--color-text-muted)]">
            {`Locked footer:\n${ADMIN_1TO1_FOOTER_TEXT}`}
          </p>
          {error ? (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}
          {preview ? (
            <div className="space-y-3 border-t border-[var(--color-border-muted)] pt-3">
              {preview.warnings.map((warning) => (
                <p key={warning} className="text-sm text-amber-500" role="status">
                  {warning}
                </p>
              ))}
              <p className="text-sm font-medium">Subject: {preview.subject}</p>
              <div
                className="max-h-64 overflow-auto rounded-md border border-[var(--color-border-muted)] bg-white p-3 text-sm text-black"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={approvedByDavid}
                  onCheckedChange={(value) => setApprovedByDavid(value === true)}
                />
                Approved by David
              </label>
              {preview.requiresHoldingsAck ? (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={holdingsEducationAck}
                    onCheckedChange={(value) => setHoldingsEducationAck(value === true)}
                  />
                  I confirm this is education only and not advice about this person&apos;s holdings or trades.
                </label>
              ) : null}
              {preview.requiresPersonalOfferAck ? (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={personalOfferAck}
                    onCheckedChange={(value) => setPersonalOfferAck(value === true)}
                  />
                  {ADMIN_1TO1_PERSONAL_OFFER_ACK_TEXT}
                </label>
              ) : null}
            </div>
          ) : null}
        </DialogPanel>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="outline"
            disabled={busy || !subject.trim() || !body.trim() || !adKind}
            onClick={() => void runPreview()}
          >
            {busy && !preview ? "Working…" : "Preview"}
          </Button>
          <Button disabled={busy || !canSend} onClick={() => void runSend()}>
            {busy && preview ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
