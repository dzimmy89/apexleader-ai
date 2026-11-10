/**
 * Tells David when a lesson signup comes in: who, which lesson, which
 * campaign, which X handle, with a link to the person in Mission Control.
 * Goes to the business inbox (SENDER_EMAIL). Never throws.
 */
import { BRAND } from "@/lib/brand";
import { SENDER_EMAIL, getSiteOrigin } from "@/lib/env";
import { sendEmail } from "@/lib/gmail";
import { escapeHtml } from "@/lib/html";
import type { Attribution } from "@/lib/attribution-cookie";
import { formatPhone } from "@/lib/phone";

export interface LeadAlertInput {
  email: string;
  step: "email" | "mobile";
  phone?: string | null;
  smsConsent?: boolean;
  courseTitle: string;
  lessonTitle: string;
  lessonPath: string;
  attribution: Attribution;
}

/** The X handle a "Copy X link" link carries (utm_content), when the link came from X. */
export function xHandleFrom(attribution: Attribution): string | null {
  const utm = attribution.utm;
  if (!utm?.content || !/^(x|twitter)$/i.test(utm.source || "")) return null;
  const handle = utm.content.replace(/^@/, "").trim();
  return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : null;
}

export function leadAlertContent(input: LeadAlertInput): { subject: string; lines: [string, string][]; personUrl: string } {
  const origin = getSiteOrigin();
  const handle = xHandleFrom(input.attribution);
  const utm = input.attribution.utm;
  const campaign = utm?.source || utm?.campaign ? [utm.source, utm.medium, utm.campaign].filter(Boolean).join(" · ") : "direct";
  const who = handle ? `@${handle}` : input.email;
  const subject =
    input.step === "email"
      ? `New lead: ${who} opened ${input.lessonTitle}`
      : `Lead added a mobile: ${who} on ${input.lessonTitle}`;
  const lines: [string, string][] = [
    ["Email", input.email],
    ["Mobile", input.phone ? `${formatPhone(input.phone)}${input.smsConsent ? " (texts OK)" : " (no texts)"}` : "not yet"],
    ["Lesson", `${input.lessonTitle}, ${input.courseTitle}`],
    ["Campaign", campaign],
  ];
  if (handle) lines.push(["X", `https://x.com/${handle}`]);
  if (input.attribution.landingPath && input.attribution.landingPath !== input.lessonPath) {
    lines.push(["First page", input.attribution.landingPath]);
  }
  return { subject, lines, personUrl: `${origin}/admin/people/${encodeURIComponent(input.email)}` };
}

export async function sendLeadAlert(input: LeadAlertInput): Promise<void> {
  try {
    const { subject, lines, personUrl } = leadAlertContent(input);
    const text = `${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nOpen in Mission Control: ${personUrl}`;
    const rows = lines
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;">${escapeHtml(k)}</td><td style="padding:4px 0;">${
            /^https?:\/\//.test(v) ? `<a href="${escapeHtml(v)}">${escapeHtml(v)}</a>` : escapeHtml(v)
          }</td></tr>`
      )
      .join("");
    await sendEmail({
      to: SENDER_EMAIL,
      purpose: "transactional",
      subject,
      text,
      html: `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">${rows}</table><p style="font-family:sans-serif;font-size:14px;"><a href="${escapeHtml(personUrl)}">Open in Mission Control</a></p><p style="font-family:sans-serif;font-size:12px;color:#6b7280;">${escapeHtml(BRAND.name)} lesson signup alert</p>`,
      log: { source: "lead_alert" },
    });
  } catch (e) {
    console.error("[lead-alert] send failed", e);
  }
}
