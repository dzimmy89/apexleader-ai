import { getDb } from "@/lib/firebase-admin";
import { getAccess, grantIsLive } from "@/lib/account/access";
import { getSkoolRecord, skoolLabel } from "@/lib/account/skool-access";
import { getActivityLog } from "@/lib/crm/activity-log";
import { getCrmContactByEmail, crmContactFlagsSuppressSends } from "@/lib/crm/contacts";
import { isExcludedCrmEmail } from "@/lib/crm/excluded-accounts";
import { isKnownContact, knownContactSources } from "@/lib/crm/known-contact";
import { buildPersonTimeline, type TimelineEvent } from "@/lib/crm/timeline";
import { getPackage, getPackages } from "@/lib/coaching/packages";
import {
  asPaymentPlanId,
  listClientPayments,
  readSchedule,
  scheduleDocId,
  PAYMENT_SCHEDULES,
  summarizeContactPayments,
  type ClientPaymentRow,
  type ContactMoneySummary,
  type PaymentPlanId,
  type PaymentSchedule,
} from "@/lib/coaching/payments";
import { isSuppressed } from "@/lib/suppression";
import { getSiteOrigin } from "@/lib/env";

/** Display names for the internal package ids. */
export const PACKAGE_DISPLAY_NAMES: Record<string, string> = {
  foundations: "Kickstart",
  mastery: "Operator",
  institutional: "Inner Circle",
};

export interface ContactPackageOption {
  id: string;
  name: string;
  price: number;
  plans: Array<{ id: PaymentPlanId; label: string; installments: number; perPayment: number; total: number }>;
}

export interface ContactSession {
  id: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  title: string;
  source: string;
  meetUrl: string | null;
  recordingFileId: string | null;
  lateCancel: boolean;
}

export interface ContactContract {
  id: string;
  packageName: string;
  status: string;
  sentAt: string;
  signedAt: string | null;
}

