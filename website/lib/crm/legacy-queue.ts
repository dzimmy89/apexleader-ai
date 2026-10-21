import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/gmail";
import { buildLeadWelcomeEmail } from "@/lib/email-templates";
import { unsubscribeUrlFor } from "@/lib/email-tokens";
import { isLegacyLeadWelcomeEnabled } from "@/lib/legacy-welcome";

const MAX_LEGACY_ATTEMPTS = 5;

/** Drain pending onboarding_queue rows (legacy HubSpot replacement). */
export async function processLegacyQueue(limit = 10): Promise<number> {
  const db = getDb();
  const snap = await db
    .collection("onboarding_queue")
    .where("status", "==", "pending")
    .limit(limit)
    .get();

  let processed = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    const email = (data.email as string)?.toLowerCase();
    if (!email) {
      await doc.ref.update({
        status: "failed",
        lastError: "missing_email",
        completedAt: new Date().toISOString(),
      });
      continue;
    }

    if (data.action === "lead_created" || String(data.action).startsWith("email_drip")) {
      if (!isLegacyLeadWelcomeEnabled()) {
        await doc.ref.update({
          status: "skipped",
          lastError: "legacy_welcome_disabled",
          completedAt: new Date().toISOString(),
        });
        processed++;
        continue;
      }
      const unsubscribeUrl = await unsubscribeUrlFor(email);
      const rendered = buildLeadWelcomeEmail({
        email,
        firstName: (data.name as string)?.split(" ")[0] || "",
        unsubscribeUrl,
      });
      const result = await sendEmail({
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        unsubscribeUrl,
        purpose: "marketing",
        log: { source: "legacy_queue", userId: email },
      });

      if (result.ok || result.skipped) {
        await doc.ref.update({
          status: "completed",
          completedAt: new Date().toISOString(),
        });
        processed++;
        continue;
      }

      const attemptCount = ((data.attemptCount as number) || 0) + 1;
      if (attemptCount >= MAX_LEGACY_ATTEMPTS || result.retryable === false) {
        await doc.ref.update({
          status: "failed",
          attemptCount,
          lastError: result.error ?? "send_failed",
          completedAt: new Date().toISOString(),
        });
      } else {
        await doc.ref.update({
          attemptCount,
          lastError: result.error ?? "send_failed",
          lastAttemptAt: new Date().toISOString(),
        });
      }
      continue;
    }

    // Unknown action — complete so it does not block the queue.
    await doc.ref.update({
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    processed++;
  }
  return processed;
}
