---
module: 1
lesson_number: 5
course: ai-accounting
template: v2
---

# Lesson 5: Tax-Season Prep

:::key-concept
If the earlier lessons are running, tax season is mostly a packaging job. An agent assembles your year-end packet (reports, receipts, contractor forms, estimated payments) and a list of questions. Your accountant prepares and reviews the return. You sign it. This lesson is general information for US sole proprietors and single-member LLCs, not tax advice.
:::

## What you'll be able to do

- Know which federal forms a typical US sole proprietor or single-member LLC deals with
- Have an agent build a complete year-end packet for your accountant
- Handle contractor W-9s and 1099-NEC forms on time
- Use AI to prepare questions for your accountant, not to replace them

## Why this matters

Accountants charge for time, and most of a small business return's time goes into chasing missing information. Hand over a clean, complete packet and you pay for judgment instead of cleanup. You'll also catch the deductions you'd otherwise forget, and avoid the January scramble for contractor forms.

:::warning
Tax rules change, depend on your state and situation, and carry penalties when you get them wrong. Everything here is general information. Check with a CPA or enrolled agent before you file, make elections, or change how you pay yourself. AI tools can be confidently wrong about tax rules; never file based on an AI answer alone.
:::

## Step 1: Know your forms (the short version)

For a US sole proprietor, or a single-member LLC taxed the default way, the business usually shows up on your personal return:

| Form | What it's for |
|---|---|
| Form 1040 with Schedule C | Your business income and expenses; the profit flows to your personal return |
| Schedule SE | Self-employment tax (Social Security and Medicare) on that profit |
| Form 1040-ES | Quarterly estimated tax payments during the year, generally due around April 15, June 15, September 15 and January 15 |
| Form W-9 | What you collect from contractors before you pay them |
| Form 1099-NEC | What you send contractors you paid above the reporting threshold, generally due to them and the IRS by January 31 |
| Form 1099-K | What payment platforms may send you; your income still counts whether or not you get one |

Two changes to know for the 2026 tax year. Under the 2025 tax law often called the One Big Beautiful Bill Act, the 1099-NEC reporting threshold rises from $600 to $2,000 for payments made in 2026, and 1099-K reporting thresholds for payment platforms changed as well. Confirm the current numbers with your accountant or on IRS.gov.

If your LLC has more than one owner, or you elected S corporation or C corporation tax treatment, your forms and deadlines are different. Ask your accountant which apply. State and local taxes (including sales tax, if you sell taxable goods or services) are separate.

## Step 2: Make your categories do the work

Because you mapped categories to Schedule C in Lesson 1, your Profit and Loss report is already shaped like the form. In December, run a full-year P&L in QuickBooks or Wave and look for:

- An "Uncategorized" or "Ask my accountant" balance. Clear it.
- Categories with surprising totals (meals usually, or one huge "Office supplies" purchase that was really equipment).
- Months with no expenses in a category that should be steady, like software. That usually means missing transactions.

If you use QuickBooks, its Business Tax Agent (beta, Essentials and up) includes a Tax Deduction Maximizer that runs during the year, ranks gaps in your books, suggests deductions you may be missing based on your industry, and hands off to QuickBooks Live Tax for filing with human experts. The Maximizer is also on Simple Start. Treat its suggestions as questions for your accountant.

## Step 3: Collect contractor forms now, not in January

If you paid contractors (a designer, a virtual assistant, a developer), you need a W-9 from each before year end. Have an agent keep the list:

```text
Read "Expense log.xlsx" and "Bank export.csv" in my Finance folder.
List every person or business I paid in 2026 in the categories "Contract labor" or "Professional fees".
For each: total paid in 2026, how I paid them (bank transfer, card, or a payment platform), and whether a W-9 file exists in Finance/Tax/W-9.
Flag anyone paid $2,000 or more by bank transfer or check who has no W-9.
Don't contact anyone.
```

Then you email the flagged contractors for a W-9. Payments made by card or through some payment platforms are typically reported by the platform instead of by you. Your accountant can confirm which of your payments need a 1099-NEC.