export interface ContactDetail {
  email: string;
  name: string;
  pipeline: {
    id: string;
    status: string;
    packageId: string | null;
    closeValue: number | null;
  } | null;
  pipelineCards: number;
  client: {
    status: string;
    packageId: string | null;
    packageName: string;
    planId: PaymentPlanId | null;
    sessionsRemaining: number | null;
    sessionsTotal: number | null;
    contractSignedAt: string | null;
    /** Telegram username the client saved on /account (no @). */
    telegramHandle: string | null;
    paymentFailed: boolean;
    paymentFailedAt: string | null;
  } | null;
  packageId: string | null;
  packageName: string;
  planId: PaymentPlanId | null;
  money: ContactMoneySummary;
  access: {
    hasMembership: boolean;
    isCoachingClient: boolean;
    hasCourseAccess: boolean;
    membershipExpiresAt: string | null;
  };
  /** Coaching Skool seat, e.g. "In Skool until Jan 20, 2027". Null when not tracked. */
  skool: string | null;
  emailable: boolean;
  emailBlockReason: string | null;
  hasCrmContact: boolean;
  payments: Array<ClientPaymentRow & { id: string }>;
  schedule: PaymentSchedule | null;
  sessions: ContactSession[];
  contracts: ContactContract[];
  timeline: TimelineEvent[];
  packages: ContactPackageOption[];
  payUrl: string;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function byRecent(a: Record<string, unknown>, b: Record<string, unknown>): number {
  const ta = str(a.updatedAt) || str(a.createdAt);
  const tb = str(b.updatedAt) || str(b.createdAt);
  return ta < tb ? 1 : ta > tb ? -1 : 0;
}

export async function getContactDetail(rawEmail: string): Promise<ContactDetail | null> {
  const email = rawEmail.trim().toLowerCase();
  if (!email.includes("@")) return null;
  const db = getDb();

  const [crm, sources] = await Promise.all([
    getCrmContactByEmail(email),
    knownContactSources(email),
  ]);
  if (!crm && !isKnownContact(sources)) return null;

  const [clientSnap, memberSnap, leadSnap, appsSnap, flowsSnap, logsSnap, activityLog, payments, access, suppressed, skoolSeat] =
    await Promise.all([
      db.collection("client_records").doc(email).get(),
      db.collection("members").doc(email).get(),
      db.collection("leads").doc(email).get(),
      db.collection("coaching_applications").where("email", "==", email).limit(20).get(),
      db.collection("flows").where("email", "==", email).limit(20).get(),
      db.collection("emailLog").where("to", "==", email).limit(50).get(),
      getActivityLog(email, 100),
      listClientPayments(db, email),
      getAccess(email),
      isSuppressed(email),
      getSkoolRecord(email).catch(() => null),
    ]);

  const client = clientSnap.exists ? ((clientSnap.data() || {}) as Record<string, unknown>) : null;
  const member = memberSnap.exists ? ((memberSnap.data() || {}) as Record<string, unknown>) : null;
  const lead = leadSnap.exists ? ((leadSnap.data() || {}) as Record<string, unknown>) : null;
  const applications = appsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
    .sort(byRecent);
  const app = applications[0] as (Record<string, unknown> & { id: string }) | undefined;

  let sessions: Record<string, unknown>[] = [];
  if (client) {
    const sessionsSnap = await db
      .collection("coaching_sessions")
      .where("clientId", "==", email)
      .limit(200)
      .get();
    sessions = sessionsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Record<string, unknown>)
      .filter((row) => row.ignored !== true);
  }
  const contractsSnap = await db.collection("contract_signatures").where("clientId", "==", email).limit(20).get();
  const contracts: ContactContract[] = contractsSnap.docs
    .map((d) => {
      const c = (d.data() || {}) as Record<string, unknown>;
      return {
        id: d.id,
        packageName: str(c.packageName) || str(c.packageId),
        status: str(c.status) || "pending",
        sentAt: str(c.agreementEmailSentAt) || str(c.requestIssuedAt) || str(c.createdAt),
        signedAt: str(c.signedAt) || null,
      };
    })
    .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
  const contactSessions: ContactSession[] = sessions
    .map((row) => ({
      id: String(row.id),
      scheduledAt: str(row.scheduledAt),
      durationMins: num(row.durationMins) ?? 60,
      status: str(row.status) || "scheduled",
      title: str(row.title),
      source: str(row.source),
      meetUrl: str(row.meetUrl) || null,
      recordingFileId: str(row.recordingFileId) || null,
      lateCancel: row.lateCancel === true,
    }))
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));

  const latestPayment = payments[0];
  const packageId =
    str(client?.packageId) || latestPayment?.packageId || str(app?.packageId) || null;
  const planId: PaymentPlanId | null = client?.planId
    ? asPaymentPlanId(client.planId)
    : latestPayment
      ? asPaymentPlanId(latestPayment.planId)
      : null;
  const pkg = packageId ? await getPackage(packageId) : null;
  const plan = pkg && planId ? pkg.paymentPlans.find((p) => p.id === planId) : undefined;

  let schedule: PaymentSchedule | null = null;
  if (packageId) {
    const snap = await db.collection(PAYMENT_SCHEDULES).doc(scheduleDocId(email, packageId)).get();
    schedule = snap.exists ? readSchedule(snap.data() as Record<string, unknown>) : null;
  }

  const money = summarizeContactPayments({
    payments,
    packageId,
    planId,
    planTotal: plan ? plan.total * 100 : null,
    perPayment: plan ? plan.perPayment * 100 : null,
    schedule,
  });

  const crmNotes = (crm?.contact.notes || []).map((note, index) => ({
    id: `crm-note-${index}-${note.at}`,
    text: note.text,
    at: note.at,
  }));
  const timeline = buildPersonTimeline({
    emailLog: logsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Parameters<
      typeof buildPersonTimeline
    >[0]["emailLog"],
    flows: flowsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Parameters<
      typeof buildPersonTimeline
    >[0]["flows"],
    applications: applications as Parameters<typeof buildPersonTimeline>[0]["applications"],
    sessions: sessions as Parameters<typeof buildPersonTimeline>[0]["sessions"],
    activityLog: activityLog as Parameters<typeof buildPersonTimeline>[0]["activityLog"],
    notes: crmNotes,
  });

  let emailBlockReason: string | null = null;
  if (crm && crm.contact.doNotContact) emailBlockReason = "do_not_contact";
  else if (crm && crmContactFlagsSuppressSends(crm.contact)) emailBlockReason = "opted_out";
  else if (crm?.contact.internal || isExcludedCrmEmail(email)) emailBlockReason = "internal";
  else if (sources.leadUnsubscribed) emailBlockReason = "opted_out";
  else if (suppressed) emailBlockReason = "suppressed";

  // Latest end date across live grants; null when one has no end date.
  const liveGrants = access.grants.filter((g) => grantIsLive(g));
  const membershipExpiresAt = liveGrants.some((g) => !g.expiresAt)
    ? null
    : liveGrants
        .map((g) => g.expiresAt as string)
        .sort()
        .reverse()[0] || null;

  const allPackages = await getPackages({ activeOnly: false });
  const name =
    str(client?.name) ||
    str(app?.name) ||
    str(lead?.name) ||
    str(member?.name) ||
    crm?.contact.name ||
    "";

  return {
    email,
    name,
    pipeline: app
      ? {
          id: app.id,
          status: str(app.status) || "new",
          packageId: str(app.packageId) || null,
          closeValue: num(app.closeValue),
        }
      : null,
    pipelineCards: applications.length,
    client: client
      ? {
          status: str(client.status),
          packageId: str(client.packageId) || null,
          packageName: str(client.packageName),
          planId: client.planId ? asPaymentPlanId(client.planId) : null,
          sessionsRemaining: num(client.sessionsRemaining),
          sessionsTotal: num(client.sessionsTotal),
          contractSignedAt: str(client.contractSignedAt) || null,
          telegramHandle: str(client.telegramHandle) || null,
          paymentFailed: client.paymentFailed === true,
          paymentFailedAt: str(client.paymentFailedAt) || null,
        }
      : null,
    packageId,
    packageName: pkg?.name || (packageId ? PACKAGE_DISPLAY_NAMES[packageId] || packageId : ""),
    planId,
    money,
    access: {
      hasMembership: access.hasMembership,
      isCoachingClient: access.isCoachingClient,
      hasCourseAccess: access.hasCourseAccess,
      membershipExpiresAt: access.hasMembership ? membershipExpiresAt : null,
    },
    skool: skoolSeat ? skoolLabel(skoolSeat) : null,
    emailable: emailBlockReason === null,
    emailBlockReason,
    hasCrmContact: Boolean(crm),
    payments,
    schedule,
    sessions: contactSessions,
    contracts,
    timeline,
    packages: allPackages.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      plans: p.paymentPlans.map((pl) => ({
        id: pl.id,
        label: pl.label,
        installments: pl.installments,
        perPayment: pl.perPayment,
        total: pl.total,
      })),
    })),
    payUrl: `${getSiteOrigin()}/coaching/pay`,
  };
}
