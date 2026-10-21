/**
 * CRM automation suppressions for synthetic / operator accounts.
 * Append to these lists when adding new test harnesses — do not scatter
 * extra matchers through enrollment code.
 */

/** Exact email domain suffixes (matched with endsWith, already lowercased). */
export const EXCLUDED_EMAIL_DOMAIN_SUFFIXES = ["@defiuniversity.com"] as const;

/** Substrings that mark loop, smoke, and similar harness mailboxes. */
export const EXCLUDED_EMAIL_SUBSTRINGS = ["loop-test", "forge-smoke"] as const;

/** Why enroll/trigger must refuse this address. Null means allowed. */
export function triggerFlowBlockReason(
  email: string
): "excluded_email" | null {
  if (isExcludedCrmEmail(email)) return "excluded_email";
  return null;
}

/** `members.metadata.source` values that are never real members. */
export const EXCLUDED_METADATA_SOURCES = ["loop"] as const;

export function isExcludedCrmEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return true;
  for (const suffix of EXCLUDED_EMAIL_DOMAIN_SUFFIXES) {
    if (normalized.endsWith(suffix)) return true;
  }
  for (const part of EXCLUDED_EMAIL_SUBSTRINGS) {
    if (normalized.includes(part)) return true;
  }
  return false;
}

export function isExcludedCrmMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const source = (metadata as { source?: unknown }).source;
  if (typeof source !== "string") return false;
  return (EXCLUDED_METADATA_SOURCES as readonly string[]).includes(source);
}

/** Explicit reasons for operator dry-run flags. Empty means not a test/loop account. */
export function crmTestAccountFlagReasons(
  email: string,
  metadata?: unknown
): string[] {
  const reasons: string[] = [];
  const normalized = email.trim().toLowerCase();
  for (const suffix of EXCLUDED_EMAIL_DOMAIN_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      reasons.push(`email_domain:${suffix}`);
    }
  }
  for (const part of EXCLUDED_EMAIL_SUBSTRINGS) {
    if (normalized.includes(part)) {
      reasons.push(`email_substring:${part}`);
    }
  }
  if (isExcludedCrmMetadata(metadata)) {
    reasons.push("metadata.source:loop");
  }
  return reasons;
}
