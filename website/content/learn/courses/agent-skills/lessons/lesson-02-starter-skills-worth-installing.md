---
module: 1
lesson_number: 2
course: agent-skills
template: v2
---

# Lesson 2: Starter Skills Worth Installing

:::video
id: sk-l2-overview
kind: overview
status: paused
src: /learn/video/agent-skills/sk-l2-overview.mp4
captions: /learn/video/agent-skills/sk-l2-overview.vtt
poster: /learn/video/agent-skills/sk-l2-overview.jpg
transcript: Most bad agent work starts before the agent writes a single line. You asked for something vague, it guessed, and you only found out when you saw the result. Three free skills fix the most common failures. Grill me makes the agent interview you until the idea is clear. Frontend design stops the agent from building the same generic page everyone else gets. And skill creator lets the agent write and test new skills for you. In this lesson you'll install all three and use each one on the Groomer Books site.
:::

:::key-concept
Install skills that fix the failures you actually hit. For most solo founders that's three: the agent built the wrong thing (fix: **`/grill-me`**, which interviews you first), the page looks like every other AI page (fix: **`frontend-design`**), and you keep explaining the same process (fix: **`skill-creator`**, which writes the skill for you). Each one is free and open, and each one is a short file you can read in five minutes.
:::

## What you'll be able to do

- Install Matt Pocock's skills and run `/grill-me` on an idea before anything gets built
- Install Anthropic's `frontend-design` skill and know what "generic AI design" looks like
- Install `skill-creator` and have it draft, test and improve a skill
- Run the three in order: grill, design, then capture the process as a skill

## Why this matters

In the Build the Product course you learned that a clear spec beats a clever prompt. The hard part is that you don't always know what you want until someone asks the right questions. A good contractor asks. An agent, left alone, guesses. These three skills turn the agent into the contractor who asks, designs with a point of view, and writes down how you work so you don't have to repeat it.

## 1. `/grill-me`: get interrogated before you build

Matt Pocock is a TypeScript teacher whose skills collection is one of the most installed in 2026. Its most popular skill is a **grilling session**: the agent asks you detailed questions about what you're building until you both agree on it.

### How a grilling round works

- The agent maps your idea as a tree of decisions. It only asks questions you can answer now, not ones that depend on answers you haven't given yet.
- Each round is a numbered list of questions, and **each question comes with the agent's recommended answer**. Reply "yes" to accept it, or give your own.
- It looks up facts itself (what's in your files, what tools you have). Decisions are yours.
- It's done when every branch has an answer. It won't start building until you confirm.

There are two versions: `/grill-me` for any idea, and `/grill-with-docs` for code, which also checks your project's docs and records the decisions.

### Install

In Claude Code, from a terminal:

```bash
claude plugin install mattpocock-skills@claude-plugins-official
```

In Codex:

```bash
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock
```

For Cursor, OpenCode and others: `npx skills@latest add mattpocock/skills`. Install it one way per agent, not two, or you'll get every skill twice.

Then run `/setup-matt-pocock-skills` once in each project. It asks where you track work (GitHub issues, local files or something else), what labels you use, and where to save docs.

:::video
id: sk-l2-grill-me
kind: inline
status: paused
src: /learn/video/agent-skills/sk-l2-grill-me.mp4
captions: /learn/video/agent-skills/sk-l2-grill-me.vtt
poster: /learn/video/agent-skills/sk-l2-grill-me.jpg
transcript: Here's grill me on a real idea: an online booking page for Groomer Books. The founder types grill me and one sentence. The agent comes back with four numbered questions, each with a recommended answer. Who books, the groomer or their client? Recommended: the groomer. Does it take payment? Recommended: no, not yet. The founder says yes to three and changes one. The next round goes deeper. After three rounds, the idea that started as one sentence is a clear one-page plan.
:::

## 2. `frontend-design`: stop the generic AI look

Ask any agent for a landing page with no direction and you'll get a familiar result. Anthropic's `frontend-design` skill names those tells and steers away from them. As of November 2026 it lists, among others:

- A warm cream background with a big serif headline and a terracotta accent, or a near-black page with one acid-green accent
- One word in a headline picked out in italic, bold or a different colour
- All-caps labels above every section, and numbered markers (01, 02, 03) on things that aren't steps
- A fade-and-slide-up entrance on every section

What it asks for instead: start from the subject's own world (for Groomer Books, that's grooming tables, appointment books and receipts, not a generic SaaS hero), use one or two typefaces chosen on purpose, keep lines under 80 characters, and use motion once, deliberately.

