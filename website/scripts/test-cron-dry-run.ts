import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { isCronDryRun } from "../lib/cron-auth";
import { previewProcessFlowsDryRun } from "../lib/crm/cron-dry-run";
import { executeProcessFlows } from "../lib/crm/process-flows-runner";
import type { LeadRecord } from "../lib/crm/lead-lifecycle";
import { collectPendingEmails, type PendingEmail } from "../lib/flows";
import type { FlowDoc } from "../lib/crm/types";
import type { ProcessFlowsEffects } from "../lib/crm/process-flows-runner";
import {
  applyExitFlow,
  applyMarkStepSent,
  applyReleaseStepClaim,
  isStepDueForSend,
  prepareStepForSend,
  SEND_CLAIM_TTL_MS,
  type FlowSendReceipt,
} from "../lib/crm/flow-step-state";
import { LEAD_MARKETING_FLOWS } from "../lib/flow-definitions";
import { isOptOutSendSkip } from "../lib/flow-send-policy";
import { evaluateSendGates } from "../lib/send-gates";

const NOW = Date.parse("2026-09-27T12:00:00.000Z");

/** A lead who confirmed their email, so lead marketing flows may send. */
function confirmedLead(email = "stale@example.com"): LeadRecord {
  return { email, status: "confirmed", emailOptIn: true, consent: { given: true, confirmedAt: "2026-09-01T00:00:00.000Z" } } as LeadRecord;
}

function dueItem(overrides: Partial<PendingEmail> = {}): PendingEmail {
  return {
    flowDocId: "flow-1",
    flowType: "coaching_nurture",
    userId: "user-1",
    email: "stale@example.com",
    stepIndex: 0,
    step: {
      stepId: "coaching_reminder",
      sendAt: new Date(NOW - 3600000).toISOString(),
      sentAt: null,
      skipped: false,
    },
    ...overrides,
  };
}

function throwingEffects(): ProcessFlowsEffects {
  const boom = (kind: string) => async () => {
    throw new Error(`dry-run must not ${kind}`);
  };
  return {
    sendEmail: boom("send"),
    unsubscribeUrlFor: boom("send"),
    getTemplate: () => {
      throw new Error("dry-run must not send");
    },
    claimStepForSend: boom("write"),
    recordSendReceipt: boom("write"),
    releaseStepClaim: boom("write"),
    markStepSent: boom("write"),
    markStepSkipped: boom("write"),
    markStepAttemptFailed: boom("write"),
    exitFlow: boom("write"),
  };
}

describe("cron dry-run query flag", () => {
  it("treats dryRun=1 as read-only mode", () => {
    const on = new NextRequest(
      "https://apexleader.ai/api/cron/process-flows?dryRun=1"
    );
    const off = new NextRequest(
      "https://apexleader.ai/api/cron/process-flows"
    );
    assert.equal(isCronDryRun(on), true);
    assert.equal(isCronDryRun(off), false);
  });
});

