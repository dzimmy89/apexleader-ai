---
module: 1
lesson_number: 4
course: always-on-agents
template: v2
---

# Exercise 4: Design a Bot Department and Teach One Routine

:::key-concept
You'll design a small Grok Bot department (up to three Bots) with a shared-login plan that is safe for every Bot, set Ask first rules, and teach one Bot a weekly routine. You'll end with a Department Sheet and either a live routine or a fully scripted one ready to teach.
:::

**Time:** 35 minutes · **You'll need:** A plan that includes Grok Bot (SuperGrok tiers or a paid Cursor plan) for the full path, or any AI chat for the planning path; one web app you use weekly · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: You plan two Bots: one for public research, one that exports reports from your invoicing site. What is true about their logins?
- [x] Both can use the invoicing login, because all Bots share one computer and its browser sessions
- [ ] Only the billing Bot can reach the invoicing site
- [ ] Each Bot needs its own separate cloud computer, which you set per Bot
Why: Grok Bot gives each user one shared computer; Bots get separate screens and chats, not separate logins.
:::

## Steps

1. **List web chores.** Write five weekly tasks you do in websites, ideally ones with no good AI connector (booking systems, supplier portals, invoicing sites).

2. **Design the department.** Choose up to three, each a Bot:

```text
BOT NAME | JOB (one line) | TRIGGER/SCHEDULE | SITES | LOGIN ROLE | GATE
```

3. **Run the shared-login test.** Every login on the shared computer is available to every Bot. For each login, ask: "Would I be OK if any of my Bots used this?" If no, drop that job or use a read-only role. Bank, payroll, payment and tax logins always fail the test.

4. **Set Ask first rules** in **Settings → General → Auto-review** (or write them down on the planning path):

```text
Ask first: sending email or messages outside the business
Ask first: publishing or posting anything
Ask first: deleting files, records or emails
Ask first: changing settings, permissions or account details
Ask first: anything that looks like a purchase or accepting terms
```

Set **Execution on Local Computer** to Never allow or Ask every time unless a job needs your laptop.

5. **Script the routine** for your most valuable Bot before you teach it:

```text
ROUTINE: [name], runs [day/time]
1. Open [site]. If a login, 2FA or CAPTCHA appears, hand it to me (Take over).
2. Go to [page]. Filter to [criteria].
3. Export or copy [data] to /workspace/[folder]/[file name with date].
4. Summarize: [totals, exceptions, anything odd].
5. Send me the summary. Do not change, send or delete anything in [site].
```

6. **Teach it.** Do the routine once with the Bot, narrating each step. Ask it to write back the steps as a checklist, correct it, save it as a skill, and set the schedule. On the planning path, paste the script into a chat and ask it to find steps that are ambiguous or could break if the site changes.

7. **Watch two runs.** Note anything unexpected. Remember: approvals raised during unattended runs expire after about 10 minutes, so check for **Expired** cards.

8. **Save** the Department Sheet, rules and routine script together.

## Done when

- [ ] Each Bot has one job, a schedule, sites, a login role and a gate
- [ ] Every shared login passed the "any Bot could use this" test, with no money logins
- [ ] Ask first rules cover sends, posts, deletes, settings and purchases
- [ ] One routine is scripted step by step, with a handoff for logins
- [ ] The routine is taught and run once, or reviewed for weak steps on the planning path

:::coached
**For 1-on-1 coaching clients.** Run a real department for a week.

1. Put two Bots live on real routines and keep a run log: date, result, approvals, expired cards, errors.
2. Have one Bot hand work to the other (for example, Research passes a list to Leads for draft replies) and check the handoff.
3. Write your removal checklist: routines to pause, sites to sign out of, connectors to revoke.

**Bring to your session:** the run log, the Department Sheet and the removal checklist.

**Your coach will:**
- Review your shared-login risks and tighten roles
- Debug any routine that failed or drifted
- Decide which Bot to promote, retrain or retire
:::
