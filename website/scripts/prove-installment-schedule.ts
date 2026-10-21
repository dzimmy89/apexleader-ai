/**
 * Prove a monthly subscription ends after exactly 3 and exactly 6 invoices.
 *
 * Requires a Stripe test-mode secret. Never pass a live key.
 *
 *   STRIPE_TEST_SECRET_KEY=sk_test_... npx tsx scripts/prove-installment-schedule.ts
 */
import Stripe from "stripe";
import { endInstallmentSubscription, setStripeForTests } from "../lib/coaching/stripe";

const key = process.env.STRIPE_TEST_SECRET_KEY || "";
if (!key.startsWith("sk_test_")) {
  console.error(
    "Set STRIPE_TEST_SECRET_KEY to a test-mode secret (sk_test_...). Refusing to run."
  );
  process.exit(2);
}

const stripe = new Stripe(key);
setStripeForTests(stripe);

function plusMonths(unix: number, months: number): number {
  const date = new Date(unix * 1000);
  date.setUTCMonth(date.getUTCMonth() + months);
  return Math.floor(date.getTime() / 1000);
}

async function waitUntilReady(clockId: string): Promise<void> {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
    if (clock.status === "ready") return;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Test clock ${clockId} did not become ready`);
}

async function paidInvoiceCount(subscriptionId: string): Promise<number> {
  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    limit: 20,
  });
  return invoices.data.filter((invoice) => invoice.status === "paid").length;
}

async function proveInstallments(iterations: 3 | 6): Promise<void> {
  const frozen = Math.floor(Date.now() / 1000);
  const clock = await stripe.testHelpers.testClocks.create({
    frozen_time: frozen,
    name: `dfu-${iterations}pay-${frozen}`,
  });
  const customer = await stripe.customers.create({
    email: `dfu-installment-${iterations}-${frozen}@example.com`,
    test_clock: clock.id,
  });
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: { token: "tok_visa" },
  });
  await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });
  const product = await stripe.products.create({
    name: `DFU installment proof ${iterations}`,
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: 100,
    recurring: { interval: "month" },
  });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    default_payment_method: paymentMethod.id,
  });

  await endInstallmentSubscription({
    subscriptionId: subscription.id,
    iterations,
  });

  for (let month = 1; month <= iterations; month += 1) {
    await stripe.testHelpers.testClocks.advance(clock.id, {
      frozen_time: plusMonths(frozen, month),
    });
    await waitUntilReady(clock.id);
  }

  const refreshed = await stripe.subscriptions.retrieve(subscription.id);
  const paid = await paidInvoiceCount(subscription.id);
  if (paid !== iterations) {
    throw new Error(`${iterations}-pay produced ${paid} paid invoices`);
  }
  if (refreshed.status !== "canceled") {
    throw new Error(
      `${iterations}-pay subscription status is ${refreshed.status}, expected canceled`
    );
  }
  console.log(`${iterations}-pay ok: ${paid} paid invoices, status canceled`);
}

async function provePayInFullCreatesNoSubscription(): Promise<void> {
  const customer = await stripe.customers.create({
    email: `dfu-full-${Date.now()}@example.com`,
  });
  const product = await stripe.products.create({ name: "DFU full-pay proof" });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: 60000,
  });
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: { token: "tok_visa" },
  });
  await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
  const intent = await stripe.paymentIntents.create({
    amount: 60000,
    currency: "usd",
    customer: customer.id,
    payment_method: paymentMethod.id,
    confirm: true,
    off_session: true,
  });
  if (intent.status !== "succeeded") {
    throw new Error(`Pay-in-full intent status ${intent.status}`);
  }
  const subs = await stripe.subscriptions.list({ customer: customer.id, limit: 10 });
  if (subs.data.length !== 0) {
    throw new Error("Pay-in-full created a subscription");
  }
  console.log("pay-in-full ok: no subscription");
}

async function main(): Promise<void> {
  await provePayInFullCreatesNoSubscription();
  await proveInstallments(3);
  await proveInstallments(6);
  console.log("Installment proof passed.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
