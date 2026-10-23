---
module: 1
lesson_number: 4
course: codex
template: v2
---

# Lesson 4: Computer Use and Automations

:::key-concept
Computer use lets Codex operate other apps on your computer by seeing the screen, clicking and typing with its own cursor. Automations let it come back on a schedule, do a task and leave the result for your review. Together they cover the repetitive admin around your business, as long as you decide which apps it may touch and what still needs your click.
:::

## What you'll be able to do

- Turn on computer use and grant only the permissions it needs
- Write a computer use task scoped to one app and one flow
- Set up a recurring automation that produces something you review
- Apply an approval rule so nothing leaves the business, or touches money, without you

## Why this matters

A lot of small-business work happens in apps that have no connector: a desktop accounting app, a supplier portal, a spreadsheet you export every Monday. Computer use lets Codex work in those the way a temp would, by looking and clicking. Automations turn one good run into a weekly routine. The risk is the same as handing a temp your laptop: it can click anything you can. So the setup is all about limits.

## Computer use: where it works

- **macOS:** since the April 16, 2026 update.
- **Windows 11:** since late May 2026. You can point Codex at the whole computer or a specific app with an @-mention, for example `@Chrome`, and steer Windows tasks from the ChatGPT mobile app.
- **Linux:** native computer use wasn't available when the Linux preview launched in August 2026.
- **Regions:** at launch it wasn't available in the EEA, the UK or Switzerland. Check OpenAI's current docs for your country.

## Turn it on safely (Mac)

Per OpenAI's setup steps as summarized in independent guides:

1. Update the app, open Codex settings and find **Computer Use**.
2. Click **Install** to add the Computer Use plugin.
3. Grant two macOS permissions when asked: **Screen Recording** (so it can see) and **Accessibility** (so it can click and type). You can review them later in System Settings, Privacy & Security.
4. During tasks, Codex asks before using each app. You can allow once or choose **Always allow**. Use Always allow only for low-risk apps you use the same way every time.

Built-in limits: computer use can't automate terminal apps or Codex itself, can't approve system security or privacy prompts, and can't authenticate as an administrator. Those are good boundaries. Don't try to work around them.

For web apps you're building yourself, use the in-app browser instead. It's more contained than driving your whole desktop.

## Write a scoped computer use task

One app, one flow, a clear stopping point:

```text
@Numbers Open "Client fees Oct.numbers" in my Groomer Books folder.
For each row where "Paid" is empty, copy client name and amount into a new
sheet called "Unpaid - review". Don't change any existing cells, don't email
anyone, and don't open any other app. Stop and show me the new sheet.
```

Before you start a computer use task:

- Close apps the task doesn't need, especially email, banking and messaging.
- Treat any signed-in browser as privileged: Codex's clicks count as yours.
- Stay present for anything involving accounts, payments, passwords or privacy settings, and cancel if it clicks into the wrong window.

## Automations: the weekly routine

Automations let Codex return at a scheduled time, do the work, and present the result for review. OpenAI's guidance is to first get a task working in a normal chat, then turn it into an automation. Some automations return to the same thread and continue with its context, which suits ongoing work like a weekly status note.

Good founder automations are specific, repeatable and easy to review:

```text
Every Monday at 8:00: read the newest CSV in /exports/bank, flag
transactions over $500 or with no description, and write a one-page
summary to /reports/weekly-<date>.md with a table of flagged items.
Don't change the CSV. Don't email anyone. End with "Ready for review."
```

Other good ones: a Friday summary of what changed in your site repository, a morning brief of new files in a shared folder, or a check that your pricing page still matches your price list.

Two practical notes. Local automations need your computer awake and the app running. And if you want scheduled work that runs in the cloud with the laptop closed, ChatGPT Work's Scheduled Tasks and OpenAI's always-on agents (dots) are built for that; the Always-On Agents course covers them.

## The approval rule

Write this into your `AGENTS.md` and repeat it in every automation prompt:

```text
Prepare, don't send. You may read files and draft documents, emails and
posts. You may not send emails, publish posts, submit forms to outside
services, change prices, or make or approve any payment. Put drafts in
/drafts and tell me they're ready.
```

Codex works under your login, so it should get its own limited accounts wherever possible: a read-only export instead of your bank login, a separate spreadsheet copy instead of the live file.

:::warning
Never let computer use or an automation move money, approve payments, send messages to clients or post publicly. Don't sign Codex into your bank, payment processor or main email. Never type passwords or one-time codes into the chat; if a task hits a login, take over and sign in yourself, or stop the task. Close sensitive apps before any computer use session.
:::

:::try-it
Open Codex settings and find the Computer Use section. Don't install anything yet. Read what it asks for, then open System Settings, Privacy & Security (or Windows privacy settings) and see which apps already have screen recording or accessibility access. Remove any you don't recognize.
:::

:::checkpoint
Q: Your Monday automation finds three unpaid invoices. What should it do next?
- [ ] Email the three clients a payment reminder automatically
- [ ] Charge the cards on file through your payment app
- [x] Draft the three reminder emails into /drafts and tell you they're ready
Why: Anything that leaves the business or touches money needs a human click. The automation prepares; you review and send.
:::

:::takeaways
- Computer use works on Mac and Windows 11; grant Screen Recording and Accessibility, and approve apps one at a time.
- Scope tasks to one app and one flow, close sensitive apps, and stay present for logins and payments.
- Automations run a proven task on a schedule and leave results for review.
- Prepare, don't send: no emails, posts or payments without your click.
:::

## Go deeper

- [Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/) - computer use, automations and plugins announcement
- [Codex automations](https://openai.com/academy/codex-automations) - OpenAI Academy guide with use cases and tips
- [Codex computer use setup](https://anotherwrapper.com/blog/codex-computer-use) - independent walkthrough of permissions, limits and safety tips
- [OpenAI's Codex can control Windows 11 PCs](https://www.pcworld.com/article/3154677/openai-codex-can-finally-control-windows-11-pcs-on-its-own.html) - Windows availability and @app mentions
