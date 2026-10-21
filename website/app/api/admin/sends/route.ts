import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const snap = await getDb()
    .collection("emailLog")
    .orderBy("sentAt", "desc")
    .limit(limit)
    .get();
  return NextResponse.json({
    sends: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}
