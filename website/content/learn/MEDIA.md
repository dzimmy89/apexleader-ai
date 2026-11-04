# Lesson media: infographics and video

Every lesson and exercise carries infographics and short videos, following
the same pattern as The Node's Learn standard (TheNode-University repo,
`docs/learn-rewrite/STANDARD.md` and `VIDEO_SESSIONS.md`), in the
FromAItoBusiness brand. Plan: https://claude.ai/artifact/Xjrwo1uuni9DaDzL35iYeV

## What each piece gets

| Piece | Video | Infographics |
| --- | --- | --- |
| Lesson | An `overview` clip (90 to 130 s) above the key concept, and two `inline` clips (60 to 90 s) at the lesson's two key ideas | 2, where a picture explains better than text |
| Exercise | An `exercise-setup` clip (40 to 55 s) after the bold meta line, ending on the task; an `exercise-reveal` clip (45 to 60 s) inside the example block | 1 showing the starting point, 1 showing a finished result inside the example block |

Exercises ask members to build something for their own business, so there is
no single right answer. The reveal shows a finished example for the sample
business, Rolling Ledger, inside an `:::example` block that stays closed until
the reader opens it. Nothing above that block may give the example away.

## Blocks

### `:::video`

```
:::video
id: as-l1-overview
kind: overview            # overview | inline | exercise-setup | exercise-reveal
status: paused            # paused until the clip, captions and poster are in the bucket
src: /learn/video/ai-sales/as-l1-overview.mp4
captions: /learn/video/ai-sales/as-l1-overview.vtt
poster: /learn/video/ai-sales/as-l1-overview.jpg
transcript: The narration, on one line.
:::
```

- Clip ids are `<course prefix>-l<n>-<idea>` for lessons and `<prefix>-ex<n>-setup` / `-reveal` for exercises.
- Paths are always `/learn/video/<course id>/<clip id>.<ext>`. CI checks this.
- A slot renders only with `status: ready`. A ready slot needs src, captions, poster and transcript.
- In production the page signs each path against the private bucket (`LEARN_VIDEO_BUCKET`), and only for readers who can open the piece. Locked previews never carry clips. With no bucket set, production shows no players, and local dev plays files from `public/learn/video/` (gitignored).

### `:::infographic`

```
:::infographic
id: fig-1
type: flow                # flow | comparison | timeline | diagram | chart | anatomy
title: Agents draft, you approve
shows: Three cards left to right: the research agent finds 30 food truck owners, the sales agent drafts one email each, and you approve on the paper card.
data: none                # or the numbers it plots
image: /learn/figures/ai-sales/lesson-01-fig-1.webp
alt: A research agent finds 30 food truck owners, a sales agent drafts one email each, and nothing sends until you approve.
:::
```

Until `image` is set the page shows a dashed "Infographic in production" card
with the title. `id`, `title` and `alt` are required.

### `:::example`

```
:::example
title: See an example result
A short paragraph on what a good finished result looks like.

:::video
...the exercise-reveal clip...
:::

:::infographic
...the finished-result figure...
:::
:::
```

## Making infographics

1. Write the slot brief in the lesson, then a source file
   `content/learn/figures/<course>/<lesson-or-exercise>-<fig id>.html` that
   links `scripts/learn/infographics/brand.css` and names its output in
   `<meta name="out" content="public/learn/figures/<course>/<name>.webp">`.
   `content/learn/figures/_sample/` is a working example.
2. Icons are Lucide, as on the site: `node scripts/learn/infographics/icon.mjs search send`
   prints inline SVG to paste.
3. `node scripts/learn/infographics/render.mjs <files>` renders at 2.5x to WebP
   and fails on text under 26 px or anything outside the frame.
4. Set `image:` on the slot. The HTML stays in the repo, so a figure is fixed
   by editing its source and rendering again.

Brand rules for every figure:

| Part | Rule |
| --- | --- |
| Frame | `wide` 800 x 450 or `tall` 640 x 800, nothing under 26 px |
| Ground | Ink with the blueprint grid. At most one paper block, for the thing that matters most |
| Type | Bricolage Grotesque for big numbers and titles, Instrument Sans for labels, JetBrains Mono only for agent names and statuses |
| Colour | Signal orange for the one thing that moves the business forward. Marketing, sales and accounting figures add their track class (`fig wide sales`). Status colours always come with a word |
| Pictures | Lucide icons, agent cards, and real screenshots of the tools with the month they were captured. No emoji, robots, glowing brains, stock or AI-generated images, and no vendor logos |
| Words | Short labels in the lesson's own words. Every number matches the lesson; made-up numbers say "example" |
| Access | The alt text says what the picture shows, so the lesson reads without it |

## Making video

Clips follow The Node's clip studio rules (hook in the first 3 to 5 seconds,
every on-screen number computed from the lesson and said in the narration,
captions from the script's own words, no video-model drawing of text or
numbers), with two changes for this brand:

- The set is the brand's own picture: one founder's calm desk with agent
  cards, in ink, paper and signal orange.
- A `screen` shot plays a real screen recording of the tool for click-by-click
  steps, marked with the month it was captured.

Clips upload to the private bucket under the same path as their slot. Bucket
setup: `scripts/learn/setup-learn-video-bucket.sh` (run once by the owner).
