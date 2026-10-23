---
module: 1
lesson_number: 5
course: google-gemini
template: v2
---

# Lesson 5: Gems and Agents

:::key-concept
Gems were Gemini's saved custom assistants. Google is replacing them with skills: reusable instruction sets you can stack and call with a slash. Agents go one step further and do work in the background, on a schedule, across your apps. Give each agent a narrow job, the least access it needs, and a rule that you approve anything that leaves the business.
:::

## What you'll be able to do

- Explain what's happening to Gems and move your best ones to skills
- Write a skill that makes Gemini do a repeat job your way every time
- Set up a background task in the Gemini app with clear approval rules
- Understand Google's business agent offerings: Gemini Enterprise and the new Gemini agent for work

## Why this matters

Your first win with AI is a good answer. Your second win is never retyping the instructions. Your third is having work done while you're with a customer. Skills give you the second, Tasks and agents give you the third. But an agent that can read your inbox and act in your browser is also a new kind of risk. This lesson shows you how to get the help without handing over the keys.

## From Gems to skills

On September 30, 2026, Google announced **skills**: reusable custom instructions that work in the Gemini app and, as they roll out, in most Workspace apps. Unlike Gems, skills run inline in your normal chat, and you can stack several in one prompt, such as a "brand voice" skill plus a "client email" skill. They follow the open SKILL.md format, so a skill you wrote for another AI tool can often be brought over.

How you use them:

