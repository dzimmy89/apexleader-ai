---
module: 1
lesson_number: 2
course: claude-for-founders
template: v2
---

# Lesson 2: Projects: Your Business Brain

:::key-concept
A Project is a workspace with its own instructions, its own files and its own chat history. Every chat inside it starts already knowing your business. Build one Project per area of the company and Claude becomes a briefed specialist instead of a stranger.
:::

## What you'll be able to do

- Create a Project and write instructions that shape every chat inside it
- Load the right knowledge files and keep them current
- Decide how many Projects you need and what goes in each
- Control how memory flows between Projects and the rest of your account

## Why this matters

In Lesson 1 you pasted a founder brief into chats by hand. That works until you forget, or until you have ten documents Claude should know about. A Project fixes this. You set it up once, and every chat in it has your brief, your price list, your brand voice and your past decisions. It is the closest thing to an employee handbook for your AI team.

## What a Project holds

Each Project has three parts:

| Part | What it is | Founder example |
| --- | --- | --- |
| Instructions | Standing orders Claude follows in every chat in the Project | "You are the strategist for Groomer Books. Always write in our voice. Never give tax advice." |
| Knowledge | Files and text Claude uses as background | Founder brief, price list, customer interview notes, brand voice guide |
| Chats | The conversations you have inside the Project | "Plan the referral program," "Draft the welcome email" |

As of October 2026, Projects are available on every plan. Free accounts can create up to five. Paid plans (Pro, Max, Team, Enterprise) get more knowledge capacity: when your files approach the context limit, Claude switches to retrieval (RAG) mode, which Anthropic says expands capacity by up to ten times. Sharing a Project with other people is only on Team and Enterprise plans.

## Create your first Project

1. Open **Projects** in the left sidebar, or go to claude.ai/projects.
2. Click **+ New Project** in the upper right.
3. Give it a name and description. These are for you; Claude does not read them.
4. Click **Set project instructions**, write your standing orders, and click **Save instructions**.
5. In the knowledge panel on the right, click **+** and upload your files or paste text.

To move an existing chat in, open the dropdown next to the chat name, choose **Add to project**, and pick the Project.

If you have the Google Drive connector turned on (Lesson 3), you can add Drive files to a private Project from its Files section with **+** and **Drive**.

## Write instructions that actually steer

Project instructions are the most valuable 300 words you will write this month. Make them specific and testable. Here is a strong starting set for a "Company HQ" Project:

```text
You are the chief of staff and strategist for Groomer Books, a monthly
bookkeeping service for independent dog grooming salons in the US.

Always:
- Read the founder brief and price list in project knowledge before answering.
- Write in our voice: plain, warm, practical, short sentences, no jargon.
- When you give a recommendation, give one clear pick and the main tradeoff.
- Flag any claim you are not sure about and say what would confirm it.

Never:
- Give tax or legal advice. Say "check with a CPA" or "check with a lawyer."
- Invent customer quotes, numbers or results.
- Draft anything that commits money without labeling it DRAFT FOR FOUNDER APPROVAL.

Default output: short answer first, then details. Use tables for comparisons.
```

The "Never" list matters. It is where you put your approval rules: anything that leaves the business or touches money is a draft until you click send.

## Choose the right knowledge files

Knowledge is only useful if it is current and focused. Start with five or fewer files:

1. **Founder brief** from Exercise 1
2. **Offer and pricing** sheet
3. **Brand voice** notes with two or three examples of writing you like
4. **Customer notes**: interview summaries or common questions (strip personal data)
5. **Decision log**: a running list of decisions and why you made them

The decision log is the secret weapon. When you finish an important chat, ask:

```text
Summarize the decisions we made in this chat as dated bullet points for my
decision log. Include the reason for each decision in one line.
```

Paste the result into the decision log file and re-upload it. Now every future chat knows what you already decided, and you stop relitigating old choices.

:::warning
Treat knowledge files like anything you would hand a contractor. Remove bank details, passwords, ID numbers and customer personal data that Claude does not need. On Team and Enterprise plans, check who the Project is shared with before adding sensitive files.
:::

## How many Projects should a solo founder run?

Start with three. More than that and you will forget which one to open.

| Project | Use it for | Key knowledge |
| --- | --- | --- |
| Company HQ | Strategy, planning, weekly reviews, hard decisions | Founder brief, decision log, goals |
| Marketing and Sales | Emails, posts, landing page copy, proposals | Brand voice, offer, customer notes |
| Operations | Processes, checklists, vendor questions, SOPs | Process docs, tool list |

Free plans can hold five Projects, so this fits even before you upgrade.

## Projects and memory

Each Project has its own memory. A chat inside a Project uses that Project's memory plus your account memory from non-Project chats, but not the memory of other Projects. That keeps your marketing experiments from leaking into your finance planning.

If you want a Project fully sealed off, for example to explore a second business idea, turn off **Use account memory** on that Project's page.

## Keep it alive

A Project gets better only if you maintain it. Once a week:

- Update the decision log
- Replace any knowledge file that changed (prices, offer, goals)
- Read your instructions and cut anything Claude now does by default
- Archive Projects you no longer use (three dots in the upper right, then confirm). Archived Projects keep their files and settings.

A heads-up: Anthropic is testing a new version of Projects in which a Project becomes one ongoing conversation with a shared Library of files, rolling out first to some Pro and Max users in Claude Code. If your screen looks different from these steps, check the [current Projects help page](https://support.claude.com/en/articles/9517075-what-are-projects).

:::try-it
Create a Project called "Company HQ," paste your founder brief as a text knowledge item, and ask: "Based only on project knowledge, what are the three biggest risks to hitting this quarter's goal?" Notice that you did not have to explain your business.
:::

:::checkpoint
Q: You want Claude to stop giving tax opinions in every marketing and planning chat. Where is the best place to put that rule?
- [ ] Repeat it at the top of every message
- [ ] Save it as a memory in a single chat
- [x] In the Project instructions of each Project you use for business work
Why: Project instructions apply to every chat in the Project automatically, so the rule is enforced without you remembering to repeat it.
:::

:::takeaways
- A Project bundles instructions, knowledge files and chats so every conversation starts briefed.
- Write instructions with clear Always and Never lists, including your approval rules.
- Start with three Projects and five focused knowledge files each, including a decision log.
- Project memory is separate per Project; turn off "Use account memory" to seal one off completely.
:::

## Go deeper

- [What are projects?](https://support.claude.com/en/articles/9517075-what-are-projects) - plans, RAG capacity, sharing and the new beta version
- [How to create and manage projects](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects) - step-by-step setup, archive and delete
- [Chat search and memory](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context) - how project memory is separated
