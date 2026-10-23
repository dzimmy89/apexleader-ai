---
module: 1
lesson_number: 2
course: build-product-and-site
template: v2
---

# Lesson 2: Build the Site With Claude Code or Cursor

:::key-concept
You hand your SPEC.md to a coding agent, it proposes a plan, you approve it, and it builds the page while checking its own work in a browser. Your job is to set the rules, approve the plan, review what changed and say "not yet" until the page matches the spec.
:::

## What you'll be able to do

- Pick Claude Code or Cursor and get a first session running in a project folder
- Give the agent standing rules in a CLAUDE.md or AGENTS.md file so you don't repeat yourself
- Run the plan, build, verify loop on your landing page
- Review changes and roll back cleanly when the agent goes off track

## Why this matters

A year ago, "build me a website" meant hiring someone or wrestling a page builder. Now a coding agent can produce a clean, fast, hand-coded page in under an hour. The difference between a good result and a mess is not the tool. It is whether you run it like a manager: clear brief, plan review, evidence of done, small changes you can undo.

## Claude Code or Cursor: pick one

Both are coding agents. Both work. Pick the one that fits how you like to work and stick with it for this course.

| | Claude Code | Cursor |
|---|---|---|
| What it is | Anthropic's coding agent. Runs in the terminal, in the Claude desktop app (Code tab), on the web and in VS Code | A full code editor (a fork of VS Code) built around agents, from Anysphere |
| Account | A Claude Pro, Max, Team or Enterprise plan, or a Claude Console account | Cursor account; the free plan has limited agent requests, paid plans add more |
| Feels like | Chatting with a builder who works in your folder | An editor with an agent panel, plus an Agents Window for running several agents |
| Preview your page | Desktop app has a Browser pane; Claude can start a local server and screenshot the result | Built-in browser; Design Mode lets you click or draw on the page to request changes |
| Plan mode | Shift+Tab until plan mode is on | Shift+Tab in the agent input |
| Standing rules file | CLAUDE.md (reads AGENTS.md if there is no CLAUDE.md) | AGENTS.md or rules in .cursor/rules |

If you have never opened a terminal, start with the Claude desktop app's Code tab or with Cursor. Both give you buttons and panes instead of a blank black window. Plans and limits change often, so check the current pricing pages before you upgrade.

## Set up the project folder

Make one folder for your site, for example `groomer-books-site`. Put three things in it before you start the agent:

```text
groomer-books-site/
  SPEC.md          (from Lesson 1)
  content/         (your real copy: hero.md, faq.md, about.md)
  images/          (empty for now; Lesson 3 fills it)
```

Then install and open your tool.

- **Claude Code in a terminal:** the native installer is one command (`curl -fsSL https://claude.ai/install.sh | bash` on macOS and Linux; `irm https://claude.ai/install.ps1 | iex` in Windows PowerShell). Run `claude --version` to check it worked, then `cd` into your folder and type `claude`. You log in through your browser on first run.
- **Claude Code in the desktop app:** install Claude, sign in, click the **Code** tab, and choose your folder for a new session.
- **Cursor:** download it, sign in, open your folder, then open Agent with Cmd+I (Mac) or Ctrl+I (Windows and Linux).

## Give the agent standing rules

A spec describes one job. A rules file describes how you always work. Claude Code reads a file called CLAUDE.md at the start of every session; Cursor reads AGENTS.md or rules in `.cursor/rules`. Claude Code will also read AGENTS.md when there is no CLAUDE.md, so if you might use both tools, one AGENTS.md can serve both. In Claude Code you can run `/init` to generate a starter file.

Keep it short. Anthropic's docs suggest staying under 200 lines and cutting any line that wouldn't change the agent's behavior. For a landing page, ten lines is plenty.

```text
# How we work on this site
- Read SPEC.md before any change. If a request conflicts with SPEC.md, ask me.
- Plain HTML and CSS. No frameworks, no build step, no npm packages.
- Use copy from /content exactly. Never invent testimonials, prices, numbers or client names.
- Mobile first. Check every change at 375px and 1280px wide.
- After each change: run the page locally, take screenshots, and list what you checked.
- Never add analytics, tracking, cookies or third-party scripts without asking.
- Never put passwords, API keys or tokens in any file.
- Small changes. One section at a time. Tell me which files you changed.
```

## The loop: plan, build, verify

**1. Plan.** Switch to plan mode (Shift+Tab in either tool). In plan mode the agent reads and explores but does not edit your files. Ask for a plan:

