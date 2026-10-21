import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { buildPersonTimeline } from "@/lib/crm/timeline";
import { getActivityLog } from "@/lib/crm/activity-log";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const db = getDb();

  let clientDoc = await db.collection("client_records").doc(decoded).get();
  if (!clientDoc.exists) {
    const byEmail = await db
      .collection("client_records")
      .where("email", "==", decoded.toLowerCase())
      .limit(1)
      .get();
    if (!byEmail.empty) clientDoc = byEmail.docs[0];
  }

  if (!clientDoc.exists) {
    const email = decoded.toLowerCase();
    const [appsSnap, personRes] = await Promise.all([
      db.collection("coaching_applications").where("email", "==", email).limit(5).get(),
      db.collection("leads").doc(email).get(),
    ]);

    if (appsSnap.empty && !personRes.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const applications = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const activityLog = await getActivityLog(email);
    const [flows, logs] = await Promise.all([
      db.collection("flows").where("email", "==", email).limit(20).get(),
      db.collection("emailLog").where("to", "==", email).limit(30).get(),
    ]);

    const timeline = buildPersonTimeline({
      emailLog: logs.docs.map((d) => ({ id: d.id, ...d.data() })) as Parameters<
        typeof buildPersonTimeline
      >[0]["emailLog"],
      flows: flows.docs.map((d) => ({ id: d.id, ...d.data() })) as Parameters<
        typeof buildPersonTimeline
      >[0]["flows"],
      applications: applications as Parameters<typeof buildPersonTimeline>[0]["applications"],
      activityLog: activityLog as Parameters<typeof buildPersonTimeline>[0]["activityLog"],
    });

    return NextResponse.json({
      mode: "application",
      email,
      applications,
      timeline,
      client: null,
      sessions: [],
    });
  }

  const client = { id: clientDoc.id, ...clientDoc.data() } as Record<string, unknown> & {
    id: string;
    email?: string;
  };
  const clientId = clientDoc.id;
  const email =
    (client.email as string)?.toLowerCase() ||
    (typeof client.id === "string" ? client.id : decoded);

  const [sessionsSnap, appsSnap, activityLog, flows, logs] = await Promise.all([
    db.collection("coaching_sessions").where("clientId", "==", clientId).limit(30).get(),
    db.collection("coaching_applications").where("email", "==", email).limit(5).get(),
    getActivityLog(email),
    db.collection("flows").where("email", "==", email).limit(20).get(),
    db.collection("emailLog").where("to", "==", email).limit(30).get(),
  ]);

  const sessions = sessionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const applications = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const timeline = buildPersonTimeline({
    emailLog: logs.docs.map((d) => ({ id: d.id, ...d.data() })) as Parameters<
      typeof buildPersonTimeline
    >[0]["emailLog"],
    flows: flows.docs.map((d) => ({ id: d.id, ...d.data() })) as Parameters<
      typeof buildPersonTimeline
    >[0]["flows"],
    applications: applications as Parameters<typeof buildPersonTimeline>[0]["applications"],
    sessions: sessions as Parameters<typeof buildPersonTimeline>[0]["sessions"],
    activityLog: activityLog as Parameters<typeof buildPersonTimeline>[0]["activityLog"],
  });

  return NextResponse.json({
    mode: "client",
    email,
    client,
    applications,
    sessions,
    timeline,
  });
}
