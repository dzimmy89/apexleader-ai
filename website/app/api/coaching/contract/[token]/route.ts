import { NextRequest, NextResponse } from "next/server";
import { getSignatureByToken, captureSignature } from "@/lib/coaching/signatures";

interface RouteContext {
  params: Promise<{ token: string }>;
}

// GET /api/coaching/contract/[token]
// Public (token-gated): returns the contract HTML + status for the signing page.
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const result = await getSignatureByToken(token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json(result);
}

// POST /api/coaching/contract/[token]
// Public (token-gated): captures the signature.
// Body: { typedName, signatureDataUri }
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const typedName = typeof body.typedName === "string" ? body.typedName.trim() : "";
  const signatureDataUri =
    typeof body.signatureDataUri === "string" ? body.signatureDataUri : null;

  if (!typedName) {
    return NextResponse.json({ error: "Typed name is required" }, { status: 400 });
  }

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  const userAgent = request.headers.get("user-agent") || "";

  let result: Awaited<ReturnType<typeof captureSignature>>;
  try {
    result = await captureSignature({
      token,
      typedName,
      signatureDataUri,
      ipAddress,
      userAgent,
    });
  } catch (e) {
    console.error("[coaching/contract] signing failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "We could not save your signature. Try again in a minute." }, { status: 500 });
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
