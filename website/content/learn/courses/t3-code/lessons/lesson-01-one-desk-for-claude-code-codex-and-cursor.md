---
module: 1
lesson_number: 1
course: t3-code
template: v2
---

# Lesson 1: One Desk for Claude Code, Codex and Cursor

:::video
id: t3-l1-overview
kind: overview
status: paused
src: /learn/video/t3-code/t3-l1-overview.mp4
captions: /learn/video/t3-code/t3-l1-overview.vtt
poster: /learn/video/t3-code/t3-l1-overview.jpg
transcript: You already pay for Claude, ChatGPT or Cursor, and each one comes with its own coding agent and its own window. T3 Code is a free app that puts all of them on one desk. It doesn't sell you tokens and it doesn't add any. It drives the logins you already have, so you can run Claude Code and Codex side by side on the Rolling Ledger site, compare their work, and see what each one used. In this lesson you'll learn what T3 Code is, what it isn't, and how to set it up safely.
:::

:::key-concept
T3 Code is a free, open-source control desk for coding agents. It doesn't come with an AI of its own. It runs the agents you already pay for, such as Claude Code, Codex and Cursor, from one window, using each one's own login. Think of it as one office with a door for each contractor: the contractors and their bills stay the same, but you can see and manage all of them in one place.
:::

## What you'll be able to do

- Explain what T3 Code does and doesn't do, and how it differs from T3 Chat
- Install T3 Code and connect two or more agents you already pay for
- Start a thread on your main folder or in its own worktree
- Set safe permissions, and know where your code and prompts go

## Why this matters

By now you've met three builders: Claude Code, Cursor and Codex. Each lives in its own app, keeps its own history and counts usage its own way. Most solo founders end up paying for two of them and using one, because switching is a hassle. T3 Code removes that hassle. With every agent on one desk, you can give each job to the plan that handles it best, run two jobs at once without them colliding, and see in one place what you've used. Lessons 2 to 4 turn that into real savings. This lesson gets the desk set up.

## What T3 Code is, as of November 2026

T3 Code is made by Ping Labs, the company behind Theo Browne's t3.gg channel and the T3 Stack. Its site is t3.codes.

- **Free and open source.** It uses the MIT license. Its FAQ says there's nothing to buy and no way to pay for it.
- **Bring your own plans.** It works with your Claude Code, Codex, Cursor, Grok, OpenCode and Google Antigravity logins. You keep paying those providers exactly as before.
- **Everywhere.** There's a desktop app for Mac, Windows and Linux, a command-line version, a web client and phone apps for iOS and Android.
- **Very early.** Version 0.1.0 shipped on October 15, 2026, and 0.1.6 on October 31. The project's own page says "Expect bugs." This lesson was written against 0.1.6, so if a menu has moved, look for it under Settings.

Don't confuse it with **T3 Chat**, Theo's separate paid chat app. T3 Chat is a chatbot. T3 Code is a desk for coding agents.

:::infographic
id: fig-1
type: diagram
title: T3 Code is the desk, not the worker
shows: Three layers from bottom to top. Your plans (Claude, ChatGPT, Cursor) at the bottom, each agent's own login in the middle (Claude Code, Codex, Cursor), and T3 Code on top as one window where you, on the paper card, give the jobs and approve the changes.
data: none
image: /learn/figures/t3-code/lesson-01-fig-1.webp
alt: Your Claude, ChatGPT and Cursor plans power Claude Code, Codex and Cursor through their own logins. T3 Code sits on top as one window, and you give the jobs and approve the changes.
:::

### What it doesn't do

- **It doesn't add tokens.** Every job still counts against the plan of the agent doing it.
- **It doesn't install the agents.** You install and sign in to each agent first. T3 Code then finds them.
- **It doesn't pool accounts.** It won't switch between several accounts for the same provider to dodge limits. The FAQ says that's to protect you from bans, and this course follows the same rule.

## Setting it up

You need at least one coding agent already installed and signed in on the computer that will do the work. If you took the Claude Code, Cursor and Codex courses, you're most of the way there.

1. **Sign in to each agent's own tool on this computer.** For Claude Code that's `claude auth login`, and for Codex it's `codex login`. Cursor signs in through your browser from inside T3 Code.
2. **Install T3 Code.** Use the desktop app from t3.codes (Homebrew on a Mac: `brew install --cask t3-code`), or try it from a terminal with `npx t3@latest`, which needs Node 22.16 or newer. Intel Macs use the desktop app.
3. **Check the providers.** Open **Settings → Providers**. Each agent it found shows as ready. Cursor, Grok and OpenCode have to be switched on there first.
4. **Add a project.** Point T3 Code at your site's folder, for example the Rolling Ledger site from Build the Product and Site. Only add folders that hold one project.

:::video
id: t3-l1-install-and-connect
kind: inline
status: paused
src: /learn/video/t3-code/t3-l1-install-and-connect.mp4
captions: /learn/video/t3-code/t3-l1-install-and-connect.vtt
poster: /learn/video/t3-code/t3-l1-install-and-connect.jpg
transcript: Here's the setup on a Mac. First we check that Claude Code and Codex are signed in. Then we install T3 Code and open Settings, then Providers. Claude Code and Codex show as ready. Cursor is off, so we switch it on and sign in through the browser. Finally we add the Rolling Ledger site as a project. If a provider stays grey, its tool isn't installed or isn't signed in on this computer.
:::

