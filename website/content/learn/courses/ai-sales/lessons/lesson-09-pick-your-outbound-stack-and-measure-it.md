---
module: 2
lesson_number: 9
course: ai-sales
template: v2
---

# Lesson 9: Pick Your Outbound Stack and Measure It

:::video
id: sales-l9-overview
kind: overview
status: paused
src: /learn/video/ai-sales/sales-l9-overview.mp4
captions: /learn/video/ai-sales/sales-l9-overview.vtt
poster: /learn/video/ai-sales/sales-l9-overview.jpg
transcript: Adding tools is easy. Knowing which one is working is not. This is AI Sales, lesson nine: pick your outbound stack and measure it. In this lesson: compare the three tools, write a one-page plan, tag every lead with its channel, build a Friday scorecard, and give every channel a verdict. You now have three ways to do outbound. A Sales Bot that drafts while you send. Origami, running sequences with approval. And Explee, running on a capped budget. Each one gets one row in your plan: a tool, who sends, a daily cap, a lead source and a stop rule. No lead sits in two cold channels at once. Every lead carries a source that's never overwritten. And every Friday, an agent summarizes the scorecard, and you decide: keep, fix or stop. First, the comparison.
:::

:::key-concept
You now have three ways to do outbound: a Sales Bot that drafts while you send, Origami running sequences with approval, and Explee running on a capped budget. Each channel gets one tool, one owner and one daily cap, and every week the same five numbers per channel tell you what to keep, fix or stop.
:::

## What you'll be able to do

- Match each outbound job to the right tool, using a simple comparison
- Write a one-page outbound plan with a tool, an owner and a cap for every channel
- Tag leads by channel so your CRM can tell where each one came from
- Build a Friday scorecard and use it to decide what changes next week

## Why this matters

Adding tools is easy. Knowing which one is working is not. Without a plan, a solo founder ends up with three tools sending to overlapping lists, no idea which channel produced the one good call, and a monthly bill for all of them. One page and one scorecard fix that, and they plug straight into the Monday operating rhythm you'll build in the Capstone.

## Step 1: Compare the three tools

| | Sales Bot (Lesson 2) | Origami (Lessons 6 and 7) | Explee (Lesson 8) |
|---|---|---|---|
| What it does | Drafts from your sheet; you send | Finds leads, runs email and LinkedIn sequences | Finds, writes, sends and follows up by itself |
| Channels | Email (you send) | Email and LinkedIn | Email only |
| Sends from | Your inbox, by hand | Your inboxes or ones it sets up; your LinkedIn profile | Explee's mailboxes |
| Approval | Always | Optional; turn it on | Autopilot on by default; turn it off |
| Cost model | Your AI plan | Monthly plan | Per email sent, daily cap |
| Best for | Few, high-value leads in your own voice | Local or niche buyers; a list you own | Quickly testing whether a new audience responds |
| Main risk | Slow | LinkedIn account restriction; credit spend | Sending before you've checked anything |

A sensible starting stack for Rolling Ledger: Origami builds the list and runs the email sequence; the Sales Bot drafts personal notes for the top 10 leads each week; Explee is used only to test one new audience at a time; X is run the same way as email, with bots finding and drafting and you sending.

:::infographic
id: fig-1
type: comparison
title: Three outbound tools
shows: Three columns: Sales Bot (drafts, you send; few high-value leads; risk: slow), Origami (sequences with approval; local or niche buyers; risk: LinkedIn, credits), Explee (sends by itself on a cap; testing new audiences; risk: sending unchecked).
data: none
image: /learn/figures/ai-sales/lesson-09-fig-1.webp
alt: Three outbound tools: the Sales Bot drafts and you send, best for a few high-value leads, at the risk of being slow; Origami runs sequences with approval, best for local or niche buyers, at the risk of LinkedIn restrictions and credit spend; Explee finds, writes and sends on a capped budget, best for testing a new audience, at the risk of sending before you check.
:::

## Step 2: One channel, one owner, one cap

Write a one-page outbound plan. For each channel, fill one row:

```text
Channel | Tool | Who sends (me or tool with approval) | Daily cap | Lead source | Stop rule
```

Example for Rolling Ledger:

| Channel | Tool | Who sends | Daily cap | Lead source | Stop rule |
|---|---|---|---|---|---|
| Cold email | Origami Sequencer | Tool, after my approval | 10 per inbox | Origami signal play | Bounces over 2% or any spam complaint |
| Personal email | Sales Bot | Me | 5 | Top-scored Lead list rows | None, low volume |
| LinkedIn | Origami Sequencer | Tool, after my approval | 10 requests a weekday | Same list as cold email | Any LinkedIn warning: pause 2 weeks |
| New-audience test | Explee | Tool, after my review | $10 a day | Explee suggestion, pruned | No positive reply after $50 |
| X | Grok Bot finds and drafts | Me | 10 DMs | Public posts with a buying signal | Any X warning |

Two rules make this work:

1. **No lead in two cold channels at once.** Before importing a list into a tool, check it against the others and your Do not contact tab. Someone getting the same pitch from Origami and Explee in one week is how complaints start.
2. **Shared accounts share caps.** If you run more than one business from the same LinkedIn or X account, the cap is for the account, not per business. Split it in writing.

