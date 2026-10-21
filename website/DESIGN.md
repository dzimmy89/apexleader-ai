---
colors:
  bg: oklch(22% 0.015 85)
  surface: oklch(95% 0.02 90)
  accent: oklch(78% 0.12 90)
  skool: oklch(62% 0.08 165)
  coaching: oklch(62% 0.11 85)
  skool_ink: oklch(46% 0.08 165)
  coaching_ink: oklch(48% 0.1 80)
fonts:
  display: Instrument Serif
  body: Libre Baskerville
  ui: IBM Plex Sans
  mono: Fira Code
motion:
  ease: cubic-bezier(0.22, 1, 0.36, 1)
  tokens: lib/motion.ts
  reduced_motion: required
libraries:
  coss_ui: components/ui
  motion: motion/react
---

# DeFi University — Design System

**Direction:** Editorial Vault (Direction C — selected)

## Purpose
Convert visitors to the **DeFi University membership on Skool** (one plan, $97/month, 7-day free trial) or, as a separate offer, a free 30-minute **private coaching** call on `/coaching/book`. Education-first, not financial advice. Every member gets the Monday, Wednesday, and Friday live calls. Confirm times on the Skool Calendar. The free University courses are the first rung of the offer ladder.

## Audience
Serious learners seeking direct access to live DeFi Q&A and structured education with a luxury print-journal experience.

## Impression Level
**5 — Spectacular:** Immersive, pixel-perfect editorial layout with warm charcoal and parchment insets.

## Theme Mode
Warm charcoal base (`#1a1814`), parchment inset surfaces (`#f5f0e6`), foil gold accents.

## Aesthetic Direction: Editorial Vault

Luxury financial journal meets modern academy. Magazine column rules, section folios (`§ 01`), hanging quotes, asymmetric photo/text blocks, and David's portrait in a parchment frame.

### Differentiation Hook
**Foil Rule + Parchment Insets** — horizontal gold gradient dividers anchor the layout; key content blocks sit on warm parchment surfaces against deep charcoal page backgrounds.

## Typography

| Role | Font | Usage |
|------|------|-------|
| Display | **Instrument Serif** (400) | Headlines, hero statements, stat numerals, card titles |
| Body | **Libre Baskerville** (400, 700) | Reading text: paragraphs, lessons, legal, the agreement |
| UI | **IBM Plex Sans** (400, 500, 600) | Everything acted on or scanned: nav, buttons, labels, forms, chips, tables, meta lines, captions |
| Mono | **Fira Code** (400, 500) | Code, wallet addresses, hashes, aligned numbers only |

The type scale lives in `styles/tokens.css` (`--text-display` down to `--text-label`). Browsers get the UI font on `button`, `input`, `select`, `textarea`, `label`, `table`, `nav` and `summary` by default; `.ui-surface` switches a whole block to it and `.prose-serif` / `.lesson-prose` switch reading text back to the serif.

**Hierarchy rule (October 2026):** the old treatment, 12px mono capitals with wide tracking for every label, button and eyebrow plus a gold hairline under every row, made every surface read at one weight. Now: one headline per screen, one gold primary action per view, secondary actions outlined, tertiary as text links. Section labels are `.section-eyebrow`; form labels are `.field > label`; buttons are `.btn` in sentence case at 48px. Structure comes from space, panels and type size; lines appear only between rows inside a panel. Gold is for actions and the active item, never for card borders.

**Banned:** Inter, Roboto, Arial, Space Grotesk, Syne, Newsreader as primary.

## Color System

```css
--color-bg: oklch(22% 0.015 85);          /* warm charcoal */
--color-surface: oklch(95% 0.02 90);      /* parchment panels */
--color-accent: oklch(78% 0.12 90);       /* foil gold */
--color-skool: oklch(62% 0.08 165);       /* 4.95:1 on charcoal and under charcoal button text */
--color-coaching: oklch(62% 0.11 85);
--color-skool-ink: oklch(46% 0.08 165);   /* small Skool text and tags on parchment, 5.9:1 */
--color-coaching-ink: oklch(48% 0.1 80);  /* small gold text on parchment, 5.7:1 */
```

