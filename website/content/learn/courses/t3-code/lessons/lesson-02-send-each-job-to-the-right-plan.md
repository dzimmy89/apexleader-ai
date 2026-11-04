---
module: 1
lesson_number: 2
course: t3-code
template: v2
---

# Lesson 2: Send Each Job to the Right Plan

:::video
id: t3-l2-overview
kind: overview
status: paused
src: /learn/video/t3-code/t3-l2-overview.mp4
captions: /learn/video/t3-code/t3-l2-overview.vtt
poster: /learn/video/t3-code/t3-l2-overview.jpg
transcript: Every AI plan is cheapest when you use its maker's own models. Claude's plan covers Claude. ChatGPT's plan covers Codex. Cursor's plan covers Cursor's and Grok's models, but bills Claude and GPT at API prices. With T3 Code you can send each job to the plan that covers it, plan with one agent, build with another, and spread one feature across two limits instead of draining one. In this lesson you'll make a routing card for Groomer Books and build a feature across two plans.
:::

:::key-concept
Each AI plan gives you the most for your money on its own maker's models. When one plan does every job, you run out of that plan's limits while the others sit idle. T3 Code lets you route: send each job to the plan that covers it best, and hand work from one agent to another with a short written note. It's like a small firm that sends drafting to one contractor and building to another, and pays each at their own rate.
:::

## What you'll be able to do

- Read what each of your plans covers in-plan and what it bills at API prices
- Fill a routing card that names which plan does which job
- Plan with one agent and build with another, with a handoff note
- Keep one shared brief that every agent reads

## Why this matters

Solo founders usually hit a usage limit on one plan in the middle of a job, then either wait or pay extra, while another plan they pay for goes half used. Routing fixes that. If Claude plans a feature and Codex builds it, each plan carries part of the load. And the job often goes better too, because you're using each agent for what it's good at.

## What each plan covers, as of November 4, 2026

Prices change often. Check each vendor's pricing page before you buy or change a plan.

| Plan family | Prices | How limits work | Cheapest jobs to send it |
|---|---|---|---|
| Claude (Claude Code) | Pro $20/mo, Max 5x $100, Max 20x $200 | A 5-hour usage window plus weekly caps. Some models have their own weekly cap | Planning, writing and wording, long reasoning, reviewing a whole branch |
| ChatGPT (Codex) | Go $8, Plus $20, Pro $100, Pro $200 | Plus has 5-hour windows plus weekly caps. Pro has no 5-hour limit, so the weekly allowance is the cap. Codex shares one pool with other ChatGPT agents | Building a planned feature, tests, routine fixes |
| Cursor | Free, Plus $8, Premium $30, Super $100, Ultra $200 | One pool for Cursor's and Grok's own models (Premium has 4x Plus usage, Super 15x). On Premium, Claude and GPT models are billed at their API list price | Quick edits on Cursor's and Grok's models, Bugbot code review |
| T3 Code | Free | Adds no usage and sets no caps | Sends the jobs above to the right plan |

Cursor rebuilt its plans in October 2026. The old $20 Individual plan is gone and Hobby is now called Free.

The rule to take away: **run each company's models on that company's plan.** Picking a Claude model inside Cursor works, but it's billed like the API, while the same work in Claude Code counts against the Claude plan you already pay for.

:::infographic
id: fig-1
type: comparison
title: Run each model on its own plan
shows: Three columns for the Claude, ChatGPT and Cursor plans. Each lists the models it covers inside the plan with a check, and Cursor's column also lists Claude and GPT models marked "API price". The paper card at the bottom says "Claude work → Claude Code, GPT work → Codex, Cursor and Grok models → Cursor". Prices dated November 4, 2026.
data: Claude Pro $20, Max $100 and $200. ChatGPT Go $8, Plus $20, Pro $100 and $200. Cursor Free, Plus $8, Premium $30, Super $100, Ultra $200.
image: /learn/figures/t3-code/lesson-02-fig-1.webp
alt: Claude's plan covers Claude models, ChatGPT's covers Codex, and Cursor's covers Cursor and Grok models but bills Claude and GPT models at API prices. So send Claude work to Claude Code, GPT work to Codex, and Cursor and Grok work to Cursor.
:::

:::video
id: t3-l2-api-price-trap
kind: inline
status: paused
src: /learn/video/t3-code/t3-l2-api-price-trap.mp4
captions: /learn/video/t3-code/t3-l2-api-price-trap.vtt
poster: /learn/video/t3-code/t3-l2-api-price-trap.jpg
transcript: Here's the trap. In Cursor you can pick a Claude model, and it works. But on Cursor's Premium plan, Claude and GPT models are billed at their API list price, not from the plan pool. The same planning job in Claude Code counts against the Claude plan you already pay for. So in T3 Code, run Claude jobs on Claude Code, GPT jobs on Codex, and keep Cursor for Cursor's and Grok's own models.
:::

## Your routing card

A routing card is a short table that says which plan does which kind of job. Write it once, keep it in your project, and stop deciding job by job.

| Job | Send to | Why |
|---|---|---|
| Plan a new feature | Claude Code, plan mode | Strong at reasoning, and planning uses the Claude plan |
| Build the planned feature | Codex, in a worktree | Uses the ChatGPT plan and leaves Claude's window for review |
| Fix a typo or a colour | Cursor or Codex, current checkout | Small and fast, so use whichever plan has the most room |
| Write or rewrite page copy | Claude Code | Wording is Claude's strength |
| Review a branch before merging | Claude Code, or Cursor Bugbot | A second agent catches what the builder missed |
| Write tests | Codex | Routine, well defined work |

