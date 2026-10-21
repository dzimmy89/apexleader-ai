import { NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/env";

/**
 * True when a state-changing request plainly came from this site: the
 * Origin header matches, or the browser marks it same-origin, or (for
 * browsers that send neither) the Referer is ours. Cross-site forms and
 * scripts fail every test. Server-side callers with no browser headers are
 * accepted only when they send no Origin at all and no fetch metadata.
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const allowed = new Set([getSiteOrigin(), request.nextUrl.origin]);
  const origin = request.headers.get("origin");
  if (origin) return allowed.has(origin);
  const fetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return true;
}

/** The 403 to return when `isSameOriginRequest` fails. */
export function crossSiteRejection(): NextResponse {
  return NextResponse.json({ error: "Request must come from the site" }, { status: 403, headers: { "Cache-Control": "no-store" } });
}
