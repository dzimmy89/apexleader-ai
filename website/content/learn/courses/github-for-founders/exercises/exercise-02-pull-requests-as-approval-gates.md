---
module: 1
lesson_number: 2
course: github-for-founders
template: v2
---

# Exercise 2: Build Your Approval Gate

:::key-concept
You'll create a website repo with a one-page site, open a pull request, review it with the two-minute method, merge it, revert a deliberate mistake, and lock `main` with a ruleset. At the end, nothing can reach your site's main branch without a pull request and your click.
:::

**Time:** 30 minutes · **You'll need:** Your GitHub account and playbook repo from Exercise 1 · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: You work alone and set your ruleset to require one approving review. What happens when an agent opens a pull request under your account?
- [ ] You approve it and merge as usual
- [ ] GitHub approves it automatically because you're the owner
- [x] You can't approve your own pull request, so merging gets blocked
Why: Authors can't approve their own pull requests. Solo founders require a pull request but leave required approvals at 0; the merge click is the approval.
:::

## Steps

1. **Merge last exercise's branch.** In your playbook repo, GitHub likely shows a banner for `add-decisions-log`. Click **Compare & pull request**, read the summary, open **Files changed**, then **Merge pull request**. That was your first gate. Delete the branch when GitHub offers.

2. **Create the site repo.** Make a new repository called `<yourbusiness>-site`, for example `groomer-books-site`. Choose **Public** (needed for free Pages and rulesets on GitHub Free in Exercise 3; a landing page has nothing secret in it). Tick **Add a README file**.

3. **Add a starter page on `main`.** Click **Add file**, then **Create new file**, name it `index.html`, paste this, and commit to `main` (the last time you'll do that):

```text
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Groomer Books | Bookkeeping for dog groomers</title>
</head>
<body>
  <h1>Bookkeeping for independent dog groomers</h1>
  <p>Monthly books, done for you, so you can get back to the grooming table.</p>
  <h2>How it works</h2>
  <p>Connect your bank, send receipts by photo, get a clean report every month.</p>
  <p><a href="mailto:hello@example.com">Contact us</a></p>
</body>
</html>
```

4. **Protect `main`.** Open **Settings**, then **Rules**, then **Rulesets**, then **New ruleset**, then **New branch ruleset**. Name it `protect-main`, set enforcement to **Active**, target the default branch, and tick **Restrict deletions**, **Block force pushes** and **Require a pull request before merging** with required approvals at 0. Create it.

5. **Test the gate.** Edit `index.html` and try to commit to `main`. GitHub should block it or push you to create a branch. Create a branch called `add-pricing-line` and add this line after "How it works":

```text
<p>Plans from one simple monthly fee. No per-client charges.</p>
```

6. **Open the pull request properly.** Title: `Add pricing line to homepage`. In the description, use the template from the lesson: summary, files changed, anything unsure, how to undo. Create it.

7. **Do the two-minute review.** Check the summary, Files changed (one file, one green line), no red blocks. Merge with **Squash and merge**.

8. **Practice undo.** Open the merged pull request and click **Revert**. GitHub opens a new pull request that removes the line. Read it, merge it, and confirm the line is gone from `main`. Then, if you want the line back, revert the revert the same way.

9. **Save your review template.** In your playbook repo, add `notes/pr-review-checklist.md` on a branch, via a pull request:

```text
# Two-minute PR review
1. Summary matches what I asked, and only that
2. Files changed: no surprise files (.github, .gitignore, scripts, env, keys)
3. No big red blocks I didn't ask for
4. Preview or screenshots look right on phone and desktop
5. Checks are green
Merge / comment with requested changes / close
```

## Done when

- [ ] A public site repo exists with `index.html` on `main`
- [ ] The `protect-main` ruleset is active and blocked a direct commit
- [ ] You merged one pull request and reverted it through a second one
- [ ] Your review checklist is in the playbook repo, merged through a pull request

:::coached
**For 1-on-1 coaching clients.** Apply the gate to a real project and a real agent.

1. Ask a coding agent you use (Cursor, Codex, Claude Code or Copilot) to make one small change to your real site repo on a branch and open a pull request with the description template.
2. Review it using your checklist and leave at least one change request as a comment before merging.
3. Decide your plan: if your live site's repo is private, decide whether to upgrade to GitHub Pro for enforced rulesets, or to make the site repo public.

**Bring to your session:** the pull request link, your review comment, and your plan decision.

**Your coach will:**
- Review the pull request with you and point out anything you missed
- Pressure-test your ruleset settings and bypass list
- Help you write a PR description template tuned to your business
:::
