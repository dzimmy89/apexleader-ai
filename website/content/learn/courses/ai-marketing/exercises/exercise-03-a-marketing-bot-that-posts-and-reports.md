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

## Warm-up

:::checkpoint
Q: You run a Marketing Bot and an Expense Bot on the same Grok Bot account. The Expense Bot is logged into your bank's website. What is true?
- [ ] The Marketing Bot can't see the bank session because Bots are separate
- [x] The Marketing Bot could reach the bank session too, because all Bots share one computer and its logins
- [ ] It doesn't matter as long as Auto-review is on
Why: SpaceXAI's docs say the isolation boundary is your account, not the Bot. Keep money tools off any account that runs a public-facing Bot.
:::

## Steps

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
