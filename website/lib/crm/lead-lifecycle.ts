import { personNameLower } from "@/lib/crm/people-search";

export type LeadEmailStatus =
  | "pending"
  | "confirmed"
  | "unsubscribed"
  | "bounced"
  | "complained";

export type UnsubscribeMethod = "link" | "one_click" | "reply" | "admin";

export interface LeadUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface LeadConsent {
  given: boolean;
  textVersion: string;
  formSource: string;
  ip?: string;
  userAgent?: string;
  requestedAt: string;
  confirmedAt?: string;
}

export interface LeadRecord {
  email: string;
  firstName?: string;
  name?: string;
  /** Lowercased firstName/name for People prefix search. Older docs may omit it. */
  nameLower?: string;
  status?: LeadEmailStatus;
  consent?: LeadConsent;
  source?: string;
  sources?: string[];
  leadMagnet?: string;
  utm?: LeadUtm;
  lastUtm?: LeadUtm;
  referrer?: string;
  landingPath?: string;
  emailOptIn?: boolean;
  unsubscribeToken?: string;
  unsubscribedAt?: string;
  unsubscribeMethod?: UnsubscribeMethod;
  lastConfirmEmailAt?: string;
  lastConfirmEmailSentAt?: string;
  lastConfirmAttemptAt?: string;
  lastConfirmError?: string | null;
  captureCount?: number;
  persona?: string;
  /** Strict boolean true only. Set by public form / checkout, never from the client. */
  selfSignup?: boolean;
  signupOrigin?: "public_form" | "checkout";
  selfSignupSource?: string;
  selfSignupAt?: string;
  canonicalEmail?: string;
}

export function isLegacyLead(lead: LeadRecord | undefined | null): boolean {
  if (!lead) return false;
  return !lead.consent && !lead.status;
}

export function isEligibleForMarketing(
  lead: LeadRecord | undefined | null
): boolean {
  if (!lead) return false;
  if (isLegacyLead(lead)) return false;
  if (lead.status !== "confirmed") return false;
  if (lead.emailOptIn === false) return false;
  if (!lead.consent?.given && !lead.consent?.confirmedAt) return false;
  return true;
}

export const CONFIRM_SUCCESS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const CONFIRM_FAILURE_COOLDOWN_MS = 15 * 60 * 1000;

