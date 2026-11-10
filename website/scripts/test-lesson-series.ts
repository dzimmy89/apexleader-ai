import assert from "node:assert/strict";
import { describe, it } from "node:test";
import catalog from "../content/learn/catalog.json";
import type { LeadRecord } from "../lib/crm/lead-lifecycle";
import { decideSmsStep, executeProcessFlows, type ProcessFlowsEffects } from "../lib/crm/process-flows-runner";
import type { FlowDoc } from "../lib/crm/types";
import { getTemplate, listTemplateIds } from "../lib/email-templates";
import { FLOW_CONFLICTS, FLOW_DEFINITIONS } from "../lib/flow-definitions";
import { collectPendingEmails, type PendingEmail } from "../lib/flows";
import { decideLessonSeries } from "../lib/lead-flows";
import {
  LESSON_FLOW_TYPES,
  LESSON_SERIES_SCHEDULE,
  lessonStepId,
  parseLessonStepId,
  renderLessonEmail,
  renderLessonSms,
  SMS_STOP_LINE,
} from "../lib/lesson-series/messages";
import { LESSON_TRACK_IDS, LESSON_TRACKS, parseLessonMagnet, trackForCourse } from "../lib/lesson-series/tracks";
import { classifyInboundText, isInsideTextingHours, smsSendBlockReason, twilioSignature, verifyTwilioSignature } from "../lib/sms";

type CatalogCourse = { id: string; modules: { lessons: { slug: string; title: string; exercise: string | null }[] }[] };
const courses = Object.values((catalog as unknown as { courses: Record<string, CatalogCourse> }).courses);
const UNSUB = "https://fromaitobusiness.com/api/unsubscribe?token=t";

describe("which series a lesson starts", () => {
  it("puts every course in the catalog in exactly one series", () => {
    const seen = new Map<string, string>();
    for (const t of LESSON_TRACK_IDS) {
      for (const c of LESSON_TRACKS[t].courses) {
        assert.equal(seen.has(c), false, `${c} is in two series`);
        seen.set(c, t);
      }
    }
    for (const c of courses) assert.ok(seen.has(c.id), `${c.id} has no series (it would get the default)`);
  });

  it("only names courses that exist", () => {
    const ids = new Set(courses.map((c) => c.id));
    for (const t of LESSON_TRACK_IDS) {
      for (const c of [...LESSON_TRACKS[t].courses, ...LESSON_TRACKS[t].related]) assert.ok(ids.has(c), `${t} names unknown course ${c}`);
    }
  });

  it("keys the series to the course of the lesson", () => {
    assert.equal(trackForCourse("ai-marketing"), "marketing");
    assert.equal(trackForCourse("brand-in-a-day"), "marketing");
    assert.equal(trackForCourse("ai-sales"), "sales");
    assert.equal(trackForCourse("ai-accounting"), "accounting");
    assert.equal(trackForCourse("get-found"), "get_found");
    assert.equal(trackForCourse("agent-skills"), "agents");
    assert.equal(trackForCourse("t3-code"), "agents");
    assert.equal(trackForCourse("claude-code"), "build");
    assert.equal(trackForCourse("not-a-course"), "default");
    assert.equal(trackForCourse(undefined), "default");
  });

  it("reads the lesson from the exercise gate's lead magnet", () => {
    assert.deepEqual(parseLessonMagnet("lesson:ai-sales/lesson-01-build-a-lead-list"), {
      courseId: "ai-sales",
      lessonSlug: "lesson-01-build-a-lead-list",
    });
    assert.equal(parseLessonMagnet("coaching_qualifier"), null);
  });

  it("starts, skips or switches series", () => {
    const mk = { courseId: "ai-marketing" };
    assert.deepEqual(decideLessonSeries(mk, []), { action: "enroll", flowType: "lesson_marketing" });
    assert.deepEqual(decideLessonSeries(mk, [{ flowType: "lesson_marketing", status: "active" }]), {
      action: "skip",
      reason: "same_series_active",
    });
    assert.deepEqual(decideLessonSeries(mk, [{ flowType: "lesson_marketing", status: "completed" }]), {
      action: "skip",
      reason: "series_already_done",
    });
    // A new topic replaces the one in progress (the conflict rule exits it).
    assert.deepEqual(decideLessonSeries(mk, [{ flowType: "lesson_sales", status: "active" }]), {
      action: "enroll",
      flowType: "lesson_marketing",
    });
    assert.ok(FLOW_CONFLICTS.lesson_marketing?.exitFlows.includes("lesson_sales"));
    assert.ok(!FLOW_CONFLICTS.lesson_marketing?.exitFlows.includes("lesson_marketing"));
    // Someone talking to David gets no automated series.
    assert.deepEqual(decideLessonSeries(mk, [{ flowType: "coaching_post_call", status: "active" }]), {
      action: "skip",
      reason: "coaching_flow_active",
    });
    assert.ok(FLOW_CONFLICTS.coaching_post_call?.exitFlows.includes("lesson_marketing"));
  });
});

