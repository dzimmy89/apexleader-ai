---
module: 1
lesson_number: 1
course: agent-skills
template: v2
---

# Lesson 1: Skills That Travel Between Agents

:::video
id: sk-l1-overview
kind: overview
status: paused
src: /learn/video/agent-skills/sk-l1-overview.mp4
captions: /learn/video/agent-skills/sk-l1-overview.vtt
poster: /learn/video/agent-skills/sk-l1-overview.jpg
transcript: Every time you explain how you like things done, your agent forgets it by tomorrow. A skill fixes that. It's a short instruction file the agent loads when the job calls for it, so you explain once and every session after that starts out knowing. The good news for a solo founder is that skills now use one open format, so the same skill can work in Claude Code, Codex, Cursor and OpenCode. In this lesson you'll learn what skills, plugins and marketplaces are, install a shared collection called wshobson agents, and set the trust rules you'll use for every skill after this.
:::

:::key-concept
A **skill** is a folder with a `SKILL.md` file: a name, a one-line description of when to use it, and the steps to follow. Your agent reads the descriptions of every skill it has, and loads the full steps only when a job matches. A **plugin** is a bundle of skills, commands and helper agents you install in one go, and a **marketplace** is a list of plugins you can install from. Skills follow an open standard, so one skill can serve several agents. Think of a skill as a standard operating procedure pinned to the wall: any contractor who walks in reads it before starting that job.
:::

## What you'll be able to do

- Explain the difference between a skill, a plugin, a marketplace and a project file like `CLAUDE.md`
- Add a marketplace and install a plugin in Claude Code and in Codex
- Install a single skill into any agent with the `npx skills` installer
- Decide whether a skill is safe to install before you install it

## Why this matters

You've already written rules for your agents: a `CLAUDE.md` in the Claude Code course, rules in the Cursor course, and a `t3.json` in the T3 Code course. Those files load in every session, so they need to stay short. Skills are for everything else, the procedures you only need sometimes, like "how we write a spec" or "how we review a pricing page." They cost almost nothing until they're used, because the agent only reads the one-line description until a job matches.

The second reason is that you probably use more than one agent now. If your spec process lives only in Claude Code, Codex will do it differently. A skill in the shared format fixes that: one procedure, every agent.

## Rules files, skills and plugins

| Piece | What it is | Loads | Good for |
|---|---|---|---|
| `CLAUDE.md`, `AGENTS.md`, Cursor rules | One file of project rules | Every session | Facts about the project and rules that always apply |
| Skill | A folder with `SKILL.md`, sometimes with scripts or examples | Only when a job matches its description | A procedure you repeat, like writing a spec |
| Plugin | A bundle of skills, commands, helper agents, hooks or connectors | Its parts load the same way as above | Installing a whole kit at once |
| Marketplace | A list of plugins, usually a GitHub repo | Never; it's a catalog | Finding and updating plugins |

:::infographic
id: fig-1
type: diagram
title: One skill, every agent
shows: A single paper card labeled SKILL.md in the middle, with its three parts listed (name, when to use, steps). Lines run from it to four agent cards around it: Claude Code, Codex, Cursor and OpenCode. A small note at the bottom says the agent reads only the description until a job matches.
data: none
image: /learn/figures/agent-skills/lesson-01-fig-1.webp
alt: One SKILL.md file, with a name, a when-to-use line and steps, connects to Claude Code, Codex, Cursor and OpenCode. Each agent reads only the description until a job matches.
:::

## A shared collection: wshobson/agents

The most widely shared collection is **wshobson/agents** on GitHub. As of November 2026 it lists 94 plugins holding 202 helper agents, 185 skills and 105 commands, under the MIT license. The plugins cover code review, testing, JavaScript and TypeScript, Python, security scanning, infrastructure and more. The same source is adapted for Claude Code, Codex, Cursor, OpenCode, GitHub Copilot, Antigravity and Pi.

You don't want all 94. Pick the one or two that match how you build. For a founder whose site is HTML, CSS and JavaScript, like the Groomer Books site, start with:

| Plugin | Use it for |
|---|---|
| `javascript-typescript` | JavaScript and TypeScript work and project setup |
| `developer-essentials` | Code review, debugging, Git and testing habits |

### Install in Claude Code

Inside a Claude Code session, add the marketplace once, then install the plugin:

```text
/plugin marketplace add wshobson/agents
/plugin install javascript-typescript@claude-code-workflows
```

`claude-code-workflows` is the name the collection's marketplace goes by. Type `/plugin` on its own to browse what's installed and switch plugins on or off.

### Install in Codex

In a terminal, with a current Codex CLI:

```bash
codex plugin marketplace add wshobson/agents
codex plugin add javascript-typescript@claude-code-workflows
```

### One skill into any agent

If you want a single skill and not a whole plugin, use the open `skills` installer. It asks which agent to install for:

