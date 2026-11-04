---
module: 1
lesson_number: 4
course: one-person-company
template: v2
---

# Lesson 4: Your AI Org Chart

:::video
id: opc-l4-overview
kind: overview
status: paused
src: /learn/video/one-person-company/opc-l4-overview.mp4
captions: /learn/video/one-person-company/opc-l4-overview.vtt
poster: /learn/video/one-person-company/opc-l4-overview.jpg
transcript: A dot, a Grok Bot and Claude Duet, all reading the same inbox, and three different replies to one client. An org chart stops that. This is The One-Person Company, lesson four: your AI org chart. In this lesson: the five boxes every solo business needs, the role card, and the weekly review. You sit at the top, and you approve anything external or about money. Under you: chief of staff, sales and customers, marketing and content, finance assistant, and product and website. You don't fill all five on day one. Fill the box that costs you the most hours first. Each filled box gets one tool and one owner, written on a six-line role card. Then, every Friday, take fifteen minutes: read the logs, count misses, change one thing, and prune. Trust is earned. After four clean weeks, an agent can take on a narrow action, but sends and money stay with you. First, the shape of a one-person company.
:::

:::key-concept
An AI org chart is a one-page map of your team: each role, the tool that fills it, its access, its approval rule, and who reviews it. You sit at the top. It turns a pile of subscriptions into a team you can manage, and it shows you gaps and overlaps at a glance.
:::

## What you'll be able to do

- Draw an org chart with you as founder and AI agents as roles
- Write a one-line job, access list and approval rule for each role
- Decide which roles need an always-on agent and which a desktop or chat tool
- Set a weekly review rhythm for your AI team

## Why this matters

Without a map, agents multiply. You end up with a dot, a Grok Bot and Claude Duet all reading the same inbox and drafting three different replies. An org chart forces one owner per job, which is how real teams avoid chaos. It also becomes the document you update when tools change, and in 2026 they change every month.

## The shape of a one-person company

Most solo businesses need the same five functions. Start with these as boxes.

```text
                        FOUNDER (you)
         approves anything external or about money
                              |
  -----------------------------------------------------------
  |              |               |              |           |
Chief of      Sales &        Marketing     Finance       Product &
Staff         Customers      & Content     Assistant     Website
(inbox,       (leads,        (posts,       (receipts,    (site, app,
calendar,     follow-ups,    newsletter    invoice       fixes)
brief)        proposals)     drafts)       drafts)
```

:::infographic
id: fig-1
type: diagram
title: Your AI org chart
shows: A paper card at the top with a crown icon: Founder, approves external and money. Under it, a 3 by 2 grid: Chief of Staff (inbox, calendar), Sales (leads, follow-ups), Marketing (posts, newsletter), Finance (receipts, invoices), Product (site, app, fixes), and a highlighted card: Fill first, the box costing most hours.
data: none
image: /learn/figures/one-person-company/lesson-04-fig-1.webp
alt: The founder sits on top and approves anything external or about money. Under the founder are five roles: chief of staff for inbox and calendar, sales for leads and follow-ups, marketing for posts and newsletter, finance for receipts and invoices, and product for the site and app. Fill the box costing the most hours first.
:::

You do not need all five on day one. Fill the box that costs you the most hours first.

## Match each role to the right kind of tool

Use the three kinds from Lesson 1.

| Role | Good fit | Why |
|---|---|---|
| Chief of staff | Always-on: Claude Duet or a dot | Needs to watch email and calendar and message you first; Duet sends a morning brief and checks apps every few hours |
| Sales and customers | Always-on agent with drafts, or a Grok Bot that works in your CRM | Follow-ups happen on a schedule; sending stays behind approval |
| Marketing and content | Chat or desktop agent, plus a Bot routine for scheduling drafts | Creative work benefits from you in the loop |
| Finance assistant | Desktop agent (Claude Cowork on a receipts folder) or a read-only always-on agent | Organizing and drafting is safe; paying is yours |
| Product and website | Cursor or Codex, code stored on GitHub | Coding agents work best with a repo and review |

A few practical notes from the products:

- **One agent, one owner.** If Claude Duet is your chief of staff, do not also give a dot your inbox. Overlap wastes usage limits and creates conflicting drafts.
- **Grok Bots are a department.** You can run several Bots at once, each with a name and a job, and they can hand work to each other. They also share one cloud computer and its logins, so give the department only the logins all its Bots may use.
- **Dots can live where your team talks.** You can message a dot in ChatGPT, Slack or Microsoft Teams, and context carries across. ChatGPT Space gives you and your dot shared pages to work on.

:::video
id: opc-l4-five-boxes
kind: inline
status: paused
src: /learn/video/one-person-company/opc-l4-five-boxes.mp4
captions: /learn/video/one-person-company/opc-l4-five-boxes.vtt
poster: /learn/video/one-person-company/opc-l4-five-boxes.jpg
transcript: Five boxes, one founder, and one tool in each box. Here's how to match each role to the right kind of help. Your chief of staff watches email and calendar and messages you first, so it's an always-on agent, like Claude Duet or a dot. Sales and customers runs on a schedule: an always-on agent with drafts, or a Grok Bot working in your CRM, with sending behind approval. Marketing and content benefits from you in the loop, so use a chat or desktop agent. The finance assistant organizes and drafts, like Claude Cowork on a receipts folder. Paying stays yours. Product and website goes to Cursor or Codex, with the code on GitHub. The rule across all five: one agent, one owner. Two agents on one inbox means conflicting drafts and wasted usage. Next: the role card.
:::