describe("series content", () => {
  it("defines five emails and three texts per series, in order", () => {
    for (const ft of LESSON_FLOW_TYPES) {
      const steps = FLOW_DEFINITIONS[ft];
      assert.equal(steps.length, 8);
      for (let i = 1; i < steps.length; i++) assert.ok(steps[i]!.delayMs > steps[i - 1]!.delayMs);
    }
    assert.equal(LESSON_SERIES_SCHEDULE.filter((s) => s.channel === "email").length, 5);
    assert.equal(LESSON_SERIES_SCHEDULE.filter((s) => s.channel === "sms").length, 3);
    assert.deepEqual(parseLessonStepId("lesson_get_found_s2"), { track: "get_found", key: "s2", channel: "sms" });
    assert.equal(parseLessonStepId("coaching_reminder"), null);
  });

  it("renders every email for every lesson that has an exercise", () => {
    for (const c of courses) {
      const track = trackForCourse(c.id);
      for (const m of c.modules) {
        for (const l of m.lessons) {
          if (!l.exercise) continue;
          for (const s of LESSON_SERIES_SCHEDULE) {
            const id = lessonStepId(track, s.key);
            if (s.channel === "email") {
              const e = renderLessonEmail(id, { firstName: "Sam", unsubscribeUrl: UNSUB, lesson: { courseId: c.id, lessonSlug: l.slug } });
              assert.ok(e.subject.length > 5 && e.subject.length < 90, `${id} subject: ${e.subject}`);
              assert.ok(e.html.includes(UNSUB));
              assert.ok(e.text.includes(UNSUB));
              if (s.key === "e1") {
                assert.ok(e.subject.includes(l.title), "first email names the lesson");
                assert.ok(e.html.includes(`/university/${c.id}/exercises/${l.exercise}`), "first email links the exercise");
              }
            } else {
              const t = renderLessonSms(id, { firstName: "Sam", lesson: { courseId: c.id, lessonSlug: l.slug } });
              assert.ok(t.endsWith(SMS_STOP_LINE), `${id} must end with the STOP line`);
              assert.ok(t.includes("FromAItoBusiness"), `${id} must name the sender`);
              assert.ok(t.length <= 320, `${id} is ${t.length} chars: ${t}`);
              if (s.key === "s1") assert.ok(t.includes(`/exercises/${l.exercise}`));
            }
          }
        }
      }
    }
  });

  it("uses each series' own copy", () => {
    const mk = renderLessonEmail("lesson_marketing_e2", { unsubscribeUrl: UNSUB });
    const acct = renderLessonEmail("lesson_accounting_e2", { unsubscribeUrl: UNSUB });
    assert.equal(mk.subject, LESSON_TRACKS.marketing.play.subject);
    assert.equal(acct.subject, LESSON_TRACKS.accounting.play.subject);
    assert.notEqual(mk.html, acct.html);
    assert.match(renderLessonSms("lesson_sales_s2", {}), /leads/);
  });

  it("escapes the first name and keeps em dashes out of the copy", () => {
    const e = renderLessonEmail("lesson_sales_e1", { firstName: "<b>x</b>", unsubscribeUrl: UNSUB });
    assert.ok(!e.html.includes("<b>x</b>"));
    for (const t of LESSON_TRACK_IDS) assert.ok(!JSON.stringify(LESSON_TRACKS[t]).includes("—"), `${t} has an em dash`);
  });

  it("lists lesson emails with the admin previews and renders them through getTemplate", () => {
    const ids = listTemplateIds();
    assert.ok(ids.includes("lesson_marketing_e1"));
    assert.ok(!ids.some((id) => parseLessonStepId(id)?.channel === "sms"), "texts are not email templates");
    const r = getTemplate("lesson_default_e4", { email: "a@b.com", unsubscribeUrl: UNSUB });
    assert.match(r.html, /href="https:\/\/fromaitobusiness\.com\/coaching\/book"/);
  });
});

