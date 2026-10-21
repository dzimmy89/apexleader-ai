# Deploy — DeFi University Website

A push to GitHub `main` runs [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) (`push` to `main`, and `workflow_dispatch`). It lints and builds, submits Cloud Build, publishes Firestore security rules, checks the live ruleset against the repo, and confirms `/api/version` reports the deployed commit. Both jobs are skipped unless the repository variable `DEPLOY_FROM_GITHUB` is `true`.

The former Origin pipeline ([`.depot/workflows/deploy-production.yml`](../.depot/workflows/deploy-production.yml)) runs the same deploy steps. Only one of the two may be live at a time, because both deploy the same Cloud Run service.

## Moving production from Origin to GitHub

Do these in order. Until step 5, production keeps deploying from Origin exactly as before.

1. **Bring Origin's code into GitHub.** Origin `main` has work GitHub lacks (for example `/coaching/pay`). From a machine signed in to Origin:
   ```bash
   origin repo clone getrunway/defi-university-website du-origin   # or use an existing checkout
   cd du-origin && git pull origin main
   git remote add github https://github.com/dzimmy89/defi-university-website.git
   git push github main:refs/heads/origin-main
   ```
   Then merge `origin-main` into GitHub `main` (or into the open pull request first) and resolve any conflicts. Do not deploy from GitHub before this, or production loses the Origin-only pages.
2. **Add the Google Cloud credentials to GitHub.** In the repository, open Settings > Secrets and variables > Actions and add two secrets:
   - `GCP_SA_KEY`: the same service account JSON key Depot uses, or a new key for that account (`gcloud iam service-accounts keys create key.json --iam-account=<deploy-sa>@defi-university-prod.iam.gserviceaccount.com`). The account needs Cloud Build Editor, Service Account User, Cloud Run Admin, Artifact Registry Writer, Storage Admin (for the Cloud Build source bucket), `roles/firebase.admin`, and `serviceusage.services.use`. Delete `key.json` after pasting it.
   - `GCP_PROJECT_ID`: `defi-university-prod`.
3. **Optional approval gate.** Settings > Environments > `production` > Required reviewers makes every deploy wait for a click.
4. **Turn off the Origin deploy.** Disable `.depot/workflows/deploy-production.yml` in Depot (or delete it on Origin `main`) and stop pushing to Origin.
5. **Switch GitHub on.** Settings > Secrets and variables > Actions > Variables: add `DEPLOY_FROM_GITHUB` = `true`. Then run the workflow once from the Actions tab (Deploy Website to Production > Run workflow) and check that it ends with "defiuniversity.xyz is serving <sha>".

To pause GitHub deploys later, set `DEPLOY_FROM_GITHUB` to `false`.

| | |
|---|---|
| Repository | https://github.com/dzimmy89/defi-university-website |
| Former host | `https://origin.cursor.com/getrunway/defi-university-website.git` (retired after cutover) |
| GCP project | `defi-university-prod` |
| Cloud Run | `defi-university-website` (`us-central1`) |
| Public URL | https://defiuniversity.xyz |
| Direct URL | https://defi-university-website-nmgwejn4ta-uc.a.run.app |
| Live workflow | `.github/workflows/deploy-production.yml` (when `DEPLOY_FROM_GITHUB` is `true`) |
| Rules file | `database/security-rules.rules` via [`firebase.json`](../firebase.json) |

## What a main push ships

