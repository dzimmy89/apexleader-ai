---
module: 2
lesson_number: 9
course: ai-sales
template: v2
---

# Exercise 9: Your Outbound One-Pager and First Scorecard

:::key-concept
You'll write a one-page outbound plan that gives every channel a tool, a sender, a cap and a stop rule, add a Source field to your CRM, and produce your first Friday scorecard from the logs in Exercises 7 and 8. At the end you have the sales numbers your Capstone operating rhythm will run on.
:::

**Time:** 35 minutes · **You'll need:** Your Lead list workbook (Outreach queue and Test log tabs), your CRM from Exercise 3, Duet or a Claude Project with access to the sheet · **Builds on:** Lesson 9

:::video
id: sales-ex9-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-sales/sales-ex9-setup.mp4
captions: /learn/video/ai-sales/sales-ex9-setup.vtt
poster: /learn/video/ai-sales/sales-ex9-setup.jpg
transcript: One page, one row per channel, and a verdict every Friday. Let's score your outbound. In this exercise you'll write your plan and fill your first scorecard. Create an outbound plan doc with six columns: channel, tool, who sends, daily cap, lead source and stop rule. Fill one row for every channel you run. Compare your lead lists across tools and your do-not-contact tab, and remove any lead that appears in two cold channels. Add a source field to your CRM, and fill it for every lead from this module. Tag the link in your sequence with UTM codes. Build a scorecard tab, and enter this week's numbers. Give the Friday prompt to Duet or a Claude project, paste its answer under the scorecard, and check one of its claims. Then write keep, fix or stop next to each channel. So: which channel earns the most per hour of your time? Pause here and score your week.
:::

## Warm-up

:::checkpoint
Q: Your LinkedIn account is shared by two businesses you run. How should you set the daily connection-request cap?
- [ ] Give each business its own 10-a-day cap, for 20 total
- [x] Set one cap for the account and split it between the businesses in writing
- [ ] Skip the cap on days you're busy and catch up later
Why: LinkedIn sees one account, not two businesses. The cap protects the account, so it has to cover everything sent from it.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to your first scorecard
shows: Seven numbered steps: 1 Outbound plan, 2 Check overlap, 3 Source field, 4 Tag links, 5 Scorecard, 6 Friday summary, 7 Verdicts (highlighted).
data: none
image: /learn/figures/ai-sales/exercise-09-fig-1.webp
alt: Seven steps. 1. Outbound plan: a row per channel. 2. Check overlap: one cold channel each. 3. Source field: set once. 4. Tag links: UTM codes. 5. Scorecard: this week's numbers. 6. Friday summary: check one claim. 7. Verdicts: keep, fix or stop.
:::

1. **Write the plan.** Create a doc called "Outbound plan" with a table: Channel, Tool, Who sends, Daily cap, Lead source, Stop rule. Fill one row for each channel you'll run in the next 30 days. Leave out any channel you won't run.

2. **Check for overlap.** Compare the lead lists in Origami and Explee with each other and with your Do not contact tab. Remove any lead that appears in two cold channels.

3. **Add the Source field.** In your CRM, add a Source field with these values: Origami email, Origami LinkedIn, Explee, Sales Bot, X, Inbound. Fill it for every existing lead from this module.

4. **Tag your links.** Rewrite the link in step 1 of your Origami sequence with UTM tags (`utm_source=origami&utm_medium=email&utm_campaign=` plus your play name). Do the same for any link in Explee's template.

5. **Build the Scorecard tab.** Add columns: Week, Channel, Sent, Replies, Positive replies, Opt-outs or complaints, Calls booked, Spend, Cost per positive reply. Fill this week's rows from your Outreach queue and Test log.

6. **Get the Friday summary.** Give Duet or your Claude Project the Friday prompt from Lesson 9. Paste its answer under the scorecard. Check one of its numbers against the sheet.

