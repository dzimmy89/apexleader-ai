import { NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/env";
import { redeemLoginToken } from "@/lib/account/login";
import { applyAccountCookie, createAccountSession } from "@/lib/account/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const redeemed = await redeemLoginToken(token).catch((e) => {
    console.error("[account/verify] failed", e);
    return null;
  });
  if (!redeemed) {
    return NextResponse.redirect(new URL("/login?expired=1", getSiteOrigin()));
  }
  const target = new URL(redeemed.next, getSiteOrigin());
  if (redeemed.linked) target.searchParams.set("link", "ok");
  if (redeemed.linkError) target.searchParams.set("link", "failed");
  const response = NextResponse.redirect(target);
  applyAccountCookie(response, await createAccountSession(redeemed.email));
  return response;
}