:::warning
W-9s contain Social Security or tax ID numbers. Store them in a private folder, never paste their contents into an AI chat, and don't let any agent email them. When an agent checks for W-9s, it only needs to know the file exists.
:::

## Step 4: Build the year-end packet

Create `Finance/Tax/2026 packet/` and have Claude Cowork assemble it in January:

```text
Build my 2026 year-end packet in Finance/Tax/2026 packet. Work only in my Finance folder.

1. Copy in: the full-year Profit and Loss and Balance Sheet PDFs (I'll export them into Finance/Reports), the Expense log, and the receipts folder index.
2. Create "Summary.xlsx" with: total income by month, total expenses by category, estimated tax payments made (from the bank export, payee IRS or my state), and contractor totals.
3. Create "Questions for my accountant.docx" listing:
   - Any expense over $2,500 that might be equipment rather than a regular expense
   - Meals and travel totals, for them to apply the right rules
   - Any transaction still marked Unsure or Personal in the business account
   - Home office, vehicle mileage and health insurance: ask me for the facts and leave blanks
4. Don't make tax conclusions. Write everything as questions or facts with sources.
Never delete or modify original files.
```

You fill in the blanks (home office square footage, mileage log, retirement contributions, health insurance premiums) and review the questions. Then share the packet with your accountant through their secure portal, not as a plain email attachment.

## Step 5: Ask better questions with AI

Before the accountant meeting, use Claude or ChatGPT to understand, not decide:

```text
I'm a US single-member LLC owner with a bookkeeping service, taxed as a sole proprietor.
Explain in plain English what Schedule SE is and why my tax bill is higher than I expected based on my profit.
Then list 5 questions I should ask my CPA about reducing next year's tax legally, like retirement accounts or an S corp election.
Do not tell me what to do; I will decide with my CPA.
```

You arrive informed, the meeting is shorter, and the decisions stay with the licensed professional and you.

## The rule for every tax step

AI assembles, summarizes and asks. Your accountant advises and prepares. You review and sign. No agent pays taxes, files returns, or submits forms on your behalf. Paying estimated taxes is a money movement, so you do it yourself through IRS Direct Pay or your accountant's process.

:::try-it
Search your business bank account for payments to people (not companies) this year. How many did you pay by bank transfer, and do you have a W-9 for each? That's the first item on your tax checklist.
:::

:::checkpoint
Q: Your agent's summary says "You can deduct 100% of your client meals." What should you do?
- [ ] Trust it, since it read all your receipts
- [x] Add it to your questions list and confirm the rule with your accountant
- [ ] Recategorize all meals as Advertising so they're fully deductible
Why: Meals have special deduction rules that change and depend on facts. AI summaries are prompts for your accountant, not tax decisions.
:::

:::takeaways
- Sole proprietors and single-member LLCs usually file Schedule C and Schedule SE with Form 1040, and pay quarterly estimates
- Collect W-9s during the year; the 1099-NEC threshold rises to $2,000 for 2026 payments
- An agent builds the packet and the questions list; your accountant gives the advice
- Agents never file, pay or submit anything; you sign and you pay
:::

## Go deeper

- [IRS: Schedule C and Schedule SE FAQs](https://irs.gov/help-resources/tools-faqs/faqs-for-individuals/frequently-asked-tax-questions-answers/small-business-self-employed-other-business/schedule-c-schedule-se/schedule-c-schedule-se-1) - common questions from the IRS
- [1099 reporting threshold increases to $2,000 (Patriot Software)](https://www.patriotsoftware.com/blog/accounting/1099-reporting-threshold/) - the 2026 threshold change explained
- [Intuit Intelligence and Tax Deduction Maximizer in QuickBooks](https://quickbooks.intuit.com/r/product-update/intuit-intelligence-ai-business-tax-2026/) - the Business Tax Agent and its plans
- [Get started with Claude Cowork](https://support.claude.com/articles/13345190) - working on files in your Finance folder