describe("process-flows dry-run", () => {
  it("dry-run neither writes nor sends", async () => {
    const pending = [
      dueItem(),
      dueItem({
        flowDocId: "flow-2",
        flowType: "coaching_post_call",
        userId: "lead-1",
        email: "loop-test@apexleader.com",
        step: {
          stepId: "coaching_post_call_thanks",
          sendAt: new Date(NOW - 1000).toISOString(),
          sentAt: null,
          skipped: false,
        },
      }),
    ];
    const report = await executeProcessFlows({
      dryRun: true,
      blocked: "marketing_sends_disabled",
      pending,
      loadLead: async (email: string) => confirmedLead(email),
      loadManualOnly: async () => false,
      loadFirstName: async () => {
        throw new Error("dry-run must not send");
      },
      effects: throwingEffects(),
    });
    assert.equal(report.dryRun, true);
    if (!report.dryRun) throw new Error("expected dry-run");
    assert.equal(report.writes, false);
    assert.equal(report.sends, false);
    assert.equal(report.counts.deferred, 2);
    assert.equal(report.counts.wouldSend, 0);
    assert.equal(report.recipients.length, 2);
    const flagged = report.recipients.find(
      (r) => r.email === "loop-test@apexleader.com"
    );
    assert.ok(flagged?.flaggedTestAccount);
    assert.ok(flagged?.flagReasons.some((r) => r.includes("loop-test")));
    assert.equal(flagged?.action, "defer");
  });

  it("lists due steps that would send when marketing is unblocked", () => {
    const report = previewProcessFlowsDryRun({
      pending: [dueItem({ email: "real@example.com" })],
      marketingBlock: null,
      leadByEmail: new Map([["real@example.com", confirmedLead("real@example.com")]]),
    });
    assert.equal(report.counts.wouldSend, 1);
    assert.equal(report.counts.deferred, 0);
    assert.equal(report.recipients[0]?.action, "send");
    assert.equal(report.recipients[0]?.flow, "coaching_nurture");
    assert.equal(report.recipients[0]?.step, "coaching_reminder");
  });

  it("exits a denylisted recipient instead of sending", () => {
    const report = previewProcessFlowsDryRun({
      pending: [
        dueItem({
          email: "loop-test@apexleader.com",
          userId: "loop-test@apexleader.com",
        }),
      ],
      marketingBlock: null,
      leadByEmail: new Map(),
    });
    assert.equal(report.counts.wouldSend, 0);
    assert.equal(report.counts.wouldExit, 1);
    assert.equal(report.recipients[0]?.action, "exit");
    assert.equal(report.recipients[0]?.flaggedTestAccount, true);
  });

  it("exits a suppressed recipient instead of sending", () => {
    const report = previewProcessFlowsDryRun({
      pending: [dueItem({ email: "opted-out@example.com" })],
      marketingBlock: null,
      leadByEmail: new Map(),
      suppressedByEmail: new Map([["opted-out@example.com", true]]),
    });
    assert.equal(report.counts.wouldSend, 0);
    assert.equal(report.counts.wouldExit, 1);
    assert.equal(report.recipients[0]?.action, "exit");
  });
});

describe("pending selection is one due step per flow", () => {
  it("returns only the first overdue step and respects smart sending", () => {
    const older = new Date(NOW - 48 * 3600000).toISOString();
    const newer = new Date(NOW - 1000).toISOString();
    const doc: FlowDoc = {
      userId: "u",
      email: "a@example.com",
      flowType: "coaching_post_call",
      status: "active",
      triggeredAt: older,
      lastFlowEmailSentAt: null,
      steps: [
        {
          stepId: "coaching_post_call_thanks",
          sendAt: older,
          sentAt: null,
          skipped: false,
        },
        {
          stepId: "coaching_post_call_recap",
          sendAt: newer,
          sentAt: null,
          skipped: false,
        },
      ],
    };
    const pending = collectPendingEmails([{ id: "f1", data: doc }], NOW);
    assert.equal(pending.length, 1);
    assert.equal(pending[0]?.step.stepId, "coaching_post_call_thanks");

    const cooling: FlowDoc = {
      ...doc,
      lastFlowEmailSentAt: new Date(NOW - 60 * 60 * 1000).toISOString(),
    };
    assert.deepEqual(
      collectPendingEmails([{ id: "f1", data: cooling }], NOW),
      []
    );
  });
});