```bash
npx skills add wshobson/agents --skill <skill-name>
```

GitHub's own CLI does the same with `gh skill install wshobson/agents <skill-name>` (it needs GitHub CLI 2.90 or later). Both copy just the skill, without the plugin's commands or hooks.

:::video
id: sk-l1-install-a-plugin
kind: inline
status: paused
src: /learn/video/agent-skills/sk-l1-install-a-plugin.mp4
captions: /learn/video/agent-skills/sk-l1-install-a-plugin.vtt
poster: /learn/video/agent-skills/sk-l1-install-a-plugin.jpg
transcript: Here's the install in Claude Code. We add the wshobson agents marketplace, then install the JavaScript and TypeScript plugin. Typing slash plugin shows it installed, with its skills listed. Now in Codex, the same two steps run from the terminal. Last, we install one skill on its own with npx skills add, and the installer asks which agent it's for. Same skill, three ways in.
:::

## Trust before you install

A skill is instructions your agent will follow, and some skills include scripts it will run on your computer. Anthropic's own plugin directory warns that it can't verify what third-party plugins contain or that they won't change. So treat a skill like a new contractor's references:

1. **Read the `SKILL.md` before installing.** On GitHub it's a short text file. If you can't tell what it does, don't install it.
2. **Check for scripts.** Look for a `scripts/` folder or commands in the steps. Ask your agent: "Read this skill and list every command it would run and every file it would change."
3. **Prefer known sources.** Anthropic's official directory (`claude-plugins-official`), well-known maintainers, and collections with many users and recent updates.
4. **Install per project when you can.** A skill installed into one project can't wander into the others.
5. **Keep approval on.** A skill doesn't change your permission mode. Supervised or ask-first stays on, as you set in The One-Person Company.

:::infographic
id: fig-2
type: flow
title: Five checks before a skill goes in
shows: Five small cards left to right, each with a Lucide icon and two to three words: read the SKILL.md, look for scripts, check the source, install per project, keep approval on. The last card is the paper card.
data: none
image: /learn/figures/agent-skills/lesson-01-fig-2.webp
alt: Five checks in order: read the SKILL.md, look for scripts, check the source, install per project, and keep approval on.
:::

:::video
id: sk-l1-trust-check
kind: inline
status: paused
src: /learn/video/agent-skills/sk-l1-trust-check.mp4
captions: /learn/video/agent-skills/sk-l1-trust-check.vtt
poster: /learn/video/agent-skills/sk-l1-trust-check.jpg
transcript: Before a skill goes in, read it. Here we open a skill's SKILL.md on GitHub. It's one page of plain steps. Then we ask Claude Code to list every command the skill would run and every file it would touch. This one runs no scripts and only reads files, so it passes. If the answer had included a script that sends data somewhere, we'd stop there.
:::

:::warning
Never install a skill you haven't read. Skills can include scripts that run with your permissions, and a plugin can add hooks or connectors as well as skills. Don't put passwords, API keys or client data inside a skill file: skills are often shared and committed to GitHub.
:::

:::try-it
In Claude Code, type `/plugin` and look at what's already installed. Then ask: "Which skills do you have available right now, and what's the one-line description of each?" Note how many there are before you add any.
:::

:::checkpoint
Q: You want your agent to always know your site is plain HTML and CSS, hosted on GitHub Pages. Where does that go?
- [ ] A new skill called "site-facts"
- [x] Your project rules file, such as `CLAUDE.md` or `AGENTS.md`
- [ ] A marketplace
Why: Facts that apply to every session belong in the project rules file, which loads every time. Skills are for procedures you need only sometimes, and they load only when a job matches.
:::

:::checkpoint
Q: A skill you found on a forum includes a script you don't understand. What do you do?
- [ ] Install it and watch what happens
- [ ] Install it, since skills can't run anything
- [x] Don't install it until you or your agent can explain every command it runs
Why: Skills can run scripts with your permissions. Read the skill and ask your agent to list every command and file it touches. If you can't explain it, leave it out.
:::

:::takeaways
- A skill is a `SKILL.md` procedure your agent loads only when a job matches. Rules files load every session.
- Plugins bundle skills; marketplaces list plugins. wshobson/agents is one shared collection for many agents.
- Install with `/plugin` in Claude Code, `codex plugin` in Codex, or `npx skills add` for one skill into any agent.
- Read every skill, check for scripts, prefer known sources, and keep approval on.
:::

## Go deeper

- [wshobson/agents](https://github.com/wshobson/agents) - the plugin collection, install routes for each agent, and the plugin catalog
- [Agent Skills standard](https://agentskills.io) - the open format skills share across agents
- [Anthropic's skills repository](https://github.com/anthropics/skills) - example skills and a skill template
- [Claude Code plugins](https://code.claude.com/docs/en/plugins) - how plugins, marketplaces and `/plugin` work
