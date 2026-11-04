---
module: 1
lesson_number: 3
course: ai-marketing
template: v2
---

# Lesson 3: A Marketing Bot That Posts and Reports

:::video
id: mkt-l3-overview
kind: overview
status: paused
src: /learn/video/ai-marketing/mkt-l3-overview.mp4
captions: /learn/video/ai-marketing/mkt-l3-overview.vtt
poster: /learn/video/ai-marketing/mkt-l3-overview.jpg
transcript: Writing posts is the easy part. The shuttling between tools is what eats a founder's week. Hand that to a bot. This is AI Marketing, lesson three: a Marketing Bot that posts and reports. In this lesson: its own logins, a written job, approval rules, a weekly brief, and supervision. A Grok Bot is a persistent agent with its own cloud computer. Give it smaller logins: a scheduler seat that can only queue drafts, one calendar sheet, and read-only analytics. Write its job: every weekday, queue approved rows as drafts. Every Monday, send a results brief. Then write what it may not do. Add Ask first rules for anything that leaves the business. And remember: all your Bots share one computer, so keep money tools off this account. The Bot prepares. You click publish. First, the logins.
:::

:::key-concept
A Grok Bot is a persistent agent with its own cloud computer that can log into your tools, work on a schedule and report back. Set one up as your Marketing Bot: it drafts from your approved calendar, queues posts for your click, and sends you a weekly results brief. It never publishes on its own.
:::

## What you'll be able to do

- Create a Marketing Bot in Grok Bot with a clear job description and standing limits
- Connect it to a scheduling tool and your calendar sheet with scoped, least-access logins
- Set Auto-review rules so posting and sending always stop for your approval
- Turn the weekly workflow into a skill and a routine, then test it safely

## Why this matters

Writing posts is the easy part. The work that eats a founder's week is the shuttling: copy the approved row, resize the image, paste into the scheduler, check the link, then come back a week later to see what happened. That is exactly what an always-on agent is good at. Grok Bot, from SpaceXAI, entered beta on 11 August 2026. Its Bots sign into apps and websites the way a person would, keep context between tasks, and keep working in the cloud after you close your laptop. Your job is to give it a narrow job and firm limits.

## What Grok Bot is, in plain terms

- **Bots** are named agents with a job and a short description. You can run several, each with a role, and they can message each other and hand off work.
- **The cloud computer** is where Bots work. All Bots on your account share one computer, including files, browser sessions and logins. SpaceXAI's docs are blunt: separate Bots are not a security boundary.
- **Skills** are reusable instructions for a task. **Routines** assign a workflow to one Bot and run it on a schedule or, where supported, after an event.
- **Approvals and Auto-review** decide which actions stop for you. You choose Allow once, Always allow or Deny on each request.
- **Takeover** hands you the screen for passwords, two-factor codes, CAPTCHAs and payment confirmations. The Bot never sees your password typed there.

Access runs through a Cursor account. Cursor's pricing page (after its October 12, 2026 plan change) lists Grok Bot on Premium and higher plans, and you can also link a SuperGrok subscription. Access has changed several times since launch, so check the [Grok Bot FAQ](https://docs.x.ai/grok-bot/faq) for what applies to you today. Usage is weekly, with optional on-demand billing.

:::warning
Because every Bot on your account shares one computer and its logins, anything your Marketing Bot can open, your other Bots can open too. Keep money tools (bank, payment processor, payroll) off this account entirely. Agents never move money.
:::

## Step 1: Give it its own, smaller logins

Before you create the Bot, set up the accounts it will use:

1. **A scheduling tool** (Buffer, Hootsuite, ContentStudio or similar) with a team member seat for the Bot set to a role that can create drafts or queue posts for approval, not publish directly. Many schedulers have an approval workflow; turn it on. If yours connects through a connector or API key, prefer that over the Bot clicking through the website. SpaceXAI's docs note connectors are more reliable than driving a site.
2. **The content calendar sheet** shared with a separate marketing email address with comment or edit access to that one file.
3. **Read-only analytics**: a viewer role on your social accounts' analytics, Google Analytics or your site's dashboard.

