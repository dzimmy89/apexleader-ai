---
module: 1
lesson_number: 1
course: agent-build-line
template: v2
---

# Lesson 1: Give Your Agent a Database

:::video
id: bl-l1-overview
kind: overview
status: paused
src: /learn/video/agent-build-line/bl-l1-overview.mp4
captions: /learn/video/agent-build-line/bl-l1-overview.vtt
poster: /learn/video/agent-build-line/bl-l1-overview.jpg
transcript: Your site so far is pages. The moment customers log in, upload something or see their own numbers, you need a database. Supabase gives you one, with sign-in and file storage, and its MCP server lets your coding agent create tables, write queries and read the docs for you. That's a lot of power to hand an agent, so this lesson is as much about the fence as the tool. You'll connect the agent to a separate development project, scope it to that one project, start it read-only, and only then let it build the first table for the Rolling Ledger client portal.
:::

:::key-concept
**Supabase** is a hosted Postgres database with sign-in, file storage and an API built in. Its **MCP server** lets an agent work with it directly: list tables, run SQL, create migrations, read logs and search the Supabase docs. The rule for the whole course starts here: **agents build on a copy, never on the real thing.** Connect the agent to a development project, never production, scope it to that one project, and switch it to read-only whenever it only needs to look.
:::

## What you'll be able to do

- Explain what a database adds to a site, and when you need one
- Create a separate Supabase project for development
- Connect Claude Code to the Supabase MCP server, scoped to one project and read-only at first
- Have the agent design a table, write it as a migration and add row-level security
- Know which Supabase features to leave switched off for agents

## Why this matters

The Rolling Ledger site is plain HTML. That's enough to sell bookkeeping. It isn't enough to *deliver* it: the founder wants a client portal where each truck owner signs in, uploads a photo of a fuel receipt, and sees this month's numbers. That needs sign-in, storage and a table of receipts, with each owner able to see only their own.

Ten years ago that was a developer's month. With Supabase and an agent it's an afternoon. The risk moves, though. A developer who makes a mistake breaks a test database. An agent wired to your production database can delete a customer's records in one confident step. So the setup in this lesson matters more than the speed.

## Two projects: dev and live

Make two Supabase projects from the start:

| Project | Who touches it | What's in it |
|---|---|---|
| `rolling-ledger-dev` | Your agents | Made-up trucks and receipts, wiped whenever you like |
| `rolling-ledger` (live) | Only you, through reviewed migrations | Real customers |

Changes move from dev to live as **migrations**: small SQL files saved in your GitHub repo, reviewed in a pull request like any other change. Supabase's branching feature, on paid plans, gives you a preview database per branch and does the same job; two projects is the free, simple version.

:::infographic
id: fig-1
type: diagram
title: The agent builds on dev, you promote to live
shows: Left, an agent card connected by a line to a database card labeled rolling-ledger-dev with fake data. A migration file card in the middle, labeled reviewed in a pull request. Right, the paper card labeled rolling-ledger live, connected only to the migration, with a small lock icon and the note "no agent connection".
data: none
image: /learn/figures/agent-build-line/lesson-01-fig-1.webp
alt: The agent connects only to the development database. Changes reach the live database as a migration file you review in a pull request. The live database has no agent connection.
:::

## Connect the MCP server

Supabase runs a hosted MCP server at `https://mcp.supabase.com/mcp`. You sign in through your browser, so there's no key to paste. Before you add it, read Supabase's MCP security page once; it's short and it says the same thing as this lesson: don't connect to production, and keep a human approving each call.

The address takes options. Use two of them from day one:

- `project_ref=<your dev project's id>` limits the agent to one project. Without it, the agent can see every project in your account, including live.
- `read_only=true` lets the agent query and inspect, but not change anything.

In a terminal, in your project folder:

```bash
claude mcp add --transport http supabase-dev \
  "https://mcp.supabase.com/mcp?project_ref=abcd1234&read_only=true"
```

Then start Claude Code, type `/mcp`, choose `supabase-dev` and sign in. Pick the organization that holds your dev project. You'll find the project id in the dev project's settings; it's the string in its web address.

