import { POSTAL_ADDRESS, isPostalAddressPlaceholder } from "@/content/site";
import { BRAND } from "@/lib/brand";
import { escapeHtml } from "@/lib/html";
import type { CrmPipelineStatus } from "@/lib/crm/contacts";

/**
 * Counsel-locked footer for admin 1:1 mail. Not editable in the UI.
 * Em dash and straight quotes are intentional.
 */
export const ADMIN_1TO1_FOOTER_TEXT =
  `No guaranteed outcomes.\n${BRAND.legalName}${isPostalAddressPlaceholder() ? "" : `, ${POSTAL_ADDRESS}`}\nReply "stop" or use the unsubscribe link below and I won't email you again.`;

export const ADMIN_1TO1_PROMOTIONAL_IDENTIFICATION =
  `This is a promotional email from ${BRAND.name}.`;

export const ADMIN_1TO1_IDEMPOTENCY_COLLECTION = "crm_admin_1to1_idempotency";
export const ADMIN_1TO1_SEND_SOURCE = "admin_1to1";
export const ADMIN_1TO1_MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;
/** Sends must come from the coach's mailbox domain, which can differ from the site domain. */
export const SENDER_DOMAIN = BRAND.email.slice(BRAND.email.lastIndexOf("@") + 1);

export const ADMIN_1TO1_AD_KINDS = ["promotional", "personal"] as const;
export type Admin1to1AdKind = (typeof ADMIN_1TO1_AD_KINDS)[number];

export function isAdmin1to1AdKind(value: string): value is Admin1to1AdKind {
  return (ADMIN_1TO1_AD_KINDS as readonly string[]).includes(value);
}

export const ADMIN_1TO1_AD_KIND_HELPER =
  "Promotional = mainly promotes a DU offer, price, or sign-up. Personal = a relationship note that doesn't sell anything.";

export const ADMIN_1TO1_PERSONAL_OFFER_ACK_TEXT =
  "I confirm this email does not promote a DU offer";

export const ADMIN_1TO1_LOCK_COLLECTION = "crm_admin_1to1_locks";

const HOLDINGS_WORD_TERMS = [
  "guarantee",
  "guaranteed",
  "returns",
  "profit",
  "apy",
  "apr",
  "yield",
  "holdings",
  "holding",
  "portfolio",
  "allocate",
  "allocation",
] as const;

const HOLDINGS_PHRASES = [
  "you should buy",
  "you should sell",
  "you should hold",
  "position size",
] as const;

const NODE_PRICES = ["$99", "$30"] as const;

export function readConfiguredSenderEmail(): string {
  const raw = process.env.SENDER_EMAIL;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return "";
}

export function isDuSenderAddress(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0) return false;
  const domain = normalized.slice(at + 1);
  return domain === SENDER_DOMAIN || domain.endsWith(`.${SENDER_DOMAIN}`);
}

export function duSenderOrBlockReason(): { ok: true; email: string } | { ok: false; error: string } {
  const email = readConfiguredSenderEmail();
  if (!email) {
    return { ok: false, error: "sender_not_configured" };
  }
  if (!isDuSenderAddress(email)) {
    return { ok: false, error: "sender_not_du_domain" };
  }
  return { ok: true, email };
}

export function isForbiddenThreadSubject(subject: string): boolean {
  return /^\s*(re|fwd|fw)\s*:/i.test(subject);
}

export function holdingsLanguageHits(body: string): string[] {
  const hits: string[] = [];
  const lower = body.toLowerCase();
  for (const term of HOLDINGS_WORD_TERMS) {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(body)) hits.push(term);
  }
  for (const phrase of HOLDINGS_PHRASES) {
    if (lower.includes(phrase)) hits.push(phrase);
  }
  for (const price of NODE_PRICES) {
    if (body.includes(price)) hits.push(price);
  }
  if (/\$\s*\d/.test(body) && !hits.includes("$99") && !hits.includes("$30")) {
    hits.push("$");
  }
  return [...new Set(hits)];
}

export function holdingsLanguageWarning(body: string): string | null {
  if (holdingsLanguageHits(body).length === 0) return null;
  return "Body mentions holdings, prices, or investment language. Sending is still allowed with acknowledgement.";
}

