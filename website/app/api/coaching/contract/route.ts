import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createSignatureRequest } from "@/lib/coaching/signatures";
import type { PaymentPlan } from "@/lib/coaching/packages";

// POST /api/coaching/contract
// Admin-protected: creates a signature request after Stripe checkout completes
// or after an admin manually triggers it from the CRM.
// Body: { clientId, packageId, planId, signerName, signerEmail }
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const clientId = typeof body.clientId === "string" ? body.clientId.trim().toLowerCase() : "";
  const packageId = typeof body.packageId === "string" ? body.packageId : "";
  const planId =
    typeof body.planId === "string"
      ? (body.planId as PaymentPlan["id"])
      : "full";
  const signerName = typeof body.signerName === "string" ? body.signerName.trim() : "";
  const signerEmail =
    typeof body.signerEmail === "string"
      ? body.signerEmail.trim().toLowerCase()
      : clientId;

  if (!clientId || !packageId) {
    return NextResponse.json(
      { error: "clientId and packageId are required" },
      { status: 400 }
    );
  }

  const requestIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";

  const result = await createSignatureRequest({
    clientId,
    packageId,
    planId,
    signerName,
    signerEmail,
    requestIpAddress: requestIp,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
