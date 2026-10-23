---
module: 1
lesson_number: 1
course: ai-marketing
template: v2
---

# Lesson 1: A 30-Day Content Calendar

:::key-concept
A content calendar is the job description for your marketing department. If you give your AI tools a clear audience, a few content pillars and a fixed weekly rhythm, they can fill 30 days of posts in an afternoon, and every later step in this course (the bot, the newsletter, the ads) runs off that one sheet.
:::

## What you'll be able to do

- Turn your brand kit and offer into three to five content pillars your audience actually cares about
- Pick a posting rhythm you can keep for 30 days without burning out
- Have Claude draft a full 30-day calendar in a spreadsheet, with a status column your agents will use later
- Review the calendar in one sitting and approve, edit or cut each row

## Why this matters

Most solo founders market in bursts: three posts in a good week, then nothing for a month. Buyers notice the silence, and search engines and AI assistants find less to cite. A calendar fixes the rhythm problem. It also gives your marketing agents something specific to work from. An agent told "post about our business" makes generic noise. An agent told "Tuesday, pillar 2, a 120-word LinkedIn post on the three receipts dog groomers lose most often, status: approved" does useful work.

## Start from what you already have

You built a brand kit in Brand in a Day: voice rules, words you use and avoid, colors and a one-paragraph positioning statement. That kit is the first input. The second input is your offer, the thing people buy. The third is your customer: who they are, what keeps them up at night and where they spend time online.

If you don't have a business yet, use the sample business for this whole course: **Groomer Books**, a monthly bookkeeping service for independent dog groomers. The owner is one person. Customers are mobile and salon groomers who hate paperwork and dread tax season.

Put all three inputs into a Claude Project (or a ChatGPT project, or a Gemini Gem) so every conversation starts with the same context. Then ask for pillars.

```text
You are my head of content. Use the brand kit, offer and customer notes in this project.

Propose 4 content pillars for the next 30 days. For each pillar give:
- the customer problem it speaks to, in the customer's own words
- 3 example post ideas
- which channel it suits best (LinkedIn, Instagram, X, our blog, our newsletter)
- how it leads, gently, toward our offer

Rules: no hype words, no claims we can't back up, no tax or legal advice
stated as fact. Flag anything that would need an accountant's review.
```

Keep the pillars that sound like your real customers talking. Cut any that sound like a marketing textbook. For Groomer Books, good pillars might be "money mistakes groomers make," "tax season without panic," "behind the scenes of running a grooming business" and "client stories."

## Choose a rhythm you can keep

The right cadence is the one you can approve every week. AI can draft 100 posts. You still have to read them, and anything that leaves the business needs your click. A realistic starting point for one founder:

| Channel | Per week | Who drafts | Who approves |
|---|---|---|---|
| Main social channel (pick one) | 3 posts | Claude or your Marketing Bot | You |
| Second channel (optional) | 2 repurposed posts | Same draft, reformatted | You |
| Blog or long-form article | 1 | Claude, from your notes | You |
| Newsletter | 1 (Lesson 5) | Newsletter agent | You |

That is roughly 25 to 30 pieces a month, and about 45 minutes of review each week once the system runs. If that feels like a lot, start with one channel and the blog. Consistency beats volume.

## Generate the calendar as a spreadsheet

Ask for the calendar as a table you can paste into Google Sheets or Excel. The columns matter more than the content right now, because later lessons depend on them. The **Status** column is how your Marketing Bot will know what it may touch: it only schedules rows marked `approved`.

```text
Build a 30-day content calendar starting Monday [date] as a table with these columns:
Date | Day | Channel | Pillar | Working title | Hook (first line) | Format
(text, carousel, short video, article) | Call to action | Source or proof
needed | Status

Use the pillars we agreed. Follow this rhythm: [your weekly rhythm].
Every 4th post should point to our offer. Mark every row Status = draft.
In "Source or proof needed", say what fact or example I must supply,
so nothing gets invented.
```

Paste the result into a new sheet called `Content Calendar` and freeze the header row. Add a column called `Notes` for your edits. Share the sheet only with the accounts that need it. Later, your Marketing Bot gets its own login with access to this one sheet, not your whole Drive.

:::try-it
Open Claude or ChatGPT right now and paste: "Give me 10 post hooks for [your customer] about [their biggest problem], each under 15 words, written the way they'd say it to a friend." Mark the three you'd actually post. That gut check is the same one you'll use on the full calendar.
:::

## Review in one sitting

Block 45 minutes. Go row by row and do one of three things: change the status to `approved`, edit and then approve, or delete the row. Check four things:

1. **Is it true?** Every claim needs a source you can name. If the "Source or proof needed" cell is empty and the post makes a claim, fix it.
2. **Does it sound like you?** Read the hook out loud. If you wouldn't say it, rewrite it.
3. **Is it safe?** No customer names without permission, no client numbers, nothing that reads as tax or legal advice.
4. **Does it earn attention?** Each post should teach, show or prove one thing.

Then ask Claude to fill the gaps you created.

```text
I cut rows 4, 11 and 19 and changed pillar 3 to "behind the scenes." Refill those
dates with posts that fit the new pillar. Keep everything else unchanged.
Return only the new rows.
```

:::warning
A calendar is a plan, not permission. Nothing on it gets published until you mark it approved, and even then your Marketing Bot schedules it for your final click (Lesson 3). Never paste client data, login details or bank information into the project you use for content.
:::

## Repurpose instead of inventing

The fastest way to fill a month is to make one strong idea do four jobs. Each weekly article becomes three social posts and one newsletter section. A client story becomes a carousel, a short video script and a quote for your site. Ask for this explicitly:

```text
Take this week's article (pasted below) and produce:
- 3 LinkedIn posts, each with a different hook, under 150 words
- 1 Instagram carousel outline, 6 slides, one sentence per slide
- 1 newsletter paragraph that links to the article
Keep the facts exactly as written. Do not add statistics.
```

Repurposing also helps with AI search, which is the subject of the next lesson: the same clear answer, repeated across your site and channels, is easier for assistants to find and cite.

:::checkpoint
Q: Your 30-day calendar is drafted. Your Marketing Bot is ready to schedule posts. Which rows should it be allowed to schedule?
- [ ] Every row, since you can delete posts after they go live
- [x] Only rows you have marked approved, and still with your final click before anything publishes
- [ ] Rows in the pillars you like best, chosen by the bot
Why: The status column is the approval gate. Anything that leaves the business needs a human decision, and deleting a live post does not undo who already saw it.
:::

:::takeaways
- Pillars come from your customer's real problems, not from a list of marketing topics
- Pick a cadence you can review every week; one channel done well beats four done badly
- The calendar's Status column is the rule your agents follow: only approved rows move
- Repurpose one strong idea into several formats instead of inventing 30 new ones
:::

## Go deeper

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) - why clear, text-first content helps you show up in AI Overviews and AI Mode
- [ContentStudio: We gave Grok Bot five social media jobs](https://contentstudio.io/blog/can-grok-run-social-media) - a hands-on test of AI agents doing research, drafting and scheduling with human sign-off
