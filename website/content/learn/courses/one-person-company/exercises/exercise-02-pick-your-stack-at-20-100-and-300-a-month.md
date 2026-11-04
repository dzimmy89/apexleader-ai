---
module: 1
lesson_number: 2
course: one-person-company
template: v2
---

# Exercise 2: Choose and Price Your Stack

:::key-concept
You'll pick a real AI stack for your budget tier, check every plan's current price, region and usage limits on the vendor pages, and end with a one-page Stack Decision you can act on today.
:::

**Time:** 30 minutes · **You'll need:** Your Delegation Map from Exercise 1, a browser, any AI chat · **Builds on:** Lesson 2

:::video
id: opc-ex2-setup
kind: exercise-setup
status: paused
src: /learn/video/one-person-company/opc-ex2-setup.mp4
captions: /learn/video/one-person-company/opc-ex2-setup.vtt
poster: /learn/video/one-person-company/opc-ex2-setup.jpg
transcript: One budget line, three jobs, and a stack that has to fit under it. Here's how to choose yours. In this exercise you'll pick a real AI stack and price it. Choose your tier: twenty, one hundred or three hundred dollars a month. If you're unsure, start at twenty. Copy your top three jobs from your delegation map. Draft a stack using the shapes from lesson two. Then check every plan on the vendor's own pages: price, region, waitlist and usage limits. Add up the verified prices. If you're over your line, drop the specialist with the fewest job minutes. Then write your stack decision, with a ninety-day review date. So: what's your main office, and does your verified total fit your budget? Pause here and build your stack.
:::

## Warm-up

:::checkpoint
Q: You live in the UK and want an always-on agent this month. Which is the safer first check?
- [ ] Buy ChatGPT Pro and assume dots will appear
- [ ] Join the Claude Duet waitlist and assume you'll get in
- [x] Check each product's region rules first: dots on Pro excludes the UK at launch and Duet's preview is US-only, while Grok Bot's plans should be checked on its docs
Why: Regions and waitlists decide access more than price does. Read the eligibility page before paying.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Six steps to a Stack Decision
shows: Six numbered cards, top to bottom: 1 Pick your tier ($20, $100 or $300); 2 List 3 jobs from your Delegation Map; 3 Draft the stack with the Lesson 2 shapes; 4 Verify on vendor pages, highlighted (price, region, waitlist, limits); 5 Total it, and drop a specialist if over the line; 6 Write the decision with a 90-day review.
data: none
image: /learn/figures/one-person-company/exercise-02-fig-1.webp
alt: Six steps: pick your tier of $20, $100 or $300, list your top three jobs, draft the stack, verify price, region, waitlist and limits on vendor pages, total it and drop a specialist if you are over, then write the decision with a 90-day review.
:::

1. **Pick your tier.** Write down your honest monthly AI budget: $20, $100 or $300. If unsure, start at $20. You can move up after a month of real use.

2. **List your jobs.** From your Delegation Map, copy the top three jobs by minutes from the two agent piles.

3. **Draft the stack.** Use the Lesson 2 shapes for your tier. Then run this prompt:

```text
I run [business, or "Groomer Books", a bookkeeping service for dog groomers].
Budget: [$20 / $100 / $300] a month. I am based in [country].
My top jobs to delegate: [job 1], [job 2], [job 3].
Draft stack: [plans].
Make a table: Job | Tool in my stack | Kind (chat, desktop agent, always-on) | Gap.
List any overlaps where I pay twice for the same job.
Do not state prices. List the pricing and eligibility pages I must check.
```

4. **Verify on vendor pages.** For each plan in your stack, open the vendor's pricing page and help center and note: current monthly price, your region's eligibility, whether there's a waitlist, and how usage limits work. Useful starting points:
   - Claude Duet eligibility: support.claude.com, "Get started with Claude Duet"
   - Dots eligibility: help.openai.com, "Getting started with your dot"
   - Grok Bot plans: docs.x.ai, Grok Bot FAQ, and x.ai/news/grok-bot-more-plans

