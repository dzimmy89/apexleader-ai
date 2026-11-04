---
module: 1
lesson_number: 5
course: agent-build-line
template: v2
---

# Exercise 5: Measure Before You Keep It

:::key-concept
You'll run one real job three times from the same starting point: plain, with Graphify, and with Graphify plus Headroom. You'll compare the usage and the quality of each result, and decide from your own numbers which tools stay.
:::

**Time:** 60 minutes · **You'll need:** Claude Code, Python 3.10 or later, `uv`, your repo · **Builds on:** Lesson 5

:::video
id: bl-ex5-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-build-line/bl-ex5-setup.mp4
captions: /learn/video/agent-build-line/bl-ex5-setup.vtt
poster: /learn/video/agent-build-line/bl-ex5-setup.jpg
transcript: In this exercise you'll test two tools on your own project instead of trusting their numbers. Pick one job you do often. Run it plain and note the usage. Build a Graphify map and run it again. Wrap Claude Code with Headroom and run it a third time. Compare the usage and the results, then decide what stays.
:::

## Warm-up

:::checkpoint
Q: What makes this a fair test?
- [ ] Running a different job each time
- [x] The same job, from the same starting point, with the quality of each result checked
- [ ] Running each one at a different time of day
Why: Only the tool should change between runs. And a cheaper result that's worse isn't a saving.
:::

## Steps

1. **Pick the job.** Something you do often, like "add a field to the receipts form and update its tests." Write it in `notes/token-test.md`.

2. **Run 1: plain.** Make a branch `token-plain` from `main`. Note `/usage`, run the job in a new Claude Code session, note `/usage` again.

3. **Install Graphify.** `pip install graphifyy && graphify install` (or `pipx install graphifyy`). Back on `main`, run `/graphify .` and open `GRAPH_REPORT.md`. Add `graphify-out/` to `.gitignore`.

4. **Run 2: with Graphify.** Make a branch `token-graph` from `main`, start a new session, and add to your request: "Use the graph in graphify-out to find your way around before opening files." Note the usage.

5. **Install Headroom.** `uv tool install --python 3.13 "headroom-ai[all]"`, then `headroom doctor`.

6. **Run 3: Graphify plus Headroom.** Make a branch `token-both` from `main`, start with `headroom wrap claude`, and run the same request as run 2. Note the usage and `headroom savings`.

7. **Compare quality.** Do all three branches pass the tests? Is any one clearly worse? Note it.

8. **Decide.** Keep a tool only if it saved a fifth or more without making the result worse. Write your decision and the date.

9. **Clean up.** Delete the three test branches. If you're dropping Headroom, run `headroom unwrap claude`.

## Done when

- [ ] One job ran three ways from the same starting point
- [ ] `notes/token-test.md` has the usage for each run and a note on quality
- [ ] You've written a keep or drop decision for each tool, with the date
- [ ] Test branches are deleted

:::example
title: See an example result

On the Rolling Ledger portal (about 40 files), the plain run used the most. With Graphify, the agent opened six files instead of fifteen and used about a third less. Headroom added a smaller saving on top, mostly from test output. All three branches passed the tests. The founder kept Graphify with the commit hook, kept Headroom for long test and build runs only, and set a reminder to repeat the test in three months.

:::video
id: bl-ex5-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-build-line/bl-ex5-reveal.mp4
captions: /learn/video/agent-build-line/bl-ex5-reveal.vtt
poster: /learn/video/agent-build-line/bl-ex5-reveal.jpg
transcript: Here are the Rolling Ledger numbers. Graphify cut file reading from fifteen files to six and saved about a third. Headroom saved a bit more on test output. Same quality on all three. The founder kept both, with notes on when each helps, and a date to test again.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Find your biggest token costs.

1. List the five jobs that use the most of your plans each week.
2. Run the plain baseline on the biggest one.
3. Pick which tool to test first, based on whether it reads more code or more output.

**Bring to your session:** `notes/token-test.md`.

**Your coach will:**
- Check your test was fair
- Help you read the numbers
- Suggest other ways to cut usage on your heaviest jobs
:::
