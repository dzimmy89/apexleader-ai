---
module: 1
lesson_number: 3
course: brand-in-a-day
template: v2
---

# Lesson 3: A Brand Kit Your Agents Follow

:::key-concept
A brand kit is one folder: your voice guide, logo files, colors, fonts and a few templates. The trick is not making it, it's wiring it in so every agent reads it before it writes or designs: as Project knowledge in Claude, as a skill, and through a CLAUDE.md or AGENTS.md file in your code.
:::

## What you'll be able to do

- Assemble a brand kit folder with a clear, agent-readable structure
- Define colors and fonts as exact values, with contrast that passes accessibility checks
- Load the kit into a Claude Project, package it as a Claude skill, and reference it from CLAUDE.md or AGENTS.md
- Create two or three social templates that keep posts on-brand without a designer

## Why this matters

You'll soon have agents drafting posts, emails, proposals and pages. Each one starts from zero unless you hand it your brand. Founders who paste "use a friendly tone and our blue" into every chat get inconsistent work and waste time correcting it. Founders who wire the kit in once get on-brand drafts by default, and spend their review time on substance.

## The kit: one folder, plain files

Keep it simple and text-first. Agents read text far more reliably than PDFs of brand books.

```text
brand/
  BRAND.md            the one-page summary every agent reads first
  voice-guide.md      from Lesson 1
  colors.md           names, hex values, where each is used
  type.md             fonts and sizes
  logo/
    logo.svg          primary, vector
    logo-dark.svg     for dark backgrounds
    logo-mark.png     square mark, 512 x 512, transparent
    favicon.png
  templates/
    social-quote.html
    social-announcement.html
  examples/
    good-post-1.md    real examples you approved
    good-email-1.md
```

`BRAND.md` is the entry point. Keep it under a page:

```text
# Groomer Books brand, read this first
Who we are: monthly bookkeeping for independent dog groomers.
Voice: see voice-guide.md. Short version: plain, warm, practical, honest.
Colors: see colors.md. Primary Ink #1F2A37, Accent Coral #E8664A, Background Cream #FFF8F0.
Type: headings Fraunces, body Inter (both free from Google Fonts).
Logo: use logo/logo.svg. Never stretch, recolor or add effects. Minimum 24px tall on screen.
Never: invent customer quotes or numbers; use dog puns in money or deadline messages;
use stock photos of people in suits.
Approval: every draft that leaves the business goes to the founder first.
```

## Colors and fonts as exact values

"Our coral" means nothing to an agent. A hex code does.

```text
# colors.md
| Name | Hex | Use |
| Ink | #1F2A37 | Body text, headings |
| Coral | #E8664A | Buttons, links, one highlight per design |
| Cream | #FFF8F0 | Page and post backgrounds |
| Sage | #6B8F71 | Secondary accents, icons |
Rules: Coral never used for long text. Text on Cream is always Ink.
```

Check contrast. The web accessibility standard (WCAG) asks for a contrast ratio of at least 4.5:1 for normal-size text. Ask an agent to check every text and background pair you plan to use:

```text
Read brand/colors.md. Calculate the contrast ratio for every text color on every
background color. Mark each pair pass or fail for normal text (4.5:1) and large text (3:1).
Suggest the smallest change to any failing color that makes it pass, keeping its character.
```

For fonts, pick from a free library like Google Fonts so every tool and agent can use them without license questions. Two fonts is plenty: one for headings, one for everything else.

## Wire it in, three ways

### 1. A Claude Project for everyday writing

Projects keep files and standing instructions together, and they're available on every Claude plan (free accounts have a limit on how many). Create a project called "[Business] brand desk," upload everything in `brand/` as project knowledge, and set project instructions:

```text
You write and review content for Groomer Books.
Before writing anything, follow BRAND.md and voice-guide.md in project knowledge.
Use only facts, prices and quotes found in project knowledge; otherwise write [CHECK].
End every draft with: "Brand check:" and list any rule you weren't sure about.
You draft. The founder approves and sends. Never say a draft has been sent or posted.
```

On Team and Enterprise plans you can share the project with others; on individual plans it's yours alone.

### 2. A Claude skill that travels