5. **Total it.** Add the verified prices. If you are over your line, drop the specialist with the fewest job minutes.

6. **Write your Stack Decision** in your Delegation Map doc:

```text
STACK DECISION (date)
Tier: $___
Main office: ______ (why: ______)
Specialist(s): ______ (job it covers: ______)
Always-on agent: ______ or "not yet" (eligibility checked: yes/no)
Monthly total (verified on vendor pages): $___
Review date (90 days): ______
```

7. **Sign up for your main office only.** Leave specialists until you have used the main one for a week.

## Done when

- [ ] Your top three jobs each map to one tool, with gaps noted
- [ ] Every plan's price, region and limits were checked on the vendor's own page
- [ ] The verified total is at or under your budget line
- [ ] No two plans cover the same job
- [ ] Your Stack Decision is saved with a 90-day review date

:::example
title: See an example result
Here is a Stack Decision for the sample business, Groomer Books, using the top jobs from its example Delegation Map. Prices are examples; check the vendor pages for yours.

:::video
id: opc-ex2-reveal
kind: exercise-reveal
status: paused
src: /learn/video/one-person-company/opc-ex2-reveal.mp4
captions: /learn/video/one-person-company/opc-ex2-reveal.vtt
poster: /learn/video/one-person-company/opc-ex2-reveal.jpg
transcript: For Groomer Books, one twenty-dollar plan covers all three top jobs. Here's the example. The tier is twenty dollars a month. The top jobs from the delegation map are overdue-invoice reminders at seventy-five minutes a week, Instagram posts at forty-five, and sorting receipts at forty. All three are writing and sorting jobs, so one main office handles them: Claude Pro. It drafts the reminders and the posts, and sorts receipts in a project. The gap is posting itself, which stays manual, because nothing publishes without the founder. No two plans overlap, because there's only one. The always-on agent is the Claude Duet waitlist, after checking the account is in the US. Specialists wait until the main office has had a week of real use. And the decision has a review date, ninety days out. That's a stack decision you can act on today.
:::

:::infographic
id: fig-2
type: comparison
title: Groomer Books at $20
shows: Under "Groomer Books at $20" tagged example: three job cards (Invoice reminders 75 min, Instagram posts 45 min, Sort receipts 40 min) beside a paper card: Main office: Claude Pro. Covers all 3 jobs. Duet waitlist joined. Posting stays manual.
data: example numbers: 75, 45 and 40 minutes a week; $20 tier
image: /learn/figures/one-person-company/exercise-02-fig-2.webp
alt: Example Groomer Books stack at $20 a month: invoice reminders at 75 minutes, Instagram posts at 45 and sorting receipts at 40 all go to one main office, Claude Pro, with the Duet waitlist joined and posting kept manual.
:::

| Job | Min a week | Tool in the stack | Kind | Gap |
|---|---|---|---|---|
| Overdue-invoice reminders | 75 | Claude Pro | Chat | None: drafts only, the founder sends |
| Weekly Instagram posts | 45 | Claude Pro | Chat | Posting stays manual |
| Sort receipts into categories | 40 | Claude Pro, in a project | Chat | None |

**Overlaps:** none, because there is one plan.

```text
STACK DECISION (example)
Tier: $20
Main office: Claude Pro (why: all three top jobs are writing and sorting)
Specialist(s): none yet (job it covers: -)
Always-on agent: Claude Duet waitlist (eligibility checked: yes, US account)
Monthly total (verified on vendor pages): about $20, example only
Review date (90 days): 90 days from today
```
:::

:::coached
**For 1-on-1 coaching clients.** Price your stack against real time saved.

1. For each job, estimate hours saved per month and multiply by what your hour is worth.
2. Build two versions: the tier you planned and one tier up. Compare return per dollar.
3. List the data each tool will touch and check that tool's business data settings.

**Bring to your session:** both stack versions, the hours-saved math, and any data-handling questions.

**Your coach will:**
- Pressure-test your hours-saved estimates
- Recommend which tier to start on and what milestone triggers the upgrade
- Flag any client-data concerns before you connect accounts
:::
