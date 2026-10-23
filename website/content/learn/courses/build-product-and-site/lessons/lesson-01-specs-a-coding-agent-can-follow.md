---
module: 1
lesson_number: 1
course: build-product-and-site
template: v2
---

# Lesson 1: Specs a Coding Agent Can Follow

:::key-concept
A coding agent builds what you write down, not what you meant. A one-page spec in plain English, with a clear "done" test at the end, is the single biggest lever you have on the quality of what comes back. You write the spec; the agent writes the code.
:::

## What you'll be able to do

- Write a one-page spec (SPEC.md) for a landing page that a coding agent can build without guessing
- Have Claude interview you so the spec covers the decisions you would otherwise forget
- Separate "must have" from "out of scope" so the agent stops gold-plating
- End every spec with checks the agent can run to prove the work is done

## Why this matters

You are not going to read every line of code your agent writes. That is fine. What you can do is control the brief. Anthropic's own Claude Code guidance says the most useful specs are self-contained: they name what is involved, state what is out of scope, and end with a verification step that proves the work. Founders who skip this step get a site that looks plausible and is wrong in ten small ways. Founders who write the spec get a first draft that is close, and they spend their time on taste, not repairs.

This course builds one real asset: a landing page for your business, live on your own domain. If you don't have a business idea locked yet, use the sample business that runs through every exercise: **Groomer Books**, a monthly bookkeeping service for independent dog groomers.

## What a coding agent needs from you

A coding agent like Claude Code or Cursor can read files, run commands and check its own work in a browser. It cannot read your mind about your customer, your offer or your taste. A good spec answers five questions.

| Question | What to write | Example (Groomer Books) |
|---|---|---|
| Who is it for? | One sentence on the visitor | Independent dog groomers, 1 to 3 chairs, who do their own books at night |
| What must they do? | The one action that counts | Book a free 15-minute call |
| What goes on the page? | Sections, in order, with the real copy or a placeholder | Hero, problem, how it works, price, FAQ, call to action, footer |
| What are the rules? | Tech, style and limits | Plain HTML and CSS, no framework, loads fast on a phone, no tracking scripts |
| How do we know it's done? | Checks the agent can run | Page passes an HTML validator, works at 375px wide, every link works |

Notice the last row. Without it, the agent stops when the page "looks done." With it, the agent can test, read the result and fix what failed before it reports back.

## The shape of a good SPEC.md

Keep it to one page. Plain headings. Short bullets. Here is a skeleton you can reuse.

```text
# SPEC: Groomer Books landing page

## Goal
One page that gets independent dog groomers to book a free 15-minute call.

## Audience
Groomers running 1 to 3 chairs. They read on a phone between appointments.
They hate jargon and have been burned by software that promised to "automate" things.

## Sections (in this order)
1. Hero: headline, one-line subhead, button "Book a free call"
2. The problem: three short pain points (receipts in a shoebox, tax panic, no idea what they made last month)
3. How it works: three steps
4. Price: one plan, monthly, link to the booking page
5. FAQ: five questions (copy in /content/faq.md)
6. Footer: business name, email, privacy note, year

## Rules
- Plain HTML and CSS only. One index.html, one styles.css, images in /images.
- Mobile first. Must look right at 375px and 1280px wide.
- No analytics, cookies or third-party scripts in version 1.
- Use the copy in /content exactly. If copy is missing, write [TODO] and list it at the end.
- Colors and fonts: see /brand/colors.md (if it doesn't exist yet, use one dark text color, one accent, white background).

## Out of scope
- No login, no payments, no blog, no CMS.
- No contact form that stores data. The button links to our booking page.

## Done when
- index.html passes the W3C HTML validator with no errors
- Screenshots at 375px and 1280px show every section, nothing overflows
- Every link and button goes somewhere real (list any that don't)
- Images have alt text and are under 300 KB each
- You list every [TODO] and every assumption you made
```

Two details do most of the work. "Out of scope" stops the agent from adding a newsletter popup and a dark mode you didn't ask for. "Done when" turns a vague goal into a pass or fail.

