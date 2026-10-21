# Design Direction Proposals — DeFi University

Three aesthetic directions for defiuniversity.xyz marketing site. **Selected: Direction C — Editorial Vault.**

## Live Preview URLs

| Direction | Mockup |
|-----------|--------|
| **Hub (start here)** | [/design-preview](/design-preview) |
| **A — Obsidian Ledger Evolved** | [/design-preview/obsidian](/design-preview/obsidian) |
| **B — Terminal Academy** | [/design-preview/terminal](/design-preview/terminal) |
| **C — Editorial Vault** | [/design-preview/editorial](/design-preview/editorial) |

Run locally: `cd website && npm run dev` → http://localhost:3000/design-preview

---

## Direction A: Obsidian Ledger Evolved

| Attribute | Specification |
|-----------|---------------|
| **Audience** | DeFi-curious learners seeking structured, premium education |
| **Impression Level** | 4 — Expressive (memorable, opinionated, institutional trust) |
| **Theme Mode** | Dark obsidian base, parchment text, gold accent |

### Typography
- Display: **Syne** 700–800 — headlines, hero
- Body: **Newsreader** 400–500 — paragraphs, legal
- Mono: **IBM Plex Mono** 400 — stats, labels, micro UI

### Color (OKLCH)
```css
--color-bg: oklch(17.3% 0.01 250);        /* #07090d obsidian */
--color-text: oklch(91% 0.01 85);         /* #e6e2d8 parchment */
--color-accent: oklch(72% 0.12 85);       /* #c9a227 ledger gold */
--color-skool: oklch(62% 0.08 175);       /* teal community path */
--color-coaching: oklch(58% 0.10 75);     /* amber premium path */
```

### Signature Motif
**The Kinetic Ledger Line** — a 1px vertical gold rule that anchors asymmetric layouts, extends on scroll via motion, paired with enhanced paper grain overlay.

### Layout Philosophy
- Asymmetric 12-column bento grids (col-span-2 + col-span-1 pairings)
- Left-aligned body text throughout
- Sharp editorial radius (0–4px)
- Proof density via testimonial rail + stats bar

### Hero Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ [Nav: ledger line logo]              Community | Coaching → │
├─────────────────────────────────────────────────────────────┤
│ │                                                           │
│ │  MASTER DEFI                                              │
│ │  WITH STRUCTURE          [Stats: 150+ | 10hrs/wk | 4 courses] │
│ │                          ─────────────────────────────    │
│ │  Professional-grade      [Join Community] [Coaching →]    │
│ │  education, not hype.                                     │
│ │                                                           │
│ └─ gold ledger line                                         │
├─────────────────────────────────────────────────────────────┤
│  [Asymmetric bento: PathSelector 2-col + testimonial 1-col] │
└─────────────────────────────────────────────────────────────┘
```

**Rationale for selection:** Lowest migration cost, builds on existing components and brand recognition, aligns with compliance-forward institutional tone.

---

## Direction B: Terminal Academy

| Attribute | Specification |
|-----------|---------------|
| **Audience** | Quant-minded learners who want data-dense DeFi literacy |
| **Impression Level** | 3 — Balanced (restrained, trustworthy, terminal aesthetic) |
| **Theme Mode** | Near-black with green phosphor accents |

### Typography
- Display: **IBM Plex Mono** 600 — all headings monospace-first
- Body: **Source Serif 4** — long-form readability
- Mono: **JetBrains Mono** — code blocks, live data

### Color
- Background: `#0a0e0a` terminal black
- Accent: `#00ff41` phosphor green (muted to `#3ddc84` for WCAG)
- Text: `#c8c8c8` CRT gray

### Motif
Blinking cursor, scan-line overlay, block-grid data panels

### Hero Wireframe
Monospace hero with live-style stat ticker: `> DEFI_UNIVERSITY.init()` with command-line CTAs

---

## Direction C: Editorial Vault

| Attribute | Specification |
|-----------|---------------|
| **Audience** | Premium learners seeking luxury print-journal experience |
| **Impression Level** | 5 — Spectacular (immersive, pixel-perfect editorial) |
| **Theme Mode** | Warm parchment surfaces on deep charcoal |

### Typography
- Display: **Instrument Serif** — high-contrast editorial headlines
- Body: **Libre Baskerville** — classic long-form
- Mono: **Fira Code** — data callouts

### Color
- Background: `#1a1814` warm charcoal
- Surface: `#f5f0e6` parchment panels (inverted sections)
- Accent: `#d4af37` foil gold

### Motif
Magazine column rules, asymmetric photo/text blocks, drop caps

### Hero Wireframe
Full-bleed editorial spread with oversized serif headline spanning 8 columns, founder photo offset in column 9–12

---

## Next Step

Open the mockups at `/design-preview`, pick A, B, or C, then we update `DESIGN.md` and migrate the winning direction into production.
