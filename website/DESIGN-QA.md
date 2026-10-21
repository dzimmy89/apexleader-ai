# Design QA — Pre-Launch Checklist

Completed during Obsidian Ledger Evolved rebuild. Re-run before production deploy.

## Automated Skills (run after each vertical slice)

- [x] **Visual QA** — homepage and /cancel verified via browser; no JS console errors
- [x] **Responsive Audit** — 44px touch targets on nav, mobile menu, CTAs
- [x] **Dark-Mode Contrast** — dark-first OKLCH tokens, parchment on obsidian >7:1
- [x] **Accessibility Audit** — semantic landmarks, h1 hierarchy, FAQ aria-expanded

## Accessibility (WCAG AA)

- [x] Semantic landmarks: `<header>`, `<main>`, `<footer>`, `<nav aria-label>`
- [x] FAQ accordion: Radix UI with keyboard support
- [x] Mobile menu: `aria-expanded`, `aria-label` on toggle
- [x] Video links: descriptive `aria-label` on play buttons
- [x] Color contrast: parchment on obsidian (>7:1)
- [x] Focus states: visible on links and buttons
- [x] Touch targets: minimum 44px on interactive elements
- [x] `prefers-reduced-motion`: disables marquee and motion transforms

## Design Critique (Anti-Slop)

- [x] Distinctive typography (Syne + Newsreader) — no banned fonts
- [x] Cohesive Obsidian Ledger Evolved motif (kinetic gold rule, grain overlay)
- [x] Asymmetric bento layouts (PathSelector, PackageComparison, testimonial grid)
- [x] Left-aligned body text throughout
- [x] No purple gradients, pill buttons, or symmetric 3-card grids
- [x] Sharp editorial radius (2–4px)

## Performance

- [x] Lighthouse performance **99**, accessibility **96** (localhost production build, May 2026)
- [x] LCP 2.1s (target < 2.5s)
- [x] next/font for Syne, Newsreader, IBM Plex Mono (no render-blocking Google Fonts CSS)
- [x] Dynamic import for TestimonialRail on homepage
- [x] Next/Image with hqdefault thumbnails + lazy loading
- [x] Native Google Calendar booking on `/coaching/book`

## GTM

- [x] GTM-MQH7BFVF in layout
- [x] `skool_signup_click` and `coaching_click` events on CTAs

## Routes Verified

- [x] `/` — home, path selector, testimonials, FAQ
- [x] `/skool` — pricing, curriculum, schedule
- [x] `/coaching` — packages, native discovery booking
- [x] `/about`, `/testimonials`, `/success`, `/cancel`
- [x] `/privacy`, `/terms`, 404
- [x] Legacy redirects configured in `next.config.ts`

## Deploy

- [x] Cloud Run deploy SUCCESS (build `04ce7b3e`, May 2026)
- [ ] DNS cutover per `infra/gcp/MIGRATION-RUNBOOK.md` (manual step if not yet done)
