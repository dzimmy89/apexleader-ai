---
module: 1
lesson_number: 2
course: cursor
template: v2
---

# Lesson 2: Agent Mode and Parallel Agents

:::key-concept
A Cursor agent is a worker that can read files, edit them, run commands, use a browser and ask you questions. Cursor 3 lets you run several at once, each in its own isolated copy of the project called a worktree, so they don't trip over each other. Parallel agents are like hiring three contractors for three separate jobs, or for the same job so you can pick the best result.
:::

## What you'll be able to do

- Write an agent brief that gets a usable result on the first try
- Run two or three agents in parallel without them colliding
- Use `/best-of-n` to compare several attempts and keep the best one
- Know when to move work to the cloud, or hand a large effort to Cursor Projects

## Why this matters

Your time is the bottleneck. One agent working while you wait is a faster typist. Three agents working on separate jobs while you take a client call is a small team. The skill is splitting work cleanly, briefing well, and reviewing quickly. That's management, and you already do it with people.

## What an agent can do

Per Cursor's docs, Agent can search your files and the web, read files including images, edit files, run shell commands, control a browser to test your app and take screenshots, generate images into an `assets/` folder, and stop to ask clarifying questions. There's no fixed limit on how many steps it takes.

That's a lot of reach, so a clear brief matters. Use this structure:

```text
Goal: Add a "How it works" section to index.html for Groomer Books.
Context: Audience is independent dog groomers reading on their phones.
Use the three steps in content/how-it-works.md, word for word.
Constraints: Plain HTML and CSS only. Don't touch the header or footer.
No new fonts, scripts or images.
Done when: The section sits below the hero, looks right at 375px and
1280px wide, and you've shown me screenshots of both.
Ask me before doing anything outside these files.
```

Goal, context, constraints, done when. Four lines of thinking save an hour of back-and-forth.

## Steering while it works

You don't have to wait for an agent to finish to correct it.

- **Enter** queues a message to run after the current task. You can queue several and drag to reorder.
- **Send now** (or Cmd+Enter / Ctrl+Enter) steers the active task at its next step. Use it when you see it heading the wrong way.
- **Side chats** (`/side`) let you ask a tangent question without derailing the main task.
- **Checkpoints** let you roll files back to before a change if it went badly.

## Running agents in parallel

In the Agents Window you can start several agents and watch them in the sidebar. The rule that makes this work: **one agent, one job, one copy of the project.**

Cursor handles the "copy" part with worktrees. A worktree is an isolated checkout of your repository with its own files and changes, so your main folder stays untouched while agents work. In the Agents Window, start an agent in a worktree (or move it into one). When it finishes, you can keep working there, create a commit or pull request from it, or bring the result into your main folder.

In the Editor, the same ideas are commands you type in the agent input:

| Command | What it does |
|---|---|
| `/worktree` | Runs the rest of this chat in a separate checkout |
| `/best-of-n` | Runs the same task on several models, each in its own worktree, so you can compare |
| `/apply-worktree` | Brings a worktree's changes into your main folder |
| `/delete-worktree` | Removes a worktree you no longer need |

Worktrees need your project to be a Git repository. If it isn't, ask the agent: "Initialize a git repository here and make a first commit."

### Two ways to use parallel agents

**Split the work.** Three independent jobs, three agents:

```text
Agent 1: Write the FAQ section from content/faq.md. Only edit faq.html.
Agent 2: Compress every image in /images to under 250 KB. Don't edit HTML.
Agent 3: Check every link on the site and list broken ones. Don't edit files.
```

Notice each one has its own files. Two agents editing the same file is the main way parallel work goes wrong.

**Race the same job.** When the result is a matter of taste, like a hero section or a pricing table, use `/best-of-n` so several models try the same brief in separate worktrees:

```text
/best-of-n Redesign the hero section of index.html to feel warm and
trustworthy for dog groomers. Keep the exact headline and button text.
Plain HTML and CSS only.
```

Pick from the models your plan includes. Then look at each result in the browser, keep the best with `/apply-worktree`, and delete the rest. Nothing merges into your main folder until you choose.

## Local, cloud and bigger projects

Local agents use your computer and stop if it sleeps. Cloud agents (Lesson 4) run on Cursor's machines and keep going with the laptop closed; Cursor 3 lets you push a local session to the cloud, or pull a cloud session down to test it. Cloud agents need a Premium tier or higher.

For larger efforts, like rebuilding a whole site or a multi-part tool, Cursor added **Projects** in September 2026 (beta). A coordinator agent plans the work and delegates pieces to other agents in the cloud. Treat it like hiring a project lead: give it a written spec, ask for the plan first, and review each piece through pull requests.

:::warning
More agents means more to review. Don't start more agents than you can review today. Every agent can run commands, so keep the run mode from Lesson 1, and never give parallel agents jobs that touch payments, customer data or anything that sends email or posts publicly.
:::

:::try-it
In any Git project, open Agent and type `/worktree` followed by "Add a comment at the top of the README saying this is a test." Then check your main folder: the README there hasn't changed. That's isolation. Delete the worktree with `/delete-worktree`.
:::

:::checkpoint
Q: You want one agent to rewrite your pricing section and another to restyle the same page's buttons at the same time. What's the safest setup?
- [ ] Run both in your main folder so you see changes live
- [x] Give each its own worktree, then review and bring in one result at a time
- [ ] Run one agent with Run Everything so it finishes before the other starts
Why: Separate worktrees keep the agents from overwriting each other's edits to the same file, and you control what reaches your main folder.
:::

:::takeaways
- Brief with goal, context, constraints and done when.
- Steer with queued messages and Send now; roll back with checkpoints.
- Parallel agents work when each has its own job and its own worktree.
- Use `/best-of-n` for taste decisions, cloud agents for long jobs, and Projects for big multi-part work.
:::

## Go deeper

- [Worktrees and parallel agents](https://cursor.com/docs/configuration/worktrees) - the Agents Window, `/worktree`, `/best-of-n` and cleanup
- [Agent overview](https://cursor.com/docs/agent/overview) - what Agent can do, checkpoints and queued messages
- [Cursor 3.0 changelog](https://cursor.com/changelog/3-0) - Agents Window, Agent Tabs and best-of-n
- [Cursor 3 ditches the classic IDE layout](https://the-decoder.com/new-cursor-3-ditches-the-classic-ide-layout-for-an-agent-first-interface-built-around-parallel-ai-fleets/) - an independent look at local-to-cloud handoff and the agent sidebar
- [Cursor changelog](https://cursor.com/changelog) - recent additions including Projects
