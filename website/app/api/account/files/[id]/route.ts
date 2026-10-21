import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminCookie } from "@/lib/admin-auth";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { getClientFile, openClientFile } from "@/lib/coaching/client-files";
import { streamDriveFile } from "@/lib/coaching/meet-recordings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/account/files/:id: the signed-in client's own file, or any file for an admin.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await getClientFile(id);
  const email = await getAccountEmail();
  const isAdmin = file ? (await requireAdminCookie(request)).ok : false;
  // Any email linked to the signed-in account may open that email's files.
  const emails = file && email && !isAdmin ? (await getAccess(email)).emails : [];
  const allowed = file && ((!!email && emails.includes(file.email) && !file.hidden) || isAdmin);
  if (!file || !allowed) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  if (file.driveFileId) {
    try {
      const video = await streamDriveFile(file.driveFileId, request.headers.get("range"));
      return new Response(video.body, {
        status: video.status,
        headers: {
          ...video.headers,
          "Content-Disposition": "inline",
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (e) {
      console.error("[account/files] drive stream failed", e);
      return NextResponse.json(
        { error: "This recording can't be played right now." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }
  }
  if (file.url) return NextResponse.redirect(file.url, 302);
  const stream = Readable.toWeb(openClientFile(file)) as ReadableStream<Uint8Array>;
  // Inline only for types a browser cannot run script from (no HTML, no SVG).
  const type = file.contentType || "";
  const inline = /^(application\/pdf|image\/(png|jpeg|gif|webp)|video\/|audio\/|text\/plain)/.test(type);
  return new Response(stream, {
    headers: {
      "Content-Type": inline ? type : "application/octet-stream",
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${file.fileName || "file"}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
