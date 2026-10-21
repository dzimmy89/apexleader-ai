import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/coaching/stripe";
import type { PaymentPlan } from "@/lib/coaching/packages";

const VALID_PLAN_IDS: PaymentPlan["id"][] = ["full", "3pay", "6pay"];

// POST /api/coaching/checkout
// Body: { packageId, planId, email, name? }
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const packageId = typeof body.packageId === "string" ? body.packageId : "";
  const planId = typeof body.planId === "string" ? (body.planId as PaymentPlan["id"]) : "full";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!packageId) {
    return NextResponse.json(
      { error: "packageId is required" },
      { status: 400 }
    );
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!VALID_PLAN_IDS.includes(planId)) {
    return NextResponse.json(
      { error: `planId must be one of: ${VALID_PLAN_IDS.join(", ")}` },
      { status: 400 }
    );
  }

  const result = await createCheckoutSession({ packageId, planId, email, name });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
