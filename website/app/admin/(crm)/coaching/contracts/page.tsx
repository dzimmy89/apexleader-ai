"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Download, Send, Ban } from "lucide-react";

interface ContractRow {
  id: string;
  clientId: string;
  packageId?: string;
  packageName?: string;
  signerName?: string;
  signerEmail?: string;
  status: string;
  signedAt?: string;
  createdAt?: string;
  expiresAt?: string;
}

export default function AdminContractsPage() {
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/coaching/contracts${qs}`);
    const data = (await res.json()) as { contracts?: ContractRow[] };
    setRows(data.contracts || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [filter]);

  async function handleAction(id: string, action: "void" | "resend") {
    await fetch("/api/admin/coaching/contracts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (action === "void") void load();
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Contracts</h1>

      <div className="mt-4 flex gap-2">
        {["", "pending", "signed", "expired", "voided"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`border px-3 py-1 text-xs uppercase tracking-widest ${
              filter === s
                ? "border-[var(--color-coaching)] bg-[var(--color-coaching-subtle)] text-[var(--color-text)]"
                : "border-[var(--color-border-muted)] text-[var(--color-text-muted)] hover:border-[var(--color-coaching)]"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-[var(--color-border-muted)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--color-bg-panel)] font-[family-name:var(--font-mono)] uppercase tracking-widest text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Package</th>
              <th className="p-3">Status</th>
              <th className="p-3">Signed</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[var(--color-text-muted)]">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[var(--color-text-muted)]">
                  No contracts found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--color-border-muted)]">
                  <td className="p-3">
                    <div className="text-[var(--color-text)]">
                      {row.signerName || row.signerEmail || row.clientId}
                    </div>
                    {row.signerEmail && row.signerEmail !== row.clientId && (
                      <div className="text-[var(--color-text-muted)]">{row.signerEmail}</div>
                    )}
                  </td>
                  <td className="p-3 text-[var(--color-text)]">
                    <a
                      href={`/api/admin/coaching/contracts/${row.id}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-coaching)] hover:underline"
                      title="Open the contract that was sent"
                    >
                      {row.packageName || row.packageId}
                    </a>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="p-3 text-[var(--color-text-muted)]">
                    {row.signedAt
                      ? new Date(row.signedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      {row.status === "signed" && (
                        <a
                          href={`/api/admin/coaching/contracts/${row.id}/pdf`}
                          className="text-[var(--color-coaching)] hover:underline"
                          title="Download signed PDF"
                        >
                          <Download size={14} />
                        </a>
                      )}
                      {row.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(row.id, "resend")}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-coaching)]"
                            title="Resend link"
                          >
                            <Send size={14} />
                          </button>
                          <button
                            onClick={() => handleAction(row.id, "void")}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                            title="Void"
                          >
                            <Ban size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: typeof ShieldCheck }> = {
    pending: { color: "text-[var(--color-coaching)]", icon: ShieldAlert },
    signed: { color: "text-[var(--color-skool)]", icon: ShieldCheck },
    expired: { color: "text-[var(--color-text-muted)]", icon: ShieldAlert },
    voided: { color: "text-[var(--color-danger)]", icon: Ban },
  };
  const entry = map[status] || map.pending;
  const Icon = entry.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${entry.color}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}
