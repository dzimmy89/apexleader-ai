---
module: 1
lesson_number: 2
course: always-on-agents
template: v2
---

# Exercise 2: Set Up Your Chief of Staff Brief

:::key-concept
You'll prepare everything Claude Duet needs to act as your chief of staff: the waitlist entry, the two connectors to start with, a morning brief spec, interrupt rules, and three first tasks. If you are not admitted yet, or not in the US, you'll run the same brief in Claude chat as a daily prompt so the work is ready on day one.
:::

**Time:** 30 minutes · **You'll need:** A Claude Pro or Max account (Duet path) or any Claude plan (fallback path), Gmail and Google Calendar, your Job Spec from Exercise 1 · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: Duet asks to approve sending a reminder email to a client. You are in a meeting. What happens if you do not respond right away?
- [ ] It sends the email after five minutes
- [x] It finishes the rest of the task and brings the approval back to you later
- [ ] It deletes the draft
Why: Anthropic's help center says Duet completes the rest of the task and returns the approval later. Nothing is sent without you.
:::

## Steps

1. **Check eligibility.** Duet is a research preview for US Claude Pro and Max accounts, by waitlist. If that is you, go to the Claude Duet product page, select **Join the waitlist**, use the same email as your Claude account, and describe the first job you'd hand off (paste your Job Spec's name and trigger). If not, use the fallback path in step 7.

2. **Prepare connectors.** In your Claude settings, connect Gmail and Google Calendar only. Duet uses the connectors you already set up in Claude. Do not connect payment tools, and do not add Link or Shop Pay inside Duet.

3. **Write your morning brief spec:**

```text
MORNING BRIEF, in this order:
1. Client emails waiting more than 24 hours (name, subject, one-line ask)
2. Today's meetings with a one-line prep note each
3. Anything due in the next 3 days
4. Invoices or payments mentioned in email (list only; I handle money)
5. One thing I might be missing
Keep it under 150 words.
```

4. **Write interrupt rules**, the only reasons to message you during the day:

```text
Only interrupt me if: a client writes "urgent", "cancel" or "refund";
a meeting in the next 2 hours changes; or something you're working on
needs my approval. Everything else waits for tomorrow's brief.
```

5. **Write three first tasks** from your Job Spec, each ending with a gate, for example: "Draft reminders for invoices over 14 days late. Do not send; show me for approval."

6. **Write your safety note** to paste as Duet's first message: what it may do alone, what needs approval (sends, scheduling with outsiders, deleting), and that it must never handle payments.

7. **Fallback path (not admitted or outside the US).** In Claude chat with Gmail and Calendar connected, paste your brief spec and run it each morning as a prompt. Keep the same interrupt rules and gates. When Duet becomes available, you'll move this over unchanged.

8. **Run it once** (in Duet or the fallback) and note one thing to change.

## Done when

- [ ] You joined the waitlist with your Claude email, or chose the fallback path
- [ ] Only email and calendar are connected, and no payment tools
- [ ] Your brief spec, interrupt rules, three tasks and safety note are saved together
- [ ] Every task ends with a gate that blocks sending without approval
- [ ] You ran the brief once and wrote down one improvement

:::coached
**For 1-on-1 coaching clients.** Make the chief of staff earn its keep.

1. Run the brief daily for five days and log each item it flagged, missed or over-flagged.
2. Add one more connector your business depends on (for example QuickBooks or HubSpot) at the lowest access level, and one task that uses it.
3. Draft a short weekly report request: what it handled, what waited for you, what it was unsure about.

**Bring to your session:** the five-day log, your updated brief spec and the weekly report.

**Your coach will:**
- Tune the brief order and interrupt rules from your log
- Review the new connector's access and the task's gate
- Decide whether it is ready for a second job
:::
