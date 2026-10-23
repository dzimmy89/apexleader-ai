import Stripe from "stripe";
import { getDb } from "@/lib/firebase-admin";
import {
  getPackage,
  getPackages,
  paymentPlanAddsUp,
  type PaymentPlan,
} from "@/lib/coaching/packages";
import { ensureCoachingAgreementEmail } from "@/lib/coaching/contract-email";
import { getSiteOrigin } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { personNameLower } from "@/lib/crm/people-search";
import { checkoutSignupFields } from "@/lib/crm/contacts";
import { logActivity } from "@/lib/crm/activity-log";
import { grantCoachingMembership } from "@/lib/account/access";
import {
  CLIENT_PAYMENTS,
  asPaymentPlanId,
  firstPaymentAt,
  formatUsdCents,
  markPipelineWon,
  recordClientPayment,
  stripePaymentDocId,
} from "@/lib/coaching/payments";

let stripeClient: Stripe | null = null;
let stripeOverriddenForTests = false;

export function getStripe(): Stripe | null {
  if (stripeOverriddenForTests) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

/** Test-only: inject a Stripe stand-in (no live keys). Pass null to clear. */
export function setStripeForTests(client: Stripe | null | undefined): void {
  stripeOverriddenForTests = client !== undefined;
  stripeClient = client ?? null;
}

export function isStripeConfigured(): boolean {
  return getStripe() !== null;
}

export interface CreateCheckoutInput {
  packageId: string;
  planId: PaymentPlan["id"];
  email: string;
  name?: string;
}

export interface CreateCheckoutResult {
  ok: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

export async function createCheckoutSession(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe not configured" };
  }

  const pkg = await getPackage(input.packageId);
  if (!pkg) {
    return { ok: false, error: "Unknown package" };
  }

  const plan = pkg.paymentPlans.find((p) => p.id === input.planId);
  if (!plan) {
    return { ok: false, error: "Unknown payment plan" };
  }
  if (!paymentPlanAddsUp(plan)) {
    return { ok: false, error: "Payment plan does not add up" };
  }

  const priceId = process.env[plan.stripePriceEnvVar];
  if (!priceId) {
    return {
      ok: false,
      error: `Stripe Price not configured: ${plan.stripePriceEnvVar}`,
    };
  }

  const origin = getSiteOrigin();
  const clientReferenceId = input.email
    ? `${pkg.id}:${input.email}`
    : pkg.id;
  const customerEmail = input.email || undefined;
  const sessionMetadata = {
    site: BRAND.domain,
    packageId: pkg.id,
    planId: plan.id,
    packageName: pkg.name,
    clientName: input.name || "",
    installments: String(plan.installments),
  };

  try {
    const isInstallment = plan.installments > 1;

    if (isInstallment) {
      // Installment plans use Stripe Billing subscription mode.
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        client_reference_id: clientReferenceId,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: sessionMetadata,
        subscription_data: {
          metadata: sessionMetadata,
        },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&tier=coaching&package=${pkg.id}`,
        cancel_url: `${origin}/cancel?tier=coaching&package=${pkg.id}`,
      });

      return { ok: true, url: session.url || undefined, sessionId: session.id };
    }

    // Full-pay uses one-time payment mode.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // A Stripe customer lets the client open invoices from /account later.
      customer_creation: "always",
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      client_reference_id: clientReferenceId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: sessionMetadata,
      payment_intent_data: {
        metadata: sessionMetadata,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&tier=coaching&package=${pkg.id}`,
      cancel_url: `${origin}/cancel?tier=coaching&package=${pkg.id}`,
    });

    return { ok: true, url: session.url || undefined, sessionId: session.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[createCheckoutSession] failed", msg);
    return { ok: false, error: msg };
  }
}

export async function generatePaymentLinkForClient(args: {
  packageId: string;
  planId: PaymentPlan["id"];
  email: string;
  name?: string;
  clientReferenceId: string;
}): Promise<{ ok: boolean; url?: string; error?: string }> {
  // Used by admin post-call to send a payment link for Operator/Inner Circle.
  const result = await createCheckoutSession({
    packageId: args.packageId,
    planId: args.planId,
    email: args.email,
    name: args.name,
  });
  if (!result.ok) return result;
  return { ok: true, url: result.url };
}

interface EnrichedStripeEvent {
  type: string;
  eventId: string;
  email: string;
  packageId: string;
  planId?: string;
  packageName?: string;
  clientName?: string;
  amountPaid?: number;
  customerId?: string;
  subscriptionId?: string;
  paymentIntentId?: string;
  checkoutSessionId?: string;
  /** Stripe invoice id: the invoice itself, or the first invoice of a subscription checkout. */
  invoiceId?: string;
  /** When Stripe says the money moved. Falls back to processing time. */
  paidAtIso?: string;
  rawEventType: string;
}

const STRIPE_PROCESSED_EVENTS = "stripe_processed_events";
/** In-flight claims younger than this are not stolen; Stripe should retry (5xx). */
export const STRIPE_EVENT_CLAIM_TTL_MS = 10 * 60 * 1000;

export type StripeWebhookHandleResult =
  | { duplicate: true }
  | { duplicate: false; handled: boolean };

export class StripeWebhookInFlightError extends Error {
  readonly eventId: string;
  constructor(eventId: string) {
    super(`Stripe event ${eventId} is already being processed`);
    this.name = "StripeWebhookInFlightError";
    this.eventId = eventId;
  }
}

function claimAgeMs(claimedAt: unknown, nowMs: number): number {
  const parsed = Date.parse(String(claimedAt || ""));
  if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;
  return nowMs - parsed;
}

/**
 * Transactional claim on `stripe_processed_events/{event.id}`:
 * - `done` → duplicate (2xx)
 * - `claimed` and fresh (≤ 10 min) → in-flight (5xx / Stripe retry)
 * - missing or stale `claimed` → steal and proceed
 * Mark `done` only after `processStripeEvent` succeeds.
 */
export async function handleStripeWebhookEvent(
  event: Stripe.Event
): Promise<StripeWebhookHandleResult> {
  const db = getDb();
  const processedRef = db.collection(STRIPE_PROCESSED_EVENTS).doc(event.id);
  const decision = await db.runTransaction(async (tx) => {
    const snap = await tx.get(processedRef);
    const nowIso = new Date().toISOString();
    if (!snap.exists) {
      tx.set(processedRef, {
        eventId: event.id,
        type: event.type,
        status: "claimed",
        claimedAt: nowIso,
      });
      return "proceed" as const;
    }
    const data = (snap.data() || {}) as Record<string, unknown>;
    const status = String(data.status || "");
    if (status === "done") {
      return "duplicate" as const;
    }
    const age = claimAgeMs(data.claimedAt, Date.now());
    if (status === "claimed" && age <= STRIPE_EVENT_CLAIM_TTL_MS) {
      throw new StripeWebhookInFlightError(event.id);
    }
    tx.set(
      processedRef,
      {
        eventId: event.id,
        type: event.type,
        status: "claimed",
        claimedAt: nowIso,
        stolenAt: nowIso,
      },
      { merge: true }
    );
    return "proceed" as const;
  });

  if (decision === "duplicate") {
    return { duplicate: true };
  }

  const { handled } = await processStripeEvent(event);
  await processedRef.set(
    {
      status: "done",
      processedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return { duplicate: false, handled };
}

/**
 * The Stripe account can be shared with another site, whose webhook gets our
 * events and ours gets theirs. Our checkouts tag their metadata with
 * site=BRAND.domain; tagged events for any other site, and coaching events
 * with no site tag, belong to someone else. Events with no metadata at all
 * (an invoice made by hand in the dashboard) are still ours to match.
 */
export function isOtherSitesStripeMetadata(
  metadata: Record<string, string> | null | undefined
): boolean {
  if (!metadata || Object.keys(metadata).length === 0) return false;
  return metadata.site !== BRAND.domain;
}

export async function processStripeEvent(
  event: Stripe.Event
): Promise<{ handled: boolean; enriched?: EnrichedStripeEvent }> {
  const db = getDb();
  let enriched: EnrichedStripeEvent | undefined;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = (session.metadata || {}) as Record<string, string>;
      if (isOtherSitesStripeMetadata(metadata)) return { handled: false };
      const email = buyerEmailFromSession(session);
      if (!email.includes("@")) {
        throw new Error(`Checkout session ${session.id} has no buyer email`);
      }
      const packageId = metadata.packageId || packageIdFromReference(session.client_reference_id);
      const packageName = metadata.packageName || "";

      enriched = {
        type: "checkout.session.completed",
        eventId: event.id,
        email,
        packageId,
        planId: metadata.planId,
        packageName,
        clientName: metadata.clientName,
        customerId: typeof session.customer === "string" ? session.customer : undefined,
        subscriptionId:
          typeof session.subscription === "string" ? session.subscription : undefined,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : undefined,
        checkoutSessionId: session.id,
        invoiceId: typeof session.invoice === "string" ? session.invoice : undefined,
        paidAtIso: eventCreatedIso(event),
        amountPaid: session.amount_total ?? undefined,
        rawEventType: event.type,
      };

      await onCheckoutCompleted(db, enriched);
      await boundInstallmentSubscription(enriched);
      await sendCoachingAgreementEmail(enriched);
      return { handled: true, enriched };
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceAny = invoice as unknown as Record<string, unknown>;
      const email =
        (typeof invoiceAny.customer_email === "string"
          ? invoiceAny.customer_email
          : "") || "";
      // Subscription metadata on invoices lives on parent.subscription_details.metadata
      // in newer API versions. Cast defensively to support multiple shapes.
      const parentMeta = (
        (invoiceAny.parent as Record<string, unknown> | undefined)
          ?.subscription_details as Record<string, unknown> | undefined
      )?.metadata as Record<string, string> | undefined;
      const subscriptionMetadata = parentMeta || {};
      if (isOtherSitesStripeMetadata(subscriptionMetadata)) return { handled: false };

      enriched = {
        type: "invoice.paid",
        eventId: event.id,
        email,
        packageId: subscriptionMetadata.packageId || "",
        planId: subscriptionMetadata.planId,
        packageName: subscriptionMetadata.packageName,
        clientName: subscriptionMetadata.clientName,
        customerId:
          typeof invoice.customer === "string" ? invoice.customer : undefined,
        subscriptionId: invoiceSubscriptionId(invoice),
        invoiceId: typeof invoice.id === "string" ? invoice.id : undefined,
        paidAtIso: invoicePaidAtIso(invoice) || eventCreatedIso(event),
        amountPaid: invoice.amount_paid,
        rawEventType: event.type,
      };

      await onInvoicePaid(db, enriched);
      return { handled: true, enriched };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceAny = invoice as unknown as Record<string, unknown>;
      const parentMeta = (
        (invoiceAny.parent as Record<string, unknown> | undefined)
          ?.subscription_details as Record<string, unknown> | undefined
      )?.metadata as Record<string, string> | undefined;
      const subscriptionMetadata = parentMeta || {};
      if (isOtherSitesStripeMetadata(subscriptionMetadata)) return { handled: false };
      enriched = {
        type: "invoice.payment_failed",
        eventId: event.id,
        email:
          (typeof invoiceAny.customer_email === "string"
            ? invoiceAny.customer_email
            : "") || "",
        packageId: subscriptionMetadata.packageId || "",
        customerId:
          typeof invoice.customer === "string" ? invoice.customer : undefined,
        subscriptionId: invoiceSubscriptionId(invoice),
        amountPaid: invoice.amount_due,
        rawEventType: event.type,
      };
      await onInvoicePaymentFailed(db, enriched);
      return { handled: true, enriched };
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const metadata = (sub.metadata || {}) as Record<string, string>;
      if (isOtherSitesStripeMetadata(metadata)) return { handled: false };
      enriched = {
        type: "customer.subscription.deleted",
        eventId: event.id,
        email: "",
        packageId: metadata.packageId || "",
        planId: metadata.planId,
        customerId: typeof sub.customer === "string" ? sub.customer : undefined,
        subscriptionId: sub.id,
        rawEventType: event.type,
      };
      await onSubscriptionDeleted(db, enriched, sub);
      return { handled: true, enriched };
    }

    default:
      return { handled: false };
  }
}

export async function persistPaidCheckoutMember(
  db: ReturnType<typeof getDb>,
  e: {
    email: string;
    clientName?: string;
    packageId: string;
    planId?: string;
    customerId?: string;
    subscriptionId?: string;
  }
): Promise<void> {
  const email = e.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const memberRef = db.collection("members").doc(email);
  const existing = (await memberRef.get()).data();
  await memberRef.set(
    {
      email,
      nameLower: personNameLower(e.clientName) || undefined,
      tier: "coaching",
      status: "active",
      packageId: e.packageId,
      planId: e.planId || null,
      stripeCustomerId: e.customerId || null,
      stripeSubscriptionId: e.subscriptionId || null,
      updatedAt: now,
      paidCheckoutAt:
        typeof existing?.paidCheckoutAt === "string" &&
        existing.paidCheckoutAt.trim()
          ? existing.paidCheckoutAt
          : now,
      ...checkoutSignupFields(email, { nowIso: now, existing }),
    },
    { merge: true }
  );
}

function processedCheckoutSessionIds(data: Record<string, unknown> | undefined): string[] {
  const raw = data?.processedCheckoutSessionIds;
  if (!Array.isArray(raw)) return [];
  return raw.map((id) => String(id)).filter(Boolean);
}

async function sessionGrantCount(packageId: string): Promise<number> {
  const pkg = await getPackage(packageId);
  const count = pkg?.sessionCount;
  return typeof count === "number" && count > 0 ? count : 0;
}

export interface CoachingPurchaseGrant {
  email: string;
  clientName?: string;
  packageId: string;
  packageName?: string;
  planId?: string;
  /** Checkout session id, or `manual:<email>:<packageId>`. Empty skips replay protection. */
  grantKey: string;
  customerId?: string;
  subscriptionId?: string;
  paymentIntentId?: string;
  amountPaid?: number | null;
  paymentSource?: "stripe" | "manual";
}

export async function grantCoachingPurchase(
  db: ReturnType<typeof getDb>,
  purchase: CoachingPurchaseGrant
): Promise<"replay" | "granted"> {
  const email = purchase.email.trim().toLowerCase();
  const grantKey = purchase.grantKey;
  const grant = await sessionGrantCount(purchase.packageId);
  const clientRef = db.collection("client_records").doc(email);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(clientRef);
    const existingData = snap.exists
      ? ((snap.data() || {}) as Record<string, unknown>)
      : undefined;
    const ids = processedCheckoutSessionIds(existingData);
    if (grantKey && ids.includes(grantKey)) {
      return "replay" as const;
    }

    const now = new Date().toISOString();
    const processedIds = grantKey ? [...ids, grantKey] : ids;
    const sourceFields: Record<string, unknown> = {};
    if (purchase.paymentSource) sourceFields.paymentSource = purchase.paymentSource;

    if (!snap.exists) {
      tx.set(clientRef, {
        email,
        name: purchase.clientName || "",
        packageId: purchase.packageId,
        packageName: purchase.packageName || "",
        planId: purchase.planId || "full",
        status: "paid_pending_contract",
        sessionsRemaining: grant,
        sessionsTotal: grant,
        paidAt: now,
        stripeCustomerId: purchase.customerId || null,
        stripeSubscriptionId: purchase.subscriptionId || null,
        paymentIntentId: purchase.paymentIntentId || null,
        amountPaid: purchase.amountPaid ?? null,
        contractSignedAt: null,
        magicLinkToken: null,
        magicLinkExpiresAt: null,
        processedCheckoutSessionIds: processedIds,
        createdAt: now,
        updatedAt: now,
        ...sourceFields,
      });
    } else {
      const prevRemaining = Number(existingData?.sessionsRemaining || 0);
      const prevTotal = Number(existingData?.sessionsTotal || 0);
      const patch: Record<string, unknown> = {
        packageId: purchase.packageId,
        packageName: purchase.packageName || "",
        planId: purchase.planId || "full",
        paidAt: now,
        sessionsRemaining: prevRemaining + grant,
        sessionsTotal: prevTotal + grant,
        processedCheckoutSessionIds: processedIds,
        updatedAt: now,
        ...sourceFields,
      };
      if (purchase.clientName) patch.name = purchase.clientName;
      if (purchase.customerId) patch.stripeCustomerId = purchase.customerId;
      if (purchase.subscriptionId) patch.stripeSubscriptionId = purchase.subscriptionId;
      if (purchase.paymentIntentId) patch.paymentIntentId = purchase.paymentIntentId;
      if (purchase.amountPaid != null) patch.amountPaid = purchase.amountPaid;
      tx.set(clientRef, patch, { merge: true });
    }
    return "granted" as const;
  });
}

