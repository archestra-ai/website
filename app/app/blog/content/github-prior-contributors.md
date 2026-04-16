---
title: 'How We Stopped GitHub Spam Bots Without Locking Out Real Contributors'
date: '2026-04-07'
author: 'Ildar Iskhakov, CTO'
description: 'Our open issue got flooded with spam bot comments, burying real contributors under notifications. Here is how we fixed it without losing community access.'
image: '/blog/2026-04-07-prior-contributors-setting.png'
---

## The Notification Hell

We posted [an open bounty issue](https://github.com/archestra-ai/archestra/issues/1301) — "Support MCP Apps" — inviting the community to contribute. A $900 bounty, clear acceptance criteria, real engineering work. Within days we had legitimate contributors proposing plans, asking questions, submitting attempts.

Then the bots arrived.

![Issues backlog](/blog/2026-04-07-prior-contributors-issues.png)

Spam accounts started flooding the comments. Not just on this issue — across the repo. Every spam comment triggered a notification for every team member watching the repo. Our GitHub notifications became a wall of noise. Real conversations from contributors like @ethanwater, @developerfred, and @Geetk172 — people actively working on the bounty — were getting buried.

When you have 250+ open issues and a team that relies on GitHub notifications to stay in sync, this isn't a minor annoyance. It breaks your workflow.

## The Nuclear Option That Worked Too Well

GitHub has a setting called **"Limit to prior contributors."** Simple rule: if you haven't previously committed to `main`, you can't comment on issues or PRs.

![Prior contributors setting](/blog/2026-04-07-prior-contributors-setting.png)

We flipped it on. Spam stopped instantly. Notifications were clean again.

But then a contributor who'd been actively working on the MCP Apps bounty messaged me: they couldn't comment anymore. They saw this:

![Locked comment box](/blog/2026-04-07-prior-contributors-locked.png)

The setting can't tell the difference between a spam bot and a real developer who signed up to work on a bounty. Both are "not prior contributors." Both get locked out.

We'd traded one problem for another.

## The Trick: A Commit on Their Behalf

GitHub defines "prior contributor" as someone whose GitHub account is the **author** of a commit on `main`. The key insight is that Git commits have two identity fields — **author** and **committer** — and they can be different people.

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

## The Full Flow

Doing this manually in a terminal doesn't scale. So we automated it:

1. **A signup form on our website with a CAPTCHA.** The contributor enters their GitHub handle and proves they're human — which is the whole point.
2. **A GitHub Action** that fires on submission, looks up the user's GitHub ID, adds their handle to an `EXTERNAL_CONTRIBUTORS.md` file, and pushes a commit to `main` authored under their account.

Thirty seconds from form submission to full access.

The CAPTCHA is doing the job that GitHub's own account creation should be doing better. The spam bots that flooded our issues all had real GitHub accounts — GitHub let them through. Our form doesn't.

## The Takeaway

GitHub's "Limit to prior contributors" is a blunt instrument. It solves spam by cutting off everyone who isn't already inside the gate. There's no middle ground — no "can comment but can't push code" permission, no way to allowlist specific users for issue interaction.

Our workaround — a CAPTCHA-gated form that creates a commit on the user's behalf — fills that gap. It's not elegant, but it lets us keep the spam filter on while still running open bounties and accepting community contributions.

If you're running an open-source project that's big enough to attract spam but small enough that you can't afford to lose real contributors, this might save you some pain.
