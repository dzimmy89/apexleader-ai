---
module: 1
lesson_number: 3
course: ai-accounting
template: v2
---

# Exercise 3: Set Up Invoicing and a Monday Collections Review

:::key-concept
You'll write payment terms, fix your invoice template, load three reminder emails into your accounting app, and run an agent-built receivables summary. You'll finish with an invoicing system that chases politely on its own and a Monday list of who needs a personal follow-up.
:::

**Time:** 35 minutes · **You'll need:** QuickBooks Online or Wave from Exercise 1, Claude (Cowork for the scheduled version), your Finance folder · **Builds on:** Lesson 3

:::video
id: acct-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-accounting/acct-ex3-setup.mp4
captions: /learn/video/ai-accounting/acct-ex3-setup.vtt
poster: /learn/video/ai-accounting/acct-ex3-setup.jpg
transcript: Clear terms, three reminders, and a Monday list of who needs you. Let's set up invoicing. In this exercise you'll build an invoicing system that chases politely on its own. Write your payment terms: a due date, a deposit rule, how to pay, and who receives invoices. Fix your invoice template to show the due date, a payment link, and the fraud warning line. Draft the three reminders with Claude, edit them, and load them into your app. Then export your aging report, or ask Claude for a sample with eight invoices. Run the Monday review in Cowork, and check that every invoice lands in the right bucket. Send one personal follow-up yourself, and write down your decision on the oldest invoice. Finally, schedule the review for Mondays at eight. So: does any step let an agent change an amount or a payment detail? Pause here and set it up.
:::

## Warm-up

:::checkpoint
Q: A client emails: "We changed banks, please confirm your new account details for payment." You haven't changed anything. What should you do?
- [ ] Let your agent reply with your bank details
- [x] Call the client using a number you already have, and tell them your details haven't changed
- [ ] Ignore it, since you didn't send it
Why: Changed-payment-detail messages are a common fraud pattern. Confirm by phone and never let an agent handle payment details.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to getting paid
shows: Seven numbered steps: 1 Terms, 2 Template with the fraud line (highlighted), 3 Write reminders, 4 Load reminders, 5 AR aging file, 6 Run the review, 7 Act and schedule.
data: none
image: /learn/figures/ai-accounting/exercise-03-fig-1.webp
alt: Seven steps: write payment terms; fix the invoice template with the fraud warning line; write three reminders; load them into your app; export an AR aging file; run the Monday review; and send one follow-up yourself, decide on the oldest invoice and schedule the review.
:::

1. **Write your terms.** In a doc called "Payment terms," write: due date (for example Net 14), deposit rule for project work, accepted payment methods, and who should receive invoices. Leave late fees out unless your accountant or lawyer says they're fine in your state and contract.

