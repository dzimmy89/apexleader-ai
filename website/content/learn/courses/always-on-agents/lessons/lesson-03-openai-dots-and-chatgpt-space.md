---
module: 1
lesson_number: 3
course: always-on-agents
template: v2
---

# Lesson 3: OpenAI Dots and ChatGPT Space

:::key-concept
A dot is OpenAI's always-on agent inside ChatGPT, launched September 29, 2026. It has its own cloud computer, reaches thousands of apps through plugins, learns your preferences, and follows Custom rules you write about what it may do alone. ChatGPT Space is the shared workspace where you, ChatGPT and your dot work on the same pages and files.
:::

## What you'll be able to do

- Check eligibility and create your first dot
- Connect plugins and write Custom rules that match your approval rule
- Watch, pause and steer your dot through its profile and Activity
- Use ChatGPT Space pages with your dot for shared, recurring work

## Why this matters

If ChatGPT is already your main office, a dot turns it into a staff member. It can keep a project moving between your conversations, check work while you are out, and reach you in ChatGPT, Slack or Microsoft Teams with context that carries across. For a solo founder, the most useful pieces are the Custom rules (your approval rule, enforced) and the Activity view (your daily check).

## Who can get a dot

As of October 2026:

- **ChatGPT Pro:** rolling out to adults 18+, except in the European Economic Area, Switzerland and the UK.
- **Business Premium:** in supported ChatGPT regions, subject to workspace eligibility.
- **Enterprise, Edu and Healthcare:** a **beta** that a workspace admin must turn on; it is off by default.
- Rollout is gradual and can take several days to reach your account.
- **Cost:** your first dot is included with Pro or Business Premium. Your plan includes an allowance for deeper work, with extended limits in the first month after launch. OpenAI says you will later be able to add more dots and scale speed or monthly volume; prices for that are not published. Conversations with your dot do not count toward ChatGPT usage limits, but tasks it runs in Codex or ChatGPT Work do.
- **Model:** dots run on GPT-6 Astra.

Also in preview: **specialist dots**, which companies give their own identity and credentials for one defined job, are in focused enterprise pilots. Texting your dot is a **limited beta** for US Pro users.

## Create and set up your dot

1. Create your dot in the ChatGPT mobile app (iOS or Android), the desktop app, or desktop web. Mobile web is not supported. You can also launch dots from Codex.
2. Follow the onboarding prompts and name it. The default handle is @yourname-dot.
3. **Connect apps.** On mobile, open your dot's profile, then **Customize > Plugins**. Pick an app, review its permissions, and connect. Plugin permissions control app actions separately from your rules. You can connect Slack and personal email; a dot cannot have its own email address at launch.
4. **Write Custom rules.** On desktop and web: **Settings > Personalization > Custom rules** (under Permissions). On mobile: sidebar, **Customize**, then **Custom rules**. Select **Add**, describe the action, choose a behavior, and save.
5. **Connect channels** such as Slack from the desktop app.

The four rule behaviors:

| Behavior | Use it for |
|---|---|
| Take action without asking | Low-risk internal work, such as saving research notes to a page |
| Take action when you say so | Actions you sometimes request directly, such as creating a calendar hold |
| Ask before taking action | Anything sent to customers, posted, shared or deleted |
| Hand off to you | Logins, contracts, payments, tax or legal steps |

OpenAI's help center labels the second option "Take action if pre-approved" in one place, so the wording in your app may vary. It means: proceed only if you explicitly asked for this action in your prompt.

Starter rules for a small business:

```text
Ask before taking action: sending any email, Slack or Teams message to
someone outside my business.
Ask before taking action: creating, editing or sending an invoice or quote.
Ask before taking action: deleting any file, email, page or record.
Hand off to you: anything involving payments, refunds, bank or payroll.
Hand off to you: signing in to a site, accepting terms, or signing documents.
Take action without asking: saving research and summaries to my Space pages.
```

Rules are instructions the dot tries to follow. They do not grant access, they do not override built-in safeguards, and the dot can still make mistakes. Behind them, an automatic **action review** checks anything that could affect your accounts or share information, and decides whether it proceeds, needs your approval, or must be done by you (changing a password always stays with you). When your dot does "proactive research" on its own, its app access is read-only.

