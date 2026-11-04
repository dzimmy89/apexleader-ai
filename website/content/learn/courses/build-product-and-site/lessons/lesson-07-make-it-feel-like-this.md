---
module: 2
lesson_number: 7
course: build-product-and-site
template: v2
---

# Lesson 7: "Make It Feel Like This"

:::video
id: bp-l7-overview
kind: overview
status: paused
src: /learn/video/build-product-and-site/bp-l7-overview.mp4
captions: /learn/video/build-product-and-site/bp-l7-overview.vtt
poster: /learn/video/build-product-and-site/bp-l7-overview.jpg
transcript: The fastest way to tell an agent what you want is to show it. A screenshot with three arrows on it says more than a paragraph of adjectives. CleanShot X is a Mac screenshot tool that makes that quick: capture a whole page, draw arrows, write a note, blur anything private, and drop it straight into your agent. In this lesson you'll build a small folder of references for the Rolling Ledger site, mark what you like about each one, and ask the agent to take the feel, not the design, and keep your brand.
:::

:::key-concept
A **reference** is a picture of something whose feel you want: a site, an app, a printed menu, a receipt. An **annotated** reference has arrows and notes saying exactly what you like ("this much space", "labels this small"). Give the agent references **with** your design system skill, and ask it to take the **qualities** you marked, never the layout, words or images. **CleanShot X** is a Mac tool that makes capturing and marking up references fast; any screenshot tool with arrows and text works.
:::

## What you'll be able to do

- Capture full pages, parts of screens and your own site with CleanShot X or a free alternative
- Annotate a reference so the agent knows exactly what you like about it
- Blur anything private before a screenshot goes to an agent
- Brief an agent with references and your design system skill together
- Use the same method to report bugs on your own site

## Why this matters

"Make it feel more premium" means nothing to an agent, or to a designer. "Make the spacing like this, the labels this size, and only one colour accent, like here," with a picture, is something it can act on. Annotated references are how designers brief each other, and they work the same way with agents, which can read images.

There's a line to hold, though. "Feel like" is fine. "Copy this" isn't: other companies' layouts, words, photos and logos are theirs.

## Capture with CleanShot X

CleanShot X runs on Mac only. As of November 2026 it's sold as a one-time purchase (about $35, with a year of updates) or a Pro subscription with more cloud storage; check cleanshot.com on the day. The parts that matter here:

- **Area capture**: drag a box around part of the screen.
- **Scrolling capture**: one image of a whole long page, top to bottom.
- **Annotate**: arrows, boxes, numbered steps and text, straight after the capture.
- **Blur or pixelate**: hide names, emails and numbers before you share.
- **Capture text**: copy the words out of any screenshot.
- **Screen recording**: a short clip when a bug only shows up while you click.

Every capture can be dragged straight from its preview into a Claude Code, Codex or Cursor window.

**Not on a Mac?** Windows' Snipping Tool captures and marks up screens, and ShareX (free) adds scrolling capture. On a Mac without CleanShot, `Cmd+Shift+5` captures and the preview window has basic markup.

## Build a reference folder

Make a folder in your repo, `design/references/`. For Rolling Ledger, the founder collected six:

| Reference | What she marked |
|---|---|
| A chalkboard menu outside a taco truck | "Prices this big, items this short" |
| A paper fuel receipt | "Numbers line up on the right" |
| A banking app's month view | "One total at the top, details below" |
| A calm software pricing page | "This much white space between sections" |
| A ticket stub | "Small label, big number under it" |
| Her own current site | "This button is too far down on a phone" |

Notice that only two are websites. The best references for a food truck business come from the food truck world, which is the same advice the `frontend-design` skill gives.

For each one: capture it, then annotate it with **one to three** arrows and short notes. More than three and the agent can't tell what matters. Save it with a name that says what it's for: `numbers-right-aligned.png`.

