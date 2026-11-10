# Deploying FromAItoBusiness

Production is Cloud Run service `apexleader-ai` (us-central1) in the Google Cloud project `apexleader-prod` (number 38118386790, billing account 01E44E-C71C42-B1C090), deployed by [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) on every push to `main`. All deploy settings live in that file's `env:` block.

Live at https://fromaitobusiness.com (also https://apexleader-ai-38118386790.us-central1.run.app).

## Done (Oct 22 2026)

- Project, APIs, Artifact Registry repo `cloud-run-source-deploy`, Firestore `(default)` (nam5), bucket `apexleader-prod-contracts`.
- Runtime account `38118386790-compute@developer.gserviceaccount.com`: Secret Manager accessor, Datastore user, Storage, Vertex AI user, Artifact Registry writer, Logging writer, Firebase Auth admin.
- Deploy account `github-deploy@apexleader-prod.iam.gserviceaccount.com`, used by GitHub through Workload Identity Federation (pool and provider `github`, only `dzimmy89/apexleader-ai`). No key files.
- Secrets: `JWT_SECRET`, `CRON_SECRET`, `INTERNAL_WEBHOOK_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `COACH_NAME`, `COACH_TIMEZONE`, `CONTRACT_SIGN_TOKEN_TTL_DAYS`, `CONTRACTS_GCS_BUCKET`. The deploy mounts whichever of its known secrets exist, so new ones are picked up on the next deploy.

- Oct 23 2026: Firebase added to the project, web app "FromAItoBusiness web" (config in the workflow's `env:` block), Auth initialized with authorized domains localhost, apexleader-prod.firebaseapp.com, apexleader-prod.web.app, fromaitobusiness.com, www.fromaitobusiness.com and the run.app host. Google sign-in is switched on in the Firebase console (Authentication > Sign-in method). `github-deploy` has `roles/firebase.admin` and `roles/firebaserules.admin` for the rules publish.

## Still to do (owner)

1. **Brand mailbox.** fromaitobusiness.com has no mail yet; see 3.
2. **Domain.** Done: fromaitobusiness.com is mapped to the service and is `SITE_URL`.
3. **Google Workspace mailbox** for the brand. Until then `ADMIN_EMAIL` (admin Google sign-in, sender) is hello@defiuniversity.xyz.
4. **Mail, calendar and Meet.** A site service account key in Secret Manager as `GOOGLE_SERVICE_ACCOUNT_KEY`, with domain-wide delegation for Gmail send, Calendar, Drive read-only and Docs read-only, plus `COACH_CALENDAR_ID`. Bookings also must not clash with `COACH_BUSY_CALENDAR_IDS` (set in the deploy workflow); each of those calendars has to share "See only free/busy" with the sender address, or booking stops and hello@ gets an alert email. Turn on Meet recording and transcription.
5. **Stripe** (Blocksqozen LLC account). Add `STRIPE_SECRET_KEY` (a live secret key) to Secret Manager, then run the **Coaching setup** workflow (dry run, then apply). It creates the products, prices and the `<SITE_URL>/api/webhooks/stripe` webhook, and writes the `STRIPE_PRICE_*` and `STRIPE_WEBHOOK_SECRET` secrets. Its objects are tagged `fatb_source=coaching` and checkouts carry `site=fromaitobusiness.com`, so a Stripe account shared with another site is safe on this side: the webhook ignores the other site's events.
6. **Postal address** in `content/site.ts` (`POSTAL_ADDRESS`) and the `MAILING_ADDRESS` secret. Until then marketing email is held (`MARKETING_SENDS_ENABLED=false`).
7. **Dashboard summary feed.** Nothing to set up on this side. `GET /api/internal/dashboard-summary?days=7` returns totals only (leads, pipeline, discovery calls, sessions, payments, emails) and answers only the scheduled "Dashboard collect" workflow on the main branch of the private `defi-university-gtm` repository. That workflow sends the identity token GitHub signs for each run; `lib/dashboard-auth.ts` checks the signature, audience, repository id and branch, and everything else gets 403. No token or secret exists for it.

## What a deploy does

1. Lints and builds.
2. Writes `website/BUILD_SHA` from the pinned commit, builds the image with Cloud Build and deploys it to Cloud Run (min instances 0, so an idle site stays in the free tier and the first visit after a quiet spell takes a few seconds).
3. Once Firebase is set up, publishes `database/security-rules.rules` and checks the live rules match the repo.
4. Polls `<SITE_URL>/api/version` until it reports the deployed commit.

Firestore indexes (`database/indexes.json`) are not deployed by the workflow:

```bash
firebase deploy --only firestore:indexes --project apexleader-prod --non-interactive
```

## Before you merge

```bash
cd website
npm run lint
npx tsc --noEmit -p .
npx tsx scripts/test-syllabus-pipeline.ts   # and the other scripts/test-*.ts that CI runs
```

CI also runs the Firestore rules tests in the emulator (`firebase-tools@15.31.0`, project `demo-apexleader-rules`).

## After a deploy

- `<SITE_URL>/api/health`
- `curl -sf <SITE_URL>/api/version` returns the commit SHA
- `<SITE_URL>/coaching` and `<SITE_URL>/coaching/book`

## Recorded discovery calls and the written one-page plan

Every discovery call booked on the site gets a Google Meet room that records and
transcribes itself, and after the call the cron (`/api/cron/process-flows`)
turns the transcript into a one-page plan and emails it to the prospect, with a
copy to the coach. Code: `lib/coaching/meet-space.ts`, `lib/coaching/call-plans.ts`.

One-time setup in Google Admin → Security → API controls → Domain-wide
delegation, on the site's service account, add these scopes next to the ones
already there:

- `https://www.googleapis.com/auth/meetings.space.created`
- `https://www.googleapis.com/auth/meetings.space.settings`
- `https://www.googleapis.com/auth/drive.readonly` and
  `https://www.googleapis.com/auth/documents.readonly` (already needed for the
  syllabus intake)

Also turn on the Google Meet REST API in the Google Cloud project. Until the
Meet scopes are in place bookings still work with an ordinary Meet link, and
the call is only transcribed if recording or transcription is started by hand
(or switched on by default in Google Admin → Apps → Google Workspace → Google
Meet → Meet video settings).

Switches: `CALL_PLAN_MODE=review` sends each plan to the coach only, to forward
by hand. `MEET_AUTO_RECORD=off` goes back to ordinary Meet links. The plan step
only runs when something calls the cron route on a schedule (Cloud Scheduler
with the `CRON_SECRET` header); every 15 to 30 minutes is enough.
