---
module: 1
lesson_number: 3
course: claude-code
template: v2
---

# Exercise 3: Ship a Pricing Page with a Working Savings Calculator

:::key-concept
You'll build the Pricing page you planned in Exercise 2, including an interactive calculator with tests that prove the math, and check it like a customer on phone and desktop. At the end your site has a real, tested feature and a list of placeholders you need to fill in.
:::

**Time:** 45 minutes · **You'll need:** Claude Code, your website project with CLAUDE.md and PLAN-pricing.md from Exercise 2 · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: What makes it safe to let Claude work on the calculator with fewer interruptions?
- [ ] A longer prompt
- [x] A set of known answers and a test Claude can run to check itself
- [ ] Turning off CLAUDE.md
Why: A runnable check lets Claude iterate until the result is right, instead of stopping when the code merely looks done.
:::

## Steps

1. Open the project in Claude Code. Choose **Accept edits** (Edit automatically) or **Manual** mode for this first feature.
2. Build step 1:

```text
Read CLAUDE.md and PLAN-pricing.md. Build step 1 only: the Pricing page
structure and copy with placeholder prices, and a nav link from the home page.
Stop when done and summarize what changed in plain English.
```

3. Open the page in your browser. Give at least two pieces of specific feedback on copy or layout.
4. Build step 2, the calculator, with checks. Use the sample (bookkeeping hours vs flat fee) or adapt it to your business (for example, "cost of a missed booking" or "hours saved per week"):

```text
Build the calculator on the Pricing page in plain JavaScript.
Inputs: [input 1 with range], [input 2 with range].
Output: [what it shows]. Put any fee or rate in a constant at the top of the script.
These must be true:
- [known case 1, e.g. 10 hours at $50 = $500]
- [zero case gives $0 with no error]
- [empty or negative input shows a friendly message, never NaN]
- [money shows with $ and commas]
Write a small test file for these cases, run it, fix any failures,
and show me the test output.
```

5. Read the test output. Then try the calculator yourself with the same numbers and two numbers of your own.
6. Check mobile:

```text
Check the Pricing page at 375px wide. List anything that overflows, overlaps,
or has text under 16px, then fix it and tell me what you changed.
```

7. Practice recovery: ask for a change you don't like (for example "make the page dark purple"), then use Esc twice or `/rewind` to restore the code to the checkpoint before it.
8. Review all changes: open the diff view in the desktop app, or ask "List every file you changed in this task and why." Confirm nothing unexpected was added (tracking, new libraries, changed prices).
9. Run the finish prompt from Lesson 3 and save the list of placeholders it gives you.
10. Run `/clear` to end the task.

## Done when

- [ ] The Pricing page exists, is linked from the home page and reads well on a phone
- [ ] The calculator passes tests for your known cases, and you saw the test output
- [ ] You used rewind or undo at least once
- [ ] You reviewed every changed file and have a written list of placeholders to fill in

:::coached
**For 1-on-1 coaching clients.** Build a feature your real business needs:

1. Choose one: a quote estimator, a booking request form that emails you (no payments), or an FAQ search.
2. Use the "interview me" prompt to write SPEC.md, plan it in plan mode, then build it in steps with tests.
3. Ask a subagent-style review: "Review this feature against SPEC.md and list gaps that affect correctness, not style."

**Bring to your session:** SPEC.md, the test output, screenshots at phone and desktop width, and the review findings.

**Your coach will:**
- Test the feature live like a customer would
- Check the numbers, copy and any data the feature collects
- Help you decide what is ready to go live and what needs another pass
:::