async function onCheckoutCompleted(
  db: ReturnType<typeof getDb>,
  e: EnrichedStripeEvent
): Promise<void> {
  await grantCoachingPurchase(db, {
    email: e.email,
    clientName: e.clientName,
    packageId: e.packageId,
    packageName: e.packageName,
    planId: e.planId,
    grantKey: e.checkoutSessionId || "",
    customerId: e.customerId,
    subscriptionId: e.subscriptionId,
    paymentIntentId: e.paymentIntentId,
    amountPaid: e.amountPaid,
    paymentSource: "stripe",
  });

  // Always merge members, including session replay: a prior grant may have
  // committed while persistPaidCheckoutMember still failed.
  await persistPaidCheckoutMember(db, e);
  await logStripeEvent(db, e, "checkout_completed");
  await syncStripeCoachingPayment(db, e);
}

async function onInvoicePaid(
  db: ReturnType<typeof getDb>,
  e: EnrichedStripeEvent
): Promise<void> {
  // Record the paid timestamp on the matched client/member. No emails, no
  // status change — checkout.session.completed remains the grant path.
  const now = new Date().toISOString();
  const email = await resolveClientEmail(db, e);
  if (email) {
    const paymentPatch = {
      lastInvoicePaidAt: now,
      lastPaymentStatus: "paid" as const,
      lastInvoicePaidAmount: e.amountPaid ?? null,
      updatedAt: now,
      ...(e.customerId ? { stripeCustomerId: e.customerId } : {}),
      ...(e.subscriptionId ? { stripeSubscriptionId: e.subscriptionId } : {}),
    };
    await mergeIfExists(db, "client_records", email, paymentPatch);
    await mergeIfExists(db, "members", email, paymentPatch);
  } else {
    console.warn(
      "[stripe-webhook] invoice.paid: no client/member for",
      e.subscriptionId || e.customerId || e.email || e.eventId
    );
  }
  await logStripeEvent(db, { ...e, email: email || e.email }, "invoice_paid");
  await syncStripeCoachingPayment(db, { ...e, email: email || e.email });
}

