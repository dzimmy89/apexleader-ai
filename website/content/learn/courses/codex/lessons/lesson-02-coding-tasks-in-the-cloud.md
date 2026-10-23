---
module: 1
lesson_number: 2
course: codex
template: v2
---

# Lesson 2: Coding Tasks in the Cloud

:::key-concept
Codex Cloud runs coding tasks on OpenAI's servers instead of your computer. You set up an environment once (which repository, what to install, what network access), then send tasks from your desktop, the web or your phone. Each task gets its own workspace and comes back with changed files and test results for you to review and turn into a pull request.
:::

## What you'll be able to do

- Connect a GitHub repository and publish a Codex Cloud environment
- Choose sensible internet access and secrets settings for that environment
- Send several cloud tasks at once and review each result
- Turn a result into a pull request, or send it back with follow-up instructions

## Why this matters

Local tasks stop when your laptop sleeps. Cloud tasks keep going. That means you can queue three improvements before a client meeting and review them afterward, or fire off a fix from your phone while you're out. It also keeps experiments off your own computer. For a founder, it's the closest thing to a remote developer who works whenever you hand over a ticket.

## Before you start

You need:

- A GitHub account with your project in a repository (the GitHub for Non-Developers course covers this). Codex Cloud works from repositories, not loose folders.
- A ChatGPT plan that includes Codex. Cloud tasks use your Codex credits like any other task; check the Usage panel.
- A few minutes for the one-time environment setup.

When ChatGPT asks to connect to GitHub, grant access to the specific repositories Codex needs, not your whole account.

## Set up an environment

An environment is the saved recipe for the workspace each cloud task gets. Per OpenAI's Codex Cloud docs:

1. In ChatGPT on the web or the desktop app, choose **Work in**, then **Cloud**, then **Select environment** to create a new one.
2. Select the repository, for example `groomer-books-site`.
3. Codex inspects the repository, installs the dependencies and tools it needs, and tests that the workflow runs.
4. Review the setup and test results, save, and select **Publish**. Wait for "Environment published."

The settings you'll see include an install script, access (for example "Only me"), and network options. For a plain HTML site, there's almost nothing to install. For a small app, Codex works out the steps; read them before publishing.

## Network access and secrets

This is where you make your main safety decisions.

- **Internet access.** Under **Networks** you can allow internet access, pick a preset such as **Package managers** (enough to install common building blocks), and add specific allowed domains. Start with the narrowest setting that lets the task work. An agent that can reach the whole internet can also be misled by what it reads there.
- **Network secrets** let tasks reach specific HTTPS services you allow; saving a secret also allows its domain. Use test or read-only keys, created just for Codex. Never your main account's key.
- **Environment variables** hold non-secret settings.

A good rule for a founder: a website or internal-tool environment should need no live secrets at all. If a task seems to need one, it's probably a task you should approve step by step instead.

## Send good cloud tasks

Each task gets a fresh workspace from the environment, so you can send several at once without them colliding. Write each like a work ticket:

```text
Repository: groomer-books-site
Task: Add an FAQ section after "How it works" using the questions and
answers in content/faq.md, word for word.
Rules: Follow AGENTS.md. Plain HTML and CSS. Don't change other sections.
Done when: The section renders correctly at 375px and 1280px, all links
work, and you've listed the files changed and any open questions.
```

Good jobs for the cloud: content sections, accessibility fixes, broken-link repairs, small tools, tests, and tidy-ups. Keep for a closer, local session: anything touching payments, logins, or customer data.

You can start cloud tasks from:

- The desktop app or the web (Work in, then Cloud)
- The ChatGPT mobile app (open Codex)
- The terminal, if you or a developer use the Codex command-line tool
- Slack, via OpenAI's ChatGPT in Slack integration, if your workspace has it

## Review, follow up, then pull request

When a task finishes, review the changed files and test results. Then do one of three things:

- **Ask for changes.** Reply in the task: "The second FAQ answer is cut off on mobile. Fix the spacing and show a 375px screenshot."
- **Open a pull request** when it's right. Your repository's rules and review steps then apply, and you merge after your two-minute review.
- **Discard it** if it went the wrong way. Nothing reached your repository's main branch.

Don't skip the pull request step and push straight to `main`. The pull request is your record and your undo button.

:::warning
Cloud tasks run code on OpenAI's servers with whatever network access and secrets you give the environment. Keep internet access narrow, use only test or read-only keys created for Codex, and never give an environment keys that can send email, post publicly, issue refunds or move money. Grant GitHub access only to the repositories Codex needs, and merge every change yourself.
:::

:::try-it
In ChatGPT on the web or desktop, choose Work in, then Cloud, and open Select environment. Don't create anything yet. Look at which repositories it offers. If it shows every repository you own, tighten the GitHub access to only the ones Codex should see.
:::

:::checkpoint
Q: A cloud task to "fix the contact form" asks for your email provider's main API key so it can send a test message. What do you do?
- [ ] Add the key as a network secret so the task can finish
- [ ] Paste the key into the task message, then delete the message later
- [x] Decline, and ask Codex to fix the form without sending real email, then test sending yourself
Why: Sending email leaves the business and needs a human click. A main key in a cloud environment also gives the agent far more power than the task needs.
:::

:::takeaways
- Cloud tasks keep working with your laptop closed and come back as reviewable changes.
- Publish one environment per repository with the narrowest network access that works.
- Secrets: test or read-only keys only, never ones that send, post or pay.
- Every result goes through a pull request that you merge.
:::

## Go deeper

- [Codex Cloud](https://learn.chatgpt.com/docs/cloud) - environments, network access, secrets and pull requests
- [Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/) - the 2026 desktop app features, including GitHub review comment handling
- [OpenAI is folding Codex into the ChatGPT app](https://thenewstack.io/openai-codex-work-atlas/) - how Codex's coding tools sit beside ChatGPT Work
- [Codex pricing and credits](https://help.openai.com/articles/20001106) - how cloud and local tasks draw on your credits
