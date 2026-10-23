---
module: 1
lesson_number: 3
course: run-the-company
template: v2
---

# Exercise 3: Run the Friday Review and Set Next Week

:::key-concept
You'll turn your week of logs into a one-page company review, a report card for every agent, a fix for every correction, and a written scale decision for each agent. At the end you'll have updated job descriptions, a clean access list and next Monday's starting point.
:::

**Time:** 45 minutes · **You'll need:** your Scorecard, Decision Log, Triage Log and Corrections doc from Exercises 1 and 2, access to each agent's settings and activity history · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: Your research agent saves you about 30 minutes a week, but you spend about 90 minutes a week correcting and approving its work, three weeks in a row. What's the call?
- [ ] Scale it up so it has more chances to save time
- [ ] Keep it and hope it improves
- [x] Pause or retire it: stop its routines, remove its access and keep its job description for later
Why: An agent that costs more of your time than it saves for three weeks is a net loss. Retire it cleanly and revisit when you can write a tighter job.
:::

## Steps

1. **Draft the review.** Give Duet (or your fallback chat) your four docs and the review prompt from Lesson 3. Check every number against its source before you trust it.

2. **Score each agent.** Copy this table into a `Report Cards` doc and fill one row per agent:

   ```text
   Agent | Output | Accuracy (corrections) | Boundaries (any out-of-scope action?) |
   Your time (approval + fix minutes) | Cost this week | Verdict
   ```

3. **Sort your corrections.** Label each line in Corrections as instruction, access or process.

4. **Fix instructions.** For each agent with instruction fixes, use the Lesson 3 prompt to have it propose new lines. Edit them, approve the full updated job description, and update it in the tool (Grok Bot description or skill, Dot Custom Rules, Claude project instructions).

5. **Test the fixes.** Run each changed job once on a safe input: Test run for Grok Bot routines, a sample task for a Dot, a dry run in chat for anything else. Confirm it stops at the approval point.

6. **Audit access.** Make a table: Agent | Account or tool | Role | Last used | Keep or remove. Remove anything unused. Sign out of sites no agent needs on your Grok Bot computer. Rotate any key that was ever pasted into a chat or document.

7. **Make the scale calls.** Apply the scale, add and retire rules from Lesson 3 to each agent. Write each decision in your Decision Log with one line of reasoning. Remember: approvals on public actions and money never go away, whatever the verdict.

8. **Set next Monday.** At the top of your reports place, write: what changed in each agent, what you're testing, any scorecard target changes, and next week's draft priorities.

## Done when

- [ ] Every agent has a report card row with a verdict
- [ ] Every correction is labeled and has a fix applied and tested
- [ ] Your access table is current, with unused access removed
- [ ] Next Monday's starting point is written where Monday's session will see it

:::coached
**For 1-on-1 coaching clients.** Make this your graduation review:

1. Run three consecutive weeks of the full rhythm (Monday session, daily briefs, Friday review) on your real business.
2. Build a trend view: each agent's report card over the three weeks, plus your total founder hours on approvals and fixes.
3. Draft a 90-day plan: which agent to scale first, which job to hire an agent for next, and what the scorecard targets should be.

**Bring to your session:** three weeks of report cards, your access table, your founder-hours trend and the 90-day plan.

**Your coach will:**
- Review the trend and confirm (or challenge) your first scaling move
- Check your access table and approval rules one last time for gaps
- Pressure-test the 90-day plan against your scorecard and cash
:::
