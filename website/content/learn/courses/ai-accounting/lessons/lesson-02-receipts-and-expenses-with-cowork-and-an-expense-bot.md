---
module: 1
lesson_number: 2
course: ai-accounting
template: v2
---

# Lesson 2: Receipts and Expenses With Cowork and an Expense Bot

:::key-concept
Receipts pile up in three places: your email, vendor websites, and your pocket. Use Claude Cowork to file and log everything that lands in one folder on your computer, and a Grok Bot "Expense Bot" to collect invoices from vendor websites on a schedule. Your accounting app's bank feed is the source of truth. The agents match paperwork to it and flag gaps. They never pay anything.
:::

## What you'll be able to do

- Set up one receipts folder with a naming rule an agent can follow
- Have Claude Cowork rename, log and categorize receipts into a spreadsheet you review
- Hire a Grok Bot Expense Bot that downloads monthly invoices from vendor portals
- Match receipts to bank transactions and handle the exceptions yourself

## Why this matters

Receipts matter twice: when your accountant prepares your return, and if the IRS ever asks you to support a deduction. Most founders do this in a panic once a year. With two agents and a 15-minute weekly review, every expense has its paperwork attached within days of the charge, and tax season becomes a report you print.

## Step 1: One folder, one naming rule

Create this folder structure on your computer (or in a synced Google Drive or Dropbox folder):

```text
Finance/
  Receipts/
    Inbox/        <- everything new goes here
    Filed/2026/   <- the agent moves filed receipts here, by month
  Expense log.xlsx
```

The naming rule: `YYYY-MM-DD_Vendor_Amount.pdf`, for example `2026-10-14_Canva_15.00.pdf`. A consistent name makes receipts searchable forever, by you, your accountant, or any agent.

Getting receipts into Inbox:

- **Email receipts:** forward or save as PDF into Inbox. Many email apps can do this with a filter.
- **Paper receipts:** photograph them with your phone and save to the synced Inbox folder. QuickBooks and Wave mobile apps can also capture receipts directly (on Wave this is part of Pro or a paid add-on).
- **Vendor portals:** your Expense Bot handles these (Step 3).

## Step 2: Claude Cowork files and logs

Claude Cowork is Anthropic's agent in the Claude desktop app (macOS and Windows, paid plans). It works directly on files in the folders you connect, and nothing else. Connect only the `Finance` folder. Then give it this task:

```text
Work only in my Finance folder.

For every file in Receipts/Inbox:
1. Read the receipt. Find the date, vendor, total amount, and currency.
2. Rename it using the pattern YYYY-MM-DD_Vendor_Amount.pdf.
3. Add a row to the "Log" sheet in Expense log.xlsx with: Date | Vendor | Amount | Suggested category | Business or Personal | Confidence (High/Medium/Low) | File name.
   Use only these categories: Advertising, Contract labor, Software and subscriptions, Office supplies, Professional fees, Travel, Meals, Bank and payment fees, Education.
4. Move the file to Receipts/Filed/2026/<month>.
5. If you can't read a receipt, or it looks like a duplicate, or it looks personal, leave it in Inbox and add it to a "Needs review" list at the top of the Log sheet.

Never delete any file. Don't change any existing rows in the Log.
```

Once that runs cleanly a couple of times, make it weekly. In Cowork, type `/schedule` or use the Scheduled item in the sidebar. Anthropic's help center notes that scheduled tasks run only while your computer is awake and the desktop app is open, so pick a time you're usually at your desk.

Cowork asks for permission before permanently deleting files, and you can watch each step and stop it. Anthropic also notes that Cowork activity isn't captured in its audit logs, so it isn't meant for regulated workloads. For a solo founder's receipts, the practical rule is: review its work weekly, and keep the original files.

## Step 3: Hire an Expense Bot for vendor portals

Some receipts only live behind a login: your web host, your software subscriptions, your phone carrier. Downloading them monthly is a classic job for an agent that can operate a browser. Grok Bot (SpaceXAI, in beta since August 2026) lists "Expense Manager" among its example roles.

Create a new Bot named "Expense Bot" and give it one job:

```text
You are my Expense Bot. Your one job: collect monthly invoices from my vendor portals.

On the 3rd of each month:
1. For each vendor in the "Vendor portals" list I give you, sign in (I will enter passwords myself the first time when you hand me the computer), open billing or invoices, and download last month's invoice as PDF.
2. Upload each PDF to my Google Drive folder Finance/Receipts/Inbox.
3. Message me a list: vendor, amount, downloaded yes/no, and anything unusual (price change, new charge, failed payment notice).

Never change a plan, cancel a subscription, update a payment method, or buy anything. If a page asks you to do any of those, stop and ask me.
```

Lock it down using Grok Bot's own controls:

- **Logins:** when the Bot reaches a sign-in page, click **Open computer** or **Take over** and type the password and two-factor code yourself. Grok Bot's docs say not to put passwords or codes in chat. Where a vendor offers a separate "billing viewer" or limited user, create one for the Bot.
- **Approvals:** in **Settings → General → Auto-review**, add **Ask first** rules for purchases, financial transfers, changing settings, and deleting data. The docs list purchases and financial transfers among actions that need explicit approval.
- **Separation:** all your Bots share one cloud computer, including signed-in browser sessions. Never sign that computer in to your bank, and don't assume your Sales Bot can't see the Expense Bot's sessions.

:::warning
Agents never move money. The Expense Bot reads billing pages and downloads PDFs. It doesn't pay invoices, change cards on file, or accept new terms. If a vendor portal shows a "pay now" button for a failed charge, the Bot reports it and you pay it yourself.
:::

## Step 4: Match receipts to the bank feed

Your accounting app's bank feed already has every transaction. Now match paperwork to it.

- **In QuickBooks Online:** Accounting AI (Essentials and up) texts you when a card transaction needs a receipt and helps categorize and reconcile. You can upload receipts from the Filed folder and let QuickBooks match them, then review in the Business Feed.
- **In Wave:** upload receipts (Pro, or Starter with the receipts add-on) and match them to imported transactions.

Then ask Cowork for an exceptions list:

```text
Compare "Bank export.csv" (from my accounting app) with the Log sheet in Expense log.xlsx.
List: (a) bank transactions over $25 with no matching receipt, (b) receipts with no matching bank transaction, (c) any amount mismatch.
Match on vendor and amount within 3 days. Don't change either file.
```

## Step 5: The weekly 15 minutes

1. Clear the "Needs review" list: decide business or personal for each.
2. Approve or fix suggested categories marked Medium or Low confidence.
3. Chase the missing receipts from the exceptions list (a quick search in your email usually finds them).
4. Glance at the Expense Bot's unusual items: price increases are the most common surprise.

Ask your accountant how long to keep receipts for your situation. The IRS says to keep records that support income and deductions for as long as they may matter for a return, which is generally at least three years.

:::try-it
Make the `Finance/Receipts/Inbox` folder right now and drop in three receipts from your email. That's the whole input system. Everything else in this lesson works on that folder.
:::

:::checkpoint
Q: Your Expense Bot reports that a software vendor's portal shows a failed payment and offers to "update the card and retry." What should happen?
- [ ] Let it update the card, since it already has the portal open
- [ ] Use Always allow so it can fix failed payments next time
- [x] Deny it and update the payment method yourself
Why: Changing payment methods and paying are money movements. Agents report them; you do them.
:::

:::takeaways
- One Inbox folder and one naming rule make receipts agent-friendly
- Cowork renames, logs and files receipts in a folder you connect, and flags what it isn't sure about
- A Grok Bot Expense Bot downloads vendor invoices; you type its passwords, and it never pays or changes plans
- The bank feed is the source of truth; agents produce an exceptions list you clear weekly
:::

## Go deeper

- [Get started with Claude Cowork](https://support.claude.com/articles/13345190) - folders, scheduled tasks, safety and limits
- [Claude Cowork overview](https://claude.com/cowork) - plans, approvals and file types
- [Grok Bot approvals, security and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - Ask first rules, Take over for logins, shared computer
- [Get started with Grok Bot](https://cursor.com/docs/grok-bot/get-started) - creating a focused Bot and signing in safely
- [New and ongoing feature updates in QuickBooks in 2026](https://quickbooks.intuit.com/r/product-update/latest-quickbooks-feature-updates-since-summer-2025/) - Accounting AI receipt requests and reconciliation
