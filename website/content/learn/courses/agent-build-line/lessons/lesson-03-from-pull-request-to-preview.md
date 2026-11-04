---
module: 1
lesson_number: 3
course: agent-build-line
template: v2
---

# Lesson 3: From Pull Request to Preview

:::video
id: bl-l3-overview
kind: overview
status: paused
src: /learn/video/agent-build-line/bl-l3-overview.mp4
captions: /learn/video/agent-build-line/bl-l3-overview.vtt
poster: /learn/video/agent-build-line/bl-l3-overview.jpg
transcript: Reading code isn't how a founder should review an agent's work. Clicking through it is. In this lesson you'll wire up the line that makes that possible. The agent opens a pull request on GitHub through the GitHub MCP server. Vercel builds a private preview of that exact change and posts the link on the pull request. You open the link on your phone, click through the new checkout, and merge only if it works. The agent can do everything up to the merge button, and nothing past it.
:::

:::key-concept
A **preview deployment** is a private, working copy of your site built from one pull request, at its own web address. Vercel makes one automatically for every pull request. The **GitHub MCP server** lets an agent create branches, open pull requests, read review comments and check whether tests passed. Put them together and you get a build line: the agent ships a change as a pull request, Vercel turns it into a link, and you review the link, not the code. **The agent can open a pull request; only you merge it.**
:::

## What you'll be able to do

- Move a site with server code to Vercel and get a preview per pull request
- Keep sandbox keys on previews and live keys on production
- Connect the GitHub MCP server with a token limited to one repository
- Block the agent from merging, so the last click is always yours
- Use the Vercel MCP server to read a failed build's logs

## Why this matters

In Build the Product and the Site you put a plain HTML site on GitHub Pages and reviewed pull requests by reading the change. That worked for pages. The portal from Lessons 1 and 2 has sign-in, a database and a Stripe webhook, which is server code, and the only real test of a checkout is to click it. Vercel runs server code and builds a preview of every pull request, which is why the Build the Product course said it suits a site that grows.

## Previews on Vercel

Sign in to Vercel with GitHub, choose **Add New Project**, and import your repository. Grant Vercel access to **only this repository**, as you did with your first host. From now on:

- Every push to `main` deploys to your live domain (Vercel calls it **Production**).
- Every pull request gets its own **Preview** address, and Vercel's bot posts the link as a comment on the pull request.

### Keys per environment

This is the part to get right. In the project's environment variables, set each value separately for Preview and Production:

| Variable | Preview | Production |
|---|---|---|
| Supabase URL and key | `rolling-ledger-dev` | `rolling-ledger` (live) |
| Stripe secret key | Sandbox key | Live key |
| Stripe webhook secret | Sandbox webhook | Live webhook |

Now a preview can never charge a real card or read a real customer, however broken the change is. You set these values yourself in the Vercel dashboard.

:::infographic
id: fig-1
type: flow
title: The build line
shows: A left-to-right flow of five cards. Agent writes the change on a branch, GitHub MCP opens the pull request, Vercel builds a preview with sandbox keys, you click through the preview on your phone, you merge and it goes live. The "you merge" card is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-03-fig-1.webp
alt: The agent writes a change on a branch, opens a pull request through the GitHub MCP server, Vercel builds a preview with sandbox keys, you click through it on your phone, and you merge it to go live.
:::

## Connect the GitHub MCP server

GitHub runs a hosted MCP server at `https://api.githubcopilot.com/mcp/`. You connect it with a **fine-grained personal access token**, which you can limit to one repository.

1. On GitHub, go to Settings, Developer settings, Fine-grained tokens, and generate a new token.
2. Repository access: **Only select repositories**, and pick `rolling-ledger-site`.
3. Permissions: Contents, Pull requests and Issues set to **Read and write**; Actions and Commit statuses set to **Read**. Nothing else.
4. Set an expiry, 90 days is fine, and save the token in your password manager.

Then, in a terminal (not inside Claude Code), with the token in an environment variable:

```bash
claude mcp add-json github '{"type":"http","url":"https://api.githubcopilot.com/mcp/","headers":{"Authorization":"Bearer '"$GITHUB_PAT"'"}}'
```

Add `readonly` to the end of the address (`.../mcp/readonly`) for an agent that should only read, like one that summarizes open pull requests each morning.

