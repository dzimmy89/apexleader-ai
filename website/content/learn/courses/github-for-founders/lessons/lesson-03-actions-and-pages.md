---
module: 1
lesson_number: 3
course: github-for-founders
template: v2
---

# Lesson 3: Actions and Pages

:::key-concept
GitHub Actions is a robot that runs tasks whenever something happens in your repo: a pull request opens, a change merges, or a clock ticks. GitHub Pages turns a repo into a live website. Together they give you a site that checks itself on every pull request and publishes itself when you merge.
:::

## What you'll be able to do

- Publish a simple website from a repository with GitHub Pages
- Read a workflow file well enough to know what it does and when it runs
- Use checks on pull requests as a second reviewer that never gets tired
- Store a secret safely for automation, instead of pasting it into a file

## Why this matters

In Lesson 2 you became the approver. But you can't see everything in two minutes: a broken link on page six, an image that's 8 MB, a form that no longer loads. Actions can check those things on every PR and show a green or red mark before you merge. Pages, meanwhile, means a landing page or help center costs nothing to host and publishes the moment you approve a change. Fewer tools, fewer logins, fewer things to break.

## Pages: a website from a repo

GitHub Pages hosts static websites: HTML, CSS, images and JavaScript that run in the visitor's browser. That covers landing pages, documentation, help centers and simple portfolios. It does not run server code or databases.

Your site gets an address like `yourname.github.io/groomer-books-site`, and you can connect your own domain.

To turn it on:

1. Put an `index.html` file at the top of the repo (or in a `/docs` folder). An agent can write one from your spec.
2. Open **Settings**, then **Pages**.
3. Under **Build and deployment**, pick a source. **Deploy from a branch** is simplest: choose `main` and the root folder. **GitHub Actions** is the more flexible option, and GitHub offers starter workflows for it.
4. Save. After a minute or two, the page shows your live URL.
5. Optional: under **Custom domain**, enter your domain, follow the DNS steps at your domain registrar, and tick **Enforce HTTPS** once it's available.

From now on, every merge to `main` republishes the site. Your PR gate from Lesson 2 is now the gate for your live website.

Two things to know before relying on it:

- **Plan limits.** Pages works with public repos on GitHub Free. Publishing from private repos needs a paid plan. A published Pages site is public on the internet even when the repo is private (except on some Enterprise setups).
- **Usage rules.** GitHub's docs set usage limits and say Pages is not meant to run an online business, e-commerce site, or software as a service. A marketing page or docs site is a normal use. For a store or checkout, use a host built for it. Read "GitHub Pages limits" before you launch.

## Actions: the robot in your repo

A workflow is a plain text file in the `.github/workflows` folder. It says when to run (the trigger) and what to do (the jobs). You don't need to write these. You need to read them well enough to approve them.

Here is a small workflow an agent might propose:

```text
name: Check links
on:
  pull_request:
  schedule:
    - cron: "0 9 * * 1"
jobs:
  links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check every link on the site
        uses: lycheeverse/lychee-action@v2
```

How to read it in plain English:

| Line | Meaning |
|---|---|
| `on: pull_request` | Run on every pull request |
| `schedule: cron "0 9 * * 1"` | Also run every Monday at 09:00 UTC |
| `runs-on: ubuntu-latest` | Use a fresh GitHub-hosted computer |
| `uses: actions/checkout` | Copy the repo onto that computer |
| `uses: lycheeverse/lychee-action` | Run a third-party link checker |

The last line is the one to think about. `uses:` pulls in code someone else wrote. Prefer actions from GitHub itself (`actions/...`) or well-known, widely used publishers, and ask your agent to explain any you don't recognize.

When a workflow runs on a pull request, its result shows up in the PR's **Checks** tab and at the bottom of the Conversation tab. Add it to your `protect-main` ruleset under **Require status checks to pass** and a red check will block the merge button.

## Good first workflows for a founder

Ask an agent to set these up one at a time, each in its own PR:

```text
Create a GitHub Actions workflow that runs on every pull request and:
1. Checks every link on the site for 404s
2. Fails if any image in /images is larger than 400 KB
3. Validates the HTML
Use only actions published by GitHub or widely used publishers, and list each
one with a one-line explanation of who maintains it. Open a pull request.
Don't add any secrets. Don't merge.
```

Other useful ones: a Monday morning check that your booking page still loads, a nightly build of your help center, or a workflow that deploys to Pages. Each run uses Actions minutes. Public repos get them free on standard GitHub-hosted runners; private repos get a monthly allowance by plan. Check the Actions billing page before adding heavy scheduled jobs.

## Secrets: where keys go

Some workflows need a key, for example to post a status message to your team chat. Never put a key in a file in the repo. Instead:

1. Open **Settings**, then **Secrets and variables**, then **Actions**.
2. Click **New repository secret**, give it a name like `SLACK_WEBHOOK`, paste the value, save.
3. The workflow refers to it as `${{ secrets.SLACK_WEBHOOK }}`. Nobody, including you, can read it back from the page later.

Create a dedicated, limited key for each workflow, never one tied to your main account, and rotate it if it ever leaks.

:::warning
A workflow runs with access to your repo and any secrets you give it. Treat a PR that adds or edits anything in `.github/workflows` as a high-risk change: read what it triggers on, what it uses, and which secrets it touches before merging. Workflows must never send email, post publicly or touch money without a human step. If someone outside your business opens a PR on a public repo, GitHub can require your approval before their workflows run; keep that setting on.
:::

:::try-it
Open the **Actions** tab of any popular public repository on GitHub. Click a recent run and look at the green and red steps. Then open its `.github/workflows` folder and find the `on:` line in one file. You just read a workflow.
:::

:::checkpoint
Q: You want a weekly report that a script builds from your sales data, and an agent suggests putting your payment processor's API key directly into the workflow file. What's the right move?
- [ ] Accept it if the repo is private
- [ ] Put the key in the README instead so it's easy to find
- [x] Store a restricted, read-only key as an Actions secret and reference it from the workflow
Why: Keys in files live forever in history and spread to every clone. Secrets are encrypted, never shown again, and a restricted read-only key limits the damage if anything goes wrong.
:::

:::takeaways
- Pages publishes a static site from your repo; every merge to `main` updates it.
- Actions runs workflows on triggers like pull requests, merges and schedules.
- Checks on pull requests are a tireless second reviewer; require them in your ruleset.
- Keys go in Actions secrets, scoped and rotated, never in files.
:::

## Go deeper

- [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) - what Pages hosts, plan availability and usage limits
- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) - deploy from a branch or with Actions
- [Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions) - workflows, triggers, jobs and runners in plain terms
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) - storing and using keys safely
