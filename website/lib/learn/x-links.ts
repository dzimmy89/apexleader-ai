/**
 * Tracked lesson links for X. David picks the lesson that matches what the
 * person posted about and types their handle; the link carries both, so the
 * lead record shows which DM or reply brought them in. Pure.
 */
export type XLinkMedium = "dm" | "reply" | "post";

export function cleanHandle(raw: string): string {
  return raw.trim().replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "");
}

export function isValidHandle(handle: string): boolean {
  return /^[A-Za-z0-9_]{1,15}$/.test(handle);
}

export function buildXLessonLink(args: {
  origin: string;
  courseId: string;
  lessonSlug: string;
  handle?: string;
  medium: XLinkMedium;
}): string {
  const url = new URL(`/university/${args.courseId}/lessons/${args.lessonSlug}`, args.origin);
  url.searchParams.set("utm_source", "x");
  url.searchParams.set("utm_medium", args.medium);
  url.searchParams.set("utm_campaign", args.courseId);
  const handle = args.handle ? cleanHandle(args.handle) : "";
  if (handle && isValidHandle(handle)) url.searchParams.set("utm_content", handle);
  return url.toString();
}
