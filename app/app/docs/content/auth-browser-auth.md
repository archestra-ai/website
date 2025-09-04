---
title: Browser-Based Authentication
category: Supporting Your MCP Server
order: 3
tags: [development, setup, quickstart]
lastUpdated: 2025-01-25
---

## Developer Quickstart

This guide covers how to add authentication to mcp server using built-in browser, by extracting tokens and cookies from the service

Clone the repository and start the app:

```bash
git clone https://github.com/archestra-ai/archestra
cd desktop-app
pnpm install
pnpm start
```

Open the app, navigate to LLM Providers → Ollama and download `gpt-oss:20b`, `qwen3:8b` or `qwen3:14b`

Try installing an existing MCP server with browser auth:

1. Open Connectors
2. Find Slack MCP server
3. Click on "Install (Browser)"
4. Log in with your email/password, choose workspace, click "use Slack in your browser"
5. Navigate to Servers and find your installed MCP server
6. Open "+ New chat", ensure you have a capable LLM model (either cloud-based models or Ollama's `gpt-oss:20b`, `qwen3:8b`, etc.)
7. Prompt it with "read last messages in #general"

## Add a new provider

Here's how a browser-based auth provider was added to the Slack MCP Server (https://www.archestra.ai/mcp-catalog/korotovsky__slack-mcp-server)

1. First, follow the MCP server's readme and start the MCP server locally with the MCP inspector (https://modelcontextprotocol.io/legacy/tools/inspector) to verify it works before adding to Archestra

2. Find the MCP server JSON in the catalog: https://github.com/archestra-ai/website/blob/main/app/app/mcp-catalog/data/mcp-evaluations/korotovsky__slack-mcp-server.json

3. Copy the file (or create a new one) to `desktop_app/src/ui/catalog_local`. The MCP server will appear on the "Connections" page with a purple "Developer" tag, allowing you to modify and work with it without running the catalog

4. Ensure that `server.mcp_config` or `server_overridden.mcp_config` is correct and matches the configuration you ran in step 1

```json
  "mcp_config": {
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      "env": {
        "SLACK_MCP_XOXC_TOKEN": "${user_config.slack_mcp_xoxc_token}",
        "SLACK_MCP_XOXD_TOKEN": "${user_config.slack_mcp_xoxd_token}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "${user_config.slack_mcp_add_message_tool}"
      }
    }
```

5. Find the `archestra_config` section and add `browser_based.required: true`

```json
  "archestra_config": {
  ...
    "oauth": {
      "provider": "slack",
      "required": true
    },
    "browser_based": {
      "required": true
    }
    ...
  }
```

6. Create a Browser Provider Definition
   Create [`desktop_app/src/backend/server/plugins/oauth/providers/slack-browser.ts`](https://github.com/archestra-ai/archestra/blob/main/desktop_app/src/backend/server/plugins/oauth/providers/slack-browser.ts), following the pattern "`<provider_name>-browser.ts`". This defines how authentication works: where to navigate, how to extract tokens or cookies, which URLs are allowed, which ENV variables to add to container.
7. (Optional) Add a utility for your browser provider if it needs complex token extraction logic. Here's an example for Slack: [`desktop_app/src/backend/server/plugins/oauth/utils/slack-token-extractor.ts`](https://github.com/archestra-ai/archestra/blob/main/desktop_app/src/backend/server/plugins/oauth/utils/slack-token-extractor.ts)
8. Update the Provider Registry: [`desktop_app/src/backend/server/plugins/oauth/providers.ts`](https://github.com/archestra-ai/archestra/blob/main/desktop_app/src/backend/server/plugins/oauth/providers.ts)

   > NOTE: Add `'slack-browser': slackBrowserProvider,` to oauthProviders, and don't forget to re-export it in the end of the file

9. After launching the app, click "Install (Browser)" and log in. Tokens will be extracted and stored in the database along with the catalog configs. You can run `pnpm db:studio` to view the `mcp_servers` table

10. Podman detects the new database entry and starts the container with the MCP server. Use the following commands to debug the container (make sure to use our binary, otherwise you won't be able to access it):

```bash
./desktop_app/resources/bin/mac/arm64/podman-remote-static-v5.5.2 container ls --all
./desktop_app/resources/bin/mac/arm64/podman-remote-static-v5.5.2 rm -a -f
./desktop_app/resources/bin/mac/arm64/podman-remote-static-v5.5.2 exec -it CONTAINER_ID sh
```

11. You're all set! Your MCP server should now appear in Settings → Servers, and its tools should be available in chat. Verify that tool calling works as expected.
