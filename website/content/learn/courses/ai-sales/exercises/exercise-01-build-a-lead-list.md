---
module: 1
lesson_number: 1
course: ai-sales
template: v2
---

# Exercise 1: Build Your First 25-Prospect Lead List

:::key-concept
You'll write a one-page customer profile and turn it into a Google Sheet of 25 scored, sourced prospects. Every later exercise in this course (outreach, CRM, call prep, proposals) runs on this sheet.
:::

**Time:** 40 minutes · **You'll need:** A Google account, an AI assistant with web search (Claude, ChatGPT or Gemini) · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: Which of these is the best "why now" signal for a dog grooming salon prospect?
- [ ] They have a website
- [x] They announced a second location last month
- [ ] They have more than 100 Google reviews
Why: A "why now" signal is a recent change that creates a need. A new location means more transactions, more staff and messier books.
:::

## Steps

1. **Pick your business.** Use your own, or the sample business for this course: a monthly bookkeeping service for independent dog groomers, run by one founder. Write one sentence at the top of a new Google Doc called "ICP": "I help [who] with [problem] so they can [outcome]."

2. **Fill in the five-part profile** under that sentence: Who, Where, Size signal, Pain signal, Disqualifier. Add a "Why now" line with two or three recent events that make a prospect more likely to buy.

3. **Create the sheet.** Make a Google Sheet called "Lead list" with these columns in row 1:

```text
Business name | City | Website | Contact email or form URL | Contact name | Why-now signal | Source URLs | Fit (1-3) | Signal (0-2) | Score | Status | Date added
```

4. **Run the research prompt.** Paste this into your AI assistant, filling in your profile:

```text
You are my sales research assistant. Find 30 businesses that match this profile.
[paste your five-part profile and Why now line]

Return a table with exactly these columns:
Business name | City | Website | Contact email or form URL | Contact name | Why-now signal | Source URLs

Rules:
- Use only information the business published itself or reputable public directories.
- Write "unknown" for anything you cannot confirm. Never guess an email address.
- No personal phone numbers or home addresses. Do not use LinkedIn data.
- Keep franchises or disqualified businesses in the table with "EXCLUDE" in the Why-now column.
```

5. **Paste and spot-check.** Paste the table into your sheet. Open the source links for five random rows. Fix or mark "unknown" anything that doesn't match. If two or more of the five are wrong, tighten your prompt (for example, "only list a contact email if it appears on the business's own contact page") and rerun.

6. **Score.** Fill Fit and Signal for each row by hand, or try Gemini's AI function in the Fit column if your plan includes it:

```text
=AI("Rate fit from 1 (poor) to 3 (strong) for [your offer] based on this row. Reply with the number only.", A2:F2)
```

Set Score to `=H2+I2` and fill down. Override any AI score you disagree with.

7. **Trim to 25.** Delete EXCLUDE rows, sort by Score, keep the top 25. Set Status to "New" and fill Date added.

8. **Add a "Do not contact" tab.** Leave it empty for now. Your Sales Bot will check it before every draft from Exercise 2 on.

## Done when

- [ ] Your ICP doc has a one-sentence offer, a five-part profile and a "Why now" line
- [ ] Your Lead list sheet has 25 rows, each with at least one source URL
- [ ] No row has a guessed email; unconfirmed contacts say "unknown"
- [ ] Every row has a Score and Status "New"
- [ ] A "Do not contact" tab exists

:::coached
**For 1-on-1 coaching clients.** Do this on your real business, with a sharper target.

1. Write two competing ICPs (for example, two different customer types) and build a 15-row list for each.
2. Add a column "Evidence of pain" with a direct quote or detail from each prospect's own site or reviews.
3. Pick the ICP you'd bet on for the next 90 days and write three sentences on why.

**Bring to your session:** both lists, your ICP docs, and your choice with its reasoning.

**Your coach will:**
- Pressure-test your ICP choice against your offer and pricing
- Review ten rows for source quality and "why now" strength
- Help you set the weekly volume target your outreach will start at
:::