```text
Read SPEC.md, AGENTS.md and everything in /content.
Propose a build plan: the files you will create, the order of sections,
and how you will check each "Done when" item in SPEC.md.
List every assumption and every [TODO] you expect. Don't build yet.
```

Read the plan. Fix anything wrong by editing SPEC.md, then ask for a revised plan. In Claude Code you can press Ctrl+G to open the plan in a text editor; in Cursor you can edit the plan file or click to build when it's ready.

**2. Build.** Approve the plan. Let the agent create `index.html` and `styles.css`.

**3. Verify.** Ask for evidence, not reassurance.

```text
Start a local preview of index.html. Take screenshots at 375px and 1280px.
Go through every "Done when" item in SPEC.md and mark it pass or fail with evidence.
Fix anything that fails, then show me the final screenshots and the list of [TODO]s.
```

Claude Code's desktop app can run the page in its Browser pane and check its own changes; Cursor has a built-in browser too. Anthropic's guidance is blunt about why this matters: without a check it can run, "looks done" is the only signal the agent has, and you become the tester.

## Review like an owner

You don't need to read code. You need to read three things:

1. **The page itself**, on your phone and on a laptop. Does it say what SPEC.md says? Would your customer understand it in five seconds?
2. **The change list.** Both tools show a diff: which files changed and what was added or removed. Look for surprises, like a new script tag or a file you didn't ask for.
3. **The agent's own report.** Pass or fail on each check, with screenshots.

Then give feedback in one batch, tied to the spec:

```text
Three changes, all in the hero:
1. Headline is too clever. Use the exact headline from content/hero.md.
2. The button must say "Book a free call", per SPEC.md.
3. On 375px the image pushes the button below the fold. Put the button first on mobile.
Re-run the screenshots after.
```

In Cursor's browser you can switch on Design Mode (Cmd/Ctrl+Shift+D) and click or circle the element you mean instead of describing it.

## When it goes wrong

Agents drift. When yours does, don't argue with it for twenty messages.

- **Stop it.** Press Esc in Claude Code to stop mid-action.
- **Rewind.** Claude Code checkpoints file edits; press Esc twice or run `/rewind` to restore an earlier state. Cursor shows each change so you can reject it.
- **Start fresh.** Anthropic's guidance: if you've corrected the agent more than twice on the same thing, clear the session and start again with a better prompt. A clean session with a sharper brief beats a long one full of failed attempts.
- **Fix the spec.** Most drift traces back to a gap in SPEC.md.

Checkpoints are not a backup. In Lesson 4 you put the site in GitHub so every version is saved for good.

:::warning
Coding agents can run commands on your computer. Work in a dedicated project folder, not your home folder or a folder with tax returns and contracts. Keep permission prompts on for anything outside the project, and never paste passwords or API keys into the chat. If a step needs a key, the agent should tell you where to put it, and you put it there yourself.
:::

:::try-it
In your project folder, ask your agent: "Read SPEC.md. Without building anything, tell me the three parts of this spec you find most ambiguous and suggest a fix for each." Add the fixes to SPEC.md.
:::

:::checkpoint
Q: The agent says "The landing page is done and looks great!" What should you ask for next?
- [ ] A more detailed description of the design
- [ ] A second agent to build a competing version
- [x] Screenshots at phone and laptop width plus a pass or fail on each "Done when" item in SPEC.md
Why: "Looks great" is an opinion. Screenshots and a checklist tied to the spec are evidence you can review in two minutes.
:::

:::takeaways
- Pick Claude Code or Cursor; both have plan mode, a preview browser and a rules file.
- Put standing rules in CLAUDE.md or AGENTS.md, short and specific.
- Run plan, build, verify, and ask for evidence against SPEC.md, not reassurance.
- When the agent drifts, stop, rewind or restart, and fix the spec.
:::

## Go deeper

- [Claude Code quickstart](https://code.claude.com/docs/en/quickstart) - install commands, login and first session
- [Claude Code desktop app](https://code.claude.com/docs/en/desktop) - Code tab, Browser pane, permission modes and plan mode
- [How Claude remembers your project](https://code.claude.com/docs/en/memory) - CLAUDE.md, AGENTS.md, /init and size guidance
- [Cursor quickstart](https://cursor.com/docs/get-started/quickstart) - install, Agent, reviewing changes and Plan Mode
- [Cursor Design Mode](https://cursor.com/docs/agent/design-mode) - click, draw or speak changes on the running page
