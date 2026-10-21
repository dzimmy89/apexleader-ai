import fs from "node:fs";
import path from "node:path";

export type PieceKind = "lessons" | "exercises" | "quizzes";

const ROOT = path.join(process.cwd(), "content/learn/courses");
const SAFE = /^[a-z0-9-]+$/;

/** Raw markdown of one lesson, exercise or quiz, or null when it does not exist. */
export function readPiece(courseId: string, kind: PieceKind, slug: string): string | null {
  if (!SAFE.test(courseId) || !SAFE.test(slug)) return null;
  const file = path.join(ROOT, courseId, kind, `${slug}.md`);
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}
