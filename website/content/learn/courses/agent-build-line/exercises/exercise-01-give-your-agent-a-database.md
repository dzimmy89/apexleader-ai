---
module: 1
lesson_number: 1
course: agent-build-line
template: v2
---

# Exercise 1: A Fenced-In Database

:::key-concept
You'll create a Supabase project for development, connect your agent to it read-only and scoped to that one project, prove the fence holds, and then let the agent build one table with row-level security as a migration. At the end you'll have a working table, a migration file in your repo, and proof that one test owner can't see another's data.
:::

**Time:** 50 minutes · **You'll need:** A free Supabase account, Claude Code, your site's repo (or the Rolling Ledger site) · **Builds on:** Lesson 1

:::video
id: bl-ex1-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-build-line/bl-ex1-setup.mp4
captions: /learn/video/agent-build-line/bl-ex1-setup.vtt
poster: /learn/video/agent-build-line/bl-ex1-setup.jpg
transcript: In this exercise you'll build the fence before the house. Create a dev project in Supabase, connect Claude Code to it read-only, and try to make a change. It should refuse. Then lift read-only on dev, have the agent design one table with row-level security, save it as a migration, and test that one fake owner can't see the other's rows.
:::

## Warm-up

:::checkpoint
Q: Which option stops the agent from seeing your other Supabase projects?
- [ ] `read_only=true`
- [x] `project_ref=<id>`
- [ ] `features=docs`
Why: `project_ref` limits the connection to one project. `read_only` limits what it can do there.
:::

## Steps

1. **Create the dev project.** In Supabase, make a new project named `<your-business>-dev`. Save its database password in your password manager. Copy the project id from its settings.

2. **Connect read-only.** In a terminal in your repo, run `claude mcp add --transport http supabase-dev "https://mcp.supabase.com/mcp?project_ref=<id>&read_only=true"`. Start Claude Code, run `/mcp`, and sign in.

3. **Test the fence.** Ask: "Which Supabase projects can you see?" It should list one. Then: "Create a table called test." It should refuse. Note both answers in `notes/database-fence.md`.

4. **Lift read-only on dev.** Remove the dev server with `claude mcp remove supabase-dev`, and add it again without `&read_only=true`. Keep `project_ref`.

5. **Brief the table.** Use the receipts prompt from Lesson 1, changed for your business: one table, owned by a user, with row-level security, saved in `supabase/migrations`, and "show me the SQL before you apply anything."

6. **Read the SQL.** Before approving, check it has `enable row level security` and a policy that compares the owner to the signed-in user. Ask the agent to explain any line you don't follow.

7. **Add test data.** Have it add ten made-up rows for two test users. No real names or emails.

8. **Test the rule.** Ask the agent to act as test user A and list rows. It should get only A's. Note the result.

9. **Commit the migration** on a branch and open a pull request. Don't apply it to any live project.

## Done when

- [ ] A dev project exists, and the agent's connection is scoped to it
- [ ] `notes/database-fence.md` shows the read-only refusal and the one-project answer
- [ ] One table with row-level security exists in dev, with made-up data only
- [ ] The migration file is in a pull request, and test user A sees only A's rows

:::example
title: See an example result

For Rolling Ledger, the agent listed one project, `rolling-ledger-dev`, and refused to create a table while read-only. After the switch, it proposed a `receipts` table with `owner_id` linked to the signed-in user, a category limited to fuel, commissary, supplies or other, and two policies: owners can select and insert only rows where `owner_id` matches them. The founder asked why there was no update policy; the agent explained receipts are add-only for now, which matched the plan. Test owner A saw five receipts, not ten.

:::video
id: bl-ex1-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-build-line/bl-ex1-reveal.mp4
captions: /learn/video/agent-build-line/bl-ex1-reveal.vtt
poster: /learn/video/agent-build-line/bl-ex1-reveal.jpg
transcript: Here's the finished Rolling Ledger setup. One project in view, a refused change while read only, then a receipts table with two row-level security policies. Test owner A sees five receipts, not ten. The migration file is waiting in a pull request, and nothing touched the live project.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Plan your real data model.

1. List the three things your customers will store or see in your product.
2. Draft who should see each one, in plain words.
3. Turn that into row-level security rules with your agent, on dev.

**Bring to your session:** your migration pull request and `notes/database-fence.md`.

**Your coach will:**
- Check your security rules for gaps
- Help you plan how migrations get to live
- Confirm no service key is anywhere an agent can read it
:::
