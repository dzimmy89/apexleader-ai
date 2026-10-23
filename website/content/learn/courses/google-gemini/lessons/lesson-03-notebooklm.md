---
module: 1
lesson_number: 3
course: google-gemini
template: v2
---

# Lesson 3: NotebookLM

:::key-concept
NotebookLM, renamed Gemini Notebook in July 2026, is an AI that answers from the sources you give it and cites the exact passage. That makes it the right tool for "what do my documents say?" questions. Build one notebook per topic, and it becomes a research assistant that knows your business files.
:::

## What you'll be able to do

- Explain the difference between asking Gemini and asking a notebook
- Build a notebook from your own files, web pages and videos
- Get cited answers, briefing docs and audio overviews from your sources
- Decide what belongs in a notebook and what stays out

## Why this matters

A general chatbot answers from everything it ever read, which is why it sometimes makes things up. A notebook answers from your sources and shows you where each answer came from. For a founder, that's the difference between "the AI says our refund policy is 30 days" and "page 2 of our policy says 14 days, here's the line." Use it for your policies, contracts, customer interview notes, competitor research and anything else you need to get exactly right.

## The name change, and what stayed the same

On July 16, 2026, Google renamed NotebookLM to **Gemini Notebook**. It's still a standalone product, still at [notebooklm.google](https://notebooklm.google/), and old links redirect. What changed:

- **Notebooks sync** between the standalone product and the Gemini app, so you can open the same notebook in either place.
- **Each notebook gets a secure cloud computer** that can write and run code to analyze data in your sources. Google launched this for AI Ultra and certain Workspace business add-ons first, with a rollout to AI Pro on the web.
- Google says notebooks are coming to AI Mode in Search.

You'll see both names in help articles and videos for a while. They're the same product. This lesson uses "notebook" for short.

## Build your first notebook

1. Go to [notebooklm.google](https://notebooklm.google/) and sign in with the Google account that holds your business files.
2. Create a new notebook and give it one clear topic, such as "Business policies" or "Competitor research."
3. Add sources. You can upload PDFs and other files, pick Google Docs, Slides and Sheets from Drive, paste web links or YouTube links, or paste text. You can also ask the notebook to discover sources on the web for you.
4. Check the source list. Untick any source you don't want used for a given question.

Source and notebook limits depend on your plan. Check the [Gemini Notebook help page on adding sources](https://support.google.com/gemininotebook/answer/16215270) for the current numbers.

**One topic per notebook.** If you mix your refund policy with competitor blog posts, answers get muddy. Small, focused notebooks give sharper answers.

## Ask questions that use the sources

In the chat panel, ask the way you'd ask an assistant who read every file:

```text
Based only on these sources, what is our refund policy for the monthly package?
Quote the exact sentence and tell me which document it's in.
```

```text
Compare the three competitor pricing pages. Make a table: plan name, price, what's included, what's extra.
If a source doesn't say, write "not stated" rather than guessing.
```

```text
What questions do customers ask most often across these email exports?
Group them into themes and count how many times each theme comes up.
```

Each answer carries numbered citations. Click one to jump to the passage. If the notebook says it can't find something, that's useful too: it means your documents don't cover it.

## Make something from the notebook

The Studio panel turns your sources into other formats. Depending on your plan, options include:

- **Audio Overview**: a podcast-style conversation about your sources. Good for listening to research on a drive.
- **Video Overview**: a narrated slide-style explainer.
- **Reports**: briefing docs, study guides, FAQs.
- **Mind map**: a visual map of the main ideas.
- **Flashcards and quizzes**: handy for training a future hire on your policies.

Customize before generating. For example, for an Audio Overview:

```text
Focus on what a new client needs to know in their first month. Keep it under 8 minutes.
Skip anything about our internal pricing.
```

## What belongs in a notebook

| Good fits | Keep out |
|---|---|
| Your policies, service descriptions, FAQs | Passwords, bank details, API keys |
| Interview notes and call transcripts (with consent) | Customer ID numbers or health data |
| Competitor pages and industry reports | Anything you're not allowed to share with Google under a client contract |
| Your Deep Research reports and their sources | Files you'll need to delete on request but might forget are uploaded |

Sharing works like Drive: you can share a notebook with a teammate or contractor and choose what they can do. Share the smallest notebook that does the job.

:::try-it
Make a notebook called "My business basics." Add three things you already have: your website or a service description, one email thread with a customer, and one competitor's web page. Ask: "Based only on these sources, what do customers seem to care about most?"
:::

:::warning
A notebook is only as safe as what you put in it. Before uploading client documents, check your client contracts and your Google account type. A Workspace business account carries business data protections that a personal account doesn't.
:::

:::checkpoint
Q: A contractor asks, "What's our cancellation notice period?" You want the exact answer from your policy, not a guess. Which tool fits best?
- [ ] A fresh Gemini chat with no files attached
- [x] A notebook with your policy documents, asking it to quote the line and cite the source
- [ ] Deep Research on "standard cancellation notice periods"
Why: A notebook answers only from your sources and cites the passage, so you get your policy, not the internet's average.
:::

:::takeaways
- NotebookLM is now called Gemini Notebook; same product, same address, now synced with the Gemini app.
- Notebooks answer from your sources with clickable citations.
- Keep one topic per notebook and only add what you'd be comfortable sharing with Google under your account type.
- Use Studio to turn sources into audio, video, reports and training material.
:::

## Go deeper

- [NotebookLM is now Gemini Notebook](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/) - Google's July 16, 2026 announcement
- [Google Workspace Updates: NotebookLM is now Gemini Notebook](https://workspaceupdates.googleblog.com/2026/07/notebooklm-now-gemini-notebook.html) - rollout details for Workspace accounts
- [Add or discover new sources for your notebook](https://support.google.com/gemininotebook/answer/16215270) - official help on source types and limits
- [Google AI plans](https://gemini.google/subscriptions/) - notebook limits by plan
