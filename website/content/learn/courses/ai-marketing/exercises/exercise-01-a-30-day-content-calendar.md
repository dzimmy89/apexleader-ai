---
module: 1
lesson_number: 1
course: ai-marketing
template: v2
---

# Exercise 1: Build and Approve Your First 30-Day Calendar

:::key-concept
You'll turn your brand kit and offer into four content pillars and a 30-day calendar in a spreadsheet, reviewed and marked up by you. At the end you'll have a sheet with a Status column that every later exercise in this course reads from.
:::

**Time:** 40 minutes · **You'll need:** Claude (or ChatGPT/Gemini), Google Sheets or Excel, your brand kit from Brand in a Day · **Builds on:** Lesson 1

:::video
id: mkt-ex1-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-marketing/mkt-ex1-setup.mp4
captions: /learn/video/ai-marketing/mkt-ex1-setup.vtt
poster: /learn/video/ai-marketing/mkt-ex1-setup.jpg
transcript: Thirty days of posts, one sheet, and a Status column that you control. Let's build it. In this exercise you'll build and approve your first content calendar. Set up a Marketing project with your brand kit, your offer and a short customer profile. Ask Claude for four pillars, and keep the three or four that sound like your customers. Write your rhythm in one line, like LinkedIn on Monday, Wednesday and Friday, plus a blog article on Thursday. Generate the calendar with ten columns, every row as draft. Move it into a sheet, then review it in one pass: approve, edit, or delete. Refill the gaps, and repurpose week one's article into three posts and a newsletter paragraph. So: how many rows can you honestly approve, and does every claim have a source? Pause here and build your calendar.
:::

## Warm-up

:::checkpoint
Q: Claude drafts a post saying "Food truck owners lose an average of $4,000 a year to missed deductions." You have no source for that number. What do you do?
- [ ] Post it, since AI tools are usually right about numbers
- [x] Cut the number or replace it with a fact you can source, and note the source in the calendar
- [ ] Soften it to "about $4,000" and post it
Why: AI tools can invent plausible numbers. Anything you publish is your claim, so every figure needs a source you can name.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: From project to approved calendar
shows: Six numbered steps down the frame: 1 Project (brand kit, offer, customer), 2 Pillars (keep 3 or 4), 3 Rhythm (one line), 4 Calendar (10 columns, all draft), 5 Review (approve, edit or delete), 6 Approved rows (at least 12, each sourced). Step 5 highlighted.
data: none
image: /learn/figures/ai-marketing/exercise-01-fig-1.webp
alt: Six steps: set up the project with your brand kit, offer and customer; get 3 or 4 pillars; write your rhythm in one line; generate a 10-column calendar with every row as draft; review each row; and finish with at least 12 approved rows, each with a source.
:::

1. **Set up your project.** Create a Claude Project (or a ChatGPT project or Gemini Gem) called `Marketing`. Upload your brand kit, a one-paragraph description of your offer and a short customer profile. No business yet? Use **Rolling Ledger**: monthly bookkeeping for independent food truck owners, $149 a month, run by one founder, customers who hate paperwork and fear tax season.

2. **Get your pillars.** Paste this prompt:

   ```text
   You are my head of content. Using the files in this project, propose 4 content
   pillars for the next 30 days. For each: the customer problem in their words,
   3 post ideas, the best channel, and how it leads toward our offer. No hype words.
   Flag anything that would need an accountant's or lawyer's review.
   ```

   Keep three or four pillars. Rewrite any that don't sound like your customers.

3. **Pick your rhythm.** Choose one main channel and decide posts per week (three is a good start). Add one weekly article if you have a blog. Write it down in one line, for example: "LinkedIn Mon/Wed/Fri, blog article Thursday."

4. **Generate the calendar.** Paste:

   ```text
   Build a 30-day content calendar starting Monday [date]. Columns:
   Date | Day | Channel | Pillar | Working title | Hook | Format | Call to action |
   Source or proof needed | Status
   Rhythm: [your rhythm]. Every 4th post points to our offer. Status = draft on
   every row. In "Source or proof needed", say what fact or example I must supply.
   Return a table only.
   ```

5. **Move it into a sheet.** Paste into Google Sheets or Excel. Name the tab `Content Calendar`, freeze the header row, and add a `Notes` column. Set sharing to you only for now.

6. **Review in one pass.** For each row: approve, edit then approve, or delete. Check that it is true, sounds like you, is safe (no client names, no advice stated as fact) and teaches or shows one thing. Change Status to `approved` on the keepers.

7. **Fill the gaps.** Ask Claude to replace the rows you deleted, giving it the row numbers and any pillar changes. Review the new rows the same way.

