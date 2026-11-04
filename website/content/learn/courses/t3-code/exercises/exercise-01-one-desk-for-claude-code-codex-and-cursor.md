---
module: 1
lesson_number: 1
course: t3-code
template: v2
---

# Exercise 1: Two Agents, One Question

:::key-concept
You'll set up T3 Code, connect two agents you already pay for, and ask both the same read-only question about your site in separate threads. At the end you'll have a working desk, a feel for how each agent thinks, and your first token numbers to compare.
:::

**Time:** 40 minutes · **You'll need:** A Mac, Windows or Linux computer, at least two of Claude Code, Codex or Cursor installed and signed in, your site's folder (or the Rolling Ledger site from Build the Product and Site) · **Builds on:** Lesson 1

:::video
id: t3-ex1-setup
kind: exercise-setup
status: paused
src: /learn/video/t3-code/t3-ex1-setup.mp4
captions: /learn/video/t3-code/t3-ex1-setup.vtt
poster: /learn/video/t3-code/t3-ex1-setup.jpg
transcript: In this exercise you'll put two agents on one desk and ask them the same question. Install T3 Code, check that at least two providers are ready, and set Supervised mode. Then open two threads on the Rolling Ledger site, one on Claude Code and one on Codex, and ask each to list every page and one thing on it that could confuse a food truck owner. Save both answers and note how many tokens each one used.
:::

## Warm-up

:::checkpoint
Q: You want Claude Code and Codex to work on the same site at the same time. What keeps them from overwriting each other?
- [ ] Asking them politely in the prompt
- [x] Giving each thread its own worktree
- [ ] Running them on different days
Why: A worktree gives each thread its own copy and branch of the project. Today's questions are read-only, so the main folder is fine, but any thread that edits files alongside another needs its own worktree.
:::

## Steps

1. **Check your agents.** In a terminal, confirm each agent you'll use is signed in on this computer: `claude auth login` for Claude Code and `codex login` for Codex. If you use Cursor, you'll sign in from T3 Code in step 3.

2. **Install T3 Code.** Download the desktop app from t3.codes, or run `npx t3@latest` if you have Node 22.16 or newer. Write down the version number shown in Settings.

3. **Connect providers.** Open **Settings → Providers**. Make sure at least two agents show as ready. Switch on Cursor if you want it and sign in. Take a screenshot.

4. **Set Supervised mode.** Change the permission mode from Full access to **Supervised**. Take a screenshot of this too.

5. **Add your project.** Add your site's folder. If you don't have one yet, use the Rolling Ledger site, a monthly bookkeeping service for independent food truck owners at $149 a month.

6. **Thread 1, Claude Code.** Start a thread on the current checkout using Claude Code and send:

```text
Read this site's files and list every page. For each page, name one thing
that could confuse an independent food truck owner reading it on their phone.
Plain English, one line each. Don't change any files.
```

7. **Thread 2, Codex.** Start a second thread using Codex and send the same message, word for word.

8. **Save the answers.** Create `notes/t3-first-run.md` in the project and paste both answers under the headings "Claude Code" and "Codex". You can do this yourself, or approve one agent writing the file.

9. **Note the numbers.** For each thread, write down the token total T3 Code shows for it (or the totals on the Usage page for today, split by provider). Add them under each answer.

10. **Compare.** Add three lines at the bottom: which answer was more useful, which caught something the other missed, and which used fewer tokens.

## Done when

- [ ] A screenshot shows at least two providers ready
- [ ] A screenshot shows Supervised mode
- [ ] `notes/t3-first-run.md` has both answers with token totals
- [ ] You've written three lines comparing them
- [ ] No files other than the notes file changed (check the diff)

:::example
title: See an example result

For Rolling Ledger, both agents found the same five pages. Claude Code flagged that the pricing page says "reconciliation" with no explanation, and Codex flagged that the booking form asks for a "business entity type" that most food truck owners won't know. Each caught one thing the other missed. In this example run, Codex used fewer tokens, so the founder noted it as the default for quick site checks, and Claude Code for anything about wording.

:::video
id: t3-ex1-reveal
kind: exercise-reveal
status: paused
src: /learn/video/t3-code/t3-ex1-reveal.mp4
captions: /learn/video/t3-code/t3-ex1-reveal.vtt
poster: /learn/video/t3-code/t3-ex1-reveal.jpg
transcript: Here's a finished result for Rolling Ledger. Both agents listed the same five pages. Claude Code spotted the unexplained word reconciliation on the pricing page. Codex spotted the confusing business entity question on the booking form. In this example Codex used fewer tokens, so the founder made it the default for quick checks and kept Claude Code for wording. Your numbers will be different, and that's the point. You now have your own.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Run the same comparison on your real business.

1. Ask both agents the same question about your real site or tool, and add a third agent if you pay for one.
2. Ask a second question that matters to your business, such as "Which page would stop a buyer from booking a call?"
3. Record tokens for every thread.

**Bring to your session:** `notes/t3-first-run.md` with all answers and numbers, and the screenshots.

**Your coach will:**
- Help you judge which answers were worth their tokens
- Check your permission settings and project folders
- Suggest which agent to make your default for each kind of question
:::
