import { getDb } from "@/lib/firebase-admin";

/**
 * learn_progress/{email}: one doc per learner.
 * lessons / exercises: key "<courseId>/<slug>" → ISO time completed.
 * quizzes: key "<courseId>/<quizId>" → best score and when.
 */
export const PROGRESS = "learn_progress";

export interface LearnProgress {
  lessons: Record<string, string>;
  exercises: Record<string, string>;
  quizzes: Record<string, { best: number; last: number; at: string }>;
  lastVisited?: { href: string; title: string; at: string } | null;
}

export const EMPTY_PROGRESS: LearnProgress = { lessons: {}, exercises: {}, quizzes: {}, lastVisited: null };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function readProgress(data: Record<string, unknown> | undefined): LearnProgress {
  const lessons: Record<string, string> = {};
  const exercises: Record<string, string> = {};
  const quizzes: LearnProgress["quizzes"] = {};
  for (const [k, v] of Object.entries(asRecord(data?.lessons))) if (typeof v === "string") lessons[k] = v;
  for (const [k, v] of Object.entries(asRecord(data?.exercises))) if (typeof v === "string") exercises[k] = v;
  for (const [k, v] of Object.entries(asRecord(data?.quizzes))) {
    const q = asRecord(v);
    quizzes[k] = { best: Number(q.best || 0), last: Number(q.last || 0), at: String(q.at || "") };
  }
  const lv = asRecord(data?.lastVisited);
  return {
    lessons,
    exercises,
    quizzes,
    lastVisited: typeof lv.href === "string" ? { href: lv.href, title: String(lv.title || ""), at: String(lv.at || "") } : null,
  };
}

export async function getProgress(email: string): Promise<LearnProgress> {
  const snap = await getDb().collection(PROGRESS).doc(email).get();
  return snap.exists ? readProgress(snap.data()) : { ...EMPTY_PROGRESS };
}

export async function markComplete(
  email: string,
  kind: "lessons" | "exercises",
  key: string,
  done: boolean
): Promise<void> {
  const ref = getDb().collection(PROGRESS).doc(email);
  const { FieldValue } = await import("firebase-admin/firestore");
  await ref.set(
    { [kind]: { [key]: done ? new Date().toISOString() : FieldValue.delete() }, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function recordQuiz(email: string, key: string, score: number): Promise<{ best: number }> {
  const db = getDb();
  const ref = db.collection(PROGRESS).doc(email);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = readProgress(snap.data()).quizzes[key];
    const best = Math.max(current?.best || 0, score);
    tx.set(
      ref,
      { quizzes: { [key]: { best, last: score, at: new Date().toISOString() } }, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return { best };
  });
}

export async function recordVisit(email: string, href: string, title: string): Promise<void> {
  await getDb()
    .collection(PROGRESS)
    .doc(email)
    .set({ lastVisited: { href, title, at: new Date().toISOString() } }, { merge: true });
}
