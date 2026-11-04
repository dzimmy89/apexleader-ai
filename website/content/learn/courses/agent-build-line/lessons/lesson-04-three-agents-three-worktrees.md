---
module: 1
lesson_number: 4
course: agent-build-line
template: v2
---

# Lesson 4: Three Agents, Three Worktrees

:::video
id: bl-l4-overview
kind: overview
status: paused
src: /learn/video/agent-build-line/bl-l4-overview.mp4
captions: /learn/video/agent-build-line/bl-l4-overview.vtt
poster: /learn/video/agent-build-line/bl-l4-overview.jpg
transcript: One agent at a time means you wait. Three agents in one folder means they trip over each other's changes. The fix is a worktree: a separate copy of your project for each agent, on its own branch, sharing one history. Orca is a free, open-source workbench built around exactly that. You give each job its own worktree and its own agent, Claude Code on one, Codex on another, and watch all three from one window or from your phone. In this lesson you'll run three Rolling Ledger jobs at once and review each one as its own pull request.
:::

:::key-concept
A **git worktree** is a second (or third) working copy of the same repository, each on its own branch. Agents in different worktrees can't overwrite each other's files, and each job ends as its own pull request. **Orca** is a desktop app that makes worktrees easy: one click creates a worktree and starts an agent in it, and one screen shows every agent's progress. Run jobs in parallel only when they touch **different parts of the code**, and you still review each one before it merges.
:::

## What you'll be able to do

- Explain what a worktree is and why parallel agents need one each
- Install Orca and open your project in it
- Start three agents on three jobs, each in its own worktree
- Comment on an agent's changes line by line and send them back
- Follow your agents from your phone with Orca's companion app

## Why this matters

You've already seen worktrees: T3 Code runs a job "in a new worktree," and Codex can work in one. Orca puts them at the centre. It runs Claude Code, Codex, OpenCode, Cursor's agent, Pi and others side by side, and it's free and open source under the MIT license.

For a solo founder, parallel agents are how a morning of work becomes three finished pull requests. The skill isn't starting agents. It's picking jobs that won't collide, and keeping your review honest when three things finish at once.

:::infographic
id: fig-1
type: diagram
title: One repo, three worktrees
shows: A GitHub repo card labeled rolling-ledger-site at the left. Three lines run right to three worktree cards, each with a branch name and an agent: receipt-upload with Codex, monthly-summary with Claude Code, portal-tests with Claude Code. Each worktree card ends in a small pull request pill. A paper card at the far right reads "you review three pull requests".
data: none
image: /learn/figures/agent-build-line/lesson-04-fig-1.webp
alt: One repository splits into three worktrees, each on its own branch with its own agent: receipt upload with Codex, the monthly summary with Claude Code, and portal tests with Claude Code. Each ends as a pull request you review.
:::

## Install Orca

Download it from onorca.dev for macOS, Windows or Linux. On a Mac with Homebrew:

```bash
brew install --cask stablyai/orca/orca
```

Use the full name. A cask called just `orca` is a different program.

Open Orca, add your project folder, and make sure the agents you use are installed and signed in on their own first: `claude` for Claude Code, `codex` for Codex. Orca runs the agents you already have; it doesn't replace their sign-in. Its privacy page explains the anonymous usage data it collects and how to switch it off; read it and decide.

### One account per provider

Orca shows how much of your Claude and Codex plans you've used and when limits reset, which is useful. It also offers to swap between several accounts on the same provider. Don't. Use one account per provider and stay inside its limits; running several accounts to get around limits breaks most providers' terms. When you hit a limit, wait, or send the job to the other plan, as you learned in the T3 Code course.

## Pick jobs that don't collide

Three good parallel jobs for the Rolling Ledger portal:

| Worktree | Agent | Job | Touches |
|---|---|---|---|
| `receipt-upload` | Codex | Photo upload for receipts, saved to storage | The upload page and its API route |
| `monthly-summary` | Claude Code | A page that totals the month by category | A new summary page |
| `portal-tests` | Claude Code | Tests for sign-in and row-level security | The tests folder |

