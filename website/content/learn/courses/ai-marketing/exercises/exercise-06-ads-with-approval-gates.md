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

## Warm-up

:::checkpoint
Q: You set a Google Ads campaign to a $20 average daily budget. On a busy Tuesday it spends $38. What happened?
- [ ] A bug; Google never spends above the daily budget
- [ ] Your agent changed the budget
- [x] Normal behavior; Google can spend up to twice the daily budget on a given day while keeping the month near 30.4 times the daily amount
Why: Google's average daily budget is a monthly average, not a daily ceiling. That's why you set and watch the overall cap yourself.
:::

## Steps

1. **Pick one platform.** Choose where your customers spend time. Groomer Books would likely test Meta (Instagram, where groomers show their work) or Google Search ("bookkeeping for groomers").

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
