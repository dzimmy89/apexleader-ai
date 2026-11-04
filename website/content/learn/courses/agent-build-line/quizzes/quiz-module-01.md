# Module 1 Quiz: The Agent Build Line
Checks whether you can let agents build on safe copies, review their work from previews, run them in parallel, keep their costs down and leave them working overnight, while every change to live stays yours.

---

## Question 1
Your agent needs to add a table to your database. Where does it work?

- A) On the live project, with approval on
- B) On a separate dev project with made-up data, scoped with `project_ref`
- C) On the live project, read-only
- D) On a copy of the live data downloaded to your laptop

**Answer:** B

**Explanation:** Agents build on a dev project with made-up data. The change is saved as a migration and reaches live only after you review it in a pull request.

---

## Question 2
What does row-level security do for the Rolling Ledger portal?

- A) Speeds up queries
- B) Encrypts receipt photos
- C) Lets each truck owner see and add only their own receipts
- D) Stops the agent from connecting

**Answer:** C

**Explanation:** Row-level security is a database rule that limits each signed-in user to their own rows. Every table that holds customer data needs it.

---

## Question 3
Which Stripe key should an everyday reporting agent hold?

- A) The live secret key
- B) A restricted key with Read on the few resources it needs
- C) A sandbox key
- D) Your Stripe password

**Answer:** B

**Explanation:** A restricted key can only do what you ticked. With read access the agent answers billing questions, and Stripe refuses if it tries to refund or cancel.

---

## Question 4
Vercel's Preview environment should hold which values?

- A) Live database and live Stripe keys, to test for real
- B) Dev database and Stripe sandbox keys
- C) No values at all
- D) Whatever the agent sets

**Answer:** B

**Explanation:** Previews run unreviewed changes. With dev and sandbox values, even a broken preview can't touch a real customer or charge a real card.

---

## Question 5
How do you make sure the agent can open pull requests but never merge them?

- A) Tell it in the prompt
- B) Deny `mcp__github__merge_pull_request` in `.claude/settings.json` and require pull requests for `main`
- C) Don't give it GitHub access
- D) Merge everything quickly before it can

**Answer:** B

**Explanation:** A prompt is a request; a deny rule is a lock. The branch rule makes every change to live go through a pull request, which you merge.

---

## Question 6
You want to run three agents at once. What decides which jobs can run in parallel?

- A) Whichever jobs are most urgent
- B) Jobs that touch different files, each in its own worktree
- C) Jobs given to the same agent
- D) Any three jobs; worktrees stop all conflicts

**Answer:** B

**Explanation:** Worktrees keep agents from overwriting each other's files, but changes to the same file still conflict at merge time. Jobs that share files run one after the other.

---

## Question 7
Headroom's site says it can save over 90% of tokens. How do you decide whether to keep it?

- A) Trust the number
- B) Run the same real job with and without it, and compare usage and quality
- C) Keep it if the install works
- D) Drop it; savings tools never help

**Answer:** B

**Explanation:** Vendor numbers come from their test projects. Only your own before-and-after test on a real job, with the quality checked, tells you what it saves on your work.

---

## Question 8
An overnight job's tests keep failing. What should its stop rule make the agent do?

- A) Keep trying until morning
- B) Change the tests so they pass
- C) Stop after three tries and open a draft pull request explaining what failed
- D) Merge it anyway so you can fix it live

**Answer:** C

**Explanation:** A stop rule limits the cost of a stuck job and leaves you a useful note. Never let an agent change the tests to make them pass.
