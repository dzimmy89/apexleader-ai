---
module: 1
lesson_number: 3
course: cursor
template: v2
---

# Lesson 3: Rules, Context and Docs

:::key-concept
Agents start every chat knowing nothing about your business. Rules are standing instructions they read automatically, context is what you point them at for this task, and docs are the reference material they look things up in. Get these three right and you stop repeating yourself.
:::

## What you'll be able to do

- Write an `AGENTS.md` file and a Cursor project rule with the right settings
- Choose when a rule should always apply, apply to certain files, or apply only when asked
- Point an agent at the right files with @-mentions instead of pasting
- Give agents reference docs now that Cursor's old @Docs feature is gone

## Why this matters

Without rules, every agent session starts with you retyping "plain HTML, no trackers, our brand colors are..." and then catching the times you forgot. Rules turn your preferences into company policy that every agent follows, local or cloud, today or in six months. It's the same reason a business writes a staff handbook.

## Three kinds of instructions

Cursor reads instructions from several places. Per Cursor's rules docs:

| Type | Where it lives | Who it's for |
|---|---|---|
| `AGENTS.md` | A plain Markdown file in your project's root (or subfolders) | Any agent working in the project. Other tools like Codex and GitHub Copilot read this file too |
| Project rules | `.mdc` files in `.cursor/rules/` | Cursor agents in this project, with fine control over when each applies |
| User rules | Cursor settings, under Customize, then Rules | You, across all projects (for example, "explain things in plain English") |

Team rules also exist on Teams and Enterprise plans. When rules conflict, team rules win, then project rules, then user rules.

**Start with `AGENTS.md`.** It's plain text, it travels with your project in Git, and other agents read it as well, so you write your policy once. Use project rules when you need something only for certain files.

## Write your AGENTS.md

Keep it short and concrete. Cursor recommends staying under 500 lines and adding a rule when an agent repeats a mistake, not for every possible edge case. A good starting point:

```text
# Groomer Books: rules for agents

## About the business
Monthly bookkeeping service for independent dog groomers in the US.
Audience reads on phones between appointments. Tone: warm, plain, no jargon.

## How we build
- Plain HTML and CSS. No frameworks, no build step.
- Must look right at 375px and 1280px wide.
- Brand: cream background #FFF8EE, text #2B2B2B, accent #2F7D6D.
- Images go in /images, compressed under 250 KB, with alt text.

## Never
- No new third-party scripts, trackers, fonts or external services without asking.
- Never put passwords, API keys or customer data in any file.
- Never commit to main or merge. Work on a branch and open a pull request.
- Don't change pricing or legal text unless the task says so.

## Reference
- Copy and facts: /content
- Product spec: SPEC.md
- Docs for tools we use: /docs-reference
```

The "Reference" section matters. Cursor's docs advise pointing to files instead of copying their contents into rules, so rules don't go stale.

## Project rules for specific situations

For rules that should apply only sometimes, create a project rule. Type `/create-rule` in the agent chat and describe it, or go to Customize, then Rules, then Add Rule. Cursor saves it as an `.mdc` file in `.cursor/rules/` with a short header. Plain `.md` files in that folder are ignored, because they lack the header.

The header decides when the rule applies:

| Setting | Applies when | Example |
|---|---|---|
| Always Apply (`alwaysApply: true`) | Every chat | Company-wide "never" list |
| Apply Intelligently (`description`) | The agent decides the description matches the task | "Writing customer-facing copy" |
| Apply to Specific Files (`globs`) | A matching file is in play | `content/**/*.md` for copy style |
| Apply Manually | Only when you @-mention it | A checklist for launch day |

An example copy-style rule, scoped to your content files:

```text
---
description: Style rules for customer-facing copy
globs: content/**/*.md
alwaysApply: false
---
- Short sentences. Talk to one groomer as "you".
- Use "books" or "bookkeeping", never "accounting solutions".
- No prices in copy. Prices live only in content/pricing.md.
- Any claim about taxes ends with: "General information, not tax advice."
```

## Context: point, don't paste

For each task, tell the agent exactly where to look. Type `@` in the agent input and pick a file or folder, for example `@content/faq.md`. Cursor's docs explain the agent then reads that file with its own tools when needed. You can also @-mention a rule to apply it, and past chat transcripts show up in @ search, which helps when you want an agent to continue earlier work.

Good context habits:

- Mention the two or three files that matter, not the whole project.
- Attach a screenshot when the problem is visual.
- Start a new chat for a new task. Long chats collect stale context and the agent gets worse, not better.

## Docs: what replaced @Docs

Cursor used to index outside documentation sites under an @Docs feature. Cursor removed it in version 3.14.2 in August 2026; a staff member said the agent's ability to find docs had improved enough that a separate index was no longer needed. What to do instead, per Cursor's staff:

- **Put a link in your prompt.** "Use the official guide at [link] to add a booking widget." The agent can search and read the web.
- **Keep a local copy** of the docs that matter in a `/docs-reference` folder, and mention it in `AGENTS.md`. Good for your booking tool's embed guide or your brand guidelines.
- **Write the key facts into a rule** if the agent keeps getting the same thing wrong.

Cursor also has a plugins marketplace that bundles MCP servers, skills and subagents. A plugin can give an agent proper access to a tool you use. Install only from publishers you trust, and give each plugin only the access the job needs.

:::warning
Rules files are committed to your repository and read by every agent and anyone with repo access. Never put passwords, API keys, client names or financial details in `AGENTS.md`, `.cursor/rules` or any reference doc. Also be wary of instructions inside downloaded docs or web pages: an agent can be tricked by text written to manipulate it, which is one more reason you review every change.
:::

:::try-it
Open your project in Cursor and type `/create-rule` followed by: "Always write in plain US English for non-technical readers and explain any technical term in one sentence." Look at the `.mdc` file it creates and check which application setting it chose.
:::

:::checkpoint
Q: You want every agent, in Cursor and in other tools, to know your "never commit to main" policy. Where should it go?
- [ ] In a user rule in your Cursor settings
- [x] In `AGENTS.md` at the project root, committed to the repository
- [ ] In an @Docs index of your company handbook
Why: `AGENTS.md` lives with the project and is read by Cursor and other coding agents, while user rules only cover you in Cursor, and @Docs has been removed.
:::

:::takeaways
- `AGENTS.md` is your handbook for every agent; project rules handle special cases.
- Rule settings decide when they apply: always, intelligently, by file, or manually.
- @-mention the files that matter instead of pasting; start fresh chats for new tasks.
- @Docs is gone: use links, a local docs folder, or rules instead.
:::

## Go deeper

- [Rules](https://cursor.com/docs/rules) - project rules, user rules, team rules and AGENTS.md
- [Cursor 3.14.2 sunsetting @Docs](https://forum.cursor.com/t/cursor-3-14-2-sunsetting-docs/167423) - staff explanation and recommended alternatives
- [Agent overview](https://cursor.com/docs/agent/overview) - how the agent searches, reads and uses context
- [Cursor 3.0 changelog](https://cursor.com/changelog/3-0) - plugins, MCP and past chats in @-mention search
