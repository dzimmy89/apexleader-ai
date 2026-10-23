---
module: 1
lesson_number: 4
course: claude-code
template: v2
---

# Exercise 4: Put Your Site Under Git, Review It and Open Your First PR

:::key-concept
You'll put your website project on GitHub, expand the calculator tests, run an independent review, and ship the work through a pull request you merge yourself. At the end you have a private GitHub repo with history, a test command, a definition of done in CLAUDE.md, and your first merged PR.
:::

**Time:** 35 minutes · **You'll need:** Claude Code, your website project from Exercise 3, a free GitHub account · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: A test fails after a change. What should you ask Claude to do?
- [ ] Delete the failing test so the suite passes
- [ ] Rewrite the test to match whatever the code does now
- [x] Find the root cause and fix the code, changing the test only if the test is wrong and explaining why
Why: Tests are your proof. Editing them to pass hides the bug instead of fixing it.
:::

## Steps

1. Open your project in Claude Code and set up git:

```text
Turn this folder into a git repository if it isn't one. Create a .gitignore
that excludes system files, editor files, .env and any secrets files.
Make the first commit. Explain each step in plain English.
```

2. Install the GitHub CLI if you don't have it (ask Claude: "How do I install gh on my computer?"), then run `gh auth login` yourself in a terminal and sign in through the browser. Never paste a GitHub password or token into the chat.
3. Create the repo:

```text
Create a private GitHub repository for this project with gh, push main,
and give me the link.
```

4. Open the link and confirm the repo is **Private** and your files are there.
5. Start a branch and expand the tests:

```text
Create a branch called calculator-tests. Add tests for the calculator covering
normal inputs, zero, empty, negative, very large numbers and decimals.
Add one command to run all tests, document it in CLAUDE.md, run it, fix any
real bugs, and show me the output.
```

6. Run the independent review:

```text
/code-review
```

Read the findings. Ask Claude to fix the ones that affect correctness. Skip pure style comments.

7. Add the "Definition of done" section from Lesson 4 to CLAUDE.md, with your real test command.
8. Ship it:

```text
Run all tests. If they pass, commit with a descriptive message, push the branch,
and open a pull request. In the description, explain the change for a
non-developer and list what I should check by hand.
```

9. Open the PR on GitHub. Read the description and click through the changed files. Merge it yourself.
10. Back in Claude Code, ask: "Switch to main, pull the latest, and show me the git history as a plain-English list."

## Done when

- [ ] A private GitHub repo holds your project, with no secrets or .env files in it
- [ ] The test command is in CLAUDE.md and the tests pass
- [ ] `/code-review` ran and correctness findings were fixed
- [ ] You merged your first pull request yourself on GitHub

:::coached
**For 1-on-1 coaching clients.** Make the quality process stick on your real project:

1. Run a writer and reviewer setup: one session builds a small change, a second session reviews it against the plan.
2. Have Claude write a REVIEW-CHECKLIST.md for your business (prices, claims, privacy, accessibility) and use it in every PR description.
3. If you're on Team or Enterprise, ask your admin about Code Review on GitHub and compare its findings with `/code-review`.

**Bring to your session:** your repo link (or a screen share), one PR with its review findings, and your checklist.

**Your coach will:**
- Walk the PR with you and show you what to look for as a non-developer
- Check the repo for secrets, visibility and branch habits
- Tune your definition of done so it's strict but not slow
:::
