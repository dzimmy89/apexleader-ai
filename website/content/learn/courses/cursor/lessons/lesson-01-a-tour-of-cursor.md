---
module: 1
lesson_number: 1
course: cursor
template: v2
---

# Lesson 1: A Tour of Cursor

:::key-concept
Cursor is a code editor built around agents: you describe the work, agents read your project, make changes and show you a diff to approve. Since Cursor 3 (April 2026), the main screen is an Agents Window where you supervise several agents at once, with the classic editor one click away. Your job is to brief, review and approve, not to type code.
:::

## What you'll be able to do

- Install Cursor, sign in and open a project folder
- Find your way around the Agents Window and the Editor
- Start an agent, use Plan Mode, and review what it changed
- Pick a safe run mode so agents don't run commands without your say

## Why this matters

As a solo founder you will need small pieces of software: a landing page, a booking form, an intake tool, a script that tidies a spreadsheet. Hiring a developer for each is slow and expensive. Cursor lets you hand that work to coding agents while you stay the manager. It's also where much of the AI coding market has consolidated in 2026, so it's worth knowing who runs it and what that means for your plan.

## Cursor in October 2026: what changed

A few facts shape how you'll use Cursor today:

- **New owner.** SpaceX announced on June 16, 2026 that it would buy Anysphere, the company behind Cursor, for $60 billion, and the deal closed in August. Cursor now sits alongside SpaceXAI's Grok models.
- **New plans.** On October 12, 2026, SpaceX folded Cursor, Grok and X Premium into one "X Subscription" with Free, Plus, Premium, Super and Ultra tiers. Cursor's pricing page lists what each includes. The short version: Plus uses Grok models only; Premium and above add cloud agents, Bugbot code review and Grok Bot; models from other providers, such as Anthropic's Claude, are billed separately at API list price. Check [cursor.com/pricing](https://cursor.com/pricing) before you pick.
- **Model changes.** OpenAI said it will stop supplying its models to Cursor after the acquisition, with November 12, 2026 proposed as the cutoff. If you rely on GPT models, plan to switch models, bring your own OpenAI API key for chat and agent requests, or use OpenAI's own Codex (see the Codex course).
- **Cursor 3.** Released April 2, 2026, it rebuilt the app around agents running in parallel, locally and in the cloud.

None of this changes the core skill. You brief an agent, it works, you review. The durable pattern outlasts any plan name.

## Install and open your first project

1. Download Cursor from cursor.com/downloads. It runs on macOS 12 or later, Windows 10 or later, and Linux.
2. Open it and sign in.
3. Create an empty folder on your computer called `groomer-books-site` (or your business name) and open it in Cursor. A folder is a project. Everything the agent does happens inside it.

If you followed the GitHub for Non-Developers course, clone your site repo instead so every change can go through a pull request.

## The two main views

**The Agents Window** is the agent-first home introduced in Cursor 3. Open it from the Command Palette (Cmd+Shift+P on Mac, Ctrl+Shift+P on Windows), then choose "Agents Window." You'll see:

- A sidebar listing your agents, local and cloud, across projects
- The conversation with the selected agent, including its plan and progress
- A diff view of what it changed, with built-in commit and pull request controls
- A built-in browser where the agent can open your site and click around, plus Design Mode for pointing at parts of a page

**The Editor** is the classic layout: file tree on the left, open files in the middle, and an agent panel on the side. Press Cmd+I (Ctrl+I on Windows) to open Agent there. You can switch between the two views at any time.

For a founder, the Agents Window is where you'll spend most time. The Editor is useful when you want to look at a specific file.

## Start an agent the right way

Start small. A good first prompt asks the agent to explain before it builds:

```text
This folder will hold the website for Groomer Books, a monthly bookkeeping
service for independent dog groomers. It's empty right now.
Don't write any code yet. Propose a simple plan for a one-page site in plain
HTML and CSS: sections, files, and what you'll need from me (copy, images,
contact email). Ask me any questions first.
```

For anything bigger than a small edit, switch on **Plan Mode** by pressing Shift+Tab in the agent input. Cursor's docs describe it this way: the agent researches, asks clarifying questions, drafts a plan, and waits for your approval before building. That is exactly the habit you want: plan, approve, then build.

When the agent does make changes:

- **Read the diff.** Green lines were added, red removed. Ask "why did you change this file?" about anything unexpected.
- **Use checkpoints.** Agent takes snapshots before significant changes, and you can restore one from the chat timeline. Checkpoints are local, separate from Git, so commit work you want to keep.
- **Ask it to check its work.** "Open the page in the browser at phone width and take a screenshot" catches most visual problems.

You can keep typing while the agent works. Pressing Enter queues your message for after the current task; **Send now** steers it at its next step.

## Set your safety rails before you start

Agents in Cursor can run terminal commands on your computer. Under Settings, then Agents, then Approvals & Execution, pick a run mode:

| Run mode | What it does | Founder advice |
|---|---|---|
| Auto-review (default) | Allowlisted commands run; others run in a sandbox when possible; the rest go to a classifier | Fine for most work. Cursor's docs say it is "not a security boundary" |
| Allowlist | Only commands on your list run without approval | Use an empty list if you want to approve every command |
| Run Everything | Every tool call runs with no checks | Avoid. You accept all the risk |

:::warning
Never paste passwords, API keys or customer data into an agent chat, and don't keep them in plain files in your project. Don't use Run Everything on a computer that holds client files or your banking logins. When Cursor asks to connect GitHub, choose only the repositories it needs.
:::

:::try-it
Open Cursor, open any folder with a few documents in it, press Cmd+I (Ctrl+I), and ask: "List the files in this folder and describe what each one is in one line. Don't change anything." Watch how the agent searches and reads before it answers.
:::

:::checkpoint
Q: You want Cursor to add a booking section that touches three files. What's the best first move?
- [ ] Switch to Run Everything so it finishes faster
- [x] Turn on Plan Mode, review the plan, then let it build
- [ ] Ask it to build immediately and fix problems later
Why: Plan Mode makes the agent research and propose before writing code, so you approve the approach while changes are still free.
:::

:::takeaways
- Cursor 3 is agent-first: the Agents Window supervises many agents, the Editor is one click away.
- In October 2026 Cursor is owned by SpaceX, sold through X Subscription tiers, and losing OpenAI models; check the pricing page before you buy.
- Plan first (Shift+Tab), then build, then read the diff and use checkpoints.
- Keep the default Auto-review or a strict Allowlist; never Run Everything on a computer with sensitive data.
:::

## Go deeper

- [Cursor quickstart](https://cursor.com/docs/get-started/quickstart) - install, open a folder, start an agent and use Plan Mode
- [Cursor 3.0 changelog](https://cursor.com/changelog/3-0) - the Agents Window, Design Mode and parallel agents
- [Cursor pricing](https://cursor.com/pricing) - current X Subscription tiers and what each includes
- [Run modes](https://cursor.com/docs/agent/security/run-modes) - Auto-review, Allowlist and Run Everything explained
- [OpenAI is leaving Cursor in November](https://www.tomsguide.com/ai/openai-is-leaving-cursor-in-november-here-are-your-3-options) - what the model cutoff means and your options