Three bad ones: "restyle the portal," "rename the database columns" and "add a receipts filter." All three touch the same files, so you'd spend the afternoon untangling them. A simple rule: if two jobs would edit the same file, run them one after the other.

Write each job as a short spec in your `specs` house skill format, so each agent gets the goal, the files it may touch and the done-when.

## Run them

In Orca, create a worktree for each job and start the agent for it. Each one gets its own terminal, its own branch and its own folder. Then leave them alone. Check in when one finishes.

:::video
id: bl-l4-three-at-once
kind: inline
status: paused
src: /learn/video/agent-build-line/bl-l4-three-at-once.mp4
captions: /learn/video/agent-build-line/bl-l4-three-at-once.vtt
poster: /learn/video/agent-build-line/bl-l4-three-at-once.jpg
transcript: Here are three jobs starting in Orca. We create a worktree called receipt upload and start Codex with its spec. Then monthly summary with Claude Code, and portal tests with Claude Code. Three agents, three branches, one screen. Twenty minutes later the phone buzzes: the tests are done. We open the changes, comment on one line, and send it back. The other two keep working.
:::

## Review each one

When an agent finishes, open its changes in Orca. You can leave a comment on any line ("this should round to the cent, not the dollar") and send the comments back to the agent, which fixes them in the same worktree. When it's right, have the agent open a pull request through the build line from Lesson 3, and review the Vercel preview as usual.

Review one pull request at a time, even when three are waiting. Merge the first, then ask the other agents to update their branch from `main` before you look at them. That keeps each preview honest.

### From your phone

Orca's companion app for iOS and Android pairs with the desktop app. It tells you when an agent finishes, shows what it did, and lets you send a short follow-up. It's for steering, not reviewing: approve plans and answer questions on the phone, and do the real review at your desk, or on the Vercel preview link.

:::infographic
id: fig-2
type: flow
title: Parallel, then one at a time
shows: Left half, three agent cards stacked and labeled "work in parallel". An arrow to the right half, a single file of three pull request cards labeled "review and merge one at a time", with "update from main" between them. The last pull request card is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-04-fig-2.webp
alt: Three agents work in parallel, then their pull requests are reviewed and merged one at a time, with each remaining branch updated from main before its review.
:::

:::warning
Parallel agents use your plans in parallel too. Three agents for an hour can use as much as one agent for three hours. Watch Orca's usage view the first week. Keep approval on in every agent, and keep the merge button denied from Lesson 3: three agents is three times as many chances for one of them to try something you didn't ask for.
:::

:::try-it
Look at your list of open jobs. Pick two that would touch completely different files and write a three-line spec for each. That's your first parallel run.
:::

:::checkpoint
Q: Two jobs both need to edit the portal's main stylesheet. What do you do?
- [ ] Run them in parallel in two worktrees; git will sort it out
- [x] Run them one after the other
- [ ] Run them in the same worktree at the same time
Why: Worktrees stop agents from overwriting each other's files, but two branches that change the same lines still conflict when you merge. Jobs that share files go in sequence.
:::

:::checkpoint
Q: Orca offers to switch between three Claude accounts when one hits its limit. What do you do?
- [ ] Set up three accounts so you never wait
- [x] Use one account per provider, and wait or send the job to another plan
- [ ] Share one account with a friend
Why: Running several accounts to get around limits breaks most providers' terms. One account per provider, and route work between the plans you pay for.
:::

:::takeaways
- A worktree is a separate working copy on its own branch; each parallel agent gets one.
- Orca starts agents in worktrees and shows them all on one screen and on your phone.
- Run jobs in parallel only when they touch different files.
- Review and merge one pull request at a time, and use one account per provider.
:::

## Go deeper

- [Orca](https://github.com/stablyai/orca) - install, supported agents and features
- [Orca worktrees](https://www.onorca.dev/docs/model/worktrees) - how Orca creates and cleans up worktrees
- [Orca mobile companion](https://www.onorca.dev/docs/mobile) - pairing your phone
- [git worktree](https://git-scm.com/docs/git-worktree) - the git feature underneath
