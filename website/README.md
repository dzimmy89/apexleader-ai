# ApexLeader.ai Website

Next.js 15 site and coaching platform for [apexleader.ai](https://apexleader.ai): private 1-on-1 AI coaching for business owners.

## What is here

- **Public site:** home, `/coaching` (packages), `/coaching/book` (free discovery call), `/coaching/pay` (Stripe checkout or an invoice by email), `/university` (course library), `/about`, `/privacy`, `/terms`.
- **Client account** (`/account`): sessions, booking, the published syllabus, documents, coaching agreement, plans and billing, Telegram messages to the coach.
- **Admin** (`/admin`): pipeline, clients, contacts, sessions, contracts, payments due, packages, syllabi, email flows.
- **Syllabus pipeline:** a discovery call transcript fills the intake form (Gemini), the confirmed intake drafts a week-by-week syllabus through the course library, the coach edits and publishes it, and progress is tracked from the client's lessons, exercises and quizzes.

## Where to change things

| What | Where |
| --- | --- |
| Business name, domain, email, coach, Telegram handle | `lib/brand.ts` |
| Packages and prices (seed values) | `content/site-fallback.ts`, then Admin → Coaching → Packages |
| Course library | `content/learn/catalog.json` and `content/learn/courses/<courseId>/{lessons,exercises,quizzes}/*.md` |
| Stage prerequisites, free stages, level defaults for the planner | `content/learn/catalog.json` (`prereqs`, `free`, `planner`) |
| Intake fields and Gemini prompts | `lib/coaching/intake.ts`, `lib/coaching/coaching-ai.ts` |
| Coaching agreements | `content/coaching-contracts/*.md` (drafts: have them reviewed) |
| Privacy and terms | `content/legal.ts` (drafts: have them reviewed) |
| Email templates and flows | `lib/email-templates.ts`, `lib/flow-definitions.ts` |

## Develop

```bash
npm install
npm run dev
```

Build locally with placeholder values:

```bash
ADMIN_PASSWORD=x JWT_SECRET=x NEXT_PUBLIC_SITE_URL=https://apexleader.ai \
NEXT_PUBLIC_FIREBASE_API_KEY=x NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=x NEXT_PUBLIC_FIREBASE_PROJECT_ID=x \
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=x NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=0 NEXT_PUBLIC_FIREBASE_APP_ID=x \
npm run build
```

Tests are plain scripts: `npx tsx scripts/test-<name>.ts`. CI runs the list in `.github/workflows/ci.yml`.

Deploying and the one-time account setup are in [DEPLOY.md](./DEPLOY.md).
