---
module: 1
lesson_number: 1
course: github-for-founders
template: v2
---

# Lesson 1: Repos, Commits and Branches in Plain English

:::key-concept
GitHub is the filing cabinet for everything your agents build. A repository is the project folder with its full history, a commit is a saved snapshot with a note, and a branch is a safe copy where work happens before you approve it. Learn these three words and you can supervise any coding agent.
:::

## What you'll be able to do

- Explain repository, commit and branch to yourself in one sentence each
- Create a private repository on github.com and add a file without installing anything
- Read a repository's history and see who (or which agent) changed what, and when
- Set up your account so agents can work in it without ever holding your password

## Why this matters

When Cursor, Codex or Claude Code builds your website or a small internal tool, the result is a pile of files. If those files live only on your laptop, every agent session is a gamble: one bad run and last week's working version is gone. GitHub fixes that. Every change is saved with a label, nothing is lost, and you can always go back. It is also where every coding agent in this program expects to work. Cursor's cloud agents, Codex cloud tasks and GitHub's own Copilot agent all read from and write to a GitHub repository. You don't need to write code to run this. You need to know where to look and what to approve.

## The three words

| Word | Plain English | Business analogy |
|---|---|---|
| Repository (repo) | One project folder, stored on GitHub, with every past version kept | A client file in a cabinet that remembers every page ever added |
| Commit | A saved snapshot of the folder, with a short note saying what changed | A dated entry in a logbook: "Added pricing page" |
| Branch | A parallel copy of the folder where changes happen without touching the live version | A draft copy of a contract you mark up before anyone signs |

The main branch is usually called `main`. Treat `main` as "the version that's live." Every other branch is a draft.

Two more words you'll hear:

- **Push**: sending commits from a computer up to GitHub. Agents do this for you.
- **Clone**: downloading a copy of a repo to a computer so an agent can work on it.

## Set up your account properly, once

Your GitHub account will control your website and, later, your product. Treat it like your business bank login.

1. Sign up at github.com with your business email. The Free plan is enough for this course. Check GitHub's pricing page for what paid plans add.
2. Turn on two-factor authentication (Settings, then Password and authentication). Use an authenticator app or a passkey, not SMS if you can avoid it.
3. Save your recovery codes somewhere offline, such as your password manager.
4. Decide your naming. Repos are easier to find with plain names like `groomer-books-site` or `groomer-books-intake-form`.

:::warning
Agents never get your GitHub password. When a tool like Cursor, Codex or Copilot needs access, it asks you to install a GitHub App or approve an OAuth screen, and you choose which repositories it can see. Pick "Only select repositories" whenever the screen offers it. You can review and revoke these later under Settings, then Applications.
:::

## Create your first repo in the browser

You don't need any software for this.

1. Click the **+** at the top right of github.com and choose **New repository**.
2. Name it, for example `groomer-books-playbook`.
3. Choose **Private**. Anything you aren't sure should be public starts private.
4. Tick **Add a README file**. A README is the front page of the repo: a plain text file that explains what the project is.
5. Click **Create repository**.

You now have a repo with one commit in it. Click the clock icon or the "commits" link near the top of the file list to see it. That page is the logbook. Every future change, whether you make it or an agent does, appears there with an author, a time and a message.

## Make a commit yourself

Open the README, click the pencil icon to edit, and add a few lines:

```text
# Groomer Books playbook

What this repo is: the source files for our website and internal tools.
Who works here: the founder (approves everything) and AI coding agents.
Rule: agents work on branches and open pull requests. Only the founder merges.
```

Click **Commit changes**. GitHub asks for a commit message and whether to commit to `main` or create a new branch. Write a message that a stranger could understand, like "Add house rules to README," and commit to `main` this one time.

Good commit messages are short and specific. Compare:

| Weak | Strong |
|---|---|
| update | Add FAQ section to homepage |
| fixes | Fix broken link to booking form |
| stuff from agent | Replace hero image with compressed version |

You'll ask agents to write messages like the right-hand column. It makes the history readable months later.

## Branches: where agents should always work

Now make a second change, but this time choose **Create a new branch for this commit** and name it `add-contact-info`. GitHub saves the change on that branch only. Switch the branch dropdown back to `main` and the change isn't there. That is the whole point: drafts stay separate until you approve them.

This is the rule you'll give every agent:

```text
Never commit directly to main. Create a new branch for each task with a
short descriptive name, commit there with clear messages, and open a pull
request when you're done. Do not merge. The founder reviews and merges.
```

Put that in the README now, and later in the rules files your agents read (Cursor's rules and `AGENTS.md` come up in the Cursor and Codex courses). Lesson 2 shows how the pull request becomes your approval gate.

## Reading history like a manager

You don't need to read code to supervise. Open any repo and look at three things:

- **The commit list.** Who changed what, when, and why. Agent commits usually show the agent's name or "co-authored-by" lines.
- **A single commit.** Click one. Green lines were added, red lines were removed. A big red block you didn't expect is worth a question.
- **The branch list.** Click "branches." Old branches that were never merged are abandoned drafts. You can delete them once you're sure they're not needed.

:::try-it
Open your new repo, click the commits link, and click your README commit. Find the green lines you added. That view, added versus removed, is the core skill for reviewing any agent's work.
:::

:::checkpoint
Q: A coding agent says it "pushed the fix." Where do you check what actually changed?
- [ ] In the agent's chat summary, since agents report accurately
- [x] In the repo's commit list on GitHub, opening the commit to see added and removed lines
- [ ] On the live website, by refreshing until it looks different
Why: The commit is the record of what really changed. Summaries can be incomplete, and the live site only shows the result, not the change.
:::

:::takeaways
- Repo is the project folder with history, commit is a labeled snapshot, branch is a safe draft.
- `main` is the live version; agents always work on branches.
- Turn on two-factor authentication and give agents access through GitHub Apps scoped to selected repos, never your password.
- The commit list is your logbook for supervising agents.
:::

## Go deeper

- [About repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories) - what a repo holds and public versus private visibility
- [About branches](https://docs.github.com/en/pull-requests/reference/branches) - how branches isolate work from `main`
- [Configuring two-factor authentication](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) - step by step account security
