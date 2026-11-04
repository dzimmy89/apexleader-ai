---
module: 1
lesson_number: 3
course: t3-code
template: v2
---

# Lesson 3: Habits That Stretch Your Limits

:::video
id: t3-l3-overview
kind: overview
status: paused
src: /learn/video/t3-code/t3-l3-overview.mp4
captions: /learn/video/t3-code/t3-l3-overview.vtt
poster: /learn/video/t3-code/t3-l3-overview.jpg
transcript: Most wasted tokens come from habits, not from the plan you picked. Every turn in a thread sends the conversation so far back to the model, so a long thread costs more each time you type. Corrections typed as chat pile up. Questions asked mid-job bloat the context. In this lesson you'll learn seven habits that keep threads short and clean, using T3 Code's side chats, revert, diff comments, setup scripts and auto-resume. Then you'll measure the difference yourself.
:::

:::key-concept
Each time you send a message, the agent works from the whole thread so far, not just your last line. A long, messy thread makes every new turn more expensive, and it often makes the agent worse too, because old mistakes stay in view. Short threads, clean corrections and a good setup script stretch the same plan much further. Think of it as briefing a contractor fresh for each job instead of handing them a year of emails every morning.
:::

## What you'll be able to do

- Explain why long threads use more of your limits on every turn
- Use side chats, revert and diff comments instead of long corrections
- Set up a `t3.json` script so agents don't rediscover your project
- Queue work to resume when a limit resets instead of paying extra

## Why this matters

Two founders on the same plan can get very different amounts of work out of it. The difference is mostly how they run threads. One keeps a single thread open for a week and types "no, undo that" when something goes wrong. The other starts a fresh thread per job, rolls back with one click and points at the exact line to fix. The second founder runs out of usage later in the week and gets cleaner results.

## Why long threads cost more

Agents don't remember a thread the way a person does. On every turn, the provider processes the conversation so far, plus the files the agent reads. Providers cache repeated parts, which makes them cheaper, but they still count. So the twentieth message in a thread costs far more than the first, even if you only typed "thanks, now the footer."

:::infographic
id: fig-1
type: chart
title: Every turn carries the whole thread
shows: Two rows of bars. The top row, one long thread, has bars that grow at each of ten turns as context piles up. The bottom row, three short threads, has bars that reset to small at the start of each new thread. Labelled "example" with no real token numbers.
data: Example only, relative bar heights: long thread grows 1 to 10 across ten turns; short threads go 1, 2, 3, then 1, 2, 3, then 1, 2, 3, 4.
image: /learn/figures/t3-code/lesson-03-fig-1.webp
alt: An example comparing one long thread, where each of ten turns carries more context than the last, with three short threads that each start small again.
:::

## Seven habits

**1. One job per thread.** Start a new thread for each job and settle it when it's done. T3 Code can link a thread to its pull request and settle it automatically when the pull request merges. Settled threads stay searchable but out of your way.

**2. Ask side questions in a side chat.** Since version 0.1.6, T3 Code has side chats: a question that sits beside the main thread, such as "What does this CSS rule do?" The answer doesn't bloat the main thread's context.

**3. Revert, don't argue.** Every turn saves a checkpoint. **Revert to this message** puts both your files and the agent's conversation back to that point. Then you send a clearer prompt. Typing "undo that" costs a whole new turn, often leaves stray changes, and keeps the mistake in the thread. Checkpoints aren't backups, so keep your work in GitHub too.

**4. Comment on the line, not in a paragraph.** In the diff view, comment on the exact lines you'd change ("make this button orange") and send the comments back. Short and precise beats a long description of where the problem is.

**5. Write a setup script once.** A `t3.json` file in your project tells T3 Code how to start your site, run tests and prepare new worktrees. Without it, agents spend turns working out how your project runs. A simple one for a site:

```json
{
  "$schema": "https://t3.codes/schema/t3.json",
  "defaultThreadEnvMode": "worktree",
  "scripts": [
    { "name": "Install", "command": "npm install", "icon": "build", "runOnWorktreeCreate": true },
    { "name": "Preview", "command": "npm run dev", "icon": "play", "previewUrl": "http://localhost:3000" }
  ]
}
```

Ask an agent to write yours from this example, then check it. If your site is plain HTML with no `npm`, the agent will suggest a simpler command.