async function onInvoicePaymentFailed(
  db: ReturnType<typeof getDb>,
  e: EnrichedStripeEvent
): Promise<void> {
  // Stamp the failure. Do not revoke access on a single failed payment.
  const now = new Date().toISOString();
  const email = await resolveClientEmail(db, e);
  if (email) {
    const failPatch = {
      lastInvoicePaymentFailedAt: now,
      lastPaymentStatus: "failed" as const,
      updatedAt: now,
    };
    await mergeIfExists(db, "client_records", email, {
      ...failPatch,
      paymentFailed: true,
      paymentFailedAt: now,
    });
    await mergeIfExists(db, "members", email, failPatch);
  } else {
    console.warn(
      "[stripe-webhook] invoice.payment_failed: no client/member for",
      e.subscriptionId || e.customerId || e.email || e.eventId
    );
  }
  await logStripeEvent(db, { ...e, email: email || e.email }, "payment_failed");
  const flagged = email || e.email;
  if (flagged && flagged.includes("@")) {
    await logActivity({
      email: flagged,
      type: "note",
      title: "Stripe payment failed",
      description:
        typeof e.amountPaid === "number" && e.amountPaid > 0
          ? `Stripe could not collect ${formatUsdCents(e.amountPaid)}.`
          : "Stripe could not collect this payment.",
      meta: { eventId: e.eventId, subscriptionId: e.subscriptionId || null },
    });
  }
}

