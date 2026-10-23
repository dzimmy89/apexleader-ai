---
module: 1
lesson_number: 1
course: ai-accounting
template: v2
---

# Lesson 1: Set Up the Books

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

QuickBooks lets you add users with different roles, and Wave lets you invite collaborators. Exact role names vary by plan, so check the current help pages and pick the least access that still lets the helper do its job.

:::warning
Some agents can sign in to websites and operate them like a person. That is exactly why rule 1 matters. An agent with your bank login can do anything you can. Give it nothing it would need to move money, and keep two-factor authentication on your bank and accounting app tied to your own phone.
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
