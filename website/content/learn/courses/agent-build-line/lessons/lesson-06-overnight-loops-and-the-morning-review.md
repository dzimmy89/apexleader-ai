---
module: 1
lesson_number: 6
course: agent-build-line
template: v2
---

# Lesson 6: Overnight Loops and the Morning Review

:::video
id: bl-l6-overview
kind: overview
status: paused
src: /learn/video/agent-build-line/bl-l6-overview.mp4
captions: /learn/video/agent-build-line/bl-l6-overview.vtt
poster: /learn/video/agent-build-line/bl-l6-overview.jpg
transcript: The best hours for agent work are the ones you're asleep. Before bed, you hand three small jobs to cloud agents. Each one works in a loop: make the change, run the checks, fix what failed, and stop when the checks pass or after three tries. By morning there are pull requests with preview links waiting. Over coffee you click through each one and merge the good ones. In this lesson you'll set up the evening queue, write jobs that know when to stop, and run the twenty-minute morning review.
:::

:::key-concept
An **agent loop** is an agent repeating one cycle until a goal is met: change, check, fix. It works overnight only if the agent can **check its own work** (tests, a build, a list of done-when checks it can run) and knows **when to stop**, both when it succeeds and when it's stuck. **Cloud agents**, like Claude Code on the web and Codex cloud, run on the provider's computers, so your laptop can sleep. The loop ends at a pull request. The **morning review** is where you, and only you, decide what goes live.
:::

## What you'll be able to do

- Pick jobs that are safe to run while you sleep, and spot the ones that aren't
- Write a job with checks the agent can run and a stop rule
- Start the jobs in a cloud agent before bed
- Run a twenty-minute morning review from preview links
- Turn what went wrong overnight into a rule for next time

## Why this matters

Everything in this course has been building to this. Agents work on dev and sandbox copies (Lessons 1 and 2). Each change becomes a pull request with a preview, and agents can't merge (Lesson 3). Jobs run in parallel without colliding (Lesson 4), and cost less (Lesson 5). With those fences in place, you can let agents work without watching, and spend your own hours on the parts only you can do: talking to truck owners, selling, deciding.

## Good overnight jobs

| Good | Not overnight |
|---|---|
| Add tests for the receipts page | Anything that touches live data or live keys |
| Fix the three accessibility issues from last week's review | Pricing, plan or copy changes on the sales page |
| Make the monthly summary print on one page | A big redesign where "done" is a matter of taste |
| Update a library and fix what breaks | Database migrations for the live project |

The pattern: a good overnight job is **small**, has a **done-when the agent can check**, and touches **only dev and sandbox**. If you'd need to look at it to know it's done, it's a daytime job.

## Write a job that knows when to stop

Put each job in a GitHub issue with the label `overnight`, in your `specs` format, with two extra sections:

```markdown
## Goal
The monthly summary page prints on one A4 or letter page.

## Done when (run these yourself)
- `npm test` passes
- `npm run build` passes
- A print preview of /summary for test owner A is one page
- No file outside /app/summary and /styles/print.css changed

## Stop rule
If the checks still fail after three attempts, stop. Open a draft pull
request with what you tried and what's still failing. Never change the
tests to make them pass.
```

The stop rule is the most important part. Without it, a stuck agent keeps trying all night, uses your plan and leaves you a mess. With it, a stuck job costs three tries and leaves you a clear note.

:::infographic
id: fig-1
type: flow
title: One overnight loop
shows: A loop of four cards: change, run the checks, checks pass? yes goes right to "open a pull request with preview" (the paper card); no goes back to "fix" with a counter "try 1 of 3". After three tries an arrow leads down to a card "stop, draft pull request with notes".
data: none
image: /learn/figures/agent-build-line/lesson-06-fig-1.webp
alt: The agent changes the code, runs the checks, and either opens a pull request with a preview when they pass, or fixes and tries again, up to three tries. After three failed tries it stops and opens a draft pull request with notes.
:::

## Start the jobs before bed

Cloud agents run on the provider's computers and open pull requests on your GitHub repo when they're done.

