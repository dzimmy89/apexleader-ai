import { NextRequest, NextResponse } from "next/server";
import { crossSiteRejection, isSameOriginRequest } from "@/lib/account/request-guard";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { findCoachingClient } from "@/lib/account/coaching-client";
import { normalizeTelegramHandle } from "@/lib/account/telegram";
import { getDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

async function clientEmailForRequest(): Promise<{ email: string } | { error: NextResponse }> {
  const email = await getAccountEmail();
  if (!email) return { error: NextResponse.json({ error: "Sign in first" }, { status: 401, headers: NO_STORE }) };
  const client = await findCoachingClient(await getAccess(email));
  if (!client) {
    return { error: NextResponse.json({ error: "Messages are for private coaching clients" }, { status: 403, headers: NO_STORE }) };
  }
  return { email: client.email };
}

/** POST { handle }: remember the client's Telegram username so David knows who is writing. */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return crossSiteRejection();
  const who = await clientEmailForRequest();
  if ("error" in who) return who.error;
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const handle = normalizeTelegramHandle(body.handle);
  if (!handle) {
    return NextResponse.json(
      { error: "Enter your Telegram username: 5 to 32 letters, numbers or underscores, like @jane_trader." },
      { status: 400, headers: NO_STORE }
    );
  }
  await getDb()
    .collection("client_records")
    .doc(who.email)
    .set({ telegramHandle: handle, telegramHandleUpdatedAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ ok: true, handle }, { headers: NO_STORE });
}

/** DELETE: forget the username. */
export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) return crossSiteRejection();
  const who = await clientEmailForRequest();
  if ("error" in who) return who.error;
  await getDb()
    .collection("client_records")
    .doc(who.email)
    .set({ telegramHandle: null, telegramHandleUpdatedAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