Do not give it your main email, your password manager or admin rights on your social accounts. Enter any password through Takeover or the secure request form, never in the chat.

:::infographic
id: fig-1
type: diagram
title: The Marketing Bot's smaller logins
shows: The Marketing Bot in the centre with three allowed connections: scheduler (drafts only), calendar sheet (one file), analytics (read only). Below, a crossed-out row: main email, password manager, social admin, bank.
data: none
image: /learn/figures/ai-marketing/lesson-03-fig-1.webp
alt: The Marketing Bot gets three small logins: a scheduler seat that can only create drafts, access to one calendar sheet, and read-only analytics. It never gets your main email, your password manager, admin rights on your social accounts or any money tool.
:::

## Step 2: Write the job description

Create a Bot named `Marketing Bot`. The description is where its standing rules live, so be specific.

```text
Role: Marketing Bot for [business]. You report to me, the founder.

Your job:
1. Every weekday at 8:00 AM [time zone], read the Content Calendar sheet.
   Find rows dated in the next 3 days with Status = approved.
2. For each, prepare the post in [scheduler] as a draft for approval, using the
   exact approved copy. Fix only formatting for the channel. Add the link from the
   row. Set Status = queued in the sheet.
3. Every Monday at 9:00 AM, write a weekly results brief (format below) and post it
   in this conversation.

You may not:
- publish, send, reply to, or delete anything on any channel
- change approved copy beyond formatting
- create or change ads, budgets, billing or account settings
- open any tool not listed above

If a row is missing a link or image, leave it, set Status = needs info, and tell me.
```

:::video
id: mkt-l3-job
kind: inline
status: paused
src: /learn/video/ai-marketing/mkt-l3-job.mp4
captions: /learn/video/ai-marketing/mkt-l3-job.vtt
poster: /learn/video/ai-marketing/mkt-l3-job.jpg
transcript: A Bot's description is where its standing rules live. Write it like a job description, in three parts. First, the role: Marketing Bot for your business, reporting to you. Second, the job. Every weekday at eight, read the content calendar, and find rows dated in the next three days with status approved. Prepare each one in your scheduler as a draft for approval, using the exact approved copy, fixing only formatting. Then set the row to queued. Every Monday at nine, write the weekly brief. Third, the may-not list. No publishing, sending, replying or deleting on any channel. No changes to approved copy beyond formatting. No ads, budgets, billing or settings. And no tools beyond the ones listed. If a row is missing a link or an image, the Bot marks it needs info and tells you. If you can't write the may-not list in two minutes, the job is too broad. Next: approvals.
:::

## Step 3: Set Auto-review rules

Auto-review evaluates actions before they run. Add narrow **Ask first** rules for anything that leaves the business: publishing, sending messages, posting replies, deleting, purchasing and changing account settings. SpaceXAI's docs say Ask first wins when both kinds of rule match, and that Auto-review is model-based, so treat it as a second lock, not the only one. Your first lock is the scheduler role: if the Bot's seat can't publish, it can't publish.

One detail matters for routines: approval requests raised during unattended work expire after about ten minutes, and the action does not run. That is fine for this design. The Bot doesn't ask to publish; it queues drafts and you approve them in the scheduler when you're ready.

:::video
id: mkt-l3-approvals
kind: inline
status: paused
src: /learn/video/ai-marketing/mkt-l3-approvals.mp4
captions: /learn/video/ai-marketing/mkt-l3-approvals.vtt
poster: /learn/video/ai-marketing/mkt-l3-approvals.jpg
transcript: Auto-review decides which actions stop and wait for you. Add narrow Ask first rules for everything that leaves the business: publishing, sending messages, posting replies, deleting, purchasing, and changing account settings. When both kinds of rule match, Ask first wins. Now one detail that shapes the whole design. When a routine runs while you're asleep, its approval requests expire after about ten minutes, and the action doesn't run. So never design a job that needs your yes at eight in the morning. Design it so the Bot never asks to publish at all. It queues drafts in the scheduler, and you approve them there, whenever you're ready. Then the weekly brief: what was published, the best and worst post, calendar health, AI visibility, and three recommendations marked needs your decision. Every number links to its source. In the exercise, you'll hire your Bot.
:::

