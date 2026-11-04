---
module: 1
lesson_number: 5
course: ai-accounting
template: v2
---

# Exercise 5: Assemble Your Year-End Tax Packet

:::key-concept
You'll build a tax folder, a contractor and W-9 tracker, a tax calendar, and an agent-assembled draft packet with a "Questions for my accountant" document. You'll finish with everything your accountant needs except the facts only you can supply. This is general information, not tax advice.
:::

**Time:** 35 minutes · **You'll need:** Claude Cowork with your Finance folder, a year-to-date Profit and Loss export from your accounting app (or the sample data from earlier exercises), your calendar · **Builds on:** Lesson 5

:::video
id: acct-ex5-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-accounting/acct-ex5-setup.mp4
captions: /learn/video/ai-accounting/acct-ex5-setup.vtt
poster: /learn/video/ai-accounting/acct-ex5-setup.jpg
transcript: One folder, one tracker, one calendar, and a list of questions. Let's assemble your tax packet. In this exercise you'll build everything your accountant needs, except the facts only you can supply. This is general information, not tax advice. Create three folders: the packet, a private W-9 folder, and Reports. Export a year-to-date profit and loss and balance sheet. Run the contractor check, and write yourself a task for every missing W-9. The agent contacts no one. Ask Claude for the federal tax dates, and put each on your calendar with a one-week reminder, marked confirm with accountant. Run the packet prompt, and check that the summary totals match your profit and loss. Fill in your blanks, add two or three questions of your own, and check that no tax ID or account number is anywhere in the packet. So: what's left that only you can answer? Pause here and build your packet.
:::

## Warm-up

:::checkpoint
Q: Your agent finds you paid a freelance designer $2,400 by bank transfer in 2026, and there's no W-9 on file. What's the best next step?
- [ ] Have the agent email the designer and ask for their tax ID
- [x] Email the designer yourself for a W-9, store it privately, and confirm the 1099-NEC need with your accountant
- [ ] Skip it, since 1099s are the designer's responsibility
Why: W-9s carry tax ID numbers, so you collect and store them yourself. Your accountant confirms whether a 1099-NEC is required.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to a tax packet
shows: Seven numbered steps: 1 Folders, 2 Reports, 3 Contractor check (highlighted), 4 Tax calendar, 5 Assemble the packet, 6 Your facts and questions, 7 Privacy check.
data: none
image: /learn/figures/ai-accounting/exercise-05-fig-1.webp
alt: Seven steps: create the packet, W-9 and Reports folders; export a profit and loss and balance sheet; run the contractor check and request missing W-9s yourself; put tax dates on your calendar; assemble the packet; add your facts and questions; and check that nothing sensitive is in it.
:::

1. **Create the folders:** `Finance/Tax/2026 packet`, `Finance/Tax/W-9` (private), and `Finance/Reports`.

2. **Export reports.** From QuickBooks or Wave, export a year-to-date Profit and Loss and Balance Sheet as PDF into `Finance/Reports`. Using the sample business? Ask Claude to build a simple sample P&L from your Expense log and AR files.

