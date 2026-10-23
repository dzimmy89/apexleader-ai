---
module: 1
lesson_number: 4
course: google-gemini
template: v2
---

# Exercise 4: Build Your Inbox-to-Tracker Workflow

:::key-concept
You'll use Gemini inside Gmail, Docs and Sheets to build three working assets: a lead tracker with AI-labeled inquiries, a set of reply drafts, and a client welcome guide. At the end, customer messages flow from your inbox into a sheet you can act on.
:::

**Time:** 30 minutes · **You'll need:** Gmail, Docs and Sheets with Gemini (Workspace business plan or Google AI Plus/Pro), your Customer FAQ from Exercise 3 · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Gemini drafts a perfect-looking reply that includes a price. What do you do before sending?
- [ ] Send it; Gemini read the thread
- [x] Check the price against your price list and edit if needed, then send
- [ ] Delete the price and send without it, always
Why: Gemini can get numbers wrong. Anything that leaves the business, especially prices and dates, gets your review.
:::

## Steps

1. **Create the tracker.** Open a new Google Sheet called "Lead Tracker," open the Gemini side panel and ask:

```text
Create a lead tracker with columns: date, name, email, business, message, category, status (dropdown: new, replied, call booked, won, lost), next step.
```

2. **Fill it.** Paste 10 to 20 recent inquiries from Gmail into the message column. No real inquiries yet? Ask Gemini: "Write 15 realistic inquiries a [your customer] might send to [your business], varied in tone and topic," and use those.
3. **Label with the AI function.** In the category column (assume messages are in column E), enter and fill down:

```text
=AI("Classify this inquiry as one of: pricing question, booking request, complaint, partnership, other. Reply with the category only.", E2)
```

4. **Spot-check.** Read five rows. Fix any wrong labels by hand and note the error type.
5. **Summarize.** Ask in the side panel: "Count inquiries by category and tell me the top two things people ask about."
6. **Draft replies in Gmail.** Open two real or sample inquiries. Use Gemini's writing help with your Customer FAQ open:

```text
Reply using the facts from my Customer FAQ. Answer their question first, then suggest a 15-minute call with two time options next week. Under 120 words.
```

Edit each draft. Save as drafts; don't send unless it's a real customer and you've checked every fact.
7. **Write a welcome guide in Docs.** New Doc, then:

```text
Using @Business Profile and @Customer FAQ, draft a one-page welcome guide for a new client: what happens in week 1, what I need from you, how to reach me, what's not included.
```

Edit it until you'd be happy sending it.

## Done when

- [ ] A "Lead Tracker" sheet with 10+ rows labeled by the AI function, five spot-checked
- [ ] A short summary of the top two inquiry themes
- [ ] Two reply drafts in Gmail that you've edited
- [ ] A one-page client welcome guide in Docs

:::coached
**For 1-on-1 coaching clients.** Make it run every week:

1. Write a skill (or saved prompt) that turns a new inquiry into a tracker row plus a reply draft.
2. Add a "days since contact" column and a formula that flags leads older than 3 days.
3. Review your last 30 days of real inquiries in the tracker and find the one question you should answer on your website.

**Bring to your session:** your tracker (shared view access), your edited drafts, and the welcome guide.

**Your coach will:**
- Check your labels and categories against how you actually sell
- Review the reply drafts for tone and missing next steps
- Help you decide which parts become a background task in Exercise 5
:::
