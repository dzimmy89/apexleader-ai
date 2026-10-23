---
module: 1
lesson_number: 4
course: ai-accounting
template: v2
---

# Lesson 4: A 90-Day Cash-Flow Forecast

:::key-concept
Profit tells you if the business works. Cash tells you if it survives the next three months. Build a simple 13-week cash forecast in Google Sheets, use Gemini to write the formulas and spot problems, and update it every Monday in ten minutes. The forecast is a planning tool you own: AI helps build it, you decide what the numbers mean.
:::

## What you'll be able to do

- Lay out a 13-week (roughly 90-day) cash forecast with weekly columns
- Use Gemini in Sheets to build formulas, a chart and a quick analysis
- Add a "late payer" scenario so a slow client doesn't surprise you
- Run a ten-minute Monday update with an agent preparing the inputs

## Why this matters

Solo founders rarely fail because the idea was bad. They run out of cash during a gap: a big client pays 45 days late, the annual software renewals land in the same month, and the quarterly tax payment is due. A 13-week view shows those gaps while you still have time to act: chase an invoice, delay a purchase, or line up a small credit line before you need it.

## Step 1: Lay out the sheet

Create a Google Sheet called "Cash forecast." Use one row per item and one column per week, 13 weeks forward.

```text
Row 1:  Week starting (13 Monday dates)
Row 2:  Opening cash
Rows 4-8:  Cash in
   - Invoices expected (by expected pay date, not invoice date)
   - Recurring clients (retainers)
   - Other income
Rows 10-17: Cash out
   - Software and subscriptions
   - Contractors
   - Marketing
   - Owner pay (draw)
   - Tax set-aside transfer
   - Quarterly estimated tax payment
   - One-off purchases
Row 19: Net change (cash in minus cash out)
Row 20: Closing cash (opening plus net change)
Row 21: Minimum cash buffer (a fixed amount you never want to drop below)
```

Next week's opening cash is this week's closing cash. That single link is what makes it a forecast instead of a list.

## Step 2: Let Gemini build the formulas

If your Google Workspace or Google AI plan includes Gemini in Sheets, open the Gemini side panel. Google's help page says it can create tables, write and fix formulas, build charts, run analysis, and do actions like conditional formatting. Try prompts like:

```text
In this sheet, row 19 should be the total of rows 4 to 8 minus the total of rows 10 to 17 for each week column.
Row 20 should be row 2 plus row 19. Row 2 for each week after the first should equal row 20 of the previous week.
Write these formulas for columns B through N.
```

```text
Highlight any cell in row 20 that is lower than the value in row 21 in red.
```

```text
Create a line chart of row 20 (closing cash) and row 21 (minimum buffer) by week.
```

Two notes from Google's help page. First, charts Gemini inserts go on a new tab and don't update when the source data changes, so recreate the chart after big edits or build it yourself with Insert, Chart. Second, the Gemini panel's conversation is lost when you reload or close the sheet, so insert anything useful into the sheet right away.

No Gemini? Ask Claude or ChatGPT for the same formulas and paste them in. The structure matters more than the tool.

## Step 3: Fill it with honest numbers

Pull the inputs from the systems you set up earlier:

- **Opening cash:** today's business bank balance, read from your accounting app's bank feed.
- **Invoices expected:** from your receivables list in Lesson 3. Put each invoice in the week you expect it to be paid, using that client's actual history, not the due date. If a client always pays 20 days late, plan for 20 days late.
- **Recurring costs:** from your categorized expenses in Lesson 2. Sort the last 90 days by vendor and list every subscription with its billing date.
- **Taxes:** set aside a percentage of every payment in a separate savings account (your accountant can suggest the percentage). If you make US quarterly estimated tax payments, they're generally due around April 15, June 15, September 15 and January 15. Put each one in its week.

An agent can gather this for you. With Claude Cowork and the Finance folder from earlier lessons:

```text
In my Finance folder, read "AR aging.csv" and "Expenses last 90 days.csv".
Produce two small tables I can paste into my cash forecast:
1. Expected cash in by week for the next 13 weeks. Use each client's average days late from the paid invoices in the file, not the due date. Show your assumption per client.
2. Recurring expenses by week for the next 13 weeks, based on vendors that charged at least twice in the last 90 days.
Do not change any source files.
```

You check its assumptions, then paste the tables in. QuickBooks also offers cash flow scenarios and P&L forecasting in its business intelligence tools (all plans, with limited capacity), which you can use to cross-check.

## Step 4: Add the "what if a big client is late" scenario

Duplicate the forecast tab and call it "Late payer." Move your largest expected invoice four weeks later. Then ask Gemini:

```text
Compare the closing cash in row 20 of the tabs "Cash forecast" and "Late payer".
Which weeks fall below the minimum buffer in row 21 in each case? Summarize in three bullet points.
```

If the late-payer case dips below your buffer, decide now: ask for a deposit on new work, move a purchase, or talk to your bank about a line of credit before you need it. Google's own help pages warn that Gemini can be wrong and is no substitute for a professional's judgment. Check the weeks it flags against the red cells yourself.

:::warning
A forecast sheet holds your bank balance and client names. Keep it private: don't share it with "anyone with the link," and remember Google notes that Gemini content in a file shared outside your organization may be visible to those people. Nothing in this sheet should be able to move money. It is a planning tool only.
:::

## Step 5: The Monday ten minutes

Every Monday:

1. Update opening cash from the bank feed.
2. Move any paid invoices out of "expected," and add new ones.
3. Delete the past week's column and add a new week 13.
4. Look at the lowest closing cash in the next 13 weeks. Write one sentence at the top: "Lowest point: $X in week of Y. Action: Z."

You can schedule the input-gathering prompt from Step 3 in Cowork (type `/schedule`) to run early Monday, so the tables are waiting for you. The decision in step 4 stays yours.

:::try-it
Write down three numbers: today's business bank balance, the total you expect to collect in the next 30 days, and the total you expect to spend. Is the 30-day closing number above the amount you'd want as a buffer? That's a one-line forecast. Now you're building the 13-week version.
:::

:::checkpoint
Q: A client's invoice is due in week 2, but they've paid their last four invoices about three weeks late. Where should the cash go in your forecast?
- [ ] Week 2, because that's the due date
- [x] Around week 5, based on their actual payment history
- [ ] Leave it out entirely until it's paid
Why: A cash forecast predicts when money actually arrives. Using real payment history keeps you from planning around money that won't be there yet.
:::

:::takeaways
- 13 weekly columns, opening cash linked to last week's closing cash
- Gemini writes the formulas, formatting and analysis; you check them
- Use real payment history, include taxes, and run a late-payer scenario
- Ten minutes every Monday, ending in one sentence: lowest point and your action
:::

## Go deeper

- [Collaborate with Gemini in Google Sheets](https://support.google.com/docs/answer/14356410) - what the side panel can create, analyze and format
- [Use the AI function in Google Sheets](https://support.google.com/docs/answer/15877199) - the =AI() formula, limits and refresh behavior
- [New and ongoing feature updates in QuickBooks in 2026](https://quickbooks.intuit.com/r/product-update/latest-quickbooks-feature-updates-since-summer-2025/) - cash flow scenarios and forecasting
- [Get started with Claude Cowork](https://support.claude.com/articles/13345190) - scheduling recurring tasks on your files
