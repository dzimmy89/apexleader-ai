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

## Warm-up

:::checkpoint
Q: Your agent finds you paid a freelance designer $2,400 by bank transfer in 2026, and there's no W-9 on file. What's the best next step?
- [ ] Have the agent email the designer and ask for their tax ID
- [x] Email the designer yourself for a W-9, store it privately, and confirm the 1099-NEC need with your accountant
- [ ] Skip it, since 1099s are the designer's responsibility
Why: W-9s carry tax ID numbers, so you collect and store them yourself. Your accountant confirms whether a 1099-NEC is required.
:::

## Steps

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
