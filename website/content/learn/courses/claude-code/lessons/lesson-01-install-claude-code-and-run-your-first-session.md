---
module: 1
lesson_number: 1
course: claude-code
template: v2
---

# Lesson 1: Install Claude Code and Run Your First Session

:::key-concept
Claude Code is a coding agent: you describe what you want in plain English, and it reads your files, writes code, runs commands and checks its work. You can use it in the Claude desktop app, in a terminal, or in a browser. You don't need to know how to code to start. You need a paid plan, a folder, and a clear request.
:::

## What you'll be able to do

- Pick the right way to run Claude Code: desktop app, terminal or web
- Install it and sign in
- Run a first session that builds a real web page in a folder on your computer
- Approve, steer and stop Claude while it works

## Why this matters

Every business needs things built: a website, a pricing page, a small internal tool, a script that cleans up a spreadsheet. Hiring a developer for each one is slow and expensive. Claude Code is your builder. You stay the founder who decides what gets built and checks the result. It does the typing.

## What you need

- **A paid Claude plan.** Claude Code is included in Pro, Max, Team and Enterprise, or with a Console (API) account. The Free plan does not include it. See [current plans](https://claude.com/pricing).
- **A computer** running macOS 13 or later, Windows 10 (version 1809) or later, or a recent Ubuntu or Debian. 4 GB of RAM is the minimum.
- **An internet connection.**

## Three ways to run it

| Option | Best for | What it needs |
| --- | --- | --- |
| Desktop app, Code tab | Non-developers who want buttons, visual diffs and no terminal | The Claude desktop app (macOS, Windows; Linux in beta) |
| Terminal (CLI) | The full feature set, scripting and automation | A one-line install |
| Web, claude.ai/code | Running tasks in the cloud from any browser or your phone | A GitHub account with your code in it |

All three run the same engine, so what you learn carries over. This course shows the terminal and desktop steps side by side. Start with the desktop app if a terminal makes you nervous.

## Option A: the desktop app

1. Download the Claude desktop app for macOS or Windows from the [desktop quickstart](https://code.claude.com/docs/en/desktop-quickstart) and install it.
2. Open it and sign in with your Claude account.
3. Click the **Code** tab at the top of the sidebar. If you're asked to upgrade, your plan doesn't include Claude Code yet.
4. Under the prompt box, open the environment selector and choose the top entry under **Local**. Then use the folder control, choose **Open folder…**, and pick a project folder.
5. Pick a model from the model picker and type your request.

The desktop app includes Claude Code, so you don't install anything else.

## Option B: the terminal

Open a terminal. On a Mac press Cmd + Space, type Terminal and press Enter. On Windows press Win + X and choose Windows PowerShell or Terminal.

Paste the install command for your system and press Enter:

```text
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell (prompt starts with PS)
irm https://claude.ai/install.ps1 | iex
```

The installer shows no progress while it downloads. Wait for "Claude Code successfully installed!" Then open a new terminal window and check:

```text
claude --version
```

You should see a version number. If you see "command not found" or "not recognized," the install folder isn't on your PATH yet; the installer prints the fix under "Setup notes," and the [terminal guide](https://code.claude.com/docs/en/terminal-guide) walks through it. Run `claude doctor` for a full health check.

If you prefer a package manager, `brew install --cask claude-code` (Mac) and `winget install Anthropic.ClaudeCode` (Windows) also work, but they don't auto-update. The native installer above updates itself in the background.

On Windows, installing [Git for Windows](https://git-scm.com/downloads/win) is optional but recommended so Claude can use the Bash tool. Accept the defaults in its installer.

Now make a project folder, move into it and start Claude:

```text
mkdir groomer-books-site
cd groomer-books-site
claude
```

The first time, a browser window opens so you can sign in with your Claude account.

## Option C: the web

Go to [claude.ai/code](https://claude.ai/code), connect your GitHub account, pick a repository, and describe a task. The session runs on Anthropic's cloud and pushes a branch when it's done, so it keeps working if you close your laptop. You'll use this in Lesson 5. For your first session, use Option A or B so you can see files appear on your own computer.

## Your first session

Use the sample business if you don't have one: Groomer Books, monthly bookkeeping for independent dog grooming salons. Type:

```text
I'm not a developer. Build a simple one-page website for my business in this
folder using plain HTML and CSS, no frameworks. Business: Groomer Books, monthly
bookkeeping for independent dog grooming salons. Sections: headline, three
benefits, how it works in 3 steps, pricing "from $X per month" as a placeholder,
and a contact email link. Mobile friendly. When you're done, tell me exactly
how to open it in my browser.
```

What happens next:

1. Claude reads the folder (empty for now) and plans the files.
2. It asks permission before creating files if you're in Manual mode, or shows the changes afterward in Auto or Accept edits mode.
3. It writes `index.html` and a stylesheet, then tells you how to open the page.

Open the file in your browser (double-click `index.html`). Then iterate in plain English:

```text
Make the headline shorter and punchier. Use a warm green as the main color.
Add a "Book a free 15-minute books check" button that opens an email to me.
```

## Steering and stopping

- **Esc** stops Claude mid-action in the terminal. Your context is kept, so you can redirect. In the desktop app, click the stop button, or type a correction and press Enter.
- **Permission modes** control how much Claude does without asking. In the terminal, press **Shift+Tab** to cycle modes. In the desktop app, use the mode selector under the prompt box. Current versions start in **Auto**, where a safety classifier reviews actions and blocks risky ones. **Manual** asks before edits and commands. You'll learn **Plan** mode in Lesson 2.
- **/help** lists commands. Type **exit** to leave the terminal session.

:::warning
Run Claude Code in a project folder, not your whole home folder or Desktop. Never paste passwords, API keys or bank details into the prompt. If Claude asks to run a command you don't understand, ask "What will this command do and why do you need it?" before you approve.
:::

:::try-it
In your session, ask: "Explain what each file in this folder does, in two sentences each, for a non-developer." Reading Claude's explanation is the fastest way to learn your own project.
:::

:::checkpoint
Q: You're on the Free Claude plan and the Code tab asks you to upgrade. What's going on?
- [ ] The desktop app is broken and needs reinstalling
- [x] Claude Code requires a paid plan such as Pro or Max, or a Console account
- [ ] You need to install the terminal version first
Why: Claude Code is included with Pro, Max, Team and Enterprise plans and Console accounts, not the Free plan, on every surface.
:::

:::takeaways
- Claude Code is your builder: describe the outcome, review the result.
- Desktop app (Code tab), terminal and web all run the same engine; start with whichever feels easiest.
- Install with one command, check with `claude --version`, and sign in on first run.
- Work inside one project folder, use Esc to steer, and ask before approving commands you don't understand.
:::

## Go deeper

- [Claude Code overview](https://code.claude.com/docs/en/overview) - every surface and what it can do
- [Terminal guide for new users](https://code.claude.com/docs/en/terminal-guide) - opening a terminal, installing and fixing PATH errors
- [Get started with the desktop app](https://code.claude.com/docs/en/desktop-quickstart) - the Code tab step by step
- [Advanced setup](https://code.claude.com/docs/en/setup) - system requirements, package managers, updates and uninstall