Status and secondary colours: `--color-success` (green), `--color-warning` (gold), `--color-danger` (red), `--color-info` (blue), each with an `-ink` tone for parchment and a `-subtle` fill. Neutral lines are `--color-border` (and `-muted` / `-strong`), no longer gold. Panels on the charcoal page use `--color-panel` and `--color-panel-raised`. Secondary text is `--color-text-muted` (brighter than before) and only truly incidental text uses `--color-text-faint`.

## Hierarchy system

Shared classes in `app/globals.css` (`@layer components`) with matching React primitives in `components/system/index.tsx`:

| Class / component | Use |
|-------------------|-----|
| `.page-header`, `.page-title`, `.page-intro` / `PageHeader` | Eyebrow, H1, one intro line, the page's one primary action on the right |
| `.section-eyebrow`, `.ui-label` | Small sans labels above a section or a group of rows |
| `.panel`, `.panel-raised`, `.panel-head`, `.panel-title`, `.panel-body`, `.panel-foot` / `Panel` | A block on the charcoal page; one `.parchment-card` per screen for the single most important block |
| `.row`, `.row-label`, `.row-value` / `Row` | A list row inside a panel; rows separate with one line |
| `.chip` + `-success` `-warning` `-danger` `-info` `-skool` / `Chip` | Status: done or active (success), due or waiting (warning), problem or overdue (danger), locked or neutral (default) |
| `.notice` + tones / `Notice` | An inline message with a title line |
| `.stat`, `.stat-value`, `.stat-label` / `Stat` | A number that matters: display numeral over a small sans label |
| `.btn` + `-primary` `-secondary` `-ghost` `-danger` `-skool`, sizes `-sm` `-lg`, `-block`, `-wrap` / `Button`, `ButtonLink`, `CTAButton` | 48px sans semibold buttons; gold primary, outlined secondary, green for Skool |
| `.field`, `.field-label`, `.field-hint`, `.input`, `.checkbox` | Forms |
| `.subnav` / `SubNav` | In-page anchors (the account) |
| `.empty` / `EmptyState`, `.meter` / `Meter` | Empty blocks and progress |

Inside `.parchment-card` or `.on-parchment`, chips, buttons, inputs and lines re-tint themselves; text still uses the on-parchment tokens.

## Dual-Surface Rule

- **Dark backgrounds:** use `--color-text` and `--color-text-muted`
- **Parchment backgrounds:** use `--color-text-on-parchment` and `--color-text-muted-on-parchment`
- **Brand hues on parchment:** `--color-skool` and `--color-coaching` fall under 4.5:1 there. Use the `-ink` tokens for any text under 24px; the base hues are fine for large display numerals and decorative icons.

## Spacing & Shape

- Base unit: 4px
- Section padding: `clamp(3rem, 8vw, 6rem)`
- Radius: **0px** everywhere (sharp editorial)
- No pill buttons, no rounded-full

## Server-visible rule

Everything a crawler or a slow phone needs is in the server HTML: the H1, prices and stats, FAQ answers (`hiddenUntilFound`), and verified quotes. Nothing above the fold starts at `opacity: 0` in the server HTML.

## Motion

Tokens live in `lib/motion.ts`: ease `[0.22, 1, 0.36, 1]`, durations 0.16 / 0.24 / 0.48 s, springs `snap`, `settle`, and `dialog`.

1. Page load: `.load-rise` CSS keyframes (transform only, `--load-delay` per line), so the H1 paints without JavaScript.
2. Scroll: `SectionReveal` is visible in the server HTML; after hydration it animates only sections still below the viewport.
3. Hover: CTAs lift 2px with `snap`; the faces strip spreads.
4. Selectors: the stories filter and payment toggle slide an indicator via `layoutId`; both are radiogroups with arrow-key navigation.
5. Clip dialog: poster triggers expand into the player (FLIP via the Web Animations API); text triggers scale in.
6. Sticky CTA (mobile): slides up once every `[data-sticky-guard]` element (hero CTAs, the membership card, lead forms, final CTA, footer) is off screen.
7. Nothing loops: no marquee, ticker, or shimmer.
8. Reduced motion: no transforms or shared layout; 120ms cross-fades, instant dialog, sticky CTA without a slide.

## Components

