import { NextRequest, NextResponse } from "next/server";
import { isCronDryRun, verifyCronAuth } from "@/lib/cron-auth";
import {
  claimStepForSend,
  exitFlowDoc,
  getPendingEmails,
  markStepAttemptFailed,
  markStepSent,
  markStepSkipped,
  recordSendReceipt,
  releaseStepClaim,
} from "@/lib/flows";
import { getTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/gmail";
import { getDb } from "@/lib/firebase-admin";
import { processLegacyQueue } from "@/lib/crm/legacy-queue";
import type { LeadRecord } from "@/lib/crm/lead-lifecycle";
import { marketingSendBlockReason } from "@/lib/marketing-sends";
import { unsubscribeUrlFor } from "@/lib/email-tokens";
import { executeProcessFlows } from "@/lib/crm/process-flows-runner";
import { isSuppressed } from "@/lib/suppression";
import { automatedSendBlockedByManualOnly } from "@/lib/crm/contacts";
import { maybeSendPaymentDigest } from "@/lib/coaching/payment-digest";
import { syncCoachingCalendar } from "@/lib/coaching/session-sync";
import { findMeetRecording, publishMeetRecording } from "@/lib/coaching/meet-recordings";

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = isCronDryRun(request);
  const blocked = marketingSendBlockReason();
  let legacy = 0;
  if (!dryRun) {
    try {
      legacy = await processLegacyQueue(10);
    } catch (e) {
      console.error("[process-flows] legacy queue", e);
    }
  }

  const pending = await getPendingEmails();
  const db = getDb();
  const result = await executeProcessFlows({
    dryRun,
    blocked,
    pending,
    loadLead: async (email) => {
      const lead = await db.collection("leads").doc(email).get();
      return lead.exists ? (lead.data() as LeadRecord) : undefined;
    },
    loadSuppressed: (email) => isSuppressed(email),
    loadManualOnly: (email) =>
      automatedSendBlockedByManualOnly(email, "confirmed_or_paid"),
    loadFirstName: async (userId, leadData) => {
      const user = await db.collection("users").doc(userId).get();
      return (
        user.data()?.firstName ||
        leadData?.firstName ||
        leadData?.name?.split(" ")[0] ||
        ""
      );
    },
    effects: {
      sendEmail,
      unsubscribeUrlFor,
      getTemplate,
      claimStepForSend,
      recordSendReceipt,
      releaseStepClaim,
      markStepSent,
      markStepSkipped,
      markStepAttemptFailed,
      exitFlow: exitFlowDoc,
    },
  });

  if (result.dryRun) {
    return NextResponse.json(result);
  }

  // Owner-only morning digest of crypto payments due. At most once per day.
  let paymentDigest: string = "error";
  try {
    paymentDigest = (await maybeSendPaymentDigest()).status;
  } catch (e) {
    console.error("[process-flows] payment digest", e);
  }

  // Coaching sessions and Meet recordings from the coach calendar.
  let calendarSync: string = "error";
  try {
    const sync = await syncCoachingCalendar({
      findRecording: findMeetRecording,
      publishRecording: publishMeetRecording,
    });
    calendarSync = `created ${sync.created}, updated ${sync.updated}, recordings ${sync.recordings}`;
  } catch (e) {
    console.error("[process-flows] calendar sync", e);
  }

  return NextResponse.json({
    ok: true,
    calendarSync,
    marketingBlocked: result.marketingBlocked,
    legacyProcessed: legacy,
    pending: result.pending,
    sent: result.sent,
    skipped: result.skipped,
    failed: result.failed,
    deferred: result.deferred,
    exited: result.exited,
    paymentDigest,
  });
}