A skill is a folder with a `SKILL.md` file (a name, a description of when to use it, then instructions) plus any supporting files. Claude loads it automatically when the task matches the description, in any chat, not just one project. Skills are available on Free, Pro, Max, Team and Enterprise plans and need code execution turned on in settings. To add one, zip the folder and upload it under Customize, Skills.

```text
---
name: groomer-books-brand
description: Use whenever writing, editing or designing anything for Groomer Books,
  including posts, emails, web copy, proposals and images.
---
# Groomer Books brand
1. Read BRAND.md, then voice-guide.md and colors.md in this folder.
2. Write in the voice; use exact hex colors and the named fonts.
3. Never invent quotes, numbers or prices. Mark unknowns [CHECK].
4. Finish with a "Brand check" listing any rule you weren't sure about.
```

Put `BRAND.md`, `voice-guide.md` and `colors.md` in the same folder as `SKILL.md` before zipping. Claude Code reads skills too, from `.claude/skills/` in a project.

### 3. CLAUDE.md or AGENTS.md in your code

Your website repo from Build the Product and the Site already has a rules file. Copy the `brand/` folder into the repo and point to it. Claude Code supports importing files with `@path`, so one line pulls the kit into every session:

```text
# Brand
- Follow @brand/BRAND.md and @brand/voice-guide.md for all copy.
- Use colors from @brand/colors.md as CSS variables. No other colors.
- Use logo files from /brand/logo only. Never generate a new logo.
```

Cursor and other agents read `AGENTS.md`; write the same lines there with plain file paths. Change the kit through a pull request, like any other change, so you always know which version your agents are using.

## Social templates

You don't need a designer for everyday posts. You need two or three fixed layouts that agents fill with words.

- **Quote or tip card:** cream background, one sentence in Ink, small logo bottom right.
- **Announcement:** coral band at the top, headline, one line of detail, logo.
- **Photo post:** your own photo with a consistent crop and a small logo.

Have your coding agent build them as simple HTML files at the right size (1080 x 1080 for square, 1080 x 1350 for portrait, 1200 x 630 for link previews) using your exact colors and fonts, then screenshot them to PNG. Or build them in a design tool like Canva with your colors and fonts saved. Either way, the template fixes the look; the agent supplies only the words, and you approve each post before it goes out.

```text
Create brand/templates/social-tip.html: 1080x1080, background Cream, one sentence
in Ink using the heading font at a size that fits three lines, logo-mark.png bottom
right at 80px. Use only values from brand/colors.md and brand/type.md.
Render three examples with these tips: [tip 1], [tip 2], [tip 3]. Save as PNG.
```

:::warning
A brand kit makes drafts faster; it doesn't make them safe to publish unreviewed. Keep the approval rule in every place you wire the kit: agents draft, you approve anything that leaves the business. Don't put client names, private numbers or logins in brand files, since they get copied into many tools.
:::

:::try-it
Write the first three lines of your BRAND.md now: who you are in one sentence, your voice in four words, and one "never" rule. That's the core of the kit.
:::

:::checkpoint
Q: You want every Claude chat, not just one project, to apply your brand rules when you write a post. What's the best fit?
- [ ] Paste the voice guide into each new chat
- [x] Package the kit as a Claude skill with a clear description of when to use it
- [ ] Add the hex codes to your Claude profile name
Why: A skill loads automatically whenever the task matches its description, in any chat. A Project is great for focused work, but its knowledge stays inside that project.
:::

:::takeaways
- One brand/ folder, text-first, with BRAND.md as the entry point.
- Exact values: hex colors, named fonts, logo rules, and contrast checked against 4.5:1.
- Wire it in three ways: Claude Project, Claude skill, and CLAUDE.md or AGENTS.md in your repo.
- Templates fix the look; agents fill in words; you approve every post.
:::

## Go deeper

- [Using skills in Claude](https://support.claude.com/en/articles/12512180) - plans, turning on code execution, and uploading a custom skill
- [What are Projects?](https://support.claude.com/en/articles/9519177) - project knowledge, instructions and sharing
- [How Claude remembers your project](https://code.claude.com/docs/en/memory) - CLAUDE.md, AGENTS.md and `@path` imports
- [Cursor rules](https://cursor.com/docs/rules) - AGENTS.md and .cursor/rules for Cursor's agents