| Component | Notes |
|-----------|-------|
| SiteNav / MobileMenu | Sticky header, sans nav links with the current page in gold, "Join on Skool" as a green button, Sign in or Account outlined; foil rule beneath. MobileMenu is a Base UI dialog under the header |
| SiteFooter | Three sans link columns and the disclaimer as a muted paragraph |
| editorial/PortraitHero | Marketing hero: H1, subhead, two CTAs, portrait (mobile shows a small portrait chip) |
| editorial/SectionHeading | Folio, eyebrow, H2, intro; `surface="parchment"` switches to ink colors |
| editorial/FounderBlock, FinalCta, FaqSection, StickyCta | Shared page endings; FAQ heading sits beside the questions |
| ladder/OfferLadder | Three rungs: free, membership ($97), private coaching |
| group/WeekTimetable | Mon/Wed/Fri member live calls; columns on desktop, a day list on phones |
| stories/ClipCard, FeaturedClip, ClipQuote | Verified clips; pull quotes play in place |
| stories/ClipPlayer | Base UI dialog; MP4 with captions on, or a youtube-nocookie embed |
| stories/StoriesSection, StoriesFilter, FacesStrip | Story blocks; the filter keeps every card in the HTML |
| Hero | Text hero for About and University |
| CTAButton | A `.btn` link in sentence case; `coaching` is the gold primary, `skool` green, `ghost` outlined; sizes sm / md / lg; tracks by href and variant |
| system/* | PageHeader, Panel, Chip, Notice, Stat, Row, EmptyState, Meter, Button, ButtonLink, SubNav (see Hierarchy system) |
| TrackedLink / SkoolJoinLink | Text links that fire `internal_cta_click` / `skool_signup_click` |
| FAQAccordion | Serif questions on panel rows with a chevron; answers in reading text; `hiddenUntilFound` |
| Coss UI | Base UI accordion, dialog, select in `@/components/ui` |
| CalendarPicker | Discovery booking on parchment (`surface="parchment"`) or session booking on the account panel (`surface="dark"`, `accountBooking`); day and time choices are 48px sans options with a gold selected state |
| University/* | Library, course page and lesson viewer on the charcoal page: panel cards, sans outline and "On this page" with the current item on a gold bar, serif reading text, one gold primary per screen |
| account/* | /account is the member and coaching-client home: page header with status chips and the one next-step button, in-page sub nav, coaching area (sessions, syllabus, documents, messages), courses, billing, settings |
| coaching/ContractSigner, SignaturePad | The agreement in `.contract-prose` on parchment, a parchment signature card, one gold Sign agreement button |

## Testimonials

Only clips in `content/testimonials.ts` marked `verified: true` render, each with a verbatim quote, its timestamp, who verified it, and when. The catalog is `server-only`; client components receive `ClipView` props. Media lives in `gs://dfu-public-media/testimonials/<person>/<clip>-vN.{mp4,jpg,vtt}` with immutable cache headers, so a changed clip gets a new version suffix rather than an overwrite. No Review or AggregateRating markup.

## University course library

Open-access SSG routes under `/university`:

| Route | Purpose |
|-------|---------|
| `/university` | 5-course catalog |
| `/university/[courseId]` | Syllabus with module groupings |
| `/university/[courseId]/lessons/[lessonSlug]` | Lesson viewer (markdown, KaTeX, GCS media) |
| `/university/[courseId]/quizzes/[moduleId]` | Interactive module quizzes |

**Content:** 31 Learn courses (8 stages) are imported from TheNode-University into `content/learn/` by `scripts/import-learn-courses.ts`; figures live in `public/learn/figures/`. Lesson, exercise and quiz pages render at request time so access can be checked (Stage 1 needs a sign-in, later stages need the membership or coaching).

**Courses:** DeFi Concepts, Investor Mindset, Concentrated Liquidity Provision, DeFi Money Markets, Perpetual Futures Trading.

## Constraints

- Next.js 15 App Router, Tailwind v4, WCAG AA on both surfaces
- GTM events: `skool_signup_click` (external Skool links only; membership CTAs send `plan_id: membership`, `value: 97`), `coaching_click`, `internal_cta_click`, `testimonial_play`, `sticky_cta_click`, plus the coaching package, checkout, and lead events. Every CTA passes a `location`.

## Rejection Clause

Halt if code defaults to Obsidian OKLCH tokens, ledger-line motifs, grain overlay, or banned fonts.
