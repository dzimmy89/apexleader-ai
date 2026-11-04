---
module: 1
lesson_number: 4
course: agent-skills
template: v2
---

# Lesson 4: Give Your Agent Eyes and Brakes

:::video
id: sk-l4-overview
kind: overview
status: paused
src: /learn/video/agent-skills/sk-l4-overview.mp4
captions: /learn/video/agent-skills/sk-l4-overview.vtt
poster: /learn/video/agent-skills/sk-l4-overview.jpg
transcript: Skills tell your agent how to work. Plugins can also change what it can see and what it's allowed to get away with. Three free ones matter most for a solo founder. A language server plugin lets the agent see errors the moment it makes them, the way a code editor does. The security guidance plugin reviews every change for risky code before you ever see it. And Context7 makes the agent read the current documentation for a tool before it writes code against it, so it stops using last year's instructions. In this lesson you'll install all three on the Rolling Ledger site.
:::

:::key-concept
An agent without plugins works like a builder with no level and no inspector: it guesses whether things are straight and whether they're safe. Three plugins fix that. A **language server (LSP) plugin** gives it **eyes**: it sees errors and connections in the code as it edits. The **security guidance** plugin is the **brakes**: it flags risky changes before they land. **Context7** is the **manual**: it fetches the current docs for any library before the agent uses it.
:::

## What you'll be able to do

- Install a language server plugin and see the agent catch its own errors
- Install the security guidance plugin, add your own rules, and know what it costs
- Set up Context7 and make the agent check current docs before touching an API
- Know when to turn each one off

## Why this matters

The two most common ways agent code goes wrong are quiet ones. It uses an old version of a tool's instructions, because that's what it learned, so the code looks right and fails. Or it writes something that works but isn't safe, like a form that trusts whatever a visitor types. You'd only catch either if you read the code closely, and the point of having agents is that you don't have to. These plugins do the close reading for you.

:::infographic
id: fig-1
type: diagram
title: Eyes, brakes and a manual
shows: One agent card in the centre with three cards around it. Eyes: language server, sees errors and connections as it edits. Brakes: security guidance, flags risky edits before they land. Manual: Context7, reads current docs before using a library. The brakes card is the paper card.
data: none
image: /learn/figures/agent-skills/lesson-04-fig-1.webp
alt: Three plugins around one agent: a language server lets it see errors as it edits, security guidance flags risky edits before they land, and Context7 gives it current docs before it uses a library.
:::

## 1. Eyes: a language server plugin

A language server is the part of a code editor that underlines mistakes and knows where everything is defined. Claude Code can use one through a plugin. After each edit, the agent sees the same errors you'd see in an editor, and it can jump to where something is defined or find every place it's used.

Anthropic's official directory has language server plugins for most languages. Pick the one for your code:

| Your code | Plugin | Also install |
|---|---|---|
| JavaScript or TypeScript (including plain `.js` files) | `typescript-lsp` | `npm install -g typescript-language-server typescript` |
| Python | `pyright-lsp` | `npm install -g pyright` |

Then in Claude Code:

```text
/plugin install typescript-lsp@claude-plugins-official
```

The plugin only connects Claude Code to the language server; the second command installs the server itself. If you skip it, the plugin has nothing to talk to.

## 2. Brakes: the security guidance plugin

Anthropic's `security-guidance` plugin (version 2.0.17 as of November 2026) reviews code the agent writes, in three layers:

1. **Pattern warnings.** Instant, free reminders when an edit matches one of about 25 known-dangerous patterns, such as a hardcoded secret or raw HTML inserted from user input.
2. **A review when the agent finishes.** The changes go to a fast model, and any serious finding goes back to the agent to fix before you see the answer.
3. **A review when you commit.** A reviewer reads related files to catch problems that span several files, like a page that skips the login check.

It looks for injection, cross-site scripting, hardcoded secrets, broken access checks and more than 20 other problem types.

Install it in Claude Code:

```text
/plugin install security-guidance@claude-plugins-official
```

It needs Claude Code 2.1.144 or later and Python 3.8 or later on your computer.

### Add your own rules

Write rules specific to your business in `.claude/claude-security-guidance.md` in your project, and commit it. For Rolling Ledger:

```markdown
# Rolling Ledger security rules
- The contact form must never store card numbers or bank details.
- Client names and emails never appear in page source, logs or error messages.
- No new third-party scripts on any page without asking first.
```

The reviews send your changes, and these rules, to the model on every review, so never put secrets in this file.

:::infographic
id: fig-2
type: flow
title: Three checks before risky code lands
shows: A left-to-right flow of one change. First an edit is checked against known patterns (instant, free). Then, when the agent finishes, a model reviews the diff and sends findings back to fix. Then, on commit, a reviewer reads related files. The last step, "you review a cleaner change", is the paper card.
data: none
image: /learn/figures/agent-skills/lesson-04-fig-2.webp
alt: A change passes three checks: a pattern check on each edit, a model review when the agent finishes, and a deeper review on commit. Then you review a cleaner change.
:::

