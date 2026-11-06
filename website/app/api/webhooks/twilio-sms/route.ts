import { NextRequest, NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { getDb } from "@/lib/firebase-admin";
import { getSiteOrigin } from "@/lib/env";
import { exitFlowsForUser } from "@/lib/flows";
import { sendEmail } from "@/lib/gmail";
import { escapeHtml } from "@/lib/html";
import { leadFlowUserId } from "@/lib/lead-flows";
import { LESSON_FLOW_TYPES } from "@/lib/lesson-series/messages";
import { formatPhone, normalizePhone } from "@/lib/phone";
import {
  classifyInboundText,
  clearSmsOptOut,
  recordSmsOptOut,
  SMS_LOG,
  twilioConfig,
  verifyTwilioSignature,
} from "@/lib/sms";

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twiml(status = 200) {
  return new NextResponse(EMPTY_TWIML, { status, headers: { "Content-Type": "text/xml" } });
}

/**
 * POST from Twilio for every text sent to the business number. Set it as the
 * number's "A message comes in" webhook:
 *   https://fromaitobusiness.com/api/webhooks/twilio-sms
 *
 * STOP words opt the number out (Twilio also blocks further sends itself),
 * START opts back in, and anything else is a real reply: it stops the
 * automated lesson series for that lead and is forwarded to the inbox so
 * David can answer by hand.
 */
export async function POST(request: NextRequest) {
  const config = twilioConfig();
  if (!config) return twiml(503);

  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((v, k) => {
    if (typeof v === "string") params[k] = v;
  });
  // Twilio signs the public URL it called, not Cloud Run's internal one.
  const url = `${getSiteOrigin()}${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!verifyTwilioSignature(config.authToken, url, params, request.headers.get("x-twilio-signature"))) {
    return twiml(403);
  }

  const from = normalizePhone(params.From) ?? "";
  const body = (params.Body || "").slice(0, 1600);
  if (!from) return twiml();
  const kind = classifyInboundText(body);
  const db = getDb();
  const nowIso = new Date().toISOString();

  await db
    .collection(SMS_LOG)
    .add({ from, body, direction: "inbound", kind, twilioSid: params.MessageSid || null, receivedAt: nowIso })
    .catch((e) => console.error("[twilio-sms] log", e));

  if (kind === "stop") {
    await recordSmsOptOut(from, "stop_reply");
    return twiml();
  }
  if (kind === "start") {
    await clearSmsOptOut(from);
    return twiml();
  }
  if (kind === "help") return twiml();

  const leads = await db.collection("leads").where("phone", "==", from).limit(5).get();
  const emails = leads.docs.map((d) => String(d.data().email || d.id));
  for (const email of emails) {
    for (const ft of LESSON_FLOW_TYPES) {
      await exitFlowsForUser(leadFlowUserId(email), ft, "replied_by_text").catch((e) =>
        console.error("[twilio-sms] exit series", e)
      );
    }
  }

  const origin = getSiteOrigin();
  const who = emails.length
    ? emails.map((e) => `<a href="${origin}/admin/people/${encodeURIComponent(e)}">${escapeHtml(e)}</a>`).join(", ")
    : "no lead with this number";
  try {
    await sendEmail({
      to: BRAND.email,
      subject: `Text from ${formatPhone(from)}: ${body.slice(0, 60)}`,
      html: `<p><strong>${escapeHtml(formatPhone(from))}</strong> (${who}) texted:</p>
<blockquote style="border-left:3px solid #c9a227;padding-left:12px;">${escapeHtml(body).replace(/\n/g, "<br />")}</blockquote>
<p>Their automated lesson texts and emails have stopped so you can answer by hand: email them back, or text them from the Twilio console.</p>`,
      text: `${formatPhone(from)} (${emails.join(", ") || "no lead with this number"}) texted:\n\n${body}\n\nTheir automated lesson series has stopped so you can answer by hand.`,
      purpose: "transactional",
      log: { source: "sms_inbound_forward" },
    });
  } catch (e) {
    console.error("[twilio-sms] forward", e);
  }
  return twiml();
}
