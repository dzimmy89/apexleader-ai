---
module: 1
lesson_number: 6
course: ai-marketing
template: v2
---

# Lesson 6: Ads With Approval Gates

:::video
id: mkt-l6-overview
kind: overview
status: paused
src: /learn/video/ai-marketing/mkt-l6-overview.mp4
captions: /learn/video/ai-marketing/mkt-l6-overview.vtt
poster: /learn/video/ai-marketing/mkt-l6-overview.jpg
transcript: Ads are the one marketing job where a mistake costs money by the hour. This is AI Marketing, lesson six: ads with approval gates. In this lesson: hard caps, the right access, your launch click, a daily check, and when to scale. Let agents do the research, the copy variations and the daily reporting. Keep three gates in human hands. Gate one: a hard spending ceiling, set in the ad platform itself, before anything runs. Gate two: the agent's access, usually read-only, and never billing. Gate three: the click that turns a campaign on is yours. Then the agent checks results every morning, and recommends a pause when spend or cost runs high. It never changes a budget, a bid or a campaign itself. Start with an amount you'd be fine losing while you learn, and run for two weeks. First, the caps.
:::

:::key-concept
Ads are the one marketing job where a mistake costs money by the hour. Let agents do the research, the copy variations and the daily reporting. Keep three gates in human hands: the hard spending cap set in the ad platform, the click that turns a campaign on, and any budget change.
:::

## What you'll be able to do

- Set hard spending caps on Meta, Google and X before any campaign runs
- Give an agent the right level of ad-account access (usually read-only)
- Have an agent draft a campaign plan and ad variations you approve, then launch it yourself
- Run a daily ads check with clear "pause" and "ask me" rules

## Why this matters

Ad platforms are built to spend. Their own AI tools (Meta's Advantage+ features, Google's AI Max for Search, automated bidding) are good at finding buyers, and also good at finding ways to use your whole budget. A solo founder can't watch a dashboard all day, which is why agents are tempting. But the rule from Start Here holds: agents never move money. Spending ad budget is moving money. So the agent advises and reports; you set caps and press go.

## Gate 1: Hard caps in the platform, before anything else

A budget you set in a campaign is a target. A spending limit is a ceiling. Set the ceiling first, in the platform itself, so no agent, no setting and no typo can go past it.

| Platform | Caps to know | Where to look |
|---|---|---|
| Meta (Facebook, Instagram) | **Account spending limit**: a lifetime ceiling across every campaign in the ad account; when hit, all ads stop. **Campaign spending limit**: a ceiling on one campaign | Billing and payments settings in Ads Manager; the campaign setup screen |
| Google Ads | **Average daily budget**: Google may spend up to twice it on a busy day, but over a month you're not charged more than about 30.4 times the daily amount | Campaign settings; check Google's help page on budgets |
| X (Twitter) Ads | **Daily budget** and **total budget** per campaign, so the campaign stops when the total is spent | Campaign setup in X Ads Manager |

Meta may also apply its own daily spending limit to new accounts and raise it over time; that's separate from yours. Menu names move, so check each platform's current help pages linked below before you set them.

A starting rule for a first test: pick the amount you'd be fine losing entirely while you learn (for many founders, a few hundred dollars), set the account or campaign ceiling to that, and run for two weeks.

:::video
id: mkt-l6-caps
kind: inline
status: paused
src: /learn/video/ai-marketing/mkt-l6-caps.mp4
captions: /learn/video/ai-marketing/mkt-l6-caps.vtt
poster: /learn/video/ai-marketing/mkt-l6-caps.jpg
transcript: A budget you set in a campaign is a target. A spending limit is a ceiling. Set the ceiling first. On Meta, an account spending limit is a lifetime ceiling across every campaign. When it's hit, all ads stop. A campaign spending limit caps one campaign. On Google Ads, the average daily budget isn't a ceiling. Google may spend up to twice it on a busy day, but over a month you're not charged more than about thirty point four times the daily amount. On X, a campaign total budget stops the campaign when it's spent. Menu names move, so check each platform's current help pages. For a first test, pick the amount you'd accept losing entirely while you learn. For many founders, that's a few hundred dollars. Set the ceiling to that, and run for two weeks. And never give an agent your payment method or billing role. Next: the agent's access.
:::

:::warning
Never give an agent your ad account's payment method, billing admin role or your own login. Payment confirmations should always land on your screen: Grok Bot hands payment steps to you through Takeover, and Dots require approval for purchases. Keep it that way.
:::

## Gate 2: The right access level for the agent

Each platform lets you add people (or a separate agent email) with limited roles. Use the smallest one that does the job:

- **For reporting only** (the usual choice): Google Ads read-only access; on Meta, a partial-access role limited to viewing performance; on X, an analyst-style role if offered. The agent reads numbers and writes the brief.
- **For drafting campaigns** (later, if you trust the routine): a role that can create and edit campaigns but not manage billing. The agent builds campaigns in a paused state, and you turn them on.

Give the agent its own email login for this, entered through a secure form or Takeover, and add Ask first or Custom Rules for "turn on a campaign," "change a budget or bid," and "change billing." The platform role is the hard lock; the agent's rules are the second lock.

