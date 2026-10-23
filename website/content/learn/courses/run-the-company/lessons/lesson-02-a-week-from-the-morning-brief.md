---
module: 1
lesson_number: 2
course: run-the-company
template: v2
---

# Lesson 2: A Week From the Morning Brief

:::key-concept
Claude Duet's morning brief becomes your company's daily stand-up. Each department agent reports into the places Duet reads, Duet tells you what needs you, and you spend 20 minutes approving, deciding and delegating. The rest of the day the agents work and Duet stays quiet until something needs you.
:::

## What you'll be able to do

- Shape Duet's morning brief around your scorecard and the week's three priorities
- Triage the brief in 20 minutes with four moves: approve, decide, delegate, ignore
- Run each weekday with a theme so every department gets your attention once
- Handle the approvals Duet and your other agents ask for, safely and quickly

## Why this matters

On Monday you set the week. The risk now is drift: a sales reply waits three days, an invoice reminder never goes, a bug report sits unread. A daily brief stops drift without pulling you into the tools all day. Anthropic built Duet for exactly this: it sends a short brief each morning from your connected apps, checks them every few hours, and alerts you when something needs attention. You stay the founder. The agents stay staff.

## How Duet works, briefly

- **Launched** on 21 October 2026 as a research preview: a standalone app on the web and mobile, for US Pro and Max subscribers through a waitlist. Team and Enterprise plans weren't included at launch.
- **Setup is light.** Duet uses the memory, skills and connected apps already in your Claude account. You talk to it in one ongoing thread, by text or voice.
- **It works in the cloud** on its own computer with its own browser, so your laptop can be closed.
- **It asks first** before actions like sending a message, making a payment, signing a document or deleting a file. Anthropic says Duet doesn't see your passwords when you give it account access.
- **It counts against your plan.** Duet and its background checks use your existing Claude usage limits.
- **It's early.** Anthropic says it may misread a thread or misjudge what's urgent, and it can miss something that arrives between check-ins.

Duet isn't the boss of your Grok Bots or Dots. It can't reach inside them. It reads what they write to your email, calendar, documents and chat, which is why the reports place from Lesson 1 matters.

## Step 1: Shape the brief

Tell Duet once what a good brief looks like. It remembers in the thread.

```text
Every weekday morning, send my brief in this order:
1. Needs my approval today (drafts, sends, payments), one line each, with link
2. Decisions waiting (from agent reports or emails), with the recommendation
3. Scorecard numbers that moved past a red line since yesterday
4. Today's calendar, with prep notes for any customer call
5. Anything else, max 3 lines
Rank everything against this week's priorities. Skip newsletters and promotions.
If a department agent's daily note is missing, say so.
```

Then ask each department agent to post a short daily note (three lines: done, next, needs you) to the reports place by 8:00 AM. Keep the full weekly report for Mondays.

## Step 2: Triage with four moves

Read the brief once, top to bottom, and give every line one of four moves:

| Move | When | Example |
|---|---|---|
| **Approve** | A draft is right and is yours to send | Approve the follow-up email Duet drafted after yesterday's call |
| **Decide** | A choice only you can make | Accept or reject a customer's request for a discount |
| **Delegate** | Work an agent can do within its job | "Sales Bot: research these two leads and draft outreach for my review" |
| **Ignore** | Not important this week | A vendor webinar invite |

Before you approve a send, check the recipient, subject, body and attachments. Approving the wording isn't the same as approving the send, and approving one message doesn't approve the next. If you can't tell what an action will do, don't approve it. Aim for 20 minutes. If triage takes longer, the brief is too long or an agent is asking you things it should already know.

:::warning
Duet asks before sending, paying, signing or deleting. Keep it that way: never tell any agent "just send it from now on" for customer emails, invoices or anything involving money. Agents never move money. Payments, refunds and transfers are your click in your bank or payment tool, every time.
:::

## Step 3: Theme the days

Give each weekday a department focus, so every part of the business gets one deeper look a week without crowding the others.

| Day | Theme | What you do after triage (30 to 60 min) |
|---|---|---|
| Monday | Operate | The 90-minute session from Lesson 1 |
| Tuesday | Sell | Review the Sales Bot's pipeline and drafts; Duet preps today's calls |
| Wednesday | Build | Review your builder's pull requests and merge what's ready |
| Thursday | Market | Approve queued posts, read the newsletter test email, check ads |
| Friday | Money and review | Approve invoices and reminders, check cash, run the Lesson 3 review |

Use Duet for the cross-department glue during the day:

```text
Prep me for my 2 PM call with [customer]. Pull the last email thread, any notes
in the Sales folder and their invoice status. One page. Don't contact them.
```

```text
Build me a simple dashboard of this week's scorecard numbers from the reports
folder. Show me before you share it with anyone.
```

```text
After my 2 PM call I'll tell you what we agreed. Draft the follow-up email
and a task list for the Sales Bot. Wait for my approval before sending anything.
```

## Step 4: Close the day

Spend five minutes before you stop. Ask Duet one question:

```text
What did I approve today, what's still waiting on me, and what will the agents
do overnight? Flag anything that will need me before 10 AM tomorrow.
```

This catches the approval you forgot and the overnight routine you didn't mean to leave running. It also builds a trail you can review on Friday.

:::try-it
Open your email and calendar and pretend you're Duet: write a five-line brief for today using the format from Step 1. Notice which items you'd approve, decide, delegate or ignore. That's the muscle you're training.
:::

## When the brief is wrong

Duet will sometimes misjudge urgency or miss a thread, and your other agents will sometimes file reports with wrong numbers. Treat each miss as a coaching note, not a crisis. Tell Duet in the thread ("That vendor email wasn't urgent; anything from our customers is"). Note agent mistakes in a `Corrections` doc. You'll use both on Friday.

:::checkpoint
Q: Duet's brief says a customer asked for a refund and recommends approving it. The Accounting agent has drafted the refund in your payment tool. What do you do?
- [ ] Tell Duet to approve refunds under $200 automatically from now on
- [x] Decide, then issue the refund yourself in the payment tool if you agree
- [ ] Let the Accounting agent complete it since it already drafted it
Why: Refunds move money. Agents can recommend and prepare, but the payment itself is always your click.
:::

:::takeaways
- Duet's brief is your daily stand-up; agents feed it by writing to the apps it reads
- Triage every line with one of four moves: approve, decide, delegate, ignore
- Theme the weekdays so each department gets one deep look a week
- Close the day with one question so nothing waits overnight by accident
:::

## Go deeper

- [MacRumors: Anthropic launches Claude Duet](https://www.macrumors.com/2026/10/21/anthropic-claude-duet/) - approvals, check-ins every few hours and usage limits
- [SiliconANGLE: Anthropic introduces Claude Duet](https://siliconangle.com/2026/10/22/anthropic-introduces-claude-duet-a-proactive-ai-agent-for-professionals/) - dashboards, forecasts and known limits
- [The Rundown: Claude Duet guide](https://app.therundown.ai/guides/claude-duet-guide) - a careful first test of the morning brief and approvals
- [CellCog: Claude Duet explained](https://cellcog.ai/blog/claude-duet/) - a summary of Anthropic's announcement, platforms and limits
