---
module: 1
lesson_number: 4
course: codex
template: v2
---

# Exercise 4: Automate Your Monday Money Check

:::key-concept
You'll write an approval rule into your agent brief, run one tightly scoped computer use task on a spreadsheet, then turn a proven task into a weekly automation that flags transactions and drafts (but never sends) follow-ups. At the end you'll have a Monday report that writes itself and waits for your review.
:::

**Time:** 35 minutes · **You'll need:** Codex on Mac or Windows 11 (computer use isn't available everywhere; check your region), your tools project, a sample bank export CSV (instructions below) · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Codex asks to use your banking app during a spreadsheet task. Which answer fits your approval rule?
- [ ] Always allow, so future runs don't stop
- [ ] Allow once, since you're watching
- [x] Deny, and stop the task; banking apps are off limits for agents
Why: Agents never move money or log into banking. Work from an exported file instead, which gives read-only data without access to the account.
:::

## Steps

1. **Add the approval rule.** Append this to `AGENTS.md` in your tools project:

```text
## Approval rule
Prepare, don't send. You may read files and draft documents, emails and
posts. You may not send emails, publish posts, submit forms to outside
services, change prices, or make or approve any payment. Never open
banking, payment or email apps. Put drafts in /drafts and say they're ready.
```

2. **Make a sample export.** Never use real client data for practice. Ask Codex:

```text
Create /exports/bank/2026-10-19.csv with 40 made-up transactions for a
small bookkeeping business: date, description, amount, category. Include
4 over $500, 3 with blank descriptions, and 2 duplicates. Mark the file
SAMPLE in the first row.
```

3. **Set up computer use (optional but recommended).** Open Codex settings, find **Computer Use**, install it, and grant the operating system permissions it asks for (on Mac: Screen Recording and Accessibility). Close email, banking and messaging apps first.

4. **Run one scoped computer use task.** Open the CSV in your spreadsheet app, then:

```text
@Numbers (or @Excel) In the open file 2026-10-19.csv, add a column
"Flag" and mark rows over $500 "LARGE", blank descriptions "MISSING",
and exact duplicates "DUPLICATE". Don't change any other cells. Don't
open any other app. Save as /reports/flagged-sample.csv and stop.
```

When asked to approve the app, choose allow once. Watch it work. Cancel if it touches another window.

5. **Prove the task in chat first.** Now do the same job without computer use, which is more reliable for files:

```text
Read the newest CSV in /exports/bank. Flag transactions over $500, blank
descriptions and duplicates. Write /reports/weekly-<date>.md with a
summary table and counts. For each blank description, draft a one-line
note to myself in /drafts/questions-<date>.md asking what it was.
Don't change the CSV. Don't email anyone. End with "Ready for review."
```

Check the report against the CSV for two flagged rows.

6. **Turn it into an automation.** Once the output is right, ask Codex to make it a weekly automation for Monday at 8:00, using the same prompt. Confirm it's scheduled and note that it needs your computer awake and the app running.

7. **Run it once now** (or wait for Monday) and review the report and drafts. Nothing should have been sent anywhere.

## Done when

- [ ] `AGENTS.md` includes the approval rule
- [ ] A sample CSV with made-up data exists, marked SAMPLE
- [ ] You ran one computer use task with allow-once approval, or noted why it isn't available to you
- [ ] A weekly automation produces a report and drafts, and sends nothing
- [ ] You checked at least two flagged rows by hand

:::coached
**For 1-on-1 coaching clients.** Automate one real weekly routine safely.

1. List your three most repetitive weekly admin tasks and mark which have an export or file you can give Codex instead of an app login.
2. Build the best candidate as a chat task on real but exported data, check it twice by hand, then schedule it.
3. Write the access map for it: which folders it reads, where drafts go, and which apps and accounts it must never touch.

**Bring to your session:** the task list, the first two automation outputs, and the access map.

**Your coach will:**
- Check the output against your real numbers for errors
- Review the access map for anything that could send, post or pay
- Decide with you whether this belongs in Codex or in an always-on agent
:::
