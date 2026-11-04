---
module: 1
lesson_number: 5
course: agent-build-line
template: v2
---

# Lesson 5: Spend Fewer Tokens

:::video
id: bl-l5-overview
kind: overview
status: paused
src: /learn/video/agent-build-line/bl-l5-overview.mp4
captions: /learn/video/agent-build-line/bl-l5-overview.vtt
poster: /learn/video/agent-build-line/bl-l5-overview.jpg
transcript: Every time an agent starts a job, it reads. It opens files to find its way around, and it reads long logs and test output line by line. All of that counts against your plan, and on a busy day it's most of what you spend. Two free tools cut it down. Graphify builds a map of your project once, so the agent asks the map before it opens a dozen files. Headroom shrinks the long, repetitive stuff, like logs and JSON, before it reaches the model. In this lesson you'll install both, and then do the part most people skip: measure what they actually save on your project.
:::

:::key-concept
A **token** is the unit your plan counts: roughly three-quarters of a word. Agents spend most of their tokens **reading**, not writing. **Graphify** turns your project into a knowledge graph, a map of what connects to what, that the agent can query instead of opening files one by one. **Headroom** compresses what the agent reads, like long logs and repeated JSON, before it's sent to the model. Both make claims; **your own before-and-after numbers** decide whether you keep them.
:::

## What you'll be able to do

- Explain where an agent's tokens go
- Install Graphify, build a graph of your project and query it
- Install Headroom and run Claude Code through it
- Measure the same job with and without each tool
- Decide, from your numbers, whether to keep each one

## Why this matters

In the T3 Code course you learned to stretch your plan limits by sending each job to the right plan. This is the other half: making each job cheaper. With three agents running in parallel from Lesson 4, reading costs three times as much. A 30% cut there is like getting an extra morning of agent work every week.

The catch is that savings depend on your project. Both tools publish honest benchmarks, and both say clearly where they don't help much. So the lesson ends with a test, not a promise.

:::infographic
id: fig-1
type: diagram
title: Where tokens go, and which tool helps
shows: A horizontal bar for one agent job split into three parts: finding its way around the code (largest), reading logs and test output, and writing the change (smallest). A Graphify label points at the first part, a Headroom label at the second. The writing part is the paper card section.
data: none
image: /learn/figures/agent-build-line/lesson-05-fig-1.webp
alt: An agent job spends tokens finding its way around the code, reading logs and test output, and writing the change. Graphify cuts the first, Headroom cuts the second, and writing stays about the same.
:::

## Graphify: a map of your project

Graphify is a free, open-source Claude Code skill. It reads your code (and docs, and even screenshots), works out what connects to what, and saves a graph your agent can query for weeks after.

### Install

It needs Python 3.10 or later:

```bash
pip install graphifyy && graphify install
```

The package name has two y's. On a Mac, if `pip` refuses with an "externally managed environment" error, use `pipx install graphifyy` and then `graphify install`.

### Build and use the graph

Open Claude Code in your project and type:

```text
/graphify .
```

It writes a `graphify-out/` folder: `GRAPH_REPORT.md` (a plain summary of the main parts and how they connect), `graph.html` (a map you can open in a browser) and `graph.json` (what the agent queries). Then ask questions through it:

```text
/graphify query "what happens between a receipt upload and the monthly summary?"
/graphify path "uploadReceipt" "monthlyTotals"
```

Each connection in the graph is tagged **EXTRACTED** (found in the code), **INFERRED** (a reasonable guess) or **AMBIGUOUS**. Trust the first; check the other two.

### Keep it current

Run `/graphify . --update` after a change; it re-reads only the files that changed. Or run `graphify hook install` once, and it rebuilds after every commit. Add `graphify-out/` to `.gitignore` unless you want the map in your repo.

### What it sends where

Code is read on your computer. Docs and images are read by Claude, so they count against your plan once, when the graph is built. Don't point it at a folder of client files.

### When Graphify helps

Graphify's own numbers: about 71 times fewer tokens per question on a 52-file mix of code, papers and images, and roughly no saving on a 6-file project, because 6 files fit in the agent's view anyway. The saving grows with the size of the project. The Rolling Ledger site is small today; the portal is what makes it worth trying.

