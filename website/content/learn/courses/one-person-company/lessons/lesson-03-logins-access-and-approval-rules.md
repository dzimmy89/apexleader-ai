---
module: 1
lesson_number: 3
course: one-person-company
template: v2
---

# Lesson 3: Logins, Access and Approval Rules

:::video
id: opc-l3-overview
kind: overview
status: paused
src: /learn/video/one-person-company/opc-l3-overview.mp4
captions: /learn/video/one-person-company/opc-l3-overview.vtt
poster: /learn/video/one-person-company/opc-l3-overview.jpg
transcript: An agent with your main email password misreads one thread, and every client gets the wrong message before you wake up. Ten minutes of setup prevents that. This is The One-Person Company, lesson three: logins, access and approval rules. In this lesson: four rules that keep an always-on agent safe. One: separate logins. Use an official connector or a separate limited user, and never share your main password. Two: least access. Start read only, then drafts, then narrow actions, and widen only when the agent has earned it. Three: a written approval rule. What it does alone, what it asks about, what it hands to you, and what it never does. Four: know your off switch before you turn it on. And remember: stopping an agent doesn't undo what it did. That's why the approval rule matters most. First, logins.
:::

:::key-concept
An agent is only as safe as the access you give it. Give each agent its own scoped login or connector, the least access its job needs, and a written approval rule. Anything that leaves the business or changes money needs your click, and agents never move money.
:::

## What you'll be able to do

- Set up agent access without sharing your main passwords
- Apply least access: read before write, drafts before sends
- Write an approval rule using the controls each 2026 agent offers
- Know what to do when you want to cut an agent off

## Why this matters

When an employee has a bad day, you lose an afternoon. When an agent with your main email password misreads a thread, it can send the wrong message to every client before you wake up. Always-on agents work while you sleep. That is the point, and it is the risk. Ten minutes of setup prevents almost every horror story.

## Rule 1: Separate logins, never your main password

Use the safest connection method the tool supports, in this order:

1. **Official connector or plugin.** Claude connectors, ChatGPT plugins and Grok Bot connectors use sign-in flows (usually OAuth) where you approve access in the app's own screen. The agent gets a token, not your password. Grok Bot's docs say these tokens stay server-side and the model sees only tool results. Claude Duet is designed so it never directly sees your passwords or sign-in tokens.
2. **A separate account for the agent.** For apps without a connector, create a user for your agent, such as ops@yourbusiness.com, with a limited role. Most invoicing, CRM and project tools let you add a user with "viewer" or "editor" rights.
3. **You type the password yourself, in the secure screen.** When a Bot or agent hits a login page, the products hand the step back to you. Claude Duet gives you a separate form on your device that sends the password straight to its browser. Grok Bot lets you **Take over** the computer, sign in, then press **I'm done**. Dots can use supported saved logins without showing the password to the model, and asks your approval first.

Never type a password, one-time code or API key into ordinary chat. Grok Bot's docs say this in plain words, and it applies everywhere.

:::video
id: opc-l3-logins
kind: inline
status: paused
src: /learn/video/one-person-company/opc-l3-logins.mp4
captions: /learn/video/one-person-company/opc-l3-logins.vtt
poster: /learn/video/one-person-company/opc-l3-logins.jpg
transcript: Your agent needs to get into your apps. Your password never needs to go with it. There are three safe ways in, in this order. First, an official connector or plugin. You approve access on the app's own sign-in screen, and the agent gets a token, not your password. Second, a separate account for the agent, like ops at your business dot com, with a viewer or editor role. Third, when an agent hits a login page, you type the password yourself, in a secure screen. Claude Duet gives you a separate form. Grok Bot lets you take over, sign in, then press I'm done. And one rule applies everywhere: never type a password, a one-time code or an API key into ordinary chat. Next: how much access to give.
:::

## Rule 2: Least access

Start every agent with the smallest set of permissions, then widen only when it has earned trust.

| Stage | What the agent can do | Example |
|---|---|---|
| Week 1: read only | Read and summarize | Reads your inbox and sends you a morning list of who needs a reply |
| Week 2 to 4: draft | Create drafts you review | Drafts replies and saves them as drafts in Gmail |
| Later: act on narrow tasks | Do low-risk actions alone | Files receipts into a folder, adds calendar holds for internal work |
| Never | Move money, sign, delete records, change passwords | Stays with you |

:::infographic
id: fig-1
type: timeline
title: Least access, stage by stage
shows: Four stacked rows with Lucide icons: Week 1, read only, reads and summarizes; Weeks 2 to 4, drafts you review; Later, narrow low-risk actions alone; Never, in a red-outlined row: money, signing, deleting, stays with you.
data: none
image: /learn/figures/one-person-company/lesson-03-fig-1.webp
alt: An agent starts read only in week 1, moves to drafts you review in weeks 2 to 4, then to narrow low-risk actions later. Moving money, signing and deleting never move to the agent.
:::

Some products bake this in. OpenAI's dots use read-only access when doing "proactive research", so they cannot send or change anything while looking around. Grok Bots have no access by default and act only with accounts you sign them into.

Also watch shared access. All of your Grok Bots share one cloud computer, including browser sessions and app logins. Grok Bot's docs warn not to treat separate Bots as a security boundary. If one Bot is logged into your bank, every Bot is.

## Rule 3: Write an approval rule

An approval rule says what the agent may do alone, what it must ask about, and what it never does. Each product gives you a way to enforce it:

