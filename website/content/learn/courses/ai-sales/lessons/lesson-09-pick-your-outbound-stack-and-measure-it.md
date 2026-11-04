---
module: 2
lesson_number: 9
course: ai-sales
template: v2
---

# Lesson 9: Pick Your Outbound Stack and Measure It

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

A sensible starting stack for Groomer Books: Origami builds the list and runs the email sequence; the Sales Bot drafts personal notes for the top 10 leads each week; Explee is used only to test one new audience at a time; X is run the same way as email, with bots finding and drafting and you sending.

## Step 2: One channel, one owner, one cap

Write a one-page outbound plan. For each channel, fill one row:

```text
Channel | Tool | Who sends (me or tool with approval) | Daily cap | Lead source | Stop rule
```

Example for Groomer Books:

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

## Step 3: Tag every lead with its channel

Your CRM from Lesson 3 needs to know where each lead came from. Add one field:

| Field | Allowed values | Rule |
|---|---|---|
| Source | Origami email, Origami LinkedIn, Explee, Sales Bot, X, Inbound | Set once, when the lead enters the CRM. Never overwritten. |

For links in your messages, add UTM tags so your site analytics shows the channel too:

```text
https://groomerbooks.example/pricing?utm_source=origami&utm_medium=email&utm_campaign=new-location
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

## Step 5: Keep, fix or stop

Every Friday, each channel gets one verdict:

- **Keep:** positive replies are steady or rising and no stop rule fired. Change nothing for one more week.
- **Fix:** replies are flat but the channel is clean. Change one thing (the first line, the play, the audience) and measure again.
- **Stop:** a stop rule fired, or two fixes in a row didn't help. Pause the channel and cancel the tool if nothing else uses it.

Raise a cap only after two clean weeks, and by no more than 50% at a time.

:::try-it
Fill in just the first row of your outbound plan: your main channel, its tool, who sends, the cap and the stop rule. If you can't write the stop rule, you're not ready to turn the channel on.
:::

:::checkpoint
Q: Origami and Explee both found the same 15 salons this week. What should you do?
- [ ] Let both tools contact them, since more touches mean more replies
- [x] Keep those salons in one channel only and remove them from the other tool's list
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
