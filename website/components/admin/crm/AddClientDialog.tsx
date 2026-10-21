"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

interface PackageRow {
  id: string;
  name: string;
  price: number;
  paymentPlans: Array<{ id: string; label: string; installments: number; perPayment: number }>;
}

const STAGES = [
  { id: "new", label: "New" },
  { id: "applied", label: "Applied" },
  { id: "scheduled", label: "Discovery scheduled" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal_sent", label: "Proposal sent" },
] as const;

const fieldClass =
  "mt-1 block w-full rounded border border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)] px-2 py-1.5 text-sm text-[var(--color-text-on-obsidian)]";

/**
 * Add a person to the coaching pipeline by hand. When they already paid
 * outside Stripe, the contact page opens on the payment form so the payment creates
 * the client record, course access, contract email and schedule in one step.
 */
export function AddClientDialog({ onAdded }: { onAdded?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState("");
  const [stage, setStage] = useState<string>("new");
  const [notes, setNotes] = useState("");
  const [paid, setPaid] = useState(false);
  const [planId, setPlanId] = useState("full");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || packages.length) return;
    fetch("/api/admin/coaching/packages")
      .then((r) => (r.ok ? r.json() : { packages: [] }))
      .then((d: { packages?: PackageRow[] }) => {
        const rows = d.packages || [];
        setPackages(rows);
        if (!packageId && rows[0]) setPackageId(rows[0].id);
      })
      .catch(() => undefined);
  }, [open, packages.length, packageId]);

  const pkg = packages.find((p) => p.id === packageId);

  function reset() {
    setName("");
    setEmail("");
    setStage("new");
    setNotes("");
    setPaid(false);
    setPlanId("full");
    setError(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const address = email.trim().toLowerCase();
    try {
      const res = await fetch("/api/admin/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: address,
          packageId: packageId || undefined,
          status: stage,
          notes: notes.trim(),
          source: "manual",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; existing?: boolean };
      if (!res.ok) {
        setError(body.error || "Could not add the client.");
        return;
      }
      toast.success(body.existing ? "Already on the pipeline. Opened their card." : "Added to the pipeline.");
      setOpen(false);
      reset();
      onAdded?.();
      if (paid) {
        router.push(
          `/admin/contacts/${encodeURIComponent(address)}?tab=log&plan=${encodeURIComponent(planId)}`
        );
      }
    } catch {
      setError("Could not add the client.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus size={14} /> Add client
      </Button>
      <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
        <DialogPopup className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Add a client</DialogTitle>
              <DialogDescription>
                Puts them on the coaching pipeline. If they already paid outside Stripe, you log the payment next.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-[var(--color-text-muted)]">
                Name
                <Input id="add-client-name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="text-xs text-[var(--color-text-muted)]">
                Email
                <Input
                  id="add-client-email"
                  className="mt-1"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="text-xs text-[var(--color-text-muted)]">
                Package
                <select id="add-client-package" className={fieldClass} value={packageId} onChange={(e) => setPackageId(e.target.value)}>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price.toLocaleString("en-US")})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[var(--color-text-muted)]">
                Stage
                <select
                  id="add-client-stage"
                  className={fieldClass}
                  value={stage}
                  disabled={paid}
                  onChange={(e) => setStage(e.target.value)}
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
                Notes
                <Textarea
                  id="add-client-notes"
                  className="mt-1 min-h-16 border-[var(--color-border-muted)] bg-[var(--color-bg-obsidian)]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input id="add-client-paid" type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
                Already paid outside Stripe
              </label>
              {paid ? (
                <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
                  Payment plan
                  <select id="add-client-plan" className={fieldClass} value={planId} onChange={(e) => setPlanId(e.target.value)}>
                    {(pkg?.paymentPlans || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                        {p.installments > 1 ? ` of $${p.perPayment.toLocaleString("en-US")}` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block">
                    Next you log the payment. That opens their client record, grants course access for the
                    coaching period, emails the contract and starts the installment schedule.
                  </span>
                </label>
              ) : null}
              {error ? (
                <p className="text-sm text-red-400 sm:col-span-2" role="alert">
                  {error}
                </p>
              ) : null}
            </DialogPanel>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !email.trim()}>
                {busy ? "Adding…" : paid ? "Add and log payment" : "Add client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
    </>
  );
}