Install it in Claude Code:

```text
/plugin install frontend-design@claude-plugins-official
```

It's also in the anthropics/skills repository, so `npx skills add anthropics/skills --skill frontend-design` puts it in other agents.

:::infographic
id: fig-1
type: comparison
title: Generic page vs designed page
shows: Two simple wireframes side by side. Left, labeled "default": a centred hero with one highlighted word, an all-caps eyebrow label, three numbered feature cards. Right, labeled "with frontend-design": a hero built around an appointment book image and a plain headline, one typeface pair noted, features as a short list. The right one is on the paper card.
data: none
image: /learn/figures/agent-skills/lesson-02-fig-1.webp
alt: A default AI page has a highlighted headline word, an all-caps label and numbered cards. The frontend-design version opens with the subject's own world, a plain headline and a deliberate type pair.
:::

The skill is a starting point, not your brand. In Lesson 3 you'll write a design system skill from your Brand in a Day kit, so the agent uses your colours and fonts, not just "something distinctive."

## 3. `skill-creator`: the agent writes the skill

Anthropic's `skill-creator` skill turns "here's how I do this" into a working skill. It works in a loop:

1. You describe the job, or point it at a chat where you did the job well.
2. It drafts the `SKILL.md`.
3. It writes a few test prompts, runs them with the skill, and shows you the results side by side.
4. You say what's wrong. It rewrites and tests again.
5. It tunes the description so the skill triggers when it should, and stays quiet when it shouldn't.

Install it in Claude Code:

```text
/plugin install skill-creator@claude-plugins-official
```

You can say "skip the evals, just draft it" for a quick skill. For a skill you'll use every week, let it run the tests.

:::infographic
id: fig-2
type: flow
title: The three starters, in order
shows: Three cards left to right with arrows. Grill me: a one-sentence idea becomes a clear plan. Frontend design: the plan becomes a screen with a point of view. Skill creator: how you did it becomes a skill for next time. The skill creator card is the paper card, with a loop arrow back to the start.
data: none
image: /learn/figures/agent-skills/lesson-02-fig-2.webp
alt: Grill me turns an idea into a plan, frontend design turns the plan into a distinctive screen, and skill creator turns how you did it into a skill for next time.
:::

:::warning
All three skills come from sources you can read: Anthropic's official directory and Matt Pocock's public repository. Read each `SKILL.md` before installing anyway, as you learned in Lesson 1. Grilling sessions use more messages up front; that's the point, and it costs less than rebuilding the wrong thing.
:::

:::try-it
Run `/grill-me` with one sentence about a change you've been putting off on your site. Answer one round of questions, then stop. Count how many of the agent's questions you hadn't thought about.
:::

:::checkpoint
Q: In a grilling round, the agent asks "Should the booking page take payment? Recommended: no, not yet." You agree. What do you reply?
- [x] "Yes"
- [ ] Rewrite the whole answer in your own words
- [ ] Skip it; the agent will decide
Why: Each question is worded so that "yes" accepts the recommended answer. You only write more when you disagree.
:::

:::checkpoint
Q: Your new homepage has a cream background, a terracotta accent and one headline word in italics. What does the frontend-design skill say about that?
- [ ] It's the recommended style
- [x] Those are common tells of a generated page, so choose differently for this subject
- [ ] Nothing; the skill only covers code
Why: The skill lists exactly these as clichés of AI-generated design and asks for choices drawn from the subject's own world.
:::

:::takeaways
- `/grill-me` makes the agent interview you in rounds, with a recommended answer you can accept with "yes."
- `frontend-design` names the generic AI look and steers toward choices from your subject's world.
- `skill-creator` drafts, tests and tunes a skill from a description or a good past chat.
- Use them in order: grill the idea, design it, then capture the process as a skill.
:::

## Go deeper

- [mattpocock/skills](https://github.com/mattpocock/skills) - install steps for each agent and why each skill exists
- [The grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) - the full instructions behind `/grill-me`
- [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) - Anthropic's design skill
- [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) - Anthropic's skill for writing and testing skills
