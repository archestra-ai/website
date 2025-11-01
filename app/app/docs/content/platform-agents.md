---
title: Agents
category: Archestra Platform
subcategory: Concepts
order: 1
description: Understanding and configuring agents in Archestra Platform
lastUpdated: 2025-10-17
---

Agents are the core concept in Archestra Platform. Each agent represents a distinct AI application or workflow that you want to secure and monitor. Think of an agent as a logical grouping for:

- **Interaction history** - All LLM requests and responses
- **Tool configurations** - Which tools the agent has access to
- **Security policies** - Tool invocation and trusted data policies specific to this agent
- **Analytics** - Performance metrics and security events

## Why Use Agents?

Using agents provides several benefits:

1. **Isolation** - Keep different AI applications separate with their own policies
2. **Monitoring** - Track interactions and security events per application
3. **Flexibility** - Apply different security rules to different use cases

## Agent Labels

Agent labels are a powerful feature that can be used to organize and categorize your agents.

Beyond organization, labels also play a crucial role in observability. Read more about how to use labels for observability [here](/docs/platform-observability).
