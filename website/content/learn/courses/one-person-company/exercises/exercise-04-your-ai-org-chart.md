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

:::video
id: opc-ex4-setup
kind: exercise-setup
status: paused
src: /learn/video/one-person-company/opc-ex4-setup.mp4
captions: /learn/video/one-person-company/opc-ex4-setup.vtt
poster: /learn/video/one-person-company/opc-ex4-setup.jpg
transcript: Three documents, five boxes, and you at the top. Time to turn your work so far into one chart. In this exercise you'll draw your AI org chart. Put yourself at the top: you approve anything external or about money. Under you go five boxes: chief of staff, sales and customers, marketing and content, finance assistant, and product and website. Fill each box you can from your stack decision, and mark the rest as me for now, or open. Write a six-line role card for each filled box. Run the audit prompt, apply the fixes you agree with, and ignore anything that gives an agent money access. Then add the Friday review, and put it on your calendar. So: which box do you fill first, and does every job have exactly one owner? Pause here and draw your chart.
:::

## Warm-up

:::checkpoint
Q: Two of your agents both draft replies to client emails. What is the fix?
- [ ] Keep both and pick the better draft each time
- [ ] Remove your approval rule so they can send directly and save time
- [x] Give the inbox job to one agent and move the other to a different role
Why: One owner per job avoids duplicate drafts and wasted usage, and approval rules stay in place.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Three documents, one chart
shows: Three cards with Lucide icons on the left: Delegation Map, Stack Decision, Access Policy. An orange arrow points to a paper card: AI Org Chart v1, 5 boxes, a role card each, a Friday review.
data: none
image: /learn/figures/one-person-company/exercise-04-fig-1.webp
alt: Your Delegation Map, Stack Decision and Access Policy combine into AI Org Chart v1: five boxes, a role card for each, and a Friday review.
:::

1. **Draw the frame.** Put "Founder (you): approves anything external or about money" at the top. Under it, five boxes: Chief of Staff, Sales and Customers, Marketing and Content, Finance Assistant, Product and Website.

2. **Fill boxes from your stack.** Using your Stack Decision, put a tool in each box you can fill today. Leave the rest as "Me for now" or "Open". If you use the sample Rolling Ledger business, a $20 stack might look like: Chief of Staff = Claude Duet (if admitted) or "Open"; Finance Assistant = Claude chat with a receipts project; Product and Website = free GitHub plus your main chat tool; the rest "Me for now".

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

:::example
title: See an example result
Here is the org chart for the sample business, Rolling Ledger, on the example $20 stack from Exercise 2.

:::video
id: opc-ex4-reveal
kind: exercise-reveal
status: paused
src: /learn/video/one-person-company/opc-ex4-reveal.mp4
captions: /learn/video/one-person-company/opc-ex4-reveal.vtt
poster: /learn/video/one-person-company/opc-ex4-reveal.jpg
transcript: For Rolling Ledger, two boxes are filled, three wait, and every job has one owner. Here's the example chart. The founder sits at the top and approves anything external or about money. The finance assistant is Claude Pro with a Rolling Ledger project. It sorts receipts and drafts overdue-invoice reminders each Monday. It reads the invoicing app as a viewer, and drafts in Gmail, never sending without a yes. Product and website is free GitHub plus Claude Pro. The chief of staff will be Claude Duet once the waitlist lets the account in. Until then, that box says open. Sales and customers, and marketing and content, say me for now. The audit found two fixes: remove calendar access the finance assistant didn't need, and add delete to the chief of staff's rule. The next hire is marketing and content, for the Instagram posts, forty-five minutes a week. And the Friday review is on the calendar.
:::

:::infographic
id: fig-2
type: diagram
title: Rolling Ledger org chart
shows: Under "Rolling Ledger org chart" tagged example: a 3 by 2 grid. Chief of Staff, open, Duet waitlist; Sales, me for now; Marketing, me for now, next hire; Finance, highlighted, Claude Pro project; Product, GitHub plus Claude Pro; Friday review, 15 min, on the calendar.
data: none
image: /learn/figures/one-person-company/exercise-04-fig-2.webp
alt: Example Rolling Ledger org chart: the chief of staff is open until the Duet waitlist admits the account, sales and marketing are the founder for now with marketing as the next hire, finance is a Claude Pro project, product is GitHub plus Claude Pro, and a 15-minute Friday review is on the calendar.
:::

| Box | Tool | Status |
|---|---|---|
| Chief of Staff | Claude Duet, once admitted from the waitlist | Open |
| Sales and Customers | - | Me for now |
| Marketing and Content | - | Me for now, next hire (Instagram posts, 45 min a week) |
| Finance Assistant | Claude Pro, a Rolling Ledger project | Filled |
| Product and Website | Free GitHub plus Claude Pro | Filled |

```text
ROLE: Finance Assistant
TOOL: Claude Pro, a Rolling Ledger project
JOB: Sort receipts weekly; each Monday, draft reminders for invoices
     more than 7 days overdue.
ACCESS: Invoicing app as a viewer user; Gmail via connector, drafts only.
APPROVAL: Asks before sending any email or changing an invoice. No money.
REVIEW: I check drafts each Monday; 15-minute review on Fridays.
```

**Fixes applied from the audit:** removed calendar access the finance assistant did not need, and added "delete" to the chief of staff's approval rule.
:::

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
