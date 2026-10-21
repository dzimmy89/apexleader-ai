import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  MAX_UPLOAD_BYTES,
  addClientLink,
  deleteClientFile,
  getClientFile,
  listClientFiles,
  setClientFileHidden,
  uploadClientFile,
  type ClientFileKind,
} from "@/lib/coaching/client-files";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

async function emailFrom(params: Promise<{ email: string }>) {
  return decodeURIComponent((await params).email).trim().toLowerCase();
}

// GET /api/admin/contacts/:email/files
export async function GET(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const files = await listClientFiles(await emailFrom(params));
  return NextResponse.json({ files, maxUploadBytes: MAX_UPLOAD_BYTES }, { headers: NO_STORE });
}

// POST /api/admin/contacts/:email/files
// multipart: file, kind, title, note, sessionDate   (upload)
// JSON: { url, kind, title, note, sessionDate }     (link, e.g. a Drive recording)
export async function POST(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = await emailFrom(params);
  if (!email.includes("@")) return NextResponse.json({ error: "Bad email" }, { status: 400, headers: NO_STORE });
  try {
    if ((request.headers.get("content-type") || "").includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: "Choose a file" }, { status: 400, headers: NO_STORE });
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: "Files over 30 MB: share them from Drive and add the link." }, { status: 413, headers: NO_STORE });
      }
      const saved = await uploadClientFile(email, {
        kind: String(form.get("kind")) as ClientFileKind,
        title: String(form.get("title") || file.name),
        note: String(form.get("note") || ""),
        sessionDate: String(form.get("sessionDate") || "") || null,
        fileName: file.name,
        contentType: file.type,
        data: Buffer.from(await file.arrayBuffer()),
      });
      return NextResponse.json({ file: saved }, { headers: NO_STORE });
    }
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const saved = await addClientLink(email, {
      kind: String(body.kind) as ClientFileKind,
      title: String(body.title || ""),
      note: String(body.note || ""),
      sessionDate: typeof body.sessionDate === "string" ? body.sessionDate : null,
      url: String(body.url || ""),
    });
    return NextResponse.json({ file: saved }, { headers: NO_STORE });
  } catch (e) {
    console.error("[admin/files] add failed", e);
    const message = e instanceof Error && e.message.startsWith("Enter") ? e.message : "Could not save the file. Try a Drive link instead.";
    return NextResponse.json({ error: message }, { status: 400, headers: NO_STORE });
  }
}

// DELETE /api/admin/contacts/:email/files?id=...
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = await emailFrom(params);
  const id = request.nextUrl.searchParams.get("id") || "";
  const file = await getClientFile(id);
  if (!file || file.email !== email) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  await deleteClientFile(id);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

// PATCH /api/admin/contacts/:email/files  { id, hidden }  (hide or show a file in the client's account)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = await emailFrom(params);
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; hidden?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  const file = await getClientFile(id);
  if (!file || file.email !== email) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  await setClientFileHidden(id, body.hidden === true);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
