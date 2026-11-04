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

:::video
id: acct-ex4-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-accounting/acct-ex4-setup.mp4
captions: /learn/video/ai-accounting/acct-ex4-setup.vtt
poster: /learn/video/ai-accounting/acct-ex4-setup.jpg
transcript: Thirteen columns, one link, and a Monday note that names your lowest week. Let's build your forecast. In this exercise you'll build a thirteen-week cash forecast with Gemini's help. Create the sheet, with thirteen Monday dates across the top and the row labels from the lesson. Have Gemini, Claude or ChatGPT write the formulas, then test them: type one thousand into a cash-in cell, and check that closing cash and next week's opening cash both change. Set a minimum buffer, and turn the weeks below it red. Fill cash in by expected pay date, and cash out with recurring costs, owner pay and taxes. Chart it. Then copy the tab, move your largest payment four weeks later, and write one line: the lowest point, which week, and one action. So: which week is your tightest, and what will you do about it? Pause here and build it.
:::

## Warm-up

:::checkpoint
Q: Which number makes a cash forecast link from week to week?
- [ ] Total income for the year
- [x] Each week's opening cash equals the previous week's closing cash
- [ ] The average monthly profit
Why: Linking closing cash to the next week's opening cash is what turns a list of numbers into a running forecast.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to a 13-week forecast
shows: Seven numbered steps: 1 Sheet, 2 Formulas, tested, 3 Buffer in red, 4 Cash in by pay date (highlighted), 5 Cash out with taxes, 6 Late payer tab, 7 Monday note.
data: none
image: /learn/figures/ai-accounting/exercise-04-fig-1.webp
alt: Seven steps: create the sheet with 13 weeks; write and test the formulas; set a buffer and turn low weeks red; fill cash in by expected pay date; fill cash out including taxes and owner pay; add a late payer tab; and write the Monday note.
:::

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

:::example
title: See an example result
Here is the first forecast for the sample business, Rolling Ledger, for the 13 weeks starting Monday, November 9, 2026.

:::video
id: acct-ex4-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-accounting/acct-ex4-reveal.mp4
captions: /learn/video/ai-accounting/acct-ex4-reveal.vtt
poster: /learn/video/ai-accounting/acct-ex4-reveal.jpg
transcript: For Rolling Ledger, the base case stays above the buffer, and one late client changes that. Here's the example. The forecast starts the week of November ninth with six thousand, two hundred dollars of opening cash, and a minimum buffer of three thousand. Monthly client fees arrive by card every week. The big unknown is a one-time catch-up project for a three-truck client: twelve hundred dollars, expected the week of December seventh. In the base case, the lowest point is three thousand, six hundred dollars, the week of December twenty-eighth, when the annual software renewals land. In the late-payer tab, that twelve hundred dollars moves to the week of January fourth. Now two weeks drop below the buffer: twenty-eight fifty on December twenty-first, and twenty-four hundred on December twenty-eighth. The Monday note says: ask for a fifty percent deposit on the next catch-up project, and move the four-hundred-dollar printer to February.
:::

:::infographic
id: fig-2
type: chart
title: Rolling Ledger forecast: base and late payer
shows: Under "Rolling Ledger, 13 weeks" tagged example: paired bars of closing cash for the weeks of Dec 7 to Jan 4, base case and late payer, against a $3,000 buffer line. Base lowest $3,600 (Dec 28). Late payer drops to $2,850 (Dec 21) and $2,400 (Dec 28), both below the buffer, then recovers on Jan 4.
data: example numbers: buffer $3,000; base low $3,600; late payer $2,850 and $2,400
image: /learn/figures/ai-accounting/exercise-04-fig-2.webp
alt: Example Rolling Ledger forecast with a $3,000 minimum buffer. The base case lowest point is $3,600 in the week of December 28. In the late payer case, a $1,200 project payment moves four weeks later and closing cash drops to $2,850 on December 21 and $2,400 on December 28, below the buffer, before recovering in the week of January 4.
:::

```text
CASH FORECAST INPUTS (example, Rolling Ledger)
Weeks: 13 Mondays from Nov 9, 2026
Opening cash: $6,200 (bank feed, Nov 9)
Minimum buffer: $3,000
Cash in:  24 clients x $149 a month, about $825 a week by card
          Catch-up project for a 3-truck client: $1,200, expected week of Dec 7
          (this client pays about 10 days after the due date)
Cash out: owner draw $2,000, first week of each month
          software $180 a month, plus $900 of annual renewals, week of Dec 28
          contractor $300 a month
          tax set-aside 25% of cash in, moved to tax savings every week
          Q4 estimated tax, Jan 15, paid from tax savings
```

| Week of | Base case closing cash | Late payer closing cash |
|---|---|---|
| Dec 7 | $4,500 | $3,300 |
| Dec 14 | $4,300 | $3,100 |
| Dec 21 | $4,050 | $2,850 (below buffer) |
| Dec 28 | $3,600 (lowest) | $2,400 (below buffer, lowest) |
| Jan 4 | $3,950 | $3,950 |

```text
A23: Lowest point: $2,400 in week of Dec 28 (late payer). Action: ask for a 50% deposit
on the next catch-up project, and move the $400 printer purchase to February.
Calendar: "Update cash forecast", Mondays, 10 minutes, recurring.
```
:::

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
