import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deletePeople, listPeople } from "@/lib/crm/subscribers";
import { InvalidPeopleCursorError } from "@/lib/crm/people-search";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const type = request.nextUrl.searchParams.get("type") as
    | "lead"
    | "member"
    | "all"
    | null;
  const search = request.nextUrl.searchParams.get("search") || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0", 10);
  const cursor = request.nextUrl.searchParams.get("cursor") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  try {
    const result = await listPeople({
      limit,
      offset,
      cursor,
      type: type || "all",
      search,
      status,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InvalidPeopleCursorError) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: { emails?: string[]; includePipeline?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emails = Array.isArray(body.emails)
    ? body.emails.filter((e): e is string => typeof e === "string")
    : [];
  if (!emails.length) {
    return NextResponse.json({ error: "emails required" }, { status: 400 });
  }
  if (emails.length > 100) {
    return NextResponse.json({ error: "Max 100 emails per request" }, { status: 400 });
  }

  const result = await deletePeople(emails, {
    includePipeline: Boolean(body.includePipeline),
  });
  return NextResponse.json({ ok: true, ...result });
}
