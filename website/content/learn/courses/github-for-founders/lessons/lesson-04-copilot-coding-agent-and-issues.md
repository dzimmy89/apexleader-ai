---
module: 1
lesson_number: 4
course: github-for-founders
template: v2
---

# Lesson 4: Copilot Coding Agent and Issues

:::key-concept
An issue is a written work order. Assign it to Copilot and GitHub's agent (now called Copilot cloud agent, formerly the coding agent) works on it in the background, then opens a pull request and asks you to review. Clear issues in, reviewable pull requests out, and you stay the one who merges.
:::

## What you'll be able to do

- Write an issue that works as a good prompt for an agent
- Assign an issue to Copilot, or start a task from the Agents tab, and follow its progress
- Steer the work with `@copilot` comments on the pull request
- Keep the agent safe: approve its workflow runs, give it standing instructions, and never let it merge

## Why this matters

Lessons 1 to 3 gave you a repo, an approval gate and automated checks. This lesson adds a worker that lives inside GitHub itself. You don't need a laptop session open: write the issue on your phone between client calls, assign it, and review the pull request that evening. For a solo founder, issues also double as your to-do list for the product, so the backlog and the work live in the same place.

A note on names: GitHub renamed "Copilot coding agent" to **Copilot cloud agent** in 2026. Older articles and videos use the old name. Same feature.

## Issues: work orders, not wishes

An issue has a title, a description, labels and an assignee. When you assign it to Copilot, GitHub's docs say the agent receives the title, description, existing comments and any extra instructions you add, and treats the issue as its prompt. Comments added after you assign it are not seen; put follow-ups on the pull request instead.

GitHub's own best-practice guide asks for three things in a good task: a clear description of the problem, acceptance criteria that say what "done" looks like, and directions about which files to change. Here is the pattern:

```text
Title: Add a "Pricing" section to the homepage

What: Our homepage has no pricing. Add a section between "How it works" and
the FAQ with our three plans from content/pricing.md.

Done when:
- The section shows plan name, monthly price and three bullets per plan
- It looks right on a phone (375px wide) and desktop
- No new scripts, fonts or tracking are added
- Existing sections are unchanged

Files: index.html and styles.css only.
Out of scope: checkout, payment links, any change to the booking form.
```

Notice the "Out of scope" line. Agents expand scope when unsure. Fencing off payment and booking keeps the change small and keeps money-related pages under your direct control.

## Good jobs and bad jobs for the agent

GitHub's guide suggests starting with small, clear tasks: fixing bugs, small interface changes, documentation, accessibility fixes and tests. It recommends you keep these yourself (or with a human developer):

- Broad, ambiguous work where the requirements aren't settled
- Production-critical fixes and incident response
- Anything touching security, personal data or logins

For a founder, translate that into: let the agent handle the FAQ update, the broken link and the new testimonial block. Keep the checkout, the client portal login and anything with customer data for a careful session with a human developer or a closely supervised agent.

## Assigning work to Copilot

The cloud agent is included in all paid Copilot plans (Pro, Pro+, Max, Business and Enterprise). Usage draws on the plan's monthly allowance of GitHub AI credits; check GitHub's Copilot plans page for current amounts.

From an issue:

1. Open the issue.
2. In the right sidebar, click **Assignees** and choose **Copilot**.
3. In the dialog, check the repository and starting branch, and add an optional prompt with extra guidance.
4. Confirm. Copilot starts a session, works in a temporary cloud environment, pushes to its own branch, opens a pull request and requests your review when it's done.

Other ways in:

- **Agents tab.** Open the repo's **Agents** tab (or github.com/copilot/agents) and type a task.
- **Dashboard.** On your github.com home page, click **Task**, pick the repo and describe the work.
- **New repository.** When creating a repo, you can enter a prompt and Copilot opens a draft pull request that builds a first version.
- **Failing check.** On a failed Actions run, click **Fix with Copilot**.

## Steering and reviewing

While it works, open the session to see its log: what it read, what it ran, what it changed. When the pull request arrives, review it exactly as in Lesson 2. If something needs to change, comment on the pull request:

```text
@copilot The Pro plan price is wrong. Use the numbers in content/pricing.md
exactly. Also remove the new font import you added; we only use system fonts.
```

Copilot reacts with an eyes emoji, starts a new session and pushes fixes to the same branch. You can also delegate individual review comments with **Fix with Copilot** on the Files changed tab.

Two safety features matter here:

- **Workflow runs wait for you.** By default, your Actions workflows don't run automatically when Copilot pushes. You click **Approve and run workflows** in the pull request's merge box after a look at the changes. GitHub's docs warn that turning this off can let unreviewed code reach your secrets. Leave it on.
- **Standing instructions.** Add a `.github/copilot-instructions.md` file with your house rules so you don't repeat them in every issue:

```text
# House rules for agents
- Work on a branch and open a pull request. Never merge.
- Keep changes to the files named in the issue.
- No new third-party scripts, trackers or fonts without asking.
- Never add API keys, passwords or customer data to any file.
- Plain HTML and CSS. Must work at 375px wide.
```

## Automations: recurring jobs

GitHub also lets you set up automations that run the cloud agent on a schedule or when an issue or pull request is opened, from the **Agents** tab under **Automations**. You pick the trigger, the prompt and the exact tools it may use, such as adding labels or opening a pull request. Per GitHub's docs they work only in private repositories, on Pro, Pro+, Max, Business and Enterprise plans. Sessions they start are visible to anyone with read access to the repo, so keep secrets out of the prompt.

A founder-friendly first automation: "When an issue is created, label it as bug, content or idea, and explain why." Give it only the label tool. Nothing leaves the repo, nothing merges.

:::warning
Give the agent only what the task needs. Don't turn off workflow approval, don't add bypass permissions for Copilot in your ruleset, and don't let any automation merge, deploy, email customers or touch payment settings. Issues and agent session logs are visible to everyone with repo access, and to the whole internet on public repos, so never paste customer details, passwords or keys into them.
:::

:::try-it
Open your practice repo, click **Issues**, then **New issue**, and write a work order using the What / Done when / Files / Out of scope pattern above for a tiny change, like adding your business hours to the README. Don't assign it yet. Just check: could a stranger do this without asking you a question?
:::

:::checkpoint
Q: You assigned an issue to Copilot an hour ago, then remembered the button should say "Book a call," not "Contact us." Where do you tell it?
- [ ] Add a comment on the original issue
- [x] Comment on Copilot's pull request with @copilot and the change
- [ ] Edit the live website directly so it's right
Why: Copilot reads the issue when it's assigned and doesn't see later issue comments. An @copilot comment on its pull request starts a new session on the same branch.
:::

:::takeaways
- Issues are prompts: what, done when, files, out of scope.
- Copilot cloud agent (formerly coding agent) is in all paid Copilot plans; it opens a pull request and asks for your review.
- Steer with @copilot comments on the PR; keep workflow approval on.
- Standing rules go in `.github/copilot-instructions.md`; automations get only the tools they need.
:::

## Go deeper

- [Using Copilot cloud agent on GitHub](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github) - assigning issues, the agents tab, @copilot comments and workflow approval
- [Best practices for using Copilot to work on tasks](https://docs.github.com/en/copilot/tutorials/cloud-agent/get-the-best-results) - writing well-scoped issues and choosing the right tasks
- [Creating automations with Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-automations) - triggers, tools and plan requirements
- [Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions) - the copilot-instructions.md file
- [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans) - which plans include agents and AI credits