### What it costs and when to turn it off

- **It uses your plan.** The second and third layers make model calls through your Claude Code sign-in (or an API key, if you've set one). On a busy day that's noticeable. Watch your usage for the first week, as you did in the T3 Code course.
- **Parallel agents.** If several agents share one folder, set `ENABLE_STOP_REVIEW=0` so one agent's review doesn't trip over another's changes, and keep the commit review on.
- **Kill switch.** `SECURITY_GUIDANCE_DISABLE=1` turns the whole plugin off.

It's a second pair of eyes, not a guarantee. You still review every pull request before it goes live.

:::video
id: sk-l4-security-guidance
kind: inline
status: paused
src: /learn/video/agent-skills/sk-l4-security-guidance.mp4
captions: /learn/video/agent-skills/sk-l4-security-guidance.vtt
poster: /learn/video/agent-skills/sk-l4-security-guidance.jpg
transcript: Here we ask the agent to add a contact form to the Rolling Ledger site, and it writes the visitor's message straight into the page. The security guidance plugin flags it as a cross-site scripting risk before the agent replies, and the agent fixes it on its own. Then we add our own rule, never store card numbers, and commit it. Every review from now on checks that rule too.
:::

## 3. The manual: Context7

Agents learned from code written before their training ended. Tools change after that. Context7, made by Upstash, fetches the current, version-specific docs for a library and hands them to the agent before it writes code.

### Set it up

The quickest route is its setup command, which needs Node 22.13 or newer:

```bash
npx ctx7 setup --claude
```

It signs you in, creates a free API key, and installs a skill that tells the agent when to fetch docs. Use `--cursor` or `--opencode` for those agents. In Claude Code you can also install it from the official directory:

```text
/plugin install context7@claude-plugins-official
```

It works without a key, but a free key from the Context7 dashboard gives you higher limits.

### Use it

If you used the setup command, the skill fetches docs on its own when a job involves a library. Otherwise, add "use context7" to your request:

```text
Add a booking form to the Rolling Ledger site that sends to our form service.
Check the form service's current docs before writing any code. use context7
```

To make it automatic for one project, add a line to `CLAUDE.md`: "Always use Context7 for library or API documentation, setup or configuration steps."

:::video
id: sk-l4-context7
kind: inline
status: paused
src: /learn/video/agent-skills/sk-l4-context7.mp4
captions: /learn/video/agent-skills/sk-l4-context7.vtt
poster: /learn/video/agent-skills/sk-l4-context7.jpg
transcript: Without Context7, the agent writes the booking form using an option the form service renamed months ago, and it fails. With Context7, the agent first looks up the service's current docs, finds the new name, and the form works on the first try. Same request, one extra line: use context7.
:::

:::warning
Each plugin adds something that runs or reads on your behalf. The security plugin sends your code changes to a model for review, and Context7 sends your questions about a library to Context7's service. Neither should ever see a password or API key, so keep those in `.env` files the agent can't edit, as you set up in Claude Code Lesson 5.
:::

:::try-it
Install `typescript-lsp` and its language server. Ask the agent: "Rename a function in this project and tell me every file the change touches, using the language server." Compare its answer with a plain text search for the same name.
:::

:::checkpoint
Q: You installed the `typescript-lsp` plugin, but the agent still doesn't see errors. What's the likely cause?
- [ ] The plugin only works in Cursor
- [x] The language server itself isn't installed, so run `npm install -g typescript-language-server typescript`
- [ ] You need a paid plan
Why: The plugin only connects Claude Code to a language server. The server is a separate program you install once.
:::

:::checkpoint
Q: Your agent writes code for a tool that changed its setup last month. What prevents it from using the old instructions?
- [ ] The security guidance plugin
- [x] Context7, which fetches the tool's current docs first
- [ ] A longer prompt
Why: Context7 pulls current, version-specific docs into the agent's context before it writes code, so it doesn't rely on what it learned in training.
:::

:::takeaways
- A language server plugin lets the agent see errors and connections as it edits. Install the server too.
- Security guidance checks edits, finished turns and commits, and takes your own rules in `.claude/claude-security-guidance.md`.
- Its reviews use your plan. Turn off the finish-time review when agents share a folder.
- Context7 fetches current docs; set it up with `npx ctx7 setup` or add "use context7" to a request.
:::

## Go deeper

- [Claude Code plugins directory](https://github.com/anthropics/claude-plugins-official) - the official plugins, including the language servers
- [security-guidance](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance) - layers, settings and privacy
- [typescript-lsp](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/typescript-lsp) - setup for JavaScript and TypeScript
- [Context7](https://github.com/upstash/context7) - setup for each agent and how it picks docs
