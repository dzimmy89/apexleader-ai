---
module: 1
lesson_number: 4
course: claude-code
template: v2
---

# Lesson 4: Tests, Review and Git

:::key-concept
Three habits make AI-built software trustworthy: tests that prove it works, a review by a fresh pair of eyes, and git so every change is saved and reversible. Claude Code can do all three for you. Your job is to require them before anything ships.
:::

## What you'll be able to do

- Ask Claude to write and run tests, and read the results
- Get an independent review of changes with `/code-review` or a reviewer session
- Use git through Claude: commits, branches and pull requests on GitHub
- Set a simple "nothing ships until" rule for your project

## Why this matters

When a developer builds for you, you trust their process. When an AI builds for you, you need that process to be visible. Tests catch the bug before a customer does. A review catches what the builder missed. Git means a bad change is one command away from undone. Together they let a non-developer run a codebase with confidence.

## Tests: proof, not promises

A test is a small program that checks your code gives the right answer. You saw one in Lesson 3. Make it a habit for every feature.

You don't need to write tests. You need to say what should be true. Prompts that work:

```text
Find the parts of this project that have no tests and list them, most
important first, in plain English.
```

```text
Add tests for the savings calculator covering: normal inputs, zero, empty,
negative, very large numbers, and decimals. Run them and fix any failures.
Show me the output.
```

```text
Add a single command I can run to execute all tests, document it in CLAUDE.md,
and tell me what a passing result looks like.
```

That last one matters. Once the test command is in CLAUDE.md, Claude runs it before saying it's done, and so can you.

When a test fails, don't ask Claude to "make the test pass." Ask it to fix the cause:

```text
This test fails: [paste output]. Find the root cause and fix the code.
Don't change the test unless the test itself is wrong, and if so, explain why.
```

## Review: a fresh pair of eyes

The agent that wrote the code is not the best one to judge it. Claude Code gives you three ways to get a second opinion:

| Option | What it does | Plans |
| --- | --- | --- |
| `/code-review` | A bundled skill that reviews the current changes for bugs in a fresh subagent and reports findings back to your session | Any plan with Claude Code |
| Writer and reviewer sessions | Open a second session and ask it to review the first session's work against your plan | Any plan |
| Code Review on GitHub | Several agents review each pull request and leave inline comments ranked by severity; never approves or blocks the PR | Team and Enterprise |

A review prompt you can reuse:

```text
Use a subagent to review the Pricing page changes against PLAN-pricing.md.
Check that every requirement is done, the calculator edge cases have tests,
no prices or copy changed without my approval, and nothing outside the task
changed. Report only gaps that affect correctness or the plan, not style.
```

The last sentence keeps the review useful. Reviewers asked to find problems will always find some; you want the ones that matter.

## Git: save points for your business

Git is version control: a history of every change, who made it and why. GitHub is the website that stores that history online and lets you review changes before they go live. You don't need to learn git commands. Claude knows them. You need to know five words:

| Word | Plain meaning |
| --- | --- |
| Repository (repo) | The project folder with its full history |
| Commit | A saved snapshot with a message describing the change |
| Branch | A separate copy of the work where you try something without touching the live version |
| Pull request (PR) | A proposal to merge a branch into the main version, where you review it first |
| Merge | Accepting the PR so the change becomes part of the main version |

### Set it up once

```text
Turn this folder into a git repository. Create a .gitignore that excludes
system files, editor files, and any .env or secrets files. Make the first
commit with a clear message. Explain each step in plain English.
```

To put it on GitHub, create a free GitHub account, then install the GitHub CLI (`gh`) and sign in with `gh auth login`. Claude Code works well with `gh` for creating repos and pull requests. Then:

```text
Create a private GitHub repository for this project using gh, push the main
branch, and give me the link.
```

### The everyday loop

For every feature from now on:

```text
Create a branch called pricing-page for this work.
```

...build and test...

```text
Run all tests. If they pass, commit with a descriptive message and open a
pull request. In the PR description, explain the change for a non-developer
and list anything I should check by hand.
```

Then open the PR on GitHub, read the description and the changes, and click **Merge** yourself. That click is your approval rule for code.

:::warning
Never commit passwords, API keys or a `.env` file. If a secret ever lands in a commit, removing it later is not enough: treat it as leaked and rotate it with the provider right away. Keep the repo private unless you mean to publish it, and keep the merge to main as your own click.
:::

## Your "nothing ships until" rule

Add this to CLAUDE.md so every session follows it:

```text
## Definition of done
- All tests pass (run: [your test command]) and show me the output.
- Run /code-review on the changes and fix correctness findings.
- Work happens on a branch, never directly on main.
- Commit with a clear message and open a PR. Never merge; I merge.
```

Rules in CLAUDE.md are guidance Claude follows, not hard locks. In Lesson 5 you'll add a hook for anything that must never be skipped.

:::try-it
In your project, ask: "Show me the git history of this project as a short plain-English list." If you don't have git yet, ask Claude to set it up first. Seeing your work as a list of saved snapshots makes git click.
:::

:::checkpoint
Q: Claude finished a feature on a branch, tests pass and a PR is open. Who should merge it into main?
- [ ] Claude, automatically, as soon as tests pass
- [x] You, after reading the PR description and changes
- [ ] Nobody; leave it open so it can't break anything
Why: The merge is the moment code goes live, so it is your approval click, just like hitting send on an email Claude drafted.
:::

:::takeaways
- Say what should be true; let Claude write and run the tests and show you the output.
- Get an independent review with `/code-review` or a second session before you merge.
- Use git through Claude: branch per feature, clear commits, a PR you review, and your own merge.
- Keep secrets out of the repo, and write your definition of done into CLAUDE.md.
:::

## Go deeper

- [Common workflows](https://code.claude.com/docs/en/common-workflows) - test and pull request recipes
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) - verification, writer and reviewer sessions, adversarial review
- [Code Review](https://code.claude.com/docs/en/code-review) - automated PR reviews on Team and Enterprise, and local options
