---
module: 1
lesson_number: 4
course: one-person-company
template: v2
---

# Exercise 4: Draw Your AI Org Chart

:::key-concept
You'll build a one-page AI Org Chart for your business: you at the top, five function boxes, a role card for each filled role, and a Friday review checklist. It pulls together your Delegation Map, Stack Decision and Access Policy into one document you'll keep updating.
:::

**Time:** 35 minutes · **You'll need:** Your three documents from Exercises 1 to 3, any AI chat, a doc or whiteboard tool · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Two of your agents both draft replies to client emails. What is the fix?
- [ ] Keep both and pick the better draft each time
- [ ] Remove your approval rule so they can send directly and save time
- [x] Give the inbox job to one agent and move the other to a different role
Why: One owner per job avoids duplicate drafts and wasted usage, and approval rules stay in place.
:::

## Steps

1. **Draw the frame.** Put "Founder (you): approves anything external or about money" at the top. Under it, five boxes: Chief of Staff, Sales and Customers, Marketing and Content, Finance Assistant, Product and Website.

2. **Fill boxes from your stack.** Using your Stack Decision, put a tool in each box you can fill today. Leave the rest as "Me for now" or "Open". If you use the sample Groomer Books business, a $20 stack might look like: Chief of Staff = Claude Duet (if admitted) or "Open"; Finance Assistant = Claude chat with a receipts project; Product and Website = free GitHub plus your main chat tool; the rest "Me for now".

3. **Write role cards** for each filled box, six lines each:

```text
ROLE:
TOOL:
JOB:
ACCESS: (from your Access and Approval Policy)
APPROVAL: (one line summary)
REVIEW: (daily check and weekly review)
```

4. **Run the audit prompt:**

```text
Here is my AI org chart and role cards: [paste].
Act as an operations manager for a one-person company.
1. Jobs with two owners or none.
2. Roles with more access than the job needs.
3. Approval rules missing send, publish, delete or money cases.
4. Single points of failure (one login, one tool, one device).
5. The next role I should fill, given my Delegation Map: [paste top jobs].
Return a fix list of no more than 8 items.
```

5. **Apply the fixes** you agree with. Ignore any suggestion that gives an agent money access.

6. **Add the Friday review** at the bottom of the chart:

```text
FRIDAY REVIEW (15 minutes)
[ ] Read each agent's log or Activity view
[ ] Count misses: wrong drafts, missed urgent items, false alarms
[ ] Change one thing per agent (brief, rule or access)
[ ] Pause stale routines; check scheduled tasks
[ ] Note any plan nobody used this month
```

7. **Put a date on it** and save as "AI Org Chart v1". Set a recurring 15-minute Friday calendar block.

## Done when

- [ ] The chart shows you at the top and all five function boxes
- [ ] Every filled box has a six-line role card with tool, access and approval
- [ ] No job has two owners, and no agent has money access
- [ ] You applied at least two fixes from the audit
- [ ] The Friday review checklist is on the chart and on your calendar

:::coached
**For 1-on-1 coaching clients.** Build the 90-day version.

1. Draw two charts: today and in 90 days, with the roles you plan to add and the revenue or hours milestone that triggers each hire.
2. For each planned role, name the tool and the one metric you'll judge it on (hours saved, response time, drafts accepted).
3. Run one full Friday review on any agent you already use and bring the notes.

**Bring to your session:** both charts, the metrics, and your first review notes.

**Your coach will:**
- Check the sequence of hires against your cash flow and goals
- Review your metrics and tighten any vague ones
- Agree your first always-on hire for the Always-On Agents course
:::
