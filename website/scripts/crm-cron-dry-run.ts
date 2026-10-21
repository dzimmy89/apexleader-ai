/**
 * Read-only CRM cron dry-run. No writes, no Gmail sends.
 *
 * From website/:
 *   npx tsx scripts/crm-cron-dry-run.ts
 *
 * Requires the same Firestore admin credentials as the site (ADC or
 * GOOGLE_SERVICE_ACCOUNT_KEY). Prints JSON for process-flows and
 * reengagement previews.
 */
import { getPendingEmails } from "../lib/flows";
import { getDb } from "../lib/firebase-admin";
import type { LeadRecord } from "../lib/crm/lead-lifecycle";
import { marketingSendBlockReason } from "../lib/marketing-sends";
import { executeProcessFlows } from "../lib/crm/process-flows-runner";
import { previewReengagementCheck } from "../lib/crm/reengagement";
import { isSuppressed } from "../lib/suppression";
import { automatedSendBlockedByManualOnly } from "../lib/crm/contacts";

async function main(): Promise<void> {
  const db = getDb();
  const blocked = marketingSendBlockReason();
  const pending = await getPendingEmails();
  const processFlows = await executeProcessFlows({
    dryRun: true,
    blocked,
    pending,
    loadLead: async (email) => {
      const lead = await db.collection("leads").doc(email).get();
      return lead.exists ? (lead.data() as LeadRecord) : undefined;
    },
    loadSuppressed: (email) => isSuppressed(email),
    loadManualOnly: (email) =>
      automatedSendBlockedByManualOnly(email, "confirmed_or_paid"),
    loadFirstName: async () => "",
    effects: {
      sendEmail: async () => {
        throw new Error("dry-run must not send");
      },
      unsubscribeUrlFor: async () => {
        throw new Error("dry-run must not send");
      },
      getTemplate: () => {
        throw new Error("dry-run must not send");
      },
      claimStepForSend: async () => {
        throw new Error("dry-run must not write");
      },
      recordSendReceipt: async () => {
        throw new Error("dry-run must not write");
      },
      releaseStepClaim: async () => {
        throw new Error("dry-run must not write");
      },
      markStepSent: async () => {
        throw new Error("dry-run must not write");
      },
      markStepSkipped: async () => {
        throw new Error("dry-run must not write");
      },
      markStepAttemptFailed: async () => {
        throw new Error("dry-run must not write");
      },
      exitFlow: async () => {
        throw new Error("dry-run must not write");
      },
    },
  });

  const reengagement = await previewReengagementCheck();
  console.log(
    JSON.stringify(
      {
        processFlows,
        reengagement,
        note: "Read-only. Live code queries for pre-ship inspection are in the PR body.",
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
