---
module: 1
lesson_number: 1
course: always-on-agents
template: v2
---

# Lesson 1: How Always-On Agents Work

:::key-concept
An always-on agent is an AI worker with its own cloud computer, access to your apps, a memory of your work, and a schedule. It checks things, does work, and messages you when something needs a decision. Claude Duet, OpenAI dots and Grok Bot all share these parts, so if you understand the parts, you can manage any of them.
:::

## What you'll be able to do

- Name the six parts every always-on agent has
- Explain how agents reach your apps: connectors versus computer use
- Describe how approvals and handoffs work when you are not watching
- Spot the limits: check intervals, usage, and mistakes

## Why this matters

A chat assistant stops when you stop typing. An always-on agent keeps going: it notices a client email at 6 a.m., drafts the reply, and has it waiting when you wake up. That is a real employee's worth of attention for the price of a subscription. It also means work happens when you are not looking, so you need to know how the machine works before you trust it with your business.

## The six parts

| Part | What it is | Duet | Dots | Grok Bot |
|---|---|---|---|---|
| Cloud computer | A virtual machine with a browser, so work continues when your device is off | Own VM with a browser | Own cloud computer per dot, which you can open | One cloud computer per user, shared by all your Bots, each Bot with its own screen |
| App access | Connectors, plugins, or logging in through the browser | 6,000+ connectors and plugins; cloud browser where none exists | 4,000+ apps through plugins | Connectors where available, computer use otherwise |
| Memory | Context that builds over time | Uses your Claude memory, skills and past chats | Learns preferences from feedback | Context builds per Bot; shared files carry between Bots |
| Triggers | What starts work | Morning brief; checks every few hours; your requests | Your requests, scheduled tasks, proactive research | Your requests, routines on a schedule, triggers, other Bots |
| Approvals | Where it stops for you | Before send, pay, sign, delete | Custom rules plus automatic action review | Auto-review with Ask first and Allow automatically rules |
| Channel | Where you talk to it | Duet app on iOS and Android, and claude.ai | ChatGPT app, web, Slack, Teams | Desktop and mobile apps |

Notice the pattern. The names differ, but every product has a computer, access, memory, triggers, approvals and a channel.

## How agents reach your apps

There are two routes, and the difference matters for safety.

**Connectors (or plugins).** The agent talks to the app through an official integration, like Gmail or QuickBooks. You approve access on the app's own sign-in screen. The agent never sees your password. This is faster and more reliable, and you can revoke it in the app's settings.

**Computer use.** Where no connector exists, the agent opens a browser on its cloud computer and clicks through the website like a person. This works on almost any site, but sites can block automation, expire sessions or demand a CAPTCHA. When that happens, the agent hands the step back to you. Grok Bot calls this **Take over**; dots let you **Take over** and then **Return control**; Duet gives you a separate form so your password goes straight to its browser.

Rule of thumb: prefer connectors, and use computer use for the apps that have none.

## How it works when you are away

Here is a typical day for an always-on agent at a small bookkeeping business:

1. **Early morning:** the agent scans email and calendar and builds a brief. Claude Duet does this every morning by default.
2. **Through the day:** it checks connected apps on an interval. Duet checks every few hours rather than continuously, partly to save usage, so an urgent email can arrive between checks.
3. **A task arrives:** you text it "Draft reminders for invoices over 14 days late." It works on its cloud computer, then sends you the drafts.
4. **It hits a gate:** sending an email needs approval. If you are busy, Duet finishes the rest of the task and brings the approval back later. Grok Bot approvals from unattended work (a routine, a trigger or another Bot) expire after about 10 minutes and the action does not run, so you ask the Bot to try again.
5. **It reports:** you get a notification when work is done or needs a decision.

This is why the approval rule matters most. The agent will do everything up to the gate. The gate is where you protect the business.

## The limits to plan around

- **Mistakes.** Every vendor says so. Anthropic: Duet "might misread a thread or miscalibrate what's urgent." OpenAI: dots "can still make mistakes." SpaceXAI: ask a Bot to check the current source rather than trusting memory for important decisions.
- **Usage.** Background work costs usage. Duet's brief and check-ins count toward your Claude limits. Grok Bot has weekly usage. Dots had extended limits during the first month after launch.
- **Stopping is not undoing.** Pausing or deleting an agent does not reverse emails sent or records changed.
- **Preview status.** Claude Duet is a research preview. Grok Bot launched in beta on August 11, 2026. Specialist dots for companies are in a pilot preview, and the dots texting channel is a limited beta for US Pro users.

:::try-it
Write the six parts as headings on a page: computer, access, memory, triggers, approvals, channel. Under "triggers", list three moments in your week when you wish someone had noticed something before you did. Those are jobs for an always-on agent.
:::

## Writing a job for an always-on agent

A good always-on job has a trigger, an action, a gate and a report:

```text
TRIGGER: Every weekday morning, and when a new email arrives from a client.
ACTION: Check for unpaid invoices over 14 days. Draft a polite reminder
for each, using the client's first name and the invoice number.
GATE: Do not send. Put drafts in my approval queue. Never touch payments.
REPORT: In the morning brief, list: invoices overdue, drafts waiting,
anything you could not match to an invoice.
```

If you cannot name the trigger, it is not an always-on job yet. Use a chat or desktop tool instead.

:::warning
Always-on agents can read everything in the apps you connect, all day. Connect only what the job needs, and keep anything that moves money (bank, payroll, payment wallets) disconnected. Agents never move money.
:::

:::checkpoint
Q: A client emails at 9 a.m. about an urgent problem, and your agent only flags it at noon. What is the most likely reason?
- [ ] The agent is broken and should be deleted
- [x] The agent checks apps on an interval, so items can arrive between checks
- [ ] Always-on agents only work at night
Why: Duet, for example, checks every few hours rather than continuously. Plan urgent channels around that.
:::

:::takeaways
- Every always-on agent has a cloud computer, app access, memory, triggers, approvals and a channel
- Prefer connectors over computer use; agents hand logins and CAPTCHAs back to you
- Agents work up to the approval gate; the gate is where you protect the business
- Plan for check intervals, usage limits, mistakes and preview status
:::

## Go deeper

- [Introducing Claude Duet](https://claude.com/resources/articles/claude-duet) - how Duet's morning brief, checks and VM work
- [Introducing dots](https://openai.com/index/introducing-dots/) - dots' cloud computer, plugins and auto-review
- [Grok Bot overview](https://docs.x.ai/grok-bot/overview) - Bots, the shared computer, routines and handoffs
- [Grok Bot approvals, security and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - approval expiry and Take over
