import {
  POSTAL_ADDRESS,
  isPostalAddressPlaceholder,
} from "@/content/site";
import { BRAND } from "@/lib/brand";
import { getSiteOrigin } from "@/lib/env";
import { escapeHtml } from "@/lib/html";

export function emailLogoImg(): string {
  const origin = getSiteOrigin();
  return `<img src="${origin}/favicon.ico" alt="${BRAND.name}" width="48" height="48" style="display:block;max-width:48px;height:auto;" />`;
}

type MarketingShell = {
  purpose: "marketing";
  bodyHtml: string;
  previewText?: string;
  unsubscribeUrl: string;
  /** Why the recipient is on this list. Defaults to the lead/signup line. */
  receivingReason?: string;
};

type TransactionalShell = {
  purpose?: "transactional";
  bodyHtml: string;
  previewText?: string;
  unsubscribeUrl?: string;
};

export type EmailShellOpts = MarketingShell | TransactionalShell;

export const MARKETING_RECEIVING_REASON_LEAD = `You're receiving this because you asked about private coaching at ${BRAND.domain}.`;

export const MARKETING_RECEIVING_REASON_MEMBER = `You're receiving this because you're a ${BRAND.name} client.`;

function postalFooterLine(): string {
  if (isPostalAddressPlaceholder()) return "";
  return `<p>${escapeHtml(POSTAL_ADDRESS)}</p>`;
}

export function emailShell(opts: MarketingShell): string;
export function emailShell(opts: TransactionalShell): string;
export function emailShell(opts: EmailShellOpts): string {
  const purpose = opts.purpose ?? "transactional";
  switch (purpose) {
    case "marketing":
      if (!opts.unsubscribeUrl) {
        throw new Error("emailShell requires unsubscribeUrl for marketing templates");
      }
      break;
    case "transactional":
      break;
    default: {
      const _exhaustive: never = purpose;
      throw new Error(`Unknown email purpose: ${_exhaustive}`);
    }
  }

  const origin = getSiteOrigin();
  const unsub = opts.unsubscribeUrl
    ? `<p style="font-size:12px;color:#888;"><a href="${opts.unsubscribeUrl}" style="color:#888;">Unsubscribe</a></p>`
    : "";
  const preview = opts.previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.previewText}</div>`
    : "";
  let why = "";
  if (opts.purpose === "marketing") {
    why = `<p>${opts.receivingReason || MARKETING_RECEIVING_REASON_LEAD}</p>
<p>Unsubscribe in one click: <a href="${opts.unsubscribeUrl}" style="color:#888;">${opts.unsubscribeUrl}</a> (or reply "unsubscribe").</p>`;
  }
  const legalEntityLine = `<p>${escapeHtml(BRAND.legalName)}. Coaching and education. No guaranteed outcomes.</p>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Georgia,serif;">
${preview}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #333;">
<tr><td style="padding:24px 32px;">
${emailLogoImg()}
</td></tr>
<tr><td style="padding:0 32px 32px;color:#e8e4dc;font-size:16px;line-height:1.6;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:0 32px 24px;border-top:1px solid #333;font-size:12px;color:#888;">
${why}
${legalEntityLine}
${postalFooterLine()}
<p><a href="${origin}" style="color:#c9a227;">${BRAND.domain}</a></p>
${unsub}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Strip markup so marketing plaintext uses the same copy as the HTML body. */
export function htmlFragmentToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|ol|ul|table)>/gi, "\n")
    .replace(
      /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_m, href: string, label: string) => {
        const inner = htmlFragmentToText(label).replace(/\s+/g, " ").trim();
        if (!inner || inner === href) return href;
        return `${inner} ${href}`;
      }
    )
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function marketingPlaintext(args: {
  bodyHtml: string;
  unsubscribeUrl: string;
}): string {
  const body = htmlFragmentToText(args.bodyHtml);
  const footer = isPostalAddressPlaceholder()
    ? args.unsubscribeUrl
    : `${POSTAL_ADDRESS.trim()}\n${args.unsubscribeUrl}`;
  return `${body}\n\n${footer}\n`;
}
