# Module 1 Quiz: AI Marketing
Checks whether you can run a marketing department of agents that draft, report and advise while you keep the approvals.

---

## Question 1
Your Marketing Bot is ready to schedule posts from your 30-day content calendar. Which rows should it touch?

- A) Every row, so the calendar is never empty
- B) Only rows marked approved, queued as drafts for your final click
- C) Rows it thinks will perform best
- D) Any row older than a week

**Answer:** B

**Explanation:** The Status column is the approval gate, and anything that leaves the business still needs a human click before it publishes.

---

## Question 2
Your site ranks on Google but never shows up in ChatGPT search answers. What should you check first?

- A) Whether OAI-SearchBot is allowed in robots.txt and not blocked by your host or firewall
- B) Whether you have an llms.txt file
- C) Whether GPTBot is blocked
- D) Whether you bought ChatGPT ads

**Answer:** A

**Explanation:** OpenAI says sites that opt out of OAI-SearchBot won't appear in ChatGPT search answers, while GPTBot is the separate training crawler.

---

## Question 3
You run a Marketing Bot and an Expense Bot on the same Grok Bot account. Why should your bank login stay off that account?

- A) Grok Bot can't open banking websites
- B) The Expense Bot will forget the login
- C) Auto-review blocks all bank pages anyway
- D) All Bots on an account share one computer and its logins, so separate Bots are not a security boundary

**Answer:** D

**Explanation:** SpaceXAI's docs say the isolation boundary is your account, not the Bot, and agents should never move money in any case.

---

## Question 4
Your price changed. Your Launch Dot finds the old price on your site, your one-pager and in your Stripe checkout. What is the right outcome?

- A) The Dot updates all three, since Offer Facts was updated
- B) The Dot ignores Stripe because it isn't marketing
- C) The Dot proposes edits for the site and one-pager for your approval and flags Stripe for you to change yourself
- D) The Dot emails customers about the new price

**Answer:** C

**Explanation:** Draft and propose is the Dot's job; anything that changes money or reaches customers needs your click.

---

## Question 5
Which email automation is reasonable to let run without a weekly review?

- A) A three-email welcome sequence you wrote and approved once
- B) A weekly newsletter your agent writes fresh each Thursday
- C) Agent-written replies to subscriber questions
- D) A re-engagement email the agent invents for inactive subscribers

**Answer:** A

**Explanation:** Pre-approved copy that doesn't change can run on its own, while new words always need your eyes before they reach a subscriber.

---

## Question 6
A subscriber unsubscribes. Under CAN-SPAM, how fast must you honor it?

- A) Within 30 business days
- B) Within 10 business days
- C) Only after they confirm by reply
- D) Only on your main list, not side lists

**Answer:** B

**Explanation:** The FTC's guide says opt-outs must be honored within 10 business days, and you can't contract that responsibility away to a tool or agent.

---

## Question 7
Your ads agent reports a great-performing ad and recommends doubling the budget today. What do you do?

- A) Let the agent change the budget since the data supports it
- B) Remove the account spending limit so the agent has room
- C) Ignore the recommendation
- D) Make the decision yourself and raise the budget in a step you choose, keeping the hard cap

**Answer:** D

**Explanation:** Budget changes move money, so the agent recommends and you decide, with the platform cap still in place.

---

## Question 8
Your Grok Bot routine runs at 6:00 AM and asks to publish a post while you're asleep. What happens?

- A) The approval request expires after about ten minutes and the post doesn't publish
- B) It publishes automatically after ten minutes
- C) Another Bot approves it for you
- D) The routine deletes itself

**Answer:** A

**Explanation:** Approvals raised during unattended Grok Bot work expire without running, which is why the Bot should queue drafts for your click instead.
