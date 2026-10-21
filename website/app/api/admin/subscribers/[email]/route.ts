import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deletePeople, getPerson } from "@/lib/crm/subscribers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email);
  const person = await getPerson(decoded);
  return NextResponse.json(person);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email);
  const includePipeline =
    request.nextUrl.searchParams.get("includePipeline") === "true";
  const result = await deletePeople([decoded], { includePipeline });
  return NextResponse.json({ ok: true, ...result });
}