1. **Checkout pin.** Checkout uses the triggering SHA with `clean: true`. The job then fetches that SHA at depth 1 and checks it out with `--force`. It exits if `HEAD` is not `GITHUB_SHA`, so a stale workspace cannot deploy an older `database/security-rules.rules`.
2. **Build SHA.** The job writes `website/BUILD_SHA` from `git rev-parse HEAD` (the pinned checkout), then submits Cloud Build with that file in the `website/` context. `/api/version` is a statically prerendered JSON response with a single `sha` field (`website/app/api/version/route.ts`, `dynamic = "force-static"`). A missing or invalid file bakes `"unknown"` (`website/lib/build-sha.ts`).
3. **Cloud Run.** `gcloud builds submit website --config=website/cloudbuild.yaml`. Image, secrets, and size stay in [`cloudbuild.yaml`](./cloudbuild.yaml): 1Gi, 1 CPU, min 1, max 10, concurrency 80. `--set-secrets` includes `ADMIN_TEAM_PASSWORD_HASH=ADMIN_TEAM_PASSWORD_HASH:latest`.
4. **Firestore rules only.** `firebase-tools@15.31.0` runs `firebase deploy --only firestore:rules --project defi-university-prod --non-interactive`. Indexes are not part of this step. The step fails the job (no `continue-on-error`).
5. **Project guards.** `gcloud config get-value project` and the service-account key `project_id` must both be `defi-university-prod`. `--project` is that hardcoded id. Do not pass `secrets.GCP_PROJECT_ID` into this command: the value is masked and may not match the key.
6. **Live verify.** The job reads `projects/defi-university-prod/releases/cloud.firestore`, loads that ruleset, and compares it to the repo file after normalizing CRLF. It fails if the live source still contains `uidMemberExists`, lacks `emailVerified()`, or differs from the file. The access token is unset after the check.

7. **Live site check.** The job polls `https://defiuniversity.xyz/api/version` for up to two minutes and fails unless it reports the deployed SHA.

`GCP_SA_KEY` needs the roles listed in the cutover steps above, including `roles/firebase.admin` and `serviceusage.services.use`.

### Rules this publish enforces

Source: [`database/security-rules.rules`](../database/security-rules.rules). Client SDKs never see coaching docs or login lockout counters.

- Email-keyed membership. `emailVerified()` requires `request.auth.token.email_verified == true`. There is no UID member lookup.
- `isPaidMember()` is a verified email member whose `tier` is `skool`, `coaching`, or `paid`.
- `content`: `access == 'public'` is public. `access == 'member'` requires any verified member doc. Missing or unknown `access` requires `isPaidMember()`.
- `courses`: a published doc with `access == 'public'` is public. Published `access == 'member'` requires `isPaidMember()` (stricter than content). Missing or unknown `access` requires `isPaidMember()`.
- `coaching_packages`, `client_records`, `coaching_sessions`, `contract_signatures`, `admin_login_attempts`, `crm_contacts`, and `crm_import_batches` are deny-all for clients. Cloud Run uses the Admin SDK.

## What a main push does not ship

**Firestore indexes** (`database/indexes.json`). When an index changes, deploy indexes on their own:

```bash
firebase deploy --only firestore:indexes \
  --project defi-university-prod --non-interactive
```

**A manual Cloud Build** updates Cloud Run only. It does not publish or verify rules. It also does not write `website/BUILD_SHA`; `gcloud builds submit` without that file bakes `/api/version` as `{ "sha": "unknown" }`. Use it to retry the image, not as a substitute for the deploy workflow after `database/security-rules.rules` changes:

```bash
gcloud builds submit website \
  --config=website/cloudbuild.yaml \
  --project=defi-university-prod
```

Do not switch that command to `gcloud run deploy --source .`.

## Git hygiene

```bash
git remote -v
```

`origin` should point at `https://github.com/dzimmy89/defi-university-website.git`. After the cutover, do not push to Cursor Origin; a push there could redeploy old code if its Depot workflow is still on.

## Preflight

Run this on the tree you are about to merge. A dirty tree is not the SHA the workflow will pin.

```bash
git pull origin main
git status
./scripts/ci.sh
```

[`scripts/ci.sh`](../scripts/ci.sh) lints, builds, and runs `audit-email-pipeline.ts`, `test-email-capture.ts`, `test-reengagement.ts`, `test-cron-dry-run.ts`, `test-lead-firestore.ts`, `test-admin-login.ts`, `test-build-sha.ts`, `test-import-hubspot-contacts.ts`, and `test-manual-only-contact.ts`. Firestore rules tests and the HubSpot import commit/rollback emulator test run in the emulator (`firebase-tools@15.31.0`, project `demo-defi-university-rules`, rules from `database/security-rules.rules`) when Java is installed. If Java is missing and `CI` is unset, the script warns and skips those tests. If `CI` is set, a missing JRE fails the script. GitHub CI (`.github/workflows/ci.yml`) always runs that emulator step with Java 21.

