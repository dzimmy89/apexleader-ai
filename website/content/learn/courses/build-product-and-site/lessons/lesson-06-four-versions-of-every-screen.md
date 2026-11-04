---
module: 2
lesson_number: 6
course: build-product-and-site
template: v2
---

# Lesson 6: Four Versions of Every Screen

:::video
id: bp-l6-overview
kind: overview
status: paused
src: /learn/video/build-product-and-site/bp-l6-overview.mp4
captions: /learn/video/build-product-and-site/bp-l6-overview.vtt
poster: /learn/video/build-product-and-site/bp-l6-overview.jpg
transcript: When you ask an agent for one design, you get one guess, and you either accept it or start over. Ask for four and you get to choose, and better still, combine. Paper is a design canvas built on real HTML and CSS, and its MCP server lets Claude Code draw directly on it. In this lesson you'll have the agent draw four versions of the Rolling Ledger pricing page side by side, all in the brand's colours, pick the parts you like from two of them, merge them into one, and turn the result into code for the site.
:::

:::key-concept
**Paper** is a design app whose canvas is made of real HTML and CSS, so what you design is already close to code. Its **MCP server** lets an agent create frames, set text and styles, take screenshots of what it drew, and read any frame back as code. The method: ask for **four different versions** of one screen, all inside your brand, then **pick and merge** the best parts of two. Choosing between options is much easier than describing what you want from nothing.
:::

## What you'll be able to do

- Install Paper and connect it to Claude Code, Codex or Cursor
- Have an agent draw four versions of one screen on the canvas
- Keep every version on brand with your design system skill
- Merge the best parts of two versions into one
- Turn the chosen frame into code for your site

## Why this matters

In Lesson 3 you mocked up the page as images with Codex. Images are good for picking a mood. They're harder to build from: the agent has to guess the spacing and sizes from a picture. A Paper frame is made of the same building blocks as a web page, so the agent can read exact sizes, colours and text straight from it.

And four versions beat one because taste is easier to recognise than describe. You might not be able to say "I want the price bigger than the plan name," but you'll know it when you see version C.

## Install Paper and connect it

Download Paper Desktop from paper.design and open it. Paper is in open alpha as of November 2026: it works well, and it changes often. The desktop app runs the MCP server, so **Paper must be open, with a file open,** while the agent works.

In Paper, open the MCP panel (with nothing selected) and click **Add to Claude**, **Add to Codex** or **Add to Cursor**. Or install it by hand:

```bash
# Claude Code
claude plugin marketplace add paper-design/agent-plugins
claude plugin install paper-desktop@paper
```

In Cursor, type `/add-plugin paper-desktop` in the agent panel. Restart your agent, then check it's connected: `/mcp` in Claude Code should list Paper.

### What it costs

Paper has a free tier for trying it out. Pro, as of November 2026, is $16 a month or $144 a year and includes a weekly allowance of a million MCP tool calls, which is far more than a solo founder needs. Agents make many small calls while drawing, so if you hit the free limits during this lesson, that's why.

## Four versions, on brand

Open a new Paper file called `pricing-page`. In Claude Code, with your design system skill from the Agent Skills course installed, ask:

```text
Using the Paper MCP, draw four versions of the Rolling Ledger pricing page
side by side, each 1440 wide. Use our design-system skill for every colour
and font. Same content in all four: one plan, $149 a month, what's included,
three questions owners ask, and a Start button.
Make them genuinely different:
A: price first, very large
B: a story of one truck's month first, price after
C: a comparison with doing the books yourself
D: as short as possible, everything above the fold
Label each frame. Screenshot each when done and tell me what you'd pick.
```

Three things make this work. The design system skill keeps all four on brand, so you're comparing layouts, not colour schemes. The **same content** in each means you judge the design, not the copy. And **named directions** stop the agent from drawing four near-identical pages.

