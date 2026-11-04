---
module: 2
lesson_number: 7
course: ai-sales
template: v2
---

# Lesson 7: A Sequence That Waits for You

:::video
id: sales-l7-overview
kind: overview
status: paused
src: /learn/video/ai-sales/sales-l7-overview.mp4
captions: /learn/video/ai-sales/sales-l7-overview.vtt
poster: /learn/video/ai-sales/sales-l7-overview.jpg
transcript: Following up on day three and day seven for twenty leads means sixty manual sends a week. A sequencer handles the timing. You still approve the words. This is AI Sales, lesson seven: a sequence that waits for you. In this lesson: approval first, protecting your main domain, three touches, LinkedIn with eyes open, and reading results honestly. Origami's Sequencer sends a short series of emails, and optionally LinkedIn steps, on a schedule. Any reply, even not interested, removes the lead. Turn on approval before you build anything, so every message waits for you. Send cold email from a separate domain, with a cap of ten new emails a day per inbox. Write three short touches, each with your real name, postal address and an opt-out line. Then read sent, replies, opt-outs and bounces every two weeks. First, approval.
:::

:::key-concept
A sequence is a short series of touches (emails, LinkedIn steps, or both) that a tool sends on a schedule and stops when someone replies. Origami's Sequencer can run one for you. You set it up so every message waits for your approval, it sends from a domain that can't hurt your main inbox, and it moves slowly enough to protect your reputation and your LinkedIn account.
:::

## What you'll be able to do

- Turn on approval in Origami so nothing goes out unseen
- Choose between your own inbox and a separate sending domain, and set daily caps
- Build a three-touch email sequence that meets CAN-SPAM
- Add LinkedIn steps knowing exactly what LinkedIn's rules say and what you are risking
- Read the results without fooling yourself

## Why this matters

In Lesson 2 you sent every approved email by hand. That's safe, and it's slow: following up on day 3 and day 7 for 20 leads means 60 manual sends a week. A sequencer handles the timing and the follow-ups and stops the moment someone answers. That's real time saved. It also means a mistake can repeat across every lead before you notice. The settings in this lesson are what keep the time savings without the damage.

## How Origami's Sequencer works

Origami's Sequencer is included on its paid plans (as of November 2026). It runs from the same workspace as your lead tables:

- Up to 10 email steps and 10 LinkedIn steps per sequence, in any order
- Emails send from inboxes you connect (Gmail, Outlook or SMTP), or from separate sending inboxes Origami sets up for you
- LinkedIn steps (connection requests and messages) send from LinkedIn profiles you connect
- Sends are spread across connected accounts, paced per account, and timed to each lead's time zone
- **Any reply, including "not interested," removes that lead from the sequence**, and replies collect in one activity feed
- The dashboard shows acceptance, reply and click rates per step

Origami's homepage says: "Turn on approval and every message waits for you." Otherwise it sends automatically. In this course, approval is always on.

:::warning
Menus in these tools change often. If a setting isn't where this lesson says, search the tool's help for "approval," "daily limit" or "sending inbox." Don't launch until you've found it.
:::

## Step 1: Turn on approval first

Before you build anything, find Origami's approval setting and turn it on. Take a screenshot. With approval on, each drafted message appears in a queue for you to edit, approve or reject, exactly like the Outreach queue in Lesson 2.

Approve the first two weeks of messages one by one. You'll catch things the AI gets wrong about your business, and your edits tell you what to fix in the prompt. Only consider batch-approving once a full week passes with no edits needed, and even then read every message's first line.

## Step 2: Protect your main email domain

You have two choices for where emails send from:

| Option | Good | Watch out |
|---|---|---|
| Your own business inbox | Replies come straight to you; your real name and domain | A spam complaint or bounce hurts the domain you use for clients and invoices |
| A separate sending domain (for example getrollingledger.com) | Problems stay away from your main domain | Needs its own SPF, DKIM and DMARC, warmup, and a real reply path to you |

For cold outreach, use a separate sending domain. Origami can set up sending inboxes for you, which it says "keep your main address safe." Whichever you pick, check SPF, DKIM and DMARC on that sending domain the way you did in Exercise 2, and confirm replies reach an inbox you read daily.

