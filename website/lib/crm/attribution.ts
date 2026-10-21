import { getDb } from "@/lib/firebase-admin";
import type { LeadUtm } from "@/lib/crm/lead-lifecycle";

export async function recordAttributionTouch(input: {
  email: string;
  source: string;
  leadMagnet?: string;
  utm?: LeadUtm;
  referrer?: string;
  landingPath?: string;
}): Promise<void> {
  const db = getDb();
  await db.collection("attribution_touchpoints").add({
    email: input.email.trim().toLowerCase(),
    source: input.source || "direct",
    leadMagnet: input.leadMagnet || "",
    utm: input.utm || {},
    referrer: input.referrer || "",
    landingPath: input.landingPath || "",
    createdAt: new Date().toISOString(),
  });
}
