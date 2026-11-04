---
module: 2
lesson_number: 8
course: ai-sales
template: v2
---

# Lesson 8: Run an Autonomous Agent Safely

:::key-concept
Explee (launched as AutoGTM) is a cold email agent built to run without you: give it a website and a budget, and it picks audiences, finds contacts, writes, sends, follows up and handles replies. That makes it the fastest way to test a new audience, and the easiest way to send something you'd never approve. Change four settings before the first send, keep the budget small, and log what comes back yourself.
:::

## What you'll be able to do

- Describe what Explee automates and where it differs from Origami and your Sales Bot
- Change the four settings that keep it from sending unseen, under someone else's name
- Prune its suggested audiences down to one you can judge
- Run a capped one-day test and work out cost per reply from your own log

## Why this matters

Everything so far in this course has kept you in the loop: drafts wait for you, and you or an approval step decides what goes out. Fully autonomous outbound agents are the next step the market is pushing, and they are useful when you want to find out quickly whether an audience responds at all. They are also where the most avoidable mistakes happen: messages going out under a name you didn't choose, to contacts who left their jobs last year, before you've read a word. Learning to run one safely is a skill you'll reuse on every autonomous agent you try.

## Meet Explee

Explee is a London company that started as a search engine for B2B companies and decision-makers. In May 2026 it made its outbound agent, **AutoGTM**, publicly available. The agent is now sold simply as Explee (its site says "AutoGTM is now Explee"), so older reviews and videos use the AutoGTM name. The workflow:

1. You paste your domain. Explee reads your site and suggests audience segments, each with a fit score.
2. Its agents find matching companies and people in Explee's database and verify emails.
3. It writes a personalized email for each prospect.
4. It sends from **Explee's own pre-warmed mailboxes, not your company domain**, so you don't set up domains, DNS or warmup. Explee says it pauses a mailbox automatically if it gets blocklisted or bounces too much.
5. It follows up on a schedule, sends your booking link when a lead asks for a call, and puts replies in an inbox tab. A dashboard shows each audience as Scaling, Working or Paused, with cost per lead, and the agent shifts budget toward the campaigns with the lowest cost per lead.

**Pricing, as of November 2026:** finding leads is free, and you pay about $0.04 per email sent, with a daily budget you set and no subscription. New accounts get $30 in free credits, which Explee says covers roughly the first 750 emails. After that your card is charged for sent emails, usually in batches of $5 or more. Launch coverage quoted $0.03 per email, so check [Explee](https://explee.com/) for current pricing.

**What testers found.** Hands-on reviews describe Explee as the most hands-off outbound tool they'd tried, with emails good enough that one tester said they'd have answered some themselves. They also reported:

- An **Autopilot** toggle that was **on by default**, so drafting and sending start without you
- Emails **signed with a name the tool made up**, not the user's own
- Replies routed through a separate domain that Explee controls
- Many replies from **stale contacts** (people who'd left, businesses that had closed), and no bounce data in the dashboard
- Weak results outside English-speaking markets, and no way to change the sender name to a local one
- Billing complaints on Trustpilot about cancellation and unexpected charges, some of which Explee refunded

None of that means "don't use it." It means set it up deliberately.

## Step 1: Change four settings before the first send

Do these in the first session, before you let a single email go out. Screenshot each one.

| # | Setting | Change it to | Why |
|---|---|---|---|
| 1 | Autopilot | **Off** | So you review drafts before anything sends |
| 2 | Daily budget | **$10 to $30** | Caps the damage if the audience or message is wrong |
| 3 | Sender name and signature | **Your real name, business and postal address** | CAN-SPAM bans misleading header and "from" information, and requires a postal address and opt-out in every email |
| 4 | Audiences switched on | **One** | You can only judge results you can attribute |

If you can't find a way to turn Autopilot off or set your real name, stop and contact Explee support before you top up any money. A tool that can't do those two things doesn't belong in this course's system.

:::warning
Explee's mailboxes send on your behalf, but the emails promote your business, so you're responsible for them under CAN-SPAM. Check that every draft includes a working opt-out and your postal address. If it doesn't, add them to the template before you send anything.
:::

## Step 2: Prune the audiences

Explee suggests segments from your website. For Groomer Books it might suggest "independent pet grooming salons," "mobile pet groomers," "veterinary clinics" and "pet boarding facilities." Fit scores are the tool's guess, not evidence.

1. Delete anything your Lesson 1 profile disqualifies (vet clinics, franchises).
2. Keep the single segment closest to your best Lesson 6 leads.
3. Read 10 sample prospects from it. If more than two are wrong (wrong industry, wrong size, a chain), edit the segment description and look again.
4. Stick to your own country for the first test. Outside the US, consent rules for cold email are often stricter, and testers saw weaker data.

## Step 3: Review the first 10 drafts

With Autopilot off, read the first 10 drafts the way you read your Sales Bot's work in Lesson 2:

1. Is every detail about the prospect true? Spot-check three against their website.
2. Is the offer described correctly? Testers reported agents misdescribing offers.
3. Is the sender your real name, with your address and opt-out line?
4. Does it make any claim about results? Remove it.

Edit what needs editing, and approve only what you'd sign yourself.

## Step 4: Run one day and log it yourself

Set the budget, switch on one campaign, and let it send one day's budget. Then keep your own **Test log** tab, because the dashboard won't show everything:

```text
Date | Audience | Emails sent | Spend | Replies | Positive replies | Opt-outs | Bounced or stale | Notes
```

"Bounced or stale" counts replies like "she left the company" or "we closed," plus any bounce notices you can see. Testers found this was most of the replies on some campaigns, and it tells you how fresh the data is.

Work out **cost per positive reply** by hand: spend divided by positive replies. If there are none yet, write "none yet" rather than guessing.

## Step 5: Decide what happens next

After the first day, pick one:

- **Keep testing:** messages were accurate and stale contacts were few. Run the same audience for a week at the same cap.
- **Fix and retest:** messages needed heavy edits, or most replies were stale. Tighten the audience and rewrite the offer description.
- **Stop:** you couldn't turn Autopilot off, set your real name, or get an accurate offer. Download your log and close the account.

Whatever you choose, top up in small amounts, and check your card statement after the first week.

:::try-it
Before you open Explee, write the four settings on a sticky note: Autopilot off, budget cap, real sender, one audience. Don't click "launch" until all four are ticked.
:::

:::checkpoint
Q: You open Explee for the first time and it has already drafted a campaign with Autopilot on and a signature reading "Alex, Growth Team." What do you do first?
- [ ] Let it run for a day to see if the emails work
- [ ] Change the signature, then leave Autopilot on to save time
- [x] Turn Autopilot off, set your real name, address and opt-out, then review drafts before anything sends
Why: CAN-SPAM bans misleading sender information, and nothing in this course sends before you've seen it. Fix the sender and turn Autopilot off before the first email goes out.
:::

:::takeaways
- Explee automates the whole cold email loop, from your domain to replies
- Four settings first: Autopilot off, $10 to $30 cap, real sender, one audience
- Prune suggested audiences with your Lesson 1 disqualifiers
- Keep your own Test log; count stale contacts; compute cost per positive reply by hand
- Top up small and check billing after week one
:::

## Go deeper

- [Explee](https://explee.com/) - how the agent works, current pricing and support
- [FTC: CAN-SPAM Act compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) - sender information, postal address and opt-out rules
- [ICO: Electronic mail marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/) - the UK rules if you email prospects there