8. **Repurpose week one.** Take your first article idea and ask for three social posts and one newsletter paragraph from it. Add them to the sheet as `draft`.

## Done when

- [ ] Your sheet has 30 days of rows with all ten columns plus Notes
- [ ] At least 12 rows are marked `approved` and every approved claim has a source noted
- [ ] No row names a real client or states tax or legal advice as fact
- [ ] Your weekly rhythm is written at the top of the sheet or in your project notes

:::example
title: See an example result
Here is the first calendar for the sample business, Rolling Ledger, after one review pass. The rows are examples; yours will follow your own rhythm and pillars.

:::video
id: mkt-ex1-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-marketing/mkt-ex1-reveal.mp4
captions: /learn/video/ai-marketing/mkt-ex1-reveal.vtt
poster: /learn/video/ai-marketing/mkt-ex1-reveal.jpg
transcript: For Rolling Ledger, thirty days became twenty-one rows, and fifteen of them earned approval. Here's the example. The rhythm is LinkedIn on Monday, Wednesday and Friday, plus a blog article every Thursday. Over thirty days, that's thirteen posts and four articles: seventeen rows. The four pillars are money mistakes food truck owners make, tax season without panic, behind the scenes, and client stories. The review took forty minutes. Ten rows were approved as written, and three more after edits. Four were deleted: one quoted a four-thousand-dollar figure with no source, and one named a real client. Claude refilled those four rows, and two of the new ones were approved. Then week one's article became three LinkedIn posts and a newsletter paragraph, all still draft. That's fifteen approved rows, and six drafts waiting for next week's review.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger calendar after review
shows: Under "Rolling Ledger calendar" tagged example: a large 21 rows, split into a bar of 15 approved (10 as written, 3 after edits, 2 refills) and 6 draft (2 refills, 4 repurposed). A note: 4 rows deleted and refilled, review took 40 minutes.
data: example numbers: 17 planned rows, 21 total, 15 approved, 6 draft, 4 deleted, 40 minutes
image: /learn/figures/ai-marketing/exercise-01-fig-2.webp
alt: Example Rolling Ledger calendar after one review: 21 rows, 15 approved (10 as written, 3 after edits and 2 refills) and 6 still draft (2 refills and 4 repurposed pieces). Four rows were deleted and refilled, and the review took 40 minutes.
:::

**Rhythm:** LinkedIn Monday, Wednesday and Friday, blog article Thursday. Over 30 days that is 13 posts and 4 articles, so 17 rows.

**Pillars:** money mistakes food truck owners make, tax season without panic, behind the scenes of running a food truck, client stories.

| Day | Channel | Pillar | Working title | Source or proof needed | Status |
|---|---|---|---|---|---|
| Mon | LinkedIn | Money mistakes | The fuel and commissary receipts trucks lose most often | Founder's own client notes, no names | approved |
| Wed | LinkedIn | Tax season | What to gather in January so April is boring | IRS Schedule C instructions | approved (edited) |
| Thu | Blog | Tax season | A food truck owner's year-end checklist | IRS Schedule C instructions | approved |
| Fri | LinkedIn | Behind the scenes | How I close a client's month in 40 minutes | Founder's own process | approved |
| Mon | LinkedIn | Money mistakes | Food truck owners lose $4,000 a year to missed deductions | None found | deleted |
| Wed | LinkedIn | Client stories | (named a real truck) | No permission | deleted |

**After the review:**

| Result | Rows |
|---|---|
| Approved as written | 10 |
| Edited, then approved | 3 |
| Deleted and refilled by Claude | 4 (2 refills approved, 2 still draft) |
| Repurposed from week one's article (3 LinkedIn posts, 1 newsletter paragraph) | 4, all draft |
| **Total** | **21 rows: 15 approved, 6 draft** |

The review took 40 minutes. Every fourth row points to the $149-a-month offer, and every approved claim has a source in its row.
:::

:::coached
**For 1-on-1 coaching clients.** Build the calendar for your own business, then stress-test it:

1. Pull your last 90 days of posts (or a competitor's if you have none) and ask Claude which three performed best and why. Use that to reweight your pillars.
2. Add a `Goal` column (awareness, trust, lead) and make sure each week has at least one lead-focused post with a clear next step.
3. Draft week one in full, final copy ready to post, and note how long your review took.

**Bring to your session:** your calendar sheet, your pillar list, week one's final copy and your review time.

**Your coach will:**
- Pressure-test your pillars against what your buyers actually ask about
- Mark the three posts most likely to produce a lead and tighten their calls to action
- Help you set a review rhythm you can keep for 30 days
:::
