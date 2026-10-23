---
module: 1
lesson_number: 1
course: github-for-founders
template: v2
---

# Exercise 1: Set Up Your Company's Code Home

:::key-concept
You'll create a secure GitHub account and a private "playbook" repository with house rules for every agent, then make commits on `main` and on a branch. At the end you'll have the home base every later exercise builds on, and you'll have read your own history like a manager.
:::

**Time:** 25 minutes · **You'll need:** A GitHub account (free), an authenticator app or passkey, a password manager · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: Your coding agent offers to save time by committing straight to `main`. What's the right answer?
- [ ] Yes, as long as it writes a good commit message
- [x] No. It works on a branch and opens a pull request, and you merge
- [ ] Yes, but only on weekends when traffic is low
Why: `main` is the live version. Branches keep drafts separate until you approve them, which is the whole point of the setup.
:::

## Steps

1. **Secure the account.** Sign in to github.com. Go to Settings, then Password and authentication, and turn on two-factor authentication. Save the recovery codes in your password manager. If you don't have an account yet, create one with your business email first.

2. **Pick your business.** Use your own. If you don't have one settled yet, use the sample business for this course: **Groomer Books**, a monthly bookkeeping service for independent dog groomers.

3. **Create the playbook repo.** Click **+**, then **New repository**. Name it `<yourbusiness>-playbook` (for example `groomer-books-playbook`). Choose **Private**. Tick **Add a README file**. Create it.

4. **Write the house rules on `main`.** Edit the README (pencil icon) and replace its contents with this, adjusted to your business:

```text
# Groomer Books playbook

What this repo is: the home for our website and internal tools.
Owner and approver: [your name]. Agents prepare, the founder approves.

## House rules for every agent
- Work on a new branch for each task. Never commit to main.
- Open a pull request when done. Never merge. The founder merges.
- Keep each pull request to one task.
- Never add passwords, API keys, tokens or customer data to any file.
- Write commit messages a stranger could understand.

## What lives here
- /site    our public website (coming in Exercise 2)
- /notes   decisions and specs
```

Commit it to `main` with the message `Add house rules for agents`.

5. **Make a draft on a branch.** Click **Add file**, then **Create new file**. Name it `notes/decisions.md` and add:

```text
# Decisions log

- [today's date] Chose GitHub as the home for all code and site files.
- [today's date] Rule: every change goes through a pull request.
```

At the commit step, choose **Create a new branch for this commit**, name it `add-decisions-log`, and commit. If GitHub offers to open a pull request, close that page for now. You'll do pull requests in Exercise 2.

6. **Prove the branch is separate.** Use the branch dropdown to switch between `main` and `add-decisions-log`. Confirm `notes/decisions.md` exists only on the branch.

7. **Read your history.** On `main`, click the commits link. Open your house-rules commit and find the green lines. Then open the **branches** view and see your draft branch listed.

8. **Check app access.** Go to Settings, then Applications. Look at **Authorized OAuth Apps** and **Installed GitHub Apps**. Remove anything you don't recognize. This is where you'll later scope Cursor, Codex and Copilot to selected repos only.

## Done when

- [ ] Two-factor authentication is on and recovery codes are stored safely
- [ ] A private playbook repo exists with house rules in the README on `main`
- [ ] An `add-decisions-log` branch holds a file that `main` doesn't have
- [ ] You can open a commit and point to added and removed lines
- [ ] You've reviewed Applications and removed anything unfamiliar

:::coached
**For 1-on-1 coaching clients.** Set this up for your real business, with structure for the next six months.

1. List every place code or site files live today (website builder, a freelancer's laptop, a shared drive, old repos). Note who has access to each.
2. Create your playbook repo plus empty repos for each real project you'll run with agents (site, internal tools), all private by default with plain names.
3. Draft your house rules with business-specific limits: which pages touch money (checkout, pricing, invoices), which hold customer data, and which agent may touch what.
4. Write a one-paragraph access plan: which tools get GitHub App access to which repos, and who besides you (if anyone) should ever be a collaborator.

**Bring to your session:** your inventory of where code lives, the house rules, and the access plan.

**Your coach will:**
- Check your house rules for gaps around money pages, customer data and merging
- Review the access plan for over-broad app permissions
- Help you decide which repos should ever be public
:::
