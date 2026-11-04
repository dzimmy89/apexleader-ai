---
module: 1
lesson_number: 3
course: ai-sales
template: v2
---

# Lesson 3: Keep the CRM Clean Without Touching It

:::video
id: sales-l3-overview
kind: overview
status: paused
src: /learn/video/ai-sales/sales-l3-overview.mp4
captions: /learn/video/ai-sales/sales-l3-overview.vtt
poster: /learn/video/ai-sales/sales-l3-overview.jpg
transcript: A CRM is just a list of people and deals, each with a status and a next step. It goes stale because updating it is boring. So give that job to an agent. This is AI Sales, lesson three: keep the CRM clean without touching it. In this lesson: pick a CRM you'll keep, define six fields, hire a CRM keeper, split apply from propose, and read the report. Start with a Pipeline tab in a Google Sheet, or HubSpot's free CRM. Write six fields with allowed values and rules: stage, last touch, next step, next step date, value and notes. Then an agent runs every weekday at five. It reads today's email and calendar, but only for people in your pipeline. It updates the low-risk fields, proposes the judgment calls, and writes a short report. You read the report, not the CRM. First, the CRM.
:::

:::key-concept
A CRM is just a list of people and deals with a status and a next step. The reason founders' CRMs go stale is that updating them is boring. Give that job to an agent on a schedule: it reads your email, calendar and outreach queue, proposes updates, and applies the safe ones. You read a short weekly report instead of typing into fields.
:::

## What you'll be able to do

- Pick a CRM that fits a one-person business (HubSpot's free CRM, a Google Sheet, or similar)
- Define the six fields that actually matter and the rules for each
- Set up a scheduled agent that keeps those fields current from your inbox and calendar
- Decide which changes the agent applies and which it only proposes

## Why this matters

You will forget who you emailed last Tuesday. Everyone does. A CRM that's current tells you, every morning, who is waiting on you and which deal is about to go cold. A CRM that's three weeks stale is worse than none, because you stop trusting it. The fix isn't discipline. It's taking yourself out of the data entry entirely.

## Step 1: Pick a CRM you'll actually keep

| Option | Good when | Watch out for |
|---|---|---|
| Google Sheet | Under 100 active leads, you want total control, your Sales Bot already writes to Sheets | No built-in email logging; you rely on the agent |
| HubSpot (free CRM) | You expect to grow, want a real pipeline view, and want official connectors | Free-plan limits and upgrade prompts; check current features |
| Your accounting app's sales tools | You use QuickBooks and want leads, estimates and invoices in one place (QuickBooks' Customer AI ranks leads and drafts estimates on Plus and up) | Tied to that plan tier |

HubSpot offers official connectors for Claude and for ChatGPT. As of October 2026, HubSpot's marketplace listing says the Claude connector works on all HubSpot tiers, including free, and needs a paid Claude plan. It reads contacts, companies and deals, and its write access (creating and updating records, logging notes and tasks) is in beta. Connector features change, so check the listing before you rely on it.

If you're unsure, start with the Google Sheet. Your Sales Bot from Lesson 2 already writes to Sheets, and you can move to a real CRM in an afternoon later. Add a tab called "Pipeline" to your lead list workbook.

## Step 2: Define six fields and their rules

Agents keep a CRM clean only if "clean" is written down. Use these six fields:

| Field | Allowed values | Rule |
|---|---|---|
| Stage | New, Contacted, Replied, Call booked, Proposal sent, Won, Lost, Do not contact | Moves forward only on evidence (an email, a calendar event) |
| Last touch | Date | Date of the last email or call either way |
| Next step | Short text | Always filled unless Won, Lost or Do not contact |
| Next step date | Date | Never in the past for open deals |
| Value | Number | Your best estimate of first-year revenue |
| Notes | Short text | One line, newest first, with date |

When you add outbound tools in Module 2, you'll add a seventh field, Source, that records which tool or channel each lead came from.

Paste this table into a "CRM rules" document. It becomes the agent's instructions.

:::infographic
id: fig-1
type: comparison
title: Six fields that matter
shows: Six field cards: Stage (moves forward on evidence), Last touch (date), Next step (always filled for open deals), Next step date (never in the past), Value (first-year estimate), Notes (one dated line).
data: none
image: /learn/figures/ai-sales/lesson-03-fig-1.webp
alt: Six CRM fields: stage, which moves forward only on evidence; last touch date; next step, always filled for open deals; next step date, never in the past; value, a first-year estimate; and notes, one dated line, newest first.
:::

## Step 3: Hire the CRM keeper

You have three good options for the agent. Pick the one you already use.

- **Claude Cowork** (Claude desktop app, paid plans). It works on files and connected tools and can run scheduled tasks. Type `/schedule` or use the Scheduled sidebar item. Scheduled tasks run while your computer is awake and the app is open.
- **Grok Bot**. Add the job as a saved routine on your Sales Bot, or create a separate "CRM Keeper" Bot.
- **Claude Duet**. Duet checks connected apps every few hours and messages you when something needs attention (Lesson 4).

Here's the job description. It works in any of them:

```text
You are my CRM Keeper. Every weekday at 5pm:

1. Read the "CRM rules" doc. Follow it exactly.
2. Check my sent and received email and my calendar for today, but only for people who are in the Pipeline tab.
3. For each person with activity today:
   - Update Last touch.
   - Move Stage forward only if the evidence matches the rules (for example a reply moves Contacted to Replied).
   - Add a one-line dated note.
4. Flag, but do not change:
   - Any open deal with Next step date in the past
   - Any open deal with no activity for 14 days
   - Anyone who said "no thanks", "unsubscribe" or similar. Propose moving them to Do not contact.
   - Any duplicate rows
5. Never delete a row. Never email anyone. Never change Value.
6. Write a short report at the top of the "CRM report" tab: changes made, flags, and three suggested next steps for tomorrow.
```

