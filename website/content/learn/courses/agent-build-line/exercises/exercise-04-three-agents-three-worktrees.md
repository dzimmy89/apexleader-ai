---
module: 1
lesson_number: 4
course: agent-build-line
template: v2
---

# Exercise 4: Your First Parallel Run

:::key-concept
You'll install Orca, write three short specs for jobs that touch different files, and run them at the same time in three worktrees with two different agents. Then you'll review and merge them one at a time, updating each branch from `main` before you look at it.
:::

**Time:** 60 minutes, mostly waiting · **You'll need:** Orca, Claude Code and Codex (or two agents you use), your repo with the build line from Exercise 3 · **Builds on:** Lesson 4

:::video
id: bl-ex4-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-build-line/bl-ex4-setup.mp4
captions: /learn/video/agent-build-line/bl-ex4-setup.vtt
poster: /learn/video/agent-build-line/bl-ex4-setup.jpg
transcript: In this exercise you'll run three agents at once. Install Orca, pick three jobs that touch different files, and write a short spec for each. Start each one in its own worktree. While they work, note your usage. When they finish, review one pull request at a time, and update the others from main before you review them.
:::

## Warm-up

:::checkpoint
Q: Which pair of jobs is safe to run in parallel?
- [ ] "Restyle the portal" and "Add a receipts filter"
- [x] "Add tests for sign-in" and "Add a monthly summary page"
- [ ] "Rename database columns" and "Update the receipts form"
Why: Tests and a new page touch different files. The other pairs edit the same files, so they'd conflict.
:::

## Steps

1. **Install Orca.** From onorca.dev, or `brew install --cask stablyai/orca/orca` on a Mac. Read its privacy page and set telemetry the way you want.

2. **Check your agents.** In a terminal, make sure `claude` and `codex` start and are signed in, one account each.

3. **Pick three jobs.** Write them in a table in `notes/parallel-run.md`: job, agent, the files it may touch. No file may appear twice.

4. **Write the specs.** One short spec per job in your `specs` format: Goal, Files you may touch, Done when.

5. **Note your usage** for each plan.

6. **Start the run.** In Orca, add your repo, then create three worktrees and start each agent with its spec.

7. **Steer from your phone (optional).** Pair Orca's companion app and answer any question an agent asks from there.

8. **Review the first to finish.** Leave at least one line comment and send it back. When it's right, have the agent open a pull request, check the preview and merge it.

9. **Update and review the rest.** Ask each remaining agent to update its branch from `main`, then review and merge them one at a time.

10. **Note your usage again**, and how long the three jobs took in total.

## Done when

- [ ] Three jobs ran at the same time in three worktrees
- [ ] Each one became its own pull request, reviewed and merged one at a time
- [ ] At least one review comment went back to an agent and was fixed
- [ ] `notes/parallel-run.md` records the jobs, files, usage and time

:::example
title: See an example result

For Rolling Ledger, Codex built the receipt upload in `receipt-upload`, and Claude Code built the monthly summary and the portal tests in two more worktrees. The tests finished first, in 18 minutes. The founder commented that one test checked the wrong owner and sent it back; the fix took two minutes. The summary page needed updating from `main` after the tests merged, which took the agent one step. All three were live in 70 minutes. Usage: about a third of the day's Claude allowance and a quarter of Codex's.

:::video
id: bl-ex4-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-build-line/bl-ex4-reveal.mp4
captions: /learn/video/agent-build-line/bl-ex4-reveal.vtt
poster: /learn/video/agent-build-line/bl-ex4-reveal.jpg
transcript: Here's the Rolling Ledger parallel run. Three worktrees, two agents, one screen. The tests finish first, get one comment, and merge. The summary page updates from main and merges next, then the upload. Three pull requests live in seventy minutes, each one reviewed on its own.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Plan your parallel week.

1. List your next ten jobs and the files each would touch.
2. Group them into batches that never share a file.
3. Match each job to the agent and plan that suits it best.

**Bring to your session:** `notes/parallel-run.md` and your job list.

**Your coach will:**
- Check your batches for hidden overlaps
- Help you match jobs to agents and plans
- Review how you handled the merges
:::