async function onSubscriptionDeleted(
  db: ReturnType<typeof getDb>,
  e: EnrichedStripeEvent,
  sub: Stripe.Subscription
): Promise<void> {
  const emails = await emailsToCancelForDeletedSubscription(db, sub);
  const now = new Date().toISOString();
  if (emails.length === 0) {
    console.warn(
      "[stripe-webhook] subscription.deleted: non-DU or unmatched",
      e.subscriptionId || e.eventId
    );
    await logStripeEvent(db, e, "subscription_deleted");
    return;
  }

  for (const email of emails) {
    await mergeIfExists(db, "client_records", email, {
      status: "subscription_cancelled",
      updatedAt: now,
    });
    await mergeIfExists(db, "members", email, {
      status: "cancelled",
      updatedAt: now,
    });
    await logActivity({
      email,
      type: "note",
      title: "Stripe subscription ended",
      description: `Subscription ${sub.id} was cancelled or finished its installments.`,
      meta: { eventId: e.eventId, subscriptionId: sub.id },
    });
  }
  await logStripeEvent(db, { ...e, email: emails[0] || "" }, "subscription_deleted");
}

async function logStripeEvent(
  db: ReturnType<typeof getDb>,
  e: EnrichedStripeEvent,
  label: string
): Promise<void> {
  const logId = e.eventId || undefined;
  const payload = {
    source: "stripe",
    eventId: e.eventId || null,
    label,
    type: e.rawEventType,
    email: e.email,
    packageId: e.packageId,
    planId: e.planId || null,
    amountPaid: e.amountPaid ?? null,
    customerId: e.customerId || null,
    subscriptionId: e.subscriptionId || null,
    receivedAt: new Date().toISOString(),
  };
  if (logId) {
    await db.collection("webhook_logs").doc(logId).set(payload, { merge: true });
    return;
  }
  await db.collection("webhook_logs").add(payload);
}

