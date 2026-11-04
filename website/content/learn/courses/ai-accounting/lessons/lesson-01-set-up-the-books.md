---
module: 1
lesson_number: 1
course: ai-accounting
template: v2
---

# Lesson 1: Set Up the Books

:::video
id: acct-l1-overview
kind: overview
status: paused
src: /learn/video/ai-accounting/acct-l1-overview.mp4
captions: /learn/video/ai-accounting/acct-l1-overview.vtt
poster: /learn/video/ai-accounting/acct-l1-overview.jpg
transcript: Every receipt bot, forecast and tax summary starts with the same question: was this business or personal? Answer it once, today. This is AI Accounting, lesson one: set up the books. In this lesson: separate the money, pick one app, connect a read-only feed, and write your back-office rules. Open one business account and one card, and put every business dollar through them. Pick one accounting app: QuickBooks Online if you want built-in agents and room to grow, or Wave if you want free and simple. Connect your bank inside the app, as a read-only feed. Set up a short category list that maps to Schedule C, so tax season becomes a report, not a project. Then write your rules before you hire a single agent. Rule one: agents never move money. First, separate the money.
:::

:::key-concept
Your AI back office can only be as clean as the system it writes into. Open a separate business bank account, pick one accounting app (QuickBooks Online or Wave are the common choices), connect the bank as a read-only feed, and set up categories that match your tax form. Then decide, in writing, what each AI helper may touch.
:::

## What you'll be able to do

- Separate business and personal money with one account and one card
- Choose between QuickBooks Online and Wave for a one-person business
- Set up a short category list that maps to your tax return
- Write a back-office access policy that keeps agents away from money movement

## Why this matters

Every later lesson in this course assumes one thing: when an AI tool reads your transactions, it is reading only business transactions. Mixed accounts mean every receipt bot, forecast and tax summary starts with "first, figure out which of these were personal." That is the slowest, most error-prone job in small business bookkeeping, and no agent does it well. Ten minutes of setup now saves hours every quarter and makes your accountant's job (and bill) smaller.

## Step 1: Open a separate business bank account and card

Open a business checking account in the business's name (or your name plus a DBA if you are a sole proprietor without an LLC). Get a debit or credit card tied to it. From today:

- All income lands in this account.
- All business spending goes on this card or from this account.
- If you pay for something personal by mistake, record it as an owner draw, and if you pay a business cost with a personal card, record it as an owner contribution. Then stop doing it.

Your bank will ask for your EIN or SSN and, for an LLC, your formation documents. If you have an LLC and want an EIN, the IRS issues them free online. Never pay a third-party site for one.

## Step 2: Pick one accounting app

Both of the common choices work for a solo founder. Pick one and commit.

| | QuickBooks Online | Wave |
|---|---|---|
| Best for | Founders who expect to grow, hire, or want built-in AI agents | Freelancers and very small service businesses watching costs |
| Plans | Several tiers (Simple Start, Essentials, Plus, Advanced, plus lighter options). Prices for Essentials and up rose on renewals from August 1, 2026 | Starter (free core accounting and invoicing) and Pro (paid) |
| Bank feeds | Yes | Pro plan, through Plaid where your bank supports it |
| AI help (as of October 2026) | Intuit Intelligence and named agents: Accounting AI texts you when a card charge needs a receipt and reconciles against PDF statements (Essentials and up); Payments AI and Invoicing on Autopilot (beta) draft invoices you review and send | Auto-import, auto-merge and categorize on Pro; receipt scanning on Pro or as a Starter add-on |
| Accountant access | Accountant user invite | Collaborator access |