describe("process-flows live exclusion, suppression, and claim durability", () => {
  it("treats both coaching flows as lead marketing flows", () => {
    assert.deepEqual([...LEAD_MARKETING_FLOWS].sort(), ["coaching_nurture", "coaching_post_call"]);
  });

  it("sendEmail marketing gates skip suppressed members", () => {
    const prevFlag = process.env.MARKETING_SENDS_ENABLED;
    const prevJwt = process.env.JWT_SECRET;
    process.env.MARKETING_SENDS_ENABLED = "true";
    process.env.JWT_SECRET = prevJwt || "ci-build-only";
    try {
      // Until content/site.ts has a real postal address, marketing mail is held.
      assert.deepEqual(
        evaluateSendGates({
          purpose: "marketing",
          suppressed: true,
          unsubscribeUrl: "https://apexleader.ai/api/unsubscribe?token=t",
        }),
        { skip: true, error: "postal_address_placeholder" }
      );
      assert.deepEqual(evaluateSendGates({ purpose: "transactional", suppressed: true }), { skip: true, error: "suppressed" });
      assert.equal(isOptOutSendSkip("suppressed"), true);
    } finally {
      if (prevFlag === undefined) delete process.env.MARKETING_SENDS_ENABLED;
      else process.env.MARKETING_SENDS_ENABLED = prevFlag;
      if (prevJwt === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = prevJwt;
    }
  });

  it("exits a denylisted active flow instead of sending", async () => {
    const store: { doc: FlowDoc } = {
      doc: {
        userId: "loop-test@apexleader.com",
        email: "loop-test@apexleader.com",
        flowType: "coaching_nurture",
        status: "active",
        triggeredAt: new Date(NOW).toISOString(),
        lastFlowEmailSentAt: null,
        steps: [
          {
            stepId: "coaching_reminder",
            sendAt: new Date(NOW - 1000).toISOString(),
            sentAt: null,
            skipped: false,
          },
        ],
      },
    };
    let sendCalls = 0;
    const result = await executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending: [
        dueItem({
          flowDocId: "flow-loop",
          email: "loop-test@apexleader.com",
          userId: "loop-test@apexleader.com",
        }),
      ],
      loadLead: async (email: string) => confirmedLead(email),
      loadManualOnly: async () => false,
      loadFirstName: async () => "",
      effects: {
        ...throwingEffects(),
        sendEmail: async () => {
          sendCalls++;
          return { ok: true };
        },
        unsubscribeUrlFor: async () =>
          "https://apexleader.ai/api/unsubscribe?token=t",
        getTemplate: () => ({
          subject: "x",
          html: "<p>x</p>",
          text: "x",
        }),
        exitFlow: async (_id, reason) => {
          store.doc = applyExitFlow(store.doc, reason);
        },
      },
    });
    assert.equal(result.dryRun, false);
    if (result.dryRun) throw new Error("expected live");
    assert.equal(result.exited, 1);
    assert.equal(result.sent, 0);
    assert.equal(sendCalls, 0);
    assert.equal(store.doc.status, "exited");
    assert.equal(store.doc.exitReason, "excluded_account");
  });

  it("exits the flow on a suppressed skip instead of marking the step skipped", async () => {
    const store: { doc: FlowDoc } = {
      doc: {
        userId: "u",
        email: "stale@example.com",
        flowType: "coaching_nurture",
        status: "active",
        triggeredAt: new Date(NOW).toISOString(),
        lastFlowEmailSentAt: null,
        steps: [
          {
            stepId: "coaching_reminder",
            sendAt: new Date(NOW - 1000).toISOString(),
            sentAt: null,
            skipped: false,
          },
        ],
      },
    };
    const result = await executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending: [dueItem()],
      loadLead: async (email: string) => confirmedLead(email),
      loadManualOnly: async () => false,
      loadSuppressed: async () => true,
      loadFirstName: async () => "Alex",
      effects: {
        ...throwingEffects(),
        exitFlow: async (_id, reason) => {
          store.doc = applyExitFlow(store.doc, reason);
        },
      },
    });
    assert.equal(result.dryRun, false);
    if (result.dryRun) throw new Error("expected live");
    assert.equal(result.exited, 1);
    assert.equal(result.skipped, 0);
    assert.equal(store.doc.status, "exited");
    assert.equal(store.doc.steps[0]?.skipped, false);
  });

  it("send ok then markStepSent fails so the next tick cannot resend", async () => {
    const store: {
      doc: FlowDoc;
      failMark: boolean;
      receipt: FlowSendReceipt | null;
    } = {
      failMark: true,
      receipt: null,
      doc: {
        userId: "u",
        email: "stale@example.com",
        flowType: "coaching_nurture",
        status: "active",
        triggeredAt: new Date(NOW).toISOString(),
        lastFlowEmailSentAt: null,
        steps: [
          {
            stepId: "coaching_reminder",
            sendAt: new Date(NOW - 1000).toISOString(),
            sentAt: null,
            skipped: false,
          },
        ],
      },
    };
    let sendCalls = 0;
    let failCalls = 0;
    let claimSeq = 0;
    const nowIso = new Date(NOW).toISOString();

    const effects: ProcessFlowsEffects = {
      sendEmail: async () => {
        sendCalls++;
        return { ok: true, messageId: "gmail-1" };
      },
      unsubscribeUrlFor: async () =>
        "https://apexleader.ai/api/unsubscribe?token=t",
      getTemplate: () => ({
        subject: "x",
        html: "<p>x</p>",
        text: "x",
      }),
      claimStepForSend: async () => {
        claimSeq++;
        const prepared = prepareStepForSend(
          store.doc,
          0,
          nowIso,
          `claim-${claimSeq}`,
          NOW,
          store.receipt
        );
        if (prepared.kind === "finalize_receipt") {
          store.doc = prepared.data;
          return { ok: false, finalizedFromReceipt: true };
        }
        if (prepared.kind !== "claim") return { ok: false };
        store.doc = prepared.data;
        return { ok: true, claimId: prepared.claimId };
      },
      recordSendReceipt: async (args) => {
        if (!store.receipt) {
          store.receipt = {
            flowDocId: args.flowDocId,
            stepIndex: args.stepIndex,
            claimId: args.claimId,
            gmailMessageId: args.gmailMessageId ?? null,
            sentAt: args.sentAt ?? nowIso,
          };
        }
      },
      releaseStepClaim: async (_id, _idx, claimId) => {
        store.doc = applyReleaseStepClaim(store.doc, 0, claimId);
      },
      markStepSent: async (_id, _idx, claimId) => {
        if (store.failMark) {
          throw new Error("firestore unavailable");
        }
        const marked = applyMarkStepSent(store.doc, 0, nowIso, claimId);
        if (!marked.ok) throw new Error(marked.reason);
        store.doc = marked.data;
      },
      markStepSkipped: async () => {
        throw new Error("should not skip after a successful send");
      },
      markStepAttemptFailed: async () => {
        failCalls++;
        throw new Error("should not clear the claim after a successful send");
      },
      exitFlow: async () => {
        throw new Error("should not exit after a successful send");
      },
    };

    const first = await executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending: [dueItem()],
      loadLead: async (email: string) => confirmedLead(email),
      loadManualOnly: async () => false,
      loadFirstName: async () => "Alex",
      effects,
    });
    assert.equal(first.dryRun, false);
    if (first.dryRun) throw new Error("expected live");
    assert.equal(first.sent, 1);
    assert.equal(first.failed, 0);
    assert.equal(sendCalls, 1);
    assert.equal(failCalls, 0);
    assert.equal(store.doc.steps[0]?.sentAt, null);
    assert.ok(store.receipt);
    assert.ok(store.doc.steps[0]?.sendClaimedAt);
    assert.equal(isStepDueForSend(store.doc.steps[0]!, NOW), false);

    const secondPending = collectPendingEmails(
      [{ id: "flow-1", data: store.doc }],
      NOW
    );
    assert.deepEqual(secondPending, []);

    const second = await executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending: [dueItem({ step: store.doc.steps[0]! })],
      loadLead: async (email: string) => confirmedLead(email),
      loadManualOnly: async () => false,
      loadFirstName: async () => "Alex",
      effects,
    });
    assert.equal(second.dryRun, false);
    if (second.dryRun) throw new Error("expected live");
    assert.equal(sendCalls, 1);
    assert.equal(second.sent, 0);
    assert.equal(failCalls, 0);
    assert.ok(store.doc.steps[0]?.sentAt);
    assert.equal(store.doc.steps[0]?.gmailMessageId, "gmail-1");
  });

  it("send ok, then markStepSent fails, then time advances past the TTL, then the next tick", async () => {
    const store: {
      doc: FlowDoc;
      failMark: boolean;
      receipt: FlowSendReceipt | null;
      nowMs: number;
    } = {
      failMark: true,
      receipt: null,
      nowMs: NOW,
      doc: {
        userId: "u",
        email: "stale@example.com",
        flowType: "coaching_nurture",
        status: "active",
        triggeredAt: new Date(NOW).toISOString(),
        lastFlowEmailSentAt: null,
        steps: [
          {
            stepId: "coaching_reminder",
            sendAt: new Date(NOW - 1000).toISOString(),
            sentAt: null,
            skipped: false,
          },
        ],
      },
    };
    let sendCalls = 0;
    let claimSeq = 0;

    const effects: ProcessFlowsEffects = {
      sendEmail: async () => {
        sendCalls++;
        return { ok: true, messageId: "gmail-ttl" };
      },
      unsubscribeUrlFor: async () =>
        "https://apexleader.ai/api/unsubscribe?token=t",
      getTemplate: () => ({
        subject: "x",
        html: "<p>x</p>",
        text: "x",
      }),
      claimStepForSend: async () => {
        claimSeq++;
        const iso = new Date(store.nowMs).toISOString();
        const prepared = prepareStepForSend(
          store.doc,
          0,
          iso,
          `claim-${claimSeq}`,
          store.nowMs,
          store.receipt
        );
        if (prepared.kind === "finalize_receipt") {
          store.doc = prepared.data;
          return { ok: false, finalizedFromReceipt: true };
        }
        if (prepared.kind !== "claim") return { ok: false };
        store.doc = prepared.data;
        return { ok: true, claimId: prepared.claimId };
      },
      recordSendReceipt: async (args) => {
        if (!store.receipt) {
          store.receipt = {
            flowDocId: args.flowDocId,
            stepIndex: args.stepIndex,
            claimId: args.claimId,
            gmailMessageId: args.gmailMessageId ?? "gmail-ttl",
            sentAt: args.sentAt ?? new Date(store.nowMs).toISOString(),
          };
        }
      },
      releaseStepClaim: async (_id, _idx, claimId) => {
        store.doc = applyReleaseStepClaim(store.doc, 0, claimId);
      },
      markStepSent: async (_id, _idx, claimId) => {
        if (store.failMark) {
          throw new Error("firestore unavailable");
        }
        const marked = applyMarkStepSent(
          store.doc,
          0,
          new Date(store.nowMs).toISOString(),
          claimId
        );
        if (!marked.ok) throw new Error(marked.reason);
        store.doc = marked.data;
      },
      markStepSkipped: async () => {
        throw new Error("should not skip after a successful send");
      },
      markStepAttemptFailed: async () => {
        throw new Error("should not clear the claim after a successful send");
      },
      exitFlow: async () => {
        throw new Error("should not exit after a successful send");
      },
    };

    await executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending: [dueItem()],
      loadLead: async (email: string) => confirmedLead(email),
      loadManualOnly: async () => false,
      loadFirstName: async () => "Alex",
      effects,
    });
    assert.equal(sendCalls, 1);
    assert.equal(store.doc.steps[0]?.sentAt, null);
    assert.ok(store.receipt);

    store.nowMs = NOW + SEND_CLAIM_TTL_MS + 1;
    assert.equal(isStepDueForSend(store.doc.steps[0]!, store.nowMs), true);
    const afterTtl = collectPendingEmails(
      [{ id: "flow-1", data: store.doc }],
      store.nowMs
    );
    assert.equal(afterTtl.length, 1);

    const later = await executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending: [
        dueItem({
          step: store.doc.steps[0]!,
        }),
      ],
      loadLead: async (email: string) => confirmedLead(email),
      loadManualOnly: async () => false,
      loadFirstName: async () => "Alex",
      effects,
    });
    assert.equal(later.dryRun, false);
    if (later.dryRun) throw new Error("expected live");
    assert.equal(sendCalls, 1);
    assert.ok(store.doc.steps[0]?.sentAt);
    assert.equal(store.doc.steps[0]?.gmailMessageId, "gmail-ttl");
    assert.equal(store.doc.status, "completed");
  });
});
