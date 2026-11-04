---
module: 1
lesson_number: 2
course: t3-code
template: v2
---

# Exercise 2: Plan on One, Build on Another

:::key-concept
You'll write a routing card for your business, then add one real feature to your site by planning it with one agent and building it with another. At the end you'll have a card that decides future jobs for you and a pull request that two plans shared.
:::

**Time:** 45 minutes · **You'll need:** T3 Code from Exercise 1, at least two agents on different plans (for example Claude Code and Codex), your site's repository in GitHub · **Builds on:** Lesson 2

:::video
id: t3-ex2-setup
kind: exercise-setup
status: paused
src: /learn/video/t3-code/t3-ex2-setup.mp4
captions: /learn/video/t3-code/t3-ex2-setup.vtt
poster: /learn/video/t3-code/t3-ex2-setup.jpg
transcript: In this exercise you'll route one real feature across two plans. First fill in a routing card for six Rolling Ledger jobs, using only the plans you pay for. Then add a Monthly and Annual toggle to the pricing page. Plan it with Claude Code in plan mode, write the five-line handoff note, and have Codex build it in its own worktree. Open a pull request, but don't merge it yet, and note what each plan used.
:::

## Warm-up

:::checkpoint
Q: Which of these belongs in a handoff note?
- [ ] The whole chat history, pasted in
- [x] The goal, the files, the decisions made, what done looks like, and what not to touch
- [ ] Your API keys, so the next agent can test things
Why: The next agent doesn't see the last one's reasoning. Five short lines give it everything it needs, without repeating the whole conversation or exposing secrets.
:::

## Steps

1. **List your plans.** Write down every AI plan you pay for and its price today, with the date. Only those plans can go on your card.

2. **Fill the routing card.** Create `notes/routing-card.md` with three columns, Job, Send to and Why, and fill these six jobs:
   - Write the pricing page copy
   - Fix the booking form so it works on phones
   - Write tests for the quote calculator
   - Lay out a new blog post page
   - Review a branch before it's merged
   - Fix a typo

3. **Add the card to your brief.** Copy the card into `AGENTS.md` under "Which agent does what". If you use Claude Code, make sure `CLAUDE.md` contains `@AGENTS.md`.

4. **Plan with your planning agent.** Start a thread on Claude Code (or your planner from the card), switch to **plan mode**, and send:

```text
Plan a Monthly/Annual toggle for pricing.html. Annual price is 10 times
the monthly price. Read the page first. Don't change any files. End with
a five-line handoff note: Goal, Files, Decisions, Done when, Don't.
```

5. **Check the note.** Read the handoff note. Fix anything that doesn't match what you want, such as which option shows first.

6. **Build with your building agent.** Start a new thread on Codex (or your builder) in a **new worktree**. Paste only the handoff note, then add: "Build this. Show me screenshots at 375px and 1280px wide."

7. **Review the diff.** Open the diff for the branch. Comment on any line you'd change and send the comments back. Repeat until it's right.

8. **Open a pull request.** Use T3 Code's commit and pull request button. Don't merge it yet. Give it a second look in GitHub first, as in GitHub for Non-Developers.

9. **Record what each plan used.** On the Usage page, note the tokens for each provider today. Add them to `notes/routing-card.md` under "First routed job".

## Done when

- [ ] `notes/routing-card.md` has six jobs, each sent to a plan you pay for
- [ ] `AGENTS.md` includes the card
- [ ] A handoff note exists in the planning thread
- [ ] A pull request is open with the toggle and two screenshots, not merged
- [ ] You've recorded the tokens each plan used

:::example
title: See an example result

For Rolling Ledger on Claude Pro, ChatGPT Plus and Cursor Plus, the card sent copy, planning and reviews to Claude Code, the booking form fix, tests and blog layout to Codex, and typos to Cursor. Claude Code's plan for the toggle took one thread with a handoff note. Codex built it in a worktree in two rounds, with one diff comment to fix the button colour. The pull request showed the $149 monthly price and $1,490 annual price with "2 months free" under Annual.

:::video
id: t3-ex2-reveal
kind: exercise-reveal
status: paused
src: /learn/video/t3-code/t3-ex2-reveal.mp4
captions: /learn/video/t3-code/t3-ex2-reveal.vtt
poster: /learn/video/t3-code/t3-ex2-reveal.jpg
transcript: Here's a finished example for Rolling Ledger. The routing card sends copy, planning and reviews to Claude Code, building and tests to Codex, and typos to Cursor. Claude Code planned the toggle and wrote the handoff note. Codex built it in its own worktree, and one diff comment fixed the button colour. The pull request shows 149 dollars a month or 1,490 dollars a year, with 2 months free. Two plans shared the work.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Route your real roadmap.

1. List the next ten jobs on your product or site.
2. Assign each to a plan using your card, and mark any job you're not sure about.
3. Route one real feature through plan, handoff and build, and keep the pull request open for review.

**Bring to your session:** your routing card, the ten-job list, and the open pull request.

**Your coach will:**
- Check your card against the plans you pay for and suggest one change
- Review the handoff note and the pull request
- Help you decide whether any plan is doing too little to keep
:::