## Watch and steer: profile, Activity, Take over

- **Activity:** in the desktop app, open your dot's profile and select **Activity**. Work is grouped as **In progress**, **Scheduled** and **Completed**. Open a waiting request to approve, connect an app or sign in.
- **Scheduled:** check each recurring task's instructions, timing and destination. Change the schedule or turn it off here.
- **Its computer:** open it from the profile. Under **Computers** you can **Take over** and later **Return control**.
- **Your laptop:** access to your local computer is off by default. Turn it on with **Allow access** under Computers in the desktop app; turn it off with **Revoke access**. Leave it off unless a job truly needs it.
- **Pause:** open the more options menu (•••) in the profile and select **Pause**. This stops the current main task, not delegated tasks or scheduled runs.
- **Reset or Delete:** permanent. It removes conversations, memories and scheduled tasks, and does not reverse changes already made in your apps.

:::try-it
Write the six starter rules above in your own words for your business, before you even have a dot. If you already have ChatGPT, check **Settings > Personalization** for Custom rules and see what defaults are listed.
:::

## ChatGPT Space: where your dot does visible work

ChatGPT Space is a shared, page-based workspace for Pro, Business and Enterprise users. It replaces the old Library and holds Pages, files, presentations and spreadsheets. It launched first on desktop and web, with mobile later.

How you work with your dot in Space:

- Type **@** in a page or comment and choose your dot, or **@ChatGPT**, then your request.
- Select text and use **Ask for change** to rewrite it, then review the edit.
- Type **/** for **Generate**, **Visualize** or **Image** blocks.
- **Recurring work:** the **Keep Updated** feature was not available at launch. To refresh a page on a schedule, ask in chat to set up a scheduled task, then check its timing in **Scheduled** and confirm one real run. Writing "update weekly" on a page does not schedule anything.

A good first Space page for a founder:

```text
@yourname-dot Create a page called "Weekly Pipeline". Pull this week's
new leads and booked calls from my connected email and calendar.
Show a table: name, source, last contact, next step. Do not contact anyone.
Then set up a scheduled task to refresh this page every Monday at 8 a.m.
and tell me when it is set.
```

**Sharing caution:** sharing a page does not expose your private chats or memory, but anything copied from memory onto a shared page is visible to everyone with access. Files uploaded into a page inherit its permissions.

:::warning
A dot can be allowed onto your own laptop and can use saved logins on supported sites (with your approval). Keep local access off by default, never connect banking or payment tools, and remember: deleting a dot does not recall messages already sent.
:::

:::checkpoint
Q: You want your dot to keep a "Weekly Pipeline" page in Space fresh every Monday. What actually makes that happen?
- [ ] Typing "update every Monday" at the top of the page
- [x] Asking in chat for a scheduled task, then checking it under Scheduled and confirming a real run
- [ ] Turning on Keep Updated, which shipped at launch
Why: OpenAI's docs say writing a cadence on a page schedules nothing, and Keep Updated was not available at launch.
:::

:::takeaways
- Dots launched September 29, 2026 for ChatGPT Pro (not EEA, Switzerland or UK) and Business Premium; Enterprise is a beta
- Custom rules have four behaviors; use "Ask before" for sends and "Hand off" for money and logins
- Check Activity and Scheduled daily; Pause does not stop scheduled runs
- Use Space pages for visible, shared work, and schedule refreshes through chat
:::

## Go deeper

- [Getting started with your dot](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot) - eligibility, setup, plugins, rules, pause and reset
- [Control your dot](https://learn.chatgpt.com/docs/dots/controls) - rule behaviors, action review and Activity
- [Work with agents in Space](https://learn.chatgpt.com/docs/space/agents) - @mentions, Ask for change and recurring work
- [Introducing dots](https://openai.com/index/introducing-dots/) - OpenAI's launch post
- [OpenAI launches Dots and ChatGPT Space](https://venturebeat.com/technology/openai-launches-dots-always-on-ai-agent-coworkers-and-chatgpt-space-where-they-can-collaborate-with-human-teams) - Space details, sharing and data use