:::infographic
id: fig-1
type: comparison
title: Four directions, one brand
shows: Four small wireframe frames in a row, labeled A price first, B story first, C comparison, D short. Each uses the same ink, coral and cream blocks. Frame A's large price block and frame C's comparison block are circled, with an arrow to a fifth frame on the paper card labeled "merged".
data: none
image: /learn/figures/build-product-and-site/lesson-06-fig-1.webp
alt: Four versions of the pricing page in the same brand colours: price first, story first, comparison and short. The big price from A and the comparison from C are merged into a fifth version.
:::

## Pick and merge

Look at the four on the canvas. Don't pick a winner; pick **parts**. Write it down as plainly as you'd tell a designer:

```text
Make version E: version A's header and big price, version C's comparison
table under it, and D's single Start button. Drop B's story but keep its
first sentence as the subtitle. Put E to the right of the others.
```

Then look at E on a phone: ask the agent to add a 390-wide copy of E. Most problems show up there first.

You can also edit the canvas yourself: drag a block, change a word. The agent reads your changes the next time it looks.

:::video
id: bp-l6-four-versions
kind: inline
status: paused
src: /learn/video/build-product-and-site/bp-l6-four-versions.mp4
captions: /learn/video/build-product-and-site/bp-l6-four-versions.vtt
poster: /learn/video/build-product-and-site/bp-l6-four-versions.jpg
transcript: Here Claude Code draws four Rolling Ledger pricing pages on the Paper canvas, one after another, all in ink, coral and cream. The founder likes A's huge price and C's comparison with doing the books yourself. One sentence later there's a fifth frame combining them, and a phone-width copy next to it. The price wraps badly on the phone, so the founder asks for a smaller size there, and it's fixed in a minute.
:::

## From frame to code

When E is right, have the agent build it. Paper can give the agent a frame's structure as code, so it doesn't work from a picture:

```text
Read frame E and its 390-wide copy from Paper and build them as
pricing.html in our site, using our existing styles.css. Plain HTML and
CSS, no frameworks. Match the spacing and sizes in the frame. Open a
pull request when it's done.
```

Then review it the way you review everything: open the preview and compare it with the frame, side by side.

:::infographic
id: fig-2
type: flow
title: From four versions to a pull request
shows: A left-to-right flow. Ask for four named directions, review them on the canvas, merge the best parts into version E, check E at phone width, agent reads frame E and builds it, review the preview next to the frame. The last card is the paper card.
data: none
image: /learn/figures/build-product-and-site/lesson-06-fig-2.webp
alt: Ask for four named directions, review them on the canvas, merge the best parts into one version, check it at phone width, have the agent build it from the frame, and review the preview next to the frame.
:::

:::warning
Everything on the canvas is sent to the model when the agent reads it, so don't paste real customer data into a design; use made-up names and numbers. And treat the four versions as options, not instructions: if none of them is right, say so and ask for four new directions, rather than settling for the least bad one.
:::

:::try-it
Pick one screen on your site you've never been happy with. Write four one-line directions for it, as different from each other as A to D above. Even before you draw anything, you'll see your options more clearly.
:::

:::checkpoint
Q: Why give all four versions the same content?
- [ ] It's faster for the agent
- [x] So you compare the designs, not the words
- [ ] Paper only allows one set of text
Why: If the copy changes too, you can't tell whether you prefer the layout or the wording. Same content isolates the design choice.
:::

:::checkpoint
Q: You like version A's header and version C's table. What do you do?
- [ ] Pick A, since the header is more important
- [ ] Ask for four more versions
- [x] Ask the agent for a version E that combines A's header with C's table
Why: The point of several versions is that you can merge the best parts. Picking one winner throws away the rest.
:::

:::takeaways
- Paper's canvas is real HTML and CSS; its MCP server lets an agent draw on it and read frames back as code.
- Ask for four named, genuinely different versions, all with your design system skill and the same content.
- Pick parts, not a winner, and merge them into one version. Check it at phone width.
- Build from the frame, then review the preview next to it.
:::

## Go deeper

- [Paper MCP](https://paper.design/docs/mcp) - connecting Claude Code, Codex and Cursor
- [Paper](https://paper.design) - the design app and its pricing
- [Agent Skills and Plugins, Lesson 3](/university/agent-skills) - writing the design system skill this lesson relies on
