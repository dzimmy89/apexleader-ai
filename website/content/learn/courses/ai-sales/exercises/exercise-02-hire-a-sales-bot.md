---
module: 1
lesson_number: 2
course: ai-sales
template: v2
---

# Exercise 2: Hire Your Sales Bot and Approve Five Drafts

:::key-concept
You'll write your Sales Bot's job description and approval rules, check your email domain's basics, add a compliant footer, and approve your first five outreach drafts. At the end you'll have a working draft-and-approve outreach system and an Outreach queue sheet.
:::

**Time:** 40 minutes · **You'll need:** Your Lead list sheet from Exercise 1, a business email on your own domain, Grok Bot access (or Claude, ChatGPT or another agent) · **Builds on:** Lesson 2

:::video
id: sales-ex2-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-sales/sales-ex2-setup.mp4
captions: /learn/video/ai-sales/sales-ex2-setup.vtt
poster: /learn/video/ai-sales/sales-ex2-setup.jpg
transcript: One Bot, one queue, and five drafts that wait for your click. Let's hire your Sales Bot. In this exercise you'll set it up and approve its first work. Add an Outreach queue tab to your lead list. Write your compliant footer once: your name, your business, a postal address, and an opt-out line. Check your domain's SPF, DKIM and DMARC. Create the Bot with a written job and a clear stopping point: drafted, never sent. Share only the lead list with the Bot's own account, and add an Ask first rule for every send. Then run it once. It should produce five drafts and stop. Review each like an editor: click the sources, and mark it approved, edit, or rejected, with a note. Teach the Bot your edits. Then send the approved drafts yourself, one at a time, from your own email. So: could this Bot reach a prospect without you? Pause here and hire it.
:::

## Warm-up

:::checkpoint
Q: Which email does CAN-SPAM cover?
- [ ] Only marketing email sent to consumers
- [x] Commercial email, including business-to-business
- [ ] Only email sent to more than 5,000 people a day
Why: The FTC's guide says the law makes no exception for business-to-business email. The 5,000-a-day line is Google and Yahoo's bulk-sender threshold, a different rule.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to hire a Sales Bot
shows: Seven numbered steps: 1 Outreach queue, 2 Footer, 3 Domain basics, 4 Create the Bot, 5 Lock it down (highlighted), 6 Run and review, 7 Send yourself.
data: none
image: /learn/figures/ai-sales/exercise-02-fig-1.webp
alt: Seven steps. 1. Outreach queue: a tab in the lead list. 2. Footer: name, address, opt-out. 3. Domain basics: SPF, DKIM, DMARC. 4. Create the Bot: drafted, never sent. 5. Lock it down: own login, Ask first. 6. Run and review: 5 drafts, a note each. 7. Send yourself: approved ones only.
:::

1. **Add the Outreach queue.** In your Lead list workbook, add a tab called "Outreach queue" with columns:

```text
Business name | Contact email | Source of email | Draft subject | Draft body | Status (Drafted/Approved/Edit/Rejected) | My notes | Date
```

2. **Write your compliant footer.** Create it once and reuse it in every draft:

```text
[Your name], [Business name]
[Valid postal address: street, PO box or registered private mailbox]
Not interested? Reply "no thanks" and I won't email again.
```

3. **Check your domain basics.** Ask Claude or ChatGPT: "My business email is on [Google Workspace / Microsoft 365 / other] with the domain [yourdomain.com]. Walk me through checking whether SPF, DKIM and DMARC are set up, step by step, in plain language." Use a free DNS lookup tool or your domain host's DNS page to confirm each one. Write Yes or No for each in a note. If any is No, fix it before sending anything.

4. **Create the Bot.** In Grok Bot, click **+** to create a Bot named "Sales Bot." If you don't have Grok Bot, use a Claude Project or a ChatGPT Dot with the same text. Paste your job description, based on Lesson 2's template. Make sure it includes:
   - Its one job and where it reads leads from
   - The five-rows-a-day limit and Score threshold
   - "Check the Do not contact tab before drafting"
   - Your footer, your voice notes, and "Never send. Never use LinkedIn."

5. **Lock it down.** Share only the Lead list workbook with the Bot's own Google account. In Grok Bot, go to **Settings → General → Auto-review** and add an **Ask first** rule for sending any email or message. Write these rules in a note so you can show them later.

