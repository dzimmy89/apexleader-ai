---
module: 1
lesson_number: 5
course: always-on-agents
template: v2
---

# Exercise 5: Build Your Agent Supervision Kit

:::key-concept
You'll pick the right always-on agent for each of your job specs and build a Supervision Kit: an assignment table, a daily two-minute checklist, a weekly scorecard per agent, and an incident runbook. It's the operating manual for your AI staff.
:::

**Time:** 30 minutes · **You'll need:** Your job specs and setups from Exercises 1 to 4, any AI chat · **Builds on:** Lesson 5

## Warm-up

:::checkpoint
Q: Your dot sent a wrong follow-up email to a client. You pause the dot. What else must you do?
- [ ] Nothing; pausing undoes the email
- [ ] Delete the dot so the email is recalled
- [x] Send the client a correction yourself, check Scheduled and Activity for other runs, and tighten the rule that should have stopped it
Why: Stopping is not undoing, and Pause does not cancel scheduled runs. Fix the effect, then fix the rule.
:::

## Steps

1. **Assign each job.** List every job spec you have. For each, answer the three choice questions from Lesson 5 (where your work lives, eligibility, trigger type), then assign Duet, a dot, a Grok Bot, or "chat or desktop tool instead". Use this prompt if you're unsure:

```text
Here are my job specs: [paste]. My plans and country: [list].
For each job, recommend Claude Duet, an OpenAI dot, a Grok Bot, or a
non-always-on tool, with one-line reasoning. Flag anything that depends
on a research preview, beta or waitlist. Make sure no job has two agents.
```

2. **Make the assignment table:**

```text
JOB | AGENT | STATUS (live / waitlist / planned) | APPS | GATE | OWNER CHECK
```

3. **Write the daily check** (two minutes, every morning):

```text
[ ] Duet: read the brief; clear waiting approvals
[ ] Dot: Activity - anything waiting, unexpected or stuck?
[ ] Bots: any pending or Expired approvals? Any failed routine?
```

Keep only the lines for agents you actually run.

4. **Copy the weekly scorecard** from Lesson 5, one per agent, and set a 15-minute Friday calendar block.

5. **Write promotion rules:**

```text
Promote after 4 clean weeks: one narrow internal action only.
Never promote: sends to customers, public posts, deletes, anything with money.
Retrain when a miss repeats. Remove after a miss survives two retrains.
```

6. **Write the incident runbook:**

```text
1. Stop: deny the action; pause the agent, routine or scheduled task.
2. Fix the effect myself: correction email, restored file.
3. Cut access: disconnect in the agent, revoke in the app; for Bots, sign out on the shared computer.
4. Log: what happened, which rule should have caught it, what I changed.
5. Report to the vendor through its feedback channel.
```

7. **Fill in one scorecard now** for any agent or AI tool you used this week.

8. **Save** it all as "Agent Supervision Kit" next to your AI Org Chart.

## Done when

- [ ] Every job has exactly one assigned agent or a non-agent tool, with preview or beta status noted
- [ ] Your daily check fits on five lines and matches the agents you run
- [ ] A weekly scorecard and Friday calendar block exist for each agent
- [ ] Promotion rules keep sends and money behind approval forever
- [ ] The incident runbook has stop, fix, cut, log and report steps

:::coached
**For 1-on-1 coaching clients.** Run the kit for two weeks on real agents.

1. Do the daily check every workday and two Friday scorecards for each live agent.
2. Run a tabletop drill: pick one plausible incident (wrong recipient, broken routine, hidden instruction in a web page) and walk the runbook step by step, timing it.
3. Propose one promotion and one retrain based on the scorecards.

**Bring to your session:** both weeks of scorecards, drill notes and your proposed changes.

**Your coach will:**
- Review scorecard trends and challenge the promotion
- Walk the incident drill with you and fill gaps
- Set your next 30-day agent plan
:::
