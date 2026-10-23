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

## Warm-up

:::checkpoint
Q: Which CRM change should your agent only propose, never apply on its own?
- [ ] Updating Last touch after an email
- [ ] Adding a dated note after a meeting
- [x] Moving someone to Do not contact after they reply "please stop"
Why: Opt-outs, Lost deals and deletions are judgment calls with legal or business weight. The agent flags them; you confirm the same day.
:::

## Steps

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
