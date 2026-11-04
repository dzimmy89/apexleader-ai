---
module: 1
lesson_number: 1
course: ai-accounting
template: v2
---

# Exercise 1: Open the Books and Write Your Back-Office Rules

:::key-concept
You'll separate business money, choose and set up an accounting app with a Schedule C-shaped category list, and write the access rules every AI helper in this course will follow. You'll finish with working books and a one-page "Back office rules" document.
:::

**Time:** 40 minutes · **You'll need:** Your business bank account details (or a plan to open one), a QuickBooks Online or Wave account (free trial or free plan is fine), Claude or ChatGPT · **Builds on:** Lesson 1

:::video
id: acct-ex1-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-accounting/acct-ex1-setup.mp4
captions: /learn/video/ai-accounting/acct-ex1-setup.vtt
poster: /learn/video/ai-accounting/acct-ex1-setup.jpg
transcript: One account, one app, and six rules every helper follows. Let's open your books. In this exercise you'll set up working books and write your back-office rules. First, the money: a business-only account and card, or time booked to open one. Choose QuickBooks Online or Wave, and write two sentences on why. Have Claude draft a category list with no more than fifteen expense categories, each mapped to Schedule C. Set up the app, and connect the bank feed if you can. Copy the six rules into a doc called Back office rules, and name each helper you plan to use. Check the app's user roles, so a helper can't pay bills or change bank details. Then turn on two-factor for your bank and your app. So: is there any path an agent could use to move money? Pause here and set up your books.
:::

## Warm-up

:::checkpoint
Q: You accidentally paid for a personal dinner with the business card. What's the right fix?
- [ ] Categorize it as Meals so it's a business expense
- [ ] Delete the transaction from the books
- [x] Record it as an owner draw and keep the card for business only from now on
Why: Personal spending from the business account is an owner draw, not an expense. Deleting it would make your books disagree with the bank.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to open the books
shows: Seven numbered steps down the frame: 1 Separate the money, 2 Choose the app, 3 Categories (15 or fewer, mapped to Schedule C), 4 Bank feed (read-only), 5 Back office rules (agents never move money, highlighted), 6 Least access, 7 Two-factor.
data: none
image: /learn/figures/ai-accounting/exercise-01-fig-1.webp
alt: Seven steps: separate the money; choose QuickBooks Online or Wave; set up 15 or fewer expense categories mapped to Schedule C; connect a read-only bank feed; write back office rules starting with agents never move money; give helpers the least access; and turn on two-factor.
:::

1. **Make the money decision.** If you don't have a separate business checking account and card, list two banks you'll compare this week and book the time to open one. If you do, write down its name and the last four digits only. Using the sample business (a bookkeeping service for dog groomers)? Pretend it's a single-member LLC with a new business account.

2. **Choose your app.** Using the comparison table in Lesson 1, pick QuickBooks Online or Wave. Write two sentences on why. If you have an accountant, ask which one they prefer.

3. **Create your category list.** Run this in Claude or ChatGPT:

```text
I run [your business, or: a one-person bookkeeping service for dog grooming salons] as a [sole proprietor / single-member LLC] in the US.
Suggest a chart of accounts with no more than 15 expense categories, each mapped to the matching Schedule C line.
Add income categories and owner equity accounts (owner contribution, owner draw).
Flag any category with special tax rules so I can ask my accountant. No tax advice, only the mapping and flags.
```

Review the list. Merge anything you won't use. Save it as "Chart of accounts" in a `Finance` folder.

4. **Set up the app.** Create the company, enter your start date, and add or rename categories to match your list. Connect the business bank and card through the app's bank connection (on Wave this needs Pro). If you can't connect yet, skip this and note it.

5. **Write your Back office rules.** Copy the six rules from Lesson 1 into a doc called "Back office rules" in your Finance folder. Add one line naming each helper you plan to use (for example "Claude Cowork: Finance folder only" and "Expense Bot: vendor portals, read and download only").

6. **Plan least access.** Look up your app's user roles in its help center. Write down which role you'd give an AI helper or bookkeeper, and confirm it can't pay bills or change bank details.

7. **Turn on two-factor authentication** for your bank and accounting app, tied to your own phone.

## Done when

