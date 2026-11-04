---
module: 1
lesson_number: 2
course: agent-build-line
template: v2
---

# Lesson 2: Billing With Stripe and a Read-Only Key

:::video
id: bl-l2-overview
kind: overview
status: paused
src: /learn/video/agent-build-line/bl-l2-overview.mp4
captions: /learn/video/agent-build-line/bl-l2-overview.vtt
poster: /learn/video/agent-build-line/bl-l2-overview.jpg
transcript: Money is where an agent mistake costs the most. A wrong price, a duplicate charge, a refund nobody asked for. Stripe gives agents a way in that's built for this: an official plugin and MCP server, a sandbox full of fake money, and restricted keys that can only read. In this lesson you'll set up Rolling Ledger's 149 dollar monthly plan in a sandbox with an agent, have it build the checkout, and give your everyday agent a key that can look at your live billing but never change it.
:::

:::key-concept
Stripe gives agents three safety tools. A **sandbox** is a copy of your account with fake money, where an agent can build and test anything. The **Stripe plugin and MCP server** let the agent create products, prices and checkout links, and search Stripe's docs. A **restricted key** is an API key with only the permissions you tick; a key with read-only permissions lets an agent answer "how many trucks paid this month?" and nothing else. The agent builds in the sandbox; a person switches it to live.
:::

## What you'll be able to do

- Create a Stripe sandbox and know why the agent works there
- Install the Stripe plugin in Claude Code, Codex or Cursor
- Have the agent build a monthly subscription and a checkout page in the sandbox
- Create a restricted, read-only key for questions about live billing
- Keep the switch from sandbox to live in your own hands

## Why this matters

Rolling Ledger sells one plan: $149 a month. Today the founder sends a payment link by hand after each sales call. The portal from Lesson 1 needs real billing: a checkout page, a monthly charge, and the portal unlocking when the charge succeeds. That's the code agents write well, and the money they shouldn't touch unsupervised.

The AI Accounting course showed you how to read Stripe numbers with an assistant. This lesson goes further: an agent builds the billing, under rules that make a costly mistake hard.

## Sandbox first

In the Stripe dashboard, open the account menu and create a **sandbox**. It's a separate copy with its own keys, its own customers and test cards like `4242 4242 4242 4242`. Nothing in it charges anyone.

Everything the agent builds in this lesson happens in the sandbox. When it all works, you recreate the product in live mode yourself, or apply the same script with a live key you control.

## Install the Stripe plugin

Stripe publishes the same toolkit for each agent:

```bash
# Claude Code
claude plugin install stripe@claude-plugins-official

# Codex
codex plugin add stripe@openai-curated
```

In Cursor, type `/add-plugin stripe` in the agent panel. The plugin connects Stripe's hosted MCP server at `https://mcp.stripe.com`, which signs you in through the browser, and adds Stripe's skills, so the agent follows Stripe's current best practice and not last year's blog posts. When it asks which account, **pick the sandbox.**

Then brief the agent:

```text
In the Stripe sandbox, create a product "Rolling Ledger Monthly" with a
$149 USD monthly price. Then add a checkout page to the portal: a Subscribe
button that opens Stripe Checkout, and a webhook handler that marks the
owner's account active when the first payment succeeds.
Use the Stripe skills for current best practice. Show me each Stripe
object before you create it.
```

:::video
id: bl-l2-sandbox-checkout
kind: inline
status: paused
src: /learn/video/agent-build-line/bl-l2-sandbox-checkout.mp4
captions: /learn/video/agent-build-line/bl-l2-sandbox-checkout.vtt
poster: /learn/video/agent-build-line/bl-l2-sandbox-checkout.jpg
transcript: Here the agent works in the Rolling Ledger sandbox. It shows the product and the 149 dollar monthly price before creating them, then writes the checkout button and the webhook handler. We pay with the test card 4242, and the dashboard shows a new subscription with fake money. The portal flips the test owner to active. Nothing here touched a real card.
:::

## A read-only key for everyday questions

Once billing is live, you'll want to ask questions about it: who paid, who failed, how many trucks joined this month. You don't want the agent that answers those to be able to issue refunds.

