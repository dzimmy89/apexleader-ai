---
module: 1
lesson_number: 4
course: build-product-and-site
template: v2
---

# Lesson 4: Your GitHub Workflow

:::key-concept
GitHub is where your site's code lives, with every version saved. Your agents do the typing: they make a branch, commit the change and open a pull request. You do the approving: you look at the preview and the change list, then click merge. Nothing reaches the live site without your click.
:::

## What you'll be able to do

- Put your site in a GitHub repository with a clean history
- Explain branch, commit, pull request and merge in one sentence each
- Run a simple loop where agents propose changes and you approve them
- Keep secrets, private files and accidental deletions out of your repo

## Why this matters

Without version control, your site lives in one folder on one laptop, and every agent session is a gamble. With GitHub, every change is saved, labeled and reversible. It also gives you an approval gate: a pull request is a change waiting for your yes. That fits the rule that runs through this whole program: agents prepare, you approve anything that goes out into the world. Your website is out in the world.

## Four words in plain English

| Word | Plain English | Groomer Books example |
|---|---|---|
| Repository (repo) | The project folder, stored on GitHub with its full history | `groomer-books-site` |
| Commit | A saved snapshot with a note about what changed | "Add FAQ section from content/faq.md" |
| Branch | A safe copy to work on without touching the live version | `faq-section` |
| Pull request (PR) | A request to merge a branch into the main version, with a list of changes for review | "Add FAQ section" waiting for your approval |

The main branch (usually called `main`) is your live site. Lesson 5 connects it to your host so that whatever is on `main` gets published.

## Set it up once

You need a GitHub account. A free account is enough for this course. Turn on two-factor authentication in your account settings before you do anything else: this account will control your public website.

Then pick how you'll talk to GitHub. Any of these work:

- **Let the agent do it.** Claude Code, Cursor and Codex can all run git commands. Claude Code's docs recommend installing GitHub's `gh` command-line tool so Claude can create repos and pull requests for you. You log in to `gh` yourself, in your browser.
- **GitHub Desktop.** A free app with buttons for commit, push, branch and pull request. Good if you like to see what's happening.
- **The GitHub website.** You can review and merge pull requests entirely in the browser, which is all you need day to day.

A first-time setup prompt for your coding agent:

```text
Turn this folder into a git repository and publish it to GitHub as a new
repository called groomer-books-site under my account.
Before the first commit:
- Create a .gitignore that excludes .env files, any file with "secret" or "key"
  in the name, .DS_Store, node_modules and the /mockups folder.
- Check every file for passwords, API keys or tokens and tell me if you find any.
- Show me the list of files that will be committed and wait for my OK.
Use the gh tool. If I need to log in, tell me and wait.
```

Approve the file list, let it push, then open the repo on github.com and look around. You should see `index.html`, `styles.css`, `SPEC.md`, `AGENTS.md` or `CLAUDE.md`, `/content` and `/images`.

**Public or private?** A landing page has nothing secret in it, and the simplest free hosting (GitHub Pages) publishes from public repos on the free plan. Paid GitHub plans can publish Pages from private repos. Whatever you choose, assume anything in the repo could one day be public, so keep client data, contracts and finances out of it entirely.

## The everyday loop

Every change, from a typo fix to a new section, follows the same six steps.

1. **Ask on a branch.** Tell the agent what you want and to use a new branch.
2. **Agent commits.** It makes the change, checks it and commits with a clear message.
3. **Agent opens a pull request** with a summary, a screenshot and a checklist.
4. **You review.** Read the summary, look at the "Files changed" tab, check the preview.
5. **You merge,** or ask for changes in a comment.
6. **The host publishes `main`** (set up in Lesson 5).

The prompt you'll reuse:

```text
On a new branch, make this change: [what you want].
Follow SPEC.md and AGENTS.md. Check it at 375px and 1280px.
Commit with a clear message, push, and open a pull request that includes:
- a two-line summary of what changed and why
- before and after screenshots
- the list of files changed
- anything you were unsure about
Don't merge. I'll review and merge.
```

"Don't merge" is the line that keeps you in charge. Put the same rule in your AGENTS.md or CLAUDE.md so every agent follows it by default:

```text
- Never commit directly to main. Always work on a branch and open a pull request.
- Never merge a pull request. The founder merges.
```

## How to review a pull request without reading code

Open the pull request on github.com. In about two minutes:

- **Read the summary.** Does it match what you asked for, and only that?
- **Scan "Files changed."** Expect `index.html` and `styles.css`. Be suspicious of new files you didn't ask for, new `<script>` tags, or changes to `.gitignore`.
- **Look at the screenshots** or the host's preview link (Lesson 5 shows how Netlify, Vercel and Cloudflare Pages create one for every pull request).
- **Check the red lines.** Removed lines show in red. A big red block you didn't expect means the agent deleted something.

If it's right, click **Merge pull request**. If not, leave a comment like you would for a contractor and ask the agent to address it on the same branch.

## Undo is a feature

The point of all this is that mistakes are cheap.

- Bad merge? Ask: "Revert the last merged pull request on main and open a PR for the revert." GitHub also has a **Revert** button on merged pull requests.
- Want to see what the site looked like last Tuesday? Every commit is a snapshot.
- Agent session went sideways before committing? Throw away the branch. `main` never changed.

:::warning
Never put passwords, API keys, tokens or customer data in a repository, even a private one. If one slips in, removing the file is not enough, because it stays in the history: revoke or rotate the key at the service that issued it, then clean up. Give agents their own scoped access (for example a `gh` login limited to this repo where possible), never your main password, and keep "the founder merges" as a hard rule.
:::

:::try-it
Open any public repository on github.com, click the **Pull requests** tab, open a closed one and click **Files changed**. Find the green (added) and red (removed) lines. That's the whole skill you need to review your agent's work.
:::

:::checkpoint
Q: Your agent opens a pull request to fix a typo, and "Files changed" shows edits to index.html, styles.css and a new file called analytics.js. What do you do?
- [ ] Merge it, since the typo is fixed
- [x] Ask the agent in a PR comment why analytics.js was added and to remove anything outside the typo fix
- [ ] Close GitHub and edit the live site by hand instead
Why: A pull request should do one thing. An unrequested script is exactly what review is for, and your spec says no tracking without asking.
:::

:::takeaways
- Repo, commit, branch, pull request: agents type, you approve.
- Never commit to main and never let an agent merge; put both rules in your rules file.
- Review a PR in two minutes: summary, files changed, screenshots, red lines.
- Turn on two-factor authentication and keep secrets and client data out of every repo.
:::

## Go deeper

- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) - using the gh tool, committing and opening pull requests from a session
- [Claude Code quickstart](https://code.claude.com/docs/en/quickstart) - the git prompts Claude Code understands, such as committing and creating branches
- [Claude Code desktop app](https://code.claude.com/docs/en/desktop) - diff view and reviewing changes before you create a pull request
