---
module: 2
lesson_number: 8
course: get-found
template: v2
---

# Lesson 8: A Weekly SEO Agent

:::video
id: gf-l8-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l8-overview.mp4
captions: /learn/video/get-found/gf-l8-overview.vtt
poster: /learn/video/get-found/gf-l8-overview.jpg
transcript: SEO rewards whoever keeps looking. But nobody running a business alone wants to open Search Console every week. So hand the looking to an agent. Every Monday it reads your search data, compares it with last week, checks for new problems, and sends you a one-page brief with three suggested actions. It never publishes or changes your site on its own. In this lesson you'll set it up with your Marketing Bot, a Dots task, or a scheduled Claude Code session.
:::

:::key-concept
A weekly SEO agent is a scheduled job that reads your search data and reports, with limits. It reads Search Console (and later your AI-visibility log), spots changes, and drafts a brief: what moved, what broke, and up to three suggested actions. Every action that changes your site goes back through you as a pull request or an approval. The agent watches; you decide.
:::

## What you'll be able to do

- Pick which always-on agent runs your weekly SEO brief
- Give it read-only access to Search Console
- Write the job description and the brief format
- Keep every change behind your approval

## Why this matters

The work in this course pays off only if someone notices when things change: a page drops out of the index, a refresh starts working, a new query appears that deserves a page. For a solo founder, that someone is usually nobody. A Monday brief takes the agent minutes and takes you five to read. It's the habit that keeps the rest of the course working.

## Pick the agent

Use whichever always-on agent you already set up in Always-On Agents or AI Marketing.

| Agent | How it gets the data | Good fit when |
|---|---|---|
| Your Marketing Bot (Grok Bot) | Signs in to Search Console in its browser and reads the reports, as a routine | It already writes your weekly marketing brief; add SEO to it |
| OpenAI Dots | A scheduled task reads a Search Console export you drop in a shared folder, or a connected tool | You live in ChatGPT and want the brief there |
| A scheduled Claude Code session | Reads Search Console through an MCP connection, and your repository for technical checks | You want it to run the technical audit from Lesson 3 too, and open pull requests for you to review |

Pick one. Two agents writing the same brief is noise.

## Give it the least access

Search Console lets you add users with limited permission. In **Settings → Users and permissions**, add the agent's login as a **Restricted** user: it can view most data but can't change settings or add users. Never give an agent your own Google account, and never make it an Owner.

For a Claude Code session, give it a branch to work on and no permission to merge. Repository changes always arrive as pull requests.

:::infographic
id: fig-1
type: flow
title: The weekly SEO loop
shows: A loop: Monday 7:00, the agent reads Search Console with Restricted access, compares with last week, runs checks, and drafts the brief. The brief goes to you. You approve or reject each suggested action. Approved actions become a pull request or a task in your content calendar. A gate icon sits between the brief and any change.
data: none
alt: Every Monday the agent reads Search Console with restricted access, compares weeks, drafts a brief and sends it to you. Nothing changes until you approve an action, which then becomes a pull request or a calendar task.
:::

:::video
id: gf-l8-scheduling
kind: inline
status: paused
src: /learn/video/get-found/gf-l8-scheduling.mp4
captions: /learn/video/get-found/gf-l8-scheduling.vtt
poster: /learn/video/get-found/gf-l8-scheduling.jpg
transcript: Here's the setup with the Groomer Books Marketing Bot. First, in Search Console, we add the Bot's own login as a Restricted user. Then we add an SEO section to its Monday routine: read last week's Performance and Pages reports, compare with the week before, check the refresh log, and draft the brief. Auto-review stays on for anything that sends or changes. We run it once by hand to check the output before it goes on the schedule.
:::

## The job description

```text
Every Monday at 7:00, prepare the weekly SEO brief for [site].
Read: Search Console Performance (last 7 days vs the 7 days before),
Pages (indexing), and the Generative AI performance report if available.
Also read the Refresh Log tab in [sheet].
Never change the site, Search Console settings or the sheet. Never publish.
Send me the brief in this format, under 250 words:
1. Headline: clicks, impressions and AI-feature impressions vs last week
2. Movers: up to 3 pages up and 3 down, with the likely reason
3. Problems: any page newly not indexed, and the reason Search Console gives
4. New queries: queries with 20+ impressions that no page targets yet
5. Refreshed pages: how each page in the Refresh Log has done since
6. Three suggested actions, each one line, each needing my OK
```

:::infographic
id: fig-2
type: anatomy
title: The Monday brief
shows: A one-page brief with six labelled parts: the headline numbers with arrows, movers up and down, problems (one page newly "Crawled, currently not indexed"), new queries (two queries with no target page), refreshed pages with a small trend, and three suggested actions each with Approve and Skip buttons.
data: none
alt: The Monday brief: headline numbers, pages that moved, new problems, new queries without a page, how refreshed pages are doing, and three actions waiting for your OK.
:::

:::video
id: gf-l8-reading-the-brief
kind: inline
status: paused
src: /learn/video/get-found/gf-l8-reading-the-brief.mp4
captions: /learn/video/get-found/gf-l8-reading-the-brief.vtt
poster: /learn/video/get-found/gf-l8-reading-the-brief.jpg
transcript: Here's a Monday brief for Groomer Books. Clicks up 8 percent. The refreshed tax page is up again. One page is newly not indexed, an old tag page, which is fine. Two new queries have no page, including "can groomers write off dog shampoo". Three suggested actions: add that question to the bank, compress one slow image, and link the new pillar page from the pricing guide. We approve two and skip one. Five minutes.
:::

:::warning
Watch for an agent that starts doing instead of reporting: "I've updated the title to fix this." Its job description says never change anything. If it does, stop the routine, check what changed, and tighten its permissions before you turn it back on.
:::

:::try-it
Write down the three numbers you'd want to see every Monday if you could only see three. Put them at the top of your agent's brief format.
:::

:::checkpoint
Q: What access should your weekly SEO agent have in Search Console?
- [ ] Owner, so it can fix problems
- [ ] Your own Google login
- [x] Its own login, added as a Restricted user
Why: The agent only needs to read. A Restricted user can view the data but can't change settings or add users, so a mistake can't break anything.
:::

:::takeaways
- A Monday SEO brief keeps the rest of the course working, for five minutes a week.
- Use one always-on agent you already run: Marketing Bot, Dots or a Claude Code session.
- Give it its own login as a Restricted user, and no power to merge or publish.
- The brief ends with three suggested actions. Each one waits for your OK.
:::

## Go deeper

- [Search Console: Managing owners, users and permissions](https://support.google.com/webmasters/answer/7687615) - Owner, Full and Restricted permissions
- [Grok Bot overview](https://docs.x.ai/grok-bot/overview) - Bots, routines and approvals
- [Search Console API](https://developers.google.com/webmaster-tools) - how tools read Search Console data