Do not merge a rules change that has not passed that emulator suite. Optional: `cd website && npm run start` and walk routes locally.

## HubSpot sales-list import

Operator script (dry-run by default). Contacts land only in `crm_contacts` with `salesList=hubspot`, `manualOnly=true`, and `canonicalEmail` (Gmail dots/plus/googlemail collapsed). No leads, members, flows, emailLog, or email_suppressions writes. Opt-outs and bounces are flags on `crm_contacts` only. Discovery Calendar insert/patch/delete uses `sendUpdates: none` and omits the guest attendee when `isManualOnlyContact` is true, so Google does not email the invite.

Column maps cover HubSpot backup headers (`hs_email_bounce`, `hs_object_id`, `hs_lead_status`) and the enriched export (`overall_rank`, `private_client_fit_score`, `likely_package`, `email_bounced`, `do_not_contact`, `is_internal`). `is_internal` is imported with `internal: true` (and `manualOnly: true`) so those addresses are blocked from automated sends. Excluded harness domains still skip. Do not commit real CSVs.

**Lead capture still writes `leads` and attribution for a listed contact; sends stay blocked.**

There is no audited admin API in this PR to clear `manualOnly`. Operator step (Admin SDK / Firestore console only):

1. Confirm the contact should receive automated mail.
2. Set `crm_contacts/{email}.manualOnly` to the boolean `false` (not a string). Missing, null, or any other value continues to block.
3. Record who changed it, when, and the before/after values in the ops log. Re-importing the same HubSpot batch will set `manualOnly` back to `true`.

Edit `COLUMN_MAP` at the top of [`website/scripts/import-hubspot-contacts.ts`](./scripts/import-hubspot-contacts.ts) if your export headers differ. Do not commit real CSVs.

Offline dry-run (no credentials):

```bash
cd website
npx tsx scripts/import-hubspot-contacts.ts \
  --contacts scripts/fixtures/hubspot-contacts.csv \
  --enriched scripts/fixtures/hubspot-enriched.csv \
  --passed scripts/fixtures/hubspot-passed.csv \
  --outreach scripts/fixtures/hubspot-outreach.csv \
  --snapshot scripts/fixtures/hubspot-snapshot.json \
  --out /tmp/hubspot-import-report
```

Commit requires `--commit --batch-id <id> --yes` and application-default credentials. Rollback: `--rollback --batch-id <id>`. See [`website/scripts/README-import-hubspot-contacts.md`](./scripts/README-import-hubspot-contacts.md).

## Postflight

- https://defiuniversity.xyz/api/health
- `curl -sf https://defiuniversity.xyz/api/version` — JSON `{ "sha": "<40 hex>" }` must match `git rev-parse origin/main`
- https://defiuniversity.xyz/
- https://defiuniversity.xyz/skool
- https://defiuniversity.xyz/coaching
- https://defiuniversity.xyz/coaching/pay
- https://defiuniversity.xyz/admin/login
- Optional: `./scripts/crm-smoke-lead.sh https://defiuniversity.xyz`

## Rollback

Route traffic to the previous Cloud Run revision. That does not roll Firestore rules back. To undo rules, revert the rules commit and let the deploy workflow publish it, or deploy the previous `database/security-rules.rules` with the same `firebase deploy --only firestore:rules` command the workflow uses.

```bash
gcloud run services update-traffic defi-university-website \
  --region=us-central1 \
  --project=defi-university-prod \
  --to-revisions=PREVIOUS_REVISION=100
```

## Admin login

Password sign-in is `POST /api/admin/login`. Google sign-in is `POST /api/admin/login/google`. Both require `Content-Type: application/json` and a trusted origin (`website/lib/auth/admin-login-request-guards.ts`).

