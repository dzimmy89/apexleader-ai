export interface LeadSubmitResult {
  ok: boolean;
}

export async function submitLead(payload: {
  email: string;
  source?: string;
  leadMagnet?: string;
  persona?: string;
  name?: string;
  firstName?: string;
  website?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
  consent_text_version?: string;
}): Promise<LeadSubmitResult> {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as LeadSubmitResult & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Failed to submit");
  }
  return { ok: true };
}
