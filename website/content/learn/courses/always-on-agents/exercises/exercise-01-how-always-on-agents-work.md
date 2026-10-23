---
module: 1
lesson_number: 1
course: always-on-agents
template: v2
---

# Exercise 1: Write Your First Always-On Job Spec

:::key-concept
You'll turn one recurring chore into an always-on job spec with a trigger, action, gate and report, plus a list of the apps it needs and how it will reach them. You'll use this spec to set up Duet, a dot or a Grok Bot in the next exercises.
:::

**Time:** 25 minutes · **You'll need:** Any AI chat, your Delegation Map from The One-Person Company course if you have it · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: Which job is a true always-on job?
- [ ] Write a one-off blog post about our launch
- [x] Every weekday morning, flag client emails waiting over 24 hours and draft replies for my approval
- [ ] Brainstorm names for a new service
Why: It has a trigger (each morning), an action, a gate (approval) and a report. One-off creative work suits a chat tool.
:::

## Steps

1. **Pick the business.** Use yours, or the sample *Groomer Books*: bookkeeping and invoicing for independent dog groomers, run by one founder.

2. **List trigger moments.** Write five moments last month when you wished someone had noticed something first: a late invoice, a missed email, a calendar clash, a lead that went cold, a supplier price change.

3. **Choose one** that repeats at least weekly and touches no money directly.

4. **Write the spec** using this format:

```text
JOB NAME:
TRIGGER: (schedule or event: "every weekday 7 a.m.", "new email from a client")
ACTION: (what it does, in steps)
GATE: (what it must not do without me; what it never does)
REPORT: (what it tells me, where, how often)
APPS: (each app, and: connector / computer use / not needed)
ACCESS LEVEL: (read / draft / act, per app)
```

5. **Pressure-test it** with an AI chat:

```text
Here is a job spec for an always-on AI agent: [paste].
Find: any step that sends something outside the business without my approval;
any access beyond what the job needs; anything involving money; any trigger
that is vague. Also tell me what could go wrong if an urgent item arrives
between the agent's checks. Suggest fixes. Keep it under 200 words.
```

6. **Apply the fixes.** Make sure the gate covers sends, posts, deletes and settings, and that money is "never".

7. **Save** as "Always-On Job Spec 1".

## Done when

- [ ] The spec has all seven fields filled in
- [ ] The trigger is specific (a time or an event)
- [ ] Every app has a route (connector or computer use) and the lowest access level that works
- [ ] The gate covers sends, posts, deletes and money
- [ ] You've noted how you'll handle urgent items that land between checks

:::coached
**For 1-on-1 coaching clients.** Write three specs, not one, from your real business.

1. Write specs for three different triggers: one inbox-based, one calendar-based, one web-app routine.
2. For each, estimate weekly minutes saved and the worst realistic mistake.
3. Rank them by minutes saved divided by risk.

**Bring to your session:** the three specs and your ranking.

**Your coach will:**
- Tighten triggers and gates on each spec
- Match each spec to Duet, a dot or a Grok Bot
- Pick which one goes live this week
:::
