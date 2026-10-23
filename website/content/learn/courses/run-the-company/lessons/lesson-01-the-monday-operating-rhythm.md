---
module: 1
lesson_number: 1
course: run-the-company
template: v2
---

# Lesson 1: The Monday Operating Rhythm

:::key-concept
A company of agents runs on rhythm, not on heroics. Every department agent reports to one place by Monday morning, you read one page, make the week's decisions in one sitting, and hand each agent its priorities with the approval rules attached. Ninety minutes on Monday buys you a calm week.
:::

## What you'll be able to do

- Set up a single "reports" place every department agent writes to
- Build a one-page company scorecard with five to seven numbers
- Run a 90-minute Monday session: read, decide, assign, check access
- Write weekly assignments each agent can act on without guessing

## Why this matters

By now you have staff: a Marketing Bot, a sales agent, an accounting setup with Cowork and an expense bot, a builder (Claude Code, Cursor or Codex), and a research helper. Each one works. Together, without a rhythm, they bury you in notifications, drafts and approval requests at random hours. Human companies solved this long ago with a weekly meeting and a scorecard. Your version is the same idea, scaled down to one founder and a handful of agents, and it's the foundation the rest of this capstone runs on.

## The shape of the week

| When | What | Who |
|---|---|---|
| Monday 8:00 AM | Every department agent posts its weekly report to the reports place | Agents |
| Monday 8:30 AM | Claude Duet morning brief summarizes the reports and flags decisions | Duet |
| Monday 9:00 to 10:30 AM | Your operating session: scorecard, decisions, assignments, access check | You |
| Tuesday to Thursday | Daily brief, approvals, short check-ins (Lesson 2) | You and Duet |
| Friday afternoon | Review, fix and scale (Lesson 3) | You |

Claude Duet launched as a research preview on 21 October 2026, for US Pro and Max subscribers through a waitlist. If you don't have access yet, the rhythm still works: a scheduled task in Claude, a Dot, or Gemini can compile the same summary from the same reports place. The rhythm matters more than the tool.

## Step 1: One reports place

Duet reads from apps you connect: email, calendar, documents and more. So the simplest design is to make every agent report somewhere Duet (or your fallback) can read. Pick one:

- **An email label**: each agent emails a report to a reports address that forwards into your inbox with a label.
- **A shared folder**: each agent writes `YYYY-MM-DD <department>.md` or a doc into a `Reports` folder in Google Drive.
- **A chat channel**: each agent posts into one `#reports` channel in Slack.

Then give each agent the same report format, so you can read five reports in ten minutes:

```text
Weekly report: [department], week ending [date]
1. Numbers: [the 1 to 3 metrics this department owns], vs last week
2. Done: what shipped or was completed (links)
3. Stuck: what is blocked and why
4. Needs your decision: numbered list, each with a recommendation
5. Access used: tools and accounts touched this week
Keep it under 300 words. Link every number to its source.
```

| Department | Agent (from earlier courses) | Owns these numbers |
|---|---|---|
| Marketing | Marketing Bot (Grok Bot) | posts published, site visits, newsletter signups |
| Sales | Sales Bot plus Duet call prep | new leads, calls booked, pipeline value |
| Accounting | Cowork and Expense Bot | cash in bank, invoices overdue, receipts unfiled |
| Builder | Claude Code, Cursor or Codex | pull requests merged, open bugs, site uptime |
| Research | Deep Research, NotebookLM or a Dot | questions answered, competitor changes spotted |

:::warning
Reports are a place where sensitive data piles up. Agents should report totals and links, not full customer records, card numbers or bank details. Keep the reports place shared only with you and the agents' scoped logins, and never paste passwords or API keys into a report or a chat.
:::

## Step 2: The scorecard

Pick five to seven numbers that tell you if the business is healthy. Each one has an owner (an agent reports it), a target, and a red line that triggers action.

```text
Build me a one-page scorecard from these weekly reports (attached). Columns:
Metric | Owner | This week | Last week | Target | Red line | Status (on track,
watch, off track). Use only numbers that appear in the reports, with links.
If a number is missing, mark it "missing" rather than estimating.
```

For Groomer Books, a first scorecard might be: newsletter signups, discovery calls booked, new customers, monthly recurring revenue, cash in bank, invoices overdue more than 14 days, and hours you spent on approvals. That last one matters. If approvals take more than four hours a week, an agent's job is too loose.

## Step 3: The 90-minute session

Run the same agenda every Monday. Put it in your calendar as a recurring event with the agenda in the description.

1. **Scorecard (15 min).** Read it top to bottom. Anything off track becomes a decision.
2. **Decisions (30 min).** Go through every "needs your decision" item from every report. For each: approve, reject, or ask for more information. Write the answer in one line.
3. **Priorities (20 min).** Pick the week's three company priorities. No more than three.
4. **Assignments (20 min).** Turn priorities and decisions into one message per agent.
5. **Access check (5 min).** Did any report list a tool outside that agent's job? If so, find out why and remove it.

## Step 4: Assignments agents can act on

A good assignment says what, by when, what done looks like, what the agent may not do, and where the approval point is.

```text
Marketing Bot, this week:
1. Queue the 9 approved posts for Mon to Fri. Done = drafts in the scheduler,
   sheet updated. Approval point: I publish.
2. Draft the newsletter by Thursday 2 PM, test email to me only.
3. Add a section to Friday's report: which 2 posts drove the most site visits.
Not this week: no new channels, no replies to comments, no ads changes.
```

Send each assignment in that agent's own channel (its Grok Bot conversation, the Dot's thread, your Claude Code session), then tell Duet the week's three priorities so its daily briefs rank items against them:

```text
This week's priorities: 1) book 5 discovery calls, 2) send the overdue invoice
reminders I approve, 3) ship the new pricing page. Rank everything you flag this
week against these. Don't send, pay, sign or delete anything without asking me.
```

:::try-it
Write your scorecard on paper right now: five numbers, who owns each, and the target. If you can't name an owner for a number, that's a gap in your org chart, not in your scorecard.
:::

:::checkpoint
Q: On Monday your accounting report lists "Marketing Bot accessed invoicing tool" under access used. What do you do?
- [ ] Nothing, since agents sometimes need to cross departments
- [x] Find out why during the access check and remove the access if it isn't part of that agent's written job
- [ ] Give the Marketing Bot full accounting access so it stops getting blocked
Why: Least access is a standing rule. An agent touching a tool outside its job is either a loose job description or a risk, and both get fixed on Monday.
:::

:::takeaways
- Every agent reports to one place, in one format, by Monday 8:00 AM
- Five to seven numbers on one scorecard, each with an owner, a target and a red line
- One 90-minute session: scorecard, decisions, three priorities, assignments, access check
- Assignments name the approval point and what the agent may not do this week
:::

## Go deeper

- [SiliconANGLE: Anthropic introduces Claude Duet](https://siliconangle.com/2026/10/22/anthropic-introduces-claude-duet-a-proactive-ai-agent-for-professionals/) - what Duet does for professionals and small business owners
- [MacRumors: Anthropic launches Claude Duet](https://www.macrumors.com/2026/10/21/anthropic-claude-duet/) - availability, approvals and how often Duet checks your apps
- [Grok Bot: Skills, routines and automations](https://docs.x.ai/grok-bot/skills-routines-and-automations) - scheduling each department Bot's weekly report as a routine
