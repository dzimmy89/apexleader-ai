---
module: 2
lesson_number: 8
course: build-product-and-site
template: v2
---

# Lesson 8: Design Review Before Code

:::video
id: bp-l8-overview
kind: overview
status: paused
src: /learn/video/build-product-and-site/bp-l8-overview.mp4
captions: /learn/video/build-product-and-site/bp-l8-overview.vtt
poster: /learn/video/build-product-and-site/bp-l8-overview.jpg
transcript: A design problem caught on the canvas costs one sentence to fix. The same problem caught after the page is built costs a pull request, and after it's live it costs customers. So before any design becomes code, it gets a review. In this lesson you'll run a ten-point check on the Rolling Ledger pricing page while it's still a Paper frame, have a fresh agent critique it with your brand and design skills, and write a short handoff note that becomes the agent's build spec.
:::

:::key-concept
A **design review** is a check of a screen against a short list of rules, done before it's built. Run it on the canvas, where every fix is cheap. Use **two reviewers**: a checklist you run yourself (phone width, contrast, one clear action, brand values) and a **fresh agent** with your design skills that hasn't seen the design being made, so it has no reason to defend it. Then write a **handoff note**: the frame, the decisions, and how you'll know the build matches.
:::

## What you'll be able to do

- Run a ten-point design check on a screen before it's built
- Check contrast, tap sizes and phone width without design training
- Get an honest critique from a fresh agent with your design skills
- Decide which critique points to act on
- Write a handoff note that becomes the build spec

## Why this matters

Agents are eager. Ask one to build a design and it will, including the parts that don't work. Lesson 6 gave you four versions to choose from and Lesson 7 gave you references. This lesson is the gate between "I like it" and "build it." It's the design version of the pull request review you do on every code change.

## The ten-point check

Run these on the Paper frame, at desktop width and at 390 wide. Ask the agent to screenshot both, or look on the canvas yourself.

| # | Check | Pass when |
|---|---|---|
| 1 | One clear action | One button stands out; you can say what it does in three words |
| 2 | Phone first | At 390 wide, the main action is visible without scrolling |
| 3 | Tap size | Buttons and links are at least 44 pixels tall on a phone |
| 4 | Contrast | Body text passes 4.5 to 1 against its background |
| 5 | Brand values | Only colours and fonts from the design system skill |
| 6 | Voice | The words pass your voice skill: plain, short, no hype |
| 7 | Line length | Paragraphs under about 80 characters per line on desktop |
| 8 | Real content | Longest real plan name, price and question fit without breaking |
| 9 | States | Empty, error and loading versions exist where needed |
| 10 | Nothing extra | Remove one thing; if nobody would miss it, leave it out |

You don't need to measure contrast by eye. Ask the agent: "Check every text and background pair in frame E against a 4.5 to 1 contrast ratio and list any that fail." Rolling Ledger's coral on cream, for example, is fine for a big button but too light for small body text, so small text stays ink.

:::infographic
id: fig-1
type: diagram
title: The ten-point check
shows: A phone-sized frame card on the left showing a simple pricing page, with small numbered coral markers on the button, the price and the body text. On the right, a list of the ten checks in two columns with checkmarks, and two marked with a red cross: tap size and contrast. The list is on the paper card.
data: none
image: /learn/figures/build-product-and-site/lesson-08-fig-1.webp
alt: A phone-width pricing page checked against ten points: one clear action, phone first, tap size, contrast, brand values, voice, line length, real content, states and nothing extra. Two checks fail and get fixed before code.
:::

## A second reviewer that wasn't in the room

The agent that drew the design has spent an hour agreeing with you. Start a **new session** for the critique, with your `frontend-design` and design system skills, and give it only the screenshots and the goal:

```text
You're reviewing a design before it's built. Goal: a truck owner on a
phone understands the price and starts in under ten seconds.
Here are frame E at 1440 and 390 wide. Use the frontend-design and
rolling-ledger-design-system skills. List the five biggest problems, most
important first, each with one concrete fix. Don't redesign it.
```

"Don't redesign it" matters: you want a list of problems, not version F. Then decide. Take the points that serve the goal, skip the ones that are just taste, and write down why you skipped any.

:::video
id: bp-l8-fresh-review
kind: inline
status: paused
src: /learn/video/build-product-and-site/bp-l8-fresh-review.mp4
captions: /learn/video/build-product-and-site/bp-l8-fresh-review.vtt
poster: /learn/video/build-product-and-site/bp-l8-fresh-review.jpg
transcript: Here a fresh Claude Code session reviews the Rolling Ledger pricing page from two screenshots. Its first point: on the phone, the comparison table pushes the Start button below the fold. Second: the coral body text under the price is too light to read. The founder accepts both, skips a suggestion to add a testimonial carousel, and the drawing agent fixes the frame in two minutes.
:::

## The handoff note

When the frame passes, write the note that becomes the build spec. Keep it to the `specs` format and under a page:

```markdown
# Build: pricing page (frame E)
Frame: Paper file pricing-page, frames "E" and "E-390"
Decisions: comparison table collapses to two rows on phone; small text in ink, not coral
Out of scope: testimonials, annual plan
Done when:
- Preview matches both frames side by side
- Ten-point check passes on the preview at 1440 and 390
- Start button opens the Stripe sandbox checkout
```

The agent builds from the frame and the note, opens a pull request, and you run the same ten checks on the preview. If the build and the frame disagree, the frame wins unless the note says otherwise.

:::infographic
id: fig-2
type: flow
title: The design gate
shows: A left-to-right flow. Merged frame, your ten-point check, fresh agent critique, fix on the canvas, handoff note, build and pull request. A gate icon sits between "handoff note" and "build". The handoff note card is the paper card.
data: none
image: /learn/figures/build-product-and-site/lesson-08-fig-2.webp
alt: The merged frame passes your ten-point check and a fresh agent's critique, gets fixed on the canvas, and is written up as a handoff note before the agent builds it and opens a pull request.
:::

:::warning
A critique agent will always find something; that's its job. Don't let the list grow into a redesign. Act on what serves the goal you wrote, and stop. And a design review doesn't replace the preview review: check the built page too, because builds drift from frames.
:::

:::try-it
Open your live site on your phone. Run checks 1 to 4 from the table on your home page. Note how many pass. That's your baseline before you design anything new.
:::

:::checkpoint
Q: Why use a fresh agent session for the critique?
- [ ] Fresh sessions are cheaper
- [x] The agent that drew the design has spent the session agreeing with you; a new one only sees the result
- [ ] The first agent can't take screenshots
Why: A reviewer that wasn't part of making the design has no reason to defend it, so it spots problems the first agent talked itself past.
:::

:::checkpoint
Q: Coral on cream passes contrast for a big button but fails for small body text. What do you do?
- [ ] Use coral everywhere for brand consistency
- [x] Keep coral for the button and set small text in ink
- [ ] Change the brand colours
Why: Contrast rules are stricter for small text. Using the darker brand colour for body text keeps the brand and keeps the page readable.
:::

:::takeaways
- Review designs on the canvas, before code, where every fix is one sentence.
- Run the ten-point check at desktop and phone width; ask the agent to measure contrast.
- Get a critique from a fresh agent with your design skills, then act only on what serves the goal.
- A short handoff note turns the frame into the build spec, and the preview gets the same check.
:::

## Go deeper

- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/) - check any two colours
- [WCAG 2.2 at a glance](https://www.w3.org/WAI/standards-guidelines/wcag/glance/) - the accessibility rules behind checks 3 and 4
- [Paper MCP](https://paper.design/docs/mcp) - screenshots and reading frames as code