**6. Start small.** T3 Code accepts very long messages, but a focused prompt works better. Brief with goal, files, constraints and done-when, as in the Cursor course. Start with a read-only or tiny change before a big one.

**7. Wait for the reset instead of paying.** When a plan hits its limit, queue the next messages. Queued messages live on the computer doing the work, survive restarts and can be reordered. Since version 0.1.0, T3 Code can resume a thread on its own when the limit resets. That's usually better than switching to an API key, which bills every token.

:::video
id: t3-l3-revert
kind: inline
status: paused
src: /learn/video/t3-code/t3-l3-revert.mp4
captions: /learn/video/t3-code/t3-l3-revert.vtt
poster: /learn/video/t3-code/t3-l3-revert.jpg
transcript: Watch the difference. The agent rewrote the whole Rolling Ledger hero section when we only wanted a new headline. Typing undo that would cost a full turn and keep the mistake in the thread. Instead we choose revert to this message on our last good turn. The files and the conversation go back. Now we send a clearer prompt: change only the headline text in index.html. One clean turn, and the thread stays short.
:::

:::infographic
id: fig-2
type: anatomy
title: Seven habits that stretch your limits
shows: A checklist card with seven rows, each with a Lucide icon and a short label: one job per thread, side chat for questions, revert don't argue, comment on the line, write a setup script, start small, wait for the reset. The last row is on paper because it saves the most money.
data: none
image: /learn/figures/t3-code/lesson-03-fig-2.webp
alt: Seven habits: one job per thread, side chats for questions, revert instead of arguing, comment on the exact line, write a setup script, start small, and wait for the limit reset instead of paying for API tokens.
:::

:::video
id: t3-l3-side-chats-and-comments
kind: inline
status: paused
src: /learn/video/t3-code/t3-l3-side-chats-and-comments.mp4
captions: /learn/video/t3-code/t3-l3-side-chats-and-comments.vtt
poster: /learn/video/t3-code/t3-l3-side-chats-and-comments.jpg
transcript: Two small tools save a lot. A side chat lets us ask what a CSS rule does without adding the answer to the main job. And in the diff view, we comment right on the line we want changed, make this button orange, and send it back. The agent gets exactly what to fix, and we skip a paragraph of explanation.
:::

## Measure, don't guess

Habits only matter if they show up in your numbers. T3 Code's **Usage** page shows tokens by provider, model and day. In the exercise you'll run the same job twice, once the messy way and once with the habits, and compare. Your own numbers are the only ones that count. This course doesn't promise a percentage.

:::warning
Revert puts back the files and conversation T3 Code knows about. It can't undo things outside your project, such as an email sent or a database changed. Keep Supervised mode on for any thread that can run commands, and keep tasks that touch the outside world out of agent threads.
:::

:::try-it
Open the longest thread you have in any coding agent. Count how many messages are corrections ("no", "undo", "not that"). Each one was a full turn. Which could have been a revert or a line comment?
:::

:::checkpoint
Q: The agent changed three files when you asked for one. What's the cheapest fix?
- [ ] Type "undo that and only change index.html"
- [x] Revert to the last good message, then send a clearer prompt
- [ ] Start over in a different agent
Why: Revert restores the files and the conversation in one click. A new "undo" message costs a full turn, keeps the mistake in context and may not undo everything.
:::

:::checkpoint
Q: Halfway through a job, you want to ask what a line of code does. Where should you ask?
- [ ] In the main thread, so the agent has context
- [x] In a side chat
- [ ] In a brand new project
Why: A side chat sits beside the main thread, so the answer doesn't add to the context every future turn of the job has to carry.
:::

:::takeaways
- Every turn carries the whole thread, so long threads cost more each time.
- One job per thread. Settle it when it merges.
- Side chats for questions, revert instead of "undo," line comments instead of paragraphs.
- A `t3.json` setup script saves agents from rediscovering your project.
- When a limit hits, queue and let the thread resume after the reset.
:::

## Go deeper

- [A deep dive into T3 Code](https://flaviocopes.com/t3-code/) - threads, checkpoints, diff review and `t3.json`
- [T3 Code on GitHub](https://github.com/pingdotgg/t3code) - release notes for side chats and auto-resume
- [T3 Code FAQ](https://github.com/pingdotgg/t3code/blob/main/docs/user/faq.md) - worktree cleanup and storage
