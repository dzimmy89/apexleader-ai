---
module: 1
lesson_number: 3
course: ai-accounting
template: v2
---

# Lesson 3: Invoices and Collections

:::key-concept
Getting paid is a system, not a mood. Set clear terms, let your accounting app draft invoices and send scheduled reminders, and have an agent build a weekly "who owes what" list with suggested follow-ups. You approve every invoice and every personal chase. No agent ever touches refunds, payment details or bank accounts.
:::

## What you'll be able to do

- Write payment terms that make late payment less likely
- Turn on invoice drafting and automatic reminders in QuickBooks Online or Wave
- Run a weekly receivables review with an agent that drafts polite follow-ups
- Spot the invoice-fraud risk that comes with automation and block it

## Why this matters

For a solo service business, the gap between "work done" and "money in the bank" is where cash problems start. Most late payments aren't hostile. The client forgot, the invoice went to the wrong person, or nobody reminded them. A consistent, polite, automatic reminder schedule fixes most of that. The rest needs a human touch, and the agent's job is to tell you exactly who needs it this week.

## Step 1: Set terms before you send the first invoice

Put these in your proposal or contract (Lesson 5 of AI Sales covers proposals) and repeat them on every invoice:

- **Due date.** "Due on receipt" or Net 14 works for most small service businesses. Net 30 is common in larger companies, but you don't have to offer it.
- **Deposit.** For project work, ask for a deposit up front (many founders use 30 to 50 percent).
- **How to pay.** Card or bank transfer through your invoicing tool's payment link. Fewer steps means faster payment.
- **Late fee.** Only if it's in the signed agreement and allowed in your state. Ask your accountant or lawyer before adding one.
- **Who receives invoices.** Get the name and email of the person who pays bills, not just your main contact.

## Step 2: Let the app draft and remind

Both common accounting apps now handle the routine part.

**QuickBooks Online (as of October 2026).** Intuit lists Payments AI on Essentials and up. It drafts recurring invoices and suggests ways to bring in money based on how your customers pay. Invoicing on Autopilot (beta, on Essentials, Plus and Advanced) drafts invoices from your saved documents for you to review and send, then schedules reminders. Custom automations can send overdue reminders on all plans, with limited capacity. Agent work shows in the Business Feed, where you review and approve it.

**Wave.** The Pro plan sends automatic payment reminders 3, 7 and 14 days after an invoice is due, and lets invoices go out automatically with your logo and attachments. Starter covers unlimited invoices you send yourself.

Whichever you use, set a reminder schedule and write the reminder text once:

```text
Help me write three short, friendly invoice reminder emails for a one-person bookkeeping service.
1. Sent 3 days before the due date: a heads-up with the amount and payment link placeholder.
2. Sent 3 days after the due date: a polite nudge, assumes they forgot.
3. Sent 14 days after the due date: still polite, asks if anything is blocking payment and offers a quick call.
Each under 80 words. No guilt, no threats, no legal language. Use [Client name], [Invoice number], [Amount], [Due date], [Payment link].
```

Paste the results into your app's reminder templates. You approve the wording once. The app handles the timing.

## Step 3: Hire an agent for the weekly receivables review

Automatic reminders cover the first two weeks. After that, you need judgment: a call, a payment plan, or pausing work. An agent can prepare that decision for you every Monday.

Use Claude Cowork on an exported report, or a Grok Bot "Expense Manager" style Bot with view-only access to your accounting app:

```text
Every Monday at 8am, open the file "AR aging.csv" in my Finance folder (exported from my accounting app).

Make a one-page summary:
1. Total owed to me, and total more than 30 days overdue.
2. A table: Client | Invoice | Amount | Days overdue | Reminders already sent | Suggested next step.
   Next-step rules:
   - 1 to 14 days overdue: automatic reminders are handling it, no action.
   - 15 to 30 days: draft a short personal email from me.
   - Over 30 days: suggest a phone call and draft talking points.
   - Over 60 days: flag for me to decide on pausing work or a payment plan.
3. Draft any personal emails into a "Follow-ups" document. Do not send anything.
Never change invoice amounts, due dates, or payment details.
```

The output is a list you read in five minutes and a few drafts you send yourself.

:::warning
Invoice fraud often works by changing payment details: a "new bank account" on an invoice, or an email asking a client to pay somewhere else. Your rule: no agent may edit payment instructions, bank details or payment links, and no agent may issue refunds or credits. If a client ever receives a message about changed payment details, they should call you to confirm. Tell them that in your first invoice email.
:::

## Step 4: Handle the hard cases yourself

A few situations should always reach you, not an automation:

- A client disputes the amount or the work. Pause reminders on that invoice and talk to them.
- A client asks for a payment plan. Agree in writing, then update the invoice yourself.
- An invoice is over 60 days. Decide: keep chasing, pause work, or write it off with your accountant's advice.
- Anything involving a collections agency or legal steps. Talk to a lawyer first.

Keep collection messages honest and calm. Never threaten action you won't take.

## Step 5: Close the loop in the books

When a payment arrives, your bank feed imports it and the app matches it to the open invoice. Check once a week that matched payments look right. QuickBooks' Accounting AI also reconciles against PDF statements on Essentials and up. Your job is to review its work, not redo it. An invoice marked paid that never hit the bank is the error to catch.

:::try-it
Look at your last five invoices (or five you'd send for the sample business). Does each one show a due date, a payment link, and the name of the person who pays bills? Fix the template once and every future invoice improves.
:::

:::checkpoint
Q: Your receivables agent proposes updating a client's invoice with a new payment link because "the old one looks expired." What should happen?
- [ ] Let the agent update it, since expired links slow down payment
- [x] Deny it, check the link yourself in the invoicing app, and fix it by hand if needed
- [ ] Ask the agent to email the client the new link directly
Why: Payment details are off-limits to agents. Changed payment instructions are a classic fraud pattern, so only you edit them.
:::

:::takeaways
- Clear terms (due date, deposit, payment link, billing contact) prevent most late payments
- Let QuickBooks or Wave draft invoices and send scheduled reminders, with your approval on each invoice
- A weekly agent-built receivables summary tells you who needs a personal follow-up
- Agents never edit payment details, issue refunds or move money
:::

## Go deeper

- [New and ongoing feature updates in QuickBooks in 2026](https://quickbooks.intuit.com/r/product-update/latest-quickbooks-feature-updates-since-summer-2025/) - Payments AI, Invoicing on Autopilot and reminders
- [Wave pricing](https://www.waveapps.com/pricing) - automatic reminders and invoicing on Starter vs Pro
- [Intuit debuts AI agents for QuickBooks (Accounting Today)](https://www.accountingtoday.com/news/intuit-debuts-ai-agents-for-quickbooks) - background on the Payments Agent
- [Get started with Claude Cowork](https://support.claude.com/articles/13345190) - scheduled tasks on files in your folders
