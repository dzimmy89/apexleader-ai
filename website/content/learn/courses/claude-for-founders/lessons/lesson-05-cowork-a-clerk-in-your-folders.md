---
module: 1
lesson_number: 5
course: claude-for-founders
template: v2
---

# Lesson 5: Cowork: A Clerk in Your Folders

:::key-concept
Cowork is Claude doing whole tasks, not just answering: it plans the steps, reads and writes files, runs code, uses your connected apps and hands back finished documents. Give it one folder, one clear outcome and the right permission mode, and it works like a careful clerk you supervise.
:::

## What you'll be able to do

- Start a Cowork task and review Claude's plan before it runs
- Connect a single working folder and write folder instructions
- Choose between Manual, Auto and Skip permission modes
- Schedule a recurring task and know what it can and cannot reach

## Why this matters

Founders lose hours to file chores: renaming downloads, merging notes into a report, turning a pile of documents into a spreadsheet. These are perfect clerk jobs. Cowork does them end to end while you work on something else. Because it acts on real files, it also needs the clearest boundaries of any tool in this course.

## What Cowork is in October 2026

Cowork has changed fast, so here is the current picture:

- **Paid plans only.** Cowork needs Pro, Max, Team or Enterprise.
- **Cowork and chat are merging.** Since September 16, 2026, Anthropic has been rolling out one combined experience to Pro and Max on web, desktop and mobile. You no longer pick a mode: describe the task and Claude decides whether it needs a quick answer or a full task. If your message box still shows **Chat** and **Cowork** options, select **Cowork** before you describe the task.
- **Tasks run in the cloud.** Since October 6, 2026, new Cowork tasks on Pro and Max run on Anthropic's servers. They keep going if you close your laptop, and scheduled tasks run with no device online.
- **Your folders stay on your computer.** Claude reaches only the folders you connect, through the Claude Desktop app, and only while the app is open. When a task needs a file, Claude fetches a copy of just that file. Look for **Trusted folders** and **Storage folder** in Settings.
- **Work everywhere.** Start, steer and review tasks on desktop, web or mobile.

If you need everything to stay on your machine, Anthropic points you to Claude Code in the desktop app instead (covered in the Claude Code course).

## Your first task: one folder, one outcome

The best Cowork tasks have a clear finish line. Compare:

```text
Clean up my files.
```

```text
In the folder "Cowork Inbox," look at every file. Rename each one as
YYYY-MM-DD_source_topic (use the date in the document if there is one, otherwise
the file date). Move them into subfolders: Clients, Marketing, Admin, Unsure.
Then create a spreadsheet called index.xlsx listing old name, new name, folder,
and a one-line summary of each file. Do not delete anything.
```

Steps:

1. Open the Claude Desktop app (needed for local folders).
2. Connect one folder. Start with a dedicated working folder, not your whole Documents folder.
3. Describe the task like the example above.
4. Review the plan Claude shows you. Push back on anything that is not what you meant.
5. Let it run, watch the first few actions, then check the results.

### Folder instructions

Each connected folder can have **folder instructions**: standing context for tasks in that folder, like Project instructions for files. Claude can update them as it learns. Example:

```text
This folder holds working files for Groomer Books.
- File names: YYYY-MM-DD_source_topic, lowercase, hyphens not spaces.
- Never delete files. Move anything you're unsure about to /Unsure.
- Client files go in /Clients/<salon-name>/.
- Summaries and reports go in /Reports/ as .docx.
```

## Permission modes: how much rope to give

Choose the mode in the message box before you start. It applies to the whole conversation, and you can change it or stop Claude at any time.

| Mode | What happens | Use it when |
| --- | --- | --- |
| Manual | Claude asks before each action; you click Allow or Deny | First runs, sensitive folders, anything touching email or the web |
| Auto (default on Pro, Max, Team) | Claude acts on its own; automated safety checks review each action and block risky ones | Routine file work in a folder you have checked |
| Skip | No prompts and no automatic checks | Almost never; only for tasks you fully trust in a folder with nothing to lose |

Whatever the mode, Claude asks before permanently deleting files on your computer. Connector permissions (always allow, needs approval, blocked) from Lesson 3 also still apply.

:::warning
Don't connect folders that hold sensitive financial records, ID documents, passwords or client personal data until you've tested Cowork on safe files. Anthropic's own safety guide says to avoid granting access to local files with sensitive information. Work on copies, keep a backup, and use Manual mode for anything that sends messages, changes important files or touches money.
:::

## Good clerk jobs for a founder

```text
Read every .docx and .pdf in /Customer Calls. Write a 2-page report:
top 5 pains, top 5 objections, exact phrases customers used, and 3 offer changes
to consider. Save it as /Reports/call-themes.docx. Quote only what is in the files.
```

```text
Combine the CSV files in /Leads into one spreadsheet, remove exact duplicates,
add a column for "source file," and flag rows missing an email. Save as
/Leads/leads-clean.xlsx. Do not contact anyone.
```

```text
Turn /Notes/offer-ideas.md into a 5-slide deck I can review, using our brand
voice from project knowledge. Save it to /Reports/ as a PowerPoint file.
```

## Schedule it

Recurring clerk work can run on its own. Type `/schedule` in a task, or choose **Scheduled** in the left sidebar. Scheduled tasks run in the cloud, so your computer can be off, but remember that local folders are only reachable while the desktop app is open. Pair schedules with connectors or cloud files, or keep the app running.

A good first schedule:

```text
Every Monday at 8am: search my Gmail for customer emails from the last 7 days
that I haven't answered, and write a one-page brief with who, what they need,
and a suggested reply for each. Draft only. Do not send anything.
```

## Safety habits that scale

- **Start narrow.** One folder, Manual mode, then widen.
- **Name the finish line.** Say exactly what files should exist at the end.
- **Forbid what you fear.** "Do not delete," "Do not send," "Do not contact anyone."
- **Watch for injection.** Files and web pages can contain hidden instructions. If Claude proposes something you didn't ask for, stop the task.
- **Check computer use separately.** Computer use (beta, Pro and Max) lets Claude click and type on your screen without the permission checks that gate other tools. Read Anthropic's guidance before turning it on.

:::try-it
Make a folder called "Cowork Inbox," drop in five harmless files (old drafts, screenshots, notes), connect it, set Manual mode, and ask Claude to rename and sort them. Approve or deny each step and see how it works.
:::

:::checkpoint
Q: You set up a scheduled task that reads files in a folder on your laptop every night. It keeps failing. What is the most likely reason?
- [ ] Scheduled tasks only run on Max
- [x] The Claude Desktop app was closed, so the cloud task could not reach your local folder
- [ ] Cowork cannot read files
Why: Cowork tasks run in the cloud and reach local folders only through the desktop app while it is open. Use cloud files or connectors for unattended schedules, or keep the app running.
:::

:::takeaways
- Cowork does whole tasks; on Pro and Max it runs in the cloud and reaches local folders through the desktop app.
- Give it one folder, folder instructions, and a clear finish line.
- Start in Manual mode; use Auto for routine work you've checked; avoid Skip.
- Keep sensitive files out, forbid deletes and sends in the prompt, and draft-only anything that leaves the business.
:::

## Go deeper

- [Claude Cowork and chat are one Claude](https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude) - the September 2026 merge and what changed
- [Get started with Claude Cowork](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork) - plans, folders, permission modes and scheduling
- [Use Claude Cowork on web, desktop, and mobile](https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile) - the October 6, 2026 move to cloud sessions
- [Use Claude Cowork safely](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely) - risks, prompt injection and protective habits
