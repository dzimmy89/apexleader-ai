---
module: 1
lesson_number: 1
course: cursor
template: v2
---

# Exercise 1: Set Up Cursor and Plan Your Site

:::key-concept
You'll install Cursor, set a safe run mode, and use Plan Mode to turn your business into a one-page site plan and a `SPEC.md` file. At the end you'll have a project folder with a spec that every later exercise builds from.
:::

**Time:** 25 minutes · **You'll need:** A computer (macOS, Windows or Linux), a Cursor account on any tier, your business description (or the sample business) · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: A friend suggests switching Cursor to Run Everything "so it stops asking." Your laptop has client files and your bank logins saved. What do you do?
- [ ] Switch, since Cursor's classifier will catch anything risky
- [x] Keep Auto-review or a strict Allowlist; Run Everything runs every tool call with no checks
- [ ] Switch only while the agent is working on the website
Why: Run Everything removes the sandbox and classifier entirely, and even Auto-review is "not a security boundary" per Cursor's docs, so stricter is better on a computer with sensitive data.
:::

## Steps

1. **Install and sign in.** Download Cursor from cursor.com/downloads, install it and sign in. Note which tier you're on in your account settings, and look at cursor.com/pricing so you know what it includes.

2. **Set your run mode.** Open Settings, then Agents, then Approvals & Execution. Choose **Auto-review** (default) or **Allowlist** with an empty list if you want to approve every command. Don't choose Run Everything.

3. **Make the project folder.** Create a folder called `<yourbusiness>-site`. If you did the GitHub course, clone your site repo instead. Open it in Cursor. If you don't have a business settled, use **Groomer Books**, a monthly bookkeeping service for independent dog groomers.

4. **Open the Agents Window.** Press Cmd+Shift+P (Ctrl+Shift+P), type "Agents Window" and open it. Find the agent sidebar, then switch back to the Editor. Notice where the file tree is.

5. **Plan, don't build.** Start an agent, press Shift+Tab to turn on Plan Mode, and paste:

```text
I'm a non-technical founder. This folder will hold a one-page website for
Groomer Books, a monthly bookkeeping service for independent dog groomers in
the US. The goal of the page is to get groomers to book a 15-minute call.
Ask me up to five questions first. Then propose a plan: page sections in
order, what each section says, files you'll create (plain HTML and CSS only),
and the content you need from me. Don't write any code yet.
```

6. **Answer its questions** in plain language. Push back on anything that feels like more than a one-page site.

7. **Turn the plan into a spec file.** When you're happy with the plan, send:

```text
Save the agreed plan as SPEC.md in this folder. Include: business summary,
audience, page goal, sections in order with one line each, design notes,
and an "Out of scope" list (no checkout, no logins, no tracking).
Only create SPEC.md. Don't create any other files.
```

8. **Review the change.** Open the diff, read `SPEC.md`, and edit anything that's wrong by hand or by asking. Find the checkpoint in the chat timeline so you know where you could roll back to.

## Done when

- [ ] Cursor is installed, signed in, and your tier is noted
- [ ] Run mode is Auto-review or Allowlist, not Run Everything
- [ ] Your project folder contains a `SPEC.md` you've read and agree with
- [ ] `SPEC.md` has an "Out of scope" list
- [ ] You can open the Agents Window and the Editor and explain what each is for

:::coached
**For 1-on-1 coaching clients.** Plan the real thing, not a practice page.

1. Use Plan Mode to draft a spec for the most valuable small piece of software your business needs next (landing page, intake form, quote calculator), including who uses it and how you'll know it works.
2. Ask the agent to list every account, key or customer data the build would touch, and mark which ones it must never see.
3. Price it out: check your Cursor tier against cursor.com/pricing and decide whether you need Premium for cloud agents and Bugbot.

**Bring to your session:** your SPEC.md, the access list, and your tier decision.

**Your coach will:**
- Tighten the spec's scope and "done when" so agents can build it
- Check the access list for anything touching money or customer data
- Sanity-check the tier choice against how much you'll actually build
:::