- [ ] You have (or have booked time to open) a business-only bank account and card
- [ ] Your accounting app is set up with a category list of 15 or fewer expense categories mapped to Schedule C
- [ ] The bank feed is connected, or you've noted why not yet
- [ ] "Back office rules" exists, starting with "Agents never move money"
- [ ] Two-factor authentication is on for your bank and accounting app

:::example
title: See an example result
Here is the finished setup for the sample business, Groomer Books, run as a single-member LLC. Line numbers are from the current Schedule C; confirm the mapping with your accountant.

:::video
id: acct-ex1-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-accounting/acct-ex1-reveal.mp4
captions: /learn/video/ai-accounting/acct-ex1-reveal.vtt
poster: /learn/video/ai-accounting/acct-ex1-reveal.jpg
transcript: For Groomer Books, the books are open, and no helper can touch a dollar. Here's the example. The business is a single-member LLC, with a new business checking account and one debit card. The app is QuickBooks Online Essentials, because later lessons use its receipt and invoicing agents. The chart of accounts has one income category, eleven expense categories mapped to Schedule C, and two owner accounts. Two categories are flagged for the accountant: meals, which are usually only half deductible, and car costs, where mileage and actual expenses are two different methods. The bank feed is connected, read only. The back office rules name two helpers: Claude Cowork, with the Finance folder only, and an expense bot that may read and download from vendor portals. Their user role can't pay bills or change bank details. And two-factor is on for both the bank and the app.
:::

:::infographic
id: fig-2
type: comparison
title: Groomer Books books, set up
shows: Under "Groomer Books setup" tagged example: a paper card for QuickBooks Online Essentials with three counts (1 income, 11 expense categories, 2 owner accounts), and beside it two flag cards for the accountant: Meals (usually 50% deductible) and Car (mileage or actual costs). Footer pills: Bank feed read-only, 2FA on.
data: example numbers: 1 income, 11 expense and 2 owner accounts; 2 flags
image: /learn/figures/ai-accounting/exercise-01-fig-2.webp
alt: Example Groomer Books setup in QuickBooks Online Essentials: 1 income category, 11 expense categories mapped to Schedule C and 2 owner accounts. Two categories are flagged for the accountant: meals, usually 50% deductible, and car costs, where mileage and actual costs are different methods. The bank feed is read-only and two-factor is on.
:::

**Money:** a new business checking account and one debit card in the LLC's name. Notes record the bank name and last four digits only.

**App:** QuickBooks Online Essentials. Why: later lessons use its receipt and invoicing agents, and the business expects about 35 transactions a month.

| Account | Schedule C line | Flag for the accountant |
|---|---|---|
| Service revenue (income) | Line 1 | |
| Advertising | Line 8 | |
| Car and truck expenses | Line 9 | Yes: mileage or actual costs, pick one method |
| Commissions and fees (payment processing) | Line 10 | |
| Contract labor | Line 11 | |
| Insurance | Line 15 | |
| Legal and professional services | Line 17 | |
| Office expense | Line 18 | |
| Supplies | Line 22 | |
| Travel | Line 24a | |
| Meals (business) | Line 24b | Yes: usually only 50% deductible |
| Other expenses: software, bank fees, education | Line 27a | |
| Owner contribution, Owner draw (equity) | Not on Schedule C | |

```text
BACK OFFICE RULES (example, Groomer Books)
1-6: copied from Lesson 1, starting with "Agents never move money."
Helpers:
- Claude Cowork: the Finance folder only
- Expense Bot: vendor portals, read and download only
User role for helpers: limited user, checked: cannot pay bills or change bank details
Two-factor: on for the bank and QuickBooks, tied to the founder's phone
Bank feed: connected, read-only
```
:::

:::coached
**For 1-on-1 coaching clients.** Clean up your real starting point.

1. Export your last three months of transactions from every account you've used for the business.
2. Have Claude mark each row Business, Personal or Unsure using your vendor and client list, then review every Unsure yourself.
3. Import only business rows, and list any owner contributions or draws you need to record.

**Bring to your session:** your chart of accounts, the cleaned transaction file, and your Back office rules.

**Your coach will:**
- Review your categories against how your business actually earns and spends
- Check your access plan for any path an agent could use to move money
- Agree on which questions to take to your accountant
:::