describe("texting rules", () => {
  it("needs the switch and all three Twilio secrets", () => {
    assert.equal(smsSendBlockReason({}), "sms_sends_disabled");
    assert.equal(smsSendBlockReason({ SMS_SENDS_ENABLED: "true" }), "sms_not_configured");
    assert.equal(
      smsSendBlockReason({ SMS_SENDS_ENABLED: "true", TWILIO_ACCOUNT_SID: "AC1", TWILIO_AUTH_TOKEN: "t", TWILIO_FROM_NUMBER: "+18005550100" }),
      null
    );
  });

  it("only texts 11am to 8pm Eastern", () => {
    assert.equal(isInsideTextingHours(Date.parse("2026-11-06T17:00:00Z")), true); // noon ET
    assert.equal(isInsideTextingHours(Date.parse("2026-11-06T14:00:00Z")), false); // 9am ET
    assert.equal(isInsideTextingHours(Date.parse("2026-11-07T02:00:00Z")), false); // 9pm ET
  });

  it("texts only consenting, opted-in numbers, and drops stale texts", () => {
    const now = Date.parse("2026-11-06T17:00:00Z");
    const lead = { email: "a@b.com", phone: "+14155550100", smsConsent: { given: true } } as LeadRecord;
    const base = { lead, blockReason: null, suppressed: false, sendAtMs: now - 60000, nowMs: now, insideHours: true };
    assert.deepEqual(decideSmsStep(base), { action: "send" });
    assert.equal(decideSmsStep({ ...base, blockReason: "sms_not_configured" }).action, "skip");
    assert.equal(decideSmsStep({ ...base, lead: { ...lead, smsConsent: { given: false } } as LeadRecord }).reason, "no_sms_consent");
    assert.equal(decideSmsStep({ ...base, lead: { ...lead, smsOptOutAt: "x" } as LeadRecord }).reason, "no_sms_consent");
    assert.equal(decideSmsStep({ ...base, lead: { email: "a@b.com" } as LeadRecord }).reason, "no_phone");
    assert.equal(decideSmsStep({ ...base, suppressed: true }).reason, "sms_opted_out");
    assert.equal(decideSmsStep({ ...base, insideHours: false }).action, "defer");
    assert.equal(decideSmsStep({ ...base, sendAtMs: now - 3 * 86400000 }).reason, "stale");
  });

  it("reads STOP and START replies", () => {
    assert.equal(classifyInboundText("STOP"), "stop");
    assert.equal(classifyInboundText(" Unsubscribe. "), "stop");
    assert.equal(classifyInboundText("start"), "start");
    assert.equal(classifyInboundText("yes"), "message");
    assert.equal(classifyInboundText("I got stuck on step 2"), "message");
  });

  it("checks Twilio's request signature", () => {
    const params = { From: "+14155550100", Body: "hi", MessageSid: "SM1" };
    const url = "https://fromaitobusiness.com/api/webhooks/twilio-sms";
    const sig = twilioSignature("secret", url, params);
    assert.equal(verifyTwilioSignature("secret", url, params, sig), true);
    assert.equal(verifyTwilioSignature("secret", url, { ...params, Body: "STOP" }, sig), false);
    assert.equal(verifyTwilioSignature("other", url, params, sig), false);
    assert.equal(verifyTwilioSignature("secret", url, params, null), false);
  });
});