- Type **/** in the prompt bar, then the skill name.
- Or let Gemini apply a skill automatically when your prompt matches it.
- Add reference files to a skill, such as a price list PDF or a style guide.

Key dates for Gems (from Google's Workspace Updates post):

| When | What happens |
|---|---|
| Now | Gems still work in the Gemini app. Skills are rolling out (Gemini app from October 13, 2026; Workspace apps delayed). |
| November 17, 2026 | Gems move to the Settings panel. Google says Gems support ends for personal accounts in November. |
| No sooner than March 1, 2027 | Gems stop working for Workspace business and enterprise accounts and are migrated to draft skills. |

Don't wait for the automatic migration. Rebuild your two or three most-used Gems as skills now, and test them. Skills in the Gemini app don't sync to Workspace apps, so create them in each place you need them.

## Write a good skill

A skill is a short instruction document. Write it like onboarding notes for a new assistant:

```text
Name: client-reply
Purpose: Draft replies to client emails for my bookkeeping business.
Always:
- Use plain American English, short sentences, warm but direct.
- Answer the client's question first, then one clear next step with a date.
- Sign off as "Sam" with no title.
Never:
- Quote prices that aren't in the attached price list.
- Promise a turnaround faster than 3 business days.
- Give tax advice; say "I'll check with your accountant" instead.
Output: a subject line and a reply under 150 words.
```

Then test it with three real emails. Each time it gets something wrong, add one line to the skill. You can also ask Gemini to turn a good chat into a skill.

## Tasks: Gemini works while you don't

Google's personal agent launched in May 2026 as **Gemini Spark**. In October 2026 Google folded it into the main app as **Task**: you'll see Chat and Task options by the prompt box, and a Scheduled page for recurring jobs. Tasks are high-level goals Gemini works on in the background, such as decluttering an inbox, watching prices, or compiling a researched spreadsheet.

Requirements from Google's help page (October 2026): Google AI Pro or Ultra, a personal Google account (work accounts not yet supported), age 18+, and not available in the EEA, UK, Switzerland or Nigeria. You can run up to 15 tasks at once.

A good first task for a founder:

```text
Every Monday at 7am: look through my Gmail from the last 7 days for messages from potential customers that I haven't replied to.
Make a Google Sheet with sender, date, what they asked, and a suggested reply.
Don't send anything. Don't change or archive any emails.
```

Google says Gemini asks for your review before actions like sending messages, changing your data, buying something, submitting web forms or signing in. Keep it that way. Also note Google's own warnings: tasks are experimental, web pages can contain hidden instructions that mislead the agent (prompt injection), and you should supervise important tasks.

## Google's agents for business

If you run your business on Google Workspace, two business offerings matter:

**Gemini Enterprise.** Google's business AI platform. The Business edition is aimed at small teams (up to 300 seats) and includes the Gemini app and notebooks for business, connectors to tools such as Google Workspace, Microsoft 365 and HubSpot, a no-code Workflow Builder, prebuilt Google agents and one place to see your agents. Standard and Plus editions add higher limits, bring-your-own agents and stricter security options. See the [plans page](https://gemini.google/subscriptions/) for current prices and trials.

**Gemini agent for work.** Announced October 8, 2026 at Gemini at Work. Google calls it a universal agent for work: you give it a goal, and it researches, writes documents, writes code and coordinates sub-agents over hours or days. You'll be able to @mention it in Gmail, Docs, Sheets, Slides and Chat. Managers can create persistent agent "coworkers" with their own Workspace account, email, calendar and Drive. It started in private preview, with wider availability promised "soon" for select Workspace Business and Enterprise plans, at no extra charge where Gemini Enterprise is available. Google says agents only see files explicitly shared with them, every action is logged, and admins can set spending limits.

For a one-person business, the agent coworker pattern is the one to watch: an agent with its own account is easier to scope and to switch off than an agent using yours.

## Your agent safety rules

Whatever agent you use, Google's or anyone else's:

1. **Own login.** Give an agent its own account or connection, never your main password.
2. **Least access.** Share only the folders, labels and apps the job needs.
3. **Approval rule.** Anything that sends, posts, publishes, signs or changes money waits for your click.
4. **No money movement.** Agents never pay bills, move funds or enter card details.
5. **Review the log.** Check what it did weekly, and turn off tasks you no longer need.

:::try-it
Pick the prompt you've typed most this month. Turn it into a skill with an "Always / Never / Output" structure, then call it with / on a real example.
:::

:::warning
A background agent can act when you're not watching. Never give it banking access, never put passwords or card numbers in a task thread (take over the browser and type them yourself), and start every new task with "don't send, don't delete, don't buy" until you've seen it work.
:::

:::checkpoint
Q: You want Gemini to prepare weekly follow-up emails for leads. Which setup fits the safety rules?
- [ ] A task that sends the follow-ups automatically so nothing slips
- [x] A scheduled task that drafts the emails in a sheet or as drafts, and you review and send them
- [ ] Give the agent your main Google password so it can log in to everything it needs
Why: Anything that leaves the business needs a human click. Drafting is the agent's job; sending is yours.
:::

:::takeaways
- Skills replace Gems: stackable, called with /, and in the Gemini app since October 2026. Rebuild your best Gems now.
- Tasks (formerly Gemini Spark) run background and scheduled work for AI Pro and Ultra personal accounts.
- Gemini Enterprise and the new Gemini agent bring agents with their own identities to Workspace businesses.
- Own login, least access, approval for anything outbound, and agents never move money.
:::

## Go deeper

- [Introducing skills in the Gemini app and Workspace, plus what's next for Gems](https://workspaceupdates.googleblog.com/2026/09/skills-gemini-app-workspace.html) - dates and editions for skills and the Gems transition
- [Let skills in Gemini tackle your most repetitive tasks](https://blog.google/products-and-platforms/products/gemini/automate-tasks-with-skills/) - how skills work and how to call them
- [Manage your tasks and workflows in Gemini Apps](https://support.google.com/gemini/answer/17094507) - requirements, approvals and safety notes for Tasks
- [Google Cloud unveils persistent Gemini agents](https://venturebeat.com/orchestration/google-cloud-unveils-persistent-gemini-agents-for-long-running-tasks-and-they-get-their-own-gmail-calendar-and-drive-storage) - VentureBeat on the Gemini agent for work
- [Google AI plans](https://gemini.google/subscriptions/) - Gemini Enterprise Business, Standard and Plus editions
