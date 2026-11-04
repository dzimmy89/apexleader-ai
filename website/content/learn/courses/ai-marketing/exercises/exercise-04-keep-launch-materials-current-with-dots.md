---
module: 1
lesson_number: 4
course: ai-marketing
template: v2
---

# Exercise 4: Set Up a Launch Kit and Its Weekly Sweep

:::key-concept
You'll gather your launch assets in one folder, write the Offer Facts page they all follow, and run your first consistency sweep with a Dot (or ChatGPT as a fallback). At the end you'll have a clean launch kit and a change list you approved line by line.
:::

**Time:** 30 minutes · **You'll need:** ChatGPT with Dots (Pro or Business Premium at launch; plain ChatGPT or Claude works for the manual version), Google Drive or a ChatGPT Space, your website · **Builds on:** Lesson 4

:::video
id: mkt-ex4-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-marketing/mkt-ex4-setup.mp4
captions: /learn/video/ai-marketing/mkt-ex4-setup.vtt
poster: /learn/video/ai-marketing/mkt-ex4-setup.jpg
transcript: One Offer Facts page, one planted change, and a Dot that has to find it everywhere. Let's run your sweep. In this exercise you'll build a launch kit and test it. Create the Launch Kit folder, with every asset that describes your offer. Write Offer Facts, dated today, on one page. Then plant a change: update one fact, like a new annual plan, and leave every other asset alone. Create the Dot, connect only the kit and your site repo, and add Custom Rules: never send, publish, merge or delete. Paste the job, and run the sweep. Approve, reject or rewrite each line, and ask for marked-up drafts, never edits to originals. Then check its work. Did it catch your planted change in every place? Are its quotes accurate? Did it touch only the kit and the repo? So: who replaces the originals and merges the change? Pause here and run your sweep.
:::

## Warm-up

:::checkpoint
Q: Your Dot's Custom Rules say "require approval before sending email." It drafts a note to a partner with your new pricing. You approve that one email. What has the Dot now been allowed to do?
- [x] Send that one approved email, and nothing more
- [ ] Email that partner whenever pricing changes
- [ ] Email any partner about pricing
Why: OpenAI says approving one message does not grant ongoing permission to contact people. Each send needs its own approval unless you change the rule.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to a launch-kit sweep
shows: Seven numbered steps: 1 Launch Kit folder, 2 Offer Facts, 3 plant a change, 4 create the Dot with Custom Rules, 5 run the sweep, 6 approve line by line (highlighted), 7 check its work and merge yourself.
data: none
image: /learn/figures/ai-marketing/exercise-04-fig-1.webp
alt: Seven steps: make the Launch Kit folder; write Offer Facts; plant one change; create the Dot with Custom Rules; run the sweep; approve line by line; and check its work, then merge and replace the originals yourself.
:::

1. **Make the folder.** Create `Launch Kit` in Google Drive or a ChatGPT Space. Add every asset that describes your offer: one-pager, sales email templates, FAQ, partner blurb, and links to your homepage and pricing page. Using Rolling Ledger? Ask Claude to draft a one-pager, two sales emails and an FAQ first, then add them.

2. **Write Offer Facts.** Create a page called `Offer Facts`, dated today, with: name, who it's for, plans and prices, what's included, what's not, guarantee, three main features, launch date, key links. Keep it under one page.

3. **Plant a change.** To test the sweep, change one fact in Offer Facts (for example, add an annual plan at a discount) without updating any other asset.

4. **Create the Dot.** Name it `Launch Dot`. Connect only the Launch Kit folder (and your site repo, with pull-request permission, if you have one). In Settings, add Custom Rules: never send email or messages to anyone but you, never publish or merge, never delete files, ask before editing any original document.

5. **Give it the job.** Paste the job from Lesson 4. No Dots access? Paste the same prompt into ChatGPT or Claude and attach the files manually.

6. **Run the sweep.** Ask:

   ```text
   Run the launch-kit sweep now. Compare every asset with Offer Facts. Return a
   table: asset | current text | proposed text | Offer Facts line. Mark price,
   guarantee and legal-claim changes HIGH. Then wait for my approval.
   ```

7. **Approve line by line.** Reply with which lines to approve, reject or rewrite. Ask the Dot to create marked-up draft copies (not edit originals) and, if connected, one pull request for your site.

8. **Check its work.** Confirm it caught your planted change everywhere. Spot-check two "current text" quotes against the real assets. Open Activity View and confirm it touched only the Launch Kit and repo. Then replace the originals yourself and merge the pull request if it's right.

## Done when