:::video
id: sales-l9-plan
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l9-plan.mp4
captions: /learn/video/ai-sales/sales-l9-plan.vtt
poster: /learn/video/ai-sales/sales-l9-plan.jpg
transcript: Write a one-page outbound plan, with one row for each channel. Six columns: channel, tool, who sends, daily cap, lead source and stop rule. For Rolling Ledger, cold email runs on Origami's Sequencer, sent after approval, ten per inbox, with a stop rule at bounces over two percent or any spam complaint. Personal email runs through the Sales Bot, five a day, and the founder sends. The new-audience test runs on Explee, at ten dollars a day, and stops if there's no positive reply after fifty dollars. And X runs through a Grok Bot that finds and drafts, while the founder sends ten messages a day. Two rules make this work. One: no lead in two cold channels at once. Check every list against the others, and your do-not-contact tab, before you import it. Two: shared accounts share caps. If two businesses use one profile, the cap is per account. Next: tagging every lead.
:::

## Step 3: Tag every lead with its channel

Your CRM from Lesson 3 needs to know where each lead came from. Add one field:

| Field | Allowed values | Rule |
|---|---|---|
| Source | Origami email, Origami LinkedIn, Explee, Sales Bot, X, Inbound | Set once, when the lead enters the CRM. Never overwritten. |

For links in your messages, add UTM tags so your site analytics shows the channel too:

```text
https://rollingledger.example/pricing?utm_source=origami&utm_medium=email&utm_campaign=new-location
```

Use a different `utm_source` for each tool and a short `utm_campaign` name for each play or audience.

## Step 4: The Friday scorecard

Add a **Scorecard** tab with one row per channel per week:

```text
Week | Channel | Sent | Replies | Positive replies | Opt-outs or complaints | Calls booked | Spend | Cost per positive reply
```

Then hand it to your chief of staff agent (Duet or a Claude Project with access to the sheet) every Friday:

```text
Read the Scorecard tab and the Test log tab. For each channel, compare this week
with the last two weeks. Tell me in under 150 words:
1. Which channel produced the most positive replies per hour of my time
2. Any channel that hit its stop rule
3. One change to test next week
Use only the numbers in the sheet. Don't estimate revenue.
```

The last line matters. Your scorecard measures activity and replies. It doesn't predict income, and neither should your agent.

:::video
id: sales-l9-scorecard
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l9-scorecard.mp4
captions: /learn/video/ai-sales/sales-l9-scorecard.vtt
poster: /learn/video/ai-sales/sales-l9-scorecard.jpg
transcript: Every Friday, one row per channel goes into a scorecard. The columns: week, channel, sent, replies, positive replies, opt-outs or complaints, calls booked, spend, and cost per positive reply. Then hand it to your chief of staff agent, Duet or a Claude project with access to the sheet. Ask it, in under a hundred and fifty words, which channel produced the most positive replies per hour of your time, which channel hit its stop rule, and one change to test next week. Use only the numbers in the sheet, and don't estimate revenue. Check one of its claims against the sheet. Then give each channel one verdict. Keep: replies are steady or rising, and no stop rule fired. Change nothing for a week. Fix: replies are flat but the channel is clean, so change one thing. Stop: a stop rule fired, or two fixes didn't help. Raise a cap only after two clean weeks, and by no more than half. In the exercise, you'll score your first week.
:::

## Step 5: Keep, fix or stop

Every Friday, each channel gets one verdict:

- **Keep:** positive replies are steady or rising and no stop rule fired. Change nothing for one more week.
- **Fix:** replies are flat but the channel is clean. Change one thing (the first line, the play, the audience) and measure again.
- **Stop:** a stop rule fired, or two fixes in a row didn't help. Pause the channel and cancel the tool if nothing else uses it.

Raise a cap only after two clean weeks, and by no more than 50% at a time.

:::infographic
id: fig-2
type: comparison
title: Keep, fix or stop
shows: Three verdict cards: Keep (replies steady or rising, no stop rule fired), Fix (flat but clean: change one thing, highlighted), Stop (a stop rule fired or two fixes failed). Footer: raise a cap after two clean weeks, by 50% at most.
data: none
image: /learn/figures/ai-sales/lesson-09-fig-2.webp
alt: Every Friday each channel gets one verdict. Keep when replies are steady or rising and no stop rule fired. Fix when replies are flat but the channel is clean, by changing one thing. Stop when a stop rule fired or two fixes failed. Raise a cap only after two clean weeks, by no more than 50%.
:::

:::try-it
Fill in just the first row of your outbound plan: your main channel, its tool, who sends, the cap and the stop rule. If you can't write the stop rule, you're not ready to turn the channel on.
:::

:::checkpoint
Q: Origami and Explee both found the same 15 food trucks this week. What should you do?
- [ ] Let both tools contact them, since more touches mean more replies
- [x] Keep those trucks in one channel only and remove them from the other tool's list
- [ ] Delete them from both tools to be safe
Why: Getting the same cold pitch from two tools in one week reads as spam and invites complaints. One lead belongs to one cold channel at a time.
:::

:::takeaways
- Compare tools by job, sender, approval and risk, then give each channel one tool
- One page: channel, tool, who sends, daily cap, lead source, stop rule
- One cold channel per lead; shared accounts share caps
- Tag leads with a Source field and UTM links
- Every Friday: keep, fix or stop each channel, based on your own numbers
:::

## Go deeper

- [Google Analytics: URL builders and UTM parameters](https://support.google.com/analytics/answer/10917952) - how campaign tags show up in your reports
- [Origami](https://origami.chat/) and [Explee](https://explee.com/) - check current plans before you commit to a stack
