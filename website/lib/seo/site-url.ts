import { BRAND } from "../brand";

/**
 * Canonical public origin. Stripe webhooks, Cloud Scheduler, and health checks
 * already call the apex, so marketing pages use it too; `www` 301s here for
 * every path except `/api/*` (see next.config.ts).
 */
export const SITE_HOST = BRAND.domain;
export const SITE_URL = `https://${SITE_HOST}`;
export const LEGACY_WWW_HOST = `www.${SITE_HOST}`;

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
