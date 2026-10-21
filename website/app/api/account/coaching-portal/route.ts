import { NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/env";
import { getAccountEmail } from "@/lib/account/session";

/**
 * GET: old "open the coaching portal" links. Booking, the agreement and
 * documents now live on /account, so this just goes there.
 */
export async function GET() {
  const email = await getAccountEmail();
  if (!email) return NextResponse.redirect(new URL("/login?next=/account", getSiteOrigin()));
  return NextResponse.redirect(new URL("/account#coaching", getSiteOrigin()));
}
