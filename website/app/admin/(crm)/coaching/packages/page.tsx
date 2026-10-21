"use client";

import { useEffect, useState, useTransition } from "react";
import { Save, Check } from "lucide-react";

interface PackageRow {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceDisplay: string;
  durationWeeks: number;
  sessionCount: number;
  sessionLengthMins: number;
  requiresDiscoveryCall: boolean;
  applicationOnly: boolean;
  cadence: string;
  features: string[];
  deliverables: string[];
  targetCapital: string;
  badge?: string;
  sortIndex: number;
  active: boolean;
}

const EMPTY: PackageRow = {
  id: "",
  name: "",
  tagline: "",
  price: 0,
  priceDisplay: "",
  durationWeeks: 0,
  sessionCount: 0,
  sessionLengthMins: 60,
  requiresDiscoveryCall: false,
  applicationOnly: false,
  cadence: "",
  features: [],
  deliverables: [],
  targetCapital: "",
  sortIndex: 0,
  active: true,
};

export default function PackagesEditorPage() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coaching/packages");
    const data = (await res.json()) as { packages?: PackageRow[] };
    setPackages(data.packages || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function update(id: string, patch: Partial<PackageRow>) {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch,
              priceDisplay:
                patch.price !== undefined
                  ? `$${patch.price.toLocaleString()}`
                  : p.priceDisplay,
            }
          : p
      )
    );
  }

  function handleSave(pkg: PackageRow) {
    startTransition(async () => {
      await fetch("/api/admin/coaching/packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkg),
      });
      setSavedId(pkg.id);
      setTimeout(() => setSavedId(null), 2000);
    });
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Coaching Packages
      </h1>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Edit the public-facing package tiers. Changes go live on the marketing
        page within 60 seconds (cache TTL).
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-[var(--color-text-muted)]">Loading…</p>
      ) : (
        <div className="mt-6 space-y-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="border border-[var(--color-border-muted)] p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-text)]">
                  {pkg.name}{" "}
                  <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase text-[var(--color-text-muted)]">
                    ({pkg.id})
                  </span>
                </h2>
                <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <input
                    type="checkbox"
                    checked={pkg.active}
                    onChange={(e) => update(pkg.id, { active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Name">
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => update(pkg.id, { name: e.target.value })}
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Price (USD)">
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={(e) =>
                      update(pkg.id, { price: Number(e.target.value) })
                    }
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Tagline">
                  <input
                    type="text"
                    value={pkg.tagline}
                    onChange={(e) => update(pkg.id, { tagline: e.target.value })}
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Badge">
                  <input
                    type="text"
                    value={pkg.badge || ""}
                    onChange={(e) => update(pkg.id, { badge: e.target.value })}
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Duration (weeks)">
                  <input
                    type="number"
                    value={pkg.durationWeeks}
                    onChange={(e) =>
                      update(pkg.id, { durationWeeks: Number(e.target.value) })
                    }
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Session count">
                  <input
                    type="number"
                    value={pkg.sessionCount}
                    onChange={(e) =>
                      update(pkg.id, { sessionCount: Number(e.target.value) })
                    }
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Session length (mins)">
                  <input
                    type="number"
                    value={pkg.sessionLengthMins}
                    onChange={(e) =>
                      update(pkg.id, {
                        sessionLengthMins: Number(e.target.value),
                      })
                    }
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Cadence">
                  <input
                    type="text"
                    value={pkg.cadence}
                    onChange={(e) => update(pkg.id, { cadence: e.target.value })}
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Target capital">
                  <input
                    type="text"
                    value={pkg.targetCapital}
                    onChange={(e) =>
                      update(pkg.id, { targetCapital: e.target.value })
                    }
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
                <Field label="Sort index">
                  <input
                    type="number"
                    value={pkg.sortIndex}
                    onChange={(e) =>
                      update(pkg.id, { sortIndex: Number(e.target.value) })
                    }
                    className="w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-2 py-1 text-sm text-[var(--color-text)]"
                  />
                </Field>
              </div>

              <div className="mt-4 flex gap-6">
                <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <input
                    type="checkbox"
                    checked={pkg.requiresDiscoveryCall}
                    onChange={(e) =>
                      update(pkg.id, { requiresDiscoveryCall: e.target.checked })
                    }
                  />
                  Requires discovery call
                </label>
                <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <input
                    type="checkbox"
                    checked={pkg.applicationOnly}
                    onChange={(e) =>
                      update(pkg.id, { applicationOnly: e.target.checked })
                    }
                  />
                  Application only
                </label>
              </div>

              <Field label="Features (one per line)">
                <textarea
                  value={pkg.features.join("\n")}
                  onChange={(e) =>
                    update(pkg.id, {
                      features: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  rows={6}
                  className="mt-1 w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-2 text-sm text-[var(--color-text)]"
                />
              </Field>
              <Field label="Deliverables (one per line)">
                <textarea
                  value={pkg.deliverables.join("\n")}
                  onChange={(e) =>
                    update(pkg.id, {
                      deliverables: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  rows={3}
                  className="mt-1 w-full border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-2 text-sm text-[var(--color-text)]"
                />
              </Field>

              <div className="mt-4">
                <button
                  onClick={() => handleSave(pkg)}
                  disabled={pending}
                  className="inline-flex min-h-[40px] items-center gap-2 bg-[var(--color-coaching)] px-4 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--color-bg)] hover:brightness-110 disabled:opacity-50"
                >
                  {savedId === pkg.id ? (
                    <>
                      <Check size={12} /> Saved
                    </>
                  ) : (
                    <>
                      <Save size={12} /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