| | |
|---|---|
| Password username | `defi_u_team` (`ADMIN_TEAM_USERNAME`). Not the `ADMIN_USERNAME` secret. |
| Password check | bcrypt compare against `ADMIN_TEAM_PASSWORD_HASH` |
| Hash missing or not bcrypt | HTTP 403 `{ "error": "Password sign-in is disabled" }` |
| Bad password | HTTP 401 `{ "error": "Invalid credentials" }` |
| Lockout | Per-IP: 5 failures in 15 minutes → 15 minute 429 (`ADMIN_LOGIN_MAX_FAILURES`). Username `user:defi_u_team`: hard lock at 40 failures in 15 minutes (`ADMIN_LOGIN_USERNAME_MAX_FAILURES`). Locked requests are refused before bcrypt compare. Client IP is the next-to-last `X-Forwarded-For` hop (Google ALB appends client then LB IP). Keys are `user:defi_u_team` and `ip:<client ip>` in `admin_login_attempts`. A Firestore error is treated as locked. |
| Length caps | Username ≤ 64 characters. Password ≤ 72 UTF-8 bytes. Over-length is an invalid attempt (it counts toward lockout) and is not truncated before bcrypt. |
| Google | Firebase ID token. Email must be on `ADMIN_GOOGLE_ALLOWLIST` (Cloud Run sets `hello@defiuniversity.xyz`). Google sign-in does not touch the lockout collection. |
| Session | Cookie `defi_admin_session`, 12 hours, `HttpOnly`, `SameSite=Lax`, `Secure` in production. Signed with `JWT_SECRET` only. In production (`NODE_ENV=production`) a missing or blank `JWT_SECRET` has no fallback: password and Google login return 503 `{ "error": "Admin session is unavailable" }`, and `verifyAdminSession` treats the session as invalid so `/admin` redirects and `/api/admin` routes return 401. Non-production still uses a fixed local fallback when `JWT_SECRET` is unset. |

Allowed origins are the exact values `https://defiuniversity.xyz`, `https://www.defiuniversity.xyz`, and the origin of `NEXT_PUBLIC_SITE_URL` / `SITE_ORIGIN`. A missing `Origin` is accepted only when `Sec-Fetch-Site` is `same-origin`, or when `Referer`'s origin is on that list. `curl` with no `Origin` gets 403. Loopback origins are allowed only when `NODE_ENV` is not `production`.

`?next=` must be a relative path under `/admin` (optional simple query). Anything else lands on `/admin`.

`website/cloudbuild.yaml` mounts `ADMIN_TEAM_PASSWORD_HASH=ADMIN_TEAM_PASSWORD_HASH:latest` along with `ADMIN_USERNAME` and `ADMIN_PASSWORD`. The remaining ops check is that the Secret Manager value is a real bcrypt hash (`$2a$` / `$2b$` / `$2y$` plus a 53-character body). A missing or non-bcrypt value makes password sign-in return 403. `ADMIN_USERNAME` and `ADMIN_PASSWORD` are not the Mission Control team password. Do not commit the plaintext password.

Shell check (send `Origin`; the password is the plaintext that matches the hash):

```bash
curl -sf -c /tmp/dfu-admin.txt -X POST https://defiuniversity.xyz/api/admin/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://defiuniversity.xyz" \
  -d '{"username":"defi_u_team","password":"..."}'
```

[`scripts/smoke-admin-overview.sh`](../scripts/smoke-admin-overview.sh) posts `$ADMIN_PASSWORD` as the login password and does not send `Origin`, so that script 403s against the current route until the call matches the hash and the origin allowlist.

---

Production hosting: **Google Cloud Run** (`defi-university-website`)  
Domain: **https://defiuniversity.xyz**

## Pre-deploy checklist

1. Course content is committed under `content/learn` and `public/learn/figures`. To update it from TheNode-University, run `npm run import:courses -- /path/to/thenode-university` (gamification branch), then re-theme figures with `node scripts/learn-figures/retheme.mjs`.
2. Run local build: `npm run build` (expect static pages including `/university/*`)
3. Run production server: `npm run start`
4. Verify all routes (see `DESIGN-QA.md`)
5. Run Lighthouse: target performance > 90, accessibility > 90
6. Run coaching config check: `npx tsx scripts/test-coaching-config.ts`
7. Run e-sign engine tests: `npx tsx scripts/test-esign-engine.ts`
8. Seed coaching packages: `npx tsx scripts/seed-coaching-packages.ts`

