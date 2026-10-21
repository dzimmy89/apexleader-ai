import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { triggerFlow } from "@/lib/flows";
import { triggerFlowBlockReason } from "@/lib/crm/excluded-accounts";
import { automatedSendBlockedByManualOnly } from "@/lib/crm/contacts";
import type { FlowType } from "@/lib/crm/types";
import { leadFlowUserId } from "@/lib/lead-flows";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const status = request.nextUrl.searchParams.get("status") || "active";
  const snap =
    status === "all"
      ? await getDb().collection("flows").limit(100).get()
      : await getDb()
          .collection("flows")
          .where("status", "==", status)
          .limit(100)
          .get();
  return NextResponse.json({
    flows: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const body = await request.json();
  const email = String(body.email || "").toLowerCase();
  const flowType = body.flowType as FlowType;
  if (!email || !flowType) {
    return NextResponse.json({ error: "email and flowType required" }, { status: 400 });
  }
  const blocked = triggerFlowBlockReason(email);
  if (blocked) {
    return NextResponse.json({ ok: false, error: blocked }, { status: 400 });
  }
  try {
    if (await automatedSendBlockedByManualOnly(email, "confirmed_or_paid")) {
      return NextResponse.json(
        { ok: false, error: "manual_only_contact" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "manual_only_contact" },
      { status: 400 }
    );
  }
  const userId = body.userId || leadFlowUserId(email);
  const id = await triggerFlow(flowType, userId, email);
  return NextResponse.json({ ok: true, flowDocId: id });
}
