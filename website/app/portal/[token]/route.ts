import { NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/env";
import { primaryEmailFor } from "@/lib/account/links";
import { touchAccount } from "@/lib/account/login";
import { applyAccountCookie, createAccountSession } from "@/lib/account/session";
import { resolvePortalSession, revokeMagicLink } from "@/lib/coaching/portal-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /portal/<token>: a client portal link from an email. The portal now
 * lives on /account, so the link signs the client in and goes there. The
 * link works once: it opens the whole account, so a forwarded or leaked
 * email must not keep working; a second click lands on the sign-in page,
 * which sends a fresh link.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await resolvePortalSession(token).catch((e) => {
    console.error("[portal] token lookup failed", e);
    return { ok: false as const };
  });
  const origin = getSiteOrigin();
  if (!session.ok || !("clientEmail" in session) || !session.clientEmail) {
    return NextResponse.redirect(new URL("/login?next=/account&expired=1", origin));
  }
  // The coaching email may be linked to another sign-in email: open that account.
  const email = await primaryEmailFor(session.clientEmail).catch(() => session.clientEmail!);
  await Promise.all([
    touchAccount(email, { lastSignInMethod: "portal_link" }).catch((e) => console.error("[portal] touch failed", e)),
    revokeMagicLink(session.clientId || session.clientEmail).catch((e) => console.error("[portal] revoke failed", e)),
  ]);
  const response = NextResponse.redirect(new URL("/account", origin));
  applyAccountCookie(response, await createAccountSession(email));
  return response;
}
