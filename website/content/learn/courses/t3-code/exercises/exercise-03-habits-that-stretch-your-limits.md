---
module: 1
lesson_number: 3
course: t3-code
template: v2
---

# Exercise 3: The Before and After

:::key-concept
You'll do the same small job on your site twice: once the messy way, in a long thread with corrections typed as chat, and once with the habits from Lesson 3. Then you'll compare tokens, turns and results. At the end you'll have your own evidence for which habits matter, written into your project's brief.
:::

**Time:** 40 minutes · **You'll need:** T3 Code with at least one agent, your site's repository, an existing thread with a few messages in it (any earlier job works) · **Builds on:** Lesson 3

:::video
id: t3-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/t3-code/t3-ex3-setup.mp4
captions: /learn/video/t3-code/t3-ex3-setup.vtt
poster: /learn/video/t3-code/t3-ex3-setup.jpg
transcript: In this exercise you'll prove the habits to yourself. The job is the same both times: add an FAQ section to the Groomer Books home page. Round one happens in an old, long thread, and you fix things by typing corrections. Round two starts fresh in a worktree with a setup script, one clear prompt, a revert and line comments. Record tokens and turns for both, then write your top three habits into AGENTS.md.
:::

## Warm-up

:::checkpoint
Q: Why does the same short message cost more late in a long thread?
- [ ] Providers charge more after the first hour
- [x] The agent works from the whole thread so far, which keeps growing
- [ ] T3 Code adds a fee per message
Why: Every turn carries the conversation so far. Caching makes repeated parts cheaper, but the longer the thread, the more each turn costs.
:::

## Steps

1. **Pick the job.** Add an FAQ section to your home page with four questions. For Groomer Books, use: "What does monthly bookkeeping include?", "Do I need to switch banks?", "How do I send receipts?", "What if I'm behind on my books?"

2. **Round 1, the messy way.** Open an existing thread that already has several messages in it, on the current checkout. Send: "Add an FAQ section to the home page." Fix everything by typing corrections in the chat ("no, put it below pricing", "undo the font change"). Stop when it looks right, or after eight messages.

3. **Record Round 1.** Write down the number of messages you sent, the tokens the thread used (from the thread or the Usage page), the minutes it took, and a quality score from 1 to 5. Then throw the changes away (discard the working tree changes or revert to before the job).

4. **Write a setup script.** Ask an agent in a fresh thread: "Write a t3.json for this project with defaultThreadEnvMode set to worktree, an install script that runs on worktree creation, and a preview script. Use the schema at https://t3.codes/schema/t3.json." Review it and save it.

5. **Round 2, with the habits.** Start a **new** thread in a **new worktree** and send one brief:

```text
Goal: Add an FAQ section to index.html with the four questions in
notes/faq.md, below the pricing section.
Constraints: Only edit index.html and styles.css. Match the existing
fonts and colours. No new scripts.
Done when: It looks right at 375px and 1280px, with screenshots.
```

(Save the four questions and short answers to `notes/faq.md` first.)

6. **Fix with the tools, not the chat.** If something goes wrong, use **Revert to this message** and send a clearer prompt. For small fixes, comment on the line in the diff. Put any side question in a side chat.

7. **Record Round 2.** Same four numbers: messages, tokens, minutes, quality.

8. **Compare.** Put both rounds in a two-row table in `notes/before-after.md`.

9. **Write your habits down.** Add your top three habits to `AGENTS.md` under "How I work with agents", based on what your numbers showed.

## Done when

- [ ] `notes/before-after.md` has a two-row table: messages, tokens, minutes, quality
- [ ] `t3.json` is saved in the project
- [ ] Round 2 used a fresh worktree thread and at least one revert or line comment
- [ ] `AGENTS.md` lists your top three habits
- [ ] Round 1's changes were thrown away, so only Round 2's remain

:::example
title: See an example result

In this example run on Groomer Books, Round 1 took 7 messages in an old thread, including two "undo" corrections, and scored 3 out of 5 because a stray font change slipped through. Round 2 took 2 messages and one line comment in a fresh worktree, scored 5 out of 5, and used well under half the tokens of Round 1. The founder's top three habits were one job per thread, revert instead of undo, and always brief with goal, constraints and done-when. Your numbers will differ. What matters is that you now have your own.

:::video
id: t3-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/t3-code/t3-ex3-reveal.mp4
captions: /learn/video/t3-code/t3-ex3-reveal.vtt
poster: /learn/video/t3-code/t3-ex3-reveal.jpg
transcript: Here's an example result for Groomer Books. Round one took seven messages, two of them undo corrections, and a stray font change slipped through, so it scored three out of five. Round two took two messages and one line comment in a fresh worktree, scored five, and used well under half the tokens. The founder wrote three habits into AGENTS.md: one job per thread, revert instead of undo, and brief with goal, constraints and done when.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Audit a real week.

1. Export or screenshot your three longest threads from the past week in any coding agent.
2. Mark every correction message and every side question.
3. Redo one of those jobs with the habits and record both rounds.

**Bring to your session:** the marked-up threads and your before-and-after table.

**Your coach will:**
- Point out where context was wasted in your real threads
- Review your `t3.json` and `AGENTS.md`
- Pick the one habit that will save you the most next week
:::
