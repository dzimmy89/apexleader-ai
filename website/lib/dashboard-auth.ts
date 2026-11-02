import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

/**
 * Bearer token for the read-only dashboard summary. Its own secret, so the
 * dashboard refresh never holds CRON_SECRET or INTERNAL_WEBHOOK_SECRET.
 * Fails closed in production when DASHBOARD_SUMMARY_TOKEN is not set.
 */
export function verifyDashboardToken(request: NextRequest): boolean {
  const secret = process.env.DASHBOARD_SUMMARY_TOKEN;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = request.headers.get("authorization") ?? "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
