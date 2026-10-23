---
module: 1
lesson_number: 1
course: codex
template: v2
---

# Lesson 1: The Codex App

:::key-concept
Codex is OpenAI's agent for building software, and in 2026 it can also browse, make images and operate other apps on your computer. Since July 2026 it lives inside the ChatGPT desktop app, where you switch between ChatGPT Work for general business tasks and Codex for building things. You give it a project folder and a clear brief; it works, shows you the changes, and waits for your approval.
:::

## What you'll be able to do

- Install the ChatGPT desktop app and find Codex in it
- Start a project, give Codex a brief and review the changes it proposes
- Choose between working locally, in a separate worktree, or in the cloud
- Understand how Codex usage is billed so there are no surprises

## Why this matters

If you already pay for ChatGPT, you already have a capable builder on staff. Codex can turn a spec into a landing page, a quote calculator or a script that cleans up your monthly exports, then check its own work in a browser. For a solo founder that means small software jobs stop waiting for a developer. The skill you need is the same as with any contractor: a clear brief, a defined workspace, and a review before anything goes live.

## Where Codex lives in October 2026

Codex has moved fast this year. The facts that matter:

- **April 16, 2026:** OpenAI's "Codex for (almost) everything" update added computer use, an in-app browser, image generation, memory (preview), more than 90 plugins and automations to the Codex desktop app.
- **July 9, 2026:** OpenAI launched ChatGPT Work and merged the Codex app into a new ChatGPT desktop app for Mac and Windows. Codex users could update to it, and the old desktop app was renamed ChatGPT Classic. Work handles knowledge-work tasks across your files and apps; Codex stays focused on software, with diff review and pull request tools.
- **August 11, 2026:** a Linux preview of the desktop app followed, though native computer use wasn't available on Linux at launch.

You may still see the Codex name and icon, and OpenAI's docs still describe "the Codex app." It's the same thing: the Codex side of the ChatGPT desktop app. Codex is also available on the web, in the ChatGPT mobile app, in a terminal tool and in code editors.

## How Codex is billed

Since April 2026, Codex usage on Plus, Pro, Business and Enterprise plans is priced by tokens: each task uses credits depending on the model and how much it reads and writes. OpenAI's help center says Codex, ChatGPT Work and some other agents share one usage and credit pool. Check the **Usage** panel in Codex settings to see what's left, and read OpenAI's Codex pricing article before turning on auto-reload. Models change often too; for example, an older model was retired from Codex on October 14, 2026. Use the default model unless you have a reason not to.

## Your first project

1. Install the ChatGPT desktop app from OpenAI's site and sign in with your ChatGPT account.
2. Switch to Codex.
3. Create a folder on your computer, for example `groomer-books-tools`, and add it as a project. A project is a folder Codex is allowed to work in. It can't see the rest of your computer through the project.
4. Add an `AGENTS.md` file to the folder (Codex can write it with you). This is the standing brief every Codex task reads: who you are, how you build, and what's off limits. The same file works in Cursor and GitHub Copilot.

A first brief that keeps you in control:

```text
I'm a non-technical founder. This folder is for small internal tools for
Groomer Books, a monthly bookkeeping service for independent dog groomers.
First, write AGENTS.md with: a two-line business summary; "build simple tools
a non-developer can run"; "never put passwords, API keys or client data in
files"; "ask before installing anything or using the internet"; "explain
changes in plain English". Show me the file before saving it.
```

Then a small real job:

```text
Build a one-page price quote calculator as a single HTML file. Inputs:
number of monthly transactions and number of bank accounts. Output: our
monthly fee using the rules in pricing-rules.md. Open it in the in-app
browser and test three examples. Show me the results and the changes.
```

## Reviewing what Codex did

Every task ends with changes you can inspect. Get in the habit of:

- **Reading the summary first.** Does it match the brief, and only the brief?
- **Opening the changes panel.** Added lines in green, removed in red. Ask about anything you didn't expect.
- **Checking it yourself.** Use the in-app browser for anything visual. You can comment directly on parts of a page ("make this button larger") and Codex picks up the comment.
- **Committing good work.** If the folder is a Git repository, ask Codex to commit with a clear message, or open a pull request (see the GitHub for Non-Developers course).

## Local, worktree or cloud

Codex can work in three places, and choosing well keeps your files safe:

| Where | What it means | Use it for |
|---|---|---|
| Local | Edits your project folder directly | Small, quick changes you're watching |
| Worktree | A separate copy of a Git project, so your main folder stays untouched | Trying something risky, or running two tasks at once |
| Cloud | A workspace on OpenAI's servers, connected to a GitHub repo | Longer jobs that should keep going after you close the laptop (Lesson 2) |

Local and worktree tasks run with the permissions you set in Codex's settings. Leave the defaults that ask before Codex runs commands outside its sandbox or uses the network, at least until you've seen how it works.

:::warning
Point Codex at a project folder that contains only what the job needs, not your whole Documents folder. Never paste passwords, API keys or client data into the chat or into `AGENTS.md`. Keep approval prompts on, and say no to anything you don't understand. Codex can be wrong with confidence; you are the reviewer.
:::

:::try-it
Open Codex, add any small folder of documents as a project, and ask: "List what's in this folder and suggest one small tool that would save me time with these files. Don't change anything." Notice what it reads and what it asks before acting.
:::

:::checkpoint
Q: You want Codex to try a risky redesign of your site while keeping your current version safe. Which mode fits best?
- [ ] Local, so you can see the changes appear in your folder right away
- [x] Worktree, so it works on a separate copy and your main folder stays untouched
- [ ] Any mode, since you can always undo
Why: A worktree isolates the experiment. If it goes badly, you discard the copy and your main folder never changed.
:::

:::takeaways
- Since July 2026, Codex lives in the ChatGPT desktop app alongside ChatGPT Work.
- A project is a folder Codex may work in; `AGENTS.md` is its standing brief.
- Review every task: summary, changes, test in the in-app browser, then commit.
- Usage is billed in credits shared with ChatGPT Work; watch the Usage panel.
:::

## Go deeper

- [Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/) - the April 2026 update: computer use, browser, images, memory, plugins
- [OpenAI Debuts ChatGPT Work](https://www.macrumors.com/2026/07/09/openai-chatgpt-work/) - the July 2026 merger of Codex into the ChatGPT desktop app
- [OpenAI is folding Codex into the ChatGPT app](https://thenewstack.io/openai-codex-work-atlas/) - how the Work and Codex sides differ
- [Codex pricing and credits](https://help.openai.com/articles/20001106) - token-based pricing and the shared credit pool
- [ChatGPT and Codex changelog](https://learn.chatgpt.com/docs/changelog) - the latest Codex app changes
