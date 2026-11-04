# Module 1 Quiz: Agent Skills and Plugins
Checks whether you can install shared skills safely, use the starter skills, write house skills that keep improving, and give your agent eyes, brakes and current docs.

---

## Question 1
What's the difference between a skill and your `CLAUDE.md` file?

- A) There is none; they're two names for one file
- B) `CLAUDE.md` loads every session; a skill loads only when a job matches its description
- C) Skills only work in Codex
- D) `CLAUDE.md` is for procedures and skills are for facts

**Answer:** B

**Explanation:** Project rules files load every time, so they hold facts and rules that always apply. Skills hold procedures, and the agent loads one only when its description matches the job.

---

## Question 2
You find a skill that includes a `scripts/` folder. What do you do before installing it?

- A) Nothing, skills can't run code
- B) Install it everywhere so you don't have to do it twice
- C) Read the `SKILL.md` and have your agent list every command it runs and file it changes
- D) Turn approval off so it can run smoothly

**Answer:** C

**Explanation:** Skills can include scripts that run with your permissions. Read it, check what it runs, prefer known sources, install per project, and keep approval on.

---

## Question 3
You want the same code review skill in Claude Code and Cursor. What's the simplest route?

- A) Write it twice, once for each tool
- B) Install from a shared collection like wshobson/agents, or use `npx skills add` and pick each agent
- C) Copy your Claude chat history into Cursor
- D) It can't be done; skills only work in one tool

**Answer:** B

**Explanation:** Skills follow an open format. wshobson/agents adapts one source for Claude Code, Codex, Cursor, OpenCode and others, and `npx skills add` installs a single skill into the agent you choose.

---

## Question 4
In a `/grill-me` round the agent asks "Send a reminder email the day before? Recommended: yes." You agree. What do you reply?

- A) "Yes"
- B) A full paragraph restating the answer
- C) Nothing; it will wait
- D) "/grill-me" again

**Answer:** A

**Explanation:** Each question is worded so "yes" accepts the recommended answer. You only write more when you want something different.

---

## Question 5
Your brand is cream and coral, which `frontend-design` lists as a common AI-design cliché. What should you do?

- A) Change your brand colours
- B) Uninstall `frontend-design`
- C) State in your design system skill that these are deliberate brand colours, and that its values win over other design skills
- D) Ignore it; the skills will sort it out

**Answer:** C

**Explanation:** `frontend-design` steers away from defaults. Your design system skill holds the decisions you made on purpose, and tells the agent they come first.

---

## Question 6
An agent deleted a customer list in your project folder. It must never happen again. Where does the fix go?

- A) Only in the mistakes skill
- B) A hook that blocks the action, plus a dated note in the mistakes skill
- C) Your voice skill
- D) A longer prompt next time

**Answer:** B

**Explanation:** Skills are instructions the agent follows, not locks. Anything that must never happen needs a hook, which the agent can't skip. The note explains why it's there.

---

## Question 7
You installed the security guidance plugin and your Claude usage climbed. Why?

- A) It's a paid plugin
- B) Its finish-time and commit reviews make model calls through your Claude Code sign-in
- C) It reruns every past session
- D) It turns on a bigger model for all your work

**Answer:** B

**Explanation:** The pattern warnings are free, but the two review layers call a model. They use your sign-in or API key, so they count against your plan.

---

## Question 8
The agent keeps writing code for a service using an option the service renamed months ago. What fixes it?

- A) The language server plugin
- B) Context7, so the agent fetches the service's current docs first
- C) Turning off approval
- D) Switching to a cheaper model

**Answer:** B

**Explanation:** Agents learned from older code. Context7 pulls current, version-specific docs into the agent's context before it writes code. Set it up with `npx ctx7 setup` or add "use context7" to the request.