function eventCreatedIso(event: Stripe.Event): string | undefined {
  const created = (event as unknown as { created?: unknown }).created;
  return typeof created === "number" && created > 0
    ? new Date(created * 1000).toISOString()
    : undefined;
}

function invoicePaidAtIso(invoice: Stripe.Invoice): string | undefined {
  const transitions = (invoice as unknown as Record<string, unknown>).status_transitions as
    | { paid_at?: unknown }
    | undefined;
  const paidAt = transitions?.paid_at;
  return typeof paidAt === "number" && paidAt > 0
    ? new Date(paidAt * 1000).toISOString()
    : undefined;
}

async function stripeInstallmentNumber(
  db: ReturnType<typeof getDb>,
  e: EnrichedStripeEvent,
  paymentId: string,
  installments: number
): Promise<number> {
  if (installments <= 1 || e.type === "checkout.session.completed" || !e.subscriptionId) {
    return 1;
  }
  const snap = await db
    .collection(CLIENT_PAYMENTS)
    .where("stripeSubscriptionId", "==", e.subscriptionId)
    .limit(50)
    .get();
  const earlier = snap.docs.filter((doc) => doc.id !== paymentId).length;
  return Math.min(installments, earlier + 1);
}

/**
 * Ledger side of a paid coaching checkout or invoice: one client_payments
 * row per Stripe invoice (or session for pay-in-full), the pipeline card
 * moved to won, a timeline entry, and the membership the package includes.
 * Every step is safe to repeat when Stripe redelivers.
 */
