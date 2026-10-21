import type Stripe from "stripe";
import { getDb } from "@/lib/firebase-admin";
import { getSiteOrigin } from "@/lib/env";
import { getStripe } from "@/lib/coaching/stripe";

/**
 * Stripe customer portal for coaching clients who pay by card: update the
 * card and download invoices. Cancelling is off because installment plans
 * are a fixed number of payments under the coaching agreement. The site
 * creates its own portal settings once and keeps the id in
 * app_state/stripe_portal, so nothing has to be set in the Stripe dashboard.
 */
export const STRIPE_PORTAL_STATE = { collection: "app_state", doc: "stripe_portal" } as const;
const CONFIG_VERSION = 1;

async function portalConfigurationId(stripe: Stripe): Promise<string | null> {
  const ref = getDb().collection(STRIPE_PORTAL_STATE.collection).doc(STRIPE_PORTAL_STATE.doc);
  const saved = (await ref.get()).data() as { configurationId?: string; version?: number } | undefined;
  if (saved?.configurationId && saved.version === CONFIG_VERSION) return saved.configurationId;
  const origin = getSiteOrigin();
  try {
    const config = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "ApexLeader.ai: update your card and download invoices.",
        privacy_policy_url: `${origin}/privacy`,
        terms_of_service_url: `${origin}/terms`,
      },
      default_return_url: `${origin}/account`,
      features: {
        payment_method_update: { enabled: true },
        invoice_history: { enabled: true },
        customer_update: { enabled: true, allowed_updates: ["name", "address", "phone", "tax_id"] },
        subscription_cancel: { enabled: false },
      },
    });
    await ref.set({ configurationId: config.id, version: CONFIG_VERSION, createdAt: new Date().toISOString() });
    return config.id;
  } catch (e) {
    // A restricted key may not manage portal settings; the dashboard default then applies.
    console.error("[stripe-portal] could not create portal settings", e instanceof Error ? e.message : e);
    return null;
  }
}

/** The Stripe customer for any of these emails: the one on the client record first. */
export async function findStripeCustomer(stripe: Stripe, emails: string[], recordCustomerId: string | null): Promise<string | null> {
  if (recordCustomerId) return recordCustomerId;
  for (const email of emails) {
    const found = await stripe.customers.list({ email, limit: 1 });
    if (found.data[0]?.id) return found.data[0].id;
  }
  return null;
}

export async function createPortalSession(args: {
  emails: string[];
  recordCustomerId: string | null;
}): Promise<{ ok: true; url: string } | { ok: false; error: string; status: number }> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "Card payments are not set up right now.", status: 503 };
  const customer = await findStripeCustomer(stripe, args.emails, args.recordCustomerId);
  if (!customer) return { ok: false, error: "We could not find a card payment for this account.", status: 404 };
  const configuration = await portalConfigurationId(stripe);
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getSiteOrigin()}/account`,
      ...(configuration ? { configuration } : {}),
    });
    return { ok: true, url: session.url };
  } catch (e) {
    console.error("[stripe-portal] session failed", e instanceof Error ? e.message : e);
    return { ok: false, error: "Stripe could not open the billing page. Email hello@apexleader.ai and we will sort it out.", status: 502 };
  }
}
