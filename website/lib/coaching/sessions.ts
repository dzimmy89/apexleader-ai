import { getDb } from "@/lib/firebase-admin";

export type SessionStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export interface CoachingSessionDoc {
  id?: string;
  clientId: string;
  clientName?: string;
  packageId?: string;
  coachEmail?: string;
  calendarEventId?: string;
  scheduledAt: string;
  durationMins: number;
  status: SessionStatus;
  privateNotes?: string;
  sharedNotes?: string;
  actionItems?: string[];
  meetUrl?: string;
  isProBono?: boolean;
  groupSize?: number;
  completedAt?: string;
  /** "portal", "calendar" or absent for sessions added by hand. */
  source?: string;
  /** "admin" once David sets the status by hand; the calendar sync leaves it alone. */
  statusSource?: "calendar" | "admin";
  /** Marked "not a session": hidden from counts and never re-created by the sync. */
  ignored?: boolean;
  lateCancel?: boolean;
  title?: string;
  recordingFileId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function listSessions(opts: {
  clientId?: string;
  status?: SessionStatus;
  limit?: number;
}): Promise<CoachingSessionDoc[]> {
  const db = getDb();
  const limit = Math.min(opts.limit ?? 100, 500);

  let query: FirebaseFirestore.Query = db
    .collection("coaching_sessions")
    .orderBy("scheduledAt", "desc")
    .limit(limit);

  if (opts.clientId) {
    query = db
      .collection("coaching_sessions")
      .where("clientId", "==", opts.clientId.trim().toLowerCase())
      .orderBy("scheduledAt", "desc")
      .limit(limit);
  }

  if (opts.status && !opts.clientId) {
    query = db
      .collection("coaching_sessions")
      .where("status", "==", opts.status)
      .orderBy("scheduledAt", "desc")
      .limit(limit);
  }

  const snap = await query.get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CoachingSessionDoc, "id">),
  }));
}

export async function getSession(id: string): Promise<CoachingSessionDoc | null> {
  const db = getDb();
  const doc = await db.collection("coaching_sessions").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<CoachingSessionDoc, "id">) };
}

export interface CreateSessionInput {
  clientId: string;
  packageId?: string;
  scheduledAt: string;
  durationMins?: number;
  coachEmail?: string;
  calendarEventId?: string;
  meetUrl?: string;
  isProBono?: boolean;
}

export async function createSession(
  input: CreateSessionInput
): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const ref = await db.collection("coaching_sessions").add({
    clientId: input.clientId.trim().toLowerCase(),
    packageId: input.packageId || null,
    coachEmail: input.coachEmail || process.env.SENDER_EMAIL || "",
    calendarEventId: input.calendarEventId || null,
    scheduledAt: input.scheduledAt,
    durationMins: input.durationMins || 60,
    status: "scheduled",
    privateNotes: "",
    sharedNotes: "",
    actionItems: [],
    meetUrl: input.meetUrl || null,
    isProBono: input.isProBono ?? false,
    groupSize: 1,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateSession(
  id: string,
  updates: Partial<CoachingSessionDoc>
): Promise<void> {
  const db = getDb();
  const patch: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  if (updates.status === "completed" && !updates.completedAt) {
    patch.completedAt = new Date().toISOString();
  }
  await db.collection("coaching_sessions").doc(id).update(patch);
}

export async function deleteSession(id: string): Promise<void> {
  const db = getDb();
  await db.collection("coaching_sessions").doc(id).delete();
}
