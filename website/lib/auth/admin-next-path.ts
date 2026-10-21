/** Default post-login landing when `?next=` is missing or rejected. */
export const DEFAULT_ADMIN_NEXT_PATH = "/admin";

const MAX_NEXT_LENGTH = 512;
const QUERY_ALLOWED = /^[A-Za-z0-9._~=&%+\-]*$/;

/**
 * Allowlist `?next=` to a same-origin relative path under `/admin`.
 * Rejects absolute URLs, protocol-relative (`//host`), backslashes,
 * control characters, and encoded tricks (nested decode + path normalize).
 * A simple query string is kept (`/admin/email/sends?x=1`).
 */
export function safeAdminNextPath(raw: string | null | undefined): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_NEXT_LENGTH) {
    return DEFAULT_ADMIN_NEXT_PATH;
  }

  let decoded = raw;
  for (let i = 0; i < 5; i++) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return DEFAULT_ADMIN_NEXT_PATH;
    }
    if (next === decoded) break;
    decoded = next;
  }

  if (/[\\\0]/.test(decoded) || /\s/.test(decoded)) {
    return DEFAULT_ADMIN_NEXT_PATH;
  }

  const qIndex = decoded.indexOf("?");
  const pathPart = qIndex === -1 ? decoded : decoded.slice(0, qIndex);
  const queryPart = qIndex === -1 ? "" : decoded.slice(qIndex + 1);

  if (/[:\\]/.test(pathPart)) {
    return DEFAULT_ADMIN_NEXT_PATH;
  }
  if (pathPart.includes("//") || pathPart.includes("..")) {
    return DEFAULT_ADMIN_NEXT_PATH;
  }
  if (!pathPart.startsWith("/admin")) {
    return DEFAULT_ADMIN_NEXT_PATH;
  }
  if (pathPart.length > "/admin".length && pathPart["/admin".length] !== "/") {
    return DEFAULT_ADMIN_NEXT_PATH;
  }
  if (queryPart && !QUERY_ALLOWED.test(queryPart)) {
    return DEFAULT_ADMIN_NEXT_PATH;
  }

  const segments = pathPart.split("/");
  const out: string[] = [];
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      return DEFAULT_ADMIN_NEXT_PATH;
    }
    if (!/^[A-Za-z0-9._~-]+$/.test(segment)) {
      return DEFAULT_ADMIN_NEXT_PATH;
    }
    out.push(segment);
  }

  if (out[0] !== "admin") {
    return DEFAULT_ADMIN_NEXT_PATH;
  }

  const path = `/${out.join("/")}`;
  return queryPart ? `${path}?${queryPart}` : path;
}
