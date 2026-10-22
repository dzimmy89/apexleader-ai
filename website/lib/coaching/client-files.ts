import { randomBytes } from "crypto";
import { getStorage } from "firebase-admin/storage";
import { getAdminApp, getDb } from "@/lib/firebase-admin";

/**
 * client_files/{id}: call recordings and materials David shares with one
 * coaching client, shown in that client's /account.
 *
 * A file is either a link (a Google Meet recording in David's Drive, shared
 * with the client) or an upload stored privately in the contracts bucket
 * under client-files/<email>/. Uploads are served only through
 * /api/account/files/<id>, which checks the signed-in email, so the bucket
 * never needs to be public. Uploads go through the app, so they are capped
 * below Cloud Run's request limit; long recordings belong in Drive.
 */
export const CLIENT_FILES = "client_files";
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

export type ClientFileKind = "recording" | "material";

export interface ClientFile {
  id: string;
  email: string;
  kind: ClientFileKind;
  title: string;
  note: string;
  /** YYYY-MM-DD of the session, for recordings. */
  sessionDate: string | null;
  url: string | null;
  storagePath: string | null;
  fileName: string | null;
  contentType: string | null;
  size: number | null;
  /** A Meet recording in David's Drive, streamed through the site. */
  driveFileId: string | null;
  sessionId: string | null;
  /** "meet_auto" when the calendar sync added it. */
  source: string | null;
  /** Hidden files stay on the admin side only. */
  hidden: boolean;
  createdAt: string;
}

export function bucketName(): string {
  return process.env.CONTRACTS_GCS_BUCKET || "apexleader-prod-contracts";
}

function readFile(id: string, data: Record<string, unknown>): ClientFile {
  return {
    id,
    email: String(data.email || ""),
    kind: data.kind === "material" ? "material" : "recording",
    title: String(data.title || "Untitled"),
    note: String(data.note || ""),
    sessionDate: typeof data.sessionDate === "string" && data.sessionDate ? data.sessionDate : null,
    url: typeof data.url === "string" && data.url ? data.url : null,
    storagePath: typeof data.storagePath === "string" && data.storagePath ? data.storagePath : null,
    fileName: typeof data.fileName === "string" ? data.fileName : null,
    contentType: typeof data.contentType === "string" ? data.contentType : null,
    size: typeof data.size === "number" ? data.size : null,
    driveFileId: typeof data.driveFileId === "string" && data.driveFileId ? data.driveFileId : null,
    sessionId: typeof data.sessionId === "string" && data.sessionId ? data.sessionId : null,
    source: typeof data.source === "string" ? data.source : null,
    hidden: data.hidden === true,
    createdAt: String(data.createdAt || ""),
  };
}

/** Only http(s) links; anything else is refused. */
export function safeLink(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function safeFileName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (cleaned || "file").slice(-120);
}

export async function listClientFiles(email: string): Promise<ClientFile[]> {
  const snap = await getDb().collection(CLIENT_FILES).where("email", "==", email.trim().toLowerCase()).get();
  return snap.docs
    .map((d) => readFile(d.id, d.data()))
    .sort((a, b) => (b.sessionDate || b.createdAt).localeCompare(a.sessionDate || a.createdAt));
}

export async function getClientFile(id: string): Promise<ClientFile | null> {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  const snap = await getDb().collection(CLIENT_FILES).doc(id).get();
  return snap.exists ? readFile(snap.id, snap.data() || {}) : null;
}

interface NewFile {
  kind: ClientFileKind;
  title: string;
  note?: string;
  sessionDate?: string | null;
}

function baseDoc(email: string, input: NewFile) {
  const date = input.sessionDate && /^\d{4}-\d{2}-\d{2}$/.test(input.sessionDate) ? input.sessionDate : null;
  return {
    email: email.trim().toLowerCase(),
    kind: input.kind === "material" ? "material" : "recording",
    title: input.title.trim().slice(0, 200) || "Untitled",
    note: (input.note || "").trim().slice(0, 2000),
    sessionDate: date,
    createdAt: new Date().toISOString(),
  };
}

export async function addClientLink(email: string, input: NewFile & { url: string }): Promise<ClientFile> {
  const url = safeLink(input.url);
  if (!url) throw new Error("Enter a full https:// link.");
  const ref = getDb().collection(CLIENT_FILES).doc();
  const doc = { ...baseDoc(email, input), url, storagePath: null };
  await ref.set(doc);
  return readFile(ref.id, doc);
}

export async function uploadClientFile(
  email: string,
  input: NewFile & { fileName: string; contentType: string; data: Buffer }
): Promise<ClientFile> {
  if (input.data.length > MAX_UPLOAD_BYTES) throw new Error("Files over 30 MB: share them from Drive and add the link.");
  const ref = getDb().collection(CLIENT_FILES).doc();
  const fileName = safeFileName(input.fileName);
  const storagePath = `client-files/${email.trim().toLowerCase()}/${ref.id}-${randomBytes(4).toString("hex")}-${fileName}`;
  const contentType = input.contentType || "application/octet-stream";
  await getStorage(getAdminApp())
    .bucket(bucketName())
    .file(storagePath)
    .save(input.data, { contentType, resumable: false, metadata: { cacheControl: "private, max-age=0" } });
  const doc = { ...baseDoc(email, input), url: null, storagePath, fileName, contentType, size: input.data.length };
  await ref.set(doc);
  return readFile(ref.id, doc);
}

export async function deleteClientFile(id: string): Promise<boolean> {
  const file = await getClientFile(id);
  if (!file) return false;
  if (file.storagePath) {
    await getStorage(getAdminApp())
      .bucket(bucketName())
      .file(file.storagePath)
      .delete({ ignoreNotFound: true })
      .catch((e) => console.error("[client-files] delete failed", e));
  }
  await getDb().collection(CLIENT_FILES).doc(id).delete();
  return true;
}

export async function setClientFileHidden(id: string, hidden: boolean): Promise<boolean> {
  const file = await getClientFile(id);
  if (!file) return false;
  await getDb().collection(CLIENT_FILES).doc(id).set({ hidden }, { merge: true });
  return true;
}

/** A readable stream of an uploaded file. */
export function openClientFile(file: ClientFile) {
  if (!file.storagePath) throw new Error("not an upload");
  return getStorage(getAdminApp()).bucket(bucketName()).file(file.storagePath).createReadStream();
}
