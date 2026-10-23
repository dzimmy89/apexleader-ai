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

## Warm-up

:::checkpoint
Q: Which folder access should you give Claude Cowork for this job?
- [ ] Your whole Documents folder, so it can find stray receipts
- [x] Only the Finance folder
- [ ] Your Downloads folder, where receipts usually land
Why: Cowork can only work in folders you connect. Least access means the one folder the job needs.
:::

## Steps

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
