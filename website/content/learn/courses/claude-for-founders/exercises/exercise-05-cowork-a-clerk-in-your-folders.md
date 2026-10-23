---
module: 1
lesson_number: 5
course: claude-for-founders
template: v2
---

# Exercise 5: Hand Cowork a Real Filing Job and a Weekly Brief

:::key-concept
You'll give Cowork a messy working folder and get back a clean, renamed, sorted folder with an index spreadsheet and a themes report, then schedule a weekly draft-only inbox brief. At the end you have an organized folder system and an automated Monday briefing.
:::

**Time:** 30 minutes · **You'll need:** A paid Claude plan (Pro or Max), the Claude Desktop app, 10 to 20 non-sensitive business files, Gmail connected from Exercise 3 · **Builds on:** Lesson 5

## Warm-up

:::checkpoint
Q: It's your first Cowork run on a new folder. Which permission mode should you pick?
- [x] Manual, so you approve each action and learn how Claude works
- [ ] Skip, so it finishes faster
- [ ] It doesn't matter because Claude never changes files
Why: Manual lets you see and approve every step on a new folder. Move to Auto once you trust the task and the folder.
:::

## Steps

1. Create a folder called "Cowork Inbox." Copy in 10 to 20 non-sensitive files: drafts, notes, screenshots, call notes, marketing ideas. No bank statements, IDs, passwords or client personal data. If you're using the sample business, ask Claude in a normal chat to generate ten short sample documents for Groomer Books (call notes, a flyer draft, a vendor quote) and save them there.
2. Back up the folder (copy it somewhere else) before you start.
3. Open the Claude Desktop app and connect the "Cowork Inbox" folder. If you see Chat and Cowork options, choose Cowork. Set the mode to **Manual**.
4. Add folder instructions:

```text
Working files for my business. Name files YYYY-MM-DD_source_topic in lowercase
with hyphens. Never delete. Move anything unclear to /Unsure. Reports go in
/Reports as .docx. Spreadsheets go in /Reports as .xlsx.
```

5. Give the task:

```text
Rename every file in this folder using the folder naming rule. Sort them into
/Clients, /Marketing, /Admin and /Unsure. Create /Reports/index.xlsx with columns:
old name, new name, folder, one-line summary. Then write /Reports/themes.docx:
one page on the recurring themes across these files and 3 suggested next actions.
Do not delete anything. Show me your plan before you start.
```

6. Review the plan, correct anything off, then approve steps as they come. Deny at least one step you'd do differently and tell Claude why.
7. Check the result: open index.xlsx and themes.docx, spot-check five renamed files, and look in /Unsure.
8. Schedule the Monday brief. Type `/schedule` or open **Scheduled** in the sidebar:

```text
Every Monday at 8am: search my Gmail for customer or prospect emails from the
last 7 days that I haven't replied to. Write a one-page brief: who, what they
need, urgency, and a suggested reply. Draft only. Do not send, label or delete.
```

9. Run the scheduled task once on demand to confirm it works, and read the output.

## Done when

- [ ] The folder is sorted into subfolders with consistent file names and nothing deleted
- [ ] index.xlsx and themes.docx exist in /Reports and match the files
- [ ] You approved and denied at least one action in Manual mode
- [ ] A weekly draft-only inbox brief is scheduled and has run once

:::coached
**For 1-on-1 coaching clients.** Make Cowork part of your operating rhythm:

1. Pick your messiest real folder (with sensitive files removed) and run the same filing job on it.
2. Design a monthly Cowork task that turns your customer call notes into an offer-improvement report.
3. Write a one-page "Cowork rules" file covering which folders are allowed, default mode, and what always needs approval.

**Bring to your session:** before and after screenshots of the folder, the monthly task prompt, and your Cowork rules.

**Your coach will:**
- Review your folder boundaries and permission choices
- Tighten the scheduled task prompts so they are safe to run unattended
- Help you decide which recurring chores to hand off next
:::
