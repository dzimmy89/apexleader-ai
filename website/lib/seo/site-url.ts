import { BRAND } from "../brand";

/**
 * Canonical public origin: NEXT_PUBLIC_SITE_URL (the Cloud Run address until
 * the domain is mapped), else the brand domain. `www` 301s here for every path
 * except `/api/*` (see next.config.ts).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || `https://${BRAND.domain}`
).replace(/\/$/, "");
export const SITE_HOST = new URL(SITE_URL).host;
export const LEGACY_WWW_HOST = `www.${SITE_HOST}`;

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