:::video
id: sales-l3-keeper
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l3-keeper.mp4
captions: /learn/video/ai-sales/sales-l3-keeper.vtt
poster: /learn/video/ai-sales/sales-l3-keeper.jpg
transcript: Here's the CRM Keeper's job, in any agent you already use: Claude Cowork, a Grok Bot routine, or Claude Duet. Every weekday at five, it reads your CRM rules doc and follows it exactly. It checks today's sent and received email and your calendar, but only for people already in the Pipeline tab. That one rule keeps it out of everything else in your inbox. For each person with activity, it updates last touch, moves the stage forward only when the evidence matches the rules, like a reply moving contacted to replied, and adds a one-line dated note. Then it flags, without changing: any open deal with a next step date in the past, any deal quiet for fourteen days, anyone who said no thanks or unsubscribe, and duplicate rows. It never deletes a row, never emails anyone, and never changes value. And it writes a short report at the top of a CRM report tab. Next: what it applies, and what it only proposes.
:::

## Step 4: Split "apply" from "propose"

The trick to trusting an agent with your CRM is deciding in advance which changes are safe.

**The agent applies:** Last touch, notes, and forward stage moves backed by an email or calendar event. These are low risk and easy to check.

**The agent proposes, you approve:** Moving anyone to Lost or Do not contact, merging duplicates, changing Value, and anything that deletes data. Cowork asks for permission before deleting files. In Grok Bot, add an **Ask first** rule for deleting or overwriting data.

The opt-out case is the important one. When someone replies "please stop emailing me," CAN-SPAM requires you to honor it within 10 business days. Your agent spots it and flags it the same day. You confirm, and your Sales Bot checks the Do not contact list before every draft.

:::warning
Your inbox holds more than sales email: customer details, bank notices, personal messages. Give the CRM agent the narrowest access that works. The rule "only for people already in the Pipeline tab" keeps it from reading unrelated mail into your CRM. If you use a connector, review which scopes it requests before you click Allow.
:::

:::infographic
id: fig-2
type: comparison
title: Apply or propose
shows: Two columns. The agent applies: last touch, notes, forward stage moves with evidence. It proposes, you approve (highlighted): Lost or Do not contact, merging duplicates, changing value, anything that deletes. Footer: opt-outs flagged the same day.
data: none
image: /learn/figures/ai-sales/lesson-03-fig-2.webp
alt: The agent applies low-risk changes: last touch, notes and forward stage moves backed by an email or calendar event. It only proposes judgment calls for you to approve: moving to Lost or Do not contact, merging duplicates, changing value and anything that deletes. Opt-outs are flagged the same day.
:::

:::video
id: sales-l3-apply
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l3-apply.mp4
captions: /learn/video/ai-sales/sales-l3-apply.vtt
poster: /learn/video/ai-sales/sales-l3-apply.jpg
transcript: The trick to trusting an agent with your CRM is deciding in advance which changes are safe. The agent applies the low-risk ones: last touch, notes, and forward stage moves backed by an email or a calendar event. They're easy to check. The agent only proposes the judgment calls: moving anyone to lost or do not contact, merging duplicates, changing a deal's value, and anything that deletes data. You approve those. The opt-out case matters most. When someone writes please stop emailing me, the law gives you ten business days to honor it. Your agent spots it the same day and flags it. You confirm, and every tool stops. Then your weekly habit takes ten minutes. Read the report, approve or reject each proposal, give every overdue deal a next step or move it to lost, and spot-check three changed rows against the real emails. If it's wrong twice in a month, tighten the rules. In the exercise, you'll set it up.
:::

## Step 5: Read the report, not the CRM

Your new weekly habit takes ten minutes:

1. Read the CRM report tab. Approve or reject each proposal.
2. Look at the flags. Anything overdue gets a next step today or moves to Lost.
3. Spot-check three changed rows against the actual emails.

If the spot-check finds an error twice in a month, tighten the rules or reduce what the agent applies on its own. Then let it keep going.

:::try-it
Open your email and find the last three people you talked to about buying something from you. Can you say each one's stage and next step without looking anything else up? If not, that's the gap this agent fills.
:::

:::checkpoint
Q: Your CRM agent reads a reply that says "Not right now, maybe next spring." What should it do under the rules above?
- [ ] Move the deal to Lost and delete the next step
- [x] Add a dated note and propose a next step date in spring, leaving the stage for you to confirm
- [ ] Email the prospect to ask which month in spring works
Why: The agent applies notes and dates but only proposes judgment calls like Lost. It never emails anyone.
:::

:::takeaways
- A CRM is six fields with written rules; the rules are the agent's instructions
- Start with a Google Sheet unless you need HubSpot's pipeline and connectors
- Let the agent apply low-risk updates and only propose deletes, Lost and opt-outs
- Your habit is a ten-minute weekly report, not data entry
:::

## Go deeper

- [Get started with Claude Cowork](https://support.claude.com/articles/13345190) - folders, scheduled tasks and safety notes
- [Claude Cowork overview](https://claude.com/cowork) - plans, connectors and approvals
- [HubSpot connector for Claude](https://ecosystem.hubspot.com/marketplace/listing/hubspot-connector-for-claude) - marketplace listing for the official connector
- [QuickBooks feature updates 2026](https://quickbooks.intuit.com/r/product-update/latest-quickbooks-feature-updates-since-summer-2025/) - Customer AI for leads and estimates