async function syncStripeCoachingPayment(
  db: ReturnType<typeof getDb>,
  e: EnrichedStripeEvent
): Promise<void> {
  const email = (e.email || "").trim().toLowerCase();
  if (!email.includes("@") || !e.packageId) return;
  const amount = Number(e.amountPaid || 0);
  if (!(amount > 0)) return;
  const pkg = await getPackage(e.packageId);
  if (!pkg) return;
  const paymentId = stripePaymentDocId({
    invoiceId: e.invoiceId,
    sessionId: e.type === "checkout.session.completed" ? e.checkoutSessionId : undefined,
  });
  if (!paymentId) return;

  const planId = asPaymentPlanId(e.planId);
  const plan = pkg.paymentPlans.find((p) => p.id === planId);
  const installments = plan?.installments ?? 1;
  const installmentNumber = await stripeInstallmentNumber(db, e, paymentId, installments);
  const paidAt = e.paidAtIso || new Date().toISOString();
  const source =
    e.type === "checkout.session.completed"
      ? `Stripe checkout ${e.checkoutSessionId || ""}`.trim()
      : `Stripe invoice ${e.invoiceId || ""}`.trim();

  const { created } = await recordClientPayment(db, paymentId, {
    email,
    method: "stripe",
    amount,
    currency: "usd",
    paidAt,
    packageId: pkg.id,
    planId,
    installmentNumber,
    stripeInvoiceId: e.invoiceId || null,
    stripeSessionId: e.checkoutSessionId || null,
    stripeSubscriptionId: e.subscriptionId || null,
    reference: null,
    note: source,
    source: "stripe_webhook",
    actor: null,
    createdAt: new Date().toISOString(),
  });

  const firstAt = await firstPaymentAt(db, email, pkg.id);
  await grantCoachingMembership(email, pkg.id, {
    name: e.clientName || undefined,
    from: new Date(firstAt || paidAt),
  });
  await markPipelineWon(db, {
    email,
    name: e.clientName,
    packageId: pkg.id,
    closeValue: plan?.total ?? pkg.price,
    source: "stripe",
    note: `Paid by ${source}.`,
  });
  await mergeIfExists(db, "client_records", email, {
    paymentFailed: false,
    paymentFailedAt: null,
  });
  if (created) {
    await logActivity({
      email,
      type: "payment",
      title: `Stripe payment ${formatUsdCents(amount)}`,
      description: [
        pkg.name,
        installments > 1 ? `installment ${installmentNumber} of ${installments}` : "paid in full",
      ].join(" · "),
      meta: { paymentId, method: "stripe", amount },
    });
  }
}

function buyerEmailFromSession(session: Stripe.Checkout.Session): string {
  const ref = session.client_reference_id || "";
  const colon = ref.indexOf(":");
  const fromRef = colon >= 0 ? ref.slice(colon + 1) : "";
  const fromDetails = session.customer_details?.email || "";
  const fromCustomer = session.customer_email || "";
  return (fromRef || fromDetails || fromCustomer).trim().toLowerCase();
}

function packageIdFromReference(ref: string | null | undefined): string {
  const value = ref || "";
  const colon = value.indexOf(":");
  return (colon >= 0 ? value.slice(0, colon) : value).trim();
}

function asPlanId(planId: string | undefined): PaymentPlan["id"] {
  if (planId === "3pay" || planId === "6pay" || planId === "full") return planId;
  return "full";
}

function installmentCount(planId: string | undefined): 3 | 6 | null {
  if (planId === "3pay") return 3;
  if (planId === "6pay") return 6;
  return null;
}

async function boundInstallmentSubscription(e: EnrichedStripeEvent): Promise<void> {
  const count = installmentCount(e.planId);
  if (!count) return;
  if (!e.subscriptionId) {
    throw new Error(
      `Installment checkout ${e.checkoutSessionId || e.eventId} has no subscription`
    );
  }
  await endInstallmentSubscription({
    subscriptionId: e.subscriptionId,
    iterations: count,
  });
}

