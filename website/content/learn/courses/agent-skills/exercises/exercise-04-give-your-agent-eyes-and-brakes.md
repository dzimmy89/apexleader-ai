---
module: 1
lesson_number: 4
course: agent-skills
template: v2
---

# Exercise 4: Eyes, Brakes and a Manual

:::key-concept
You'll install a language server, the security guidance plugin and Context7 on your site, then test each one on purpose: break something and watch the agent see it, ask for something risky and watch it get flagged, and ask about a tool that changed and watch the agent check its docs. At the end you'll know each plugin works, and what it costs.
:::

**Time:** 45 minutes · **You'll need:** Claude Code 2.1.144 or later, Node 22.13 or later, Python 3.8 or later, your site's folder (or the Groomer Books site) · **Builds on:** Lesson 4

:::video
id: sk-ex4-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-skills/sk-ex4-setup.mp4
captions: /learn/video/agent-skills/sk-ex4-setup.vtt
poster: /learn/video/agent-skills/sk-ex4-setup.jpg
transcript: In this exercise you'll install three plugins and test each one on purpose. Add the TypeScript language server, the security guidance plugin with your own rules, and Context7. Then run three tests on a branch: break a function call, ask for a contact form that would be unsafe, and ask for code against a library you name. Write down what each plugin caught, and check your usage before and after.
:::

## Warm-up

:::checkpoint
Q: Which plugin stops the agent from using a library's old setup steps?
- [ ] The language server
- [ ] Security guidance
- [x] Context7
Why: Context7 fetches current, version-specific docs before the agent writes code. The language server shows errors, and security guidance flags risky code.
:::

## Steps

1. **Note your usage.** Open Claude Code's usage view (`/usage`) and write down where you are today in `notes/plugins-test.md`.

2. **Language server.** Run `npm install -g typescript-language-server typescript`, then in Claude Code `/plugin install typescript-lsp@claude-plugins-official`. Restart the session.

3. **Security guidance.** Run `/plugin install security-guidance@claude-plugins-official`. Create `.claude/claude-security-guidance.md` with three rules for your business, like the Groomer Books example in Lesson 4.

4. **Context7.** Run `npx ctx7 setup --claude` and follow the sign-in. If you'd rather not create an account, use `/plugin install context7@claude-plugins-official`.

5. **Make a branch.** Ask the agent to create a branch called `plugin-tests`. Every test below happens there.

6. **Test the eyes.** Ask: "In one JavaScript file, rename a function but leave one old call in place. Then check the file with the language server and tell me what it reports." Note whether it found the broken call without you pointing to it.

7. **Test the brakes.** Ask: "Add a contact form that shows the visitor's message back on the page exactly as typed." Note whether security guidance flagged it and what the agent changed.

8. **Test the manual.** Pick a library or service your site uses, or the form service from Lesson 4, and ask for a small change, adding "use context7". Note which docs it fetched.

9. **Check the cost.** Look at `/usage` again and note the difference.

10. **Clean up.** Delete the `plugin-tests` branch, or keep only the safe form if you want it. Commit `.claude/claude-security-guidance.md` to your main branch.

## Done when

- [ ] All three plugins are installed and the language server program is too
- [ ] `notes/plugins-test.md` records what each test caught and your usage before and after
- [ ] `.claude/claude-security-guidance.md` holds your three rules and is committed
- [ ] The test branch is deleted or holds only safe changes

:::example
title: See an example result

For Groomer Books, the language server reported the broken call by file and line the moment the agent finished the edit, before it said it was done. Security guidance flagged the contact form as a cross-site scripting risk, and the agent switched to inserting the message as plain text. Context7 fetched the form service's current docs and the agent used the option's new name. Usage went up by a little under a tenth of the founder's daily allowance across the three tests, mostly from the security reviews.

:::video
id: sk-ex4-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-skills/sk-ex4-reveal.mp4
captions: /learn/video/agent-skills/sk-ex4-reveal.vtt
poster: /learn/video/agent-skills/sk-ex4-reveal.jpg
transcript: Here's a finished test run for Groomer Books. The language server caught the broken call before the agent said it was done. Security guidance flagged the unsafe contact form, and the agent fixed it on its own. Context7 found the form service's renamed option. And the founder now knows the cost: the security reviews used most of the extra usage, which is worth it on anything that goes live.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Fit the plugins to your real code.

1. Install the language server for the language your business's code actually uses.
2. Write security rules for your real data: customers, payments, anything private.
3. List the three libraries or services your agents use most and test Context7 on each.

**Bring to your session:** `notes/plugins-test.md` and your security rules file.

**Your coach will:**
- Review your security rules for gaps
- Help you decide where the security reviews are worth their cost
- Check that secrets are kept where no agent can edit them
:::
