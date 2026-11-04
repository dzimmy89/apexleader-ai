import { NextRequest, NextResponse } from "next/server";
import { createCryptoNotice } from "@/lib/coaching/crypto-notices";
import { clientIpFromHeaders, isLeadRateLimited } from "@/lib/lead-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/coaching/crypto-notice
// Saves an unconfirmed crypto transfer notice. Grants nothing until the coach
// confirms the transfer in the admin.
export async function POST(request: NextRequest) {
  if (isLeadRateLimited(clientIpFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const text = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");

  let result: Awaited<ReturnType<typeof createCryptoNotice>>;
  try {
    result = await createCryptoNotice({
      name: text("name"),
      email: text("email"),
      packageId: text("packageId"),
      network: text("network"),
      txHash: text("txHash"),
      planId: text("planId") || "full",
    });
  } catch (error) {
    console.error("[crypto-notice]", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not save the notice" }, { status: 500 });
  }
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
