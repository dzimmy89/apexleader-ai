---
module: 1
lesson_number: 4
course: t3-code
template: v2
---

# Lesson 4: Run Agents From Your Phone and Read the Meter

:::video
id: t3-l4-overview
kind: overview
status: paused
src: /learn/video/t3-code/t3-l4-overview.mp4
captions: /learn/video/t3-code/t3-l4-overview.vtt
poster: /learn/video/t3-code/t3-l4-overview.jpg
transcript: Two last pieces make the desk pay off. First, your phone becomes a remote. Your computer keeps doing the work while you start jobs and approve changes from anywhere, so agents don't sit waiting for you. Second, the Usage page shows what every plan did this week in one place. In this lesson you'll pair your phone safely and build a Friday usage report that tells you which plan to keep, upgrade or drop.
:::

:::key-concept
With T3 Code, your computer does the work and your phone is only a remote. You can start a job on the Groomer Books site from a café and approve the diff from the queue at the bank, while the agents run at home. The Usage page then shows, across all your plans, how much each one did. A short weekly review turns those numbers into a decision: keep, upgrade or drop each plan.
:::

## What you'll be able to do

- Connect your phone or another computer to T3 Code safely
- Start and approve agent work away from your desk, with approval kept on
- Read T3 Code's Usage page, including what "API-equivalent" means
- Write a weekly usage report that decides each plan's future

## Why this matters

Agents stall when they wait on you. A job that needs one approval at 2pm can sit until you're back at your desk at 6pm. Running T3 Code from your phone removes that wait. And without one view of your usage, it's hard to know if your $100 plan is earning its keep or if a $20 plan would do. Most solo founders guess. The weekly report replaces the guess with your own numbers.

## Your phone is a remote

T3 Code runs on one computer, the **host**. That's the computer where your agents are installed and signed in. Every other device, a phone, a tablet or a browser, is a client that controls it. The host must stay on and awake, and it does all the work.

You can connect a client in three ways, as of version 0.1.6:

| Way | How | Best for |
|---|---|---|
| Your home network | Pair while both devices are on the same Wi-Fi | Working around the house |
| Tailscale | A private network between your own devices. Pair with `npx t3@latest pair --tailscale` | Working away from home, kept private |
| T3 Connect | Ping Labs' managed connection through a Cloudflare tunnel. Run `npx t3 connect` on the host | The quickest setup. Free for now, for up to 3 host computers per account |

To pair, the host creates a link and a QR code (`npx t3@latest pair`, or from **Settings → Connections**). You open the link or scan the code with the T3 Code app on iOS or Android, or open it in a browser.

:::infographic
id: fig-1
type: diagram
title: Your phone is the remote
shows: On the left, the host computer at home with Claude Code, Codex and Cursor running and the Groomer Books project. On the right, a phone and a laptop browser as clients. Between them, a private connection labelled Tailscale or home Wi-Fi, with T3 Connect shown as an optional route. A paper tag on the pairing link says "Treat like a password".
data: none
image: /learn/figures/t3-code/lesson-04-fig-1.webp
alt: The host computer at home runs the agents and the project. A phone and a browser connect to it over Tailscale or home Wi-Fi, with T3 Connect as an option. The pairing link should be treated like a password.
:::

### Keep it safe

- **Treat the pairing link like a password.** Anyone who has it can run commands in your projects. Don't post it, screenshot it into a chat or email it.
- **Prefer a private network.** Use your home network or Tailscale first. T3 Connect is fine, but it adds a managed service in the middle.
- **Keep Supervised mode on.** Approval on your phone is still approval. Read the diff before you tap.
- **Check who's connected.** **Settings → Connections** lists authorized clients. Remove any you don't recognise, and any old phone.

:::video
id: t3-l4-pairing
kind: inline
status: paused
src: /learn/video/t3-code/t3-l4-pairing.mp4
captions: /learn/video/t3-code/t3-l4-pairing.vtt
poster: /learn/video/t3-code/t3-l4-pairing.jpg
transcript: Here's pairing over Tailscale. On the host Mac, we run npx t3 pair with the tailscale option, and a QR code appears. We scan it with the T3 Code app on the phone. Now the phone shows the same Groomer Books threads. We queue a job, and when the diff is ready we read it and approve it from the phone. The Mac at home did all the work. Last, we check Settings, then Connections, to see the phone listed.
:::

## Reading the meter

T3 Code's **Usage** page, as of version 0.1.6, combines usage for Codex, Claude and Grok from the threads on your host. You can:

- Switch between **tokens** and **cost**
- Choose a time range, such as the last 7 days
- Group by **provider**, **model** or **day**
- See how much prompt caching saved

Two cautions:

