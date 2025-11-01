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

## Agent Labels and Observability

Agent labels are a powerful feature that can be used to organize and categorize your agents. Beyond organization, labels also play a crucial role in observability.

### Trace Attributes

When you add labels to an agent, those labels are automatically added as attributes to every trace for requests handled by that agent. This makes it easy to filter and analyze traces in your observability tools.

For example, if you add these labels to an agent:

- `environment`: `production`
- `team`: `data-science`
- `cost-center`: `research`

Every trace for that agent will have these attributes:

- `agent.environment=production`
- `agent.team=data-science`
- `agent.cost-center=research`

### Prometheus Metrics

Agent labels also enhance your Prometheus metrics. The `agent_name` label is included in all LLM-related metrics, making it easy to monitor usage and performance per agent.