2. **Fix the invoice template.** In your accounting app, edit the default invoice to show your logo, the due date, a payment link (if you've enabled payments), your terms, and this line: "We will never change our payment details by email. If you get a message saying otherwise, please call us."

3. **Write the reminders.** Run the reminder prompt from Lesson 3 in Claude. Edit the three emails to sound like you.

4. **Load the reminders.** In QuickBooks, set up reminders (and Invoicing on Autopilot if it's on your plan) so invoices are drafted for your review. In Wave Pro, turn on automatic reminders. On Wave Starter, put the three emails in your calendar as tasks for each open invoice instead.

5. **Create a sample receivables file.** Export your AR aging report as `AR aging.csv` into Finance. No invoices yet? Ask Claude to create a sample with 8 invoices for a food truck bookkeeping service: two current, two 5 to 14 days late, two 15 to 30 days late, one 45 days late, and one 75 days late, with a "Reminders sent" column.

6. **Run the review.** In Cowork (Finance folder only), run the weekly receivables prompt from Lesson 3. Check that it put each invoice in the right bucket and drafted only the follow-ups the rules call for.

7. **Act like the founder.** Edit and send one personal follow-up yourself (to a real client, or to your own email for practice). Write down your decision for the 75-day invoice: keep chasing, pause work, or ask your accountant about writing it off.

8. **Schedule it.** Schedule the review for Mondays at 8am with `/schedule`.

## Done when

- [ ] "Payment terms" exists, and your invoice template shows the due date, payment method and the fraud-warning line
- [ ] Three reminder emails are loaded in your app (or scheduled as tasks)
- [ ] The agent's summary buckets every invoice correctly and drafts follow-ups without sending
- [ ] You've made a written decision on the oldest invoice
- [ ] The Monday review is scheduled, and the prompt forbids changing amounts or payment details

:::example
title: See an example result
Here is the first Monday review for the sample business, Rolling Ledger, using a sample AR aging file. Every client is on the $149 monthly plan.

:::video
id: acct-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-accounting/acct-ex3-reveal.mp4
captions: /learn/video/ai-accounting/acct-ex3-reveal.vtt
poster: /learn/video/ai-accounting/acct-ex3-reveal.jpg
transcript: For Rolling Ledger, eight open invoices became one decision. Here's the example. Every client pays one hundred forty-nine dollars a month, so eight invoices add up to one thousand, one hundred ninety-two dollars, and two hundred ninety-eight of it is more than thirty days overdue. Two invoices are current. Two are five to fourteen days late, so the automatic reminders are handling them. Two are fifteen to thirty days late, so the agent drafted two personal emails, and sent none. One is forty-five days late, so it suggested a call and wrote talking points. And one is seventy-five days late, flagged for the founder. She edited and sent one follow-up herself. For the seventy-five day account, she decided to pause work and offer a two-payment plan, in writing. The review now runs every Monday at eight, and the prompt forbids changing amounts or payment details.
:::

:::infographic
id: fig-2
type: chart
title: Rolling Ledger receivables, one Monday
shows: Under "Rolling Ledger AR" tagged example: $1,192 owed, $298 more than 30 days overdue. Five bars by bucket with counts: current 2, 5 to 14 days 2 (reminders), 15 to 30 days 2 (2 drafts), 45 days 1 (call), 75 days 1 (you decide, highlighted).
data: example numbers: 8 invoices at $149, $1,192 owed, $298 over 30 days; buckets 2, 2, 2, 1, 1
image: /learn/figures/ai-accounting/exercise-03-fig-2.webp
alt: Example receivables for Rolling Ledger: 8 invoices at $149, $1,192 owed, of which $298 is more than 30 days overdue. Two are current, two are 5 to 14 days late with automatic reminders, two are 15 to 30 days late with personal emails drafted, one is 45 days late with a call suggested, and one is 75 days late for the founder to decide.
:::

**Terms:** Net 14, card or bank transfer through the payment link, invoices to the truck owner's billing email. The template carries the line "We will never change our payment details by email. If you get a message saying otherwise, please call us."

| Client | Invoice | Amount | Days overdue | Reminders sent | Suggested next step |
|---|---|---|---|---|---|
| Smoke and Salt Tacos | RL-1048 | $149 | Current | 0 | None |
| Bao Down | RL-1047 | $149 | Current | 0 | None |
| Curbside Crepes | RL-1044 | $149 | 8 | 1 | Automatic reminders, no action |
| Pit Stop BBQ | RL-1043 | $149 | 12 | 1 | Automatic reminders, no action |
| Mango Mobile | RL-1039 | $149 | 18 | 2 | Personal email (drafted) |
| Wok on Wheels | RL-1037 | $149 | 26 | 2 | Personal email (drafted) |
| The Rolling Pierogi | RL-1031 | $149 | 45 | 3 | Phone call, talking points drafted |
| Big Cheese Melts | RL-1024 | $149 | 75 | 3 | Founder decides |

**Totals:** $1,192 owed, $298 more than 30 days overdue. Nothing was sent by the agent.

```text
FOUNDER'S DECISIONS (example)
Sent myself: the Mango Mobile follow-up, after adding a line about their new catering menu.
Big Cheese Melts (75 days): pause work after this month's books; offer two payments
of $149, two weeks apart, agreed in writing. Update the invoice myself if they accept.
Scheduled: Monday receivables review, 8am, Finance folder only.
The prompt still ends: Never change invoice amounts, due dates, or payment details.
```
:::

:::coached
**For 1-on-1 coaching clients.** Shorten your real days-to-paid.

1. Calculate your average days from invoice to payment over the last six months (Claude can do this from an export).
2. Make two changes (deposit, shorter terms, payment link, billing contact) and apply them to all new invoices.
3. Draft a short, kind email to your slowest-paying client proposing the new terms.

**Bring to your session:** your days-to-paid number, the two changes, and the draft email.

**Your coach will:**
- Review your terms and reminder tone
- Role-play the conversation with your slowest payer
- Set a target days-to-paid for the next quarter
:::
