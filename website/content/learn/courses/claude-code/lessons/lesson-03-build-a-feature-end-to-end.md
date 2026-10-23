---
module: 1
lesson_number: 3
course: claude-code
template: v2
---

# Lesson 3: Build a Feature End to End

:::key-concept
A feature is done when it works, not when the code is written. The reliable loop is: plan, build in small steps, have Claude verify its own work against a check it can run, review the result yourself, then save. Give Claude a way to prove the feature works and you can step away while it builds.
:::

## What you'll be able to do

- Turn an approved plan into working code in small, reviewable steps
- Give Claude verification criteria so it checks its own work
- Review changes in the diff view and steer with specific feedback
- Undo a bad direction with checkpoints and rewind

## Why this matters

Claude Code can write a lot of code fast. The risk for a non-developer is not that it can't build; it's that it builds something that looks done and isn't: a calculator that gives wrong numbers, a page that breaks on a phone. Your job as founder is to define "done" and check the evidence. This lesson gives you the loop that makes that easy.

## The feature: a pricing page with a savings calculator

You'll build what you planned in Lesson 2: a Pricing page with three plans and an FAQ, plus a small interactive calculator. For the sample business, the calculator answers a salon owner's real question: "Is it worth paying someone to do my books?" The owner enters hours per month spent on bookkeeping and what an hour of their time is worth; the page shows the monthly cost of doing it themselves next to the flat fee.

This is a good first feature because it has words (copy), layout (design) and logic (math). Each needs a different kind of check.

## Step 1: Start from the plan

Open your project and point Claude at the plan you saved:

```text
Read CLAUDE.md and PLAN-pricing.md. Build step 1 only: the Pricing page
structure and copy with placeholder prices. Link it from the home page nav.
Stop when step 1 is done and show me what changed.
```

Small steps beat one giant request. You can review each piece, and if one goes wrong, you only redo that piece.

Pick your permission mode for building. **Auto** lets Claude work with background safety checks. **Accept edits** (shown as "Edit automatically" in the terminal) applies file edits without asking but still asks before other commands. **Manual** asks before every edit. For your first features, Accept edits or Manual keeps you close.

## Step 2: Give Claude a way to check its work

Anthropic's top recommendation for Claude Code is to give Claude a check it can run. Without one, "looks done" is the only signal, and you become the tester. With one, Claude does the work, runs the check, reads the result and fixes problems until it passes.

For the calculator, the check is a set of known answers:

```text
Now build step 2: the savings calculator on the Pricing page, in plain JavaScript.
Inputs: hours per month (0 to 100) and value of my hour in dollars (0 to 500).
Output: "Doing it yourself costs about $X per month" and the difference vs our fee.
Use a fee constant at the top of the script so I can change it later.

These must be true:
- 10 hours at $50 = $500 per month
- 0 hours = $0, and no error
- Empty or negative inputs show a friendly message, not NaN
- Numbers display with a $ and commas, like $1,250

Write a small test file that checks these cases, run it, and fix anything
that fails. Show me the test output.
```

Notice the last line. Ask for evidence (the test output, the command and what it returned), not just "it works." Reviewing evidence is faster than testing everything yourself. You'll go deeper on tests in Lesson 4.

## Step 3: Check it like a customer

Code checks catch math errors. They don't catch an ugly page. For layout and copy, look at it yourself and give specific feedback.

- Open the page in your browser. In the desktop app, when Claude runs a local preview, the page can open in the **Browser** pane, where Claude can also see it.
- Shrink the window to phone width, or ask Claude to check it:

```text
Check the Pricing page at 375px wide. List anything that overflows, overlaps,
or has text smaller than 16px, then fix those issues.
```

- If something looks wrong, paste or drag a screenshot into the prompt and describe the problem: "The three plan cards stack in the wrong order on mobile; Standard should be first."

Be specific about the symptom and what "fixed" looks like. "Make it better" gets you a guess. "The FAQ answers are too long; cut each to under 40 words and keep the tone warm" gets you what you want.

## Step 4: Review the changes

Before you accept a feature, look at what changed.

- **Desktop app:** a change indicator like `+48 -3` appears. Click it to open the diff view, review file by file, and comment on specific lines. Claude reads your comments and revises.
- **Terminal:** ask "Summarize every file you changed in this task and why, in plain English."

As a non-developer you're not reviewing syntax. You're checking: Did it touch files it shouldn't have? Did it add anything you didn't ask for, like a tracking script or a new library? Did it change prices or copy you didn't approve?

## Step 5: When it goes wrong

It will sometimes go wrong. That's normal. Your tools:

- **Esc** stops Claude immediately. Context is kept, so redirect in plain English.
- **Esc twice or `/rewind`** opens the rewind menu. You can restore the conversation, the code, or both to an earlier checkpoint. Every prompt you send creates one.
- **"Undo that"** asks Claude to revert its last change.
- **`/clear`** resets the conversation. If you've corrected Claude more than twice on the same thing, the context is cluttered with failed attempts. Clear it and start again with a better prompt that includes what you learned.

Checkpoints are a safety net, not a backup. They only track edits Claude made with its file tools, not changes made by commands. Real version history is git, which is Lesson 4.

:::warning
A calculator, quote form or pricing page is something customers rely on. Never let Claude publish prices, payment links or checkout code without you checking every number. Keep payment processing on your payment provider's hosted checkout; Claude does not handle card data and never moves money.
:::

## Step 6: Finish cleanly

When the feature works:

```text
Final check for the Pricing page: run the tests again, confirm the page works
at phone and desktop width, confirm the home page links to it, and list anything
left as a placeholder that I need to fill in. Then update CLAUDE.md if we
learned a rule worth keeping.
```

Then `/clear` before you start the next feature, so the next task starts with a clean context.

:::try-it
Ask Claude: "What is one way this calculator could give a customer a wrong or confusing answer? Write a test for it and fix it if it fails." This is how you build the habit of asking for proof.
:::

:::checkpoint
Q: Claude says "The calculator is done and working." What should you do next?
- [ ] Accept it, since Claude has checked it
- [x] Ask for evidence: the test cases, the command it ran and the output, then try it yourself at phone width
- [ ] Rewrite the calculator yourself
Why: A claim of success is not proof. Test output plus your own customer-eye check is what confirms the feature works.
:::

:::takeaways
- Build from an approved plan, one small step at a time.
- Give Claude concrete checks (known answers, a test, a screen width) and ask for the evidence.
- Review what changed: unexpected files, scripts, prices or copy.
- Use Esc, rewind and /clear to recover fast; use git for real history.
:::

## Go deeper

- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) - verification, explore-plan-code, course correcting and context
- [Get started with the desktop app](https://code.claude.com/docs/en/desktop-quickstart) - diff view, Browser pane and steering
- [Common workflows](https://code.claude.com/docs/en/common-workflows) - prompt recipes for building, fixing and testing