## Write the role card

Each box on the chart gets a role card. Keep it to six lines:

```text
ROLE: Chief of Staff
TOOL: Claude Duet (research preview, Claude Pro)
JOB: Daily morning brief; flag client emails waiting over 24 hours;
     draft replies and calendar holds.
ACCESS: Gmail and Google Calendar via Claude connectors. No payments.
APPROVAL: Asks before sending, scheduling with outsiders, or deleting.
REVIEW: I check its drafts daily, and do a 15-minute review Fridays.
```

Then ask an AI to check your chart for problems:

```text
Here is my AI org chart with role cards: [paste].
Check it like an operations manager:
1. Which jobs have two owners? Which have none?
2. Which roles have more access than their job needs?
3. Which approval rules are missing a "send", "publish", "delete" or "money" case?
4. What would break if one tool went down for a week?
Give me a short fix list.
```

:::try-it
On paper or in a doc, draw your box as founder, then the five function boxes. Shade the one box that cost you the most hours last week. That is your first hire.
:::

## The weekly review

Managers review staff. Fifteen minutes on Friday is enough for a solo founder:

1. **Look at the log.** Duet sends updates in one thread; dots show work in **Activity** (In progress, Scheduled, Completed); Grok Bots show proposals and approvals in the conversation.
2. **Count misses.** Wrong drafts, missed urgent items, false alarms. Vendors admit their agents may misread threads or misjudge urgency.
3. **Adjust one thing.** Tighten a rule, add an example to the brief, or remove an app it does not need.
4. **Prune.** Pause routines that no longer match how you work. Cancel a plan nobody used.

:::infographic
id: fig-2
type: flow
title: The Friday review
shows: Under "Friday review" tagged 15 min: four numbered cards in a 2 by 2 grid: 1 Read the log, each agent's activity; 2 Count misses, wrong drafts, false alarms; 3 Change one thing, brief, rule or access; 4 Prune, stale routines, unused plans. A paper card: 4 clean weeks earn a narrow action.
data: none
image: /learn/figures/one-person-company/lesson-04-fig-2.webp
alt: The 15-minute Friday review: read each agent's log, count misses such as wrong drafts and false alarms, change one thing in the brief, rule or access, and prune stale routines and unused plans. Four clean weeks earn an agent a narrow action.
:::

## Promote or fire

Treat trust as earned. After four clean weeks, an agent can move from "drafts only" to a narrow action, such as filing receipts or adding internal calendar holds. If an agent keeps making the same mistake, change the brief once. If it still fails, remove the role or move it to a different tool. Customer-facing sends and anything with money stay behind your click no matter how good it gets.

:::video
id: opc-l4-weekly-review
kind: inline
status: paused
src: /learn/video/one-person-company/opc-l4-weekly-review.mp4
captions: /learn/video/one-person-company/opc-l4-weekly-review.vtt
poster: /learn/video/one-person-company/opc-l4-weekly-review.jpg
transcript: Managers review their staff. For a solo founder, fifteen minutes on Friday is enough. Here's the routine. First, read the log. Duet keeps its updates in one thread. Dots show their work in Activity. Grok Bots show proposals and approvals in the conversation. Second, count misses: wrong drafts, missed urgent items and false alarms. Third, change one thing: tighten a rule, add an example to the brief, or remove an app it doesn't need. Fourth, prune: pause stale routines, and cancel any plan nobody used. Then decide on trust. After four clean weeks, an agent can move from drafts to a narrow action, like filing receipts. If it repeats a mistake, change the brief once. If it still fails, remove the role. Customer sends and money stay behind your click. In the exercise, you'll draw your own chart.
:::

:::warning
An org chart can hide a single point of failure: your own account. If every agent connects through your one Google login, losing that account stops the whole company. Turn on two-factor authentication for your main accounts and keep your recovery codes offline.
:::

:::checkpoint
Q: You have Claude Duet as chief of staff and you just got a dot with ChatGPT Pro. Both could read your inbox. What does a good org chart do?
- [ ] Connect both to the inbox so you get two opinions on every email
- [x] Keep the inbox with one agent and give the dot a different job, such as weekly research or website pages in ChatGPT Space
- [ ] Cancel your approval rules because two agents will check each other
Why: One owner per job avoids duplicate drafts and wasted usage. Approval rules stay no matter how many agents you have.
:::

:::takeaways
- Draw five function boxes under you and fill the costliest one first
- Each role gets a six-line card: role, tool, job, access, approval, review
- One owner per job; Grok Bots share a computer, so plan their logins as a department
- Review weekly, promote slowly, and keep sends and money with you
:::

## Go deeper

- [Introducing Claude Duet](https://claude.com/resources/articles/claude-duet) - examples of chief-of-staff work for small business owners
- [Introducing dots](https://openai.com/index/introducing-dots/) - examples of dots by role, and specialist dots
- [Grok Bot overview](https://docs.x.ai/grok-bot/overview) - multiple Bots, handoffs and the shared computer
- [Work with agents in Space](https://learn.chatgpt.com/docs/space/agents) - how dots work on shared pages