- **Claude Duet** asks before it sends a message, makes a payment, signs a document or deletes anything. Trading securities and moving money between accounts are blocked even with approval. Only you can mark a task as finished.
- **OpenAI dots** have **Custom rules** with four behaviors: take action without asking, take action only when you say so, ask before taking action, or hand off to you. An automatic review checks actions that could affect your accounts or share information.
- **Grok Bot** has **Auto-review** rules: **Ask first** always stops matching actions for your approval, and **Allow automatically** lets them through unless the review sees a reason to stop. If both match, Ask first wins. When it asks, you choose **Allow once**, **Always allow** or **Deny**.

:::infographic
id: fig-2
type: anatomy
title: The four parts of an approval rule
shows: A 2 by 2 grid with Lucide icons: Do alone (read, summarize, research, draft); Ask me first (anything sent, posted or invoiced); Hand to me (logins, codes, payments, contracts); and a paper card, Never (move money, delete records, share client data).
data: none
image: /learn/figures/one-person-company/lesson-03-fig-2.webp
alt: An approval rule has four parts: do alone for reading, summarizing, research and drafts; ask me first for anything sent, posted or invoiced; hand to me for logins, codes, payments and contracts; and never for moving money, deleting records or sharing client data.
:::

Write your rule in plain language first, then copy it into the product. A starter:

```text
APPROVAL RULE for [agent name]
Do alone: read, summarize, research, create drafts, organize files in [folder].
Ask me first: any email or message to a customer, vendor or the public;
any social post; any proposal, quote or invoice; any calendar invite to
someone outside the business; any change to a setting or permission.
Hand to me: logins, two-factor codes, payments, contracts and signatures,
anything about taxes, legal or HR.
Never: move money, delete records, share client data outside our apps.
When unsure: stop and ask.
```

A tip from OpenAI's docs that applies to every agent: asking for drafts does not authorize sending them. Be explicit. And prefer "Allow once" over "Always allow" for anything sensitive.

:::video
id: opc-l3-approval-rule
kind: inline
status: paused
src: /learn/video/one-person-company/opc-l3-approval-rule.mp4
captions: /learn/video/one-person-company/opc-l3-approval-rule.vtt
poster: /learn/video/one-person-company/opc-l3-approval-rule.jpg
transcript: Drafting an email doesn't mean permission to send it. Your approval rule makes the difference explicit. Write it in four parts. Do alone: read, summarize, research and create drafts. Ask me first: anything sent to a customer, a vendor or the public, and any post, proposal, quote or invoice. Hand to me: logins, two-factor codes, payments, contracts and signatures. Never: move money, delete records, or share client data outside your apps. Then copy the rule into each product's controls. Claude Duet asks before it sends, pays, signs or deletes. Dots have custom rules. Grok Bot has auto-review, where ask first always wins. For anything sensitive, choose allow once, not always allow. In the exercise, you'll write your own rule.
:::

:::try-it
Open the app you use most for customers (email, invoicing or CRM). Find the settings page for users or connected apps. Check: does it let you add a second user with limited rights? Is any old app still connected that you no longer use? Disconnect one thing you do not need.
:::

## Rule 4: Know your off switch

Before you turn an agent on, know how to turn it off.

- **Claude Duet:** disconnect any app at any time; it stops accessing it from then on, but keeps memory of what it already saw. Turn off **Search and reference chats** under Settings > Memory to stop it searching past chats.
- **Dots:** **Pause** stops the current main task but not delegated tasks or scheduled runs; stop those in **Activity** and **Scheduled**. **Reset** or **Delete** is permanent and does not undo actions already taken in your apps.
- **Grok Bot:** deny the action, pause or delete routines, sign out of sites on the shared computer, and revoke connectors in the source app.

The pattern: stopping an agent does not undo what it did. That is why the approval rule matters more than the off switch.

:::warning
Do not connect payment wallets, bank accounts or payroll "just to try it". Some agents can check out with a one-time virtual card after you approve. In this course the rule is simpler: agents never move money. Keep payments, transfers and payroll submission as steps you do yourself. For tax or legal questions about delegating finance tasks, check with your accountant or lawyer.
:::

:::checkpoint
Q: Your Grok Bot for social media asks for your bank login to "check if the ad payment went through". What should you do?
- [ ] Paste the password in chat since it is your own Bot
- [ ] Sign the shared computer into the bank so all Bots can check payments later
- [x] Deny it and check the payment yourself, because Bots share one computer and agents never touch money
Why: All your Bots share browser sessions, so a bank login would be open to every Bot. Money stays with you.
:::

:::takeaways
- Use official connectors or a separate limited user, never your main password
- Start read-only, then drafts, then narrow actions
- Turn your approval rule into each product's controls: Duet's approvals, dots' Custom rules, Grok Bot's Auto-review
- Stopping an agent does not undo its actions, so approval beats cleanup
:::

## Go deeper

- [Grok Bot approvals, security and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - Auto-review, Take over, and the shared computer boundary
- [Control your dot](https://learn.chatgpt.com/docs/dots/controls) - custom rules, action review, pause and delete
- [Get started with Claude Duet](https://support.claude.com/en/articles/17631495-get-started-with-claude-duet) - approvals, password handling and disconnecting apps
- [Grok Bot for teams and enterprises](https://docs.x.ai/grok-bot/teams-and-enterprises) - a recommended security baseline you can borrow
