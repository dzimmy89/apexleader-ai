---
module: 1
lesson_number: 3
course: ai-sales
template: v2
---

# Exercise 3: Set Up a Self-Updating Pipeline

:::key-concept
You'll build a six-field Pipeline, write the rules that define "clean," and schedule an agent to update it from your email and calendar each weekday. You'll finish with a working CRM and your first CRM report.
:::

**Time:** 35 minutes · **You'll need:** Your Lead list workbook from Exercises 1 and 2, Claude Cowork or Grok Bot (or HubSpot's free CRM plus the Claude connector) · **Builds on:** Lesson 3

:::video
id: sales-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-sales/sales-ex3-setup.mp4
captions: /learn/video/ai-sales/sales-ex3-setup.vtt
poster: /learn/video/ai-sales/sales-ex3-setup.jpg
transcript: Six fields, one rules doc, and a report you read on Friday. Let's set up your self-updating pipeline. In this exercise you'll hand the boring part of your CRM to an agent. Choose your CRM: a Pipeline tab in your lead list workbook, or HubSpot. Create the six columns. Write a CRM rules doc with allowed values for each field, and a section that splits apply from propose. Add a CRM report tab. Give the agent the narrowest access that works: the workbook, plus your email and calendar, limited to people in the pipeline. Paste the CRM Keeper job, and run it once by hand. Then check its work: open three changed rows, compare them with the real emails, and approve or reject each proposal. Schedule it for weekdays at five, and put a ten-minute Friday review on your calendar. So: is there anything it can delete? Pause here and set it up.
:::

## Warm-up

:::checkpoint
Q: Which CRM change should your agent only propose, never apply on its own?
- [ ] Updating Last touch after an email
- [ ] Adding a dated note after a meeting
- [x] Moving someone to Do not contact after they reply "please stop"
Why: Opt-outs, Lost deals and deletions are judgment calls with legal or business weight. The agent flags them; you confirm the same day.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to a self-updating pipeline
shows: Seven numbered steps: 1 Choose the CRM, 2 Six columns, 3 CRM rules doc (highlighted), 4 Narrow access, 5 Run it once, 6 Schedule it, 7 Friday review.
data: none
image: /learn/figures/ai-sales/exercise-03-fig-1.webp
alt: Seven steps. 1. Choose the CRM: A Pipeline tab is fine. 2. Six columns: stage to notes. 3. CRM rules doc: apply versus propose. 4. Narrow access: pipeline people only. 5. Run it once: spot-check 3 rows. 6. Schedule it: weekdays at 5pm. 7. Friday review: 10 minutes.
:::

1. **Choose your CRM.** Default: a "Pipeline" tab in your Lead list workbook. If you chose HubSpot, create the six fields as deal properties instead and connect the HubSpot connector to Claude.

2. **Create the Pipeline columns:**

```text
Business name | Contact | Stage | Last touch | Next step | Next step date | Value | Notes
```

Copy in every lead with Status "Contacted" from Exercise 2. Set their Stage to Contacted.

3. **Write the CRM rules doc.** Make a doc called "CRM rules" with the six-field table from Lesson 3 (allowed values and rule for each). Add a section "Apply vs propose" listing what the agent may change and what it must only flag.

4. **Add a "CRM report" tab** with a blank area at the top for the daily report.

5. **Give the agent access.** In Cowork, connect only the folder that holds the workbook (or connect Google Drive), plus your email and calendar connectors. In Grok Bot, sign the Bot's computer in to its own Google account with the workbook shared to it. Don't give it access to anything financial.

6. **Paste the job.** Use the CRM Keeper prompt from Lesson 3, adjusted to your file names. Run it once manually.

7. **Check the first run.** Open three changed rows and compare them with the actual emails. Approve or reject each proposal in the report.

8. **Schedule it.** In Cowork, type `/schedule` and set it for weekdays at 5pm (your computer needs to be on and the app open). In Grok Bot, ask the Bot to save the job as a routine for weekdays at 5pm.

