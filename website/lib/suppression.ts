import { getDb } from "@/lib/firebase-admin";
import { crmContactSuppressesAddress } from "@/lib/crm/contacts";

export async function isSuppressed(email: string): Promise<boolean> {
  try {
    const db = getDb();
    const id = email.trim().toLowerCase();
    const doc = await db.collection("email_suppressions").doc(id).get();
    if (doc.exists) {
      const until = doc.data()?.suppressedUntil as string | undefined;
      if (!until) return true;
      if (new Date(until).getTime() > Date.now()) return true;
    }
    return await crmContactSuppressesAddress(email);
  } catch (e) {
    console.error("[suppression] suppression lookup failed", email, e);
    return true;
  }
}

export async function recordSuppression(
  email: string,
  reason: string,
  hours = 24
): Promise<void> {
  const db = getDb();
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  await db
    .collection("email_suppressions")
    .doc(email.trim().toLowerCase())
    .set({ reason, suppressedUntil: until, updatedAt: new Date().toISOString() }, { merge: true });
}
