---
title: Agents
category: Archestra Platform
order: 2
description: Understanding and configuring agents in Archestra Platform
lastUpdated: 2025-10-17
---

## What are Agents?

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

## Creating an Agent

There are two ways to work with agents in Archestra:

### 1. Create Agents Manually (Recommended)

You can create and manage agents through the Archestra UI:

1. Navigate to the **Agents** page at <http://localhost:3000/agents>
2. Click **Create Agent**
3. Give your agent a descriptive name (e.g., "Customer Support Bot", "Data Analysis Agent")
4. The agent is created with a unique ID

### 2. Use the Default Agent

If you don't specify an agent ID in your proxy URL, Archestra will automatically create or use a default agent based on your `User-Agent` header. This is useful for:

- Quick testing and prototyping
- Simple applications with a single agent
- Getting started without manual agent creation

## Connecting to an Agent

Once you've created an agent, you can connect your AI application to it by configuring it to use the Archestra proxy URL.

### Getting the Connection URL

1. Navigate to the **Agents** page at <http://localhost:3000/agents>
2. Find your agent in the list
3. Click the three-dot menu (⋮) next to the agent
4. Select **Connect**
5. Choose your LLM provider (OpenAI, Anthropic, etc.)
6. Copy the displayed proxy URL

### URL Formats

Archestra supports two URL formats for connecting agents:

**Agent-Specific URL** (uses the agent you created):

```text
http://localhost:9000/v1/{provider}/{agent-id}
```

**Default Agent URL** (auto-creates based on User-Agent header):

```text
http://localhost:9000/v1/{provider}
```

Replace `{provider}` with your LLM provider: `openai`, `anthropic`, etc.

### Configuration Examples

**OpenAI with Vercel AI SDK:**

```typescript
const customOpenAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'http://localhost:9000/v1/openai/{agent-id}',
}).chat;
```

## Managing Agents

### Editing Agents

To rename an agent:

1. Click the three-dot menu (⋮) next to the agent
2. Select **Edit**
3. Update the agent name
4. Click **Update agent**

### Deleting Agents

To delete an agent:

1. Click the three-dot menu (⋮) next to the agent
2. Select **Delete**
3. Confirm the deletion

⚠️ **Warning**: Deleting an agent is permanent and will remove all associated interaction history and policies.
