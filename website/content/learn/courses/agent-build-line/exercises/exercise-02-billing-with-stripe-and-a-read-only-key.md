---
module: 1
lesson_number: 2
course: agent-build-line
template: v2
---

# Exercise 2: Sandbox Billing and a Key That Can Only Look

:::key-concept
You'll have an agent set up your monthly plan and a checkout in a Stripe sandbox, pay with a test card, and then create a restricted key that can read your billing but not change it. You'll prove the key's limits by asking it to cancel something and watching Stripe refuse.
:::

**Time:** 50 minutes · **You'll need:** A Stripe account, Claude Code, Codex or Cursor, your portal branch from Exercise 1 · **Builds on:** Lesson 2

:::video
id: bl-ex2-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-build-line/bl-ex2-setup.mp4
captions: /learn/video/agent-build-line/bl-ex2-setup.vtt
poster: /learn/video/agent-build-line/bl-ex2-setup.jpg
transcript: In this exercise you'll build billing without touching real money. Create a sandbox, install the Stripe plugin, and have the agent make your plan and a checkout button. Pay with the test card. Then create a restricted key with read access only, and try to cancel a subscription with it. Stripe should say no.
:::

## Warm-up

:::checkpoint
Q: Where does the agent create your product and price in this exercise?
- [x] In a Stripe sandbox
- [ ] In live mode, then you delete it
- [ ] In a spreadsheet first
Why: The sandbox is a full copy with fake money. Live mode is for you, once the sandbox version works.
:::

## Steps

1. **Make a sandbox.** In the Stripe dashboard's account menu, create a sandbox named `<your-business>-build`.

2. **Install the plugin.** Claude Code: `claude plugin install stripe@claude-plugins-official`. Codex: `codex plugin add stripe@openai-curated`. Cursor: `/add-plugin stripe`. Sign in and choose the sandbox.

3. **Brief the agent.** Use the Lesson 2 prompt with your plan's name and price. Ask it to show each Stripe object before creating it.

4. **Check the objects.** In the sandbox dashboard, confirm one product, one monthly price at the right amount, in the right currency.

5. **Test the checkout.** Run the portal locally, click Subscribe, and pay with `4242 4242 4242 4242`, any future date and any three digits. Confirm the subscription appears in the sandbox and the test owner is marked active.

6. **Open a pull request** for the checkout code.

7. **Create a restricted key.** In the sandbox's API keys page, create a restricted key named `agent-read-only` with Read on Customers, Subscriptions, Invoices and Charges, and None on everything else.

8. **Test its limits.** Give the key to a fresh agent session as an environment variable. Ask "How many active subscriptions are there?" and then "Cancel the newest subscription." Note both answers in `notes/billing-keys.md`.

9. **Write the go-live checklist.** Ask the agent to draft the steps for switching to live, with every step that needs a live key marked "me."

## Done when

- [ ] Your plan and checkout work in the sandbox with a test card
- [ ] The checkout code is in a pull request
- [ ] `notes/billing-keys.md` shows the read-only key answering a question and refusing to cancel
- [ ] A go-live checklist exists, and every live-key step is yours

:::example
title: See an example result

For Rolling Ledger, the agent showed the product "Rolling Ledger Monthly" and a $149 USD monthly price before creating them, then wrote a Subscribe button and a webhook handler. The test card payment created a subscription, and the portal flipped test owner A to active. The read-only key answered "1 active subscription" and Stripe refused the cancel with a permissions error. The go-live checklist had six steps; four were marked "me."

:::video
id: bl-ex2-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-build-line/bl-ex2-reveal.mp4
captions: /learn/video/agent-build-line/bl-ex2-reveal.vtt
poster: /learn/video/agent-build-line/bl-ex2-reveal.jpg
transcript: Here's the Rolling Ledger result. A 149 dollar monthly plan in the sandbox, a test payment, and an active test owner. The read-only key counts subscriptions fine, and when asked to cancel one, Stripe returns a permissions error. That's exactly the key you want an everyday agent to hold.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Plan your real pricing setup.

1. List every plan, add-on and discount you want to offer.
2. Decide which billing questions you'll ask an agent every week.
3. Draft the restricted key permissions those questions need, and nothing more.

**Bring to your session:** your pull request, `notes/billing-keys.md` and the go-live checklist.

**Your coach will:**
- Review your plans and prices before they go live
- Check the webhook handles failed payments
- Walk through the go-live checklist with you
:::
