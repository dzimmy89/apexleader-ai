---
module: 1
lesson_number: 4
course: cursor
template: v2
---

# Lesson 4: Code Review and Background Agents

:::key-concept
Two Cursor features let work happen without you at the keyboard. Cloud agents (formerly called background agents) take a task, work in their own computer in Cursor's cloud, and open a pull request. Bugbot reviews every pull request for bugs and security problems before you merge. One builds while you're away, the other double-checks, and you still make the final call.
:::

## What you'll be able to do

- Start a cloud agent from your phone, the web or the desktop app, and review its pull request
- Turn on Bugbot for a repository and give it review rules in `.cursor/BUGBOT.md`
- Decide when to let Bugbot's Autofix push fixes, and when not to
- Keep cloud agents away from secrets and money

## Why this matters

You'll often think of a fix at the worst time: on a walk, in a client meeting, at 11 p.m. Cloud agents let you send that task off from your phone and review a finished pull request later. And because you can't read code line by line, a second reviewer that looks specifically for bugs and security holes is worth having. Bugbot is that reviewer. It doesn't replace your two-minute review; it makes it safer.

## Cloud agents: work that runs while you're away

Cursor's docs describe cloud agents as using the same agent abilities, but running in isolated virtual machines in the cloud. Each one clones your repository, works on its own branch, and pushes its changes for you to review, usually as a pull request. Your laptop can be closed.

Ways to start one:

- **Desktop:** in the agent input, pick **Cloud** from the dropdown under the input.
- **Web and phone:** go to cursor.com/agents, or use the Cursor iOS app. On Android, open cursor.com/agents in Chrome and install it as an app.
- **Slack or Linear:** mention `@cursor` with the task.
- **GitHub:** comment `@cursor` on an issue or pull request.

Before your first one, check:

1. **Plan.** Cloud agents need Premium or higher (or Teams/Enterprise). They use your plan's usage at the chosen model's rate, and Cursor asks you to set a spend limit on first use. Set a low one.
2. **GitHub access.** Connect GitHub and grant access only to the repositories the agent should touch.
3. **Environment.** For a plain HTML site there's nothing to set up. For apps with dependencies, Cursor can set up the environment with the agent's help, from a snapshot, or from a Dockerfile.

A task brief that works well from a phone:

```text
In groomer-books-site: add a "Testimonials" section after "How it works"
using the three quotes in content/testimonials.md, word for word.
Follow AGENTS.md. Plain HTML and CSS. Screenshot it at 375px and 1280px.
Open a pull request with a short summary and the screenshots. Don't merge.
```

Cloud agents can also produce demos and screenshots of their work, and since October 2026 they can build interactive "canvases" you share with a link. When the pull request arrives, review it exactly as you would any other: summary, files changed, screenshots, checks.

Cursor 3 also lets you move work between local and cloud: push a local session to the cloud so it keeps running after you close the laptop, or pull a cloud session down to test it on your machine.

## Bugbot: your second reviewer

Bugbot reviews pull requests for bugs, security issues and code quality problems, and leaves comments with an explanation and a suggested fix.

To set it up:

1. Open the Cursor dashboard and connect your repositories (GitHub, GitLab, Bitbucket and Azure DevOps are supported).
2. Open **Bugbot** under Automations and choose which repositories it reviews. On GitHub, connecting turns it on for the repositories you grant.
3. From then on it reviews each pull request update automatically. To ask for a review by hand, comment `bugbot run` or `cursor review` on the pull request.

You can change personal settings so it only runs when mentioned, or only once per pull request, to control cost. Bugbot uses usage-based billing; check the pricing page for your tier.

## Teach Bugbot what matters to you

Bugbot doesn't read your Cursor project rules. It has its own file: `.cursor/BUGBOT.md`. The one at the root always applies; files in subfolders apply to changes in those folders.

```text
# Review rules for Groomer Books
- Flag any new third-party script, tracker, font or external request.
- Flag any file that looks like it contains a key, password, token or email list.
- Flag changes to pricing text outside content/pricing.md.
- Flag any form that sends data anywhere other than our booking provider.
- Flag links that use http instead of https.
- Flag images over 250 KB or missing alt text.
```

Bugbot can also learn rules from your merged and closed pull requests (the **Automatically Learn Rules** switch), and you can teach it on the spot by commenting `@cursor remember` followed by a fact, for example `@cursor remember we never load Google Fonts`.

## Autofix: helpful, but keep it on a leash

Autofix starts a cloud agent to fix what Bugbot finds, pushes the fix, and comments on the pull request. Its modes are **Off**, **Create New Branch**, and **Commit to Existing Branch** (limited to three attempts per pull request). It bills at cloud agent rates.

For a founder, **Create New Branch** is the right default: the fix arrives as its own change you can review, rather than quietly landing on the branch you were about to merge. Whatever you choose, nothing should merge without your click.

Teams and Enterprise plans also have Security Review, added in September 2026, which posts one comment per pull request on exploitable bugs. Useful once you have a team.

:::warning
Cloud agents don't use the run modes from Lesson 1: they run commands freely inside their cloud machine. That's why the limits go around them. Add only the secrets a task truly needs, in Cursor's dashboard and never in a prompt or file. Use test or read-only keys, never your main accounts. Never give a cloud agent a task that sends emails, posts publicly, charges cards or moves money; it prepares the change, you approve and launch it. Set a spend limit on first use.
:::

:::try-it
Open any pull request on a repository where you've installed Bugbot and comment `bugbot run`. If you haven't installed it yet, open cursor.com/agents on your phone and look at what it asks you to connect before you can start a cloud agent. Don't grant access to every repository; pick one.
:::

:::checkpoint
Q: Bugbot flags a possible bug on your pull request and Autofix offers to fix it. You plan to merge tonight. Which Autofix mode fits best?
- [ ] Commit to Existing Branch, then merge without looking again
- [x] Create New Branch, then review the fix like any other change before merging
- [ ] Turn Bugbot off so it stops slowing you down
Why: A fix on its own branch is a separate change you can inspect, so nothing lands on your merge branch without review.
:::

:::takeaways
- Cloud agents work in Cursor's cloud on their own branch and return a pull request; start them from phone, web, desktop, Slack, Linear or GitHub.
- They need Premium or higher and use your usage; set a spend limit.
- Bugbot reviews every pull request; give it rules in `.cursor/BUGBOT.md`.
- Prefer Autofix on a new branch, keep secrets out, and you always merge.
:::

## Go deeper

- [Cloud agents](https://cursor.com/docs/cloud-agent) - ways to start, environments, secrets and plan requirements
- [Bugbot](https://cursor.com/docs/bugbot) - setup, triggers, BUGBOT.md rules, learned rules and Autofix
- [Cursor changelog](https://cursor.com/changelog) - canvases, Security Review and other recent cloud features
- [Cursor pricing](https://cursor.com/pricing) - which tiers include cloud agents and Bugbot
