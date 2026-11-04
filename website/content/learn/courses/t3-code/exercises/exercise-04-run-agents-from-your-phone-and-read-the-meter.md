---
module: 1
lesson_number: 4
course: t3-code
template: v2
---

# Exercise 4: Friday Usage Report

:::key-concept
You'll pair your phone with T3 Code over a private connection, start and approve one small job from it, then build your first weekly usage report with a keep, upgrade or drop decision for every AI plan you pay for. At the end you'll have a remote that keeps agents moving and a report you can repeat every Friday.
:::

**Time:** 35 minutes · **You'll need:** T3 Code from the earlier exercises, a phone with the T3 Code app (or a second computer with a browser), about a week of agent work in T3 Code, your plan prices · **Builds on:** Lesson 4

:::video
id: t3-ex4-setup
kind: exercise-setup
status: paused
src: /learn/video/t3-code/t3-ex4-setup.mp4
captions: /learn/video/t3-code/t3-ex4-setup.vtt
poster: /learn/video/t3-code/t3-ex4-setup.jpg
transcript: In this exercise you'll make your phone a remote and read the meter. Pair your phone over your home network or Tailscale, then queue one small Groomer Books job from it and approve the diff on the phone. Then open the Usage page, set the range to seven days, and fill in the Friday report: one row per plan, with price, tokens, limit hits, API-equivalent value and a decision.
:::

## Warm-up

:::checkpoint
Q: A friend asks for your T3 Code pairing link so they can see how it works. What do you do?
- [ ] Send it, since it only shows the screen
- [x] Don't share it. Anyone with the link can run commands in your projects
- [ ] Send it, then change your Claude password
Why: The pairing link is a credential for your host computer. Treat it like a password and show your friend on your own device instead.
:::

## Steps

1. **Install the app.** Install T3 Code on your phone from the App Store or Google Play, or use a browser on a second computer.

2. **Pair privately.** On your host computer, with both devices on the same network, run `npx t3@latest pair`, or use **Settings → Connections**. If you use Tailscale, run `npx t3@latest pair --tailscale`. Scan the QR code or open the link. Don't send the link to yourself through a chat app.

3. **Check the connection.** In **Settings → Connections** on the host, confirm your phone is listed. Take a screenshot.

4. **Start a job from the phone.** In a new worktree thread with Supervised mode on, send a small job. For Groomer Books: "Add the line 'Monthly bookkeeping for independent dog groomers' under the footer logo. Only edit index.html."

5. **Approve from the phone.** When the diff is ready, read it on the phone. Approve it, or comment and send back, then open the pull request from the phone.

6. **Open the Usage page.** On the host or the phone, set the range to the last 7 days and group by provider. Then switch between tokens and cost.

7. **Fill the report.** Create `notes/usage-report-<date>.md` with one row per plan you pay for:

```text
| Plan | Price (date checked) | Tokens this week | Limit hits | API-equivalent | Decision |
|------|----------------------|------------------|------------|----------------|----------|
```

Count limit hits from your memory and each provider's own usage screen. Use T3 Code's numbers for tokens and API-equivalent value, and note that they only cover work run through T3 Code.

8. **Decide.** Apply the three rules from Lesson 4 (upgrade after more than two limit hits, drop under a third used two weeks running, otherwise keep) and write one decision per plan, with one sentence of why.

9. **Set a reminder.** Add a weekly Friday reminder in your calendar, or ask your chief of staff agent from Always-On Agents to remind you.

## Done when

- [ ] A screenshot shows your phone in Settings → Connections
- [ ] A pull request was approved or opened from the phone
- [ ] `notes/usage-report-<date>.md` has one row for every plan you pay for
- [ ] Every row has a decision and one sentence of why
- [ ] A weekly Friday reminder exists

:::example
title: See an example result

For a week of Groomer Books work, the founder paired their iPhone over Tailscale, approved the footer change from the phone, and filled the report. Claude Pro hit its limit twice and showed about four times its price in API-equivalent value, so keep. ChatGPT Plus hit its limit three times, and the founder waited half a day for a reset, so upgrade to Pro at $100 next month if it happens again. Cursor Plus at $8 had almost no jobs on the routing card, so drop it. These are example numbers, and your report will differ.

:::video
id: t3-ex4-reveal
kind: exercise-reveal
status: paused
src: /learn/video/t3-code/t3-ex4-reveal.mp4
captions: /learn/video/t3-code/t3-ex4-reveal.vtt
poster: /learn/video/t3-code/t3-ex4-reveal.jpg
transcript: Here's an example report for Groomer Books. The phone is paired over Tailscale and listed under Connections, and the footer change was approved from the phone. In the report, Claude Pro hit its limit twice and gave about four times its price in value, so keep. ChatGPT Plus hit its limit three times, so upgrade next month if it happens again. Cursor Plus had almost no jobs, so drop it. Ten minutes, one decision per plan.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Run two weeks of reports.

1. Fill the report two Fridays in a row on your real business.
2. Add each provider's own usage screen as a screenshot beside T3 Code's numbers.
3. Write the plan change you'd make, with the new monthly total.

**Bring to your session:** both reports, the screenshots, and your proposed plan change.

**Your coach will:**
- Check the report against your budget tier from The One-Person Company Lesson 2
- Review your remote-access setup for safety
- Agree the plan change with you, or a third week of data first
:::
