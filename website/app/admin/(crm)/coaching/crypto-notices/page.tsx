"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { Button } from "@/components/ui/button";
import {
  CRYPTO_NETWORK_LABEL,
  SHARED_WALLET_SITE,
  explorerUrls,
} from "@/content/crypto-payments";
import type { CryptoNoticeRecord } from "@/lib/coaching/crypto-notices";

function paymentLine(notice: CryptoNoticeRecord): string {
  const amount = `$${notice.amountUsd.toLocaleString("en-US")}`;
  if (notice.planId === "full" || notice.installments <= 1) {
    return `${amount} · paid in full`;
  }
  return `${amount} this payment · ${notice.installments} payments · total $${notice.totalUsd.toLocaleString("en-US")}`;
}

function explorerName(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

export default function CryptoNoticesPage() {
  const [notices, setNotices] = useState<CryptoNoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coaching/crypto-notices");
      const data = (await res.json().catch(() => ({}))) as {
        notices?: CryptoNoticeRecord[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not load crypto notices.");
        return;
      }
      setNotices(data.notices || []);
    } catch {
      setError("Could not load crypto notices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function confirm(id: string) {
    setConfirming(id);
    const res = await fetch(`/api/admin/coaching/crypto-notices/${encodeURIComponent(id)}/confirm`, {
      method: "POST",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; emailWarning?: string };
    setConfirming(null);
    if (!res.ok) {
      toast.error(data.error || "Could not confirm the payment");
      return;
    }
    if (data.emailWarning) {
      toast.message(`Payment logged. ${data.emailWarning}`);
    } else {
      toast.success("Payment logged. Agreement email sent.");
    }
    await load();
  }

  const open = notices.filter((n) => n.status === "unconfirmed");
  const done = notices.filter((n) => n.status === "confirmed");

  return (
    <div>
      <CrmPageHeader
        title="Crypto payment notices"
        description="A notice grants nothing until you confirm it. Confirm only after you see the transfer arrive."
        actions={
          <Button variant="outline" size="sm" render={<Link href="/admin/coaching/payments-due" />}>
            Payments due
          </Button>
        }
      />

      <div className="mt-6 border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-[var(--color-text)]">
        <p className="font-medium">These wallets are shared with {SHARED_WALLET_SITE.name}.</p>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Before you confirm, look up the transaction hash in the{" "}
          <a
            href={SHARED_WALLET_SITE.noticesUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            {SHARED_WALLET_SITE.name} crypto notices
          </a>
          . If it was already credited there, do not confirm it here. Also check that the amount
          and the receiving address match.
        </p>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-[var(--color-text-muted)]">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-400">{error}</p>
      ) : notices.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-text-muted)]">No notices yet.</p>
      ) : (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">To check ({open.length})</h2>
            {open.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">Nothing waiting.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {open.map((notice) => (
                  <li key={notice.id} className="border border-[var(--color-border)] p-4 text-sm">
                    <p className="font-medium text-[var(--color-text)]">
                      {notice.name} · {notice.packageName} · {paymentLine(notice)}
                    </p>
                    <p className="mt-1 text-[var(--color-text-muted)]">
                      <Link
                        href={`/admin/contacts/${encodeURIComponent(notice.email)}`}
                        className="text-[var(--color-accent)] hover:underline"
                      >
                        {notice.email}
                      </Link>{" "}
                      · {CRYPTO_NETWORK_LABEL[notice.network]} · sent{" "}
                      {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : "unknown"}
                    </p>
                    <p className="mt-2 break-all font-[family-name:var(--font-mono)] text-xs text-[var(--color-text)]">
                      {notice.txHash}
                    </p>
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {explorerUrls(notice.network, notice.txHash).map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-accent)] hover:underline"
                        >
                          Open on {explorerName(url)}
                        </a>
                      ))}
                    </p>
                    <label className="mt-3 flex items-start gap-2 text-[var(--color-text)]">
                      <input
                        id={`check-${notice.id}`}
                        type="checkbox"
                        className="mt-0.5"
                        checked={!!checked[notice.id]}
                        onChange={(event) =>
                          setChecked((current) => ({ ...current, [notice.id]: event.target.checked }))
                        }
                      />
                      <span>
                        I saw this transfer arrive for the right amount, and it is not credited on{" "}
                        {SHARED_WALLET_SITE.name}.
                      </span>
                    </label>
                    <Button
                      className="mt-3"
                      size="sm"
                      disabled={!checked[notice.id] || confirming === notice.id}
                      onClick={() => void confirm(notice.id)}
                    >
                      {confirming === notice.id ? "Confirming" : "Confirm payment"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {done.length > 0 ? (
            <section>
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Confirmed ({done.length})</h2>
              <ul className="mt-3 space-y-2">
                {done.map((notice) => (
                  <li key={notice.id} className="border border-[var(--color-border)] p-3 text-xs text-[var(--color-text-muted)]">
                    <span className="text-[var(--color-text)]">{notice.name}</span> · {notice.packageName} ·{" "}
                    {paymentLine(notice)} · {CRYPTO_NETWORK_LABEL[notice.network]} · confirmed
                    {notice.confirmedBy ? ` by ${notice.confirmedBy}` : ""}
                    {notice.confirmedAt ? ` ${new Date(notice.confirmedAt).toLocaleDateString()}` : ""}
                    <span className="mt-1 block break-all font-[family-name:var(--font-mono)]">{notice.txHash}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