- **Claude Code on the web** (claude.ai/code, or the Claude app on your phone): connect your GitHub repo, start a session per job, and paste the issue link: "Do the job in this issue. Follow its done-when and stop rule. Open a pull request when the checks pass."
- **Codex cloud** (chatgpt.com/codex): connect the same repo and start a task per job the same way.

Each one sets up a fresh copy of your repo in a sandbox, works on its own branch and opens a pull request. Vercel builds a preview for each, as in Lesson 3. Give cloud agents only your **dev and sandbox** settings: the same values your Vercel previews use. Live keys never go in a cloud agent's environment.

Three jobs is a good start. One per plan you have is a sensible limit, so a bad night doesn't use up tomorrow's allowance.

:::video
id: bl-l6-evening-queue
kind: inline
status: paused
src: /learn/video/agent-build-line/bl-l6-evening-queue.mp4
captions: /learn/video/agent-build-line/bl-l6-evening-queue.vtt
poster: /learn/video/agent-build-line/bl-l6-evening-queue.jpg
transcript: It's ten at night. The Rolling Ledger founder has three issues labeled overnight. She opens Claude Code on the web on her phone, starts two sessions, one per issue, and starts the third in Codex cloud. Each gets one line: do the job in this issue, follow the stop rule. Phone down. Next morning: two pull requests with preview links, and one draft that says the print fix failed twice on Safari and explains why.
:::

## The morning review

Twenty minutes, with coffee. For each pull request, in order:

1. **Read the summary.** What did the agent say it did? Did it change only the files the job allowed?
2. **Check the checks.** Tests and build green on the pull request?
3. **Click the preview.** On your phone, do the thing the job was for.
4. **Decide.** Merge, send back with one comment, or close it.

Drafts from stuck jobs get a quick read: is the note telling you the job was too big, or the done-when was wrong? Rewrite the issue and try again tonight, or do it yourself today.

Then the last step: anything that went wrong overnight becomes one dated rule in your `mistakes` house skill, as in the Agent Skills course. That's how the line gets better every week.

:::infographic
id: fig-2
type: diagram
title: The morning review
shows: Four cards in a row, each with a Lucide icon: read the summary, check the tests, click the preview, decide. Under "decide", three small pills: merge, send back, close. A coffee cup icon and "20 minutes" note on the left. The decide card is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-06-fig-2.webp
alt: The twenty-minute morning review: read the agent's summary, check the tests, click the preview, then decide to merge, send it back or close it.
:::

:::warning
An agent that runs unattended must not be able to do anything you couldn't undo over coffee. That means no live keys in its environment, no merge permission, approval kept on for anything outside its sandbox, and a stop rule on every job. And never let an agent "fix" failing tests by changing the tests; say so in every stop rule.
:::

:::try-it
Look at your open issues and label the two smallest ones with a done-when an agent could check as `overnight`. Add a stop rule to each. That's tonight's queue.
:::

:::checkpoint
Q: Which of these is a good overnight job?
- [ ] Rewrite the pricing page so it sells better
- [x] Add tests for the receipts page, done when `npm test` passes
- [ ] Apply this week's migration to the live database
Why: A good overnight job is small, has a check the agent can run itself, and touches only dev and sandbox. "Sells better" needs your judgement, and live migrations are yours.
:::

:::checkpoint
Q: What's the point of the stop rule?
- [ ] To make the agent work faster
- [x] So a stuck agent stops after a few tries and leaves notes, instead of looping all night
- [ ] To stop the agent from opening a pull request
Why: Without a stop rule, a stuck agent keeps trying, uses your plan and may make things worse. Three tries and a draft pull request with notes is cheap and useful.
:::

:::takeaways
- An overnight loop works only with checks the agent can run and a rule for when to stop.
- Good overnight jobs are small, checkable and touch only dev and sandbox.
- Cloud agents run while your laptop sleeps and end each job at a pull request with a preview.
- The twenty-minute morning review decides what ships, and every overnight mistake becomes a rule.
:::

## Go deeper

- [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) - running cloud sessions on your GitHub repos
- [Codex cloud](https://developers.openai.com/codex/cloud) - delegating tasks to Codex in the cloud
- [GitHub branch rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) - requiring pull requests for main
- [Vercel preview deployments](https://vercel.com/docs/deployments/environments) - the preview link on every pull request
