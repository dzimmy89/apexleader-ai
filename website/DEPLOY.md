# Deploying ApexLeader.ai

Production is Cloud Run service `apexleader-ai` (us-central1) in the Google Cloud project `apexleader-prod` (number 38118386790, billing account 01E44E-C71C42-B1C090), deployed by [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) on every push to `main`. All deploy settings live in that file's `env:` block.

Live address for now: https://apexleader-ai-38118386790.us-central1.run.app

## Done (Oct 22 2026)

- Project, APIs, Artifact Registry repo `cloud-run-source-deploy`, Firestore `(default)` (nam5), bucket `apexleader-prod-contracts`.
- Runtime account `38118386790-compute@developer.gserviceaccount.com`: Secret Manager accessor, Datastore user, Storage, Vertex AI user, Artifact Registry writer, Logging writer, Firebase Auth admin.
- Deploy account `github-deploy@apexleader-prod.iam.gserviceaccount.com`, used by GitHub through Workload Identity Federation (pool and provider `github`, only `dzimmy89/apexleader-ai`). No key files.
- Secrets: `JWT_SECRET`, `CRON_SECRET`, `INTERNAL_WEBHOOK_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `COACH_NAME`, `COACH_TIMEZONE`, `CONTRACT_SIGN_TOKEN_TTL_DAYS`, `CONTRACTS_GCS_BUCKET`. The deploy mounts whichever of its known secrets exist, so new ones are picked up on the next deploy.

## Still to do (owner)

1. **Firebase.** Add Firebase to `apexleader-prod`, add a Web app, turn on Google sign-in, and add the run.app host (later the real domain) to Authentication's authorized domains. Put `apiKey`, `messagingSenderId` and `appId` in the workflow's `env:` block. That turns on sign-in and the Firestore rules publish.
2. **Domain and branding.** When settled, map the domain to the Cloud Run service, set `SITE_URL` in the workflow, update `lib/brand.ts`, and add the domain to Firebase authorized domains.
3. **Google Workspace mailbox** for the brand. Until then `ADMIN_EMAIL` (admin Google sign-in, sender) is hello@defiuniversity.xyz.
4. **Mail, calendar and Meet.** A site service account key in Secret Manager as `GOOGLE_SERVICE_ACCOUNT_KEY`, with domain-wide delegation for Gmail send, Calendar, Drive read-only and Docs read-only, plus `COACH_CALENDAR_ID`. Turn on Meet recording and transcription.
5. **Stripe.** Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (endpoint `<SITE_URL>/api/webhooks/stripe`) to Secret Manager, then run the **Coaching setup** workflow (dry run, then apply) to create the `STRIPE_PRICE_*` secrets.
6. **Postal address** in `content/site.ts` (`POSTAL_ADDRESS`) and the `MAILING_ADDRESS` secret. Until then marketing email is held (`MARKETING_SENDS_ENABLED=false`).

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
