---
module: 1
lesson_number: 3
course: agent-build-line
template: v2
---

# Exercise 3: Build the Line, Then Ship One Change Down It

:::key-concept
You'll put your site on Vercel with separate keys for previews and production, connect the GitHub MCP server with a one-repository token, and deny the agent the merge button. Then you'll send one small change down the line: the agent opens the pull request, Vercel builds the preview, and you review it on your phone and merge it yourself.
:::

**Time:** 60 minutes · **You'll need:** A free Vercel account, your GitHub repo, Claude Code, your dev Supabase project and Stripe sandbox · **Builds on:** Lesson 3

:::video
id: bl-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-build-line/bl-ex3-setup.mp4
captions: /learn/video/agent-build-line/bl-ex3-setup.vtt
poster: /learn/video/agent-build-line/bl-ex3-setup.jpg
transcript: In this exercise you'll build the line and use it once. Import your repo to Vercel, set dev and sandbox keys for previews, connect the GitHub MCP server with a token for one repo, and deny the merge tool. Then ask the agent for one small change. When the preview link appears, test it on your phone, ask the agent to merge, watch it get refused, and merge it yourself.
:::

## Warm-up

:::checkpoint
Q: Which Stripe key goes in Vercel's Preview environment?
- [ ] The live secret key
- [x] The sandbox key
- [ ] No key; previews don't need one
Why: Previews run unreviewed changes, so they get sandbox keys that can't charge a real card.
:::

## Steps

1. **Import to Vercel.** Sign in with GitHub, add a new project, and give Vercel access to only this repository.

2. **Set environment variables.** For **Preview**: your dev Supabase values and Stripe sandbox keys. For **Production**: leave live keys empty for now if you're not live yet. Note what's where in `notes/build-line.md`.

3. **Protect previews.** Turn on deployment protection for previews in the project's settings.

4. **Make a fine-grained token.** One repository; Contents, Pull requests and Issues read and write; Actions and Commit statuses read. 90-day expiry. Save it in your password manager.

5. **Connect GitHub MCP.** Put the token in `GITHUB_PAT` in your terminal and run the `claude mcp add-json github ...` command from Lesson 3.

6. **Deny merging.** Add `mcp__github__merge_pull_request` to `permissions.deny` in `.claude/settings.json` and commit it.

7. **Protect main.** On GitHub, add a branch rule for `main` that requires a pull request before merging.

8. **Ship one change.** Ask: "Add the date of the next payment to the portal home page. Open a pull request when it's done."

9. **Review the preview.** When Vercel posts the link, open it on your phone, sign in as a test owner, and check the change.

10. **Try to let the agent merge.** Ask it to merge. Note the refusal. Then merge it yourself on GitHub.

## Done when

- [ ] Vercel builds a preview for every pull request, with dev and sandbox keys
- [ ] The GitHub MCP token covers one repository only
- [ ] `.claude/settings.json` denies the merge tool, and `main` requires pull requests
- [ ] One change went from agent to preview to your merge, and `notes/build-line.md` records it

:::example
title: See an example result

For Rolling Ledger, Vercel posted a preview link two minutes after the agent opened the pull request. On the phone, test owner A's home page showed "Next payment: December 4." When asked to merge, Claude Code replied that the merge tool was blocked by the project's settings. The founder merged on GitHub, and production deployed a minute later. Total time from request to live: eleven minutes, with no code read line by line.

:::video
id: bl-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-build-line/bl-ex3-reveal.mp4
captions: /learn/video/agent-build-line/bl-ex3-reveal.vtt
poster: /learn/video/agent-build-line/bl-ex3-reveal.jpg
transcript: Here's the Rolling Ledger line working. The agent opens the pull request, the preview link arrives, and the new line shows on the phone. The agent's merge attempt is refused by the deny rule. The founder merges it, and it's live a minute later. Eleven minutes from request to live, and every key in the preview was a sandbox key.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Fit the line to your stack.

1. List every secret your product uses and which environment each belongs in.
2. Decide which agents get GitHub write access, and which get read-only.
3. List any other tools you'd deny, like changing environment variables.

**Bring to your session:** `notes/build-line.md` and your settings file.

**Your coach will:**
- Check your Preview and Production keys are split correctly
- Review your token permissions and deny rules
- Help you plan the move of your live site to the new host
:::