- [ ] Offer Facts is dated and every asset in the Launch Kit agrees with it
- [ ] The sweep found your planted change in every place it appeared
- [ ] Custom Rules block sending, publishing, merging and deleting
- [ ] You, not the Dot, replaced the originals and merged any site change

:::example
title: See an example result
Here is the first sweep for the sample business, Rolling Ledger, after the founder planted one change: a new annual plan.

:::video
id: mkt-ex4-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-marketing/mkt-ex4-reveal.mp4
captions: /learn/video/ai-marketing/mkt-ex4-reveal.vtt
poster: /learn/video/ai-marketing/mkt-ex4-reveal.jpg
transcript: For Rolling Ledger, one planted price change turned up in five places, and the Dot found all five. Here's the example. Offer Facts now lists an annual plan: fourteen hundred ninety dollars a year, two months free, beside the hundred forty-nine dollar monthly plan. The Monday sweep returned six lines. Five were the annual plan, missing from the pricing page, the homepage, the FAQ, the one-pager and the sales email, and all five were marked high. The sixth was an old mismatch: the one-pager promised a sixty-minute onboarding call, and Offer Facts says forty-five. The founder approved five lines, and rewrote one to say billed yearly. The Dot made two marked-up drafts and one pull request for the site. Both spot-checked quotes were exact. It also flagged that Stripe has no annual price yet. That one is the founder's job, so she created it herself.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger launch-kit sweep
shows: Under "Rolling Ledger sweep" tagged example: 6 mismatches found, 5 of them HIGH (the annual plan missing on five assets), 1 normal (onboarding call length). Below: 5 approved, 1 rewritten; 2 drafts and 1 pull request. A separate flag: Stripe has no annual price, founder only.
data: example numbers: 6 lines, 5 HIGH; 2 drafts, 1 pull request; 1 Stripe flag
image: /learn/figures/ai-marketing/exercise-04-fig-2.webp
alt: Example sweep for Rolling Ledger: 6 mismatches, 5 marked HIGH because the new annual plan was missing from five assets, and 1 about the onboarding call length. Five lines were approved and one rewritten. The Dot prepared 2 drafts and 1 pull request, and flagged that Stripe has no annual price, which the founder created herself.
:::

```text
OFFER FACTS (example, dated Nov 2, 2026)
Name: Rolling Ledger
For: independent food truck owners, 1 to 3 trucks
Plans: Monthly $149 a month. Annual $1,490 a year (two months free)   <- planted change
Included: monthly bookkeeping, invoicing, a monthly report, a 45-minute onboarding call
Not included: tax filing (we prepare the packet for your accountant), payroll
Guarantee: cancel any month, no fee
Features: receipts by photo, cash sales log, fuel and commissary tracking
Links: rollingledger.com/pricing, rollingledger.com/start
```

| # | Asset | Current text | Proposed text | Offer Facts line | Priority |
|---|---|---|---|---|---|
| 1 | Pricing page | One plan: $149 a month | $149 a month, or $1,490 a year (two months free) | Plans | HIGH |
| 2 | Homepage | Simple pricing: $149 a month | Simple pricing: $149 a month or $1,490 a year | Plans | HIGH |
| 3 | FAQ | Do you offer annual billing? Not yet. | Yes: $1,490 a year, two months free. | Plans | HIGH |
| 4 | One-pager | $149/month | $149 a month or $1,490 a year | Plans | HIGH |
| 5 | Sales email template | It's $149 a month, cancel anytime. | It's $149 a month, or $1,490 a year, cancel any month. | Plans, Guarantee | HIGH |
| 6 | One-pager | 60-minute onboarding call | 45-minute onboarding call | Included | Normal |

**Founder's reply:** approve 1, 2, 3, 4, 6. Rewrite 5: "$149 a month, or $1,490 a year billed yearly." The Dot made two marked-up drafts (one-pager, sales email) and one pull request covering the homepage, pricing page and FAQ. Both spot-checked quotes were exact, and Activity View showed only the Launch Kit and the repo. The founder merged the pull request, replaced the originals, and created the annual price in Stripe herself.
:::

:::coached
**For 1-on-1 coaching clients.** Extend the kit to your whole public footprint:

1. Add your directory listings, Google Business Profile text and social bios to the sweep (read-only), so mismatches outside your site show up too.
2. Add a "claims check" step: the Dot lists every claim in your assets that has no source in Offer Facts.
3. Schedule the sweep weekly and run it for two weeks.

**Bring to your session:** Offer Facts, two weeks of sweep tables, your Custom Rules and the list of unsourced claims.

**Your coach will:**
- Review your claims list and decide with you what to cut, prove or soften
- Check that your Custom Rules and connectors match the job, nothing wider
- Help you decide which assets deserve a faster update cycle
:::
