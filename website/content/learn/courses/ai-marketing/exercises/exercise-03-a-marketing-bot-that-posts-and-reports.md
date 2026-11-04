---
module: 1
lesson_number: 3
course: ai-marketing
template: v2
---

# Exercise 3: Hire Your Marketing Bot

:::key-concept
You'll write the Marketing Bot's job description and access list, set up its scoped logins, and run its first draft-and-queue job and weekly brief. At the end you'll have a Bot (or a ready-to-paste spec if you don't have Grok Bot access yet) that works only from approved calendar rows.
:::

**Time:** 40 minutes · **You'll need:** Grok Bot access through a Cursor or SuperGrok plan (or Dots/Duet as a fallback), a scheduling tool with approval workflow, your content calendar from Exercise 1 · **Builds on:** Lesson 3

:::video
id: mkt-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-marketing/mkt-ex3-setup.mp4
captions: /learn/video/ai-marketing/mkt-ex3-setup.vtt
poster: /learn/video/ai-marketing/mkt-ex3-setup.jpg
transcript: One Bot, three logins, and a may-not list it can't talk its way around. Let's hire your Marketing Bot. In this exercise you'll set it up, run it once, and schedule it. Write an access table: every tool, the account the Bot uses, its role, and whether it can publish. That last column must say no. Create a marketing email for the Bot, give it a draft-only scheduler seat, and share one calendar sheet. Create the Bot, paste the job description, and keep the may-not list intact. Add Ask first rules. When it reaches a login, take over and type the password yourself. Then run the daily job once, and check every queued draft against the sheet, word for word. Get the first brief, open two of its links, and confirm the numbers. Then save the skills and the two routines. So: can any role you gave it publish? Pause here and hire your Bot.
:::

## Warm-up

:::checkpoint
Q: You run a Marketing Bot and an Expense Bot on the same Grok Bot account. The Expense Bot is logged into your bank's website. What is true?
- [ ] The Marketing Bot can't see the bank session because Bots are separate
- [x] The Marketing Bot could reach the bank session too, because all Bots share one computer and its logins
- [ ] It doesn't matter as long as Auto-review is on
Why: SpaceXAI's docs say the isolation boundary is your account, not the Bot. Keep money tools off any account that runs a public-facing Bot.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to hire a Marketing Bot
shows: Seven numbered steps: 1 access table, 2 smaller logins, 3 create the Bot, 4 Ask first rules (highlighted), 5 sign in with Takeover, 6 run it once by hand, 7 brief, skills and routines.
data: none
image: /learn/figures/ai-marketing/exercise-03-fig-1.webp
alt: Seven steps: write an access table; create smaller logins; create the Bot with its job; add Ask first rules; sign in yourself through Takeover; run the daily job once and check every draft; and get the brief, then save skills and routines.
:::

1. **List the access.** Write a table: Tool | Account the Bot uses | Role | Can publish? (must be No) | How you'll revoke it. Include your scheduler, the calendar sheet and read-only analytics. Nothing else.

2. **Create the logins.** Set up a marketing email address for the Bot. Invite it to your scheduler with a draft or contributor role and turn on the scheduler's approval workflow. Share only the `Content Calendar` sheet with it. Give it viewer access to analytics.

3. **Create the Bot.** In Grok Bot, create a Bot named `Marketing Bot`. Paste the job description from Lesson 3, filled in with your tools, time zone and channels. Keep the "You may not" list intact.

4. **Set Auto-review.** Under Settings, then General, then Auto-review, add Ask first rules for publishing, sending messages, replying, deleting, purchasing and changing account settings. Check the current docs if the menu has moved.

5. **Sign in safely.** When the Bot reaches a login, use Takeover (or the secure request form) to enter the password and any two-factor code yourself. Never paste a password into the chat.

6. **Run it once by hand.** Make sure your calendar has at least three `approved` rows in the next three days. Then ask:

   ```text
   Run your daily job once now. Queue the next 3 days of approved rows as drafts
   in [scheduler]. Do not publish. Then show me what you queued and the sheet rows
   you changed.
   ```

   Check each draft in the scheduler against the sheet word for word.

7. **Get the first brief.** Ask the Bot to produce the weekly brief using the format in Lesson 3, with a link for every number. Open two of the links and confirm the numbers match.

