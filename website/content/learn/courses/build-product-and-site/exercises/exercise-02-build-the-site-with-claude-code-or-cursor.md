---
module: 1
lesson_number: 2
course: build-product-and-site
template: v2
---

# Exercise 2: Build Version 1 of Your Landing Page

:::key-concept
You'll have a coding agent build your landing page from SPEC.md on your own computer, using plan mode first and screenshots as proof. At the end you have a working index.html and styles.css that pass your own "Done when" checks.
:::

**Time:** 45 minutes · **You'll need:** Claude Code (Claude Pro or higher, or a Console account) or Cursor (free plan works to start), your project folder from Exercise 1 · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: You've corrected the agent three times about the same button and it keeps getting it wrong. What's the best next move?
- [ ] Keep correcting in the same chat, with more capital letters
- [ ] Give up on the agent and hand-edit the HTML
- [x] Add the rule to SPEC.md, clear or restart the session, and ask again with a sharper prompt
Why: A long session full of failed attempts confuses the agent. A fresh session with the rule written into the spec usually gets it right first time.
:::

## Steps

1. **Install and open your tool.**
    - Claude Code: run the installer from the quickstart (macOS or Linux: `curl -fsSL https://claude.ai/install.sh | bash`; Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`), check with `claude --version`, then `cd` into your project folder and run `claude`. Or use the Code tab in the Claude desktop app and choose your folder.
    - Cursor: install, sign in, **Open Folder**, then open Agent with Cmd+I or Ctrl+I.

2. **Write the rules file.** Ask the agent:

    ```text
    Create AGENTS.md in this folder with these rules, word for word:
    - Read SPEC.md before any change. If a request conflicts with SPEC.md, ask me.
    - Plain HTML and CSS. No frameworks, no build step, no npm packages.
    - Use copy from /content exactly. Never invent testimonials, prices, numbers or names.
    - Mobile first. Check every change at 375px and 1280px wide.
    - After each change, preview the page, take screenshots, and list what you checked.
    - Never add analytics, tracking, cookies or third-party scripts without asking.
    - Never put passwords, API keys or tokens in any file.
    - Tell me which files you changed.
    ```

    In Claude Code, also create a CLAUDE.md containing the single line `@AGENTS.md` so Claude Code loads the same rules.

3. **Plan.** Press Shift+Tab until you're in plan mode, then paste:

    ```text
    Read SPEC.md, AGENTS.md and everything in /content.
    Propose a build plan: files to create, section order, and how you'll check each
    "Done when" item. List every assumption and every [TODO]. Don't build yet.
    ```

    Edit SPEC.md to resolve each assumption you disagree with. Ask for a revised plan if needed.

4. **Build.** Approve the plan (or switch out of plan mode) and let the agent create the page.

5. **Verify with evidence.** Paste:

    ```text
    Preview index.html locally. Take screenshots at 375px and 1280px.
    Mark every "Done when" item in SPEC.md as pass or fail with evidence.
    Fix failures, then show me the final screenshots and the list of [TODO]s.
    ```

6. **Review like an owner.** Open the page in your own browser and on your phone (the agent can tell you how to open the local file). Write one batch of feedback, numbered, tied to SPEC.md, and send it. Re-verify.

7. **Close the [TODO]s.** Write any missing copy in /content yourself, then ask the agent to update the page from it.

## Done when

- [ ] index.html and styles.css exist and the page shows every section in SPEC.md, in order
- [ ] You've seen screenshots at 375px and 1280px, and the page looks right on your own phone
- [ ] The agent reported pass on every "Done when" item, or you've accepted each fail in writing in SPEC.md
- [ ] No [TODO]s remain and no text on the page was invented by the agent
- [ ] AGENTS.md (and CLAUDE.md if you use Claude Code) holds your standing rules

:::coached
**For 1-on-1 coaching clients.** Build two directions and choose with data from real people.

1. Ask the agent to build a second version of the hero and price sections on a copy of the page (`index-b.html`), using one of your alternative hero options.
2. Show both versions on your phone to three people who match your customer. Ask only: "What does this business do, and what would you click?" Write down their exact words.
3. Turn the winning version's lessons into SPEC.md changes, rebuild, and delete the losing version.

**Bring to your session:** both versions (screenshots or live on your laptop), the three people's answers, and your updated SPEC.md.

**Your coach will:**
- Review the page on a phone, live, against your spec and your customer
- Help you decide what to cut, which is usually more valuable than what to add
- Check your rules file for gaps before agents touch the site again
:::
