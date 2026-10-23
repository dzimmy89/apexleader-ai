---
module: 1
lesson_number: 2
course: google-gemini
template: v2
---

# Lesson 2: Deep Research

:::key-concept
Deep Research turns one question into a research project. Gemini writes a plan, reads many web pages (and, if you allow it, your Gmail and Drive), then hands you a cited report. Your job is to aim it well, edit the plan, and check the sources before you act on anything.
:::

## What you'll be able to do

- Start a Deep Research run and edit its plan before it begins
- Write a research brief that produces a decision-ready report, not a book report
- Add your own Gmail, Drive and notebook content as sources when it helps
- Check citations and turn the report into a Doc, an audio summary or a one-page brief

## Why this matters

As a solo founder you don't have an analyst. Deep Research is the closest thing: it does the hour of tab-opening, skimming and note-taking for you in a few minutes. Used well, it answers "who else does this, what do they charge, and what do customers complain about?" before you spend a dollar. Used badly, it produces long, confident text that sounds right and isn't. The difference is the brief you write and the checking you do after.

## How Deep Research works

Deep Research is one of the tools in the Gemini app, and Google lists it on every plan, including Free. AI Pro and Ultra can use the Pro model for higher-quality reports and get higher daily limits. You must be 18 or older and signed in. On the web, the steps from Google's help page (October 2026) are:

1. Go to [gemini.google.com](https://gemini.google.com). In the text box, click **Add Files**, then **Deep Research**.
2. Optional: click **Sources** to choose what it searches. Google Search is on by default. You can add Gmail and Drive (once the Google Workspace app is connected to Gemini), upload files, or add a notebook.
3. Type your question and click **Submit**. Gemini writes a research plan.
4. Optional but recommended: click **Edit plan** and change it in plain language.
5. Click **Start research**. Reports usually take 5 to 10 minutes. You can leave, and Gemini notifies you when it's done.
6. Click **Open** to read the report, with numbered citations to the pages it used.

Adding your own Gmail and Drive is useful when the answer depends on your data: "Compare what my last ten customers asked for in email with what competitors offer." Past reports are only findable later if your Keep Activity setting is on.

## Write a brief, not a question

A short question gets a broad, generic report. A brief gets a report you can act on. Use this template:

```text
Research goal: Decide whether to offer monthly bookkeeping to independent dog groomers in the US.
Decision I'm making: whether to launch, and at what price range.
What I need:
1. The main competitors serving groomers or small salons with bookkeeping (name, price, what's included).
2. Software groomers already use for booking and payments, and whether it exports to accounting tools.
3. Common complaints groomers post about money admin (forums, reviews, Reddit, Facebook groups).
4. Any industry data on the number of grooming businesses in the US, with the source and year.
Constraints: prefer sources from 2025-2026. Flag anything older than 2024.
Output: start with a one-paragraph answer, then a competitor table, then risks, then open questions I should answer by talking to customers.
```

Notice what the brief does: it names the decision, splits it into parts, sets a date range, and asks for a specific shape of output. It also asks for open questions. Deep Research can tell you what people say online. It can't tell you what your customers will pay. That comes from interviews (see the "Find and Validate the Idea" course).

## Edit the plan before you press start

When the plan appears, read it like a manager reviewing a junior's to-do list. Typical edits:

```text
Drop the section on the history of the grooming industry.
Add a step: find three groomer-focused business coaches or consultants and what they recommend for bookkeeping.
For competitor pricing, only use the competitors' own pricing pages, not review sites.
```

Two minutes here saves you reading ten pages you don't need.

## Check the report like an editor

Deep Research is fast and well organized, which makes it easy to trust too much. Before you use a number or a claim:

- **Open the citation.** Click the numbered source. Does the page actually say that? Is it from this year?
- **Watch for stale prices.** Competitor pricing pages change. Open them yourself before you put a number in a deck.
- **Spot the gaps.** If a section has one source, treat it as a lead, not a fact.
- **Ask a follow-up in the same chat.**

```text
List every number in this report with its source and the date of that source.
Mark any number that came from a source older than 2024, or that you inferred rather than read.
```

## Turn the report into something useful

A report you never reread is wasted. After the run, you can:

- **Export to Google Docs**: in the Canvas panel, click **Share & export**, then **Export to Docs**, so you can edit, comment and keep it in Drive.
- **Ask for a one-page brief** in the same chat: "Turn this into a one-page decision memo with a recommendation and three risks."
- **Create an Audio Overview**: in the Canvas panel, click **Create**, then **Audio Overview**, and listen on a walk. The same **Create** menu turns the report into a visual, such as a simple web page or infographic, from a prompt.
- **Load it into a notebook** (Lesson 3) with the source pages so you can ask grounded questions later.

:::try-it
Start a Deep Research run on: "Who are the five biggest competitors for [your business idea] in [your country], and what do they charge?" Don't press start yet. Edit the plan to cut one section and add one, then run it.
:::

:::warning
Turning on Gmail or Drive as sources lets Gemini read that content for the report. Only enable the sources the question needs, and don't run research that pulls customer or employee data into a report you'll share outside the business.
:::

:::checkpoint
Q: Deep Research tells you a competitor charges $149 a month, citing a review site from 2023. What do you do?
- [ ] Use the number in your pricing slide; Deep Research already checked it
- [ ] Delete the competitor from your analysis
- [x] Open the competitor's own pricing page today and use what it says, noting the date
Why: Prices change and review sites go stale. Treat old or secondhand numbers as leads and confirm them at the source.
:::

:::takeaways
- Deep Research plans, browses and writes a cited report in 5 to 10 minutes; it's on every plan, with higher limits and the Pro model on AI Pro and Ultra.
- A brief with a decision, sub-questions, a date range and an output shape beats a one-line question.
- Edit the plan before it runs, and check citations before you act.
- Export to Docs or a notebook so the research keeps working for you.
:::

## Go deeper

- [Use Deep Research in Gemini Apps](https://support.google.com/gemini/answer/15719111?hl=en&co=GENIE.Platform%3DDesktop) - official help article with current steps
- [Google AI plans](https://gemini.google/subscriptions/) - which plans include Deep Research and at what limits
- [Gemini Apps release notes](https://gemini.google/release-notes/) - dated changes to the app and its tools
