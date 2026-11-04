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

:::video
id: opc-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/one-person-company/opc-ex3-setup.mp4
captions: /learn/video/one-person-company/opc-ex3-setup.vtt
poster: /learn/video/one-person-company/opc-ex3-setup.jpg
transcript: One agent, a handful of apps, and not one of them using your main password. Let's write the policy that keeps it that way. In this exercise you'll write an access and approval policy. List every app your first agent job needs. For each, choose the access method: an official connector, a separate limited user, or you log in yourself through the secure handoff. Then set the level: read, draft or act. Clean one thing now: remove an unused app from your email, and confirm two-factor is on. Write your approval rule in four parts, with money under never, and map it to your product's real controls. Finally, write down your off switch. So: which apps does your agent get, at what level, and what does it never do? Pause here and write your policy.
:::

## Warm-up

:::checkpoint
Q: Your agent asks you to type a two-factor code into the chat so it can finish logging in. What do you do?
- [ ] Type the code in chat; it expires soon anyway
- [x] Use the product's secure handoff, such as Take over in Grok Bot or Duet's separate password form, and enter it yourself
- [ ] Turn off two-factor so the agent never gets stuck
Why: Codes and passwords never go in ordinary chat. The products hand these steps back to you through a secure screen.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Three ways in, best first
shows: Under "Three ways in, best first": three numbered cards with Lucide icons: 1 Official connector, the agent gets a token, not your password; 2 A separate limited user, ops@yourbusiness.com, viewer or editor; 3 You log in yourself, through the secure handoff screen. Footer: then set the level, read, draft or act.
data: none
image: /learn/figures/one-person-company/exercise-03-fig-1.webp
alt: Three ways to give an agent access, best first: an official connector so the agent gets a token, not your password; a separate limited user such as ops@yourbusiness.com; or you log in yourself through the secure handoff screen. Then set the level: read, draft or act.
:::

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

:::example
title: See an example result
Here is an Access and Approval Policy for the billing assistant from the sample business's first brief. The user name is an example.

:::video
id: opc-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/one-person-company/opc-ex3-reveal.mp4
captions: /learn/video/one-person-company/opc-ex3-reveal.vtt
poster: /learn/video/one-person-company/opc-ex3-reveal.jpg
transcript: For Groomer Books, the billing assistant gets two apps and never sees a password. Here's the example policy. The invoicing app gets a separate viewer user, so the agent can read overdue invoices and nothing more. Gmail connects through Claude's official connector at the draft level, so reminders land as drafts. The bank isn't connected at all. The rule has four parts. Do alone: read invoices and draft reminders. Ask me first: sending any email, or changing an invoice. Hand to me: logins, codes, refunds and payment questions. Never: move money, delete records, or share client data. For the cleanup, the founder removed an old scheduling app and confirmed two-factor on the main email. And the off switch is written down: disconnect Gmail in Claude, and remove the agent's user from the invoicing app. That's a policy you can set up today.
:::

:::infographic
id: fig-2
type: anatomy
title: Billing assistant access
shows: Under "Billing assistant access" tagged example: three rows with Lucide icons and level pills: Invoicing app, separate viewer user, Read; Gmail, Claude connector, Draft; Bank, not connected, Never in red. A paper card: Asks before any email is sent.
data: none
image: /learn/figures/one-person-company/exercise-03-fig-2.webp
alt: Example access for the Groomer Books billing assistant: the invoicing app through a separate viewer user at read level, Gmail through the Claude connector at draft level, and the bank not connected. It asks before any email is sent.
:::

| App | Access method | Level |
|---|---|---|
| Invoicing app | Separate user, billing-agent@groomerbooks.example, viewer role | Read |
| Gmail | Claude's official Gmail connector | Draft |
| Bank | Not connected | Never |

**Cleaned up:** removed an old social-scheduling app from the Google account and confirmed two-factor is on.

```text
APPROVAL RULE for Billing assistant
Do alone: read overdue invoices, draft reminder emails, save drafts in Gmail.
Ask me first: sending any email; any change to an invoice.
Hand to me: logins, two-factor codes, refunds, payment questions from clients.
Never: move money, delete records, share client data outside Gmail and the
invoicing app.
When unsure: stop and ask.

PRODUCT CONTROLS
Claude: only the Gmail connector enabled; built-in approvals cover send and
delete; Link and Shop Pay stay disconnected.

OFF SWITCH
Claude: disconnect Gmail in Claude's connector settings.
Invoicing app: remove the billing-agent user.
```
:::

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
