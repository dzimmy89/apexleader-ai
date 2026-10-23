---
module: 1
lesson_number: 3
course: claude-for-founders
template: v2
---

# Exercise 3: Connect Your Workspace and Write the Access Policy

:::key-concept
You'll connect Gmail, Google Calendar and Google Drive with safe permissions, write a one-page connector access policy for your business, and run a real inbox triage. At the end you have a working, locked-down setup and a policy you will reuse for every future agent.
:::

**Time:** 25 minutes · **You'll need:** A Claude account, a business Google account (or a fresh Google account for the sample business), your Company HQ Project · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: Which setting is right for Gmail's send tool for a solo founder?
- [ ] Always allow, so Claude can reply to customers quickly
- [x] Needs approval, so you review every email before it goes out
- [ ] It doesn't matter because Claude only drafts
Why: Anything that leaves the business needs a human click. Needs approval keeps the speed of drafting while you stay the one who sends.
:::

## Steps

1. Decide which Google account to connect. Use your business account. If you're using the Groomer Books sample, create a new free Google account just for practice and send it a few test emails.
2. In a chat inside your Company HQ Project, click **+**, hover over **Connectors**, and connect Gmail, Google Calendar and Google Drive. Sign in through Google's own screen.
3. Open **Customize > Connectors** and set tool permissions: reads and drafts to always allow; send, create event, update event and upload to needs approval; delete, trash and external share to blocked.
4. Ask Claude to write your policy:

```text
Write a one-page CONNECTOR ACCESS POLICY for my business. Use these rules:
business accounts only, OAuth sign-in only, least access per task, reads allowed,
sends/creates/changes need my approval, deletes and external shares blocked,
no tool may move money, monthly review of connected apps. Add a short section
called "Red flags" listing signs of prompt injection. Plain language.
```

5. Review it, edit anything that does not fit your business, and save it as a knowledge file in Company HQ.
6. Run an inbox triage (read only):

```text
Search my Gmail for emails from the last 7 days that need a reply from me.
Make a table: sender, topic, urgency, suggested next step. Do not draft or send.
```

7. Pick one email and ask Claude to draft a reply. Confirm it saves as a draft or asks for approval before sending. Edit it and send it yourself, or discard it.
8. Ask Claude to propose two focus blocks on next week's calendar. Approve one and deny the other, so you have seen both paths.
9. Write down in your policy file the date you will next review connectors.

## Done when

- [ ] Gmail, Calendar and Drive are connected through a business or practice account
- [ ] Send, create and change tools need approval; delete and external share are blocked
- [ ] Your connector access policy is saved in Company HQ knowledge
- [ ] You ran a read-only triage and approved or denied at least one write action yourself

:::coached
**For 1-on-1 coaching clients.** Extend the policy to your whole stack:

1. List every app your business uses (CRM, invoicing, social, storage) and mark each as connect read-only, connect with approvals, or never connect.
2. Pick one custom MCP connector you are considering and do the vetting checklist from the lesson on it.
3. Run a week of daily inbox triage and track how many minutes it saves.

**Bring to your session:** your app list with ratings, the MCP vetting notes, and your time log.

**Your coach will:**
- Review the risk rating of each app and the scope you plan to grant
- Help you set up a separate scoped login where an app supports it
- Decide which approvals, if any, you can safely relax
:::