function parsedMs(iso?: string | null): number {
  if (!iso) return 0;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

/** Successful confirm send time, including legacy lastConfirmEmailAt-only docs. */
export function confirmSuccessAtMs(existing?: LeadRecord): number {
  return (
    parsedMs(existing?.lastConfirmEmailSentAt) ||
    parsedMs(existing?.lastConfirmEmailAt)
  );
}

export type CaptureEmailAction =
  | "send_confirm"
  | "throttle_confirm"
  | "already_confirmed"
  | "skip_customer"
  | "blocked_status";

/** Unsubscribed / bounced / complained must not be revived by capture or confirm. */
export function confirmIsBlocked(status?: LeadEmailStatus): boolean {
  return (
    status === "unsubscribed" ||
    status === "bounced" ||
    status === "complained"
  );
}

/** Bounce/complaint suppression is never cleared by a confirm click. */
export function shouldClearSuppressionOnConfirm(reason?: string): boolean {
  if (!reason) return false;
  const r = reason.toLowerCase();
  if (r === "bounce" || r === "complaint" || r === "complained") return false;
  return false;
}

export function nextCaptureAction(
  existing: LeadRecord | undefined,
  alreadyCustomer: boolean,
  nowMs: number
): CaptureEmailAction {
  if (alreadyCustomer) return "skip_customer";
  if (confirmIsBlocked(existing?.status)) {
    // Resubscribe after unsubscribe is a separate, explicit path (not this form).
    return "blocked_status";
  }
  if (existing?.status === "confirmed" && existing.emailOptIn !== false) {
    return "already_confirmed";
  }
  const successAt = confirmSuccessAtMs(existing);
  if (successAt && nowMs - successAt < CONFIRM_SUCCESS_COOLDOWN_MS) {
    return "throttle_confirm";
  }
  const attemptAt = parsedMs(existing?.lastConfirmAttemptAt);
  if (attemptAt && nowMs - attemptAt < CONFIRM_FAILURE_COOLDOWN_MS) {
    return "throttle_confirm";
  }
  return "send_confirm";
}

export function mergeCaptureFields(args: {
  existing: LeadRecord | undefined;
  email: string;
  firstName?: string;
  source: string;
  leadMagnet: string;
  persona?: string;
  utm?: LeadUtm;
  referrer?: string;
  landingPath?: string;
  consent: LeadConsent;
  unsubscribeToken: string;
}): LeadRecord {
  const { existing, email, source } = args;
  const sources = Array.from(
    new Set([...(existing?.sources || []), source].filter(Boolean))
  );
  const keepConfirmed =
    existing?.status === "confirmed" && existing.emailOptIn !== false;
  const blocked = confirmIsBlocked(existing?.status);

  const firstName =
    args.firstName || existing?.firstName || existing?.name || "";

  const status: LeadEmailStatus | undefined = blocked
    ? existing?.status
    : keepConfirmed
      ? "confirmed"
      : "pending";

  return {
    email,
    firstName,
    name: firstName || existing?.name || "",
    nameLower: personNameLower(firstName, existing?.name) || undefined,
    status,
    consent: keepConfirmed || blocked ? existing?.consent : args.consent,
    source: existing?.source || source,
    sources,
    leadMagnet: args.leadMagnet || existing?.leadMagnet || "",
    utm: existing?.utm || args.utm,
    lastUtm: args.utm || existing?.lastUtm,
    referrer: existing?.referrer || args.referrer || "",
    landingPath: existing?.landingPath || args.landingPath || "",
    emailOptIn: keepConfirmed ? true : false,
    unsubscribeToken: args.unsubscribeToken,
    persona: args.persona || existing?.persona || "",
    captureCount: (existing?.captureCount || 0) + 1,
    lastConfirmEmailAt: existing?.lastConfirmEmailAt,
    lastConfirmEmailSentAt: existing?.lastConfirmEmailSentAt,
    lastConfirmAttemptAt: existing?.lastConfirmAttemptAt,
    lastConfirmError: existing?.lastConfirmError,
    unsubscribedAt: blocked || keepConfirmed ? existing?.unsubscribedAt : undefined,
    unsubscribeMethod:
      blocked || keepConfirmed ? existing?.unsubscribeMethod : undefined,
  };
}

export function applyConfirm(
  existing: LeadRecord,
  nowIso: string
): LeadRecord {
  if (confirmIsBlocked(existing.status)) {
    return existing;
  }
  return {
    ...existing,
    status: "confirmed",
    emailOptIn: true,
    consent: {
      given: true,
      textVersion: existing.consent?.textVersion || "",
      formSource: existing.consent?.formSource || existing.source || "",
      ip: existing.consent?.ip,
      userAgent: existing.consent?.userAgent,
      requestedAt: existing.consent?.requestedAt || nowIso,
      confirmedAt: existing.consent?.confirmedAt || nowIso,
    },
  };
}

export function applyUnsubscribe(
  existing: LeadRecord | undefined,
  email: string,
  method: UnsubscribeMethod,
  nowIso: string
): LeadRecord {
  return {
    ...(existing || { email }),
    email,
    status: "unsubscribed",
    emailOptIn: false,
    unsubscribedAt: nowIso,
    unsubscribeMethod: method,
  };
}

export const ONE_CLICK_BODY = "List-Unsubscribe=One-Click";

export function isOneClickUnsubscribeRequest(args: {
  contentType: string | null;
  bodyText: string;
  headerListUnsubscribe?: string | null;
}): boolean {
  const body = args.bodyText.trim();
  if (body === ONE_CLICK_BODY || body.includes("List-Unsubscribe=One-Click")) {
    return true;
  }
  const header = (args.headerListUnsubscribe || "").toLowerCase();
  return header.includes("one-click");
}
