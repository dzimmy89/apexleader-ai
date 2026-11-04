---
module: 1
lesson_number: 2
course: ai-accounting
template: v2
---

# Exercise 2: Build Your Receipts Pipeline

:::key-concept
You'll set up a receipts Inbox, have Claude Cowork file and log ten receipts into an Expense log, write the job description for a Grok Bot Expense Bot, and produce your first exceptions list. You'll end with a receipts system that runs weekly.
:::

**Time:** 35 minutes · **You'll need:** The Claude desktop app with Cowork (paid plan), 10 receipts (from your email or the sample set below), your Finance folder from Exercise 1, Grok Bot access (optional) · **Builds on:** Lesson 2

:::video
id: acct-ex2-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-accounting/acct-ex2-setup.mp4
captions: /learn/video/ai-accounting/acct-ex2-setup.vtt
poster: /learn/video/ai-accounting/acct-ex2-setup.jpg
transcript: Ten receipts, one Inbox, and a log you can trust. Let's build your receipts pipeline. In this exercise you'll set up the folders, file ten receipts with Claude Cowork, and find the gaps. Create Inbox and Filed inside your Finance folder, plus an Expense log with a sheet called Log. Gather ten receipts, real or sample. Connect only Finance in Cowork, paste the filing prompt, and read its plan before you approve it. Check at least five rows against the receipts, and look at the Needs review list. Did it catch the personal purchase? Correct any wrong category, add your notes to the prompt, and schedule it weekly. Write the Expense Bot job for three vendors behind a login. Then export thirty days of bank transactions and run the exceptions check. So: does every bank charge over twenty-five dollars have its paperwork? Pause here and build your pipeline.
:::

## Warm-up

:::checkpoint
Q: Which folder access should you give Claude Cowork for this job?
- [ ] Your whole Documents folder, so it can find stray receipts
- [x] Only the Finance folder
- [ ] Your Downloads folder, where receipts usually land
Why: Cowork can only work in folders you connect. Least access means the one folder the job needs.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to a receipts pipeline
shows: Seven numbered steps: 1 Folders, 2 Ten receipts, 3 Cowork with Finance only, 4 Check 5 rows (highlighted), 5 Fix and schedule, 6 Expense Bot job, 7 Exceptions check.
data: none
image: /learn/figures/ai-accounting/exercise-02-fig-1.webp
alt: Seven steps: create the Inbox and Filed folders; gather ten receipts; connect only Finance in Cowork; check at least five rows; fix categories and schedule the job weekly; write the Expense Bot job; and run the exceptions check.
:::

1. **Create the folders** inside Finance: `Receipts/Inbox`, `Receipts/Filed/2026`, and an empty spreadsheet `Expense log.xlsx` with a sheet named "Log."

2. **Gather ten receipts** into Inbox. Use real ones from your email (save as PDF) or phone photos. No receipts yet? Ask Claude: "Create 10 realistic sample receipts as separate short text files for a one-person bookkeeping business: software subscriptions, a coffee meeting, office supplies, a contractor invoice, and one obviously personal purchase. Vary the dates across October 2026." Save them into Inbox.

3. **Connect only Finance in Cowork** and paste the filing prompt from Lesson 2. Watch the plan before approving it.

4. **Check its work.** Open the Log. Confirm at least five rows against the receipts. Look at the "Needs review" list: did it catch the personal purchase?

5. **Fix and teach.** Correct any wrong category. Then add to the prompt: "Notes from my review: [your corrections]." Save the final prompt as "Receipts job" in your Finance folder.

6. **Schedule it.** In Cowork, type `/schedule` and set the Receipts job for once a week at a time your computer is on.

7. **Write the Expense Bot job.** List three vendors whose invoices live behind a login (web host, software, phone). Write the Expense Bot job description from Lesson 2 with your vendors filled in. If you have Grok Bot, create the Bot, add **Ask first** rules for purchases, transfers, settings changes and deletions, and run it once, typing passwords yourself via **Open computer**. If not, keep the job description for later and download those three invoices by hand into Inbox.

8. **Run the exceptions check.** Export the last 30 days of transactions from your accounting app as `Bank export.csv` into Finance (or ask Claude to create a matching sample file). Run the exceptions prompt from Lesson 2 and save the result.

## Done when

- [ ] Receipts/Inbox and Receipts/Filed exist, and filed receipts follow `YYYY-MM-DD_Vendor_Amount`
- [ ] The Log has ten rows with category, Business/Personal and confidence
- [ ] The Receipts job is saved and scheduled weekly
- [ ] An Expense Bot job description exists that forbids paying, cancelling and changing payment methods
- [ ] You have an exceptions list and have cleared at least one item

