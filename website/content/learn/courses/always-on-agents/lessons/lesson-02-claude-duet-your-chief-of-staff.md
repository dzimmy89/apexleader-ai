---
module: 1
lesson_number: 2
course: always-on-agents
template: v2
---

# Lesson 2: Claude Duet: Your Chief of Staff

:::key-concept
Claude Duet is Anthropic's proactive agent app, announced October 21, 2026 as a research preview. It sends you a morning brief, watches your connected apps every few hours, messages you only when something needs you, and does tasks you assign on its own cloud computer. It asks before it sends, pays, signs or deletes anything, which makes it a natural chief of staff for a solo founder.
:::

## What you'll be able to do

- Check whether you can get Duet and join the waitlist correctly
- Set it up with the right connectors and nothing more
- Give it chief-of-staff jobs: the morning brief, follow-ups, scheduling and reports
- Use its approvals and limits safely

## Why this matters

Most solo founders do not lose time to big projects. They lose it to things slipping: a client email that sat for three days, a calendar clash, an invoice nobody chased. Anthropic built Duet for "professionals and small business owners with more on their plates than they can track." Its core design goal is judgment about what needs you and what can wait.

## Research preview: who can get it

Duet is a **research preview**. As of late October 2026:

- **Plans:** Claude Pro or Max. Team and Enterprise plans are not supported yet.
- **Region:** US Claude accounts only during the preview.
- **Access:** by waitlist, in waves. Joining does not guarantee a date.
- **Cost:** included with Pro and Max at no extra charge during the preview. It uses your five-hour and weekly limits at the same rate as chat, and the morning brief and background checks count too. Anthropic gives admitted users one full reset of both limits, available until November 30, 2026.
- **Model:** it runs on Claude Opus 5.5 and sets its own effort level. You cannot choose the model.

## Setup, step by step

From Anthropic's help center:

1. Go to the Claude Duet product page and select **Join the waitlist**.
2. Enter your name and email. Use the same email as your Claude account. A mismatch, including with the Apple or Google account on your phone, can block access.
3. Choose your Claude plan and phone type. Optionally describe your work and what you'd hand off first.
4. Select **Submit**. You'll get an email when it is your turn.
5. When invited, open the email on your phone and follow the setup steps for iPhone or Android.
6. Open Claude Duet and sign in with your Claude account. It may take a few minutes to become available.

**Connecting apps.** Duet uses the connectors you have already set up in Claude, and you start every connection yourself. Manage them in your Claude settings. Named connectors include Gmail, Google Calendar, Google Drive, Slack, QuickBooks, HubSpot, Docusign and Calendly. Microsoft 365 is not available yet, and some connectors, such as Slack, have limits. For sites without a connector, Duet uses its own cloud browser.

Start with two connectors: email and calendar. Add more only when a job needs them.

## Chief-of-staff jobs that work well

Anthropic's own examples line up with what a chief of staff does: finding unpaid invoices and drafting reminders, preparing payroll with hours and reimbursements filled in for you to submit, drafting a job post that goes live only after you approve, catching calendar conflicts, preparing a client-call brief, building dashboards and forecasts.

Tasks go into one ongoing thread, typed or by voice. Try prompts like these:

```text
Each morning, lead the brief with: client emails waiting more than 24 hours,
today's meetings with a one-line prep note each, and anything due this week.
Only notify me during the day if a client says "urgent", "cancel" or "refund".
```

```text
Find invoices in QuickBooks that are more than 14 days overdue.
Draft a short, friendly reminder email for each from my Gmail.
Do not send. Show me the list and the drafts for approval.
```

```text
Build me a simple dashboard of this month's new leads, booked calls
and invoices sent, using Gmail, Calendar and HubSpot. Update it every Monday.
```

You can set what you want to hear about and how often. Be specific, or it will guess.

:::try-it
Even before you are admitted, write your morning brief spec. List the five things you want to know first thing every day, in order, and the three triggers that justify interrupting you during the day. Paste it into Duet on day one.
:::

## Approvals and guardrails

Duet's controls match the safety rules in this course:

- **Asks first** before sending a message, making a payment, signing a document or deleting anything. It shows you exactly what it is about to do. If you cannot respond, it finishes the rest of the task and brings the approval back later.
- **Hard limits:** trading securities, moving money between accounts and accessing someone else's account are off-limits, even with approval.
- **Only you finish tasks.** It may suggest a task is done, but only you can mark it complete.
- **Passwords:** when a site asks for one, you type it into a separate form on your device that sends it straight to Duet's browser, keeping it out of the chat. It is designed so it never directly sees your passwords or sign-in tokens.
- **Sensitive data:** a classifier blocks credit card numbers and government IDs. Health and financial details are shared only when you explicitly tell it to.
- **Purchases:** Duet can buy things through Stripe's Link wallet with a one-time virtual card, or Shop Pay. Link and Shop Pay are connected inside Duet itself.

Our recommendation for a business: do not connect Link or Shop Pay. Keep purchases as a step you do yourself. Agents never move money, even when a product allows a narrow version of it.

## Limits to know

- It may misread a thread or misjudge urgency. Review drafts and approvals before confirming.
- Items can arrive between checks.
- You cannot watch or take over its browser yet.
- It cannot see all your projects or files on your computer. It can read your Claude work but not change it.
- It does not make phone calls or send texts.
- It is stronger at work tasks than personal errands.
- Coming soon, per Anthropic: a visual Shopify storefront editor and signing in with saved 1Password logins, with your permission.

**Off switches:** disconnect any app at any time (Duet stops accessing it, but keeps memory of what it saw). Turn off **Search and reference chats** in Settings > Memory to stop it searching your past chats. To report a problem, tell Duet in the chat and it passes the report to the team.

:::warning
Duet acts through your real accounts. An approved email goes from your Gmail, under your name. Read every draft before you approve, especially to clients, and never approve an action whose recipient or effect you cannot identify.
:::

:::checkpoint
Q: Duet drafts a payroll run with hours filled in and asks what to do next. What is the right move?
- [ ] Approve it to submit payroll, since Duet asks first
- [x] Review the figures and submit payroll yourself in your payroll app
- [ ] Connect Link so Duet can pay contractors directly
Why: Preparing is a good job for Duet. Submitting payroll moves money, so it stays with you.
:::

:::takeaways
- Duet is a research preview for US Claude Pro and Max users, by waitlist, using your normal usage limits
- Start with email and calendar connectors and a precise morning brief spec
- It asks before send, pay, sign or delete; keep payments off entirely
- Expect misreads and check-interval gaps, and review every draft
:::

## Go deeper

- [Get started with Claude Duet](https://support.claude.com/en/articles/17631495-get-started-with-claude-duet) - waitlist, setup, connectors, approvals and limits
- [Introducing Claude Duet](https://claude.com/resources/articles/claude-duet) - Anthropic's launch post with small-business examples
- [Claude Duet is Anthropic's proactive AI agent](https://9to5google.com/2026/10/21/claude-duet-anthropic-ai-agent-waitlist/) - launch-day coverage
- [Anthropic takes on OpenAI, Meta with Claude Duet](https://inc42.com/buzz/anthropic-takes-on-openai-meta-with-new-proactive-ai-agent-claude-duet/) - summary of safeguards and early limits