:::infographic
id: fig-1
type: diagram
title: An annotated reference
shows: A simple drawing of a paper fuel receipt card with three coral arrows pointing to parts of it, each with a short note: "numbers line up right", "total is biggest", "lots of space above the total". A side note on the paper card reads "take the quality, not the design".
data: none
image: /learn/figures/build-product-and-site/lesson-07-fig-1.webp
alt: A fuel receipt with three annotations: numbers line up on the right, the total is the biggest number, and there is space above the total. The note says to take the quality, not the design.
:::

## Brief the agent

Drop two or three references into the chat with your request. Name the quality, the brand rule and the limit:

```text
Here are three references. From each, take only what's marked:
1. numbers-right-aligned.png - numbers line up on the right
2. one-total-at-top.png - one total at the top, details below
3. ticket-label.png - small label over a big number
Apply those qualities to the monthly summary page in the portal.
Use our design-system skill for every colour and font; it wins over
anything in the references. Don't copy any layout, words or images from
them. Draw it in Paper first so I can compare it with the references.
```

The last line links this lesson to Lesson 6: the agent draws on the Paper canvas, you look at the frame next to the references, and only then does it build.

:::video
id: bp-l7-references
kind: inline
status: paused
src: /learn/video/build-product-and-site/bp-l7-references.mp4
captions: /learn/video/build-product-and-site/bp-l7-references.vtt
poster: /learn/video/build-product-and-site/bp-l7-references.jpg
transcript: Here the Rolling Ledger founder takes a photo of a fuel receipt, opens it in CleanShot, and draws two arrows: numbers on the right, total biggest. She drags it into Claude Code with two more references. The agent draws the monthly summary in Paper: one big total at the top in coral, receipts listed below with amounts lined up on the right, in the brand's own fonts. It looks like Rolling Ledger, not like a receipt.
:::

## The same trick for bugs

Annotated screenshots are the best bug reports too. On your own site:

1. Capture the problem (scrolling capture for a whole page, a short recording for something that happens on click).
2. Draw one arrow and write what's wrong and what you expected: "Button is below the fold on a phone; should be visible without scrolling."
3. Blur any real customer details.
4. Drop it into the agent with "Fix this. Show me a screenshot of the fix at 390 wide."

:::infographic
id: fig-2
type: flow
title: Capture, mark, brief
shows: A left-to-right flow of four cards with Lucide icons: capture (camera), mark one to three things (pen), blur anything private (eye-off), brief the agent with the design system skill (send). The last card is the paper card.
data: none
image: /learn/figures/build-product-and-site/lesson-07-fig-2.webp
alt: Capture the reference, mark one to three things you like, blur anything private, then brief the agent together with your design system skill.
:::

:::warning
Screenshots go to the model, so blur names, emails, account numbers and anything from a customer's screen before you share them. And keep references as inspiration: never ask an agent to recreate another company's page, or to use its images, logo or words. "Feel like" a calm pricing page is fine; "make ours look exactly like theirs" is not.
:::

:::try-it
Find one thing in the physical world of your business, a menu, a receipt, a sign, a form, and take a photo. Mark one quality you'd want on your site. That's your first reference.
:::

:::checkpoint
Q: How many things should you mark on one reference?
- [ ] As many as you can see
- [x] One to three
- [ ] None; the agent will work it out
Why: With one to three marks the agent knows exactly what matters. More than that and it has to guess which ones you care about.
:::

:::checkpoint
Q: Your reference uses green, and your brand is ink, coral and cream. What should the agent do?
- [ ] Use green, since you liked the reference
- [x] Take only the marked qualities, and use the design system skill's colours
- [ ] Mix green into the brand
Why: The brief says the design system skill wins over anything in the references. You're borrowing a quality, not a palette.
:::

:::takeaways
- An annotated reference with one to three marks tells an agent more than a paragraph of adjectives.
- CleanShot X captures, scrolls, annotates and blurs on a Mac; Snipping Tool or ShareX do the job on Windows.
- Brief with references and your design system skill together, and ask for the quality, not the copy.
- Use the same method for bug reports, and blur anything private first.
:::

## Go deeper

- [CleanShot X](https://cleanshot.com) - features and pricing
- [ShareX](https://getsharex.com) - a free alternative for Windows
- [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) - why references from your subject's own world work better
