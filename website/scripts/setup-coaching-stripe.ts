/**
 * Idempotent Stripe setup for DeFi University coaching packages (live mode).
 *
 * Creates 3 products, 6 prices, and the production webhook. Existing products
 * are renamed to the current display names; a Price is reused only when its
 * amount still matches. Tags all resources
 * with dfu_source=coaching metadata so re-runs are safe.
 *
 * Usage:
 *   export STRIPE_SECRET_KEY="$(gcloud secrets versions access latest \
 *     --secret=STRIPE_SECRET_KEY --project=defi-university-prod)"
 *   npx tsx scripts/setup-coaching-stripe.ts
 *   npx tsx scripts/setup-coaching-stripe.ts --dry-run
 *   npx tsx scripts/setup-coaching-stripe.ts --apply-secrets
 */

import { execSync } from "child_process";
import Stripe from "stripe";

const WEBHOOK_URL = "https://defiuniversity.xyz/api/webhooks/stripe";
const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.deleted",
];

const GCP_PROJECT = process.env.GCP_PROJECT_ID || "defi-university-prod";
const RUNTIME_SECRET_ACCESSOR =
  "serviceAccount:309871336262-compute@developer.gserviceaccount.com";

type PlanId = "full" | "3pay" | "6pay";
type PackageId = "foundations" | "mastery" | "institutional";

interface PriceSpec {
  secretEnvVar: string;
  packageId: PackageId;
  planId: PlanId;
  productName: string;
  description: string;
  amountCents: number;
  recurring: boolean;
}

// Prices changed Oct 2026 (Kickstart $750 / Operator $2,500 / Inner Circle $7,500).
// A re-run creates new Prices for changed amounts and archives nothing; point the
// secrets at the new ids with --apply-secrets.
const PRICE_SPECS: PriceSpec[] = [
  {
    secretEnvVar: "STRIPE_PRICE_FOUNDATIONS_FULL",
    packageId: "foundations",
    planId: "full",
    productName: "DeFi University Coaching: Kickstart",
    description: "Kickstart — 2 × 60-minute private 1-on-1 sessions ($750)",
    amountCents: 75000,
    recurring: false,
  },
  {
    secretEnvVar: "STRIPE_PRICE_FOUNDATIONS_3PAY",
    packageId: "foundations",
    planId: "3pay",
    productName: "DeFi University Coaching: Kickstart",
    description: "Kickstart — 3 monthly payments of $250",
    amountCents: 25000,
    recurring: true,
  },
  {
    secretEnvVar: "STRIPE_PRICE_FOUNDATIONS_6PAY",
    packageId: "foundations",
    planId: "6pay",
    productName: "DeFi University Coaching: Kickstart",
    description: "Kickstart — 6 monthly payments of $125",
    amountCents: 12500,
    recurring: true,
  },
  {
    secretEnvVar: "STRIPE_PRICE_MASTERY_FULL",
    packageId: "mastery",
    planId: "full",
    productName: "DeFi University Coaching: Operator",
    description: "Operator — 8 sessions over 12 weeks, pay in full ($2,500)",
    amountCents: 250000,
    recurring: false,
  },
  {
    secretEnvVar: "STRIPE_PRICE_MASTERY_3PAY",
    packageId: "mastery",
    planId: "3pay",
    productName: "DeFi University Coaching: Operator",
    description: "Operator — 3 monthly payments of $834",
    amountCents: 83400,
    recurring: true,
  },
  {
    secretEnvVar: "STRIPE_PRICE_MASTERY_6PAY",
    packageId: "mastery",
    planId: "6pay",
    productName: "DeFi University Coaching: Operator",
    description: "Operator — 6 monthly payments of $417",
    amountCents: 41700,
    recurring: true,
  },
  {
    secretEnvVar: "STRIPE_PRICE_INSTITUTIONAL_FULL",
    packageId: "institutional",
    planId: "full",
    productName: "DeFi University Coaching: Inner Circle",
    description: "Inner Circle — 24 weekly sessions, pay in full ($7,500)",
    amountCents: 750000,
    recurring: false,
  },
  {
    secretEnvVar: "STRIPE_PRICE_INSTITUTIONAL_3PAY",
    packageId: "institutional",
    planId: "3pay",
    productName: "DeFi University Coaching: Inner Circle",
    description: "Inner Circle — 3 monthly payments of $2,500",
    amountCents: 250000,
    recurring: true,
  },
  {
    secretEnvVar: "STRIPE_PRICE_INSTITUTIONAL_6PAY",
    packageId: "institutional",
    planId: "6pay",
    productName: "DeFi University Coaching: Inner Circle",
    description: "Inner Circle — 6 monthly payments of $1,250",
    amountCents: 125000,
    recurring: true,
  },
];

