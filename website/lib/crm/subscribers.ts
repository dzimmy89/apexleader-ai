import { getDb } from "@/lib/firebase-admin";
import { buildPersonTimeline } from "@/lib/crm/timeline";
import { getActivityLog } from "@/lib/crm/activity-log";
import { listPeople as listPeopleQuery } from "@/lib/crm/list-people";

export type { PersonRow } from "@/lib/crm/people-search";
export type { ListPeopleResult } from "@/lib/crm/list-people";

export async function listPeople(
  opts: Parameters<typeof listPeopleQuery>[0]
): Promise<ReturnType<typeof listPeopleQuery>> {
  return listPeopleQuery(opts);
}

export async function getPerson(email: string) {
  const db = getDb();
  const id = email.trim().toLowerCase();
  const [lead, member, flows, logs, appsSnap, clientsSnap, activityLog] =
    await Promise.all([
      db.collection("leads").doc(id).get(),
      db.collection("members").doc(id).get(),
      db.collection("flows").where("email", "==", id).limit(20).get(),
      db.collection("emailLog").where("to", "==", id).limit(30).get(),
      db.collection("coaching_applications").where("email", "==", id).limit(10).get(),
      db.collection("client_records").where("email", "==", id).limit(5).get(),
      getActivityLog(id),
    ]);

  const applications = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const clients = clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  let sessions: Record<string, unknown>[] = [];
  const clientId = clients[0]?.id as string | undefined;
  if (clientId) {
    const sessionsSnap = await db
      .collection("coaching_sessions")
      .where("clientId", "==", clientId)
      .limit(20)
      .get();
    sessions = sessionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  const emailLog = logs.docs.map((d) => ({ id: d.id, ...d.data() }));
  const flowsList = flows.docs.map((d) => ({ id: d.id, ...d.data() }));

  const timeline = buildPersonTimeline({
    emailLog: emailLog as Parameters<typeof buildPersonTimeline>[0]["emailLog"],
    flows: flowsList as Parameters<typeof buildPersonTimeline>[0]["flows"],
    applications: applications as Parameters<typeof buildPersonTimeline>[0]["applications"],
    sessions: sessions as Parameters<typeof buildPersonTimeline>[0]["sessions"],
    activityLog: activityLog as Parameters<typeof buildPersonTimeline>[0]["activityLog"],
  });

  return {
    email: id,
    lead: lead.exists ? { id: lead.id, ...lead.data() } : null,
    member: member.exists ? { id: member.id, ...member.data() } : null,
    flows: flowsList,
    emailLog,
    applications,
    clients,
    sessions,
    activityLog,
    timeline,
  };
}

const DELETE_QUERY_BATCH = 500;

async function deleteQueryDocs(
  collection: string,
  field: string,
  value: string
): Promise<number> {
  const db = getDb();
  let deleted = 0;
  while (true) {
    const snap = await db
      .collection(collection)
      .where(field, "==", value)
      .limit(DELETE_QUERY_BATCH)
      .get();
    if (snap.empty) return deleted;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
    if (snap.size < DELETE_QUERY_BATCH) return deleted;
  }
}

export interface DeletePeopleResult {
  deleted: string[];
  counts: {
    leads: number;
    members: number;
    flows: number;
    activityLog: number;
    applications: number;
  };
}

/**
 * Delete CRM people by email. Always removes leads, members, flows,
 * activity_log, emailLog (`to`), and attribution_touchpoints (`email`).
 * Optionally removes coaching_applications. Leaves email_suppressions
 * so suppressions persist after the person record is deleted.
 */
export async function deletePeople(
  emails: string[],
  opts?: { includePipeline?: boolean }
): Promise<DeletePeopleResult> {
  const db = getDb();
  const includePipeline = Boolean(opts?.includePipeline);
  const deleted: string[] = [];
  const counts = {
    leads: 0,
    members: 0,
    flows: 0,
    activityLog: 0,
    applications: 0,
  };

  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;

    const leadRef = db.collection("leads").doc(email);
    const memberRef = db.collection("members").doc(email);
    const [lead, member] = await Promise.all([leadRef.get(), memberRef.get()]);

    if (lead.exists) {
      await leadRef.delete();
      counts.leads++;
    }
    if (member.exists) {
      await memberRef.delete();
      counts.members++;
    }

    counts.flows += await deleteQueryDocs("flows", "email", email);
    counts.activityLog += await deleteQueryDocs("activity_log", "email", email);
    await deleteQueryDocs("emailLog", "to", email);
    await deleteQueryDocs("attribution_touchpoints", "email", email);

    if (includePipeline) {
      counts.applications += await deleteQueryDocs(
        "coaching_applications",
        "email",
        email
      );
    }

    deleted.push(email);
  }

  return { deleted, counts };
}
