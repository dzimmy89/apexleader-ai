# DeFi University Website

Next.js 15 marketing site for [defiuniversity.xyz](https://defiuniversity.xyz). The apex is canonical; `www` redirects for every path except `/api/*`.

## Quick start

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and review all routes before production deploy.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development with hot reload |
| `npm run build` | Production build verification |
| `npm run start` | Serve production build locally |
| `npm run lint` | ESLint |
| `npx tsx scripts/test-testimonials.ts` | Testimonial gate: verified clips, verbatim quotes, bucket media, no claim language |
| `npx tsx scripts/test-testimonial-build-grep.ts` | After `npm run build`: banned quotes never reach `.next/` |

## Routes

- `/` — Home: offer ladder, stories, group and private coaching, free courses
- `/skool` — Group coaching on Skool (Standard $7 / Premium $29 / VIP $97; 7-day free trial)
- `/coaching` — Private coaching (Kickstart $750 / Operator $2,500 / Inner Circle $7,500; ids stay foundations / mastery / institutional; free 30-minute call)
- `/testimonials` — Member and client stories (verified clips only; `noindex` while none are published)
- `/university` — Five free courses
- `/about`, `/success`, `/cancel`, `/privacy`, `/terms`

## Adding a story

1. Transcribe the clip locally, pick a verbatim quote, and note its timestamp. Quotes stay free of income, returns, and trade-instruction claims.
2. Upload the MP4, poster, face crop, and WebVTT captions to `gs://dfu-public-media/testimonials/<person>/<clip>-v1.*` with `Cache-Control: public, max-age=31536000, immutable`. Never overwrite an object; bump the version.
3. Add the clip to `content/testimonials.ts` with `verified: true`, `verifiedBy`, and `verifiedOn`, then run both testimonial tests.

## Design

See [DESIGN.md](./DESIGN.md) for the Editorial Vault design system.

## Deploy

Git host is Cursor Origin (`getrunway/defi-university-website`), not GitHub. A push to `main` runs the Depot production workflow (Cloud Run via `cloudbuild.yaml`, then Firestore rules). Follow [DEPLOY.md](./DEPLOY.md).
