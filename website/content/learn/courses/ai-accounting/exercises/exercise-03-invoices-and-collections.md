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

## Warm-up

:::checkpoint
Q: A client emails: "We changed banks, please confirm your new account details for payment." You haven't changed anything. What should you do?
- [ ] Let your agent reply with your bank details
- [x] Call the client using a number you already have, and tell them your details haven't changed
- [ ] Ignore it, since you didn't send it
Why: Changed-payment-detail messages are a common fraud pattern. Confirm by phone and never let an agent handle payment details.
:::

## Steps

1. **Write your terms.** In a doc called "Payment terms," write: due date (for example Net 14), deposit rule for project work, accepted payment methods, and who should receive invoices. Leave late fees out unless your accountant or lawyer says they're fine in your state and contract.

2. **Fix the invoice template.** In your accounting app, edit the default invoice to show your logo, the due date, a payment link (if you've enabled payments), your terms, and this line: "We will never change our payment details by email. If you get a message saying otherwise, please call us."

3. **Write the reminders.** Run the reminder prompt from Lesson 3 in Claude. Edit the three emails to sound like you.

4. **Load the reminders.** In QuickBooks, set up reminders (and Invoicing on Autopilot if it's on your plan) so invoices are drafted for your review. In Wave Pro, turn on automatic reminders. On Wave Starter, put the three emails in your calendar as tasks for each open invoice instead.

5. **Create a sample receivables file.** Export your AR aging report as `AR aging.csv` into Finance. No invoices yet? Ask Claude to create a sample with 8 invoices for a dog-grooming bookkeeping service: two current, two 5 to 14 days late, two 15 to 30 days late, one 45 days late, and one 75 days late, with a "Reminders sent" column.

6. **Run the review.** In Cowork (Finance folder only), run the weekly receivables prompt from Lesson 3. Check that it put each invoice in the right bucket and drafted only the follow-ups the rules call for.

7. **Act like the founder.** Edit and send one personal follow-up yourself (to a real client, or to your own email for practice). Write down your decision for the 75-day invoice: keep chasing, pause work, or ask your accountant about writing it off.

8. **Schedule it.** Schedule the review for Mondays at 8am with `/schedule`.

## Done when

- [ ] "Payment terms" exists, and your invoice template shows the due date, payment method and the fraud-warning line
- [ ] Three reminder emails are loaded in your app (or scheduled as tasks)
- [ ] The agent's summary buckets every invoice correctly and drafts follow-ups without sending
- [ ] You've made a written decision on the oldest invoice
- [ ] The Monday review is scheduled, and the prompt forbids changing amounts or payment details

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
