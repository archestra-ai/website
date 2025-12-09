---
title: 'One Month: From v0.0.1 to v0.6.25'
date: '2025-12-09'
author: 'Matvey Kukuy, CEO'
excerpt: "379 PRs, 2 new team members, and 4 major features - here's what we've been building at Archestra"
image: '/blog/2025-12-09-platform-evolvement-image5.jpg'
---

We've been a bit quiet here on the blog for the last month, and I feel like I owe you all an update. In short, it's been **a lot**.

- We've merged **379 PRs** to Archestra!
- **Two people** joined the core team
- We've released **four major features**
- **13 contributors** merged code to the upstream

## A Month Ago: Security Engine

A month ago Archestra was 100% an AI security engine. At the end of October, we were invited to GitHub Friday to demo our security engine to mitigate "The Lethal Trifecta" vulnerability. First, we tricked the AI into leaking sensitive data. Once we connected N8N via Archestra, it successfully prevented the leak:

<iframe width="560" height="315" src="https://www.youtube.com/embed/SkmluS-xzmM?si=zjTk5TVzOMpo7sx9&amp;start=1918" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🆕 Cloud-Native MCP Orchestrator for Kubernetes

We've built a cloud-native MCP orchestrator ready to work at scale for a multi-team enterprise environment. We've solved tons of complexity by storing secrets in [Vault](https://archestra.ai/docs/platform-secrets-management), supporting Streamable HTTP, SSE, Stdio, Remote MCP servers, and wiring it up with RBAC...

![MCP Orchestrator](/blog/2025-12-09-platform-evolvement-image1.png)

## 🆕 Chat UI

Archestra is designed to be the centralized AI platform for your company, and we didn't expect end-users to use it directly—more as a middleman or gateway. After we realized that Archestra was managing MCP servers, secrets, etc., we added a nice, user-friendly chat UI, and **eventually Archestra became a nice place to talk to your data via MCP**.

Want to create an agent that speaks to BambooHR, ServiceNow, Jira, and MS Teams, and give it to your manager? That's it.

![Chat UI](/blog/2025-12-09-platform-evolvement-image2.png)

## 🆕 Internal MCP Registry with Governance

A central place to add "approved" MCP servers. We've put a lot of effort into making this UI friendly. The nice thing is that it supports self-made MCP servers, making it an easy way to deploy your MCP and share it with colleagues, yay!

![MCP Registry](/blog/2025-12-09-platform-evolvement-image3.png)

## 🆕 Cost Monitoring, Token Compressor, Model Optimizer, and Observability

Token spending is a significant topic, and we had to respond accordingly: a full-fledged token observability and optimization suite, including:

- Dynamic model switching
- Token-based compression
- Cost monitoring UI
- OpenTelemetry traces
- Prometheus metrics

![Cost Monitoring](/blog/2025-12-09-platform-evolvement-image4.png)

## A Few Words About the Company

Two outstanding engineers joined us:

- **Innokentii**, previously a Grafana Mimir and OnCall contributor, finally relocated from Singapore and joined us in London
- **Anna** joined us in Berlin, transitioning from OSS contributor to a full-time core team member 🎉

We visited KubeCon NA Atlanta, and "Wow!" We're so impressed by your warm welcome, especially when you came to our booth and said, "Aha! That's exactly what we've been looking for!"

Thank you for your support! Now it's time to get back to building 💪
