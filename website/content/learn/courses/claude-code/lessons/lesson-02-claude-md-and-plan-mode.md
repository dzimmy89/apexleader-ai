---
module: 1
lesson_number: 2
course: claude-code
template: v2
---

# Lesson 2: CLAUDE.md and Plan Mode

:::key-concept
CLAUDE.md is a short instruction file in your project that Claude Code reads at the start of every session: your rules, your commands, your conventions. Plan mode makes Claude research and write a plan before it touches any file. Together they turn "build me something" into "build it my way, after I've approved the approach."
:::

## What you'll be able to do

- Create a CLAUDE.md with `/init` and edit it into a sharp, short rule set
- Know which CLAUDE.md file does what: project, personal and local
- Use plan mode to get a reviewable plan before any code changes
- Approve, edit or reject a plan with confidence

## Why this matters

Each Claude Code session starts with a fresh context. Without CLAUDE.md, you re-explain your business, your style and your "never do this" rules every time, and you will forget one. Without plan mode, Claude may build the wrong thing quickly. As the founder, your leverage is in setting the rules and approving the plan, not in writing code.

## CLAUDE.md: the handbook for your builder

CLAUDE.md is a plain Markdown file. Claude reads it at the start of every session. You write it; Claude follows it.

### Where it lives

| File | Scope | Use it for |
| --- | --- | --- |
| `./CLAUDE.md` (project root) | This project, shared through git | Business context, commands, conventions, rules |
| `~/.claude/CLAUDE.md` | All your projects, just you | Personal preferences, like "explain changes in plain English" |
| `./CLAUDE.local.md` | This project, just you (add to `.gitignore`) | Private notes, like your local test data |

Claude Code also keeps **auto memory**: notes it writes for itself from your corrections, stored per project on your machine. Run `/memory` to see your CLAUDE.md files and auto memory, open them, or turn auto memory off.

### Create one in a minute

In your project folder, start Claude Code and run:

```text
/init
```

Claude scans the project and writes a starting CLAUDE.md with what it found. If a CLAUDE.md already exists, `/init` suggests improvements instead of overwriting it. Then make it yours.

### What good looks like

Anthropic's guidance is clear: keep it under about 200 lines, make each rule specific enough to check, and cut anything Claude would do anyway. For each line, ask: "Would removing this cause Claude to make mistakes?" Here's a founder-sized example:

```text
# Groomer Books website

## About the business
Monthly bookkeeping for independent dog grooming salons in the US.
Audience: salon owners, busy, not technical, mostly on phones.
Voice: plain, warm, practical. Short sentences. No accounting jargon.

## How this project works
- Plain HTML and CSS, no frameworks, no build step.
- Pages live in the project root. Shared styles in styles.css.
- Preview: open index.html in a browser.

## Rules
- Explain every change in plain English for a non-developer.
- Never invent testimonials, client names, statistics or prices.
- Never add tracking scripts, analytics or third-party embeds without asking.
- Never put API keys, passwords or personal data in any file.
- Mobile first. Check every page at phone width.
- IMPORTANT: Do not commit or push unless I ask.
```

Tips that matter:

- **Specific beats vague.** "Use 16px minimum body text" works better than "make it readable."
- **One loud rule at most.** Marking one line IMPORTANT helps. Marking ten makes none stand out.
- **Add rules when Claude repeats a mistake.** CLAUDE.md is where you write down what you'd otherwise re-explain.
- **Check it loaded.** Run `/context` and look under Memory files.
- **Ask Claude to update it.** "Add a rule to CLAUDE.md: buttons always use our green, #2F7D5B."

CLAUDE.md is guidance, not a lock. Claude reads it and tries to follow it. For anything that must happen every time, like blocking edits to a secrets file, you'll use a hook in Lesson 5.

If your project already has an `AGENTS.md` file for other coding tools, put `@AGENTS.md` at the top of CLAUDE.md so both read the same rules.

## Plan mode: think first, build second

In plan mode, Claude reads files, explores and writes a plan, but cannot edit your source files until you approve. Anthropic recommends a four-step rhythm: explore, plan, implement, commit.

### How to enter it

- **Terminal:** press **Shift+Tab** until the status bar shows plan mode, or start with `claude --permission-mode plan`, or put `/plan` in front of a single prompt.
- **Desktop app:** choose **Plan** in the mode selector under the prompt box.
- **Web:** choose **Plan** in the permission mode control.

### A planning prompt that works

```text
I want to add a Pricing page with three plans (Starter, Standard, Plus) and a
short FAQ. Read the current site and CLAUDE.md first. Then give me a plan:
which files you'll create or change, the page sections, how it links from the
home page, and anything you need me to decide. Don't write code yet.
```

For bigger features, let Claude interview you first:

```text
I want to build [feature]. Interview me one question at a time about what it
should do, who uses it, and edge cases. When we're done, write the spec to SPEC.md.
```

### Approving the plan

When the plan is ready, you'll see choices like:

- **Yes, and use auto mode**: approve and let Claude build with background safety checks
- **Yes, manually approve edits**: approve and review each edit as it happens
- **No, keep planning**: stay in plan mode and say what to change

In the terminal you can press **Ctrl+G** to open the plan in a text editor and change it before Claude proceeds.

Read the plan like a contractor's quote. Look for files you didn't expect it to touch, features you didn't ask for, and decisions it made for you (colors, prices, wording). Push back in plain English: "Don't touch index.html styles. Leave prices as placeholders. Skip the newsletter signup."

### When to skip planning

Planning adds a step. If you can describe the change in one sentence, like fixing a typo or changing a color, just ask for it. Plan when the change touches several files, when you're unsure of the approach, or when you don't know the code.

:::try-it
In your project from Lesson 1, run `/init`, then open CLAUDE.md and delete any line that doesn't change how Claude behaves. Add two rules of your own from the example above.
:::

:::checkpoint
Q: Claude keeps adding made-up customer testimonials to your pages. What's the best fix?
- [ ] Correct it in chat each time it happens
- [x] Add "Never invent testimonials, client names, statistics or prices" to the project CLAUDE.md
- [ ] Switch to a different model
Why: CLAUDE.md is read at the start of every session, so a specific rule there stops the repeat mistake without you having to remember.
:::

:::takeaways
- CLAUDE.md holds your project rules; `/init` creates it, `/memory` and `/context` help you manage and check it.
- Keep it short, specific and current; add a rule whenever Claude repeats a mistake.
- Plan mode lets Claude research and propose before editing; approve, edit with Ctrl+G, or keep planning.
- Plan for multi-file or unclear changes; skip planning for one-sentence fixes.
:::

## Go deeper

- [How Claude remembers your project](https://code.claude.com/docs/en/memory) - CLAUDE.md locations, /init, imports and auto memory
- [Choose a permission mode](https://code.claude.com/docs/en/permission-modes) - plan mode, auto mode and how to switch
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) - explore, plan, implement, commit and writing a good CLAUDE.md