async function sendCoachingAgreementEmail(e: EnrichedStripeEvent): Promise<void> {
  if (!e.checkoutSessionId || !e.packageId || !e.email.includes("@")) return;
  const mailed = await ensureCoachingAgreementEmail({
    email: e.email,
    name: e.clientName || e.email,
    packageId: e.packageId,
    planId: asPlanId(e.planId),
    grantKey: e.checkoutSessionId,
  });
  if (!mailed.ok && mailed.retryable) {
    throw new Error(mailed.error || "Coaching agreement email failed");
  }
}

function scheduleIdOf(sub: Stripe.Subscription): string | null {
  const schedule = sub.schedule;
  if (!schedule) return null;
  return typeof schedule === "string" ? schedule : schedule.id;
}

function priceIdOf(sub: Stripe.Subscription): string | null {
  const price = sub.items?.data?.[0]?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id || null;
}

function utcMonthSpan(startUnix: number, endUnix: number): number {
  const start = new Date(startUnix * 1000);
  const end = new Date(endUnix * 1000);
  return (
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth())
  );
}

function phaseMonthSpan(
  phase: Stripe.SubscriptionSchedule.Phase | undefined
): number | null {
  if (!phase?.start_date || !phase.end_date) return null;
  return utcMonthSpan(phase.start_date, phase.end_date);
}

/**
 * Stop a monthly installment subscription after exactly 3 or 6 invoices.
 * Stripe's current schedule API uses `duration.interval_count` for that
 * count (the older `iterations` field is not on this SDK).
 */
export async function endInstallmentSubscription(args: {
  subscriptionId: string;
  iterations: 3 | 6;
}): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe not configured");
  }
  const sub = await stripe.subscriptions.retrieve(args.subscriptionId);
  const priceId = priceIdOf(sub);
  if (!priceId) {
    throw new Error(`Subscription ${args.subscriptionId} has no price`);
  }

  let scheduleId = scheduleIdOf(sub);
  if (!scheduleId) {
    const created = await stripe.subscriptionSchedules.create({
      from_subscription: args.subscriptionId,
    });
    scheduleId = created.id;
  }

  const existing = await stripe.subscriptionSchedules.retrieve(scheduleId);
  const startDate = existing.phases[0]?.start_date;
  if (!startDate) {
    throw new Error(`Schedule ${scheduleId} has no phase start`);
  }

  const alreadyBounded =
    existing.end_behavior === "cancel" &&
    phaseMonthSpan(existing.phases[0]) === args.iterations;
  if (!alreadyBounded) {
    await stripe.subscriptionSchedules.update(scheduleId, {
      end_behavior: "cancel",
      proration_behavior: "none",
      phases: [
        {
          items: [{ price: priceId, quantity: 1 }],
          start_date: startDate,
          duration: { interval: "month", interval_count: args.iterations },
          proration_behavior: "none",
        },
      ],
    });
  }

  const updated = await stripe.subscriptionSchedules.retrieve(scheduleId);
  const span = phaseMonthSpan(updated.phases[0]);
  if (updated.end_behavior !== "cancel" || span !== args.iterations) {
    throw new Error(
      `Installment schedule ${scheduleId} is not bounded (end_behavior=${updated.end_behavior}, months=${String(span)}, expected=${args.iterations})`
    );
  }
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | undefined {
  const invoiceAny = invoice as unknown as Record<string, unknown>;
  if (typeof invoiceAny.subscription === "string") {
    return invoiceAny.subscription;
  }
  const parent = invoiceAny.parent as Record<string, unknown> | undefined;
  const subDetails = parent?.subscription_details as
    | Record<string, unknown>
    | undefined;
  const nested = subDetails?.subscription;
  return typeof nested === "string" ? nested : undefined;
}

async function mergeIfExists(
  db: ReturnType<typeof getDb>,
  collection: "client_records" | "members",
  email: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = db.collection(collection).doc(email);
  if (!(await ref.get()).exists) return;
  await ref.set(data, { merge: true });
}

function subscriptionPriceIds(sub: Stripe.Subscription): string[] {
  const prices: string[] = [];
  const items = sub.items?.data ?? [];
  for (const item of items) {
    const price = item.price;
    if (price && typeof price === "object" && price.id) {
      prices.push(price.id);
    }
  }
  return prices;
}

/** Price IDs from `STRIPE_PRICE_*` env vars on package payment plans. No product IDs in config. */
async function duCoachingPriceAllowlist(): Promise<{
  prices: Set<string>;
  packageIds: Set<string>;
}> {
  const packages = await getPackages({ activeOnly: false });
  const prices = new Set<string>();
  const packageIds = new Set<string>();
  for (const pkg of packages) {
    packageIds.add(pkg.id);
    for (const plan of pkg.paymentPlans) {
      const priceId = process.env[plan.stripePriceEnvVar];
      if (priceId) prices.add(priceId);
    }
  }
  return { prices, packageIds };
}

