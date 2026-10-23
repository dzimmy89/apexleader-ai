---
module: 1
lesson_number: 5
course: claude-code
template: v2
---

# Lesson 5: Hooks, Automations and Cloud Sessions

:::key-concept
Hooks are rules that always run: a script Claude Code executes at a fixed moment, like after every edit or before every file write. Subagents are helpers that do research or review in their own context. Cloud sessions and scheduled tasks let Claude work on your code while your laptop is closed. Use them in that order: guardrails first, helpers second, autopilot last.
:::

## What you'll be able to do

- Add a hook that notifies you and a hook that blocks edits to sensitive files
- Use built-in and custom subagents to keep research and review out of your main session
- Run a cloud session from claude.ai/code that returns a branch and a pull request
- Set up a scheduled task safely, knowing what it can reach and whose name it acts in

## Why this matters

So far Claude has worked while you watched. That doesn't scale. A one-person company needs work to happen while you're on a sales call or asleep. The catch: the less you watch, the more your rules must be enforced by the system, not by memory or good intentions. Hooks give you that enforcement. Cloud sessions and scheduled tasks give you the time back.

## Hooks: rules that can't be skipped

CLAUDE.md is guidance Claude tries to follow. A hook is a shell command Claude Code runs automatically at a lifecycle event, every time, whatever Claude decides. Common events:

| Event | Fires when | Founder use |
| --- | --- | --- |
| Notification | Claude is waiting for your input or permission | Desktop alert so you can work elsewhere |
| PostToolUse | Right after Claude uses a tool, such as editing a file | Auto-format files after each edit |
| PreToolUse | Right before a tool runs | Block edits to secrets or protected files |
| Stop | Claude is about to finish its turn | Run your tests and keep going until they pass |

Hooks live in a settings file: `~/.claude/settings.json` for all your projects, or `.claude/settings.json` in a project. Type `/hooks` in a session to see what's configured. The easiest way to add one is to ask:

```text
Write a hook for this project that blocks any edit to .env files, anything in
.git/, and package-lock.json. Explain what it does, show me the settings change,
and wait for my OK before saving it.
```

Anthropic's own example of a notification hook for macOS, added to `~/.claude/settings.json`:

```text
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

Linux and Windows use different notification commands; the hooks guide has both. The protected-files version uses a small script that checks the file path and exits with code 2 to block the edit, and Claude is told why it was blocked so it can adjust.

:::warning
Hooks run commands on your computer with your permissions. Only add hooks you understand or that Claude has explained line by line, and be careful with hooks in projects you download from others.
:::

## Subagents: helpers with their own desk

A subagent is a separate Claude instance with its own context window and its own set of tools. It does a focused job and reports back a summary, so your main session stays clean. Claude Code has built-in ones, like **Explore** (searches and reads the codebase without changing it) and **Plan** (research for plan mode), and Claude uses them on its own when useful.

You can also ask for them directly:

```text
Use subagents to investigate how the site handles forms and whether anything
sends data to a third party. Report findings only; don't change anything.
```

Or create your own. A custom subagent is a Markdown file in `.claude/agents/` (this project) or `~/.claude/agents/` (all projects). The easiest way is to ask Claude to write one:

```text
Create a project subagent called copy-checker in .claude/agents/. It reviews
page copy against CLAUDE.md voice rules, flags invented claims, numbers or
testimonials, and checks reading level. It can read files but not edit them.
```

Then: "Use the copy-checker subagent on the Pricing page."

## Cloud sessions: work while your laptop is closed

A cloud session runs Claude Code on Anthropic's infrastructure instead of your computer. It keeps going after you close the laptop, and you can check on it from a browser or the Claude mobile app. As of October 2026, cloud sessions are on Pro, Max and Team plans, and Enterprise seats that include Claude Code. They count against your normal plan usage.

How to start one:

1. Go to [claude.ai/code](https://claude.ai/code) and connect GitHub (authorize the Claude GitHub App on your repository).
2. Accept the **Default** environment. It controls network access and setup for sessions.
3. Pick your repository and branch, then a permission mode: **Auto**, **Accept edits** or **Plan**. Cloud sessions don't offer Manual.
4. Describe the task specifically and submit.

Claude clones the repo into a fresh cloud machine, does the work, runs checks and pushes a branch. You open the diff, leave comments on specific lines, and click **Create PR** when it's right. Your GitHub credentials stay on Anthropic's servers and don't enter the session machine.

Other ways in:

- **Desktop app:** pick **Cloud** instead of **Local** in the environment selector.
- **Terminal:** `claude --cloud "Fix the broken link on the Pricing page"` starts a cloud session for your current repo (push your commits first). `claude --teleport` pulls a cloud session back into your terminal.
- **Phone:** the **Code** tab in the Claude mobile app.

A good pattern: plan locally in plan mode, commit the plan, then send it to the cloud: "Execute the plan in PLAN-faq.md."

## Scheduled tasks: Claude on a calendar

Cloud scheduled tasks (formerly called routines, and still a research preview in October 2026) save a prompt, one or more repositories and any connectors, then run them automatically. Triggers can be:

- **Schedule:** hourly, nightly, weekly, or once at a set time
- **API:** an HTTP call from another tool
- **GitHub:** an event such as a new pull request

They're available on Pro, Max, Team and Enterprise. Create them at claude.ai/code/routines, from the desktop app's Code tab (**Scheduled**, then **New task**), or with `/schedule` in the terminal. For work that must use files on your machine, the desktop app also has local scheduled tasks, and `/loop` repeats a prompt inside an open session.

A safe first scheduled task for a founder:

```text
Every Monday at 7am: check every page of this site for broken links, missing
images, and text under 16px at phone width. If you find problems, fix them on
a new branch and open a pull request describing each fix in plain English.
Never merge. Never change prices or copy beyond the fix.
```

Two things to know. First, a scheduled task acts as you: commits carry your GitHub name, and connector actions use your linked accounts. Second, it reaches only what you give it: the repositories you select, the environment's network access, and the connectors you include. Scope each one to the minimum.

:::warning
Automations must follow the same rules as you: give them least access, have them open pull requests instead of merging, draft instead of send, and never give them payment or banking tools. Review the first few runs of any scheduled task before you stop watching it.
:::

:::try-it
Run `/hooks` in a session to see what's configured, then ask Claude: "Which one hook would protect this project most, and why?"
:::

:::checkpoint
Q: You wrote "Never edit .env files" in CLAUDE.md, but you need a guarantee for unattended runs. What should you add?
- [ ] The same rule again in capital letters
- [ ] A subagent that reminds Claude of the rule
- [x] A PreToolUse hook that blocks edits to .env files
Why: CLAUDE.md is guidance, while a hook runs every time at a fixed point and can block the action regardless of what Claude decides.
:::

:::takeaways
- Hooks enforce rules every time: notifications, formatting, blocking protected files, tests before stopping.
- Subagents do research and review in their own context; create custom ones in `.claude/agents/`.
- Cloud sessions run on Anthropic's machines from claude.ai/code, the desktop app, `--cloud` or your phone, and return a branch you review.
- Scheduled tasks act as you, so scope repos, network and connectors tightly and have them open PRs, never merge.
:::

## Go deeper

- [Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) - notification, formatting and protected-file examples
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents) - built-in subagents and writing your own
- [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web) - cloud sessions, --cloud and --teleport
- [Get started with cloud sessions](https://code.claude.com/docs/en/web-quickstart) - connect GitHub, start a task, review and create a PR
- [Automate work with scheduled tasks](https://code.claude.com/docs/en/routines) - triggers, scope and who the task acts as
