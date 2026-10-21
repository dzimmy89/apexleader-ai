import { NextRequest, NextResponse } from "next/server";
import { getStripe, handleStripeWebhookEvent } from "@/lib/coaching/stripe";

// POST /api/webhooks/stripe
// Verifies the Stripe signature and dispatches the event.
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stripe-webhook] signature verification failed", msg);
    return NextResponse.json({ error: `Invalid signature: ${msg}` }, { status: 400 });
  }

  try {
    const result = await handleStripeWebhookEvent(event);
    if (result.duplicate) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    if (!result.handled) {
      console.log("[stripe-webhook] unhandled event type:", event.type);
    }
    return NextResponse.json({ received: true, handled: result.handled });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stripe-webhook] handler failed", msg);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
