---
title: Quickstart
category: Archestra Platform
order: 1
description: Get started with Archestra Platform using Docker
lastUpdated: 2025-10-08
---

## Running the Archestra Platform

<iframe width="560" height="315" src="https://www.youtube.com/embed/SkmluS-xzmM?si=zjTk5TVzOMpo7sx9&amp;start=1918" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

1. Start with Docker

   ```bash
   docker run -p 9000:9000 -p 3000:3000 archestra/platform
   ```

2. Open <http://localhost:3000>

3. The platform is now running with:
   - Web UI at <http://localhost:3000>
   - API proxy at <http://localhost:9000>

## Connecting Your Agent

To connect your AI application to Archestra, you'll need to configure it to use Archestra as a proxy.

### Quick Start

For the fastest setup, use the default agent configuration:

```text
http://localhost:9000/v1/{provider}
```

Replace `{provider}` with your LLM provider (`openai`, `anthropic`, etc.). This will automatically create or use a default agent based on your `User-Agent` header.

### Using Specific Agents

For production applications, we recommend creating dedicated agents for better organization and policy management. See [Agents](https://www.archestra.ai/docs/platform-agents) for details on creating and managing agents.

### Supported Providers

Archestra supports multiple LLM providers. Learn more about [Supported LLM Providers](https://www.archestra.ai/docs/platform-supported-llm-providers) including OpenAI, Anthropic, and more

## Next Steps

Now that you have Archestra running, you can:

1. **Create an Agent** - Learn about [Agents](https://www.archestra.ai/docs/platform-agents) and how to configure them for your applications

2. **Understand the threats** - Learn about [The Lethal Trifecta](https://www.archestra.ai/docs/platform-lethal-trifecta) that Archestra protects against

3. **Configure security policies** - Set up [Dynamic Tools](https://www.archestra.ai/docs/platform-dynamic-tools#mark-tools) to control which tools can be invoked and when

4. **Monitor your agents** - View interaction logs, tool calls, and security events in the Archestra UI

5. **Explore examples** - Check out practical examples:
   - [Vercel AI SDK](https://www.archestra.ai/docs/platform-vercel-ai-example)
   - [Pydantic AI](https://www.archestra.ai/docs/platform-pydantic-example)
   - [N8N](https://www.archestra.ai/docs/platform-n8n-example)
   - [LangChain](https://www.archestra.ai/docs/platform-langchain-example)
   - [OpenWebUI](https://www.archestra.ai/docs/platform-openwebui-example)

6. [Join the Slack community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg) to talk to the developers and get assistance!
