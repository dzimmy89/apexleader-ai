---
module: 1
lesson_number: 4
course: always-on-agents
template: v2
---

# Lesson 4: Grok Bots: Department Staff

:::key-concept
Grok Bot from SpaceXAI gives you persistent agents, each with a name, a job and growing context, working on a cloud computer with a browser, files and a terminal. You can run several Bots in parallel, have them hand work to each other, and teach each one a routine that repeats on a schedule. Think of them as a small department, with one catch: all your Bots share one computer and its logins.
:::

## What you'll be able to do

- Know which plans include Grok Bot and what is still beta
- Create a Bot, give it a job, and teach it a routine
- Set Auto-review rules and handle approvals and logins safely
- Organize several Bots as a department without over-sharing access

## Why this matters

Many small-business tools have no good connector: a niche booking system, a supplier portal, an old invoicing site. Grok Bots work in those through computer use, logging in and clicking like a person, then repeat the routine every week. For a solo founder, that covers the dull, repetitive web work that other agents cannot reach.

## Plans and status

- **Beta:** Grok Bot launched in beta on August 11, 2026. Enterprise access is still rolling out by waitlist, and some features, such as teaching a task, may roll out gradually.
- **Plans:** as of October 2026, Grok Bot is included with SuperGrok, SuperGrok Plus and SuperGrok Heavy subscriptions, and with Cursor plans from Premium up (Premium, Super, Ultra, Teams and Enterprise, per Cursor's pricing page after its October 12, 2026 plan change). Access has changed several times since the August beta, so check the FAQ before you buy. Cursor is the company SpaceX agreed to buy in 2026, and Bots' computers run in Cursor's cloud.
- **Usage:** plans include weekly usage. Eligible accounts can add on-demand usage billed by model and token cost. If you have both a Cursor and a SuperGrok subscription, Bot uses whichever has more usage.
- **Pricing note:** early coverage reported plan access and prices inconsistently (some articles said only top tiers included Bots). Trust the current x.ai and Cursor pages over older articles.
- **Platforms:** desktop apps for macOS, Windows and Linux; mobile on iPhone, iPad and Android. The same Bot is reachable from all of them.

## Create a Bot and give it a job

The flow is short: create a Bot, describe the job, and grant access when it asks. Check the current Get started page for exact screens, since the beta changes quickly.

1. Install the Grok Bot app and sign in. Grok Bot uses Cursor authentication; you can link an individual SuperGrok plan.
2. Create a Bot and name it after its role, such as "Ops-Billing".
3. Describe its job in one message. Be explicit about where it must stop.
4. When it needs an app, it asks. Use a connector where one exists. Otherwise, it opens the app in its browser and hands you the login.

A job message:

```text
Your name is Ops-Billing. Your job: every Monday, log in to our invoicing
site, export last week's paid and unpaid invoices to a spreadsheet in
/workspace/billing, and send me a summary: totals, overdue clients,
anything odd. You may read and export. You may NOT send invoices,
email clients, change records or touch payment settings. If a login,
2FA code or CAPTCHA appears, hand it to me.
```

## Teach a routine

Grok Bot's most useful feature for a founder is the routine: you walk a Bot through a multi-step workflow once, it saves the steps as a skill, and you rerun it on a schedule. Background work and routines continue when your app, laptop or phone is closed.

How to teach well:

1. Do the task once together, narrating each step and the "why".
2. Ask the Bot to write back the steps as a checklist and fix anything wrong.
3. Save it as a skill and set the schedule.
4. Watch the first two scheduled runs closely before trusting it.
5. Pause the routine whenever the website or your process changes.

## Approvals, logins and the shared computer

**Auto-review.** An independent model checks tool calls and computer actions before they run. Set your rules in **Settings → General → Auto-review**:

- **Ask first** rules always stop matching actions for your approval.
- **Allow automatically** rules let matching actions proceed only if the review finds no other reason to stop.
- If both match, Ask first wins. Write narrow rules tied to a specific action.

When a Bot asks, you choose **Allow once**, **Always allow** (which can save a rule) or **Deny**. Prefer Allow once for anything sensitive. Approvals from work that started without you (a routine, a trigger, or another Bot) expire after about 10 minutes, and the action does not run. Ask the Bot to try again when you are back.

Starter Ask first rules:

```text
Ask first: sending any email or message outside the business.
Ask first: publishing or posting anything.
Ask first: deleting files, records or emails.
Ask first: changing permissions, settings or account details.
Ask first: accepting terms or anything that looks like a purchase.
```

**Logins.** Bots hand passwords, passkeys, two-factor codes, CAPTCHAs and payment confirmations back to you. Select **Take over** in the conversation (or open the computer and **Take control**), complete the step, select **I'm done**, then tell the Bot to continue. Never send passwords or codes in chat.

**The shared computer.** This is the most important thing to understand. All your Bots share one cloud computer: files, browser sessions and app logins. Each Bot gets its own screen and its own conversation, but a login one Bot uses is available to every Bot. SpaceXAI's docs say plainly: do not treat separate Bots as a security boundary.

**Your laptop.** Running on your local computer is a separate setting, **Execution on Local Computer**, with Ask every time, Always allow or Never allow. Unless a job needs your machine, choose Never allow or Ask every time.

## Organize Bots as a department

Bots can run in parallel, message each other, share context in group chats and pass task ownership. A three-Bot department for a small service business might be:

| Bot | Job | Logins it needs |
|---|---|---|
| Ops-Billing | Weekly invoice export and overdue summary | Invoicing site (read or export role) |
| Ops-Leads | Daily check of the booking form inbox, draft replies | Booking tool, draft-only email |
| Ops-Research | Weekly competitor and pricing scan | None (public web) |

Because they share one computer, the department's logins are only as narrow as the widest one. Give the shared computer only accounts that every Bot may safely use, use limited-role users for each app, and sign out of anything you no longer need. If one job truly needs a sensitive login, consider whether a Bot should do it at all.

:::try-it
List three web chores you repeat every week in sites that have no AI connector. For each, write the login it would need and whether that login is safe for every Bot to share. Cross off any that fail the test.
:::

:::warning
Never sign the Bots' shared computer into your bank, payroll, payment processor or tax portal. Every Bot could use that session. Payments and money stay with you.
:::

:::checkpoint
Q: Your Ops-Research Bot only browses public sites. Ops-Billing is logged into your invoicing site. What can Ops-Research reach?
- [ ] Nothing, each Bot is fully isolated
- [x] The invoicing site too, because all Bots share one computer and its browser sessions
- [ ] Only what you approve with Always allow
Why: Bots share files, browser sessions and logins on one computer, so separate Bots are not a security boundary.
:::

:::takeaways
- Grok Bot entered beta August 11, 2026 and is included with SuperGrok and paid Cursor plans; check current pages for terms
- Teach a routine once, save it as a skill, schedule it, and watch the first runs
- Use Ask first rules and Allow once; unattended approvals expire in about 10 minutes
- All Bots share one computer and its logins, so plan access for the whole department
:::

## Go deeper

- [Grok Bot overview](https://docs.x.ai/grok-bot/overview) - Bots, the shared computer, routines and platforms
- [Grok Bot approvals, security and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - Auto-review, Take over and removing access
- [Grok Bot FAQ](https://docs.x.ai/grok-bot/faq) - plans, weekly usage and what Bots cannot do
- [Grok Bot is now included with more plans](https://x.ai/news/grok-bot-more-plans) - the August 26, 2026 plan expansion
- [SpaceXAI Grok Bot is live](https://memeburn.com/spacexai-grok-bot-ai-agent/) - launch coverage and early beta-tester limits
