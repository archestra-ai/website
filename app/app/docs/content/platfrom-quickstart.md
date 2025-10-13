---
title: Quickstart
category: Archestra Platform
order: 1
description: Get started with Archestra Platform using Docker
lastUpdated: 2025-10-08
---

## Running the Archestra Platform

![Quickstart](/docs/platfrom/quickstart-1.png)

1. Start with Docker

   ```bash
   docker run -p 9000:9000 -p 3000:3000 archestra/platform
   ```

2. Open <http://localhost:3000>

3. The platform is now running with:
   - Web UI at <http://localhost:3000>
   - API proxy at <http://localhost:9000>

## Configuring an Agent

Agents are the core concept in Archestra Platform. Each agent represents a distinct AI application or workflow that you want to secure.

1. Navigate to the **Agents** page at <http://localhost:3000/agents>

2. Click **Create Agent** and give your agent a name (e.g., "My Chat Bot")

3. Copy the **Proxy URL** displayed for your agent. It will look like:

   ```text
   http://localhost:9000/v1/openai/{agent-id}
   ```

![Agents Page](/docs/platfrom/agents-page.png)

Each agent maintains its own:

- Interaction history
- Tool configurations
- Security policies

**Default Agent**: If you don't specify an agent ID in the proxy URL, Archestra will create or use a default agent based on your `User-Agent` header.

## Proxying your Agent to the Archestra Platform

To connect your AI application to Archestra, configure it to use the Archestra proxy URL instead of the OpenAI API directly.

### URL Format

Archestra supports two URL formats:

1. **Default Agent** (auto-creates based on User-Agent):

   ```text
   http://localhost:9000/v1/openai
   ```

2. **Specific Agent** (uses the agent you created):

   ```text
   http://localhost:9000/v1/openai/{agent-id}
   ```

## Next Steps

Now that your agent is connected to Archestra, you can:

1. **Understand the threats** - Learn about [The Lethal Trifecta](https://www.archestra.ai/docs/platform-lethal-trifecta) that Archestra protects against

2. **Configure security policies** - Set up [Dynamic Tools](https://www.archestra.ai/docs/platform-dynamic-tools#mark-tools) to control which tools can be invoked and when

3. **Monitor your agents** - View interaction logs, tool calls, and security events in the Archestra UI

4. **Explore examples** - Check out practical examples:
   - [Vercel AI SDK](https://www.archestra.ai/docs/platform-vercel-ai-example)
   - [Pydantic AI](https://www.archestra.ai/docs/platform-pydantic-example)
   - [N8N](https://www.archestra.ai/docs/platform-n8n-example)
   - [OpenWebUI](https://www.archestra.ai/docs/platform-openwebui-example)

5. [Join the Slack community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg) to talk to the developers and get assistance!
