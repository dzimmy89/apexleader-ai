import { getDb } from "@/lib/firebase-admin";

export async function logActivity(input: {
  email: string;
  type: "stage_change" | "note" | "payment";
  title: string;
  description?: string;
  meta?: Record<string, unknown>;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.collection("activity_log").add({
    email: input.email.trim().toLowerCase(),
    type: input.type,
    title: input.title,
    description: input.description || "",
    meta: input.meta || {},
    at: now,
    createdAt: now,
  });
}

export async function getActivityLog(email: string, limit = 30) {
  const db = getDb();
  const id = email.trim().toLowerCase();
  const snap = await db
    .collection("activity_log")
    .where("email", "==", id)
    .orderBy("at", "desc")
    .limit(limit)
    .get()
    .catch(async () => {
      // Fallback if index missing: fetch without orderBy
      const fallback = await db
        .collection("activity_log")
        .where("email", "==", id)
        .limit(limit)
        .get();
      return fallback;
    });

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