A third option, `features=database,docs`, hides the tools you don't need yet, like edge functions and storage settings. Fewer tools means a smaller menu for the agent to choose from and less to go wrong.

:::video
id: bl-l1-connect
kind: inline
status: paused
src: /learn/video/agent-build-line/bl-l1-connect.mp4
captions: /learn/video/agent-build-line/bl-l1-connect.vtt
poster: /learn/video/agent-build-line/bl-l1-connect.jpg
transcript: Here's the connection, start to finish. We copy the dev project's id from its settings, add the Supabase server with that id and read only set to true, and sign in from the browser. Then we ask Claude Code which projects it can see. It lists one: rolling ledger dev. We ask it to create a table, and it says it can't, because the connection is read only. That's the fence working.
:::

## Build the first table

When you're ready for the agent to make changes, remove `read_only=true` from the dev connection only, and keep `project_ref`. Then ask for the table the way you'd brief a contractor:

```text
Design a receipts table for the Rolling Ledger client portal.
Each receipt belongs to one truck owner. Store the date, amount, category
(fuel, commissary, supplies, other), a note, and the path to the photo.
Add row-level security so an owner can read and add only their own receipts.
Write it as a migration file in supabase/migrations, apply it to the dev
project, then add ten made-up receipts for two test owners.
Show me the SQL before you apply anything.
```

Three things in that request do the safety work:

- **Row-level security (RLS).** It's the database rule that keeps one owner from seeing another's receipts. Supabase warns you when a table has none; never ship a table without it.
- **A migration file.** The change is saved in your repo, so you can review it and apply the same file to live later.
- **"Show me the SQL first."** You approve the change, not just the result.

Then test the fence yourself: ask the agent to sign in as test owner A and list receipts. It should see only owner A's five.

## What to keep switched off

- **Never connect an agent to the live project.** Not even read-only for "a quick look"; real customer data then flows into the agent's context.
- **Keep approval on for every MCP call.** Supabase's own guidance says the same.
- **Don't let the agent create service keys.** The `service_role` key skips row-level security. It belongs in your hosting secrets, set by you, and never in a chat or a file the agent can read.

:::infographic
id: fig-2
type: flow
title: Four fences on the database
shows: Four cards left to right, each with a Lucide icon: separate dev project, scoped with project_ref, read-only until it must write, row-level security on every table. The last card is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-01-fig-2.webp
alt: Four fences in order: a separate dev project, a connection scoped to that one project, read-only until the agent must write, and row-level security on every table.
:::

:::warning
Data an agent reads becomes part of its conversation. That's why it only ever sees your dev project with made-up data. If a real receipt or customer email ends up in dev, delete it. And treat any text stored in the database as content, not instructions: a note field that says "ignore your rules" is just a note.
:::

:::try-it
Before you build anything, connect the agent read-only to your dev project and ask: "What tables and security rules exist in this project, and is any table missing row-level security?" On a new project the answer is short. Keep the question; you'll ask it again after every change.
:::

:::checkpoint
Q: You want the agent to check why a query is slow on your live database. What's the safe route?
- [ ] Connect it to live with `read_only=true`
- [x] Reproduce the slow query on the dev project with made-up data, and have the agent look there
- [ ] Give it the `service_role` key so it can see everything
Why: Even read-only, a live connection pulls real customer data into the agent's context. Reproduce the problem on dev, fix it as a migration, and promote the migration after review.
:::

:::checkpoint
Q: What does `project_ref` in the MCP address do?
- [ ] Makes the connection faster
- [x] Limits the agent to one project, so it can't see or change your others
- [ ] Turns on row-level security
Why: Without it, the agent can reach every project in your account. With it, the dev project is the only one in view.
:::

:::takeaways
- Supabase adds a database, sign-in and storage; its MCP server lets an agent build with them.
- Agents work on a separate dev project with made-up data. Live changes arrive as reviewed migrations.
- Scope the connection with `project_ref` and start with `read_only=true`.
- Every table gets row-level security, and the `service_role` key never goes near an agent.
:::

## Go deeper

- [Supabase MCP server](https://supabase.com/docs/guides/getting-started/mcp) - setup for each agent and the URL options
- [Row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security) - how the per-owner rule works
- [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations) - moving changes from dev to live