7. **Give each channel a verdict.** Next to each channel, write Keep, Fix (with the one thing you'll change) or Stop.

## Done when

- [ ] Your Outbound plan has a tool, sender, daily cap, lead source and stop rule for every channel you run
- [ ] No lead is in two cold channels at once
- [ ] Every lead from this module has a Source value in the CRM
- [ ] Your sequence links carry UTM tags
- [ ] The Scorecard tab has this week's numbers, an agent summary you checked, and a verdict per channel

:::example
title: See an example result
Here is the outbound one-pager and first Friday scorecard for the sample business, Rolling Ledger.

:::video
id: sales-ex9-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-sales/sales-ex9-reveal.mp4
captions: /learn/video/ai-sales/sales-ex9-reveal.vtt
poster: /learn/video/ai-sales/sales-ex9-reveal.jpg
transcript: For Rolling Ledger, the first scorecard named a clear winner, and one channel to fix. Here's the example. The plan has four channels: Origami cold email, Sales Bot personal email, the Explee test, and X. The overlap check found three trucks in both the Origami and Explee lists, so they were removed from Explee. Forty-five leads now carry a source. This week, Origami email sent fifty, with three positive replies and two calls booked, at about eight dollars a positive reply. The Sales Bot's personal emails sent twenty-five, with four positive replies and three calls, at no extra cost. Explee sent two hundred fifty, with one positive reply and no calls, for ten dollars. X sent ten messages, with one positive reply. The agent's summary said personal email produced the most positive replies per hour, and the founder checked that against the sheet. Verdicts: keep Origami, keep the Sales Bot, keep X, and fix Explee with a tighter audience.
:::

:::infographic
id: fig-2
type: chart
title: Rolling Ledger Friday scorecard
shows: Under "Rolling Ledger, week of Nov 9" tagged example: four channel rows with positive replies as bars: Sales Bot 4 (highlighted, most per hour), Origami email 3, Explee 1, X 1. Verdict pills: Keep, Keep, Fix, Keep.
data: example numbers: positive replies 4, 3, 1, 1
image: /learn/figures/ai-sales/exercise-09-fig-2.webp
alt: Example Friday scorecard for Rolling Ledger: Sales Bot personal email 4 positive replies, Origami email 3, Explee 1 and X 1. Personal email produced the most positive replies per hour. Verdicts: keep the Sales Bot, Origami and X, and fix Explee.
:::

| Channel | Tool | Who sends | Daily cap | Lead source | Stop rule |
|---|---|---|---|---|---|
| Cold email | Origami Sequencer | Tool, after my approval | 10 per inbox | Origami hiring-signal play | Bounces over 2% or any spam complaint |
| Personal email | Sales Bot | Me | 5 | Top-scored Lead list rows | None, low volume |
| New-audience test | Explee | Tool, after my review | $10 a day | Explee suggestion, pruned | No positive reply after $50 |
| X | Grok Bot finds and drafts | Me | 10 DMs | Public posts with a buying signal | Any X warning |

**Overlap:** 3 trucks were in both the Origami and Explee lists, so they were removed from Explee. **Source:** filled for all 45 leads from this module. **Link:** `?utm_source=origami&utm_medium=email&utm_campaign=hiring-signal`.

| Week | Channel | Sent | Replies | Positive | Opt-outs | Calls booked | Spend | Cost per positive reply |
|---|---|---|---|---|---|---|---|---|
| Nov 9 | Origami email | 50 | 6 | 3 | 1 | 2 | $25 (plan share) | $8.33 |
| Nov 9 | Sales Bot | 25 | 7 | 4 | 0 | 3 | $0 extra | $0 |
| Nov 9 | Explee | 250 | 6 | 1 | 2 | 0 | $10 | $10 |
| Nov 9 | X | 10 | 2 | 1 | 0 | 0 | $0 | $0 |

**Agent summary (checked):** personal email produced the most positive replies per hour of the founder's time; no channel hit its stop rule; test a shorter first line in Origami step 1. **Verdicts:** Origami Keep, Sales Bot Keep, X Keep, Explee Fix (audience: trucks with a review in the last 90 days).
:::

:::coached
**For 1-on-1 coaching clients.** Set a 30-day outbound experiment.

1. Pick one channel to improve and write one hypothesis (for example "a shorter step 1 gets more positive replies").
2. Define the measure and the stop rule before you start.
3. Schedule the Friday summary as a weekly routine in Duet or your Claude Project.

**Bring to your session:** your Outbound plan, scorecard and hypothesis.

**Your coach will:**
- Pressure-test the plan against your offer and the hours you have
- Check caps and stop rules, especially on shared accounts
- Agree the 30-day experiment and how you'll review it
:::
