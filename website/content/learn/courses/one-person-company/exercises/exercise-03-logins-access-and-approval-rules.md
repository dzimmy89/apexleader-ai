---
module: 1
lesson_number: 3
course: one-person-company
template: v2
---

# Exercise 3: Write Your Access and Approval Policy

:::key-concept
You'll produce a one-page Access and Approval Policy: which logins each agent gets, at what level, and the exact approval rule you'll enter into each product's controls. You'll also clean up one risky connection in your real accounts.
:::

**Time:** 30 minutes · **You'll need:** Your Delegation Map and Stack Decision, admin access to your email and one business app (invoicing, CRM or calendar) · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: Your agent asks you to type a two-factor code into the chat so it can finish logging in. What do you do?
- [ ] Type the code in chat; it expires soon anyway
- [x] Use the product's secure handoff, such as Take over in Grok Bot or Duet's separate password form, and enter it yourself
- [ ] Turn off two-factor so the agent never gets stuck
Why: Codes and passwords never go in ordinary chat. The products hand these steps back to you through a secure screen.
:::

## Steps

1. **Inventory your apps.** List every app your first agent job needs (from Exercise 1). For each, note whether it has an official connector in your chosen tool, whether it allows a second user with limited rights, or neither.

2. **Choose the access method** for each app, in this order: official connector, separate limited user (for example ops@yourbusiness.com), or "I log in myself through the secure handoff". Write the access level: read, draft or act.

3. **Clean one thing now.** Open your email account's security or connected-apps page. Remove any app you no longer use. Confirm two-factor authentication is on for your main email.

4. **Write the approval rule.** Paste this into an AI chat, fill in the brackets, and ask it to tighten your wording:

```text
Help me write an approval rule for my AI agent. Business: [business].
Agent job: [paste brief from Exercise 1]. Apps and access: [paste step 2].
Use four sections: Do alone / Ask me first / Hand to me / Never.
Rules I require: anything sent outside the business or posted publicly is
"Ask me first"; logins, two-factor codes, contracts and payments are
"Hand to me"; moving money and deleting records are "Never".
Keep it under 150 words, plain language.
```

5. **Translate to product controls.** Under the rule, write how you'll enter it in your chosen product:
   - Claude Duet: built-in approvals for send, pay, sign, delete; which connectors you'll enable; leave Link and Shop Pay disconnected.
   - Dots: one **Custom rule** per line, using "Ask before taking action" or "Hand off to you".
   - Grok Bot: **Ask first** rules in Settings, General, Auto-review; prefer **Allow once**.
   - Chat or desktop tools: paste the rule into the project or custom instructions.

6. **Write your off switch.** One line per tool: how to pause it, how to disconnect its apps, and where its scheduled tasks live.

7. **Save** as "Access and Approval Policy" next to your Delegation Map.

## Done when

- [ ] Every app the agent needs has an access method and level, and none uses your main password
- [ ] The approval rule has all four sections and puts money in "Never"
- [ ] You have mapped the rule to your product's actual controls
- [ ] You removed at least one unused connection and confirmed two-factor on your main email
- [ ] Your off-switch steps are written down

:::coached
**For 1-on-1 coaching clients.** Stress-test the policy on your real stack.

1. Create the separate agent user or connector for one real app at read-only level.
2. Write three "bad day" scenarios (a misread email, a wrong recipient, a prompt hidden in a web page) and note which part of your policy stops each.
3. Draft a short note to clients or contractors if an agent will appear in shared tools under its own name.

**Bring to your session:** the policy, the scenarios, and screenshots of your connector or user settings (with no passwords visible).

**Your coach will:**
- Walk the scenarios with you and close any gaps
- Review the access level for each app against the job
- Confirm your off switch works before the agent goes live
:::