9. **Set your weekly habit.** Add a recurring 10-minute calendar event, "Read CRM report," on Friday afternoons.

## Done when

- [ ] A Pipeline with the six fields exists and contains every contacted lead
- [ ] A CRM rules doc defines allowed values and splits "apply" from "propose"
- [ ] The agent ran once, and you spot-checked three rows against real emails
- [ ] The job is scheduled for weekdays, and a weekly review is on your calendar
- [ ] The agent has no access to financial accounts and cannot delete rows

:::example
title: See an example result
Here is the first CRM Keeper run for the sample business, Rolling Ledger, one week into outreach.

:::video
id: sales-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-sales/sales-ex3-reveal.mp4
captions: /learn/video/ai-sales/sales-ex3-reveal.vtt
poster: /learn/video/ai-sales/sales-ex3-reveal.jpg
transcript: For Rolling Ledger, the first run made five changes and asked about three more. Here's the example. The Pipeline tab holds twelve contacted leads, with the six fields and a CRM rules doc beside it. On its first run, the CRM Keeper applied five changes. Three rows got a new last touch date. One moved from contacted to replied, after Curbside Crepes wrote back. And one moved to call booked, because a calendar invite for Thursday now exists. It proposed three changes and made none of them. One owner replied no thanks, so it proposed do not contact, and the founder approved it the same day. Two rows were the same truck under two names, so it proposed a merge, approved. And one deal had been quiet for fourteen days, so it proposed lost. The founder rejected that one and gave it a next step instead. The spot-check of three rows matched the emails.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger CRM Keeper, first run
shows: Under "Rolling Ledger pipeline" tagged example: 12 contacted leads. Applied 5 (3 last touch, 1 to Replied, 1 to Call booked). Proposed 3 (Do not contact: approved, merge: approved, Lost: rejected, highlighted). Footer: 3 rows spot-checked, all matched.
data: example numbers: 12 leads, 5 applied, 3 proposed, 2 approved, 1 rejected
image: /learn/figures/ai-sales/exercise-03-fig-2.webp
alt: Example first run for Rolling Ledger: 12 contacted leads in the pipeline. The agent applied 5 changes: 3 last touch dates, 1 move to Replied and 1 to Call booked. It proposed 3: Do not contact and a merge, both approved, and Lost, which the founder rejected. Three spot-checked rows matched the emails.
:::

| Change | Type | Evidence | Result |
|---|---|---|---|
| Last touch updated on 3 rows | Applied | Sent emails today | Done |
| Curbside Crepes: Contacted to Replied | Applied | Their reply, 2:14pm | Done |
| Smoke and Salt Tacos: Replied to Call booked | Applied | Calendar invite for Thursday | Done |
| Wok on Wheels: move to Do not contact | Proposed | Reply: "no thanks" | Approved the same day |
| "Big Cheese" and "Big Cheese Melts": merge | Proposed | Same email and truck | Approved |
| Pit Stop BBQ: move to Lost | Proposed | No activity for 14 days | Rejected: next step "send cash-sales tip", Nov 12 |

```text
CRM REPORT (top of tab, Nov 5)
Changes made: 5. Proposals: 3. Flags: 1 next step date in the past (Mango Mobile).
Suggested next steps: call Smoke and Salt prep; reply to Curbside Crepes; give Mango Mobile a new date.
Schedule: weekdays 5pm. Friday 10-minute review on the calendar.
Access: the workbook folder, email and calendar for Pipeline people only. No bank, no deletes.
```
:::

:::coached
**For 1-on-1 coaching clients.** Make the CRM drive your week.

1. Add a "Deal health" column the agent fills: Green (next step in date), Yellow (next step overdue under 7 days), Red (over 7 days or no next step).
2. Run it for one week and log every wrong update the agent made.
3. Draft one rule change that would have prevented each error.

**Bring to your session:** your Pipeline, the week's CRM reports, and your error log.

**Your coach will:**
- Walk through your Red deals and agree a next step for each
- Review the agent's access and rules for privacy and accuracy
- Help you set a pipeline target (deals at each stage) for the next month
:::