- **"Cost" means API-equivalent.** It's what the same work would have cost at API prices. It's not your bill. On a subscription you pay the plan price, whatever this number says. It's still useful: if a $20 plan shows $180 of API-equivalent work in a week, it's good value.
- **It only counts what ran through T3 Code on this host.** Work you did in the Claude app, Cursor's own window or the ChatGPT app isn't included. For plan limits, check each provider's own usage screen too. A Limits tab that shows each plan's quota windows is being built in T3 Code but wasn't released as of November 4, 2026.

:::video
id: t3-l4-usage-page
kind: inline
status: paused
src: /learn/video/t3-code/t3-l4-usage-page.mp4
captions: /learn/video/t3-code/t3-l4-usage-page.vtt
poster: /learn/video/t3-code/t3-l4-usage-page.jpg
transcript: This is the Usage page after a week on the Groomer Books site. We set the range to seven days and group by provider. Claude and Codex both show tokens, and switching to cost shows the API-equivalent value. Remember, that's not your bill. It's what the same work would cost on the API. Grouping by day shows Thursday was the heavy day, which matches the pricing feature we routed in Lesson 2.
:::

## The Friday usage report

Once a week, spend ten minutes on a short report, one row per plan you pay for:

| Plan | Price | Tokens this week | Limit hits | API-equivalent value | Decision |
|---|---|---|---|---|---|

Then decide each row with three rules of thumb:

- **Upgrade** if you hit that plan's limit more than twice in the week and waiting cost you real work.
- **Downgrade or drop** if you used well under a third of what the plan allows for two weeks in a row, or your routing card no longer sends it any jobs.
- **Keep** everything else, and look again next Friday.

Feed the report into the weekly review you'll run in the Capstone, Run the Company for a Week.

:::infographic
id: fig-2
type: anatomy
title: The Friday usage report
shows: A report card with three example rows for Claude Pro, ChatGPT Plus and Cursor Plus, columns for price, tokens, limit hits, API-equivalent value and a decision pill (Keep, Upgrade, Drop) with the word written in each pill. Below, three rules: upgrade if limits hit more than twice, drop if under a third used two weeks running, otherwise keep. Marked "example".
data: Example only. Claude Pro $20, 2 limit hits, Keep. ChatGPT Plus $20, 3 limit hits, Upgrade. Cursor Plus $8, 0 limit hits and few jobs, Drop.
image: /learn/figures/t3-code/lesson-04-fig-2.webp
alt: An example Friday report. Claude Pro at $20 hit its limit twice, so keep. ChatGPT Plus at $20 hit it three times, so upgrade. Cursor Plus at $8 had almost no jobs, so drop. The rules: upgrade after more than two limit hits, drop under a third used two weeks running, otherwise keep.
:::

:::warning
A phone that's paired to T3 Code can run commands on your computer. Lock your phone, remove old devices from Settings → Connections, and never share the pairing link. Before you upgrade any plan because of the report, check the provider's own usage screen and pricing page. T3 Code's numbers only cover work it ran.
:::

:::try-it
Open T3 Code's Usage page, set the range to 7 days and group by provider. Which plan did the most work this week? Now switch to cost. Is any plan showing less API-equivalent value than its price?
:::

:::checkpoint
Q: Your Usage page shows $180 of API-equivalent cost this week on your $20 Claude plan. What does that mean?
- [ ] You owe Anthropic $180
- [x] The work would have cost about $180 at API prices, and you paid the $20 plan price
- [ ] T3 Code will charge you the difference
Why: On a subscription you pay the plan price. API-equivalent cost shows what the same work would cost on the API, which tells you how much value the plan gave you.
:::

:::checkpoint
Q: Who does the actual work when you start a job from your phone?
- [ ] The phone
- [x] The host computer where your agents are installed and signed in
- [ ] Ping Labs' servers
Why: The phone is only a remote. The host must stay on, and it runs the agents, edits the files and sends the work to each provider.
:::

:::takeaways
- Your computer is the host and does the work. A phone or browser is only a remote.
- Pair over your home network or Tailscale first. Treat the pairing link like a password.
- The Usage page shows tokens and API-equivalent value, which is not your bill.
- A ten-minute Friday report decides keep, upgrade or drop for every plan.
:::

## Go deeper

- [T3 Code FAQ](https://github.com/pingdotgg/t3code/blob/main/docs/user/faq.md) - remote access, T3 Connect, Tailscale and privacy
- [A deep dive into T3 Code](https://flaviocopes.com/t3-code/) - pairing, connections and the Usage page
- [T3 Code: the Limits tab in progress](https://github.com/pingdotgg/t3code/pull/9507) - how plan quotas will show
- [Tailscale](https://tailscale.com/) - a private network between your own devices