:::example
title: See an example result
Here is the first run for the sample business, Rolling Ledger, with ten October 2026 receipts.

:::video
id: acct-ex2-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-accounting/acct-ex2-reveal.mp4
captions: /learn/video/ai-accounting/acct-ex2-reveal.vtt
poster: /learn/video/ai-accounting/acct-ex2-reveal.jpg
transcript: For Rolling Ledger, nine of ten receipts filed themselves, and one waited for a human. Here's the example. Cowork read ten October receipts. Seven came back high confidence, two medium, and one low: a Target receipt for household items, which went to Needs review and was marked personal. The founder checked six rows and made one correction: Squarespace moved from advertising to software. That note went into the saved Receipts job, now scheduled for Fridays at nine. The Expense Bot covers three vendors: the web host, Google Workspace and the phone carrier. Then the exceptions check compared fourteen bank transactions with the log. Two charges over twenty-five dollars had no receipt: Adobe at fifty-nine ninety-nine, and the phone bill at sixty-five dollars. One receipt had no bank match: a Udemy course for nineteen ninety-nine, paid on a personal card. There were zero amount mismatches. The phone invoice from the portal cleared one item that same day.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger receipts, October
shows: Under "Rolling Ledger, October" tagged example: a bar of 10 receipts split 7 high, 2 medium and 1 low confidence (the low one went to review), and beside it the exceptions count: 2 charges with no receipt, 1 receipt with no charge, 0 mismatches. Footer: the Expense Bot cleared 1 the same day.
data: example numbers: 10 receipts, 7 high, 2 medium, 1 low; 9 filed, 1 to review; exceptions 2, 1 and 0
image: /learn/figures/ai-accounting/exercise-02-fig-2.webp
alt: Example first run for Rolling Ledger: 10 receipts, 7 high confidence, 2 medium and 1 low. Nine were filed and one went to review as personal. The exceptions check found 2 bank charges with no receipt, 1 receipt with no bank charge and no amount mismatches. The Expense Bot cleared one item the same day.
:::

| File name | Suggested category | Business or Personal | Confidence |
|---|---|---|---|
| 2026-10-01_Google-Workspace_14.00.pdf | Software and subscriptions | Business | High |
| 2026-10-03_Canva_15.00.pdf | Software and subscriptions | Business | High |
| 2026-10-06_Office-Depot_42.18.pdf | Office supplies | Business | High |
| 2026-10-08_Blue-Bottle-Coffee_11.50.pdf | Meals | Business | Medium |
| 2026-10-10_Lopez-Design_300.00.pdf | Contract labor | Business | High |
| 2026-10-12_Squarespace_23.00.pdf | Advertising, corrected to Software and subscriptions | Business | Medium |
| 2026-10-15_Target_64.37.pdf | (left in Inbox, Needs review) | Personal | Low |
| 2026-10-18_Udemy_19.99.pdf | Education | Business | High |
| 2026-10-22_Food-Truck-Association_75.00.pdf | Professional fees | Business | High |
| 2026-10-31_Stripe-fees_38.42.pdf | Bank and payment fees | Business | High |

The founder checked six rows against the receipts. The coffee was a meeting with a truck owner, so Meals stays. The Target receipt was household shopping and stays out of the books.

```text
RECEIPTS JOB (example, Rolling Ledger)
Filing prompt from Lesson 2, plus:
Notes from my review:
- Squarespace is our website: Software and subscriptions, not Advertising.
- Target and grocery receipts are personal unless I say otherwise.
Schedule: Fridays at 9am (the laptop is open then)

EXPENSE BOT VENDORS
1. Web host  2. Google Workspace  3. Phone carrier
Ask first: purchases, financial transfers, changing settings, deleting data

EXCEPTIONS (14 bank transactions, October)
(a) Over $25, no receipt: Adobe $59.99 (Oct 9), phone carrier $65.00 (Oct 21)
(b) Receipt, no bank match: Udemy $19.99 (paid on a personal card, ask the accountant how to record it)
(c) Amount mismatch: none
Cleared: phone carrier, the Expense Bot downloaded the invoice on the 3rd
```
:::

:::coached
**For 1-on-1 coaching clients.** Run a full month of real receipts.

1. Put every receipt from last month through the pipeline.
2. Measure: receipts filed automatically, flagged for review, and missing from the exceptions list.
3. Rewrite the prompt to cut the flagged count in half without hiding real problems.

**Bring to your session:** the Log, the exceptions list, and your before and after counts.

**Your coach will:**
- Review category accuracy on a sample of rows
- Check your agents' access and approval rules
- Help you decide what to automate next and what stays manual
:::
