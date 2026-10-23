# Module 1 Quiz: Claude Code: Your Builder
Checks that you can install and steer Claude Code, set project rules, build and verify features, ship through git, and automate safely.

---

## Question 1
You've never used a terminal and want to start building with Claude Code today. What is the simplest path?

- A) Install Node.js, then build Claude Code from source
- B) Use the Free plan in a browser chat
- C) Install the Claude desktop app on a paid plan, open the Code tab and choose a local folder
- D) Email Anthropic for a developer account

**Answer:** C

**Explanation:** The desktop app includes Claude Code with no terminal needed, and Claude Code requires a paid plan such as Pro or Max.

---

## Question 2
Claude keeps changing your brand color back to blue in new sessions. Where should the rule "Buttons use #2F7D5B" live?

- A) In the project CLAUDE.md, which Claude reads at the start of every session
- B) In a chat message you send each morning
- C) In a comment at the bottom of index.html
- D) In your browser bookmarks

**Answer:** A

**Explanation:** CLAUDE.md is loaded at the start of every session, so specific rules there persist without you repeating them.

---

## Question 3
You want Claude to propose how it will add a booking request page before it changes any files. What do you use?

- A) Bypass permissions mode
- B) Plan mode, then approve, edit or reject the plan
- C) The /clear command
- D) A scheduled task

**Answer:** B

**Explanation:** Plan mode lets Claude read and propose a plan while edits stay blocked until you approve it.

---

## Question 4
Claude says your new quote calculator "works perfectly." What is the best next step?

- A) Publish it immediately
- B) Ask Claude to rewrite it in another language
- C) Turn off tests to save time
- D) Ask for test cases with known answers, the test output, and check it yourself at phone width

**Answer:** D

**Explanation:** Evidence such as test output plus your own customer-eye check confirms the feature works, while a claim of success does not.

---

## Question 5
You've corrected Claude three times on the same layout bug and it keeps getting worse. What should you do?

- A) Keep correcting in the same session until it works
- B) Run /clear and start fresh with a better, more specific prompt that includes what you learned
- C) Switch to bypass permissions
- D) Delete the project folder

**Answer:** B

**Explanation:** Repeated failed corrections clutter the context, and a clean session with a sharper prompt usually does better.

---

## Question 6
A feature is built on a branch, tests pass and /code-review findings are fixed. What should happen next?

- A) Claude opens a pull request and you review and merge it yourself
- B) Claude merges straight to main automatically
- C) You copy the files to the live server by hand without git
- D) Nothing, branches are permanent

**Answer:** A

**Explanation:** A pull request lets you review the change, and your merge click is the approval rule for code going live.

---

## Question 7
You must guarantee Claude never edits your .env file, even in unattended runs. What do you add?

- A) A line in CLAUDE.md written in capital letters
- B) A custom subagent named env-guard
- C) A PreToolUse hook that blocks edits to .env
- D) A note in the README

**Answer:** C

**Explanation:** Hooks run every time at a fixed point and can block an action, while CLAUDE.md is guidance Claude tries to follow.

---

## Question 8
You set up a weekly cloud scheduled task to fix broken links on your site. Which setup is safest?

- A) Give it every repository and connector so it never gets stuck
- B) Let it merge its own fixes to main to save you time
- C) Give it your banking connector so it can pay for a link checker
- D) Select only the site repository, add no extra connectors, and have it open a pull request for you to merge

**Answer:** D

**Explanation:** Scheduled tasks act as you and reach only what you grant, so least access plus a pull request you merge keeps you in control.

---