const PRODUCT_NAMES: Record<PackageId, { name: string; description: string }> = {
  foundations: {
    name: "DeFi University Coaching: Kickstart",
    description: "Private 1-on-1 DeFi coaching — Kickstart ($750, 2 sessions)",
  },
  mastery: {
    name: "DeFi University Coaching: Operator",
    description: "Private 1-on-1 DeFi coaching — Operator ($2,500, 8 sessions)",
  },
  institutional: {
    name: "DeFi University Coaching: Inner Circle",
    description: "Private 1-on-1 DeFi coaching — Inner Circle ($7,500, 24 sessions)",
  },
};

function coachingMetadata(
  packageId: PackageId,
  planId?: PlanId
): Record<string, string> {
  const meta: Record<string, string> = {
    dfu_source: "coaching",
    dfu_package_id: packageId,
  };
  if (planId) meta.dfu_plan_id = planId;
  return meta;
}

async function findProductByPackage(
  stripe: Stripe,
  packageId: PackageId
): Promise<Stripe.Product | null> {
  const result = await stripe.products.search({
    query: `metadata['dfu_source']:'coaching' AND metadata['dfu_package_id']:'${packageId}' AND active:'true'`,
    limit: 1,
  });
  return result.data[0] ?? null;
}

async function findPriceByPlan(
  stripe: Stripe,
  productId: string,
  planId: PlanId,
  amountCents: number
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  return (
    prices.data.find(
      (p) => p.metadata?.dfu_plan_id === planId && p.unit_amount === amountCents
    ) ?? null
  );
}

async function ensureProduct(
  stripe: Stripe,
  packageId: PackageId,
  dryRun: boolean
): Promise<string> {
  const existing = await findProductByPackage(stripe, packageId);
  const { name, description } = PRODUCT_NAMES[packageId];
  if (existing) {
    console.log(`  ✓ product exists: ${existing.id} (${packageId})`);
    if (existing.name !== name && !dryRun) {
      await stripe.products.update(existing.id, { name, description });
      console.log(`  ~ renamed product to: ${name}`);
    }
    return existing.id;
  }

  if (dryRun) {
    console.log(`  [dry-run] would create product: ${name}`);
    return `prod_dryrun_${packageId}`;
  }

  const product = await stripe.products.create({
    name,
    description,
    metadata: coachingMetadata(packageId),
  });
  console.log(`  + created product: ${product.id} (${packageId})`);
  return product.id;
}

async function ensurePrice(
  stripe: Stripe,
  spec: PriceSpec,
  productId: string,
  dryRun: boolean
): Promise<string> {
  if (!dryRun && !productId.startsWith("prod_dryrun_")) {
    const existing = await findPriceByPlan(
      stripe,
      productId,
      spec.planId,
      spec.amountCents
    );
    if (existing) {
      console.log(
        `  ✓ price exists: ${existing.id} → ${spec.secretEnvVar}`
      );
      return existing.id;
    }
  }

  if (dryRun) {
    console.log(
      `  [dry-run] would create price for ${spec.secretEnvVar} ($${spec.amountCents / 100}${spec.recurring ? "/mo" : ""})`
    );
    return `price_dryrun_${spec.packageId}_${spec.planId}`;
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: spec.amountCents,
    ...(spec.recurring
      ? { recurring: { interval: "month" as const } }
      : {}),
    metadata: coachingMetadata(spec.packageId, spec.planId),
  });
  console.log(`  + created price: ${price.id} → ${spec.secretEnvVar}`);
  return price.id;
}

async function ensureWebhook(
  stripe: Stripe,
  dryRun: boolean
): Promise<{ endpointId: string; signingSecret: string | null; created: boolean }> {
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = endpoints.data.find((e) => e.url === WEBHOOK_URL);

  if (existing) {
    if (!dryRun) {
      await stripe.webhookEndpoints.update(existing.id, {
        enabled_events: WEBHOOK_EVENTS,
        disabled: false,
      });
    }
    console.log(`  ✓ webhook exists: ${existing.id} (${WEBHOOK_URL})`);
    console.log(
      "    Note: signing secret only shown on create — reuse existing STRIPE_WEBHOOK_SECRET unless you rotate the endpoint."
    );
    return { endpointId: existing.id, signingSecret: null, created: false };
  }

  if (dryRun) {
    console.log(`  [dry-run] would create webhook: ${WEBHOOK_URL}`);
    return { endpointId: "we_dryrun", signingSecret: null, created: false };
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: WEBHOOK_EVENTS,
    description: "DeFi University coaching checkout + subscriptions",
  });
  console.log(`  + created webhook: ${endpoint.id}`);
  return {
    endpointId: endpoint.id,
    signingSecret: endpoint.secret ?? null,
    created: true,
  };
}