6. **Run it once.** Ask the Bot: "Do today's run now." It should produce five drafts in the Outreach queue and stop.

7. **Review like an editor.** For each draft, click the source of the email and the personal detail. Mark each Approved, Edit or Rejected, with a short note. Edit at least one draft yourself.

8. **Teach it.** Tell the Bot: "Read my notes and edits in the Outreach queue and remember what I changed for future drafts."

9. **Send the approved ones yourself**, from your own email, one at a time. Update Status in the Lead list to "Contacted."

## Done when

- [ ] Your Bot has a written job description with a clear stopping point (drafted, never sent)
- [ ] An Ask first rule (or equivalent) blocks any send without your approval
- [ ] SPF, DKIM and DMARC are each confirmed Yes, or you have a fix in progress and have not sent yet
- [ ] Five drafts are reviewed, each with a status and note, all with the postal address and opt-out line
- [ ] You sent only the approved drafts, from your own email

:::example
title: See an example result
Here is the first Sales Bot run for the sample business, Rolling Ledger, using the 25-row lead list from Exercise 1.

:::video
id: sales-ex2-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-sales/sales-ex2-reveal.mp4
captions: /learn/video/ai-sales/sales-ex2-reveal.vtt
poster: /learn/video/ai-sales/sales-ex2-reveal.jpg
transcript: For Rolling Ledger, five drafts became four sends, and the Bot sent none of them. Here's the example. The domain check found one gap: DKIM wasn't turned on in Google Workspace. The founder turned it on and added a DMARC record at p equals none before sending anything. SPF was already fine. The Bot took the five top leads with a score of four or five, confirmed each email on the truck's own website, and drafted five first emails under a hundred and twenty words. Three were approved as written. One was edited: the question was too big, so it became a single yes or no. And one was rejected, because it quoted a menu item from an old review site. The founder sent the four approved drafts by hand, and those leads now say contacted. Her edits went back to the Bot: never cite review sites for personal details.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger Sales Bot, first five
shows: Under "Rolling Ledger outreach" tagged example: domain checks SPF yes, DKIM fixed, DMARC added. Five draft cards: 3 approved, 1 edited, 1 rejected (old review site). Footer: 4 sent by the founder, 0 by the Bot.
data: example numbers: 5 drafts, 3 approved, 1 edited, 1 rejected, 4 sent
image: /learn/figures/ai-sales/exercise-02-fig-2.webp
alt: Example first run for Rolling Ledger: SPF was already set, DKIM was turned on and DMARC added before sending. Of five drafts, 3 were approved, 1 edited and 1 rejected for quoting an old review site. The founder sent 4 by hand and the Bot sent none.
:::

| Lead | Personal detail (source) | Decision | Note |
|---|---|---|---|
| Curbside Crepes, Austin | New second truck on their site, Oct 2026 | Approved | |
| Pit Stop BBQ, Denver | Hiring a line cook (their careers page) | Approved | |
| Mango Mobile, Austin | Catering menu added (their site) | Approved | |
| Wok on Wheels, Denver | Hiring a cashier (their site) | Edit | Question too big; now a single yes or no |
| The Rolling Pierogi, Denver | Menu item from an old review site | Rejected | Personal details only from their own site |

```text
FOOTER (every draft)
[Founder's name], Rolling Ledger, PO Box 4410, Austin, TX 78765
Not interested? Reply 'no thanks' and I won't email again.

DOMAIN CHECK (rollingledger.com, Google Workspace)
SPF: Yes   DKIM: was off -> turned on   DMARC: added, p=none
Sent: 4 approved drafts, by hand from the founder's own inbox, one at a time.
Lead list Status: Contacted (4). Note to the Bot: never cite review sites for personal details.
```
:::

:::coached
**For 1-on-1 coaching clients.** Build a two-touch sequence on your real list.

1. Add a second draft type: a short follow-up the Bot prepares 4 business days after a first email with no reply.
2. Run the Bot for five days and track: drafts produced, approved without edits, edited, rejected.
3. Write down the three edits you made most often and add them to the Bot's job description.

**Bring to your session:** your Outreach queue, the approval stats, and the updated job description.

**Your coach will:**
- Review five drafts for tone, specificity and compliance
- Check your Bot's permissions and approval rules for gaps
- Help you decide when (and whether) to raise daily volume
:::
