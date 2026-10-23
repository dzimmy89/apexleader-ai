---
module: 1
lesson_number: 1
course: claude-for-founders
template: v2
---

# Lesson 1: Prompts, Files and Memory

:::key-concept
Claude does its best work when it knows your business. You give it that context three ways: a well-built prompt, the files you attach, and memory that carries what it learned into later chats. Get those three right and Claude stops sounding generic and starts sounding like your strategist.
:::

## What you'll be able to do

- Write a prompt that names the role, the context, the task and the output you want
- Attach the right files so Claude works from your real numbers and documents
- Turn memory on, check what Claude remembers, and edit or delete it
- Choose when to use an incognito chat or a chat with memory turned off

## Why this matters

As a solo founder you are the CEO, the marketer and the bookkeeper. Claude is the first hire on your AI team: a strategist and writer who never gets tired. But a new hire with no briefing writes bland copy and gives safe advice. Five minutes spent on context saves an hour of rewrites, and memory means you brief Claude once instead of every morning.

## Which plan you need

Claude has three individual plans: Free, Pro and Max. As of October 2026, every plan includes chat, web search, file creation, memory, connectors, skills and artifacts. Pro adds more usage, Claude Code, Research and full Projects (Free is capped at five projects). Max adds 5x or 20x Pro's usage and early access to new features. Check the [current plan comparison](https://claude.com/pricing) before you pay, because limits and prices change.

For this course, Free is enough for Lessons 1 to 4. Lesson 5 (Cowork) needs a paid plan.

## Build a prompt like a brief

A good prompt reads like a brief you would hand a freelancer. It has four parts:

1. **Role**: who Claude should act as.
2. **Context**: who you are, who the customer is, what you already know.
3. **Task**: the one thing you want done.
4. **Output**: the format, length and tone you expect.

Here is a weak prompt and a strong one for the same job.

```text
Write a cold email for my business.
```

```text
Act as a direct-response copywriter for small service businesses.

Context: I run Groomer Books, a monthly bookkeeping service for independent
dog grooming salons in the US. Owners are busy, work with their hands all day,
and hate paperwork. Most use a card reader and a shoebox of receipts.
Our offer is flat-fee monthly books plus a one-page profit report.

Task: Write a first-touch cold email to a salon owner.

Output: Under 120 words. Plain language, no jargon. One clear call to action:
reply "yes" for a free 15-minute books check. Give me two subject line options.
```

The second version gives Claude the facts it needs to be specific. If you skip the context, Claude fills the gaps with guesses.

Two habits make prompts better fast:

- **Ask Claude to ask first.** End with "Before you write, ask me up to five questions that would make this better." You will often discover what you forgot to say.
- **Iterate in the same chat.** Say "shorter," "warmer," or "rewrite the opening for an owner who has been burned by an accountant before." Claude keeps the earlier context.

## Work from files, not memory of files

Claude reads what you attach. Drag files into the message box or use the "+" button. Good candidates for a founder:

- A pricing sheet or a spreadsheet export of last quarter's sales
- A competitor's brochure saved as a PDF
- Your notes from customer calls
- A draft you want edited

Then point Claude at the file and tell it what to do with it:

```text
Attached is a CSV of my last 90 days of sales. Find my three best-selling
services by revenue, flag anything that looks like a pricing mistake, and give me
the answer as a short table plus three plain-English takeaways.
```

Claude can also create files for you, such as a Word document, a spreadsheet with working formulas, or a slide deck, when "Code execution and file creation" is turned on in Settings > Capabilities. Ask for the file by name: "Give me this as an Excel file with a totals row."

:::warning
Don't paste secrets into a chat: no passwords, API keys, full card numbers or bank logins. If a file contains customer personal data, remove the columns Claude doesn't need before you upload it.
:::

## Memory: brief Claude once

Memory lets Claude carry useful facts from one chat into the next. Since July 2026, memory is stored as individual, categorized entries that Claude updates as you talk, and since August 2026 those entries appear under **Topics** in Settings > Memory.

What you should know, as of October 2026:

- **It is on by default** for Free, Pro and Max. Team and Enterprise owners turn it on for their organization.
- **Turn it on or off** in Settings > Memory with "Generate memory from chats." When you turn it off you can **Pause memory** (keep what exists, stop using it) or **Reset memory** (delete everything, including project memories).
- **See and edit it** in Settings > Memory under Topics. Open a topic, edit it, or delete it. You can also just say "Remember that our fee is flat monthly, never hourly" or "Forget what I said about the bakery idea."
- **Sensitive topics** such as health or politics are not saved unless you turn on "Include sensitive topics in memory."
- **Chat search** ("Search and reference chats" in the same settings page) lets Claude look up past conversations. It is available on Pro and Max, not Free.

### When to switch memory off

Not every chat should shape how Claude sees your business.

- **Incognito chat**: click the ghost icon in the upper right of a new chat. It is not saved to history or memory. Use it for one-off questions, a sensitive personal matter, or testing a prompt with a clean slate.
- **Memory off for one chat**: start a new chat, open "+", switch "Memory" off, then send your first message. The setting locks after that first message. Unlike incognito, the chat stays in your history.

A good rule: business strategy chats use memory. Brainstorms about a different idea, or anything personal, go incognito.

:::try-it
Open Claude and type: "What do you remember about me and my business? List it as bullets and tell me where each item came from." Then open Settings > Memory and compare. Delete anything that is out of date.
:::

## Put it together: your founder brief

The fastest way to get value is a reusable founder brief: a short block of context you paste at the start of important chats (and later put into a Project in Lesson 2). Keep it under a page:

```text
FOUNDER BRIEF
Business: Groomer Books, monthly bookkeeping for independent dog grooming salons (US).
Customer: salon owner-operators, 1 to 5 staff, $150k to $600k revenue.
Offer: flat monthly fee, books closed by the 10th, one-page profit report.
Voice: plain, warm, practical. No accounting jargon. Short sentences.
Goals this quarter: 10 paying clients, a simple website, a referral program.
Rules: never promise tax outcomes; tax questions go to a licensed CPA.
```

If you don't have a business yet, use Groomer Books as your practice business through this course.

:::checkpoint
Q: You want Claude to help plan a surprise party for your partner, and you don't want that to show up in future business chats. What should you use?
- [ ] A normal chat, then ask Claude to forget it later
- [x] An incognito chat
- [ ] A project with "Use account memory" turned on
Why: Incognito chats are not saved to history or memory, so nothing carries over. Asking Claude to forget after the fact works, but it is an extra step you might miss.
:::

:::takeaways
- Brief Claude like a freelancer: role, context, task, output.
- Attach real files and say exactly what to do with them; keep secrets and unneeded personal data out.
- Memory is on by default on individual plans; review and prune it in Settings > Memory.
- Use incognito or memory-off chats for anything that should not shape future answers.
:::

## Go deeper

- [Use Claude's chat search and memory](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context) - memory settings, incognito, project memory
- [Claude release notes](https://support.claude.com/en/articles/12138966-release-notes) - dated changes to memory, Cowork and artifacts
- [Claude plans and pricing](https://claude.com/pricing) - current plan comparison