**Daily caps.** Start at 10 new emails a day per inbox and keep warmup on. Raise the cap only after two weeks with bounces under 2% and no spam complaints.

:::infographic
id: fig-1
type: comparison
title: Protect your main domain
shows: Two columns. Main business inbox: clients and invoices, keep it clean. Separate sending domain (highlighted): cold outreach, own SPF, DKIM, DMARC and warmup, replies forwarded to you. Footer: 10 new emails a day per inbox.
data: none
image: /learn/figures/ai-sales/lesson-07-fig-1.webp
alt: Keep your main business inbox for clients and invoices. Send cold outreach from a separate sending domain with its own SPF, DKIM, DMARC and warmup, with replies forwarded to you. Start at 10 new emails a day per inbox.
:::

## Step 3: Write three touches

Short sequences work better for a one-person business: fewer messages to approve and less chance of annoying anyone. Use three email steps:

| Step | Day | Purpose | Length |
|---|---|---|---|
| 1 | 0 | One specific detail from their business, one line on what you do, one small question | Under 120 words |
| 2 | 3 | A useful tip or example related to their signal (new location, new hire) | Under 80 words |
| 3 | 7 | A polite close: "Should I stop emailing?" plus one easy yes | Under 50 words |

Every email carries the footer you wrote in Exercise 2: your real name, your business, a valid postal address, and "Not interested? Reply 'no thanks' and I won't email again." CAN-SPAM applies to business-to-business email, and you stay responsible even when a tool sends for you.

You can paste your own templates or let Origami write a personalized version for each lead. If you let it write, give it rules first:

```text
Voice: short sentences, plain words, no exclamation marks.
Never claim results, percentages or revenue figures.
Mention only facts from the lead's own website or listing.
Never say we've worked together or that someone referred us.
```

:::infographic
id: fig-2
type: timeline
title: Three touches
shows: A timeline of three emails: day 0, one detail, one line, one small question (under 120 words); day 3, a useful tip (under 80); day 7, a polite close (under 50). Footer: any reply stops the sequence.
data: none
image: /learn/figures/ai-sales/lesson-07-fig-2.webp
alt: Three touches: on day 0 one specific detail, one line on what you do and one small question in under 120 words; on day 3 a useful tip in under 80 words; on day 7 a polite close in under 50 words. Any reply stops the sequence.
:::

:::video
id: sales-l7-domain
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l7-domain.mp4
captions: /learn/video/ai-sales/sales-l7-domain.vtt
poster: /learn/video/ai-sales/sales-l7-domain.jpg
transcript: A spam complaint on your main domain can follow your invoices into the junk folder. So for cold outreach, send from a separate domain, like getrollingledger dot com. It needs its own SPF, DKIM and DMARC, warmup, and a real reply path that reaches you. Origami can set up sending inboxes for you. Then set the cap: ten new emails a day per inbox, with warmup on. Raise it only after two weeks with bounces under two percent and no spam complaints. Now the three touches. Day zero: one specific detail from their business, one line on what you do, and one small question, under a hundred and twenty words. Day three: a useful tip related to their signal, under eighty words. Day seven: a polite close. Should I stop emailing? Under fifty words. Every email carries your footer. Next: LinkedIn, with your eyes open.
:::

## Step 4: LinkedIn steps, with eyes open

Origami's Sequencer can send LinkedIn connection requests and messages from your real LinkedIn profile. Many founders use tools like this. Before you do, know exactly what you're agreeing to.

**What LinkedIn's rules say.** LinkedIn's User Agreement and its help page on prohibited software ban bots and automated tools that send messages, send connection requests or otherwise act on the site for you. LinkedIn detects and restricts accounts for it. A restriction can mean a warning, a temporary lock that requires ID verification, or a permanent ban. If your LinkedIn profile is a big part of how clients find you, a ban costs far more than the time saved.

**If you decide to use LinkedIn steps, use these limits:**

