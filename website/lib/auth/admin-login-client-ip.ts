/**
 * Trusted client IP for admin password lockout.
 *
 * Production traffic: Internet → Google external HTTPS Application Load
 * Balancer → serverless NEG → Cloud Run (Next.js).
 *
 * Google documents that the external Application Load Balancer *appends*
 * two addresses, counting from the right so a client-supplied prefix cannot
 * impersonate the connecting client:
 *
 *   X-Forwarded-For: <existing-value>,<client-ip>,<load-balancer-ip>
 *
 * Untrusted existing values are not verified. The forwarding-rule IP is
 * always last; the address the client used to reach the LB is next-to-last.
 * Google's custom-request-header `client_ip_address` is defined as that
 * next-to-last hop; `server_ip_address` is the last hop.
 *
 * Sources:
 * - https://cloud.google.com/load-balancing/docs/https#x-forwarded-for_header
 * - https://cloud.google.com/load-balancing/docs/https/custom-headers
 *   (`client_ip_address` / `server_ip_address`)
 *
 * Cloud Run + serverless NEG: the ALB docs also describe optional extra
 * right-hand hops (`<GFE-ip>,<backend-ip>`) when a *backend* HTTP reverse
 * proxy appends after the LB. That section is written for VM reverse
 * proxies. Serverless NEGs have no backend instance IP
 * (https://cloud.google.com/load-balancing/docs/negs/serverless-neg-concepts)
 * and Cloud Run's security overview does not document a further XFF append
 * for load-balanced requests
 * (https://cloud.google.com/run/docs/securing/security).
 * We therefore skip exactly one right-hand hop (the LB forwarding-rule IP)
 * and take the next.
 *
 * Residual risk: if Cloud Run's platform proxy later starts appending the
 * connecting GFE, next-to-last would become the LB IP and every client
 * would share one key (the previous last-hop bug). Confirm with a live
 * XFF sample before changing the skip count; do not take the leftmost hop.
 *
 * Fewer than two hops (local `next dev`, tests): use the only hop, then
 * X-Real-IP, then "unknown".
 */
export function parseForwardedForHops(forwardedFor: string | null): string[] {
  if (!forwardedFor) return [];
  return forwardedFor
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Client IP as observed by the Google external ALB (next-to-last XFF hop).
 * Never uses the leftmost hop when two or more addresses are present.
 */
export function trustedAdminClientIp(
  forwardedFor: string | null,
  realIp: string | null
): string {
  const hops = parseForwardedForHops(forwardedFor);
  if (hops.length >= 2) {
    const client = hops[hops.length - 2];
    if (client) return client.slice(0, 128);
  }
  if (hops.length === 1 && hops[0]) {
    return hops[0].slice(0, 128);
  }
  const fallback = realIp?.trim();
  if (fallback) return fallback.slice(0, 128);
  return "unknown";
}

/** @deprecated Use trustedAdminClientIp. Kept for older test imports. */
export function lastForwardedClientIp(
  forwardedFor: string | null,
  realIp: string | null
): string {
  return trustedAdminClientIp(forwardedFor, realIp);
}
