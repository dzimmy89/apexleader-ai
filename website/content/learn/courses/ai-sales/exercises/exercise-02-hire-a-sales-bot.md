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

## Warm-up

:::checkpoint
Q: Which email does CAN-SPAM cover?
- [ ] Only marketing email sent to consumers
- [x] Commercial email, including business-to-business
- [ ] Only email sent to more than 5,000 people a day
Why: The FTC's guide says the law makes no exception for business-to-business email. The 5,000-a-day line is Google and Yahoo's bulk-sender threshold, a different rule.
:::

## Steps

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
