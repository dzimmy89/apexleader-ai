import { trustedAdminClientIp } from "@/lib/auth/admin-login-client-ip";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 8;

const hits = new Map<string, number[]>();

/** Same trusted hop as admin lockout: next-to-last X-Forwarded-For, not leftmost. */
export function clientIpFromHeaders(headers: Headers): string {
  return trustedAdminClientIp(
    headers.get("x-forwarded-for"),
    headers.get("x-real-ip")
  );
}

export function isLeadRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = ip || "unknown";
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

/** Test-only. */
export function resetLeadRateLimit(): void {
  hits.clear();
}
