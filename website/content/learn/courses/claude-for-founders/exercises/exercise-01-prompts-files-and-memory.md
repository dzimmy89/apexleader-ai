---
module: 1
lesson_number: 1
course: claude-for-founders
template: v2
---

# Exercise 1: Write Your Founder Brief and Train Claude's Memory

:::key-concept
You'll write a one-page founder brief, use it to produce a real piece of customer-facing copy, and set up Claude's memory so it knows your business going forward. At the end you have a reusable brief, a cold email draft, and a clean memory you have checked yourself.
:::

**Time:** 25 minutes · **You'll need:** A Claude account (Free is fine), one business file such as a price list or notes · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: Which prompt will get the most useful first draft?
- [ ] "Write me a marketing email."
- [x] A prompt that names the role, your customer and offer, the task, and the length and tone you want
- [ ] A very long prompt that lists every idea you have ever had about the business
Why: A brief with role, context, task and output gives Claude what it needs without burying the task in noise.
:::

## Steps

1. Pick your business. If you don't have one finalized, use the sample: Groomer Books, monthly bookkeeping for independent dog grooming salons.
2. Open a new chat in Claude (memory on) and paste this prompt:

```text
I'm a solo founder. Interview me to write a one-page FOUNDER BRIEF I can reuse
at the start of important chats. Ask me one question at a time, up to 8 questions,
covering: business, customer, offer, pricing model, voice, goals this quarter,
and rules you must never break. Then write the brief in under 200 words using
short labeled lines.
```

3. Answer the questions. Then ask for one revision: "Tighten the customer line so it names a specific type of owner and a specific pain."
4. Save the final brief in a document on your computer called `founder-brief.md` or a note you can find again.
5. Attach one real file (a price list, call notes, or a competitor's page saved as PDF) and run:

```text
Using my founder brief above and the attached file, write a first-touch cold email
to my ideal customer. Under 120 words, one call to action, two subject lines.
Then list any facts you assumed that are not in the brief or file.
```

6. Fix any wrong assumptions Claude listed by replying with the correct facts. Keep the final email.
7. Tell Claude what to remember:

```text
Please remember these facts about my business for future chats: [paste the
Business, Customer, Offer and Voice lines from the brief].
```

8. Open Settings > Memory, look under Topics, and confirm the facts are there. Edit anything that is wrong and delete anything stale or personal you don't want used.
9. Start an incognito chat (ghost icon) and ask "What do you know about my business?" Note that it knows nothing. Then start a normal new chat and ask the same question.

## Done when

- [ ] You have a saved founder brief under 200 words
- [ ] You have a cold email draft with no invented facts
- [ ] Settings > Memory shows your business facts and nothing you didn't want saved
- [ ] You have seen the difference between an incognito chat and a normal chat

:::coached
**For 1-on-1 coaching clients.** Do this on your real business, and push it further:

1. Write two versions of the founder brief: one for your current customer and one for the customer you want in 12 months.
2. Generate three cold emails from each brief and pick the one you would actually send.
3. Upload a real sales or pipeline export (personal data removed) and have Claude produce a one-page "where my revenue comes from" summary.

**Bring to your session:** both briefs, your chosen email, the revenue summary, and a screenshot of your Memory topics.

**Your coach will:**
- Pressure-test your customer definition and offer wording
- Review your memory entries and prune anything that will steer Claude wrong
- Help you pick which brief to run with this quarter
:::