3. **Run the contractor check.** Use the W-9 prompt from Lesson 5 in Cowork. Review the list. For anyone flagged, write yourself a task to request a W-9 (don't let the agent contact them).

4. **Build your tax calendar.** Ask Claude:

```text
I'm a US [sole proprietor / single-member LLC owner] in [state].
List the general federal tax dates I should have on my calendar for the next 12 months: quarterly estimated payments, 1099-NEC deadline, and the individual return deadline.
Mark each as "confirm with my accountant." Don't include state dates you're unsure of; tell me to ask instead.
```

Add each date to your calendar with a one-week-ahead reminder, labeled "confirm with accountant."

5. **Assemble the packet.** Run the year-end packet prompt from Lesson 5 in Cowork. Review Summary.xlsx: do income and expense totals match your P&L?

6. **Fill your blanks.** Open "Questions for my accountant" and add the facts only you know: home office square footage, business mileage, health insurance premiums, retirement contributions. Write "none" where it doesn't apply.

7. **Add your own questions.** Run the "explain Schedule SE" prompt from Lesson 5 and add two or three questions you want answered.

8. **Check privacy.** Make sure no SSNs, full account numbers or W-9 contents are in the packet or in any chat. Plan to share it through your accountant's secure portal.

## Done when

- [ ] The 2026 packet folder holds P&L, Balance Sheet, Summary.xlsx and the questions doc
- [ ] A contractor list shows totals and W-9 status, and you've requested any missing W-9s yourself
- [ ] Federal tax dates are on your calendar, each marked "confirm with accountant"
- [ ] Your personal facts are filled in, and nothing sensitive was pasted into a chat
- [ ] No step had an agent file, pay or contact anyone

:::example
title: See an example result
Here is the finished packet for the sample business, Rolling Ledger, for tax year 2026. Thresholds and dates are general information; the founder confirms each with her accountant.

:::video
id: acct-ex5-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-accounting/acct-ex5-reveal.mp4
captions: /learn/video/ai-accounting/acct-ex5-reveal.vtt
poster: /learn/video/ai-accounting/acct-ex5-reveal.jpg
transcript: For Rolling Ledger, the packet is ready, and the founder supplied the facts only she knows. Here's the example. The contractor check found three people. A freelance designer was paid two thousand, four hundred dollars by bank transfer, with no W-9, so the founder emailed her for one. A virtual assistant was paid eighteen hundred dollars, under the threshold, with a W-9 on file. A developer was paid thirty-two hundred dollars by card, which the card company usually reports, so that's a question for the accountant. Five federal dates went on the calendar, from January fifteenth to September fifteenth, each marked confirm with accountant. The summary matched the profit and loss on income. Expenses were off by twelve dollars: one bank fee missing from the log, now added. The questions document lists six items, including a twenty-six-hundred-fifty-dollar laptop that might be equipment. And the privacy check found no tax IDs or account numbers.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger 2026 packet
shows: Under "Rolling Ledger 2026" tagged example: a contractor list of three (designer $2,400 by transfer, W-9 requested, highlighted; assistant $1,800, W-9 on file; developer $3,200 by card, ask the accountant). Beside it three counts: 5 tax dates on the calendar, 6 questions, $12 fixed in the summary. Footer: no tax IDs in the packet.
data: example numbers: contractors $2,400, $1,800 and $3,200; 5 dates; 6 questions; $12 difference
image: /learn/figures/ai-accounting/exercise-05-fig-2.webp
alt: Example 2026 packet for Rolling Ledger. Three contractors: a designer paid $2,400 by bank transfer with a W-9 requested, an assistant paid $1,800 with a W-9 on file, and a developer paid $3,200 by card, a question for the accountant. Five federal tax dates are on the calendar, the questions document lists six items, a $12 difference in the summary was fixed, and no tax IDs are in the packet.
:::

| Contractor | Paid in 2026 | How | W-9 on file | Flag |
|---|---|---|---|---|
| Lopez Design (logo and menu templates) | $2,400 | Bank transfer | No | Yes: founder emailed for a W-9 herself |
| Virtual assistant | $1,800 | Bank transfer | Yes | No: under $2,000 |
| Developer (client portal) | $3,200 | Card | Not checked | Ask the accountant: likely reported by the card company |

```text
TAX CALENDAR (each marked "confirm with accountant", reminder one week ahead)
Jan 15, 2027  Q4 2026 estimated tax payment
Jan 31, 2027  1099-NEC to contractors and the IRS (moves if it falls on a weekend)
Apr 15, 2027  Individual return, and Q1 2027 estimated payment
Jun 15, 2027  Q2 estimated payment
Sep 15, 2027  Q3 estimated payment

QUESTIONS FOR MY ACCOUNTANT (6)
1. Laptop, $2,650 (Mar 4): equipment or a regular expense?
2. Meals: $640 total. Which rule applies to coffee meetings with truck owners?
3. Two transactions still marked Unsure: $48 (Jun 2) and $120 (Aug 19).
4. Udemy course paid on a personal card: reimburse myself or record it another way?
5. Home office: 120 sq ft of a 1,100 sq ft apartment, used only for work. Does it qualify?
6. Should I look at retirement accounts or an S corp election for 2027?
My facts: business mileage 1,840 (log attached), health insurance premiums $4,320,
retirement contributions none.
Privacy check: no SSNs, tax IDs, W-9 contents or full account numbers. Shared through
the accountant's secure portal.
```
:::

:::coached
**For 1-on-1 coaching clients.** Get ahead of next year, not just this one.

1. Have Claude estimate (for discussion only) what share of this year's profit went to taxes, using your P&L and the estimated payments you made.
2. List three changes for next year to raise with your accountant (for example, retirement account, entity choice, estimated payment amounts).
3. Prepare a one-page brief for your accountant meeting with your top questions.

**Bring to your session:** your packet, your questions doc, and the one-page brief.

**Your coach will:**
- Review the packet for completeness before it goes to your accountant
- Help you prioritize the questions worth paid accountant time
- Set up your quarterly back-office review rhythm for next year
:::
