import {
  isExcludedCrmEmail,
  isExcludedCrmMetadata,
} from "./excluded-accounts";

export const INACTIVE_MS = 14 * 24 * 60 * 60 * 1000;
export const REENGAGEMENT_PAGE_SIZE = 100;
export const REENGAGEMENT_MAX_PAGES = 50;

export const REENGAGEMENT_TIERS = ["skool", "paid"] as const;

export type ReengagementSkipReason =
  | "wrong_tier"
  | "inactive_status"
  | "missing_last_active"
  | "invalid_last_active"
  | "still_active"
  | "excluded_email"
  | "excluded_source";

export type ReengagementDecision =
  | { enroll: true; userId: string; email: string }
  | { enroll: false; reason: ReengagementSkipReason };

function isTimestampLike(
  value: object
): value is { toMillis: () => number } {
  return typeof (value as { toMillis?: unknown }).toMillis === "function";
}

function isToDateLike(value: object): value is { toDate: () => Date } {
  return typeof (value as { toDate?: unknown }).toDate === "function";
}

/** Returns a finite activity timestamp, or null if missing/invalid. */
export function parseLastActiveAtMs(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const ms = Date.parse(trimmed);
    if (!Number.isFinite(ms) || ms <= 0) return null;
    return ms;
  }
  if (typeof value === "object") {
    if (isTimestampLike(value)) {
      const ms = value.toMillis();
      if (!Number.isFinite(ms) || ms <= 0) return null;
      return ms;
    }
    if (isToDateLike(value)) {
      const ms = value.toDate().getTime();
      if (!Number.isFinite(ms) || ms <= 0) return null;
      return ms;
    }
  }
  return null;
}

export function evaluateReengagementMember(
  docId: string,
  data: Record<string, unknown>,
  nowMs: number,
  inactiveMs = INACTIVE_MS
): ReengagementDecision {
  const tier = data.tier;
  if (typeof tier !== "string" || !(REENGAGEMENT_TIERS as readonly string[]).includes(tier)) {
    return { enroll: false, reason: "wrong_tier" };
  }
  if (data.status !== "active") {
    return { enroll: false, reason: "inactive_status" };
  }

  const emailRaw = (data.email || docId) as unknown;
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  if (isExcludedCrmEmail(email)) {
    return { enroll: false, reason: "excluded_email" };
  }
  if (isExcludedCrmMetadata(data.metadata)) {
    return { enroll: false, reason: "excluded_source" };
  }

  if (!("lastActiveAt" in data) || data.lastActiveAt == null) {
    return { enroll: false, reason: "missing_last_active" };
  }
  const lastMs = parseLastActiveAtMs(data.lastActiveAt);
  if (lastMs == null) {
    return { enroll: false, reason: "invalid_last_active" };
  }
  const cutoff = nowMs - inactiveMs;
  if (lastMs > cutoff) {
    return { enroll: false, reason: "still_active" };
  }

  const uidRaw = data.firebaseUid;
  const userId =
    typeof uidRaw === "string" && uidRaw.trim() ? uidRaw.trim() : email;
  return { enroll: true, userId, email };
}