:::video
id: bl-l5-graphify
kind: inline
status: paused
src: /learn/video/agent-build-line/bl-l5-graphify.mp4
captions: /learn/video/agent-build-line/bl-l5-graphify.vtt
poster: /learn/video/agent-build-line/bl-l5-graphify.jpg
transcript: Here's Graphify on the Rolling Ledger portal. We type slash graphify dot, and two minutes later there's a report and a map. The map shows the receipts table in the middle, with the upload page, the summary page and the Stripe webhook all connected to it. We ask how a receipt reaches the monthly summary, and the agent answers from the graph without opening a single file.
:::

## Headroom: shrink what the agent reads

Headroom sits between your agent and the model, on your computer, and compresses what's sent: long logs, repeated JSON, big search results. It keeps the lines that matter (an error in the middle of a log survives exactly) and keeps the full original locally, so the model can ask for it if it needs to.

### Install and run

```bash
uv tool install --python 3.13 "headroom-ai[all]"
headroom wrap claude
```

`headroom wrap claude` starts Claude Code through Headroom for that session. It also registers a code-navigation helper called Serena for that project; add `--code-memory none` if you'd rather not. `headroom unwrap claude` undoes it all. `headroom doctor` checks it's working, and `headroom savings` shows what it saved.

It works with Codex, Cursor, OpenCode and others too: `headroom wrap codex`.

### When Headroom helps

Headroom's measured results: 21% to 57% fewer input tokens across four agent jobs, and over 90% on repeated JSON and log lines. On plain prose it saves very little. Busy builds, test runs and database output are where it earns its place.

:::infographic
id: fig-2
type: flow
title: Measure before you keep it
shows: A left-to-right flow. Pick one real job, run it plain and note the usage, run the same job with the tool and note the usage, compare, keep the tool only if it saved at least a fifth with the same result. The last card is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-05-fig-2.webp
alt: Pick a real job, run it without the tool and note usage, run it with the tool and note usage, compare the two, and keep the tool only if it saved enough with the same result.
:::

## Test it on your project

Pick one real job you do often, like "add a field to the receipts form and update its tests." Run it twice from the same starting point, on two throwaway branches:

1. Plain Claude Code. Note the usage from `/usage` before and after.
2. With Graphify built and Headroom wrapped. Note the usage again.

Check the two results are equally good, then compare. Keep a tool only if it saves enough to notice, a fifth or more, without making the work worse. Write the numbers in `notes/token-test.md`; next quarter, when the project is bigger, run the test again.

:::warning
Vendor numbers are measured on their test projects, not yours. Treat "up to 95% savings" as a ceiling, never a forecast. And a tool that saves tokens but makes the agent miss things isn't saving you anything: compare the quality of the two results, not just the usage.
:::

:::try-it
Open Claude Code's `/usage` before and after one ordinary job today, and write the difference down. That's your baseline. Without it, no tool can prove it helped.
:::

:::checkpoint
Q: Your project has eight files. Graphify reports almost no token saving. Why?
- [ ] Graphify is broken
- [x] Eight files fit in the agent's view anyway; the saving grows with project size
- [ ] You need to pay for the full version
Why: Graphify's own benchmarks show roughly no saving on a 6-file project and large savings on a 52-file one. On a small project its value is the map, not the tokens.
:::

:::checkpoint
Q: Headroom's site shows 90% savings. What should you expect on your project?
- [ ] 90%
- [ ] Nothing; the number is made up
- [x] Whatever your own before-and-after test shows, likely highest on logs and JSON and lowest on prose
Why: The 90% is measured on repeated JSON and logs. On mixed agent work Headroom measured 21% to 57%. Your own test is the only number that counts.
:::

:::takeaways
- Agents spend most tokens reading: finding their way around and reading output.
- Graphify builds a project map the agent queries instead of opening files; it pays off on bigger projects.
- Headroom compresses logs, JSON and search results before they reach the model.
- Run one real job with and without each tool, and keep it only if your numbers say so.
:::

## Go deeper

- [Graphify](https://github.com/safishamsi/graphify) - install, commands and the worked benchmarks
- [Headroom](https://github.com/headroomlabs-ai/headroom) - install, agent wrapping and the measured savings
- [Headroom docs](https://docs.headroomlabs.ai) - proxy, savings and settings
- [Claude Code costs](https://code.claude.com/docs/en/costs) - how usage is counted and how to keep it down
