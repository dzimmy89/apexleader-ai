import { getStorage } from "firebase-admin/storage";
import { getAdminApp } from "@/lib/firebase-admin";

/**
 * Lesson clips are for the people who can open the lesson. In production they
 * live in a private bucket (LEARN_VIDEO_BUCKET) under the same path the
 * `:::video` slot names, so `/learn/video/ai-sales/as-l1-overview.mp4` is the
 * object `learn/video/ai-sales/as-l1-overview.mp4`. The lesson page checks
 * access first, then swaps each slot's src, captions and poster for a signed
 * link that lasts long enough to watch the lesson in one sitting.
 *
 * With no bucket set, development serves the same paths from public/, and
 * production drops every slot so no broken player shows.
 */
export const LEARN_VIDEO_URL_TTL_MS = 6 * 60 * 60 * 1000;

const SIGNED_FIELDS = new Set(["src", "captions", "poster"]);
const VIDEO_ASSET = /^\/learn\/video\/[a-z0-9-]+\/[a-z0-9-]+\.(mp4|webm|vtt|jpe?g|png|webp)$/i;
const SLOT = /^:::video[ \t]*\n([\s\S]*?)^:::[ \t]*$\n?/gm;

export type SignObject = (objectPath: string) => Promise<string>;

export function learnVideoBucket(): string | null {
  return process.env.LEARN_VIDEO_BUCKET?.trim() || null;
}

/** v4 signed read links. On Cloud Run this signs through IAM (needs Token Creator on its own account). */
export function bucketSigner(bucketName: string, ttlMs = LEARN_VIDEO_URL_TTL_MS): SignObject {
  return async (objectPath) => {
    const [url] = await getStorage(getAdminApp())
      .bucket(bucketName)
      .file(objectPath)
      .getSignedUrl({ version: "v4", action: "read", expires: Date.now() + ttlMs });
    return url;
  };
}

/** Rewrite every clip asset path inside `:::video` slots with `sign`. Paths outside /learn/video/ are left alone. */
export async function signLearnVideoSlots(markdown: string, sign: SignObject): Promise<string> {
  const paths = new Set<string>();
  for (const m of markdown.matchAll(SLOT)) {
    for (const line of m[1]!.split("\n")) {
      const f = line.match(/^\s*([a-z-]+):\s*(.*)$/i);
      if (f && SIGNED_FIELDS.has(f[1]!.toLowerCase()) && VIDEO_ASSET.test(f[2]!.trim())) paths.add(f[2]!.trim());
    }
  }
  if (paths.size === 0) return markdown;

  const signed = new Map<string, string>();
  await Promise.all(
    [...paths].map(async (p) => {
      signed.set(p, await sign(p.slice(1)));
    }),
  );

  return markdown.replace(SLOT, (block) =>
    block.replace(/^(\s*)([a-z-]+)(:\s*)(.*)$/gim, (line, lead: string, key: string, sep: string, value: string) => {
      const url = SIGNED_FIELDS.has(key.toLowerCase()) ? signed.get(value.trim()) : undefined;
      return url ? `${lead}${key}${sep}${url}` : line;
    }),
  );
}

/** The markdown with every `:::video` slot removed. */
export function withoutLearnVideoSlots(markdown: string): string {
  return markdown.replace(SLOT, "");
}

/**
 * The body a reader who can open the piece should get. Signs the clips when a
 * bucket is set; otherwise keeps the public/ paths in development and drops
 * the slots in production. If signing fails the slots are dropped, so the
 * lesson still reads.
 */
export async function withSignedLearnVideos(markdown: string): Promise<string> {
  if (!markdown.includes(":::video")) return markdown;
  const bucket = learnVideoBucket();
  if (!bucket) return process.env.NODE_ENV === "production" ? withoutLearnVideoSlots(markdown) : markdown;
  try {
    return await signLearnVideoSlots(markdown, bucketSigner(bucket));
  } catch (e) {
    console.error("[learn/video] signing failed", e);
    return withoutLearnVideoSlots(markdown);
  }
}
