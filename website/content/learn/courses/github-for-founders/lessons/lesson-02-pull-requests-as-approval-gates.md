---
module: 1
lesson_number: 2
course: github-for-founders
template: v2
---

# Lesson 2: Pull Requests as Approval Gates

:::key-concept
A pull request is a change waiting for your yes. Agents do the work on a branch and open a pull request; you read the summary, check the changed files and the preview, then merge or send it back. Add a branch rule so `main` can only change through a pull request, and the gate holds even when an agent forgets.
:::

## What you'll be able to do

- Read any pull request in about two minutes without reading code
- Approve, request changes, or close a pull request with a clear comment
- Turn on a rule that blocks direct changes to `main`
- Undo a merged change with one click

## Why this matters

The rule that runs through this whole program is simple: agents prepare, you approve anything that goes out into the world. For code, the pull request (PR) is where that approval happens. Your website, your booking form and your intake tool are all out in the world. Without a gate, an agent can push a broken page straight to customers at 2 a.m. With a gate, the worst case is a PR you close.

## Anatomy of a pull request

Open any PR on GitHub and you'll see four tabs. Here's what each is for when you're the approver, not the coder.

| Tab | What you look at | Question to ask |
|---|---|---|
| Conversation | The summary, comments, and the status checks at the bottom | Does the summary match what I asked for, and only that? |
| Commits | The list of snapshots on this branch | Are the messages sensible, or did the agent wander? |
| Checks | Automated tests and builds (Lesson 3) | Is everything green? |
| Files changed | Every added (green) and removed (red) line | Are there files I didn't expect? |

Ask every agent to write PRs you can review fast. Use this as a standing instruction:

```text
When you open a pull request, include:
1. A two-line summary of what changed and why
2. The list of files changed, with one line each on why
3. Screenshots or a preview link for anything visible
4. Anything you were unsure about or did not finish
5. How to undo it if it goes wrong
Do not merge. The founder reviews and merges.
```

## The two-minute review

You are not checking whether the code is elegant. You are checking scope, surprises and results.

1. **Read the summary.** One request, one PR. If you asked for a typo fix and the summary mentions "refactored the layout," stop there and ask why.
2. **Scan Files changed.** For a content change to a website, expect a page file and maybe a stylesheet. Be suspicious of new script files, changes to settings files, anything in a `.github` folder, and edits to `.gitignore` or files with "env," "secret" or "key" in the name.
3. **Look for big red blocks.** Large deletions you didn't ask for are the most common agent mistake.
4. **Check the result.** Open the screenshots or the preview link. Many hosts and GitHub Pages workflows (Lesson 3) can build a preview for each PR.
5. **Check the checks.** Green means automated tests passed. Red means don't merge yet.

Then act:

- **Merge** when it's right. Use the green **Merge pull request** button. "Squash and merge" combines the branch's commits into one tidy commit on `main`, which keeps history readable.
- **Comment** when it needs changes. Write it like you would to a contractor: "The new FAQ answer about pricing is wrong. Our fee is per month, not per client. Please fix on this branch."
- **Close** when it's the wrong idea. Closing doesn't delete anything; the branch and discussion stay for reference.

You can also leave a formal review with **Review changes**, choosing Comment, Approve or Request changes. On your own repos, GitHub doesn't let you formally approve a PR you authored, so if an agent opens PRs under your account, you'll merge without the Approve step. That's fine. The merge click is the approval.

## Make the gate mandatory with a ruleset

A rule in a prompt is a request. A rule on the branch is enforced. GitHub calls these rulesets (the older version is called branch protection rules).

1. Open the repo, then **Settings**, then **Rules**, then **Rulesets**.
2. Click **New ruleset**, then **New branch ruleset**.
3. Name it `protect-main`, set Enforcement status to **Active**.
4. Under Target branches, add the default branch.
5. Tick **Restrict deletions**, **Block force pushes**, and **Require a pull request before merging**.
6. If you work alone, leave required approvals at 0. You can't approve your own PRs, so requiring one approval would lock you out. The PR requirement is still the gate.
7. Later, after Lesson 3, add **Require status checks to pass** so a red check blocks merging.
8. Click **Create**.

Per GitHub's docs, rulesets work on public repos with GitHub Free, and on private repos with GitHub Pro, Team or Enterprise Cloud. On a free account with a private repo, you won't get enforcement, so keep the rule in every agent's instructions and never give an agent permission to merge. Upgrading to Pro is worth it once a private repo runs your live site.

:::warning
Some agent tools can be granted permission to merge or push to `main`. Don't grant it. Agents open pull requests; the founder merges. Also never paste passwords, API keys or customer data into a PR description or comment. PRs on public repos are public, and even private ones are visible to everyone and every app with access to the repo.
:::

## Undo is one click

Merged something wrong? Open the merged PR and click **Revert**. GitHub creates a new PR that reverses the change. Review it like any other PR and merge it. History keeps both the mistake and the fix, which is exactly what you want when you're trying to figure out later what happened.

If the PR was never merged, there's nothing to undo. Close it and delete the branch.

## How this looks with each agent

| Agent | How it reaches the gate |
|---|---|
| Cursor | Agents work on branches; cloud agents can open PRs for you to review |
| Codex | Cloud tasks end with a diff you can turn into a PR |
| GitHub Copilot | Assign it an issue and it opens a PR (Lesson 4) |
| Claude Code | Asks to commit, push and open a PR with the `gh` tool |

The tools differ. The gate doesn't.

:::try-it
Open any pull request in a popular public repository on github.com, click **Files changed**, and spend two minutes on the review steps above. Write down one question you'd ask the author. That's the habit.
:::

:::checkpoint
Q: An agent's PR for "fix typo on pricing page" also changes a file in the `.github/workflows` folder. What do you do?
- [ ] Merge it, since workflow files are just settings
- [ ] Approve it but tell the agent not to do that again
- [x] Ask in a comment why the workflow changed and request it be removed from this PR
Why: Workflow files control automation that runs with access to your repo. A typo fix should never touch them, so the unexpected change needs an explanation before anything merges.
:::

:::takeaways
- A pull request is your approval gate: agents propose, you merge.
- Review for scope, surprises and results: summary, files changed, red lines, preview, checks.
- A ruleset that requires pull requests on `main` enforces the gate; solo founders leave approvals at 0.
- Revert is one click, so mistakes are cheap if everything goes through PRs.
:::

## Go deeper

- [About pull requests](https://docs.github.com/en/pull-requests/get-started/about-pull-requests) - what a PR contains and how merging works
- [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) - enforcing rules on branches, and which plans include them
- [Reverting a pull request](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/reverting-a-pull-request) - the one-click undo
