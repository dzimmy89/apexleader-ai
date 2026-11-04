---
module: 1
lesson_number: 6
course: agent-build-line
template: v2
---

# Exercise 6: One Night, Three Jobs

:::key-concept
You'll write three overnight jobs as GitHub issues with done-when checks and stop rules, start them in cloud agents before bed, and run the twenty-minute morning review the next day. Then you'll turn anything that went wrong into a rule.
:::

**Time:** 30 minutes in the evening, 20 the next morning · **You'll need:** Claude Code on the web or Codex cloud connected to your repo, the build line from Exercise 3 · **Builds on:** Lesson 6

:::video
id: bl-ex6-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-build-line/bl-ex6-setup.mp4
captions: /learn/video/agent-build-line/bl-ex6-setup.vtt
poster: /learn/video/agent-build-line/bl-ex6-setup.jpg
transcript: In this exercise you'll let agents work while you sleep. Tonight, write three small jobs as issues, each with checks the agent can run and a rule for when to stop. Start them in cloud agents and close your laptop. Tomorrow, with coffee, review each pull request from its preview link and decide: merge, send back or close.
:::

## Warm-up

:::checkpoint
Q: What must every overnight job include?
- [ ] A deadline
- [x] Checks the agent can run, and a stop rule
- [ ] Permission to merge if the tests pass
Why: Checks let the agent know it's done. The stop rule stops a stuck agent. Merging stays with you.
:::

## Evening steps

1. **Pick three small jobs.** Each must touch only dev and sandbox, and have a done-when an agent can check.

2. **Write the issues.** One GitHub issue each, labeled `overnight`, with Goal, Done when (run these yourself), and the Lesson 6 stop rule, including "Never change the tests to make them pass."

3. **Check the cloud agent's settings.** Make sure its environment holds only dev and sandbox values, the same as your Vercel previews.

4. **Note your usage** for each plan.

5. **Start the jobs.** In Claude Code on the web or Codex cloud, start one session per issue: "Do the job in this issue. Follow its done-when and stop rule. Open a pull request when the checks pass."

6. **Close the laptop.**

## Morning steps

7. **Set a 20-minute timer.** Make coffee.

8. **For each pull request:** read the summary, check the files changed match the job, check tests and build, click the preview, then merge, send back with one comment, or close.

9. **Read any drafts.** For each stuck job, note why: job too big, done-when wrong, or something the agent couldn't reach.

10. **Write the rules.** Add one dated rule to your `mistakes` house skill for anything that went wrong. Note your usage again.

## Done when

- [ ] Three `overnight` issues with checks and stop rules
- [ ] Each ended as a pull request or a draft with notes
- [ ] You reviewed all three in about 20 minutes and merged only what you clicked through
- [ ] Anything that went wrong is now a rule in `mistakes`

:::example
title: See an example result

For Rolling Ledger, the three jobs were: tests for the receipts page, three accessibility fixes, and making the monthly summary print on one page. By morning, the first two were pull requests with green checks and previews; both merged after a click-through. The print job was a draft: it passed in Chrome but failed twice in Safari, and the note explained a page-break setting. The founder added a rule: "Print jobs: done-when must name the browsers." Review took 17 minutes.

:::video
id: bl-ex6-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-build-line/bl-ex6-reveal.mp4
captions: /learn/video/agent-build-line/bl-ex6-reveal.vtt
poster: /learn/video/agent-build-line/bl-ex6-reveal.jpg
transcript: Here's the Rolling Ledger morning. Two green pull requests, clicked through on a phone and merged. One draft with a clear note about Safari. One new rule in the mistakes skill. Seventeen minutes, one coffee, and two jobs done that nobody worked on overnight.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Build your overnight queue.

1. List ten small jobs from your backlog.
2. For each, write the check an agent could run to prove it's done.
3. Pick the three safest for your first week of nights.

**Bring to your session:** your issues and the morning's results.

**Your coach will:**
- Check your stop rules and done-whens
- Confirm cloud agents hold only dev and sandbox values
- Help you decide how many jobs a night your plans can carry
:::
