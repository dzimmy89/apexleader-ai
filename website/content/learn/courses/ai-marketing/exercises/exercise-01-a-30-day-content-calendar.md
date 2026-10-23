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

## Warm-up

:::checkpoint
Q: Claude drafts a post saying "Groomers lose an average of $4,000 a year to missed deductions." You have no source for that number. What do you do?
- [ ] Post it, since AI tools are usually right about numbers
- [x] Cut the number or replace it with a fact you can source, and note the source in the calendar
- [ ] Soften it to "about $4,000" and post it
Why: AI tools can invent plausible numbers. Anything you publish is your claim, so every figure needs a source you can name.
:::

## Steps

1. **Set up your project.** Create a Claude Project (or a ChatGPT project or Gemini Gem) called `Marketing`. Upload your brand kit, a one-paragraph description of your offer and a short customer profile. No business yet? Use **Groomer Books**: monthly bookkeeping for independent dog groomers, $149 a month, run by one founder, customers who hate paperwork and fear tax season.

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
