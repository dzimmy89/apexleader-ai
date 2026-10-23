# Module 1 Quiz: Cursor: The AI Code Editor
Checks whether you can brief, run, constrain and review Cursor's agents safely as a non-technical founder.

---

## Question 1
You want Cursor to add a booking section that touches several files. What's the best first step?

- A) Switch run mode to Run Everything so it doesn't pause
- B) Turn on Plan Mode, review the plan, then let it build
- C) Ask it to build right away and undo with checkpoints if it goes wrong
- D) Paste all your files into the chat first

**Answer:** B

**Explanation:** Plan Mode makes the agent research and propose before changing code, so you approve the approach while changes are still free.

---

## Question 2
Which statement about Cursor in October 2026 is accurate?

- A) Cursor is owned by OpenAI and only runs GPT models
- B) The Plus tier includes cloud agents and Bugbot
- C) SpaceX owns Cursor, and OpenAI has said it will stop supplying models to Cursor, with November 12 proposed as the cutoff
- D) Cursor removed the classic editor in Cursor 3

**Answer:** C

**Explanation:** SpaceX bought Anysphere in a deal announced in June 2026, and OpenAI said it would withdraw its models; the editor is still available alongside the Agents Window.

---

## Question 3
You want two agents to work at the same time without overwriting each other. What makes that safe?

- A) Giving each agent its own job and its own worktree
- B) Running both in your main folder so you see changes live
- C) Using the same model for both
- D) Turning off checkpoints

**Answer:** A

**Explanation:** Worktrees are isolated checkouts, so each agent edits its own copy and you bring results into your main folder one at a time.

---

## Question 4
You can't decide how the hero section should look. Which Cursor feature fits?

- A) Bugbot
- B) A user rule
- C) /delete-worktree
- D) /best-of-n

**Answer:** D

**Explanation:** /best-of-n runs the same task on several models in separate worktrees so you can compare results and keep only the one you like.

---

## Question 5
You want every coding agent, in Cursor and other tools, to follow "never commit to main." Where should that rule live?

- A) In AGENTS.md at the project root
- B) In your Cursor user rules only
- C) In an @Docs index
- D) In a chat message at the start of each session

**Answer:** A

**Explanation:** AGENTS.md is committed with the project and read by Cursor and other agents; @Docs was removed in Cursor 3.14.2.

---

## Question 6
Your Bugbot reviews ignore the copy-style rules you wrote in .cursor/rules. Why?

- A) Bugbot only runs on Ultra
- B) Bugbot reads its own .cursor/BUGBOT.md file, not Cursor project rules
- C) Rules must be written in JSON
- D) Bugbot only reviews images

**Answer:** B

**Explanation:** Per Cursor's docs, project rules don't apply to Bugbot; review guidance goes in .cursor/BUGBOT.md at the root or in subfolders.

---

## Question 7
Bugbot found a bug and you're about to merge. Which Autofix setup keeps you in control?

- A) Commit to Existing Branch, then merge without re-checking
- B) Turn off Bugbot so it stops commenting
- C) Create New Branch, then review the fix as its own change
- D) Let the cloud agent merge when its tests pass

**Answer:** C

**Explanation:** A fix on a new branch is a separate change you can inspect, so nothing reaches your merge branch unreviewed and you still click merge.

---

## Question 8
A cloud agent task needs to work with your email service. What's the safe approach?

- A) Paste your main API key into the prompt
- B) Give it no live sending key; test with the feature disabled or a test key stored as a dashboard secret
- C) Share your email password so it can confirm delivery
- D) Commit the key to the repository so it persists

**Answer:** B

**Explanation:** Cloud agents run commands freely in their machine, so keep live keys away; anything that leaves the business needs a human click.

---
