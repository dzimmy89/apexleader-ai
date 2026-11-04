---
module: 2
lesson_number: 8
course: get-found
template: v2
---

# Exercise 8: Schedule Your Monday SEO Brief

:::key-concept
You'll give one always-on agent read-only access to your search data, write its job description, run it once by hand, and put it on a Monday schedule. At the end you'll get a short SEO brief every week with three actions waiting for your OK.
:::

**Time:** 35 minutes · **You'll need:** an always-on agent from Always-On Agents or AI Marketing (Marketing Bot, Dots or Claude Code), Search Console, your marketing sheet with the Refresh Log · **Builds on:** Lesson 8

:::video
id: gf-ex8-setup
kind: exercise-setup
status: paused
src: /learn/video/get-found/gf-ex8-setup.mp4
captions: /learn/video/get-found/gf-ex8-setup.vtt
poster: /learn/video/get-found/gf-ex8-setup.jpg
transcript: In this exercise you'll hire your SEO watcher. Pick the one agent you already run. Add its own login to Search Console as a Restricted user. Paste the job description from Lesson 8 and adjust the brief to your three most important numbers. Run it once by hand and check every number against Search Console yourself. Then schedule it for Monday mornings, with approval on for anything that changes your site.
:::

:::infographic
id: fig-1
type: anatomy
title: The agent before setup
shows: An agent card with empty fields: name, schedule (blank), data access (none), job description (blank), brief format (blank), approval rules (blank). Beside it, Search Console's Users and permissions panel with an "Add user" button highlighted.
data: none
alt: An agent card waiting to be filled in, next to Search Console's Users and permissions panel where you'll add it as a restricted user.
:::

## Warm-up

:::checkpoint
Q: Your SEO agent's brief suggests changing a page title. What should happen next?
- [ ] The agent changes it, since it's a small fix
- [x] You decide; if you approve, the change goes through a pull request you review
- [ ] Nothing, agents shouldn't suggest changes
Why: The agent watches and suggests. Every change to your site comes back through you, as an approval and a pull request.
:::

## Steps

1. **Pick the agent.** Choose one from the table in Lesson 8. Write down why.

2. **Give it its own login.** Make sure the agent uses its own Google account, not yours. For a Claude Code session using an MCP connection, use a connection that has read-only access.

3. **Add it to Search Console.** In **Settings → Users and permissions**, click **Add user**, enter the agent's email and choose **Restricted**.

4. **Write the job.** Paste the job description from Lesson 8 into the agent. Replace the brief's headline with the three numbers you chose in the lesson's try-it.

5. **Set the gates.** Turn on approval for sending, publishing and any change. For Claude Code, confirm it can open pull requests but can't merge.

6. **Run it once by hand.** Ask the agent to produce this week's brief now.

7. **Check the numbers.** Open Search Console yourself and compare the headline numbers and one mover with what the agent wrote. If anything is wrong, tell the agent what it misread and run it again.

8. **Schedule it.** Set the routine or task for Monday at 7:00 your time.

9. **Approve one action.** From the first brief, approve one suggested action and see it through: a pull request reviewed and merged, or a task added to your content calendar.

## Done when

- [ ] The agent has its own login, added to Search Console as a Restricted user
- [ ] Its job description and brief format are saved
- [ ] One hand-run brief exists and its numbers match Search Console
- [ ] The job is scheduled for Monday mornings
- [ ] One approved action is done

:::example
title: See an example result

Rolling Ledger added an SEO section to its existing Marketing Bot's Monday routine. The Bot's own Google account was added to Search Console as Restricted. The first hand-run brief got clicks right but reported impressions for 28 days instead of 7; one correction fixed it. The brief now opens with clicks, AI-feature impressions and pages not indexed, the three numbers the founder cares about. The first approved action added "Can food truck owners write off commissary fees?" to the question bank.

:::video
id: gf-ex8-reveal
kind: exercise-reveal
status: paused
src: /learn/video/get-found/gf-ex8-reveal.mp4
captions: /learn/video/get-found/gf-ex8-reveal.vtt
poster: /learn/video/get-found/gf-ex8-reveal.jpg
transcript: Here's the Rolling Ledger setup. The Marketing Bot has its own login as a Restricted user. The first hand run read 28 days of impressions instead of 7, so we corrected it and ran it again. Now the brief opens with clicks, AI-feature impressions and pages not indexed. It's scheduled for 7 every Monday, and the first approved action is already in the question bank.
:::

:::infographic
id: fig-2
type: anatomy
title: The agent after setup
shows: The same agent card, now filled: name Marketing Bot, schedule Mondays 7:00, data access Search Console (Restricted), job description saved, brief headline "clicks, AI-feature impressions, pages not indexed", approval on for send, publish and change. A first brief preview with one action marked Approved.
data: none
alt: The finished agent: a Monday 7:00 schedule, restricted Search Console access, a saved job and brief format, approvals on, and a first brief with one approved action.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Tune the brief to your business.

1. Run the brief for three weeks and note which parts you actually acted on.
2. Add one business number to the headline, such as trial sign-ups from organic search.
3. Draft rules for when the agent should message you mid-week, such as a key page dropping out of the index.

**Bring to your session:** three briefs, your notes on what you used, and your mid-week alert rules.

**Your coach will:**
- Cut the parts of the brief you don't use
- Check the agent's access and gates
- Help you link search numbers to revenue
:::