describe("cron sends lesson texts", () => {
  const NOW = Date.now();
  function flow(): FlowDoc {
    return {
      userId: "lead:a",
      email: "a@b.com",
      flowType: "lesson_sales",
      status: "active",
      triggeredAt: new Date(NOW - 600000).toISOString(),
      lastFlowEmailSentAt: new Date(NOW - 300000).toISOString(),
      lesson: { courseId: "ai-sales", lessonSlug: "lesson-01-build-a-lead-list" },
      steps: [
        { stepId: "lesson_sales_e1", sendAt: new Date(NOW - 600000).toISOString(), sentAt: new Date(NOW - 300000).toISOString(), skipped: false },
        { stepId: "lesson_sales_s1", sendAt: new Date(NOW - 60000).toISOString(), sentAt: null, skipped: false },
        { stepId: "lesson_sales_e2", sendAt: new Date(NOW + 86400000).toISOString(), sentAt: null, skipped: false },
      ],
    };
  }

  it("lets the first text through right after the first email", () => {
    const pending = collectPendingEmails([{ id: "f", data: flow() }], NOW);
    assert.equal(pending.length, 1);
    assert.equal(pending[0]!.step.stepId, "lesson_sales_s1");
    assert.deepEqual(pending[0]!.lesson, flow().lesson);
  });

  function fx(log: string[], smsOk = true): ProcessFlowsEffects {
    return {
      sendEmail: async () => {
        log.push("email");
        return { ok: true };
      },
      unsubscribeUrlFor: async () => UNSUB,
      getTemplate: () => ({ subject: "s", html: "h" }),
      claimStepForSend: async () => ({ ok: true, claimId: "c" }),
      recordSendReceipt: async () => {
        log.push("receipt");
      },
      releaseStepClaim: async () => {},
      markStepSent: async () => {
        log.push("sent");
      },
      markStepSkipped: async () => {
        log.push("skipped");
      },
      markStepAttemptFailed: async () => {
        log.push("failed");
      },
      exitFlow: async () => {},
      sendSms: async (o) => {
        log.push(`sms:${o.to}:${o.body.includes("lead-list") || o.body.includes("Lead List")}`);
        return smsOk ? { ok: true, messageId: "SM1" } : { ok: false, skipped: true, error: "sms_opted_out" };
      },
      smsBlockReason: () => null,
      smsSuppressed: async () => false,
      insideTextingHours: () => true,
    };
  }

  const confirmed = (extra: Partial<LeadRecord>) =>
    ({ email: "a@b.com", status: "confirmed", emailOptIn: true, consent: { given: true }, ...extra }) as LeadRecord;

  async function run(lead: LeadRecord, effects: ProcessFlowsEffects) {
    const pending: PendingEmail[] = collectPendingEmails([{ id: "f", data: flow() }], NOW);
    return executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending,
      loadLead: async () => lead,
      loadSuppressed: async () => false,
      loadManualOnly: async () => false,
      loadFirstName: async () => "Sam",
      effects,
    });
  }

  it("texts a lead who said yes to texts", async () => {
    const log: string[] = [];
    const r = await run(confirmed({ phone: "+14155550100", smsConsent: { given: true, textVersion: "v", formSource: "f", requestedAt: "x" } }), fx(log));
    assert.equal(r.dryRun, false);
    if (!r.dryRun) assert.equal(r.textsSent, 1);
    assert.deepEqual(log, ["sms:+14155550100:true", "receipt", "sent"]);
  });

  it("skips the text for a lead who did not tick the text box", async () => {
    const log: string[] = [];
    await run(confirmed({ phone: "+14155550100", smsConsent: { given: false, textVersion: "v", formSource: "f", requestedAt: "x" } }), fx(log));
    assert.deepEqual(log, ["skipped"]);
  });

  it("skips (not fails) when Twilio says the number opted out", async () => {
    const log: string[] = [];
    await run(confirmed({ phone: "+14155550100", smsConsent: { given: true, textVersion: "v", formSource: "f", requestedAt: "x" } }), fx(log, false));
    assert.deepEqual(log, ["sms:+14155550100:true", "skipped"]);
  });

  it("skips texts cleanly when Twilio is not set up", async () => {
    const log: string[] = [];
    const effects = { ...fx(log), sendSms: undefined, smsBlockReason: undefined };
    await run(confirmed({ phone: "+14155550100", smsConsent: { given: true, textVersion: "v", formSource: "f", requestedAt: "x" } }), effects);
    assert.deepEqual(log, ["skipped"]);
  });
});

describe("email footer address", () => {
  it("prints the Wyoming postal address in every series email", async () => {
    const { POSTAL_ADDRESS, isPostalAddressPlaceholder } = await import("../content/site");
    assert.equal(isPostalAddressPlaceholder(), false);
    const e = renderLessonEmail("lesson_marketing_e1", { unsubscribeUrl: UNSUB });
    assert.ok(e.html.includes("30 N Gould Street, Suite R, Sheridan, WY 82801"));
    assert.ok(e.text.includes(POSTAL_ADDRESS));
  });
});
