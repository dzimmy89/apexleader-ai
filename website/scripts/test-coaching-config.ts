// Environment validation helper for coaching platform integration tests.
//
// Run via: npx tsx scripts/test-coaching-config.ts
//
// Validates that all required environment variables for Stripe, Google
// Calendar, and the contract engine are present and well-formed. Exits
// non-zero if any are missing. Safe to run against any environment (the
// values themselves are never printed).

const REQUIRED = [
  { name: "STRIPE_SECRET_KEY", pattern: /^(sk_test_|sk_live_)/ },
  { name: "STRIPE_WEBHOOK_SECRET", pattern: /^whsec_/ },
  { name: "GOOGLE_SERVICE_ACCOUNT_KEY", pattern: /.+/ },
  { name: "SENDER_EMAIL", pattern: /^[^\s@]+@[^\s@]+$/ },
  { name: "COACH_CALENDAR_ID", pattern: /^[^\s@]+@[^\s@]+/ },
  { name: "CONTRACTS_GCS_BUCKET", pattern: /^[\w-]+$/ },
  // Per-package Stripe Price IDs.
  { name: "STRIPE_PRICE_FOUNDATIONS_FULL", pattern: /^price_/ },
  { name: "STRIPE_PRICE_FOUNDATIONS_3PAY", pattern: /^price_/ },
  { name: "STRIPE_PRICE_FOUNDATIONS_6PAY", pattern: /^price_/ },
  { name: "STRIPE_PRICE_MASTERY_FULL", pattern: /^price_/ },
  { name: "STRIPE_PRICE_MASTERY_3PAY", pattern: /^price_/ },
  { name: "STRIPE_PRICE_MASTERY_6PAY", pattern: /^price_/ },
  { name: "STRIPE_PRICE_INSTITUTIONAL_FULL", pattern: /^price_/ },
  { name: "STRIPE_PRICE_INSTITUTIONAL_3PAY", pattern: /^price_/ },
  { name: "STRIPE_PRICE_INSTITUTIONAL_6PAY", pattern: /^price_/ },
];

let passed = 0;
let failed = 0;
const missing: string[] = [];
const malformed: string[] = [];

console.log("DeFi University — coaching platform config check\n");

for (const req of REQUIRED) {
  const value = process.env[req.name];
  if (!value) {
    console.log(`  ✗ ${req.name}: MISSING`);
    missing.push(req.name);
    failed++;
    continue;
  }
  if (!req.pattern.test(value)) {
    console.log(`  ✗ ${req.name}: present but malformed`);
    malformed.push(req.name);
    failed++;
    continue;
  }
  console.log(`  ✓ ${req.name}: present and well-formed`);
  passed++;
}

console.log("");
if (failed > 0) {
  console.error(`Results: ${passed} ok, ${failed} failed`);
  if (missing.length) console.error(`  Missing: ${missing.join(", ")}`);
  if (malformed.length) console.error(`  Malformed: ${malformed.join(", ")}`);
  process.exit(1);
}
console.log(`Results: ${passed} ok, 0 failed — config is ready`);
