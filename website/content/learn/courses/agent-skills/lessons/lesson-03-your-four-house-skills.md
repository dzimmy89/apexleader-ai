---
module: 1
lesson_number: 3
course: agent-skills
template: v2
---

# Lesson 3: Your Four House Skills

:::video
id: sk-l3-overview
kind: overview
status: paused
src: /learn/video/agent-skills/sk-l3-overview.mp4
captions: /learn/video/agent-skills/sk-l3-overview.vtt
poster: /learn/video/agent-skills/sk-l3-overview.jpg
transcript: Downloaded skills make your agent better at general work. House skills make it better at your work. A one-person company needs four of them: how you write, what your brand looks like, how you write a spec, and a running list of the mistakes your agents have made. Write them once and every agent you use starts each job already knowing how your company does things. In this lesson you'll see what goes in each one, where they live, and how one bad afternoon becomes a rule that stops the same mistake from ever happening again.
:::

:::key-concept
A **house skill** captures how *your* business does a job, so the agent doesn't have to guess. Four cover most of a solo founder's work: **voice** (how you write), **design system** (how your brand looks), **specs** (how you describe work before it's built) and **mistakes** (rules learned the hard way). Keep the master copies in one place, in GitHub, so every agent installs the same version and every fix reaches all of them.
:::

## What you'll be able to do

- Write a voice skill from your own past writing
- Turn your Brand in a Day kit into a design system skill
- Write a spec skill that matches how you plan work
- Turn each agent mistake into a rule, so it only happens once
- Keep house skills in one GitHub repo and install them into every agent

## Why this matters

Greg Isenberg, who runs a large team largely through agents, put it in four words: "every agent mistake becomes a new skill." The founders who get the most from agents aren't writing better prompts each time. They write the prompt once, as a skill, and improve it every week. Your house skills are the closest thing your company has to a staff handbook, and unlike a handbook, your staff actually reads it.

## The four skills

| Skill | What it holds | Where it comes from |
|---|---|---|
| `voice` | Tone, sentence length, words you use and avoid, two short examples | Your Brand in a Day voice guide, plus five pieces of your own writing |
| `design-system` | Colours, fonts, spacing, components, what never to do | `colors.md` and `type.md` from your Brand in a Day kit |
| `specs` | Your spec headings: Goal, Audience, Sections, Rules, Out of scope, Done when | The SPEC.md format from Build the Product, Lesson 1 |
| `mistakes` | Dated rules, each from a real mistake, grouped by job | Your weekly review |

:::infographic
id: fig-1
type: diagram
title: Four house skills, one source
shows: A GitHub repo card labeled house-skills at the left, holding four folders: voice, design-system, specs, mistakes. Arrows run right to three agent cards: Claude Code, Codex, Cursor. The mistakes folder is the paper card, with a small loop arrow labeled weekly.
data: none
image: /learn/figures/agent-skills/lesson-03-fig-1.webp
alt: A house-skills repo holds four skills, voice, design-system, specs and mistakes, and installs into Claude Code, Codex and Cursor. The mistakes skill is updated every week.
:::

## What a house skill looks like

Every skill starts with a short header. The `description` is the most important line, because it's what the agent reads to decide whether to use the skill. Keep the name under 64 characters and the description under 200, as in the Claude course.

```markdown
---
name: groomer-books-voice
description: Use when writing anything a customer will read for Groomer Books: site copy, emails, posts, proposals.
---

# Groomer Books voice

- Plain words a busy groomer understands on a phone. Say "your books", not "reconciliation".
- Sentences under 20 words. One idea per paragraph.
- Warm and direct. No hype words: "revolutionary", "seamless", "unlock".
- Prices in dollars with the period: "$149 a month".

## Example
Before: "Unlock seamless financial clarity for your grooming business."
After: "We keep your books every month, so tax time takes an hour, not a weekend."
```

### Voice

If you made a brand skill in Brand in a Day Lesson 3, you already have a start: this lesson splits it into separate voice and design skills, so a writing job doesn't load your colour codes and a design job doesn't load your email rules. Don't describe your voice from memory; you'll describe the voice you wish you had. Give `skill-creator` your voice guide and five things you've written that you're happy with (an email, a post, a page) and ask it to write the skill from them. Then test it: have the agent rewrite one dull paragraph and see if it sounds like you.

### Design system

Open your Brand in a Day kit. The design system skill lists the exact values: colour codes, font names and sizes, the spacing step, the button style, and a short "never" list ("no gradients", "no stock photos of laptops"). Tell the skill to use these values over anything the `frontend-design` skill suggests. That matters for Groomer Books: its kit is Ink #1F2A37, Coral #E8664A and Cream #FFF8F0, close to the cream-and-terracotta look `frontend-design` calls a cliché. It's a deliberate brand choice, so the design system skill says so ("cream and coral are our brand colours; keep them"), and the agent stops second-guessing it. Add one screenshot of a page you like as an example, if you have one.

### Specs

Use the SPEC.md format from Build the Product and Site: Goal, Audience, Sections, Rules, Out of scope and Done when, under one page. That lesson had Claude interview you with a long prompt; the skill replaces the prompt. Add one instruction at the top: "Before writing a spec, run `/grill-me` until the goal and done-when are settled." Now every spec starts with an interview.

:::video
id: sk-l3-write-house-skills
kind: inline
status: paused
src: /learn/video/agent-skills/sk-l3-write-house-skills.mp4
captions: /learn/video/agent-skills/sk-l3-write-house-skills.vtt
poster: /learn/video/agent-skills/sk-l3-write-house-skills.jpg
transcript: Here the Groomer Books founder pastes five past emails into Claude Code and asks skill creator for a voice skill. It drafts one, runs three test rewrites, and shows them side by side. The founder flags one phrase that sounds too formal, and the skill is updated. Next, the brand kit's colours and fonts go into a design system skill. Two skills done in about twenty minutes.
:::

## Mistakes become skills

Every time an agent gets something wrong in a way that could happen again, write a rule. Not a long story, a rule:

```markdown
## Site edits
- 2026-11-02: Never change prices on the pricing page without asking. (Agent "rounded" $149 to $150.)
- 2026-11-04: Check the page on a 390-pixel-wide phone before saying it's done.
```

Then decide where the rule belongs:

- A rule for one job goes in that job's skill. A voice slip goes in `voice`, a spec gap in `specs`.
- A rule that doesn't fit anywhere goes in `mistakes`.
- A rule that must *never* be broken, like "never edit `.env`", is a job for a hook, not a skill. Skills are instructions the agent follows; hooks are locks it can't skip. You set those up in Claude Code Lesson 5.

The fastest way: at the end of a session that went wrong, ask "What went wrong in this session, and what one rule would have prevented it? Add it to the right house skill." Then read the change before you accept it.

:::infographic
id: fig-2
type: flow
title: From mistake to rule
shows: A left-to-right flow. An agent card makes a mistake (red with the word "mistake"), you write one dated rule, the rule goes to the matching skill or to a hook if it must never happen. The final card, labeled "it only happens once", is the paper card.
data: none
image: /learn/figures/agent-skills/lesson-03-fig-2.webp
alt: An agent makes a mistake, you write one dated rule, and the rule goes into the matching skill, or into a hook if it must never happen. After that it only happens once.
:::

## Keep one copy for every agent

Put your house skills in one private GitHub repo, for example `house-skills`, with one folder per skill:

```text
house-skills/
  skills/
    groomer-books-voice/SKILL.md
    groomer-books-design-system/SKILL.md
    groomer-books-specs/SKILL.md
    groomer-books-mistakes/SKILL.md
```

- **Claude Code:** personal skills live in `~/.claude/skills/`, and project skills in `.claude/skills/` inside the project. Copy the folders there, or ask Claude Code to do it.
- **Other agents:** each agent loads skills from its own folder. Open the agent in a clone of `house-skills` and ask it: "Install every skill in `skills/` where you load skills from, and tell me the folder you used." For a public repo, `npx skills add <your-github-name>/house-skills` does this for you.
- **Updating:** change the skill in `house-skills`, commit it, then copy it out again. The repo's history shows you every rule you've added and when.

:::warning
House skills describe how you work, so they're tempting places to put account details. Don't. No passwords, API keys, client names or bank details in any skill. Keep the repo private, and read every change an agent makes to a skill before you accept it, because a bad rule spreads to every agent at once.
:::

:::try-it
Ask your agent: "Look at our last three sessions. What's one thing you got wrong that a written rule would have prevented?" Write that rule down. That's the first line of your `mistakes` skill.
:::

:::checkpoint
Q: An agent edited your `.env` file, which holds your API keys. It must never happen again. Where does the fix go?
- [ ] A line in the `mistakes` skill
- [ ] A line in the `voice` skill
- [x] A hook that blocks edits to `.env`, plus a note in `mistakes`
Why: Skills are instructions the agent follows, not locks. Anything that must never happen needs a hook, which the agent can't skip. The note in `mistakes` explains why.
:::

:::checkpoint
Q: What's the best source for your voice skill?
- [ ] A description of how you'd like to sound
- [x] Five pieces of your own writing you're happy with
- [ ] A popular writer's style
Why: Your past writing shows how you really sound. A description from memory usually describes a voice you wish you had, and the agent can't match that.
:::

:::takeaways
- Four house skills cover most solo work: voice, design system, specs and mistakes.
- Write voice from your own writing, design from your brand kit, and specs from the Build the Product format with `/grill-me` first.
- Every mistake becomes one dated rule in the right skill. Must-never rules become hooks.
- Keep one copy in a private GitHub repo and install it into every agent.
:::

## Go deeper

- [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) - the `SKILL.md` structure and best practice
- [Claude Code skills](https://code.claude.com/docs/en/skills) - personal and project skill folders
- [Anthropic's skill template](https://github.com/anthropics/skills/tree/main/template) - a blank skill to copy
- [Agent Skills standard](https://agentskills.io) - the shared format other agents load
