import { getDb } from "@/lib/firebase-admin";

/**
 * Where a person exists outside crm_contacts. The contact page and the 1:1
 * send use this so they only act on an address the site already knows.
 */
export interface KnownContactSources {
  clientRecord: boolean;
  member: boolean;
  lead: boolean;
  account: boolean;
  application: boolean;
  /** leads/{email}.status is "unsubscribed". */
  leadUnsubscribed: boolean;
}

export function isKnownContact(sources: KnownContactSources): boolean {
  return (
    sources.clientRecord ||
    sources.member ||
    sources.lead ||
    sources.account ||
    sources.application
  );
}

export async function knownContactSources(rawEmail: string): Promise<KnownContactSources> {
  const email = rawEmail.trim().toLowerCase();
  const db = getDb();
  const [client, member, lead, account, apps] = await Promise.all([
    db.collection("client_records").doc(email).get(),
    db.collection("members").doc(email).get(),
    db.collection("leads").doc(email).get(),
    db.collection("learn_accounts").doc(email).get(),
    db.collection("coaching_applications").where("email", "==", email).limit(1).get(),
  ]);
  const leadData = lead.data() as { status?: unknown } | undefined;
  return {
    clientRecord: client.exists,
    member: member.exists,
    lead: lead.exists,
    account: account.exists,
    application: !apps.empty,
    leadUnsubscribed: leadData?.status === "unsubscribed",
  };
}