## Step 4: Teach it the weekly brief

The weekly brief is your marketing department's report. Ask for the same shape every week:

```text
Weekly marketing brief, week of [date]
1. Published last week: post, channel, reach, clicks, comments (table)
2. Best and worst performer, and one sentence on why
3. Calendar health: approved rows for the next 14 days, rows needing info
4. AI visibility: any change in this month's ask-the-assistants log (Get Found
   Lesson 8 adds a full SEO section to this brief)
5. Three recommendations for next week, each marked "needs your decision"
Sources: link every number to where you read it.
```

:::infographic
id: fig-2
type: flow
title: From approved row to posted
shows: A five-step flow: approved row in the sheet, the Bot queues a draft, Ask first rules stop anything public, your click in the scheduler (highlighted), posted. Below: Monday brief with linked numbers.
data: none
image: /learn/figures/ai-marketing/lesson-03-fig-2.webp
alt: An approved row becomes a draft the Bot queues in the scheduler. Ask first rules stop anything public. The post goes out only after your click in the scheduler, and every Monday the Bot sends a brief with a source link for each number.
:::

Run the job once by hand in conversation. When the output is right, ask the Bot to save it as a skill, including the sources, output format and approval rules. Then ask it to create a routine on the schedule above. Open **View conversation details**, then **Routines**, and use **Test run** with safe inputs. Test runs do real work, which is why the scheduler role and Ask first rules must already be in place.

:::try-it
Write your Marketing Bot's "You may not" list now, even before you have Grok Bot access. If you can't list it in two minutes, the job is too broad. Cut it down to one channel and one sheet.
:::

## Step 5: Supervise it

For the first two weeks, read every queued draft before approving, and compare the weekly brief's numbers against the source dashboards. Review connectors and routines monthly. If you go quiet for a long stretch, Grok Bot may pause routines and ask whether to keep them running; check them when you return. When a project ends, pause routines, sign out of sites and remove access.

If you use OpenAI Dots or Claude Duet instead, the pattern is identical: scoped logins, a written job, approval on anything public, a fixed report. Lesson 4 uses a Dot for a different marketing job.

:::checkpoint
Q: Your Marketing Bot's weekly routine runs at 8:00 AM while you're asleep and asks to publish a post. You don't respond. What happens?
- [ ] It publishes after ten minutes because you didn't object
- [x] The request expires and the action doesn't run, which is why the Bot should queue drafts for you instead
- [ ] It asks another Bot to approve it
Why: Grok Bot approvals raised by unattended routines expire after about ten minutes without running. Design the job so publishing happens on your click in the scheduler.
:::

:::takeaways
- One Bot, one job, written limits: draft and queue, never publish
- Your strongest gate is the login itself: a scheduler seat that can't publish
- Auto-review Ask first rules are the second lock; approvals from routines expire unanswered
- Save a working job as a skill, schedule it as a routine, and test with safe inputs
:::

## Go deeper

- [Grok Bot: Manage and protect](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - approvals, Auto-review, Takeover and the shared-computer boundary
- [Grok Bot: Skills, routines and automations](https://docs.x.ai/grok-bot/skills-routines-and-automations) - saving skills, scheduling routines and Test run
- [Grok Bot FAQ](https://docs.x.ai/grok-bot/faq) - current plans, platforms and usage
- [DataCamp: Grok Bot explained](https://www.datacamp.com/blog/grok-bot) - launch details and an independent look at limits
- [ContentStudio: We gave Grok Bot five social media jobs](https://contentstudio.io/blog/can-grok-run-social-media) - a real marketing test with approval before scheduling