## Let Claude interview you first

You will forget things. That is normal. The fix is to have Claude ask you the questions before it writes anything. Claude Code's best-practices guide recommends exactly this for larger features: start with a short description and ask Claude to interview you, then write the spec to a file. You can do the same in the Claude app, in a Project you set up for your business.

```text
I'm a non-technical founder. I want a one-page landing page for my business:
[one sentence on what you sell and to whom].

Interview me, one question at a time, until you can write a complete spec a coding
agent could build without guessing. Cover: the visitor, the single action I want,
every section and its copy, the tone, technical rules, what is out of scope,
and how we will check it is done. Don't ask obvious questions. Push on the parts
I haven't thought about, like what happens on a phone and what the button links to.

When we're done, write the spec as SPEC.md using these headings:
Goal, Audience, Sections, Rules, Out of scope, Done when.
Keep it under one page.
```

Answer in plain words. If you don't know, say "I don't know yet, suggest two options." Then pick one. The interview usually takes 15 minutes and saves hours of rework.

## Write copy before code

Agents are good at layout and decent at copy. They are bad at knowing your customer. Put your real words in a folder the agent can read, for example `/content/hero.md`, `/content/faq.md`. If you ran customer interviews in the Find and Validate the Idea course, lift phrases from those notes. "I do my books at 11pm after the last dog leaves" is better copy than anything an agent will invent.

A useful rule in your spec: "Use the copy in /content exactly. If copy is missing, write [TODO]." That one line prevents made-up testimonials, fake customer counts and invented prices, which is the most common way an AI-built page embarrasses a founder.

:::warning
Never let an agent invent social proof. No made-up testimonials, logos, star ratings or "trusted by 500 groomers." Beyond being embarrassing, fake reviews and endorsements can break consumer protection rules. Put "No testimonials until we have real ones" in your spec.
:::

## Plan first, then build

Both Claude Code and Cursor have a Plan mode (press Shift+Tab in either to switch). In Plan mode the agent reads your spec and files, asks questions and proposes a plan without editing anything. You read the plan, fix it, and only then let it build. If the plan is wrong, the spec was unclear. Fix the spec, not the code. Cursor's own docs make the same point: if the result is off, revert and tighten the plan rather than patching with follow-up prompts.

A good habit: after the agent writes its plan, ask it one more question.

```text
Before you build: list every assumption you are making that is not in SPEC.md,
and every place where the spec is ambiguous. Don't build yet.
```

Each item on that list is either a sentence you add to the spec or a decision you make on the spot.

:::try-it
Open Claude and paste: "Here is my business in one sentence: [your sentence]. List the six sections a landing page for it needs, in order, with a one-line purpose for each. Then list three things that should be explicitly out of scope for version 1." Keep the answer. It is the start of your spec.
:::

:::checkpoint
Q: Your agent built your landing page and added a pricing table with three tiers you never mentioned. What is the best fix?
- [ ] Ask the agent to delete the extra tiers and move on
- [x] Add the real price and "one plan only, no tiers" to SPEC.md, then have the agent rebuild that section from the spec
- [ ] Switch to a different coding agent that guesses better
Why: The agent filled a gap in the spec. Fixing the spec makes the rule stick for every future change; a one-off correction gets lost the next time you ask for edits.
:::

:::takeaways
- A spec is one page: goal, audience, sections, rules, out of scope, done when.
- Have Claude interview you first, then write SPEC.md to a file the agent can read.
- Give the agent your real copy and forbid invented testimonials, prices and numbers.
- Plan before build; if the plan is wrong, fix the spec, not the code.
:::

## Go deeper

- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) - explore, plan, code; letting Claude interview you; giving the agent a way to verify its work
- [Cursor Plan Mode](https://cursor.com/docs/agent/plan-mode) - how Cursor researches, asks questions and drafts a plan before building
- [Claude Code quickstart](https://code.claude.com/docs/en/quickstart) - install and first session, if you want to run the interview inside Claude Code
