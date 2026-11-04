---
module: 1
lesson_number: 6
course: ai-marketing
template: v2
---

# Exercise 6: Set Up a Capped Test Campaign With Three Gates

:::key-concept
You'll set a hard spending ceiling, give your agent read-only access, and have it draft a two-week test campaign brief you approve. At the end you'll have a capped campaign ready to launch on your click (or a fully prepared brief if you're not spending yet) and a daily ads check in place.
:::

**Time:** 35 minutes · **You'll need:** an ad account on Meta, Google Ads or X (creating one is free), your Offer Facts page from Exercise 4, your Marketing Bot or another agent · **Builds on:** Lesson 6

:::video
id: mkt-ex6-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-marketing/mkt-ex6-setup.mp4
captions: /learn/video/ai-marketing/mkt-ex6-setup.vtt
poster: /learn/video/ai-marketing/mkt-ex6-setup.jpg
transcript: One platform, one ceiling, and a campaign that waits for your click. Let's set your gates. In this exercise you'll build an ad test that can't overspend. Pick the one platform where your customers spend time. Decide the amount you'd accept losing while you learn, and set it as a hard limit in the platform first. Invite your agent's own email with a read-only role, and no billing access. Add Ask first or Custom Rules for turning campaigns on, changing budgets or bids, and billing. Ask for a two-week campaign brief that uses only claims from your Offer Facts. Check every claim, and cut anything unsupported. Build the campaign paused, and confirm the budget matches your plan. Write the daily check with your own target numbers. Then launch it yourself, when you're ready. So: what stops spending if nobody's watching? Pause here and set your gates.
:::

## Warm-up

:::checkpoint
Q: You set a Google Ads campaign to a $20 average daily budget. On a busy Tuesday it spends $38. What happened?
- [ ] A bug; Google never spends above the daily budget
- [ ] Your agent changed the budget
- [x] Normal behavior; Google can spend up to twice the daily budget on a given day while keeping the month near 30.4 times the daily amount
Why: Google's average daily budget is a monthly average, not a daily ceiling. That's why you set and watch the overall cap yourself.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to ads with gates
shows: Seven numbered steps: 1 pick one platform, 2 set the ceiling first (highlighted), 3 agent read-only, 4 draft the brief, 5 approve the claims, 6 build it paused, 7 daily check, then your click.
data: none
image: /learn/figures/ai-marketing/exercise-06-fig-1.webp
alt: Seven steps: pick one platform; set a hard ceiling first; give the agent read-only access; draft the campaign brief; check every claim against Offer Facts; build the campaign paused; and write the daily check, then launch on your own click.
:::

1. **Pick one platform.** Choose where your customers spend time. Rolling Ledger would likely test Meta (Instagram, where food trucks post menus and specials) or Google Search ("bookkeeping for food truck owners").

2. **Set the ceiling first.** Decide the amount you'd accept losing while you learn. Set it as a hard limit: on Meta, the account spending limit (Billing and payments) or a campaign spending limit; on X, a campaign total budget; on Google, a daily budget that keeps the monthly maximum (about 30.4 times daily) inside your number. Write the number at the top of a new doc called `Ads Plan`.

3. **Add the agent read-only.** Invite your agent's separate email with a read-only or view-performance role. Do not give billing access. Add Ask first or Custom Rules for enabling campaigns, changing budgets or bids, and billing.

4. **Draft the brief.** Ask your agent (or Claude, with your Offer Facts attached):

   ```text
   Draft a two-week test campaign brief for [platform]. Goal: [signups or calls].
   Audience: [who]. Budget: [daily] per day, hard cap [total]. Do not propose
   more. Give 5 headlines and 3 body texts in our voice, the landing page for each,
   success numbers, and a stop rule. Use only claims from Offer Facts. Flag any
   wording that could break ad policies.
   ```

5. **Approve the claims.** Check every claim against Offer Facts. Cut anything unsupported. Pick two headlines and two body texts to test.

6. **Build it paused.** Create the campaign yourself (or have an agent with a create role build it paused). Confirm the budget and cap match `Ads Plan`. If you're not spending yet, stop here with the brief and caps ready.

7. **Write the daily check.** Give the agent the daily ads check from Lesson 6, with your own numbers for target cost per result and the "RECOMMEND PAUSE" rules. Ask it to save this as a skill and schedule it daily.

8. **Launch on your click.** When ready, turn the campaign on yourself. Note the date in `Ads Plan`.

## Done when

- [ ] A hard ceiling is set in the platform and written in `Ads Plan`
- [ ] The agent has read-only access and no billing role
- [ ] Every ad claim traces to a line in Offer Facts
- [ ] The campaign is built and paused (or launched by you), with a scheduled daily check

:::example
title: See an example result
Here is the ads plan for the sample business, Rolling Ledger, built paused and then launched by the founder.

:::video
id: mkt-ex6-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-marketing/mkt-ex6-reveal.mp4
captions: /learn/video/ai-marketing/mkt-ex6-reveal.vtt
poster: /learn/video/ai-marketing/mkt-ex6-reveal.jpg
transcript: For Rolling Ledger, the test can't spend more than three hundred dollars, and the agent can't spend anything. Here's the example. The platform is Google Search, for people searching bookkeeping for food truck owners. The plan: twenty dollars a day, an end date fourteen days out, and a three hundred dollar cap written in the Ads Plan. The goal is booked fifteen-minute calls, at a target of forty dollars each. The agent's email has read-only access, and no billing role. The brief offered five headlines and three body texts. The founder cut one headline that promised to save four thousand dollars on taxes, because it isn't in Offer Facts, and one body line that said guaranteed. She picked two headlines and two body texts, and built the campaign paused. The daily check flags a pause above twenty-four dollars a day, or above eighty dollars a call for two days. The founder pressed go herself.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger ads plan
shows: Under "Rolling Ledger ads plan" tagged example: Google Search, $20 a day, 14 days, $300 cap (highlighted), target $40 a booked call. Below, the brief: 5 headlines and 3 body texts offered, 2 cut, 2 and 2 kept. Footer: agent read-only, the founder pressed go.
data: example numbers: $20 a day, 14 days, $300 cap, $40 target; 5 and 3 options; 2 cut
image: /learn/figures/ai-marketing/exercise-06-fig-2.webp
alt: Example Rolling Ledger ads plan: Google Search at $20 a day for 14 days with a $300 cap and a target of $40 per booked call. The brief offered 5 headlines and 3 body texts; 2 unsupported lines were cut and 2 headlines and 2 body texts were kept. The agent is read-only and the founder launched the campaign.
:::

```text
ADS PLAN (example, Rolling Ledger)
Platform: Google Search. Keywords: "bookkeeping for food trucks", "food truck bookkeeper"
Budget: $20 average daily budget, campaign end date 14 days after launch
Ceiling: $300 total (Google may spend up to $40 on a busy day; the end date and
the founder's weekly check keep the total under $300)
Goal: booked 15-minute calls. Target: $40 per call. Stop rule: no calls after $150 spent
Agent access: read-only Google Ads user, separate email, no billing role
Ask first: enabling campaigns, changing budgets or bids, billing
```

| Line from the brief | Decision | Why |
|---|---|---|
| Bookkeeping for Food Trucks, $149 a Month | Kept | Offer Facts: Plans |
| Your Truck's Books, Done Every Month | Kept | Offer Facts: Included |
| Save $4,000 on Taxes This Year | Cut | Not in Offer Facts, and a finance claim |
| Body: "Photo your receipts, we do the rest. Cancel any month." | Kept | Offer Facts: Features, Guarantee |
| Body: "Guaranteed savings or your money back." | Cut | No such guarantee in Offer Facts |

**Daily check:** 9:00 AM, read-only. RECOMMEND PAUSE if spend is over $24 in a day, or cost per call is over $80 for two days running. Saved as a skill and scheduled daily. The campaign was built paused, and the founder turned it on herself on Monday, November 16.
:::

:::coached
**For 1-on-1 coaching clients.** Run a real two-week test:

1. Launch the campaign with your approved cap and two ad variations.
2. Keep the daily reports and log every decision you made (pause, keep, change) and why.
3. At the end, have the agent draft a one-page results summary with cost per result, best ad and a recommendation.

**Bring to your session:** `Ads Plan`, the 14 daily reports, your decision log and the results summary.

**Your coach will:**
- Check the agent's numbers against the platform's own reports
- Decide with you whether to stop, rerun or scale, and by how much
- Tighten your pause rules based on what happened
:::
