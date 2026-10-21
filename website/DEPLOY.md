# Deploying ApexLeader.ai

Production is Cloud Run in the Google Cloud project `apexleader-prod`, deployed by [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) on every push to `main`. Nothing deploys until the repository variable `DEPLOY_FROM_GITHUB` is `true`, so merging is safe before the accounts below exist.

## One-time setup (owner)

Do these in order. None of them can be done from this repository.

1. **Domain.** Register `apexleader.ai` (or the domain you settle on) and update `lib/brand.ts` if it differs.
2. **Google Workspace.** Create `hello@apexleader.ai`. It sends all mail and owns the coaching calendars and Meet recordings.
3. **Google Cloud project `apexleader-prod`.** Turn on Cloud Run, Cloud Build, Artifact Registry, Secret Manager, Firestore (Native, `(default)`), Vertex AI, Gmail, Calendar, Drive and Docs APIs. Create an Artifact Registry Docker repository named `cloud-run-source-deploy` in `us-central1`.
4. **Service accounts.**
   - A deploy account whose JSON key becomes the GitHub secret `GCP_SA_KEY`, with Cloud Build Editor, Cloud Run Admin, Service Account User, Artifact Registry Writer, Firebase Admin and Service Usage Consumer.
   - The site account whose JSON key goes in Secret Manager as `GOOGLE_SERVICE_ACCOUNT_KEY`. In Google Admin, give it domain-wide delegation for Gmail send, Calendar, Drive read-only and Docs read-only. Give the Cloud Run runtime account the Vertex AI User role for Gemini.
5. **Firebase.** Add Firebase to the project, turn on Authentication (Email link and Google) and add `apexleader.ai` to the authorized domains. Copy the web app config into repository variables `FIREBASE_API_KEY`, `FIREBASE_MESSAGING_SENDER_ID` and `FIREBASE_APP_ID`.
6. **Stripe.** Create the account, add `STRIPE_SECRET_KEY` and the webhook secret `STRIPE_WEBHOOK_SECRET` (endpoint `https://apexleader.ai/api/webhooks/stripe`) to Secret Manager, then run the **Coaching setup** workflow (dry run, then apply) to create the package prices and `STRIPE_PRICE_*` secrets.
7. **Other secrets** in Secret Manager, named exactly as in [`cloudbuild.yaml`](./cloudbuild.yaml): `CRON_SECRET`, `INTERNAL_WEBHOOK_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_TEAM_PASSWORD_HASH`, `JWT_SECRET`, `MAILING_ADDRESS`, `COACH_CALENDAR_ID`, `COACH_TIMEZONE`, `COACH_NAME`, `CONTRACTS_GCS_BUCKET` (create the bucket too), `CONTRACT_SIGN_TOKEN_TTL_DAYS`.
8. **GitHub.** Add secrets `GCP_SA_KEY` and `GCP_PROJECT_ID` (`apexleader-prod`), then set the variable `DEPLOY_FROM_GITHUB` to `true` and run the deploy workflow once from the Actions tab.
9. **Postal address.** Put the business address in `content/site.ts` (`POSTAL_ADDRESS`). Until then marketing email is held, and Cloud Run runs with `MARKETING_SENDS_ENABLED=false`.
10. **Google Meet.** Turn on recording and transcription for discovery and coaching calls so transcripts reach the intake form.

## What a deploy does

1. Lints and builds with the Firebase variables.
2. Writes `website/BUILD_SHA` from the pinned commit and runs Cloud Build, which builds the image and deploys Cloud Run service `apexleader-ai` in `us-central1`.
3. Publishes `database/security-rules.rules` to `apexleader-prod` and checks the live rules match the repo.
4. Polls `https://apexleader.ai/api/version` until it reports the deployed commit.

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

- https://apexleader.ai/api/health
- `curl -sf https://apexleader.ai/api/version` returns the commit SHA
- https://apexleader.ai/coaching and https://apexleader.ai/coaching/book
