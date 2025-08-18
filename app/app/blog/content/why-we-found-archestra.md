---
title: 'Why We Found Archestra'
date: '2025-08-11'
author: 'Matvey Kukuy, CEO'
description: "Why can't an AI draft 150 personalized emails to investors for my new startup?"
---

A while back, I reached out to Ildar and Joey—two of the best engineers I know with a simple question. It sounded naive, and I thought the answer would be easy.

"Why can't an AI draft 150 personalized emails to investors for my new startup?"

The simple answer: the emails would sound annoyingly generic, and investors would do what they always do with emails like that (and I don't mean read them carefully).

The real answer is a bit more complicated. It's not about generating useless emails, it's about why I (and you) won't let AI send them on my behalf.

## The Real AI-Data Access Problem

My human process while writing emails isn't so different from what an AI agent *should* do. I'm just better at querying data from LinkedIn and my old notes, meaning that if we want AI to perform at its best, we need to give it **more high-quality context**.

But here's the catch: AI is almost useless if it can only read data. To be truly helpful, it needs to **write** data—send those emails. And obviously emails aren't enough, I'm talking about creating the calendar events, updating the database, issuing invoices, updating the CRM...

And that's where the real trouble begins. And I'm not speaking about the risk of making someone laugh because your EMail will sound dumb. I'm speaking about real-world security issues, autonomous agents, able to write data, bring: [agents being tricked into leaking a database](https://simonwillison.net/2025/Jul/6/supabase-mcp-lethal-trifecta/), to [exposing private GitHub repositories](https://simonwillison.net/2025/May/26/github-mcp-exploited/).

![More access — more risk!](/blog/03.jpg)

The security risks are so massive that [Anthropic won't even let Claude create a Google Calendar event](https://support.anthropic.com/en/articles/11088742-using-the-gmail-and-google-calendar-integrations) through its integration. Reading is fine; writing is just too dangerous.

## Every 10th MCP Server is Developed by a Solo Engineer Only

The last nail in the coffin of Autonomous Agents is that the leading technology for connecting AI to data today is a protocol called "MCP", which often involves running code from an untrusted source directly on your machine! No surprise [it took me only 30 minutes to hack my own machine via Cursor.](https://www.linkedin.com/posts/motakuk_ive-been-deep-diving-into-mcp-lately-and-activity-7338973230566719488-PzDj?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAA44dvQB8BXdsAxSovZkmTCvERzW1COMW20)

How big is the problem? It's massive. [We recently executed a comprehensive analysis of the MCP environment](/mcp-catalog?sort=quality&dir=asc) and revealed that a single person develops every 10th MCP server and has so low engineering visibility that almost no one will ever notice if this person ever decides to deploy malicious code.

## Our Solution: Archestra

As you might have guessed, this problem is what Ildar, Joey, and I decided to tackle. We launched a new company called Archestra, because we believe this problem can be solved by:

1. Building a security "sandbox" for these AI connections (MCPs)
2. Focusing on workplace and enterprise use cases
3. Implementing state-of-the-art security ideas
4. Building it all open-source under the MIT license

![01](/blog/01.jpg)

We've just closed our [first $3.3M funding round](/blog/archestra-unveils-open-source-solution-announces-vc-backing), and we're building Archestra in the open. I'd love to invite you to follow our progress, join the beta, and help us shape the future of secure AI.

[Join our Slack Community to participate in Beta Testing](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg)
[Star our GitHub Repo!](https://github.com/archestra-ai/archestra)
