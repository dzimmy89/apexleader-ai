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

## Warm-up

:::checkpoint
Q: You accidentally paid for a personal dinner with the business card. What's the right fix?
- [ ] Categorize it as Meals so it's a business expense
- [ ] Delete the transaction from the books
- [x] Record it as an owner draw and keep the card for business only from now on
Why: Personal spending from the business account is an owner draw, not an expense. Deleting it would make your books disagree with the bank.
:::

## Steps

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
