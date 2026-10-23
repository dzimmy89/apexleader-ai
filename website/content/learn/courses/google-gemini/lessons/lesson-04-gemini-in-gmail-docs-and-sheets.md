---
module: 1
lesson_number: 4
course: google-gemini
template: v2
---

# Lesson 4: Gemini in Gmail, Docs and Sheets

:::key-concept
The fastest AI help is the kind you don't have to leave your work to get. Gemini sits inside Gmail, Docs and Sheets, where it can read the email, document or spreadsheet in front of you and your related Drive files. Use it to summarize, draft and organize, then you review and send.
:::

## What you'll be able to do

- Check which of your accounts gets Gemini inside Gmail, Docs and Sheets
- Summarize long threads and draft replies in Gmail that sound like you
- Turn notes and Drive files into a first-draft document in Docs
- Use Gemini in Sheets to build tables and classify messy data with a formula

## Why this matters

Most of a solo founder's week is email, documents and spreadsheets. Copying text into a separate chatbot and pasting the answer back is slow and leaks context. Gemini inside the apps already sees the thread, the doc or the sheet, so a 20-minute job becomes a 3-minute review. You stay the editor. Gemini does the first draft.

## Who gets it

Gemini in Gmail, Docs and Sheets comes with:

- **Google Workspace business plans** (Business Starter, Standard and Plus, and Enterprise editions), where it's built in for your business domain. Some advanced features need higher editions or add-ons.
- **Personal Google AI plans.** Google lists Gemini in Gmail on AI Plus, and Gmail, Docs and more on AI Pro and Ultra.

If you don't see the Gemini icon or the "Help me write" style prompts, check your plan on the [Google AI plans page](https://gemini.google/subscriptions/), and if you're on Workspace, check that your admin (probably you) hasn't turned Gemini off in the Admin console.

## Gmail: get through the inbox faster

**Summarize a thread.** Open a long thread and ask Gemini for a summary from the Gemini button at the top right, which opens a side panel. Good follow-ups:

```text
What exactly is this client asking me to do, and by when?
List any open questions I haven't answered yet.
```

**Draft a reply.** In a reply window, use Gemini's writing help and give it the facts, not just the tone:

```text
Reply yes to the Thursday 2pm call, but say I need their last 3 bank statements before then.
Keep it friendly and under 80 words.
```

**Ask about your inbox.** In the side panel you can ask across emails:

```text
Find emails from the last 30 days where a customer asked about pricing. List sender, date and what they asked.
```

Read every draft before you send. Gemini can get names, dates and amounts wrong, and it doesn't know what you promised on the phone.

## Docs: from notes to first draft

Gemini in Docs can write from a prompt and pull in your Drive files. Use it for proposals, onboarding guides, SOPs and blog drafts.

```text
Using @Client onboarding notes and @Service description, draft a one-page welcome guide for a new client.
Sections: what happens in week 1, what I need from you, how to reach me, what we don't do.
Plain language, short paragraphs.
```

Typing @ lets you reference a specific file in many Gemini prompts in Workspace. If @ doesn't work in your version, open the file and attach it in the side panel instead.

Other Docs jobs that work well:

- "Make this section shorter and clearer for a non-accountant."
- "Turn these bullet notes into a step-by-step SOP with a checklist at the end."
- "Proofread for spelling and consistency. Don't change my voice."

## Sheets: tables and messy data

Sheets is where Gemini saves the most time for a small business, because most of your data starts messy.

**Build a table from a description.** In the Gemini side panel:

```text
Create a lead tracker with columns: name, business, city, source, first contact date, status (dropdown: new, contacted, call booked, won, lost), next step, notes.
```

**Classify text with the AI function.** Sheets has an AI function you write in a cell, like a formula. It runs a prompt on each row. For example, with customer messages in column B:

```text
=AI("Classify this message as one of: pricing question, booking request, complaint, other. Reply with the category only.", B2)
```

Fill it down the column, then filter or count by category. Check a sample of rows by hand before trusting the totals. Check the [Sheets help center](https://support.google.com/docs/) for the function's current limits.

**Ask questions about the sheet.**

```text
Which lead source brought the most "won" customers this quarter? Show me the numbers and suggest a chart.
```

## The newer cross-app features

Google keeps moving Gemini from "helper in one app" to "assistant across apps." In September 2026 Google announced you can create content, schedule events and coordinate tasks across Workspace from whichever app you're in. In October 2026 it announced you'll be able to @mention Gemini in Gmail, Docs, Sheets, Slides and Chat to hand it bigger jobs (Lesson 5 covers this agent). Skills, which are reusable instructions, are also rolling out to Workspace apps.

These arrive gradually and some start in preview. If a feature isn't in your account yet, it's probably still rolling out.

:::try-it
Open the longest unread thread in your inbox. Ask Gemini: "Summarize this in three bullets and tell me what reply is needed." Then have it draft the reply and edit one sentence before you send.
:::

:::warning
Gemini drafts, you send. Anything that leaves the business, such as emails, proposals or quotes, needs your review and your click. Don't let a draft go out with a price, date or promise you haven't checked.
:::

:::checkpoint
Q: You have 300 customer messages pasted into column B of a sheet and want to know how many are complaints. What's the best approach?
- [ ] Paste all 300 messages into a chat and ask for a count
- [x] Use the AI function to label each row, spot-check some labels, then count with a filter or pivot
- [ ] Ask Gemini in Gmail to search your inbox for the word "complaint"
Why: Row-by-row labeling keeps every result visible and checkable, and the count comes from the sheet, not from the AI's estimate.
:::

:::takeaways
- Gemini in Gmail, Docs and Sheets comes with Workspace business plans and higher personal AI plans.
- Gmail: summarize, find, draft, then you review and send.
- Docs: give it your Drive files with @ and a clear outline.
- Sheets: build tables from a description and classify messy data with the AI function, then spot-check.
:::

## Go deeper

- [Google Workspace Updates: Create content, schedule events, and coordinate tasks across Workspace](https://workspaceupdates.googleblog.com/2026/09/create-content-schedule-events-and-coordinate-tasks-across-Workspace-regardless-of-what-app-you-are-in.html) - September 2026 cross-app Gemini update
- [New ways to create faster with Gemini in Docs, Sheets, Slides and Drive](https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/) - Google's March 2026 Workspace update
- [Google AI plans](https://gemini.google/subscriptions/) - which personal plans include Gemini in Gmail and Docs
- [Introducing skills in the Gemini app and Workspace](https://workspaceupdates.googleblog.com/2026/09/skills-gemini-app-workspace.html) - which Workspace editions get skills