This is an example for a founder who pays for Claude Pro, ChatGPT Plus and Cursor Plus. Yours depends on the plans you actually pay for. If you only have two, the card has two columns of choices, not three.

## Plan on one, build on another

T3 Code gives you two ways to split a job across agents.

**1. Switch at a handoff point.** Plan in one thread with Claude Code in **plan mode**, which studies the project and writes a plan without changing files. Then switch that thread to Codex, or start a new Codex thread, to build it.

The switch is lossy. The new agent doesn't see the old one's reasoning, tool calls or attachments, only the visible conversation. So always end a plan with a **handoff note**: five lines the next agent can work from.

```text
Handoff note for Codex
Goal: Add a Monthly/Annual toggle to pricing.html. Annual = 10x monthly.
Files: pricing.html and styles.css only.
Decisions: Default to Monthly. Show "2 months free" under Annual.
Done when: Toggle works at 375px and 1280px, screenshots attached.
Don't: change the header, footer or any other page.
```

**2. Delegate from inside a thread.** Since version 0.1.0, T3 Code gives agents a `delegate_task` tool. One agent can start a helper agent on another provider or model, wait for the result and carry on. You can ask for it in plain English: "Write the plan, then delegate the build to Codex in a new worktree and review what it returns."

:::infographic
id: fig-2
type: flow
title: Plan on Claude, build on Codex
shows: A left-to-right flow. Claude Code in plan mode writes the plan (counts against the Claude plan), a paper handoff note with five labelled lines (Goal, Files, Decisions, Done when, Don't), Codex builds in its own worktree (counts against the ChatGPT plan), and you review the pull request.
data: none
image: /learn/figures/t3-code/lesson-02-fig-2.webp
alt: Claude Code plans the feature on the Claude plan, a five-line handoff note carries the goal, files, decisions, done-when and don'ts, Codex builds it in its own worktree on the ChatGPT plan, and you review the pull request.
:::

:::video
id: t3-l2-delegate
kind: inline
status: paused
src: /learn/video/t3-code/t3-l2-delegate.mp4
captions: /learn/video/t3-code/t3-l2-delegate.vtt
poster: /learn/video/t3-code/t3-l2-delegate.jpg
transcript: Here's a delegated job on the Groomer Books site. Claude Code in plan mode reads the pricing page and writes a plan with a five-line handoff note. Then we ask it to delegate the build to Codex in a new worktree. Codex builds the toggle, Claude Code checks the result against the note, and the change becomes a pull request for us to review. Two plans shared the work, and neither hit its limit.
:::

## One brief for every agent

Every agent needs the same standing rules: who you are, how you build, and what's off limits. Don't type them into each thread. That repeats the same tokens every time and drifts between agents.

- Keep one **`AGENTS.md`** in your project. Codex and Cursor read it automatically.
- Claude Code reads **`CLAUDE.md`**. Make that file one line, `@AGENTS.md`, so Claude Code pulls in the same rules.
- Add your routing card to `AGENTS.md` under a heading like "Which agent does what", so any agent can tell you when a job belongs elsewhere.

:::warning
Routing never means pooling. Use one account per provider, and a separate work account only if you genuinely have one. Don't use tools or proxies that rotate several accounts to get around limits. They break the providers' terms and can get every account banned. If you keep running out, the answer is a different plan, which Lesson 4 helps you choose.
:::

:::try-it
Look at the last three jobs you gave a coding agent. For each, write which plan you used and which plan your routing card would send it to now. Did any of them run a model on a plan that bills it at API prices?
:::

:::checkpoint
Q: You want a Claude model to plan a feature. You pay for Claude Pro and Cursor Premium. Where should the planning run?
- [ ] In Cursor, because it's already open
- [x] In Claude Code, so it counts against the Claude plan
- [ ] It doesn't matter, the cost is the same
Why: On Cursor's Premium plan, Claude models are billed at their API list price. In Claude Code, the same work uses the Claude plan you already pay for.
:::

:::checkpoint
Q: You switch a thread from Claude Code to Codex. What does Codex get?
- [ ] Everything, including Claude's reasoning and tool results
- [x] The visible conversation, but not Claude's reasoning, tool calls or attachments
- [ ] Nothing at all, so you have to start over
Why: Switching mid-thread is lossy. That's why every handoff ends with a short note that says the goal, the files, the decisions, what done looks like, and what not to touch.
:::

:::takeaways
- Each plan is cheapest on its own maker's models. Cursor bills Claude and GPT models at API prices on Premium.
- A routing card decides once which plan does which job.
- Plan on one agent, build on another, and always write a five-line handoff note.
- One `AGENTS.md` for every agent, with `CLAUDE.md` pointing at it.
:::

## Go deeper

- [T3 Code](https://t3.codes/) - supported agents and multi-agent threads
- [A deep dive into T3 Code](https://flaviocopes.com/t3-code/) - model switching, `delegate_task` and plan mode
- [Codex usage limits and pricing](https://www.developersdigest.tech/blog/codex-usage-limits-pricing-2026) - ChatGPT plans and Codex windows, updated October 2026
- [Cursor plan changes](https://pricingsaas.com/companies/cursor/diffs/2026W43) - the October 19, 2026 plan rebuild
