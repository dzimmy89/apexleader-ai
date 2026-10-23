---
module: 1
lesson_number: 3
course: run-the-company
template: v2
---

# Lesson 3: Review, Fix and Scale

:::key-concept
At the end of the week, you review your company the way a manager reviews a team: what got done, what went wrong, what each agent cost, and what each one earned. Then you make three kinds of change: fix a job description, pull back access, or give a proven agent a little more scope. Scope is earned in clean weeks, never assumed.
:::

## What you'll be able to do

- Score each agent on a one-page report card using the week's logs
- Turn every correction into a permanent fix in that agent's job description
- Run a monthly access and cost audit
- Decide when to scale an agent, add a new one, or retire one

## Why this matters

Agents don't get better on their own. A Grok Bot keeps its role context and a Dot learns your preferences, but the instructions you wrote in week one still drive most of their behavior, and they will repeat the same mistake until you change them. Meanwhile, routines keep running, logins pile up, and usage quietly grows. The Friday review is where you turn a week of small frustrations into lasting fixes, and where you make growth decisions with evidence instead of excitement.

## Step 1: Gather the evidence

You built the inputs during the week:

- **Scorecard** from Monday, updated with Friday's numbers
- **Decision Log** from the Monday session
- **Triage Log** and the Friday summary from Exercise 2
- **Corrections** doc with every miss
- Each agent's activity record: Grok Bot routine run history, Dot Activity View, your builder's merged pull requests, Duet's thread

Ask Duet (or your fallback) to assemble a first draft, then check it:

```text
Using the Scorecard, Decision Log, Triage Log and Corrections docs for this week,
draft a one-page review:
1. Scorecard: each number vs target, on track / watch / off track
2. For each agent: tasks completed, corrections needed, approvals it asked for,
   anything it did outside its written job
3. The 3 biggest time sinks for me this week
4. Draft fixes: one proposed change per agent
Use only what's in the docs. Mark anything uncertain. Don't send this to anyone.
```

## Step 2: The agent report card

Score each agent on the same five lines. Keep it honest and short.

| Line | Question | Good looks like |
|---|---|---|
| Output | Did it do the assigned work? | All assignments done or clearly blocked |
| Accuracy | How many corrections did it need? | Falling week over week |
| Boundaries | Did it stay inside its job and ask at the right points? | Zero actions outside scope, no surprise sends |
| Your time | How long did its approvals and fixes take you? | Shrinking; well under its time saved |
| Cost | What did it use this week (plan usage, add-on usage, ad spend it recommended)? | Inside the budget you set |

A report card with a "boundaries" problem is never a scaling candidate that week, however good the output.

## Step 3: Fix, don't fume

Every line in your Corrections doc becomes one of three fixes:

1. **Instruction fix.** The agent didn't know. Add a line to its job description, skill or Custom Rules. Example: "Never use customer names in posts without a 'permission: yes' note in the calendar."
2. **Access fix.** The agent could reach something it shouldn't, or couldn't reach what it needed. Remove access, or add the smallest access that solves it.
3. **Process fix.** The handoff was the problem. Example: the Sales Bot's report arrived after Duet's brief ran, so move the routine to 7:30 AM.

Ask the agent itself to propose the instruction fix, then edit it yourself:

```text
This week you made these mistakes (pasted from Corrections). For each, propose
one line to add to your job description or skill that would prevent it. Don't
change anything yet. Show me the full updated job description for approval.
```

Test the change on a safe input before the next live run. For Grok Bot routines, that's Test run; for a Dot, give it a one-off sample task; for Duet, tell it in the thread and watch Monday's brief.

:::warning
Once a month, run an access audit. List every agent, every account it can log into, its role, and when you last reviewed it. Remove anything unused. Rotate any API key that was ever pasted somewhere it shouldn't have been. On Grok Bot, remember all Bots share one computer: sign out of sites no Bot needs. A forgotten login is a risk with no upside.
:::

## Step 4: Decide what to scale

Use simple, written rules so excitement doesn't make the call.

**Give an agent more scope** when it has had two to four clean weeks: no boundary problems, corrections trending down, and its numbers reliable when you spot-check them. Scale in one small step: one new channel, one new task type, or a slightly larger ad budget you approve. The approval gates on public actions and money never go away.

**Add a new agent** when one job keeps showing up in your Triage Log as delegated work that no agent owns, and it takes you more than an hour a week. Write its job description, access table and report format before you create it.

**Retire or pause an agent** when it costs you more time in corrections and approvals than it saves, three weeks running. Pause its routines, sign it out, remove its access, and keep its last job description in case you return to it.

**Upgrade your plan** only when a usage limit blocks work on your scorecard priorities, not because a new feature looks good. Compare against the stack you chose in Start Here, and check the vendors' current pricing pages.

```text
Here are my agent report cards for the last 3 weeks (pasted). Apply these rules:
[paste the scale, add, retire rules]. For each agent, recommend: keep as is,
scale (name the one step), fix (name the fix), or retire. Explain in one line each.
```

The recommendation is input. The decision is yours, written in your Decision Log.

:::try-it
Pick the agent that annoyed you most this week. Write the one sentence you wish its instructions had said. Paste it into its job description now. That's a fix most founders never make.
:::

## Step 5: Close the loop

Finish the review by writing next Monday's starting point: what you changed in each agent, what you're testing, and any scorecard target you're adjusting. Put it at the top of the reports place so Monday's session starts there. That is the whole operating system: Monday sets the week, the daily brief runs it, Friday improves it. Repeat it, and the company gets a little better every week while your hours stay about the same.

:::checkpoint
Q: Your Marketing Bot had excellent results this week but once posted a reply to a customer comment without approval. Should you expand its scope next week?
- [ ] Yes, its results earned it
- [x] No; fix the boundary first (instructions, Ask first rule, scheduler role) and require clean weeks before any new scope
- [ ] Yes, but only to one more channel
Why: Boundary problems disqualify scaling that week. Results don't make an unapproved public action acceptable.
:::

:::takeaways
- Review each agent on output, accuracy, boundaries, your time and cost
- Every correction becomes an instruction, access or process fix, tested before the next live run
- Audit access and costs monthly; remove what isn't used
- Scale in small steps after clean weeks; approvals on public actions and money stay forever
:::

## Go deeper

- [Grok Bot: Manage and protect](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - recommended practices for reviewing connectors, routines and access
- [Grok Bot: Skills, routines and automations](https://docs.x.ai/grok-bot/skills-routines-and-automations) - editing skills, Test run and routine run history
- [OpenAI Help: Dots privacy, security and safety FAQs](https://help.openai.com/en/articles/20001529-dots-privacy-security-and-safety-faqs) - Activity View, Custom Rules and what approvals cover
- [SiliconANGLE: Anthropic introduces Claude Duet](https://siliconangle.com/2026/10/22/anthropic-introduces-claude-duet-a-proactive-ai-agent-for-professionals/) - Duet's limits and why to check its judgment
