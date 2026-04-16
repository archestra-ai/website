---
title: "Let's talk about AI slop"
date: '2026-04-07'
author: 'Ildar Iskhakov, CTO'
description: 'Is it the end of open source we know and love?'
image: '/blog/2026-04-07-only-responsible-ai.png'
---

## The End of Open Source as We Know It

When a few months ago GitHub shared statistics about [celebrating an enormous contribution of AI in their product metrics](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/?utm_source=web-k2k-octoverse-cta&utm_medium=web&utm_campaign=universe25), completely missing the point of degraded contribution quality, we already felt that things were going south — and every next day we've realized more and more that something pretty frightening is happening with open source repositories.

The first worrying moment was the [issue I posted with a $900 bounty](https://github.com/archestra-ai/archestra/issues/1301). I was hoping to motivate someone to contribute and bring shiny new "MCP Apps" support to our platform. We quickly got the attention of legitimate contributors proposing plans, asking questions, submitting attempts — but soon...

AI bots arrived and blew up the issue, taking it to **253 comments total**, poisoning the conversation with pointless "implementation plans" and even pure aggression toward the maintainers!

AI accounts started flooding not just this issue — but the entire repo. Every sloppy comment triggered a notification for every team member watching the repo. Our GitHub notifications became a wall of noise. Real conversations from contributors like @ethanwater, @developerfred, and @Geetk172 — people actively working on bounties — were getting buried.

Later, the problem exploded and took the form of an epidemic. For example, just for the issue to add x.ai provider support to Archestra, we received **[27 pull requests](https://github.com/archestra-ai/archestra/pulls?page=1&q=is%3Apr+is%3Aclosed+is%3Aunmerged+x.ai)**, most of which **contributors didn't even try to test**.

One of our team members had to spend **half a day every week cleaning AI garbage out of the repo**, removing untested PRs and closing hallucinated issues. When we forgot to do so, our repo quickly became a place completely unfriendly to legitimate contributors.

## Fighting Back

At first, we tried to calculate the "reputation" of contributors and built ["London-Cat"](https://github.com/archestra-ai/reputation-bot), a tiny bot calculating a contributor's reputation based on merged PRs and a few other signals ([example](https://github.com/archestra-ai/archestra/issues/1301#issuecomment-3725798117)). It obviously didn't stop the spam, but it helped us figure out "who is who" faster.

Later, we built an "AI sheriff" ([example](https://github.com/archestra-ai/archestra/pull/2843#issuecomment-3916574929)) to help us triage automatically, which obviously caused a few legitimate PRs to be closed 🤦.

The constant flow of useless AI comments and proposals was only getting worse, turning legitimate contributors away and making us reconsider: should we stop [motivating contributions with bounties](https://github.com/archestra-ai/archestra/issues?q=is%3Aissue%20state%3Aclosed%20label%3A%22%F0%9F%92%8E%20Bounty%22)? Should we stop [giving fun test tasks to our job candidates](http://archestra.ai/careers)?

We've decided that we need to fight back and insist on making our repo a comfortable and safe space for legitimate contributors, responsible AI users, newbies, and seasoned engineers.

Today we're **blocking the ability to create issues, open PRs, and leave comments for those who didn't go through the onboarding**.

![Contributor onboarding, five steps to get white-listed](/blog/2026-04-07-onboarding.png)

It's a nuclear option, yes. It's especially sensitive for a VC-backed startup that is measured thoroughly by GitHub activity, but we have to pull the trigger: **we value quality over quantity. We don't value metrics pumped by AI slop.**

We want Archestra to be a great piece of software that everyone can contribute to, without it being swallowed by AI bots.

## Doing It in GitHub

There is no straightforward way to white-list those who can comment or create PRs on an open source repo, so we had to hack around.

There is a setting called "Limit to prior contributors." Simple rule: if you haven't previously committed to `main`, you can't comment on issues or PRs.

![Prior contributors setting](/blog/2026-04-07-prior-contributors-setting.png)

The setting can't tell the difference between an AI bot and a real developer who signed up to work on a bounty. Both are "not prior contributors." Both get locked out.

GitHub defines "prior contributor" as someone whose GitHub account is the **author** of a commit on `main`. Git commits have two identity fields — **author** and **committer** — and they can be different people.

You can create a commit attributed to someone else using Git's `--author` flag. If the email matches their GitHub account, GitHub links the commit to their profile and grants them contributor status.

Every GitHub account has a noreply email: `<id>+<username>@users.noreply.github.com`. Look up the ID via the API and commit:

```bash
gh api users/their-username --jq '.id'

git commit \
  --author="their-username <ID+their-username@users.noreply.github.com>" \
  -m "chore: add their-username to external contributors"
```

Push to `main`, and they can comment immediately.

![Commit attributed to external user](/blog/2026-04-07-prior-contributors-commit.png)

The external user shows up as the **author**, our account as the **committer**. That's all GitHub needs to consider them a prior contributor.

The full flow:

1. Onboarding on our website with ethical AI rules and a CAPTCHA: [https://archestra.ai/contributor-onboard](https://archestra.ai/contributor-onboard)
2. A GitHub Action that fires on submission, looks up the user's GitHub ID, adds their handle to an `EXTERNAL_CONTRIBUTORS.md` file, and pushes a commit to `main` authored under their account.
3. User becomes white-listed and gets access to the repo.

## Final Words

It's a pretty weird position that while GitHub reports massive wins caused by AI, we as a small startup have to do the heavy lifting of cleaning up this AI slop from our repository and care about the legitimacy of our audience.

Dear community, let's talk about the effect AI slop has on honest contributors who want to spend their time doing good and have to break through the wall of noise instead.

Let's do better.