Plan names and features move often. Check the [QuickBooks pricing and feature updates](https://quickbooks.intuit.com/r/product-update/latest-quickbooks-feature-updates-since-summer-2025/) and [Wave pricing](https://www.waveapps.com/pricing) pages before you buy.

A useful rule: if you plan to use the in-app agents and expect more than a few dozen transactions a month, QuickBooks is the stronger fit. If you want free and simple, start with Wave. Moving later is possible but tedious, so ask your accountant which one they prefer to work in.

## Step 3: Connect the bank as a read-only feed

Inside the accounting app, connect your business bank and card. This is a read-only data feed: the app imports transactions, it does not send money. Do this inside the accounting app itself, never by giving an AI chat your bank password.

:::infographic
id: fig-1
type: diagram
title: One account, one feed, one app
shows: A left-to-right flow: Business account and card (every business dollar), a read-only feed arrow labelled "can't send money", the accounting app (categories mapped to Schedule C) as a highlighted paper card, then AI helpers reading through their own limited logins. A crossed-out line from helpers to the bank: never.
data: none
image: /learn/figures/ai-accounting/lesson-01-fig-1.webp
alt: Your business account and card feed transactions into the accounting app through a read-only connection that cannot send money. AI helpers read from the app through their own limited logins and never connect to the bank.
:::

Then set up your categories. Keep the list short and map it to the US Schedule C (the form a sole proprietor or single-member LLC usually files) so tax season is a report, not a project:

```text
Income: Service revenue
Expenses:
- Advertising
- Contract labor
- Software and subscriptions
- Office supplies
- Professional fees (legal, accounting)
- Travel
- Meals (business)
- Bank and payment processing fees
- Education and training
Equity: Owner contribution, Owner draw
```

You can ask Claude or ChatGPT to tailor this to your business:

```text
I run a one-person bookkeeping service for dog grooming salons, as a single-member LLC in the US.
Suggest a chart of accounts of no more than 15 expense categories, each mapped to the matching Schedule C line.
Flag any category where the tax treatment has special rules (for example meals) so I can ask my accountant.
Do not give tax advice, just the mapping and the flags.
```

Run the result past your accountant once. Their 15-minute review now prevents a year of miscategorized expenses.

:::video
id: acct-l1-feed
kind: inline
status: paused
src: /learn/video/ai-accounting/acct-l1-feed.mp4
captions: /learn/video/ai-accounting/acct-l1-feed.vtt
poster: /learn/video/ai-accounting/acct-l1-feed.jpg
transcript: Your AI helpers need to see your transactions. They never need your bank password. Here's how the money data flows. Your business account and card hold every business dollar. Inside your accounting app, connect them as a read-only feed. The app imports transactions. It can't send money. Your categories live in the app too. Keep them short, fifteen expense categories at most, each mapped to a line on Schedule C, like advertising, contract labor, and legal and professional fees. Then your AI helpers read from the app, through their own limited logins, and never through your bank. Ask Claude to draft the category list, and have your accountant review it once. Fifteen minutes now prevents a year of miscategorized expenses. Next: the rules every helper follows.
:::

## Step 4: Write your back-office access policy

You are about to hire several AI helpers in this course. Decide what each one may touch before you hire it. Copy this into a document called "Back office rules":

```text
Back office rules

1. Agents never move money. No agent gets bank logins, can initiate transfers, pay bills, or change payment details. I do those myself.
2. Each agent gets its own login with the lowest role that works (for example a limited or view-only user in the accounting app). Never my main password.
3. Agents may: read transactions, attach receipts, suggest categories, draft invoices and reminders, build reports.
4. Anything that leaves the business (invoices, reminders, messages to my accountant) waits for my click.
5. No passwords, full card numbers, SSNs or bank account numbers pasted into any AI chat.
6. I review the agent's work weekly. If it gets something wrong twice, I reduce its access.
```

:::infographic
id: fig-2
type: comparison
title: What agents may touch
shows: Two columns. May (check icons): read transactions, attach receipts, suggest categories, draft invoices and reminders, build reports. Never (ban icons, highlighted): bank logins, transfers, paying bills, changing payment details. Footer: anything that leaves the business waits for your click.
data: none
image: /learn/figures/ai-accounting/lesson-01-fig-2.webp
alt: Agents may read transactions, attach receipts, suggest categories, draft invoices and reminders, and build reports. They never get bank logins, make transfers, pay bills or change payment details. Anything that leaves the business waits for your click.
:::

QuickBooks lets you add users with different roles, and Wave lets you invite collaborators. Exact role names vary by plan, so check the current help pages and pick the least access that still lets the helper do its job.

:::warning
Some agents can sign in to websites and operate them like a person. That is exactly why rule 1 matters. An agent with your bank login can do anything you can. Give it nothing it would need to move money, and keep two-factor authentication on your bank and accounting app tied to your own phone.
:::

:::video
id: acct-l1-rules
kind: inline
status: paused
src: /learn/video/ai-accounting/acct-l1-rules.mp4
captions: /learn/video/ai-accounting/acct-l1-rules.vtt
poster: /learn/video/ai-accounting/acct-l1-rules.jpg
transcript: You're about to hire several AI helpers. Decide what each one may touch before you hire it. Write six back-office rules. One: agents never move money. No bank logins, no transfers, no paying bills. Two: each agent gets its own login, with the lowest role that works. Three: agents may read transactions, attach receipts, suggest categories, and draft invoices and reports. Four: anything that leaves the business waits for your click. Five: no passwords, card numbers or account numbers in any AI chat. Six: review the work weekly, and if an agent gets something wrong twice, reduce its access. Some agents can sign in to websites like a person. That's why rule one matters most. Keep two-factor on your bank and your accounting app, tied to your own phone. In the exercise, you'll write your own rules.
:::

## Step 5: Clean the starting line

Pick a start date (the day you opened the business account, or January 1). Enter your opening balance. If you already have a few months of mixed transactions, export them to a spreadsheet and sort them into business and personal with an AI helper, then import only the business ones:

```text
Here is a CSV of my personal checking account from March to June.
Mark each row Business, Personal, or Unsure, using this list of business vendors and customers: [paste list].
Add a short reason for every Unsure. Do not change any amounts.
```

Review every "Unsure" yourself. Then import.

:::try-it
Open your current bank app and count the last 20 transactions. How many were business? If the answer isn't 0 or 20, you have your first task: open the separate account this week.
:::

:::checkpoint
Q: Your new expense agent asks for your bank login so it can "match receipts faster." What's the right move?
- [ ] Share it, but change the password afterward
- [x] Decline, and let it read transactions through the accounting app's bank feed with its own limited user
- [ ] Share it only if the agent promises not to make payments
Why: Agents never get bank logins. The accounting app's read-only feed gives the agent everything it needs to match receipts without any ability to move money.
:::

:::takeaways
- One business account and one card, from today, for every business dollar
- QuickBooks Online for built-in agents and growth, Wave for free and simple
- Categories mapped to Schedule C turn tax season into a report
- Write your back-office rules before you hire any agent: they never move money
:::

## Go deeper

- [New and ongoing feature updates in QuickBooks in 2026](https://quickbooks.intuit.com/r/product-update/latest-quickbooks-feature-updates-since-summer-2025/) - the AI agents and which plans include them
- [Intuit Intelligence and Tax Deduction Maximizer in QuickBooks](https://quickbooks.intuit.com/r/product-update/intuit-intelligence-ai-business-tax-2026/) - the 2026 agent lineup
- [Wave pricing](https://www.waveapps.com/pricing) - Starter vs Pro features
- [Early fall 2026 QuickBooks changes](https://mbchx.cpa/blog/early-fall-brings-big-quickbooks-changes-new-ai-features-new-pricing-and-what-users-should-know) - a CPA firm's summary of new AI features and pricing
