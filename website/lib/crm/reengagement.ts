import {
  Timestamp,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import { enrollFlow } from "@/lib/flows";
import { manualOnlyBlockReason } from "@/lib/crm/contacts";
import {
  evaluateReengagementMember,
  INACTIVE_MS,
  REENGAGEMENT_MAX_PAGES,
  REENGAGEMENT_PAGE_SIZE,
} from "@/lib/crm/reengagement-eligibility";
import { previewReengagementDryRun } from "@/lib/crm/cron-dry-run";
import type { FlowStatus } from "@/lib/crm/types";

export {
  evaluateReengagementMember,
  INACTIVE_MS,
  parseLastActiveAtMs,
  REENGAGEMENT_MAX_PAGES,
  REENGAGEMENT_PAGE_SIZE,
  REENGAGEMENT_TIERS,
} from "@/lib/crm/reengagement-eligibility";

export async function checkReengagement(nowMs = Date.now()): Promise<number> {
  const db = getDb();
  const cutoff = Timestamp.fromMillis(nowMs - INACTIVE_MS);
  let enrolled = 0;
  let lastDoc: QueryDocumentSnapshot | undefined;

  for (let page = 0; page < REENGAGEMENT_MAX_PAGES; page++) {
    let query: Query = db
      .collection("members")
      .where("status", "==", "active")
      .where("lastActiveAt", "<=", cutoff)
      .orderBy("lastActiveAt", "asc")
      .limit(REENGAGEMENT_PAGE_SIZE);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    const snap = await query.get();
    if (snap.empty) break;

    for (const doc of snap.docs) {
      const decision = evaluateReengagementMember(doc.id, doc.data(), nowMs);
      if (!decision.enroll) continue;
      const manualBlock = await manualOnlyBlockReason(
        decision.email,
        "confirmed_or_paid"
      );
      if (manualBlock) continue;
      const result = await enrollFlow(
        "reengagement",
        decision.userId,
        decision.email
      );
      if (result.created) enrolled++;
    }

    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < REENGAGEMENT_PAGE_SIZE) break;
  }

  return enrolled;
}

export async function previewReengagementCheck(nowMs = Date.now()) {
  const db = getDb();
  const cutoff = Timestamp.fromMillis(nowMs - INACTIVE_MS);
  const members: Array<{ id: string; data: Record<string, unknown> }> = [];
  let lastDoc: QueryDocumentSnapshot | undefined;

  for (let page = 0; page < REENGAGEMENT_MAX_PAGES; page++) {
    let query: Query = db
      .collection("members")
      .where("status", "==", "active")
      .where("lastActiveAt", "<=", cutoff)
      .orderBy("lastActiveAt", "asc")
      .limit(REENGAGEMENT_PAGE_SIZE);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    const snap = await query.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      members.push({ id: doc.id, data: doc.data() });
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < REENGAGEMENT_PAGE_SIZE) break;
  }

  const existingReengagementStatuses = new Map<string, FlowStatus[]>();
  for (const member of members) {
    const decision = evaluateReengagementMember(member.id, member.data, nowMs);
    if (!decision.enroll) continue;
    if (existingReengagementStatuses.has(decision.userId)) continue;
    const snap = await db
      .collection("flows")
      .where("userId", "==", decision.userId)
      .where("flowType", "==", "reengagement")
      .get();
    existingReengagementStatuses.set(
      decision.userId,
      snap.docs.map((d) => d.data().status as FlowStatus)
    );
  }

  const manualOnlyEmails = new Set<string>();
  for (const member of members) {
    const emailRaw = (member.data.email || member.id) as unknown;
    const email =
      typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
    if (!email) continue;
    const blocked = await manualOnlyBlockReason(email, "confirmed_or_paid");
    if (blocked) manualOnlyEmails.add(email);
  }

  return previewReengagementDryRun({
    members,
    existingReengagementStatuses,
    nowMs,
    manualOnlyEmails,
  });
}
