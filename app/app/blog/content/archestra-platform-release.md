---
title: 'Archestra Platform: The Open-Source Agentic Gateway for Secure AI'
date: '2025-10-13'
author: 'Matvey Kukuy, CEO'
description: 'The first release of the Archestra Platform, our open-source agentic gateway built to secure your AI agents'
image: '/blog/platform-launch.png'
---

Today, I am thrilled to announce the first official release of the **Archestra Platform**, our open-source agentic gateway built to secure your AI agents from the ground up.

Check it out on GitHub: [https://github.com/archestra-ai/archestra](https://github.com/archestra-ai/archestra)

The rise of autonomous AI agents has unlocked incredible potential, but it has also exposed a new and critical attack surface. For months, our team has been deeply researching the vulnerabilities inherent in AI agent architectures. We’ve seen how easily they can be manipulated through prompt injection, data poisoning, and unauthorized tool access.

Our key realization? Many of these threats can be neutralized before they ever reach the agent's core logic — at the network layer.

This principle is the foundation of Archestra.

## A New Layer of Defense for AI Agents

Archestra is an agentic gateway that sits between your application and your Language Models, acting as a smart, security-aware router for AI-driven workflows.

This first release introduces two powerful, core security mechanics:

**1. The Dynamic Tool Engine**

Our **Dynamic Tool Engine** takes a deterministic, 100% reliable approach. It dynamically manages the set of available tools based on the source of the incoming data and the current context. If a request originates from an untrusted external source, sensitive tools like `execute_code` or `send_email` can be completely hidden from the agent’s view for that specific turn. This context-aware policy enforcement ensures that your agent only has access to the tools it’s supposed to, when it's supposed to.

Learn more in our documentation: [Dynamic Tools Deep Dive](https://www.archestra.ai/docs/platform-dynamic-tools).

**2. Dual LLM Sub-agent**

How can you trust the data your agent processes? **Dual LLM** sub-agent acts as a security guard. Before the primary agent ever sees the context, this "guardian" LLM inspects and extracts the data for the main agent. It's also 100% reliable approach because untrusted data never reaches the main agent without a static validation.

Learn more in our documentation: [Dual LLM Sub-agent](https://www.archestra.ai/docs/platform-dual-llm).

And this is just the beginning. We're already hard at work on the next wave of security features to make Archestra the definitive security layer for the agentic era.

## Built for Developers, Ready for Production

We designed Archestra to be powerful, flexible, and easy to adopt.

- **It's Fast:** Built for high-throughput, low-latency performance to keep your applications responsive.
- **On-Premises & Private:** Deploy it in your own Kubernetes cluster for maximum control and data privacy.
- **Framework Agnostic:** Archestra works seamlessly with LangChain, LlamaIndex, PydanticAI, OpenWebUI, and virtually any framework that allows you to change the LLM inference URL.
- **Open-Source:** We believe security should be transparent and community-driven. We invite you to explore the code, contribute, and help us build a more secure AI ecosystem.

## Get Started Today

We are incredibly excited to share our work with the community and see what you build with it.

- **Explore & Star the Repo:** [**GitHub**](https://github.com/archestra-ai/archestra)!
- **Book a Live Demo:** Curious to see Archestra in action? I’d be happy to walk you through a personal demo. [**Schedule a time here**](https://calendly.com/d/cswr-dwp-tsr/archestra-demo).

Thank you for being part of this journey. We can't wait to build the future of secure AI, together.