8. **Save and schedule.** Ask it to save the daily job and the brief as skills, then create two routines (weekdays 8:00 AM, Mondays 9:00 AM). Use Test run on each. No Grok Bot access yet? Save the job description, access table and brief format in your `Marketing` project as your spec.

## Done when

- [ ] Your access table lists every tool, and no role can publish, send or spend
- [ ] Three approved posts are queued as drafts awaiting your click, matching the sheet exactly
- [ ] You have one weekly brief with linked sources, and you spot-checked two numbers
- [ ] Both routines exist and passed a Test run (or your spec is saved and ready)

:::example
title: See an example result
Here is the Marketing Bot setup for the sample business, Rolling Ledger, after its first hand run.

:::video
id: mkt-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-marketing/mkt-ex3-reveal.mp4
captions: /learn/video/ai-marketing/mkt-ex3-reveal.vtt
poster: /learn/video/ai-marketing/mkt-ex3-reveal.jpg
transcript: For Rolling Ledger, the Bot's first run queued three posts, and published none. Here's the example. The access table has four lines: a Buffer contributor seat that needs approval, editor access to one calendar sheet, a viewer role on LinkedIn page analytics, and a viewer role in Google Analytics. Every can-publish cell says no. The first hand run found three approved rows in the next three days, Monday, Wednesday and Friday, and queued all three as drafts. Each matched the sheet word for word, and all three rows now say queued. The first brief covered four posts: twelve hundred forty reach, thirty-eight clicks and nine comments. The best performer was how I close a client's month in forty minutes, with twenty-two clicks. The founder opened two linked numbers, and both matched. Both routines passed a test run: weekdays at eight, and Mondays at nine.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger Marketing Bot, first run
shows: Under "Rolling Ledger Marketing Bot" tagged example: an access table of four tools, every Can publish cell No. Beside it, the first run: 3 drafts queued, 0 published, and the brief: 1,240 reach, 38 clicks, 9 comments.
data: example numbers: 4 logins; 3 queued, 0 published; 1,240 reach, 38 clicks, 9 comments
image: /learn/figures/ai-marketing/exercise-03-fig-2.webp
alt: Example Marketing Bot for Rolling Ledger: four logins, none able to publish. The first run queued 3 drafts and published nothing. The first weekly brief reported 1,240 reach, 38 clicks and 9 comments.
:::

| Tool | Account the Bot uses | Role | Can publish? | How to revoke |
|---|---|---|---|---|
| Buffer | marketing@rollingledger.com | Contributor, posts need approval | No | Remove the seat in Buffer |
| Content Calendar sheet | marketing@rollingledger.com | Editor on this one file | No | Remove sharing on the sheet |
| LinkedIn page analytics | marketing@rollingledger.com | Analyst (view only) | No | Remove the page role |
| Google Analytics | marketing@rollingledger.com | Viewer | No | Remove the user |

**First hand run:** three approved rows (Monday, Wednesday, Friday) queued as Buffer drafts. All three matched the sheet word for word, and their Status now says `queued`.

```text
WEEKLY BRIEF (first one, week of Oct 26)
1. Published: 4 LinkedIn posts. Reach 1,240, clicks 38, comments 9 (linked to LinkedIn analytics)
2. Best: "How I close a client's month in 40 minutes" (22 clicks). Worst: "What to
   gather in January" (3 clicks): posted on a Friday evening.
3. Calendar health: 9 approved rows in the next 14 days, 1 row needs info (no link)
4. AI visibility: no change since the November 2 check
5. Recommendations (needs your decision): move tax posts to Tuesday mornings; add a
   link to the answer page in the Wednesday post; write the missing link for Nov 13
Founder's spot-check: reach and clicks both matched LinkedIn analytics.
Routines: daily queue, weekdays 8:00 AM; weekly brief, Mondays 9:00 AM. Both passed Test run.
```
:::

:::coached
**For 1-on-1 coaching clients.** Run the Bot on your real channels for a week:

1. Add a second channel and a reformatting rule for it (length, hashtags, link placement).
2. Add an event-driven check: when a post gets a comment, the Bot drafts a suggested reply in the conversation for you, and never posts it.
3. Keep a log of every correction you made to the Bot's work during the week.

**Bring to your session:** your access table, the week's queued drafts, two weekly briefs and your correction log.

**Your coach will:**
- Review your access table and Auto-review rules for gaps
- Turn your correction log into new lines in the Bot's job description
- Decide with you whether the Bot has earned any more scope
:::