:::infographic
id: fig-1
type: diagram
title: Three gates stay human
shows: Three gates in a row: 1 hard cap, set in the platform; 2 agent access, read-only, no billing; 3 the launch click, yours (highlighted). Below, the agent's side: research, copy, daily reports.
data: none
image: /learn/figures/ai-marketing/lesson-06-fig-1.webp
alt: Three gates stay in human hands: a hard spending cap set in the ad platform, the agent's access kept read-only with no billing role, and the click that turns a campaign on. Agents do the research, the copy and the daily reports.
:::

## Gate 3: The launch click is yours

Have your agent prepare a one-page campaign brief. You read it, change it and approve it, then you (or the agent, in a paused draft) build it, and you press go.

```text
Draft a two-week test campaign brief for [platform].
Goal: [e.g. newsletter signups / booked calls].
Audience: [who], based on our customer profile.
Budget: [daily] per day, hard cap [total]. Do not propose more.
Include: 5 headline options and 3 body text options in our brand voice, which
landing page each points to, what success looks like in numbers, and when we
stop. Only use claims that appear in our Offer Facts page. Flag any wording that
may break the platform's ad policies (health, finance, before-and-after claims).
```

Check every claim against your Offer Facts page from Lesson 4. Platforms review ads against their policies, but you're responsible for what your ads say. For regulated topics (finance, health, legal), check with a professional before running.

## The daily ads check

Once a campaign runs, the agent's daily job is to look and report, with simple, pre-agreed rules:

```text
Every day at 9:00 AM, read yesterday's results for our active campaigns
(read-only). Report: spend vs cap, cost per result, best and worst ad, anything
unusual. Rules:
- If spend is above 120% of the daily budget, or cost per result is more than
  double our target for 2 days, say "RECOMMEND PAUSE" at the top and explain.
- Never change budgets, bids, audiences or campaign status yourself.
- Put all recommendations under "Needs your decision."
```

:::infographic
id: fig-2
type: comparison
title: The daily ads check
shows: Two trigger cards: spend above 120% of the daily budget; cost per result more than double target for 2 days. Both lead to a highlighted RECOMMEND PAUSE card. Footer with a ban icon: the agent never changes budgets, bids or status.
data: none
image: /learn/figures/ai-marketing/lesson-06-fig-2.webp
alt: The daily ads check flags RECOMMEND PAUSE when spend is above 120% of the daily budget, or cost per result is more than double the target for two days. The agent never changes budgets, bids, audiences or campaign status itself.
:::

You read it in two minutes. If it says pause, you pause. Over the two weeks, the weekly marketing brief from Lesson 3 adds an ads section: total spend, results, cost per result, and one recommendation.

:::video
id: mkt-l6-daily-check
kind: inline
status: paused
src: /learn/video/ai-marketing/mkt-l6-daily-check.mp4
captions: /learn/video/ai-marketing/mkt-l6-daily-check.vtt
poster: /learn/video/ai-marketing/mkt-l6-daily-check.jpg
transcript: Once a campaign runs, the agent looks and reports, with rules you agreed in advance. Every morning at nine, it reads yesterday's results, read-only. It reports spend against the cap, cost per result, the best and worst ad, and anything unusual. Two rules trigger a flag. If spend is above one hundred twenty percent of the daily budget, or cost per result is more than double your target for two days, it writes recommend pause at the top, and explains why. It never changes budgets, bids, audiences or campaign status itself. Every recommendation goes under needs your decision. You read it in two minutes. If it says pause, you pause. Scale only after two clean weeks: results at or under target, reports that match the platform, and no surprises. Then raise the cap in steps you choose, like twenty-five percent at a time. In the exercise, you'll set your gates.
:::

:::try-it
Open the ad platform you're most likely to use and find where the account spending limit or campaign total budget lives. Don't launch anything. Just find the ceiling, so you know where it is before you need it.
:::

## When to scale

Only after two clean weeks: results at or under your target cost, the agent's reports matching the platform's numbers, and no surprises. Then raise the cap in steps you choose (for example 25 percent at a time), and keep the same gates. Don't hand budget control to the agent at any stage. Scaling means you approve a bigger number, not that you stop approving.

:::checkpoint
Q: Your agent's daily report shows one ad converting at half your target cost. It recommends doubling the budget today. What do you do?
- [ ] Let the agent raise the budget, since the numbers support it
- [ ] Raise the account spending limit so the agent has room to act
- [x] Decide yourself, and if you agree, raise the budget in a step you choose while keeping the hard cap in place
Why: Budget changes move money, so they stay a human decision. The agent's job is the recommendation; the cap and the click stay with you.
:::

:::takeaways
- Set a hard ceiling in the platform before any campaign runs
- Give agents read-only access by default; billing and payment never go to an agent
- Agents draft briefs and ad variations; you approve claims and press go
- The daily check reports and recommends; you pause, raise or stop
:::

## Go deeper

- [Jon Loomer: Campaign, account and daily spending limits on Meta](https://www.jonloomer.com/campaign-spending-limits-account-spending-limits-daily-spending-limits/) - what each Meta limit does and where to set it
- [Google Ads Help: About average daily budgets](https://support.google.com/google-ads/answer/6385083) - how daily budgets and monthly charging limits work
- [X Ads campaigns 101](https://business.x.com/en/help/campaign-setup/campaigns-101) - campaign setup basics, including budgets
- [Grok Bot: Manage and protect](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - Takeover for payment steps and Ask first rules