## Coaching platform — one-time setup

### Stripe

**From GitHub Actions (recommended):** run **Coaching setup (Stripe prices and packages)** from the Actions tab (`.github/workflows/coaching-setup.yml`). `dry-run` only prints what it would do. `apply` creates or reuses the Stripe Prices, points the `STRIPE_PRICE_*` secrets at them, and writes the packages from `content/site-fallback.ts` to Firestore `coaching_packages` (overwriting those fields in Admin > Coaching > Packages). It reads the Stripe key from the `STRIPE_SECRET_KEY` repository secret if set, otherwise from Secret Manager, and authenticates with `GCP_SA_KEY`, so that service account needs Secret Manager access (read, add versions, set IAM on the price secrets) and Firestore write access.

**From a terminal:** creates live products, prices, and webhook idempotently:

```bash
export STRIPE_SECRET_KEY="$(gcloud secrets versions access latest \
  --secret=STRIPE_SECRET_KEY --project=defi-university-prod)"
cd website
npx tsx scripts/setup-coaching-stripe.ts --apply-secrets
```

Requires `sk_live_...` in Secret Manager. Re-run safely — existing resources tagged with `dfu_source=coaching` metadata are reused.

**Manual setup:** create nine Price objects in the Stripe dashboard:
   - `STRIPE_PRICE_FOUNDATIONS_FULL` (Kickstart, $750 one-time)
   - `STRIPE_PRICE_FOUNDATIONS_3PAY` (Kickstart, $250 × 3 subscription)
   - `STRIPE_PRICE_FOUNDATIONS_6PAY` (Kickstart, $125 × 6 subscription)
   - `STRIPE_PRICE_MASTERY_FULL` (Operator, $2,500 one-time)
   - `STRIPE_PRICE_MASTERY_3PAY` (Operator, $834 × 3 subscription)
   - `STRIPE_PRICE_MASTERY_6PAY` (Operator, $417 × 6 subscription)
   - `STRIPE_PRICE_INSTITUTIONAL_FULL` (Inner Circle, $7,500 one-time)
   - `STRIPE_PRICE_INSTITUTIONAL_3PAY` (Inner Circle, $2,500 × 3 subscription)
   - `STRIPE_PRICE_INSTITUTIONAL_6PAY` (Inner Circle, $1,250 × 6 subscription)
2. Add each Price ID to Secret Manager (see below).
3. Create a Stripe webhook endpoint pointing at `https://defiuniversity.xyz/api/webhooks/stripe` for events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### Google Calendar

Production uses **`dfu-workspace@defi-university-prod.iam.gserviceaccount.com`** for domain-wide delegation.

| Setting | Value |
|---------|-------|
| Service account | `dfu-workspace@defi-university-prod.iam.gserviceaccount.com` |
| Domain-wide delegation Client ID | `111635877902307714822` |
| Impersonation subject | `hello@defiuniversity.xyz` |
| Required scopes | `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/gmail.send` |
| Secret format | Raw JSON in `GOOGLE_SERVICE_ACCOUNT_KEY` (not base64) |

**Automated setup (recommended):** creates the Discovery Calls calendar and writes secrets idempotently:

```bash
export GOOGLE_SERVICE_ACCOUNT_KEY="$(gcloud secrets versions access latest \
  --secret=GOOGLE_SERVICE_ACCOUNT_KEY --project=defi-university-prod)"
cd website
npx tsx scripts/setup-coaching-calendar.ts --apply-secrets
```

Requires domain-wide delegation with `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/gmail.send` for the service account Client ID, impersonating `hello@defiuniversity.xyz`.

Firestore uses the Cloud Run runtime service account (ADC), not `GOOGLE_SERVICE_ACCOUNT_KEY`.

**Manual setup:**

1. Ensure the service account (in `GOOGLE_SERVICE_ACCOUNT_KEY`) has domain-wide delegation for the `calendar` scope on `hello@defiuniversity.xyz`.
2. Set `COACH_CALENDAR_ID` to the coach's primary calendar (usually the same as `SENDER_EMAIL`) or a dedicated `@group.calendar.google.com` ID.

