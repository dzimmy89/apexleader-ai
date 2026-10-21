/**
 * Idempotent Google Calendar setup for DeFi University coaching discovery calls.
 *
 * Creates (or reuses) the "DeFi University — Discovery Calls" calendar and
 * writes COACH_* secrets to Secret Manager.
 *
 * Prerequisites:
 *   - GOOGLE_SERVICE_ACCOUNT_KEY in env (from Secret Manager)
 *   - Domain-wide delegation for https://www.googleapis.com/auth/calendar
 *     impersonating hello@defiuniversity.xyz
 *
 * Usage:
 *   export GOOGLE_SERVICE_ACCOUNT_KEY="$(gcloud secrets versions access latest \
 *     --secret=GOOGLE_SERVICE_ACCOUNT_KEY --project=defi-university-prod)"
 *   npx tsx scripts/setup-coaching-calendar.ts
 *   npx tsx scripts/setup-coaching-calendar.ts --dry-run
 *   npx tsx scripts/setup-coaching-calendar.ts --apply-secrets
 */

import { execSync } from "child_process";
import { google } from "googleapis";

const GCP_PROJECT = process.env.GCP_PROJECT_ID || "defi-university-prod";
const IMPERSONATE_SUBJECT = "hello@defiuniversity.xyz";
const CALENDAR_SUMMARY = "DeFi University — Discovery Calls";
const CALENDAR_DESCRIPTION =
  "Discovery call bookings from defiuniversity.xyz/coaching/book";
const COACH_TIMEZONE = "America/New_York";
const COACH_NAME = "David Zimmerman";

function parseCredentials(): Record<string, unknown> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("GOOGLE_SERVICE_ACCOUNT_KEY env var is required.");
    process.exit(1);
  }
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    return JSON.parse(raw);
  }
}

function getCalendarClient() {
  const credentials = parseCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    clientOptions: { subject: IMPERSONATE_SUBJECT },
  });
  return google.calendar({ version: "v3", auth });
}

async function preflight(calendar: ReturnType<typeof getCalendarClient>) {
  console.log(`Preflight: listing calendars as ${IMPERSONATE_SUBJECT}...`);
  try {
    const res = await calendar.calendarList.list({ maxResults: 250 });
    console.log(`  ✓ API access OK (${res.data.items?.length ?? 0} calendars visible)`);
    return res.data.items ?? [];
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("\nPreflight FAILED — domain-wide delegation may be misconfigured.");
    console.error(`  Error: ${msg}`);
    console.error("\nEnsure Google Admin → Domain-wide delegation includes:");
    console.error("  https://www.googleapis.com/auth/calendar");
    console.error(`  for the Client ID in GOOGLE_SERVICE_ACCOUNT_KEY`);
    process.exit(1);
  }
}

async function findOrCreateCalendar(
  calendar: ReturnType<typeof getCalendarClient>,
  items: { id?: string | null; summary?: string | null }[],
  dryRun: boolean
): Promise<string> {
  const existing = items.find((c) => c.summary === CALENDAR_SUMMARY);
  if (existing?.id) {
    console.log(`  ✓ calendar exists: ${existing.id}`);
    return existing.id;
  }

  if (dryRun) {
    console.log(`  [dry-run] would create calendar: ${CALENDAR_SUMMARY}`);
    return "dryrun@group.calendar.google.com";
  }

  const created = await calendar.calendars.insert({
    requestBody: {
      summary: CALENDAR_SUMMARY,
      description: CALENDAR_DESCRIPTION,
      timeZone: COACH_TIMEZONE,
    },
  });

  const id = created.data.id;
  if (!id) {
    throw new Error("Calendar created but no id returned");
  }
  console.log(`  + created calendar: ${id}`);
  return id;
}

function applySecret(name: string, value: string): void {
  execSync(
    `gcloud secrets versions add ${name} --project=${GCP_PROJECT} --data-file=-`,
    { input: value, stdio: ["pipe", "inherit", "inherit"] }
  );
  console.log(`  ✓ Secret Manager: ${name} updated`);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const applySecrets = process.argv.includes("--apply-secrets");

  console.log("DeFi University — coaching Google Calendar setup\n");
  if (dryRun) console.log("DRY RUN — no creates or GCP writes\n");

  const calendar = getCalendarClient();
  const items = await preflight(calendar);

  console.log("\nCalendar:");
  const calendarId = await findOrCreateCalendar(calendar, items, dryRun);

  console.log("\n── Summary ──");
  console.log(`  COACH_CALENDAR_ID = ${calendarId}`);
  console.log(`  COACH_TIMEZONE    = ${COACH_TIMEZONE}`);
  console.log(`  COACH_NAME        = ${COACH_NAME}`);

  if (applySecrets && !dryRun) {
    console.log("\nApplying to Secret Manager...");
    applySecret("COACH_CALENDAR_ID", calendarId);
    applySecret("COACH_TIMEZONE", COACH_TIMEZONE);
    applySecret("COACH_NAME", COACH_NAME);
  } else if (!dryRun) {
    console.log("\nTo write secrets to GCP, re-run with --apply-secrets or run:");
    console.log(
      `  echo -n "${calendarId}" | gcloud secrets versions add COACH_CALENDAR_ID --project=${GCP_PROJECT} --data-file=-`
    );
    console.log(
      `  echo -n "${COACH_TIMEZONE}" | gcloud secrets versions add COACH_TIMEZONE --project=${GCP_PROJECT} --data-file=-`
    );
    console.log(
      `  echo -n "${COACH_NAME}" | gcloud secrets versions add COACH_NAME --project=${GCP_PROJECT} --data-file=-`
    );
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("[setup-coaching-calendar] FAILED", e);
  process.exit(1);
});
