"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/crm/CrmPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Template {
  stepId: string;
  subject: string;
  html: string;
}

export function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [testTo, setTestTo] = useState("");
  const [selected, setSelected] = useState("welcome");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/templates")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.templates || []) as Template[];
        setTemplates(list);
        setSelected((prev) =>
          list.some((t) => t.stepId === prev) ? prev : list[0]?.stepId || prev
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const current = useMemo(
    () => templates.find((t) => t.stepId === selected) || null,
    [templates, selected]
  );

  async function sendTest() {
    setSending(true);
    const res = await fetch("/api/admin/templates/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testTo, stepId: selected }),
    });
    const data = await res.json();
    setSending(false);
    if (data.ok) toast.success("Test email sent");
    else toast.error(data.error || "Failed to send");
  }

  return (
    <div>
      <CrmPageHeader
        title="Templates"
        description="Preview flow email templates and send test emails."
      />
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">
            Template
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] px-3 py-2 text-sm"
            disabled={loading}
          >
            {templates.map((t) => (
              <option key={t.stepId} value={t.stepId}>
                {t.stepId}
              </option>
            ))}
          </select>
        </div>
        <Input
          type="email"
          placeholder="test@email.com"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          className="max-w-xs border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]"
        />
        <Button onClick={sendTest} loading={sending} disabled={!testTo}>
          Send test
        </Button>
      </div>

      {current && (
        <div className="mt-8 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              Subject
            </div>
            <p className="mt-1 text-base font-medium">{current.subject}</p>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              Preview
            </div>
            <div className="overflow-hidden rounded-lg border border-[var(--color-border-muted)] bg-white">
              <iframe
                title={`Preview ${current.stepId}`}
                srcDoc={current.html}
                sandbox=""
                className="h-[640px] w-full bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {!loading && !current && (
        <p className="mt-8 text-sm text-[var(--color-text-muted)]">
          No templates found.
        </p>
      )}
    </div>
  );
}