### GCS contracts bucket

```bash
gcloud storage buckets create gs://defi-university-prod-contracts \
  --project=defi-university-prod \
  --location=us-central1 \
  --uniform-bucket-level-access
gcloud storage buckets add-iam-policy-binding gs://defi-university-prod-contracts \
  --member="serviceAccount:defi-university-prod@appspot.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

### Secret Manager

Create or update the following secrets. The `cloudbuild.yaml` `--set-secrets` flag already wires these in.

```bash
# Stripe
echo -n "sk_live_..." | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo -n "whsec_..." | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-
echo -n "price_..." | gcloud secrets create STRIPE_PRICE_FOUNDATIONS_FULL --data-file=-
echo -n "price_..." | gcloud secrets create STRIPE_PRICE_MASTERY_FULL --data-file=-
echo -n "price_..." | gcloud secrets create STRIPE_PRICE_MASTERY_3PAY --data-file=-
echo -n "price_..." | gcloud secrets create STRIPE_PRICE_INSTITUTIONAL_FULL --data-file=-
echo -n "price_..." | gcloud secrets create STRIPE_PRICE_INSTITUTIONAL_3PAY --data-file=-
echo -n "price_..." | gcloud secrets create STRIPE_PRICE_INSTITUTIONAL_6PAY --data-file=-