async function isDuCoachingSubscription(
  sub: Stripe.Subscription
): Promise<boolean> {
  const allow = await duCoachingPriceAllowlist();
  if (subscriptionPriceIds(sub).some((id) => allow.prices.has(id))) return true;
  const metaPackage = String(sub.metadata?.packageId || "");
  return Boolean(metaPackage && allow.packageIds.has(metaPackage));
}

async function collectEmailsByStripeField(
  db: ReturnType<typeof getDb>,
  field: "stripeSubscriptionId" | "stripeCustomerId",
  value: string
): Promise<Map<string, Record<string, unknown>>> {
  const found = new Map<string, Record<string, unknown>>();
  for (const collection of ["client_records", "members"] as const) {
    const snap = await db
      .collection(collection)
      .where(field, "==", value)
      .limit(5)
      .get();
    for (const doc of snap.docs) {
      const data = (doc.data() || {}) as Record<string, unknown>;
      const email = String(data.email || doc.id || "")
        .trim()
        .toLowerCase();
      if (email.includes("@")) found.set(email, data);
    }
  }
  return found;
}

async function emailsToCancelForDeletedSubscription(
  db: ReturnType<typeof getDb>,
  sub: Stripe.Subscription
): Promise<string[]> {
  const byStoredId = await collectEmailsByStripeField(
    db,
    "stripeSubscriptionId",
    sub.id
  );
  if (byStoredId.size > 0) {
    return [...byStoredId.keys()];
  }

  if (!(await isDuCoachingSubscription(sub))) {
    return [];
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : "";
  if (!customerId) return [];

  const byCustomer = await collectEmailsByStripeField(
    db,
    "stripeCustomerId",
    customerId
  );
  const emails: string[] = [];
  const metaPackage = String(sub.metadata?.packageId || "");
  for (const [email, data] of byCustomer) {
    const storedSub = String(data.stripeSubscriptionId || "");
    if (storedSub && storedSub !== sub.id) continue;
    if (metaPackage) {
      const clientPackage = String(data.packageId || "");
      if (clientPackage !== metaPackage) continue;
    }
    emails.push(email);
  }
  return emails;
}

async function findEmailByStripeField(
  db: ReturnType<typeof getDb>,
  collection: "client_records" | "members",
  field: "stripeSubscriptionId" | "stripeCustomerId",
  value: string
): Promise<string | null> {
  const snap = await db
    .collection(collection)
    .where(field, "==", value)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  const data = doc.data() as Record<string, unknown> | undefined;
  const email = String(data?.email || doc.id || "")
    .trim()
    .toLowerCase();
  return email.includes("@") ? email : null;
}

async function stripeCustomerEmail(
  customerId: string
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    const email = customer.email?.trim().toLowerCase();
    return email && email.includes("@") ? email : null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      "[stripe-webhook] customers.retrieve failed",
      customerId,
      msg
    );
    return null;
  }
}

async function resolveClientEmail(
  db: ReturnType<typeof getDb>,
  e: {
    email?: string;
    customerId?: string;
    subscriptionId?: string;
  }
): Promise<string | null> {
  const fromEvent = e.email?.trim().toLowerCase();
  if (fromEvent && fromEvent.includes("@")) {
    const clientExists = (await db.collection("client_records").doc(fromEvent).get())
      .exists;
    const memberExists = (await db.collection("members").doc(fromEvent).get())
      .exists;
    if (clientExists || memberExists) return fromEvent;
  }

  if (e.subscriptionId) {
    const bySub =
      (await findEmailByStripeField(
        db,
        "client_records",
        "stripeSubscriptionId",
        e.subscriptionId
      )) ||
      (await findEmailByStripeField(
        db,
        "members",
        "stripeSubscriptionId",
        e.subscriptionId
      ));
    if (bySub) return bySub;
  }

  if (e.customerId) {
    const byCustomer =
      (await findEmailByStripeField(
        db,
        "client_records",
        "stripeCustomerId",
        e.customerId
      )) ||
      (await findEmailByStripeField(
        db,
        "members",
        "stripeCustomerId",
        e.customerId
      ));
    if (byCustomer) return byCustomer;
  }

  if (e.customerId) {
    const fromStripe = await stripeCustomerEmail(e.customerId);
    if (fromStripe) {
      const clientExists = (
        await db.collection("client_records").doc(fromStripe).get()
      ).exists;
      const memberExists = (await db.collection("members").doc(fromStripe).get())
        .exists;
      if (clientExists || memberExists) return fromStripe;
    }
  }

  return null;
}
