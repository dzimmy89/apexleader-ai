---
module: 1
lesson_number: 5
course: build-product-and-site
template: v2
---

# Exercise 5: Put Your Landing Page Live on Your Own Domain

:::key-concept
You'll deploy your GitHub repository to a host, connect your own domain with the right DNS records, and confirm the site loads over HTTPS. At the end, your landing page is live at your domain and every merged pull request updates it.
:::

**Time:** 40 minutes · **You'll need:** your GitHub repository from Exercise 4, a domain you own (from Name It and Check It, or buy one now), login to your registrar with two-factor authentication on · **Builds on:** Lesson 5

## Warm-up

:::checkpoint
Q: The host's dashboard shows a CNAME value for www that's different from one you saw in a blog post. Which do you use?
- [ ] The blog post's value, since it's been tested by others
- [x] The value shown in your host's dashboard for your project
- [ ] Both, as two separate CNAME records
Why: Hosts change their values and some give each project its own. The dashboard is the source of truth, and duplicate records break HTTPS.
:::

## Steps

1. **Snapshot your DNS.** Log in to your registrar, open DNS for your domain and copy every existing record (type, name, value) into `RUNBOOK.md` under "DNS before launch." Don't change anything yet.

2. **Choose a host.** Default: GitHub Pages. Choose Netlify, Vercel or Cloudflare Pages if you want preview links on pull requests, or if your domain's DNS is already on Cloudflare. Check the host's current free-tier terms allow a business site.

3. **Deploy to the free address.**
    - GitHub Pages: repo **Settings**, **Pages**, publish from branch `main`, root folder, save. Wait for `https://<username>.github.io/<repo>/`.
    - Netlify, Vercel or Cloudflare Pages: sign up with GitHub, import your repository (grant access to this repository only), no build command, publish the root folder.

    Open the free address on your phone. Click every link. Fix problems via a pull request.

4. **Add the domain at the host first.**
    - GitHub Pages: verify the domain on your profile (**Settings**, **Pages**, **Add a domain**) and add the TXT record GitHub shows. Then in the repo, **Settings**, **Pages**, enter your domain under Custom domain and save.
    - Other hosts: open the project's domain settings and add both `yourdomain.com` and `www.yourdomain.com`.

5. **Add the DNS records at your registrar.** Copy values exactly.
    - GitHub Pages: four A records on `@` (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and a CNAME `www` to `<username>.github.io`. Remove default parking records on `@`.
    - Other hosts: the exact records the dashboard shows. For Cloudflare Pages on the apex, follow its steps to move nameservers to Cloudflare.

    Record each change in RUNBOOK.md under "DNS after launch."

6. **Turn on HTTPS.** Wait for the host's DNS check to pass (minutes to hours). Then on GitHub Pages tick **Enforce HTTPS**; other hosts issue the certificate automatically. If it stalls after a few hours, look for leftover records, remove and re-add the custom domain.

7. **Run the launch check.** Ask your coding agent, or do it yourself:

    ```text
    Check https://[yourdomain.com] and https://www.[yourdomain.com].
    For each: valid HTTPS certificate? Does http:// redirect to https://?
    Does one version redirect to the other? Do all links work?
    Any mixed content (assets loaded over http://)?
    Does the social share preview show /images/og.png? Report pass or fail for each.
    ```

8. **Prove the pipeline.** Have an agent make a one-word copy change by pull request. Merge it. Watch the live site update.

## Done when

- [ ] Your landing page loads at https://yourdomain.com with a valid certificate (padlock showing)
- [ ] The www and bare versions both work and one redirects to the other
- [ ] http:// redirects to https:// and there's no mixed content
- [ ] RUNBOOK.md lists your DNS records before and after launch
- [ ] A merged pull request updated the live site without you touching the host

:::coached
**For 1-on-1 coaching clients.** Launch it like a business, not a hobby.

1. Lock down the domain: auto-renew on, registrar lock on, renewal date and payment card noted in RUNBOOK.md, and a second person (or your password manager's emergency access) able to recover the account.
2. Add the records your email service needs (SPF, DKIM, DMARC, usually TXT records your email provider gives you) so mail from your domain isn't marked as spam, and test by sending to a Gmail and an Outlook address.
3. Set up a simple uptime check (many hosts and free services offer one) that emails you if the site goes down.

**Bring to your session:** your live URL, RUNBOOK.md, a screenshot of your DNS records, and the results of your launch check.

**Your coach will:**
- Review your DNS records line by line for leftovers and risks
- Test the site live on several devices with you
- Agree the launch announcement and who it goes to (you send it, not an agent)
:::
