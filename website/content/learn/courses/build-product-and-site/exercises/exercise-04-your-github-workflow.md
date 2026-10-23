---
module: 1
lesson_number: 4
course: build-product-and-site
template: v2
---

# Exercise 4: Put Your Site in GitHub and Ship One Change by Pull Request

:::key-concept
You'll publish your site folder to a GitHub repository with a safe .gitignore, add "agents never merge" to your rules, and run one full change through a branch and pull request that you review and merge yourself.
:::

**Time:** 30 minutes · **You'll need:** a GitHub account with two-factor authentication on, your coding agent (Claude Code, Cursor or Codex), your project folder from Exercise 3 · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Your agent accidentally committed a file containing an API key and pushed it. What is the first thing to do?
- [ ] Delete the file in a new commit and move on
- [ ] Make the repository private
- [x] Revoke or rotate the key at the service that issued it, then clean up the repo
Why: Once pushed, a key stays in the history and may already be copied. Rotating it makes the leaked copy useless; cleanup comes after.
:::

## Steps

1. **Secure your account.** On github.com, confirm two-factor authentication is on (Settings, Password and authentication). If you plan to let the agent use the `gh` tool, install it when the agent asks and log in yourself in the browser.

2. **Create the repository.** Paste into your coding agent:

    ```text
    Turn this folder into a git repository and publish it to GitHub as a new
    repository named [your-business]-site under my account.
    Before the first commit:
    - Create a .gitignore excluding .env files, any file with "secret" or "key" in the
      name, .DS_Store, node_modules and /mockups.
    - Scan every file for passwords, API keys, tokens and personal data; report findings.
    - Show me the list of files to be committed and wait for my OK.
    Use the gh tool. If I need to log in, stop and tell me.
    ```

    Read the file list. Approve only if it's what you expect. (Prefer GitHub Desktop? Use **Add an existing repository**, then **Publish repository**, and check the file list in the Changes tab yourself.)

3. **Add the approval rules.** Ask the agent to add these lines to AGENTS.md, on a branch, via a pull request:

    ```text
    - Never commit directly to main. Always work on a branch and open a pull request.
    - Never merge a pull request. The founder reviews and merges.
    - Every pull request includes a summary, screenshots and the list of files changed.
    ```

4. **Review and merge that pull request yourself.** Open it on github.com, read **Files changed**, then click **Merge pull request**. You've just used the approval gate for the first time.

5. **Ship one real change.** Pick a small improvement from your [TODO]s or feedback list (for example tightening the FAQ). Paste:

    ```text
    On a new branch, make this change: [your change].
    Follow SPEC.md and AGENTS.md. Check it at 375px and 1280px.
    Commit with a clear message, push, and open a pull request with a two-line summary,
    before and after screenshots, the files changed, and anything you were unsure about.
    Don't merge.
    ```

6. **Review it like an owner.** Check the summary, scan Files changed for surprises (new scripts, deleted blocks, .gitignore edits), look at the screenshots. Leave at least one comment asking for a tweak, have the agent address it on the same branch, then merge.

7. **Practice undo.** On the merged pull request, find the **Revert** button but don't click it. Or ask your agent: "How would I undo the last merge if I needed to?" Note the answer in a file called `RUNBOOK.md` in the repo (via a pull request, of course).

## Done when

- [ ] Your site is in a GitHub repository, with a .gitignore and no secrets or personal data in any file
- [ ] AGENTS.md says agents never commit to main and never merge
- [ ] At least two pull requests have been opened by an agent and merged by you
- [ ] You left a review comment on one pull request and the agent addressed it on the same branch
- [ ] RUNBOOK.md explains, in your words, how to undo a bad merge

:::coached
**For 1-on-1 coaching clients.** Make the approval gate enforced, not just written down.

1. In your repository settings, add a rule (a branch ruleset or branch protection) for `main` that requires a pull request before merging. Check GitHub's current docs for the exact menu.
2. Create a separate, limited way for agents to access GitHub (for example a fine-grained token scoped to this one repository, stored in your password manager, never in the repo) and write down which agent uses it.
3. Open three GitHub Issues for your next improvements, each written as a mini-spec, and have an agent turn one into a pull request.

**Bring to your session:** the repository link, your ruleset settings, the list of who or what has access, and the three issues.

**Your coach will:**
- Review access with you: who can push, who can merge, what each agent can touch
- Walk through one pull request review live and tighten your review habit
- Check your RUNBOOK.md is clear enough to follow under stress
:::