const PERSONAL_PRICE_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "$7,500", pattern: /\$7,500(?:\.00)?|\$7500(?:\.00)?/g },
  { label: "$2,500", pattern: /\$2,500(?:\.00)?|\$2500(?:\.00)?/g },
  { label: "$1,250", pattern: /\$1,250(?:\.00)?|\$1250(?:\.00)?/g },
  { label: "$834", pattern: /\$834(?:\.00)?(?![\d,])/g },
  { label: "$750", pattern: /\$750(?:\.00)?(?![\d,])/g },
  { label: "$7,200", pattern: /\$7,200(?:\.00)?|\$7200(?:\.00)?/g },
  { label: "$1,800", pattern: /\$1,800(?:\.00)?|\$1800(?:\.00)?/g },
  { label: "$600", pattern: /\$600(?:\.00)?(?![\d,])/g },
  { label: "$97", pattern: /\$97(?:\.00)?(?![\d,])/g },
  { label: "$29", pattern: /\$29(?:\.00)?(?![\d,])/g },
  { label: "$7", pattern: /\$7(?:\.00)?(?![\d,])/g },
];

const PERSONAL_LINK_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "/coaching/book", pattern: /\/coaching\/book/i },
  { label: "buy.stripe.com", pattern: /buy\.stripe\.com/i },
  { label: "stripe.com", pattern: /stripe\.com/i },
  { label: "checkout", pattern: /\bcheckout\b/i },
];

const PERSONAL_WORD_TERMS = ["enroll", "join", "signup", "offer", "discount"] as const;

export function personalOfferHits(subject: string, body: string): string[] {
  const text = `${subject}\n${body}`;
  const hits: string[] = [];
  for (const { label, pattern } of PERSONAL_PRICE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) hits.push(label);
  }
  for (const { label, pattern } of PERSONAL_LINK_PATTERNS) {
    if (pattern.test(text)) hits.push(label);
  }
  if (/\bsign[\s-]*up\b/i.test(text)) hits.push("sign up");
  for (const term of PERSONAL_WORD_TERMS) {
    const pattern = new RegExp(`\\b${term}\\b`, "i");
    if (pattern.test(text)) hits.push(term);
  }
  return [...new Set(hits)];
}

export function appendAdmin1to1Footer(args: {
  body: string;
  unsubscribeUrl: string;
  promotionalIdentification?: boolean;
}): { text: string; html: string } {
  const body = args.body.replace(/\r\n/g, "\n").trimEnd();
  const promo = args.promotionalIdentification
    ? `${ADMIN_1TO1_PROMOTIONAL_IDENTIFICATION}\n\n`
    : "";
  const text = `${body}\n\n${promo}${ADMIN_1TO1_FOOTER_TEXT}\n\nUnsubscribe: ${args.unsubscribeUrl}`;
  const bodyHtml = escapeHtml(body).replace(/\n/g, "<br />");
  const promoHtml = args.promotionalIdentification
    ? `<p>${escapeHtml(ADMIN_1TO1_PROMOTIONAL_IDENTIFICATION)}</p>`
    : "";
  const footerHtml = escapeHtml(ADMIN_1TO1_FOOTER_TEXT).replace(/\n/g, "<br />");
  const html = `<div>${bodyHtml}</div>${promoHtml}<p>${footerHtml}</p><p><a href="${escapeHtml(args.unsubscribeUrl)}">Unsubscribe</a></p>`;
  return { text, html };
}

export function pipelineStatusAfterAdmin1to1Send(
  status: CrmPipelineStatus
): CrmPipelineStatus {
  switch (status) {
    case "new":
    case "drafted":
      return "contacted";
    case "contacted":
    case "replied":
    case "call_booked":
    case "client":
    case "passed":
    case "do_not_contact":
      return status;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function admin1to1HardBlockReason(contact: {
  doNotContact: boolean;
  hubspotBounced: boolean;
  hubspotOptedOut: boolean;
  internal: boolean;
  suppressed: boolean;
}): string | null {
  if (contact.doNotContact) return "do_not_contact";
  if (contact.hubspotBounced) return "bounced";
  if (contact.hubspotOptedOut) return "opted_out";
  if (contact.internal) return "internal";
  if (contact.suppressed) return "suppressed";
  return null;
}