# Calendar + contracts
echo -n "hello@defiuniversity.xyz" | gcloud secrets create COACH_CALENDAR_ID --data-file=-
echo -n "America/New_York" | gcloud secrets create COACH_TIMEZONE --data-file=-
echo -n "David Zimmerman" | gcloud secrets create COACH_NAME --data-file=-
echo -n "defi-university-prod-contracts" | gcloud secrets create CONTRACTS_GCS_BUCKET --data-file=-
echo -n "7" | gcloud secrets create CONTRACT_SIGN_TOKEN_TTL_DAYS --data-file=-
```

Existing secrets already wired: `CRON_SECRET`, `INTERNAL_WEBHOOK_SECRET`, `JWT_SECRET`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `MAILING_ADDRESS`, `ADMIN_TEAM_PASSWORD_HASH`. `ADMIN_USERNAME` and `ADMIN_PASSWORD` are still mounted by Cloud Build; they are not the Mission Control team password. See [Admin login](#admin-login).

### Firestore indexes + security rules

Rules publish on the GitHub `main` deploy workflow (`--only firestore:rules`). Indexes do not. See [What a main push ships](#what-a-main-push-ships). Client SDKs cannot read `coaching_packages`, `client_records`, `coaching_sessions`, `contract_signatures`, or `admin_login_attempts`.

### CRM smoke (post-deploy)

```bash
./scripts/crm-smoke-lead.sh https://defiuniversity.xyz
```

Admin overview: use the `curl` in [Admin login](#admin-login). `scripts/smoke-admin-overview.sh` does not send `Origin` and treats `ADMIN_PASSWORD` as the login password.

Direct service URL (pre-DNS):  
https://defi-university-website-nmgwejn4ta-uc.a.run.app

## DNS cutover

Follow [infra/gcp/MIGRATION-RUNBOOK.md](../infra/gcp/MIGRATION-RUNBOOK.md):

1. Point `defiuniversity.xyz` and `www.defiuniversity.xyz` A records to load balancer IP
2. Verify SSL cert `defi-university-website-cert` is ACTIVE
3. Remove custom domain from Firebase `defi-university-app` hosting
4. Smoke test all routes on production

## Post-deploy verification

### Public site

- [ ] https://defiuniversity.xyz/ — home, path selector
- [ ] https://defiuniversity.xyz/skool — pricing, curriculum
- [ ] https://defiuniversity.xyz/coaching — redesigned marketing page (13 sections, 3 packages, pricing toggle)
- [ ] https://defiuniversity.xyz/coaching/book — native Google Calendar booking
- [ ] https://defiuniversity.xyz/coaching/apply — Inner Circle application form
- [ ] https://defiuniversity.xyz/coaching/portal-access — magic-link portal entry
- [ ] https://defiuniversity.xyz/coaching/sign/[token] — contract signing page (token-gated)
- [ ] https://defiuniversity.xyz/portal/[token] — client portal (token-gated)
- [ ] https://defiuniversity.xyz/success?tier=coaching&package=foundations — coaching-aware success page
- [ ] https://defiuniversity.xyz/cancel?tier=coaching — coaching-aware cancel page
- [ ] https://defiuniversity.xyz/cancel — checkout cancel
- [ ] https://defiuniversity.xyz/university — 5-course catalog
- [ ] https://defiuniversity.xyz/university/defi-concepts — syllabus (12 lessons)
- [ ] Sample lesson — podcast, video, GCS images render
- [ ] https://defiuniversity.xyz/university/investor-mindset/quizzes/module-01 — quiz works
- [ ] https://defiuniversity.xyz/university.html — redirects to `/university`
- [ ] Nav shows **University** link; Skool curriculum links to `/university/[courseId]`
- [ ] Legacy redirects: `/privacy-policy` → `/privacy`, `/coaching.html` → `/coaching`
- [ ] GTM events fire on package clicks (`coaching_package_click`), checkout starts (`begin_checkout`), and discovery bookings (`coaching_discovery_booked`)

### Admin CRM (https://defiuniversity.xyz/admin)

Sign in as `defi_u_team` with the team password, or with the allowlisted Google account. See [Admin login](#admin-login). Password sign-in returns 403 if the mounted `ADMIN_TEAM_PASSWORD_HASH` is missing or is not a bcrypt hash.

- [ ] https://defiuniversity.xyz/admin — grouped sidebar nav, action widgets (overdue, discovery calls, recent sends), pipeline summary
- [ ] https://defiuniversity.xyz/admin/people — search, filters, pagination; row links to detail
- [ ] https://defiuniversity.xyz/admin/people/[email] — structured timeline + properties (no JSON dump)
- [ ] https://defiuniversity.xyz/admin/coaching — metrics bar, column $ totals, board/list toggle, smart views, stage-change dialogs
- [ ] https://defiuniversity.xyz/admin/coaching/[clientId] — timeline-first layout, onboarding checklist, person cross-link
- [ ] Mobile (`< lg`): pipeline list fallback, sidebar sheet nav
- [ ] https://defiuniversity.xyz/admin/coaching/clients — searchable clients table
- [ ] https://defiuniversity.xyz/admin/coaching/sessions — session notes + ICF log export
- [ ] https://defiuniversity.xyz/admin/coaching/sessions-calendar — month calendar view
- [ ] https://defiuniversity.xyz/admin/coaching/contracts — contracts list with PDF download
- [ ] https://defiuniversity.xyz/admin/coaching/packages — packages editor
- [ ] https://defiuniversity.xyz/admin/email/sends — sends with person links
- [ ] https://defiuniversity.xyz/admin/email/flows — flows (includes `coaching_post_call`)
- [ ] https://defiuniversity.xyz/admin/email/templates — templates with toast feedback
- [ ] https://defiuniversity.xyz/admin/broadcast — broadcast with toast feedback
- [ ] https://defiuniversity.xyz/admin/attribution — source counts + touchpoints
- [ ] `./scripts/crm-smoke-lead.sh https://defiuniversity.xyz`
- [ ] Admin login `curl` from [Admin login](#admin-login) returns `{ "ok": true }` and a follow-up `GET /api/admin/overview` with that cookie succeeds
- [ ] Cloud Scheduler jobs `process-flows` and `check-reengagement` (see `infra/gcp/README.md`)

### End-to-end coaching flow

- [ ] Book a discovery call as a test lead → confirm calendar invite + CRM pipeline card
- [ ] Apply for Inner Circle → confirm `coaching_applications` doc with status `applied`
- [ ] Trigger a contract from the CRM → confirm signing link email arrives
- [ ] Sign the contract → confirm signed PDF generates and downloads from CRM
- [ ] Issue a portal magic link → confirm portal tabs render (overview, sessions, book, documents, messages)
- [ ] Complete a Stripe checkout in test mode → confirm webhook creates `client_records` doc
- [ ] Export ICF log CSV → confirm rows match completed sessions