### Take away the merge button

A token that can write pull requests can usually merge them too. So block merging in Claude Code itself. In your project's `.claude/settings.json`:

```json
{
  "permissions": {
    "deny": ["mcp__github__merge_pull_request"]
  }
}
```

Commit the file. Now the agent can open, update and comment on pull requests, and it's refused if it tries to merge. Add the same rule as a line in your `mistakes` house skill from the Agent Skills course, so other agents know it too. And on GitHub, turn on a branch rule for `main` that requires a pull request before merging, so nobody, agent or human, pushes straight to live.

:::video
id: bl-l3-pr-to-preview
kind: inline
status: paused
src: /learn/video/agent-build-line/bl-l3-pr-to-preview.mp4
captions: /learn/video/agent-build-line/bl-l3-pr-to-preview.vtt
poster: /learn/video/agent-build-line/bl-l3-pr-to-preview.jpg
transcript: Here's one change going down the line. We ask Claude Code to add a "next payment date" line to the Rolling Ledger portal and open a pull request. It creates the branch, pushes and opens the pull request through the GitHub MCP server. A minute later Vercel's bot comments a preview link. We open it on a phone, sign in as a test owner and see the new line. Then we ask the agent to merge, and it's refused. We merge it ourselves.
:::

## When a preview fails to build

Sometimes Vercel can't build the preview. You can paste the error into the chat, or let the agent read it. Vercel's MCP server is at `https://mcp.vercel.com`:

```bash
claude mcp add --transport http vercel https://mcp.vercel.com
```

Sign in through `/mcp`. Then: "The preview for my latest pull request failed. Read the build logs and fix it on the same branch." Two cautions: the Vercel connection has the same access as your Vercel account, including changing environment variables and domains, so keep approval on and deny the tools you'd never want it to use, the same way you denied merging. Changing environment variables is your job.

:::infographic
id: fig-2
type: comparison
title: What the agent can and can't do
shows: Two columns. Left, "agent can": create a branch, open and update a pull request, read review comments and test results, read Vercel build logs. Right, "only you": merge to main, set live keys, change domains. The right column is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-03-fig-2.webp
alt: The agent can create branches, open and update pull requests, read review comments and test results, and read build logs. Only you merge to main, set live keys and change domains.
:::

:::warning
A preview link is hard to guess but it's still on the internet. Vercel can protect previews so only people signed in to your Vercel team see them; turn that on in the project's deployment protection settings. And never put live keys in the Preview environment "just to test one thing." That's how a preview charges a real card.
:::

:::try-it
Open your last three pull requests on GitHub. For each one, ask: could I have reviewed this by clicking a link instead of reading the change? If the answer is yes for two of them, the build line will save you time every week.
:::

:::checkpoint
Q: Your agent opened a pull request that changes the checkout. How do you review it?
- [ ] Read every line of the change
- [x] Open the preview link Vercel posted, and test the checkout with a sandbox card
- [ ] Merge it and check the live site
Why: The preview is a working copy of that exact change, with sandbox keys, so you can test the real thing without risking live payments.
:::

:::checkpoint
Q: Your GitHub token can write pull requests. How do you stop the agent from merging them?
- [ ] Ask it nicely in the prompt
- [ ] Give it no token at all
- [x] Deny the merge tool in `.claude/settings.json`, and require pull requests for `main` on GitHub
Why: A prompt is a request; a deny rule is a lock. The branch rule makes sure every change to live goes through a pull request.
:::

:::takeaways
- Vercel builds a private preview of every pull request and posts the link on it.
- Previews use dev and sandbox keys; production uses live keys, set by you.
- The GitHub MCP server, with a one-repository token, lets the agent open and update pull requests.
- Deny the merge tool and protect `main`: the agent ships to a preview, you ship to live.
:::

## Go deeper

- [GitHub MCP server](https://github.com/github/github-mcp-server) - setup for each agent, toolsets and read-only mode
- [Vercel preview deployments](https://vercel.com/docs/deployments/environments) - Preview and Production environments
- [Vercel MCP](https://vercel.com/docs/mcp/vercel-mcp) - connecting an agent to your Vercel projects
- [Claude Code permissions](https://code.claude.com/docs/en/settings#permission-settings) - allow and deny rules for tools
