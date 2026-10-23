---
module: 1
lesson_number: 5
course: always-on-agents
template: v2
---

# Lesson 5: Choosing and Supervising Your Agents

:::key-concept
Pick the always-on agent that fits the job, your main office and your region, not the one with the loudest launch. Then supervise it like staff: a daily glance at its queue, a weekly review with a simple scorecard, and slow, earned promotions. Approval gates on sends and money never go away.
:::

## What you'll be able to do

- Choose between Claude Duet, OpenAI dots and Grok Bot for a specific job
- Run a daily two-minute check and a weekly 15-minute review
- Score an agent's work and decide to promote, retrain or remove it
- Handle incidents: wrong sends, runaway routines and access cleanup

## Why this matters

Three always-on agents launched in ten weeks. You do not need all three. Most solo founders need one, maybe two, each with a clear job. And an unsupervised agent drifts: rules get stale, routines break when a website changes, and small misreads repeat. Supervision is cheap. Cleaning up after a wrong email to fifty clients is not.

## Choosing: a side-by-side

| | Claude Duet | OpenAI dots | Grok Bot |
|---|---|---|---|
| Launched | Oct 21, 2026 | Sep 29, 2026 | Aug 11, 2026 |
| Status | Research preview, waitlist | Rolling out; Enterprise beta; specialist dots in preview | Beta; Enterprise rolling out |
| Plans | Claude Pro, Max (US only) | ChatGPT Pro (not EEA, CH, UK), Business Premium | SuperGrok tiers, Cursor Premium and up |
| Best at | Chief of staff: brief, triage, follow-ups, forecasts | Ongoing projects in ChatGPT, Slack, Teams and Space pages | Repeating routines inside web apps with no connector |
| App access | 6,000+ connectors and plugins, cloud browser | 4,000+ apps via plugins, own cloud computer | Connectors and computer use on a shared cloud computer |
| Approval control | Asks before send, pay, sign, delete | Custom rules (4 behaviors) plus action review | Auto-review: Ask first, Allow automatically; Allow once |
| Can you watch it work? | Not yet | Yes, open its computer, Take over | Yes, Take over or Take control |
| Several agents? | One Duet | First dot included; more planned | Several Bots in parallel |

Three questions decide it:

1. **Where does your work live?** If your main office is Claude, start with Duet. If it is ChatGPT, a dot. If your pain is repetitive web portals, Grok Bot.
2. **Are you eligible?** Region, plan and waitlist come first. Duet is US-only in the preview; dots on Pro exclude the EEA, Switzerland and the UK.
3. **What is the job's trigger?** Inbox and calendar triggers suit Duet. Project and team-channel work suits a dot. Scheduled routines in web apps suit a Bot.

Use this prompt to decide:

```text
I'm a solo founder running [business], based in [country], with these plans:
[plans]. The job I want to delegate: [job, its trigger and the apps it touches].
Compare Claude Duet, OpenAI dots and Grok Bot for this job on: eligibility
for me, how it reaches each app (connector or computer use), approval controls,
and what could go wrong. Recommend one. Flag anything in preview or beta.
Tell me which official pages to check before I decide.
```

## Daily: the two-minute check

Every morning, open your agent's queue:

- **Duet:** read the morning brief and the approvals waiting in the thread.
- **Dots:** open **Activity** and look at In progress and anything waiting for you.
- **Grok Bot:** read each Bot's conversation for pending or **Expired** approvals.

Ask yourself three things: Is anything waiting on me? Did it do anything I did not expect? Is anything stuck?

## Weekly: the 15-minute review and scorecard

On Friday, score each agent on five lines:

```text
AGENT SCORECARD - [agent] - week of [date]
1. Useful work done (count): ___
2. Drafts I approved without edits / total drafts: ___ / ___
3. Misses (urgent items missed, misread threads): ___
4. False alarms (pinged me for nothing): ___
5. Surprises (actions I did not expect): ___
One change for next week (brief, rule, access or schedule): __________
```

Then do the housekeeping:

- Check scheduled tasks and routines. Dots' **Pause** does not cancel scheduled runs, so review the **Scheduled** list directly. Pause any Grok Bot routine whose website or process changed.
- Review connected apps. Remove any the agent did not use.
- Check usage. Background checks and routines consume plan limits; if you hit limits midweek, cut check frequency or routines before upgrading.

## Promote, retrain or remove

- **Promote** after four clean weeks: move one narrow action from "ask first" to "allowed", such as saving files or adding internal calendar holds. Never promote sends to customers, posts or anything with money.
- **Retrain** when a miss repeats: add an example to the brief, tighten a rule, or narrow the trigger.
- **Remove** when the same miss survives two retrains, or the job no longer exists.

## When something goes wrong

1. **Stop the work.** Deny the pending action. Pause the dot, the routine or the job. For dots, also stop delegated tasks in Activity and disable scheduled ones.
2. **Remember stopping is not undoing.** Sent emails stay sent. Fix the effect yourself: a short correction email, a restored file.
3. **Cut access.** Disconnect the app in the agent, then revoke it in the app's own settings. For Grok Bot, also sign out of sites on the shared computer.
4. **Write it down.** What happened, which rule should have caught it, and the change you made.
5. **Report it.** Duet takes problem reports in its chat; use each vendor's feedback channel.

:::try-it
Copy the scorecard into your notes and fill it in for any AI tool you used this week, even a chat assistant. Line 2 alone, drafts approved without edits, tells you how close it is to being trusted.
:::

:::warning
The more an agent earns your trust, the easier it is to approve without reading. That is the moment mistakes slip through. Read every external send and every action whose target you cannot name, no matter how good the agent's record is.
:::

:::checkpoint
Q: Your Grok Bot routine exported the wrong report two Mondays in a row after the invoicing site redesigned its menus. What should you do?
- [ ] Give it Always allow on everything so it can work around the change
- [x] Pause the routine, re-teach it the new steps, and watch the next run
- [ ] Let it continue; it will learn on its own
Why: Routines break when a website changes. Pause, retrain once, and watch the next run before trusting it again.
:::

:::takeaways
- Choose by where your work lives, your eligibility and the job's trigger
- Do a two-minute daily check and a 15-minute weekly scorecard per agent
- Promote slowly; sends to customers and money never leave your approval
- In an incident: stop, fix the effect, cut access, write it down
:::

## Go deeper

- [Control your dot](https://learn.chatgpt.com/docs/dots/controls) - Activity, Scheduled, pause and delete behavior
- [Grok Bot approvals, security and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - removing access and least-privilege practices
- [Get started with Claude Duet](https://support.claude.com/en/articles/17631495-get-started-with-claude-duet) - limits, disconnecting apps and reporting issues
- [Grok Bot for teams and enterprises](https://docs.x.ai/grok-bot/teams-and-enterprises) - a security baseline worth borrowing