In the live dashboard, go to the API keys page and **create a restricted key**. Give it a clear name, like `agent-read-only`, and set the permissions you need to **Read**: Customers, Subscriptions, Invoices, Charges. Leave everything else at **None**. Stripe shows the key once; it starts with `rk_live_`.

Store it in your password manager, then give it to your reporting agent only as an environment variable on your own computer, not pasted into a chat. With it, the agent can answer:

```text
How many active Rolling Ledger subscriptions are there, how many
invoices failed this month, and which owners do I need to email?
```

If a prompt or a bad instruction asks it to refund or cancel, Stripe refuses: the key doesn't allow it.

:::infographic
id: fig-1
type: comparison
title: Three keys, three jobs
shows: Three cards side by side. Sandbox key: the agent builds and tests anything, fake money. Restricted read-only key: the agent answers billing questions on live, can't change anything. Live secret key: only you, in your hosting secrets, never in a chat. The read-only card is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-02-fig-1.webp
alt: A sandbox key lets the agent build with fake money. A restricted read-only key lets it answer live billing questions without changing anything. The full live secret key stays with you in your hosting secrets.
:::

## Going live is a person's job

When the sandbox version works end to end, you make the switch:

1. Recreate the product and price in live mode, or run the agent's setup script yourself with your live key.
2. Put the live secret key and webhook secret into your hosting settings by hand.
3. Make one real $149 payment with your own card, then refund it from the dashboard.

The agent can write a checklist for this, and it can check your work with the read-only key. It doesn't hold the live secret key at any point.

:::infographic
id: fig-2
type: flow
title: From sandbox to live
shows: A left-to-right flow. The agent builds the product and checkout in the sandbox, test card payment passes, you review the pull request, you add live keys to hosting yourself, one real payment and refund. The last step is the paper card.
data: none
image: /learn/figures/agent-build-line/lesson-02-fig-2.webp
alt: The agent builds in the sandbox, a test payment passes, you review the pull request, you add the live keys to hosting yourself, and you make one real payment and refund it.
:::

:::warning
Never paste a live secret key (`sk_live_`) into any agent chat, skill or project file. It can move all the money in your account. If one ever lands in a chat or a commit, roll it in the Stripe dashboard straight away. And keep every price change a human decision: the agent can draft a new price, but you create it.
:::

:::try-it
Create a restricted key with Read on Subscriptions only. Ask your agent, with that key: "Cancel the newest subscription." Watch Stripe refuse. Then ask: "How many subscriptions are active?" That's the job the key is for.
:::

:::checkpoint
Q: Your agent built a working checkout in the sandbox. What's the next step?
- [ ] Give the agent your live secret key so it can repeat the setup
- [x] Review the pull request, then add live keys to hosting yourself and test with one real payment
- [ ] Turn off the webhook to save time
Why: The agent builds and tests with fake money. The live secret key and the first real charge stay with you.
:::

:::checkpoint
Q: Which key should your reporting agent use to answer "who failed to pay this month?"
- [ ] The live secret key, so it has full access
- [ ] A sandbox key
- [x] A restricted key with Read on Customers, Subscriptions and Invoices
Why: A restricted key can only do what you ticked. Read access answers the question; the agent can't refund or cancel even if asked.
:::

:::takeaways
- The agent builds billing in a Stripe sandbox, with fake money and test cards.
- Install Stripe's plugin for Claude Code, Codex or Cursor; it brings the MCP server and Stripe's own skills.
- A restricted, read-only key answers live billing questions and can't change anything.
- Going live is yours: live keys in hosting, one real payment, one refund.
:::

## Go deeper

- [Stripe for AI agents](https://docs.stripe.com/agents) - the plugin, MCP server and skills for each agent
- [Stripe MCP](https://docs.stripe.com/mcp) - the hosted server and what it can do
- [Restricted API keys](https://docs.stripe.com/keys#limit-access) - setting per-resource permissions
- [Sandboxes](https://docs.stripe.com/sandboxes) - testing without real money
