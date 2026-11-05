"use client";

import { useEffect } from "react";
import { ATTRIBUTION_COOKIE, ATTRIBUTION_MAX_AGE, utmFromSearch } from "@/lib/attribution-cookie";

/**
 * Remembers how a visitor arrived (utm_ tags, the referring site, the first
 * page) in a cookie, once per browser, so the forms they fill in later can
 * say which X reply or campaign brought them. Renders nothing.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      if (document.cookie.split("; ").some((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`))) return;
      const utm = utmFromSearch(window.location.search);
      let referrer: string | undefined;
      if (document.referrer) {
        try {
          const host = new URL(document.referrer).host;
          if (host && host !== window.location.host) referrer = document.referrer.slice(0, 500);
        } catch {
          referrer = undefined;
        }
      }
      if (!utm && !referrer) return;
      const value = JSON.stringify({ utm, referrer, landingPath: window.location.pathname.slice(0, 300) });
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(value)}; Max-Age=${ATTRIBUTION_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    } catch {
      // Cookies off: attribution is a nice-to-have, never a blocker.
    }
  }, []);
  return null;
}
