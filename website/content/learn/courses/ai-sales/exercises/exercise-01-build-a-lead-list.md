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

:::video
id: sales-ex1-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-sales/sales-ex1-setup.mp4
captions: /learn/video/ai-sales/sales-ex1-setup.vtt
poster: /learn/video/ai-sales/sales-ex1-setup.jpg
transcript: One profile, one sheet, and twenty-five prospects you can defend. Let's build your first lead list. In this exercise you'll write your customer profile and turn it into a scored list. Write one sentence: I help who, with what problem, so they can reach what outcome. Fill in the five-part profile and a why-now line. Create a sheet with twelve columns, from business name to date added. Run the research prompt for thirty matches. Paste the table in, then open the sources for five random rows. If two or more are wrong, tighten the prompt and rerun. Score each row as fit plus signal. Delete the excluded rows, sort by score, and keep the top twenty-five. Finally, add an empty do-not-contact tab. So: does every row trace back to a source the business published? Pause here and build your list.
:::

## Warm-up

:::checkpoint
Q: Which of these is the best "why now" signal for a dog grooming salon prospect?
- [ ] They have a website
- [x] They announced a second location last month
- [ ] They have more than 100 Google reviews
Why: A "why now" signal is a recent change that creates a need. A new location means more transactions, more staff and messier books.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: From profile to 25 prospects
shows: Six numbered steps down the frame: 1 Profile (five parts plus why now), 2 Sheet (12 columns), 3 Research (30 matches, sources), 4 Spot-check 5 rows (2 wrong means rerun), 5 Score and trim (keep the top 25), 6 Do-not-contact tab. Step 4 highlighted.
data: none
image: /learn/figures/ai-sales/exercise-01-fig-1.webp
alt: Six steps: write the five-part profile with a why-now line; create a 12-column sheet; research 30 sourced matches; spot-check 5 rows and rerun if 2 or more are wrong; score and keep the top 25; and add a do-not-contact tab.
:::

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

:::example
title: See an example result
Here is the first lead list for the sample business, Groomer Books. The businesses below are made up for this example; your list will hold real, sourced businesses.

:::video
id: sales-ex1-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-sales/sales-ex1-reveal.mp4
captions: /learn/video/ai-sales/sales-ex1-reveal.vtt
poster: /learn/video/ai-sales/sales-ex1-reveal.jpg
transcript: For Groomer Books, thirty matches became twenty-five prospects, and not one guessed email. Here's the example. The profile targets independent groomers in Austin and Denver, with one to ten staff. The researcher returned thirty rows. Three were franchises, marked exclude. The spot-check opened five rows. One listed an owner email that didn't appear on the salon's own site, so it became unknown. One wrong out of five passes the check. That left twenty-seven rows to score. Six scored five, eleven scored four, eight scored three, and two scored two. The two lowest were cut, leaving twenty-five. Four of them have no public email, so the sheet uses their contact form instead. Every row is marked new, and the do-not-contact tab is ready for exercise two.
:::

:::infographic
id: fig-2
type: comparison
title: Groomer Books: 30 found, 25 kept
shows: Under "Groomer Books lead list" tagged example: a column of counts. 30 found, minus 3 franchises marked EXCLUDE, gives 27 scored. A score bar: 6 at 5, 11 at 4, 8 at 3, 2 at 2 (cut). Result: 25 kept, all Status New, 4 using a contact form.
data: example numbers: 30 found, 3 excluded, 27 scored (6, 11, 8, 2), 25 kept, 4 contact forms
image: /learn/figures/ai-sales/exercise-01-fig-2.webp
alt: Example Groomer Books lead list: the researcher found 30 businesses, 3 were franchises and excluded, and 27 were scored: 6 scored 5, 11 scored 4, 8 scored 3 and 2 scored 2. The 2 lowest were cut, leaving 25, all marked New, with 4 using a contact form because they publish no email.
:::

**Offer sentence:** I help independent dog groomers with monthly bookkeeping so they can stop dreading tax season.

**Profile:** independent salons and mobile groomers in Austin, TX and Denver, CO, 1 to 10 staff, one or two locations, booking-only websites, owner does admin. Exclude franchises, vet clinics and pet stores. **Why now:** a new location, a hiring post, or a price change on their site.

| Business name (example) | City | Contact | Why-now signal | Fit | Signal | Score | Status |
|---|---|---|---|---|---|---|---|
| Sample Salon A | Austin | Published contact email | Second location opening next month | 3 | 2 | 5 | New |
| Sample Mobile Groomer B | Denver | Contact form only | Hiring a second groomer | 3 | 1 | 4 | New |
| Sample Salon C | Austin | unknown (owner email not on its site) | New package prices posted | 2 | 1 | 3 | New |
| Sample Franchise D | Denver | - | EXCLUDE: franchise | - | - | - | Removed |

**How the list got to 25:**

| Step | Rows |
|---|---|
| Researcher returned | 30 |
| Marked EXCLUDE (franchises) and removed | 3 |
| Spot-check of 5 rows | 1 wrong email, changed to unknown (passes: fewer than 2 wrong) |
| Scored | 27: six 5s, eleven 4s, eight 3s, two 2s |
| Cut the two lowest | 2 |
| **Kept** | **25, Status New, 4 using a contact form** |

The "Do not contact" tab is in place and empty, ready for Exercise 2.
:::

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
