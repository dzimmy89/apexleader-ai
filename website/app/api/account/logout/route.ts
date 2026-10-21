import { NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/env";
import { clearAccountCookie } from "@/lib/account/session";

export async function POST() {
  const response = NextResponse.redirect(new URL("/", getSiteOrigin()), { status: 303 });
  clearAccountCookie(response);
  return response;
}
