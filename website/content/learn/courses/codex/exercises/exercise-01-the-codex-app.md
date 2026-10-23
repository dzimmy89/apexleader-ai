---
module: 1
lesson_number: 1
course: codex
template: v2
---

# Exercise 1: Build Your First Internal Tool With Codex

:::key-concept
You'll set up a Codex project with an `AGENTS.md` brief, then have Codex build a one-file price quote calculator, test it in the in-app browser, and commit it. At the end you'll have a working tool you can use on sales calls and a project folder ready for the rest of the course.
:::

**Time:** 25 minutes · **You'll need:** The ChatGPT desktop app with Codex, a ChatGPT plan that includes Codex, your pricing (or the sample below) · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: Where should Codex's standing rules for your business live?
- [ ] In a long first message you paste at the start of every chat
- [x] In an `AGENTS.md` file in the project folder
- [ ] In Codex's memory, so you never have to write them down
Why: `AGENTS.md` is read by every Codex task in that project, travels with the folder, and is also read by other coding agents like Cursor and Copilot.
:::

## Steps

1. **Install and sign in.** Install the ChatGPT desktop app, sign in, and switch to Codex. Open settings and find the **Usage** panel so you know where to check credits.

2. **Create the project folder.** Make a folder called `<yourbusiness>-tools` with nothing else in it, and add it as a project. If you don't have a business settled, use **Groomer Books**, a monthly bookkeeping service for independent dog groomers.

3. **Add your pricing rules.** Create `pricing-rules.md` in the folder. Use your own, or this sample:

```text
# Groomer Books pricing (sample)
- Base fee: $149 per month, includes 1 bank account and up to 150 transactions
- Each extra bank account: $25 per month
- 151 to 300 transactions: add $50 per month
- Over 300 transactions: add $100 per month
- Catch-up bookkeeping: quoted separately, not in this calculator
```

4. **Write AGENTS.md with Codex.** Send:

```text
Write AGENTS.md for this project. Include: a two-line summary of Groomer
Books; "build simple, single-file tools a non-developer can open in a
browser"; "never put passwords, API keys or client data in files"; "ask
before installing anything or using the internet"; "never send emails or
submit data to outside services"; "explain every change in plain English".
Show me the file before saving.
```

Edit anything that doesn't sound like you, then let it save.

5. **Build the calculator.**

```text
Build quote-calculator.html as a single file using pricing-rules.md.
Inputs: number of bank accounts, monthly transactions. Show the monthly
fee and a one-line breakdown. Add a note that catch-up work is quoted
separately. Open it in the in-app browser and test these three cases:
1 account/100 transactions, 3 accounts/220, 2 accounts/450.
Show me the results next to what pricing-rules.md says they should be.
```

6. **Check the math yourself.** Work out one of the three cases by hand. If anything's off, tell Codex which rule it got wrong.

7. **Comment in the browser.** Use the in-app browser to comment on one visual detail ("make the total larger and bold") and confirm Codex applies it.

8. **Save a version.** Ask: "Make this folder a git repository and commit everything with a clear message. Don't push anywhere yet."

## Done when

- [ ] Your tools project folder has `AGENTS.md`, `pricing-rules.md` and `quote-calculator.html`
- [ ] The calculator gives correct results for three test cases, one checked by hand
- [ ] You made one change by commenting in the in-app browser
- [ ] The folder is a Git repository with at least one commit
- [ ] You know where the Usage panel is

:::coached
**For 1-on-1 coaching clients.** Build the tool your sales calls actually need.

1. Write your real pricing rules, including edge cases you usually handle in your head.
2. Have Codex build the calculator, then generate ten test cases from the rules and check every result.
3. Ask Codex to add a "copy quote summary" button that produces a short, plain text summary you can paste into an email you send yourself.

**Bring to your session:** your pricing rules, the calculator, and the ten test cases with any mismatches.

**Your coach will:**
- Review your pricing logic for gaps and confusing tiers
- Check the calculator against tricky cases
- Help you decide where the tool should live and who can use it
:::
