import { NextRequest, NextResponse } from "next/server";
import { createBotCareCheckoutSession } from "@/lib/coaching/stripe";

// POST /api/coaching/bot-care/checkout
// Body: { email, name? }. Only coaching clients on record can start Bot Care.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter the email you coach with." }, { status: 400 });
  }

  const result = await createBotCareCheckoutSession({ email, name });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
  }

  return NextResponse.json({ url: result.url, sessionId: result.sessionId });
}
