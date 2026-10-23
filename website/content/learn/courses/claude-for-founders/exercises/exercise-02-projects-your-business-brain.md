---
module: 1
lesson_number: 2
course: claude-for-founders
template: v2
---

# Exercise 2: Build Your Company HQ Project

:::key-concept
You'll build a working "Company HQ" Project with instructions, five knowledge files and a decision log, then test it on a real planning question. At the end you have a business brain that every future strategy chat starts from.
:::

**Time:** 30 minutes · **You'll need:** Your founder brief from Exercise 1, a Claude account (Free allows up to 5 Projects) · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: Which file will most reduce the number of times you re-explain past choices to Claude?
- [ ] A copy of every email you sent last month
- [x] A dated decision log with one-line reasons
- [ ] A long history of your industry
Why: A decision log tells Claude what is already settled and why, so it builds on decisions instead of reopening them.
:::

## Steps

1. Go to Projects and click **+ New Project**. Name it "Company HQ" (or "Groomer Books HQ" if you're using the sample business).
2. Click **Set project instructions** and paste the template from Lesson 2. Replace the business details with yours. Keep the Never list, including "Never give tax or legal advice" and the DRAFT FOR FOUNDER APPROVAL rule.
3. Create your knowledge files. If you don't have them yet, have Claude draft them in a normal chat, then review each one before you upload:

```text
Using my founder brief below, draft three short documents, each under one page:
1) OFFER AND PRICING: what we sell, who it's for, price, what's included and excluded.
2) BRAND VOICE: 6 rules for how we write, plus 2 short examples and 2 "never write like this" examples.
3) CUSTOMER NOTES: the top 8 questions or objections our customer is likely to have.
Mark anything you guessed with [CHECK].

[paste founder brief]
```

4. Fix every [CHECK] item with real facts or remove it. Do not upload guesses as facts.
5. Create a fifth file called DECISION LOG with today's date and at least three decisions you have already made (for example: "Flat monthly fee, not hourly, because owners hate surprise bills").
6. Upload all five to the Project knowledge panel with **+**.
7. Start a chat inside the Project and run this test:

```text
Using only project knowledge, give me a 30-day plan to land my first 3 customers.
One page. Week by week. End with the single riskiest assumption in the plan.
```

8. Check the answer for invented facts. If you find one, add the true fact to the right knowledge file and re-upload it.
9. At the end of the chat, ask Claude to summarize the decisions you made as dated bullets. Add them to the decision log and re-upload.

## Done when

- [ ] Company HQ exists with instructions that include Always and Never lists
- [ ] Five knowledge files are uploaded, with no [CHECK] guesses left in them
- [ ] A 30-day plan was produced without you re-explaining your business
- [ ] The decision log has at least five dated entries

:::coached
**For 1-on-1 coaching clients.** Build the full three-Project setup for your real business:

1. Create Company HQ, Marketing and Sales, and Operations, each with its own instructions.
2. Turn off "Use account memory" on one Project and test that it does not know your account facts.
3. Run the same planning prompt in Company HQ and in a plain chat, and compare the quality.

**Bring to your session:** your three sets of Project instructions, your knowledge file list, and both versions of the plan.

**Your coach will:**
- Tighten your instructions so they are specific and testable
- Spot knowledge files that are stale, too long, or contain data that should not be there
- Agree a weekly 10-minute maintenance routine with you
:::