If a provider stays grey, the cause is almost always that its tool isn't installed, isn't signed in, or isn't on the computer's path. Sign in again in a terminal on that computer, or set the tool's location in that provider's settings.

## Threads, folders and worktrees

Every job in T3 Code is a **thread**. A thread remembers which agent and model it uses, which folder it works in, every message and every change. Threads stay on the computer doing the work, even after you close the window.

When you start a thread, you choose where it works:

| Where | What it means | Use it for |
|---|---|---|
| Current checkout | Works directly in your project folder | One small job you're watching |
| New worktree | Its own copy and branch of the project, sharing the same history | Anything risky, or two agents at once |

The rule from the Cursor course still holds: **one agent, one job, one copy of the project.** Two threads in the same folder can edit the same file and undo each other's work, which wastes both time and tokens.

:::video
id: t3-l1-threads-and-worktrees
kind: inline
status: paused
src: /learn/video/t3-code/t3-l1-threads-and-worktrees.mp4
captions: /learn/video/t3-code/t3-l1-threads-and-worktrees.vtt
poster: /learn/video/t3-code/t3-l1-threads-and-worktrees.jpg
transcript: A thread is one job for one agent. Here, Claude Code fixes the Rolling Ledger booking form in the main folder while Codex builds a new pricing section in its own worktree. Each has its own copy, so neither can overwrite the other. When a job is done, its branch becomes a pull request, and you decide whether it goes in.
:::

## Permissions and privacy

T3 Code has four permission modes: **Supervised**, **Auto-accept edits**, **Auto** and **Full access**. As of version 0.1.6 the default is **Full access**, which lets an agent run any command without asking. Change it. Use **Supervised** while you learn, so every command waits for your OK, the same approval rule you set in The One-Person Company.

:::infographic
id: fig-2
type: flow
title: Where your work goes
shows: A left-to-right flow. Your computer, where T3 Code and the agents run, sends your code and prompts straight to each provider (Anthropic, OpenAI, Cursor). A thin dashed line to Ping Labs carries only usage counts (provider, model, token totals), with a note that you can turn it off.
data: none
image: /learn/figures/t3-code/lesson-01-fig-2.webp
alt: Your code and prompts go from your computer straight to each provider. Ping Labs receives only usage counts such as provider, model and token totals, and you can switch that off.
:::

Per T3 Code's FAQ:

- Your code and prompts go from your computer straight to each provider. They don't pass through T3's servers.
- T3 Code sends basic product usage data such as provider, model and token totals, but no prompts or file contents. To turn it off, set the environment variable `T3CODE_TELEMETRY_ENABLED=false` on the computer that runs it.

## Two limits to know about

- **Claude's 5-hour window can run down faster.** T3 Code's FAQ says Claude usage through T3 Code can use up the 5-hour limit faster than the Claude Code app does. It blames a bug on Anthropic's side that affects every tool built on Claude's Agent SDK, and says weekly limits aren't affected. Watch your Claude usage for the first week. Lesson 4 shows you how.
- **Your terms still apply.** The FAQ says T3 Code stays within the terms of Claude Code, Codex and Antigravity, and that it built the Cursor and Grok connections with SpaceXAI. It also says it can't promise nobody will ever be banned. Use one personal account per provider, and a separate work account if you have one. Never use tools that pool or rotate several accounts.

:::warning
T3 Code's default permission mode lets agents run any command. Switch to Supervised before your first real task. Only add project folders, never your whole home folder. Don't paste passwords, API keys or client data into a thread. T3 Code is early software, so keep your work in GitHub and review every change before it goes in.
:::

:::try-it
Open T3 Code, start a thread on any project with Supervised mode on, and ask: "Explain what this project is in five plain-English sentences. Don't change any files." Watch what the agent reads and whether it asks before doing anything.
:::

:::checkpoint
Q: You've installed T3 Code. How many extra tokens does it give your Claude plan?
- [ ] About 20% more, because it uses them more efficiently
- [x] None. It runs your existing plans, and any savings come from how you use it
- [ ] Unlimited, because T3 Code pays for the model
Why: T3 Code is a desk for agents you already pay for. Each job still counts against the plan of the agent that does it. The savings in this course come from sending jobs to the right plan and working in short, clean threads.
:::

:::checkpoint
Q: Codex shows grey in T3 Code's provider list. What's the first thing to check?
- [ ] Whether you've paid for T3 Code
- [x] Whether Codex is installed and signed in on the computer running T3 Code
- [ ] Whether your phone is connected
Why: T3 Code only finds agents that are installed and signed in on the computer doing the work. Run `codex login` there, then check Settings → Providers again.
:::

:::takeaways
- T3 Code is a free desk that runs Claude Code, Codex, Cursor and others from one window, on your own plans.
- It doesn't add tokens, install agents or pool accounts.
- One thread per job. Use a worktree for anything risky or for two agents at once.
- Switch the default Full access mode to Supervised, and know that only usage counts leave your computer for T3.
:::

## Go deeper

- [T3 Code](https://t3.codes/) - the official site, downloads and supported agents
- [T3 Code on GitHub](https://github.com/pingdotgg/t3code) - install options and release notes
- [T3 Code FAQ](https://github.com/pingdotgg/t3code/blob/main/docs/user/faq.md) - subscriptions, terms, privacy, the Claude 5-hour issue
- [A deep dive into T3 Code](https://flaviocopes.com/t3-code/) - Flavio Copes's tour of version 0.1, from threads to worktrees
