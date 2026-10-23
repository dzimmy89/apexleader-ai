---
module: 1
lesson_number: 5
course: google-gemini
template: v2
---

# Exercise 5: Hire Your First Skill and Your First Agent

:::key-concept
You'll turn your best repeat prompt into a skill, then set up one scheduled background task with written approval rules. At the end you'll have a working skill, a weekly agent job that only drafts and never sends, and a one-page "Agent Rules" Doc.
:::

**Time:** 30 minutes · **You'll need:** The Gemini app (skills: any plan; Tasks: Google AI Pro or Ultra on a personal account, in a supported country), your Business Profile, Customer FAQ and Lead Tracker · **Builds on:** Lesson 5

## Warm-up

:::checkpoint
Q: What's the main difference between a skill and a task?
- [ ] Skills only work in Gmail; tasks only work in Sheets
- [x] A skill is reusable instructions you call in a chat; a task is a goal Gemini works on in the background, often on a schedule
- [ ] They're the same feature with two names
Why: Skills shape how Gemini does a job. Tasks let it do the job while you're away.
:::

## Steps

1. **Write your Agent Rules first.** New Google Doc called "Agent Rules." Paste and adjust:

```text
1. Agents use their own logins or connections, never my main password.
2. Agents get access only to what the job needs.
3. Agents draft; I send. Nothing leaves the business without my click.
4. Agents never move money, pay bills or enter card details.
5. I review every agent's work weekly and turn off what I don't use.
```

2. **Pick your skill.** Choose the prompt you've reused most in this course (the client reply prompt is a good one).
3. **Create the skill** in the Gemini app. Write it with an Always / Never / Output structure and attach your Customer FAQ as a reference file:

```text
Name: client-reply
Purpose: Draft replies to customer inquiries for [business].
Always: answer the question first; offer one next step with a date; plain, warm, short.
Never: quote prices not in the attached FAQ; promise faster than [X] days; give legal or tax advice.
Output: subject line plus reply under 150 words.
```

If skills haven't reached your account yet, save it as a Gem or a pinned Doc and note that you'll migrate it.
4. **Test it three times** by typing / and the skill name with three different inquiries. Add one rule after each mistake.
5. **Set up a task** (if you have Tasks). Choose Task by the prompt box and paste:

```text
Every Monday at 7am, check my Gmail from the last 7 days for customer inquiries I haven't replied to.
Add each one to my Lead Tracker sheet with date, name, message and a suggested reply using my client-reply skill.
Do not send, delete, archive or label any email. Do not buy anything or fill in any forms.
```

6. **Check the first run.** Open it from the Scheduled page, review what it read and changed, and confirm nothing was sent.
7. **No Tasks access?** Write the same instruction into your Agent Rules Doc as a "job description" you'll use when you set up an agent later, and run it once manually as a normal chat.

## Done when

- [ ] An "Agent Rules" Doc with at least five rules
- [ ] A working skill tested on three inquiries, with at least one rule added from testing
- [ ] A scheduled task (or written job description) that only drafts and never sends
- [ ] You've reviewed the first run and confirmed no email was sent or changed

:::coached
**For 1-on-1 coaching clients.** Design your Google AI staff for the next 90 days:

1. List five repeat jobs and mark each as: skill, task, or human only.
2. If you're on Workspace, map which jobs would suit a Gemini Enterprise agent with its own account, and which files it would need shared.
3. Write a weekly 15-minute "agent review" checklist you'll actually do.

**Bring to your session:** your Agent Rules, your skill, your task setup or job description, and the five-job map.

**Your coach will:**
- Stress-test your approval rules against real scenarios (refunds, complaints, urgent requests)
- Decide with you whether a personal plan or Workspace plus Gemini Enterprise fits your stage
- Help you write the next two skills
:::
