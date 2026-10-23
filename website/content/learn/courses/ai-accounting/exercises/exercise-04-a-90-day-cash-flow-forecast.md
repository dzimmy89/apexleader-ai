---
module: 1
lesson_number: 4
course: ai-accounting
template: v2
---

# Exercise 4: Build Your 13-Week Cash Forecast

:::key-concept
You'll build a 13-week cash forecast in Google Sheets with Gemini's help, fill it from your receivables and expenses, add a late-payer scenario, and write your first Monday note. You'll end with the sheet you'll update every week.
:::

**Time:** 40 minutes · **You'll need:** A Google account (Gemini in Sheets if your plan includes it, or Claude or ChatGPT for formulas), your AR aging and Expense log from Exercises 2 and 3 · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Which number makes a cash forecast link from week to week?
- [ ] Total income for the year
- [x] Each week's opening cash equals the previous week's closing cash
- [ ] The average monthly profit
Why: Linking closing cash to the next week's opening cash is what turns a list of numbers into a running forecast.
:::

## Steps

1. **Create the sheet.** New Google Sheet called "Cash forecast." Put the 13 Monday dates starting this week in B1 to N1, and the row labels from Lesson 4 in column A.

2. **Build the formulas.** Open Gemini in the side panel and use the formula prompt from Lesson 4. No Gemini? Paste the same request into Claude or ChatGPT and copy the formulas in. Test by typing 1,000 into a cash-in cell and checking that closing cash and the next week's opening cash both change.

3. **Add the warning.** Set your minimum buffer in row 21 (a number you'd feel uneasy dropping below). Ask Gemini to highlight closing cash cells below the buffer in red, or use Format, Conditional formatting.

4. **Fill cash in.** Using your AR aging file, put each open invoice in the week you expect it to be paid, based on that client's history. Using the sample business? Use the sample file from Exercise 3 and assume clients pay 10 days after the due date on average.

5. **Fill cash out.** From your Expense log and bank export, list recurring costs in the right weeks. Add owner pay, a tax set-aside line, and any quarterly estimated tax payment that falls in the next 13 weeks. Optional: run the Cowork input-gathering prompt from Lesson 4 to produce these tables, then check its assumptions before pasting.

6. **Chart it.** Insert a line chart of closing cash and minimum buffer. If Gemini inserted it, remember it won't update when your data changes, so rebuild it with Insert, Chart.

7. **Run the late-payer scenario.** Duplicate the tab as "Late payer," move your largest expected payment four weeks later, and ask Gemini (or check yourself) which weeks fall below the buffer.

8. **Write the Monday note.** In A23: "Lowest point: $X in week of Y. Action: Z." Pick a real action if the late-payer case dips below the buffer.

9. **Book the habit.** Add a recurring 10-minute Monday event, "Update cash forecast."

## Done when

- [ ] The sheet has 13 weekly columns, and opening cash links to the prior week's closing cash
- [ ] Cash in uses expected pay dates, not invoice due dates
- [ ] Taxes and owner pay are included in cash out
- [ ] A Late payer tab exists, and you know which weeks (if any) fall below your buffer
- [ ] The Monday note names the lowest point and one action

:::coached
**For 1-on-1 coaching clients.** Make the forecast decision-ready.

1. Add a third scenario: your best realistic month (a new client starts in week 3).
2. Compare your forecast for the past four weeks against what actually happened, and note the biggest miss.
3. Write your cash rules: buffer amount, when you'd delay a purchase, when you'd talk to your bank about credit.

**Bring to your session:** the forecast with three scenarios, your forecast-vs-actual note, and your cash rules.

**Your coach will:**
- Check your assumptions on timing of cash in and taxes
- Stress-test the plan with one more "what if"
- Agree on the one number you'll watch each Monday
:::
