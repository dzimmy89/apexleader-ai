import { NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/env";

const FORBIDDEN = { error: "Forbidden" } as const;

/** Apex and www are both live hosts for /admin/login (no redirect in this PR). */
export const ADMIN_LOGIN_APEX_ORIGIN = "https://defiuniversity.xyz";
export const ADMIN_LOGIN_WWW_ORIGIN = "https://www.defiuniversity.xyz";

export function isJsonContentType(header: string | null): boolean {
  if (!header) return false;
  const media = header.split(";")[0]?.trim().toLowerCase() ?? "";
  return media === "application/json";
}

/**
 * Canonical origin via `new URL(value).origin` (scheme + host + port only).
 * Rejects `null`, userinfo, and non-http(s). No substring / endsWith / regex
 * host matching.
 */
export function parseExactOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username !== "" || url.password !== "") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** Exact Origin match against getSiteOrigin(). Missing Origin is rejected. */
export function originMatchesSite(request: NextRequest): boolean {
  const header = request.headers.get("origin");
  if (!header) return false;
  const got = parseExactOrigin(header);
  const want = parseExactOrigin(getSiteOrigin());
  return Boolean(got && want && got === want);
}

export function allowLocalAdminLoginOrigins(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * Allowlist is hardcoded constants plus site env (`NEXT_PUBLIC_SITE_URL` /
 * `SITE_ORIGIN` via getSiteOrigin). Never Host or X-Forwarded-Host.
 */
export function adminLoginOriginAllowlist(): readonly string[] {
  const origins = new Set<string>();
  for (const raw of [ADMIN_LOGIN_APEX_ORIGIN, ADMIN_LOGIN_WWW_ORIGIN, getSiteOrigin()]) {
    const origin = parseExactOrigin(raw);
    if (origin) origins.add(origin);
  }
  return [...origins];
}

function isExactLoopbackOrigin(canonical: string): boolean {
  const url = new URL(canonical);
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

export function isAllowedAdminLoginOrigin(
  candidate: string,
  allowLocal: boolean = allowLocalAdminLoginOrigins()
): boolean {
  const canonical = parseExactOrigin(candidate);
  if (!canonical) return false;
  if (adminLoginOriginAllowlist().includes(canonical)) return true;
  if (allowLocal && isExactLoopbackOrigin(canonical)) return true;
  return false;
}

/**
 * Origin header wins when present (including the literal `null`, which is
 * rejected). If Origin is omitted: Sec-Fetch-Site `same-origin` is accepted
 * as a browser fallback. `same-site` and `cross-site` are not enough on their
 * own — they are rejected unless a Referer (or Origin) exact-matches the
 * allowlist. Referer is checked the same way as Origin: `new URL(referer).origin`
 * must equal an allowlisted origin.
 */
export function adminLoginRequestIsTrustedOrigin(request: NextRequest): boolean {
  const originHeader = request.headers.get("origin");
  if (originHeader !== null && originHeader !== "") {
    return isAllowedAdminLoginOrigin(originHeader);
  }

  const fetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (fetchSite === "same-origin") {
    return true;
  }

  const referer = request.headers.get("referer") || request.headers.get("referrer");
  if (referer && isAllowedAdminLoginOrigin(referer)) {
    return true;
  }

  return false;
}

export function rejectUntrustedAdminLoginPost(
  request: NextRequest
): NextResponse | null {
  if (!isJsonContentType(request.headers.get("content-type"))) {
    return NextResponse.json(FORBIDDEN, { status: 403 });
  }
  if (!adminLoginRequestIsTrustedOrigin(request)) {
    return NextResponse.json(FORBIDDEN, { status: 403 });
  }
  return null;
}