function secretExists(name: string): boolean {
  try {
    execSync(`gcloud secrets describe ${name} --project=${GCP_PROJECT}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function grantRuntimeAccess(name: string): void {
  execSync(
    `gcloud secrets add-iam-policy-binding ${name} --project=${GCP_PROJECT} --member=${RUNTIME_SECRET_ACCESSOR} --role=roles/secretmanager.secretAccessor`,
    { stdio: "inherit" }
  );
  console.log(`  ✓ Secret Accessor: ${name}`);
}

function applySecret(name: string, value: string): void {
  if (!secretExists(name)) {
    execSync(
      `gcloud secrets create ${name} --project=${GCP_PROJECT} --replication-policy=automatic --data-file=-`,
      { input: value, stdio: ["pipe", "inherit", "inherit"] }
    );
    grantRuntimeAccess(name);
    console.log(`  ✓ Secret Manager: ${name} created`);
    return;
  }
  execSync(
    `gcloud secrets versions add ${name} --project=${GCP_PROJECT} --data-file=-`,
    { input: value, stdio: ["pipe", "inherit", "inherit"] }
  );
  console.log(`  ✓ Secret Manager: ${name} updated`);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const applySecrets = process.argv.includes("--apply-secrets");

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("STRIPE_SECRET_KEY env var is required.");
    process.exit(1);
  }
  if (!key.startsWith("sk_live_")) {
    console.error(
      "Preflight failed: STRIPE_SECRET_KEY must start with sk_live_ (live mode only)."
    );
    process.exit(1);
  }

  console.log("DeFi University — coaching Stripe setup (live mode)\n");
  if (dryRun) console.log("DRY RUN — no Stripe or GCP writes\n");

  const stripe = new Stripe(key);

  // Group specs by package for product creation
  const productIds = new Map<PackageId, string>();
  const packageIds: PackageId[] = ["foundations", "mastery", "institutional"];

  console.log("Products:");
  for (const pkgId of packageIds) {
    productIds.set(pkgId, await ensureProduct(stripe, pkgId, dryRun));
  }

  console.log("\nPrices:");
  const priceResults: Record<string, string> = {};
  for (const spec of PRICE_SPECS) {
    const productId = productIds.get(spec.packageId)!;
    const priceId = await ensurePrice(stripe, spec, productId, dryRun);
    priceResults[spec.secretEnvVar] = priceId;
  }

  console.log("\nWebhook:");
  const webhook = await ensureWebhook(stripe, dryRun);

  console.log("\n── Summary ──");
  console.log("Secret env var → Stripe Price ID");
  for (const [secret, priceId] of Object.entries(priceResults)) {
    console.log(`  ${secret} = ${priceId}`);
  }

  if (webhook.signingSecret) {
    console.log(`\n  STRIPE_WEBHOOK_SECRET = ${webhook.signingSecret.slice(0, 12)}... (new — update Secret Manager)`);
  }

  if (applySecrets && !dryRun) {
    console.log("\nApplying to Secret Manager...");
    for (const [secret, priceId] of Object.entries(priceResults)) {
      applySecret(secret, priceId);
    }
    if (webhook.signingSecret) {
      applySecret("STRIPE_WEBHOOK_SECRET", webhook.signingSecret);
    }
  } else if (!dryRun) {
    console.log("\nTo write secrets to GCP, re-run with --apply-secrets or run:");
    for (const [secret, priceId] of Object.entries(priceResults)) {
      console.log(
        `  echo -n "${priceId}" | gcloud secrets versions add ${secret} --project=${GCP_PROJECT} --data-file=-`
      );
    }
    if (webhook.signingSecret) {
      console.log(
        `  echo -n "${webhook.signingSecret}" | gcloud secrets versions add STRIPE_WEBHOOK_SECRET --project=${GCP_PROJECT} --data-file=-`
      );
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("[setup-coaching-stripe] FAILED", e);
  process.exit(1);
});