1. **One real profile: your own.** Origami can rotate sends across several connected profiles. Don't create extra profiles to do this. LinkedIn allows one account per person, and fake profiles are banned outright.
2. **Start at 10 connection requests a weekday.** Some guides call 25 to 40 "safe." No number is safe under LinkedIn's terms, and lower volume means lower risk. Stay at or under 20 even after a clean month.
3. **Plain connection requests.** Send the request with no note, or a one-line note with no pitch. Pitch only after someone accepts and you've looked at their profile.
4. **Approval on for every LinkedIn message,** same as email.
5. **Watch for warnings.** If LinkedIn shows a warning, asks you to verify your identity, or acceptance drops sharply, pause LinkedIn steps for two weeks and go back to doing LinkedIn by hand.
6. **Keep your other bots off LinkedIn.** Your Grok Bot Sales Bot still never touches LinkedIn. Origami is the one tool you've chosen to accept this risk for, and you set its limits.

A sample mixed sequence for Rolling Ledger:

| Day | Channel | Step |
|---|---|---|
| 0 | LinkedIn | Connection request, no note |
| 1 | Email | Step 1 email |
| 3 after accept | LinkedIn | Two-line message: thanks for connecting, one question about their new location |
| 4 | Email | Step 2 email (skipped if they've replied anywhere) |
| 8 | Email | Step 3 close |

:::video
id: sales-l7-linkedin
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l7-linkedin.mp4
captions: /learn/video/ai-sales/sales-l7-linkedin.vtt
poster: /learn/video/ai-sales/sales-l7-linkedin.jpg
transcript: Origami can send LinkedIn connection requests and messages from your real profile. Know exactly what that risks. LinkedIn's user agreement bans bots and automated tools that send messages or connection requests. No volume is safe under those terms. If you decide the risk is worth it, use these limits. One real profile: your own. No extra profiles. Start at ten connection requests a weekday, with no note, or a one-line note with no pitch. Pitch only after someone accepts. Keep approval on for every LinkedIn message. If LinkedIn shows a warning, asks you to verify your identity, or acceptance drops sharply, pause LinkedIn steps for two weeks. And keep your other bots off LinkedIn entirely. Then after two weeks, read four numbers for each step: sent, replied, opted out, and bounced. Rising opt-outs mean stop and fix. Compare against your own last two weeks, not vendor marketing. In the exercise, you'll build your sequence.
:::

## Step 5: Read results honestly

After two weeks, look at four numbers for each step: sent, replied, opted out, and bounced (plus accepted, for LinkedIn). Then ask:

- **Opt-outs or complaints rising?** The list or the message is wrong. Stop and fix it before sending more.
- **Bounces over 2%?** Contact data is stale. Pause and recheck sources.
- **Replies but no calls?** The first message works but the ask is unclear. Rewrite step 1's question.

Don't compare your numbers with figures in vendor marketing ("first positive reply in 8 days" and similar). They come from other businesses and other markets. Compare against your own last two weeks.

:::try-it
Write step 1 of your sequence in under 120 words, with the footer. Then cross out every sentence that would be true of any business. What's left should only be true of this lead.
:::

:::checkpoint
Q: You want to add LinkedIn steps to your Origami sequence. Which setup follows this lesson?
- [ ] Connect three LinkedIn profiles so you can send 40 requests a day each
- [x] Connect only your own profile, start at 10 requests a weekday, keep approval on, and pause if LinkedIn shows a warning
- [ ] Let your Grok Bot Sales Bot send the LinkedIn messages so Origami can focus on email
Why: LinkedIn's terms ban automation, so you keep the risk small: one real profile, low volume, approval on, and a clear point where you stop.
:::

:::takeaways
- Turn on approval before you build the sequence, and screenshot it
- Cold email goes from a separate, authenticated sending domain at 10 a day to start
- Three short touches, each with your real name, postal address and opt-out line
- LinkedIn automation breaks LinkedIn's terms: one real profile, 10 a weekday, pause on any warning
- Judge results against your own numbers, never vendor claims
:::

## Go deeper

- [Origami Sequencer](https://origami.chat/blog/origami-sequencer-now-live) - steps, connected inboxes and profiles, pacing
- [LinkedIn: Prohibited software and extensions](https://www.linkedin.com/help/linkedin/answer/a1341387) - what LinkedIn bans and why accounts get restricted
- [LinkedIn User Agreement](https://www.linkedin.com/legal/user-agreement) - section 8 lists the don'ts, including bots and fake profiles
- [Google: Email sender guidelines](https://support.google.com/a/answer/81126) - authentication and spam-rate rules for sending to Gmail
- [FTC: CAN-SPAM Act compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) - header, address and opt-out rules
