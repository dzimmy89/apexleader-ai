---
module: 1
lesson_number: 5
course: claude-code
template: v2
---

# Exercise 5: Add Guardrails and Put Your Site on Autopilot

:::key-concept
You'll add two hooks (a notification and a protected-files block), create a copy-checker subagent, run your first cloud session from claude.ai/code, and schedule a weekly site health check that opens pull requests. At the end your project has enforced guardrails and a safe automation working for you every week.
:::

**Time:** 35 minutes · **You'll need:** Claude Code, your website repo on GitHub from Exercise 4, a Pro or Max plan · **Builds on:** Lesson 5

## Warm-up

:::checkpoint
Q: Your weekly scheduled task finds a broken link. What should it do?
- [ ] Fix it directly on main so the site is fixed fast
- [x] Fix it on a new branch and open a pull request for you to review and merge
- [ ] Email your customers that the site had a problem
Why: Automations follow the same approval rule as everything else: they propose changes, and you merge.
:::

## Steps

1. Open your project in Claude Code on a new branch:

```text
Create a branch called guardrails.
```

2. Add the protected-files hook:

```text
Write a PreToolUse hook for this project that blocks edits to .env files,
anything in .git/, and any file with "secret" in its name. Put the script in
.claude/hooks/ and the config in .claude/settings.json. Explain each line in
plain English and wait for my OK before saving.
```

3. Test it: ask Claude to "create a file called .env with TEST=1." Confirm the hook blocks it. Run `/hooks` and find your hook in the list.
4. Add a notification hook to your personal settings (`~/.claude/settings.json`) so you get an alert when Claude needs you. Ask Claude for the version that matches your operating system, and approve it only after it explains the command.
5. Create the subagent:

```text
Create a project subagent called copy-checker in .claude/agents/. It reviews page
copy against the voice rules in CLAUDE.md, flags invented claims, numbers or
testimonials, and checks for jargon. Read-only: it may read files but not edit.
```

Then run it: "Use the copy-checker subagent on every page and give me a table of findings." Fix the findings you agree with.

6. Commit, push and open a PR for the guardrails branch. Review and merge it yourself.
7. Run a cloud session. Go to claude.ai/code, connect GitHub if you haven't, choose your repo and the main branch, pick **Plan** mode, and submit:

```text
Add an FAQ page with 6 questions a customer would ask, written using the voice
rules in CLAUDE.md, and link it from the nav. Plan first, then build after I
approve. Run the tests before you finish.
```

Approve the plan, let it work (close your laptop if you like), then review the diff, comment on at least one line, and click **Create PR**. Merge it on GitHub after you check it.

8. Schedule the weekly health check. Run `/schedule` in the terminal, or go to claude.ai/code/routines and click **New task**. Select only this repository and no extra connectors. Use the scheduled task prompt from Lesson 5.
9. Run the scheduled task once on demand and review what it produced.

## Done when

- [ ] A PreToolUse hook blocks edits to .env and secrets files, and you saw it block one
- [ ] A copy-checker subagent exists in `.claude/agents/` and produced findings
- [ ] A cloud session produced a PR that you reviewed and merged
- [ ] A weekly scheduled task is set up with access to one repository only and has run once

:::coached
**For 1-on-1 coaching clients.** Design your automation layer on your real project:

1. Add a Stop hook that runs your test command so Claude can't finish with failing tests.
2. Write a second scheduled task triggered by GitHub (for example, review every new PR against your REVIEW-CHECKLIST.md and comment).
3. List every automation you run, what it can reach, who it acts as, and what needs your click.

**Bring to your session:** your `.claude/settings.json`, your subagent files, the scheduled task prompts, and your automation list.

**Your coach will:**
- Review each hook and scheduled task for scope and safety
- Check that every automation proposes and never merges, sends or pays
- Help you decide what to automate next and what to keep manual
:::
