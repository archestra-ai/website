---
title: Authentication with OAuth
category: Development
subcategory: MCP Authentication
order: 6
---

This guide explains how to add OAuth authentication to MCP servers in Archestra. There are 4 distinct types of OAuth implementations, each with different configuration requirements.

## Quick Reference - OAuth Types

| Type                               | DCR | Proxy Required | Key Features                            |
| ---------------------------------- | --- | -------------- | --------------------------------------- |
| **Type 1: Generic OAuth 2.0**      | ❌  | ✅             | Standard OAuth flow, env var injection  |
| **Type 2: MCP OAuth without DCR**  | ❌  | ✅             | MCP SDK flow, static client credentials |
| **Type 3: Remote MCP without DCR** | ❌  | ✅             | Remote server, static credentials       |
| **Type 4: Remote MCP with DCR**    | ✅  | ❌             | Dynamic client registration             |

**DCR (Dynamic Client Registration):** A protocol that allows OAuth clients to register themselves dynamically with an authorization server at runtime, eliminating the need to manually configure client credentials beforehand.

**MCP OAuth 2.1:** The Model Context Protocol's authorization specification for secure client-server communication. [View specification →](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)

## Architecture Overview

Archestra uses a secure two-tier OAuth system:

```
Desktop App (PKCE + Flow Management) →
  OAuth Proxy (Secret Injection) →
    Provider API
```

**Components:**

1. **Desktop App** - Manages OAuth flows, PKCE, token storage, and MCP server lifecycle
2. **OAuth Proxy** - Securely injects client secrets for providers that don't support DCR
3. **Provider API** - The external OAuth service (Google, Slack, GitHub, etc.)

**Security benefits:**

- Desktop app never sees OAuth client secrets - they're kept secure in the OAuth proxy
- All OAuth complexity is handled by the desktop app
- The proxy is a simple ~400-line generic service

## Developer Quickstart

1. Clone the repository and set up the OAuth proxy:

```bash
git clone https://github.com/archestra-ai/archestra
cd oauth_proxy
cp .env.example .env
pnpm install
pnpm start
```

2. (Optional) Set up HTTPS tunneling for providers that require it:

```bash
ngrok http 8080  # Some providers like Slack require HTTPS
```

3. Start the desktop application:

```bash
cd desktop_app
# Make sure OAUTH_PROXY_URL in .env points to your proxy URL
# http://localhost:8080 or https://your-ngrok-url.ngrok.io
pnpm install
pnpm start
```

4. The desktop app will start automatically. OAuth discovery works automatically for supported providers.

Try it with an existing OAuth provider:

1. Open Connectors
2. Find a server with OAuth (like Google MCP)
3. Click "Install (OAuth)"
4. Complete the OAuth flow in your browser
5. Navigate to Servers and find your installed MCP server

## Adding New OAuth MCP Servers

To add a new OAuth-enabled MCP server, first identify which type it is from the quick reference table above, then follow the appropriate guide below.

### Local Development Setup

1. Create or copy a server JSON file to `desktop_app/src/ui/catalog_local/`
2. The server will appear on the "Connections" page with a purple "Developer" tag
3. This allows you to test without deploying to the catalog

## Type 1: Generic OAuth 2.0 (Slack Example)

Standard OAuth 2.0 flow for providers that don't support MCP SDK OAuth.

### Configuration Structure

```json
{
  "oauth_config": {
    "name": "Slack MCP",
    "server_url": "https://slack.com/oauth/v2/authorize",
    "token_endpoint": "https://slack.com/api/oauth.v2.access",
    "client_id": "9210991658150.9211748349222",
    "client_secret": "REDACTED",
    "redirect_uris": ["https://oauth.dev.archestra.ai/oauth/callback", "http://localhost:8080/oauth/callback"],
    "scopes": ["channels:read", "chat:write", "users:read"],
    "default_scopes": ["channels:read", "chat:write", "users:read"],
    "generic_oauth": true,
    "access_token_env_var": "SLACK_MCP_XOXP_TOKEN",
    "requires_proxy": true
  },
  "archestra_config": {
    "oauth": {
      "provider": null,
      "required": true
    },
    "works_in_archestra": true
  }
}
```

**Key fields:**

- `server_url` - OAuth authorization endpoint
- `token_endpoint` - OAuth token exchange endpoint
- `client_id` - Get from provider's app page (e.g., https://api.slack.com/apps)
- `client_secret` - Always use "REDACTED" (proxy will inject real secret)
- `redirect_uris` - OAuth callback URLs (first one is used)
- `generic_oauth: true` - Use standard OAuth 2.0 instead of MCP OAuth 2.1
- `access_token_env_var` - Optional: inject token as env var instead of Authorization header
- `requires_proxy: true` - Routes through OAuth proxy for secret injection

## Type 2: MCP OAuth without DCR (Google Workspace Example)

MCP SDK OAuth 2.1 with static client credentials.

### Configuration Structure

```json
{
  "oauth_config": {
    "name": "Google OAuth",
    "server_url": "https://accounts.google.com",
    "client_id": "354887056155-5b4rlcofccknibd4fv3ldud9vvac3rdf.apps.googleusercontent.com",
    "client_secret": "REDACTED",
    "redirect_uris": ["https://oauth.dev.archestra.ai/oauth/callback"],
    "scopes": ["openid", "email", "profile", "https://www.googleapis.com/auth/gmail.readonly"],
    "well_known_url": "https://accounts.google.com/.well-known/openid-configuration",
    "supports_resource_metadata": false,
    "requires_proxy": true
  },
  "server": {
    "command": "uvx",
    "args": ["--from", "git+https://github.com/...", "workspace-mcp"],
    "env": {
      "MCP_ENABLE_OAUTH21": "true",
      "MCP_TOKEN_ONLY_MODE": "true"
    }
  }
}
```

**Key differences from Type 1:**

- No `generic_oauth` flag (uses MCP SDK OAuth)
- `well_known_url` for OAuth discovery
- Server env vars enable MCP OAuth 2.1 mode

## Type 3: Remote MCP without DCR (GitHub Copilot Example)

Remote MCP server with static OAuth credentials.

### Configuration Structure

```json
{
  "remote_url": "https://api.githubcopilot.com/mcp/",
  "oauth_config": {
    "name": "GitHub Copilot MCP",
    "server_url": "https://api.githubcopilot.com/mcp",
    "client_id": "Ov23li3CnHLM7PNQ2Xiv",
    "client_secret": "REDACTED",
    "redirect_uris": ["https://oauth.dev.archestra.ai/oauth/callback", "http://localhost:8080/oauth/callback"],
    "scopes": ["read", "write"],
    "supports_resource_metadata": true,
    "requires_proxy": true
  },
  "server": {
    "command": "remote",
    "args": [],
    "env": {}
  }
}
```

**Key differences:**

- `remote_url` field indicates remote MCP server
- `server.command: "remote"` tells Archestra this is remote
- Still requires proxy for secret injection

## Type 4: Remote MCP with DCR (Linear Example)

Remote MCP server supporting Dynamic Client Registration - no proxy needed!

### Configuration Structure

```json
{
  "remote_url": "https://mcp.linear.app/mcp",
  "oauth_config": {
    "name": "Linear MCP",
    "server_url": "https://mcp.linear.app/mcp",
    "client_id": "",
    "redirect_uris": ["http://localhost:8080/oauth/callback"],
    "scopes": ["read", "write"],
    "supports_resource_metadata": true
  },
  "server": {
    "command": "remote",
    "args": [],
    "env": {}
  }
}
```

**Key differences:**

- Empty `client_id` - will be dynamically registered
- No `client_secret` field
- No `requires_proxy` - DCR handles credentials

## OAuth Proxy Configuration (Types 1-3 Only)

The OAuth proxy securely stores and injects client secrets. Type 4 (DCR) doesn't need proxy configuration.

### 1. Add Provider to Allowlist

Edit `oauth_proxy/src/config/providers.js`:

```javascript
export const ALLOWED_DESTINATIONS = [
  'oauth2.googleapis.com',
  'accounts.google.com',
  'slack.com',
  'api.slack.com',
  'github.com',
  'api.githubcopilot.com',
  'your-provider.com', // Add your provider's domain
  // ...
];
```

### 2. Add OAuth Credentials

Add credentials to `oauth_proxy/.env` using this pattern:

- Pattern: `{mcp_server_id}_CLIENT_ID` and `{mcp_server_id}_SECRET`
- The `mcp_server_id` comes from your server JSON filename

```bash
# oauth_proxy/.env

# Type 1: Slack (Generic OAuth)
korotovsky__slack-mcp-server_CLIENT_ID=your-slack-client-id
korotovsky__slack-mcp-server_SECRET=your-slack-client-secret

# Type 2: Google Workspace (MCP OAuth)
iskhakov__google_workspace_mcp_CLIENT_ID=your-google-client-id
iskhakov__google_workspace_mcp_SECRET=your-google-client-secret

# Type 3: GitHub Copilot (Remote MCP)
githubcopilot__remote-mcp_CLIENT_ID=your-github-client-id
githubcopilot__remote-mcp_SECRET=your-github-client-secret

# Type 4: Linear (DCR) - No proxy credentials needed!
```

### 3. Start OAuth Proxy

```bash
cd oauth_proxy
pnpm install
pnpm start  # Runs on http://localhost:8080
```

## Testing Your OAuth Integration

1. **Place your server JSON** in `desktop_app/src/ui/catalog_local/`
2. **Start the desktop app**: `cd desktop_app && pnpm start`
3. **Navigate to Connections** - find your server with purple "Developer" tag
4. **Click "Install (OAuth)"** - browser opens for authorization
5. **Complete OAuth flow** - tokens are stored and server starts
6. **Check Settings → Servers** - verify server is running

## OAuth Flow Details

### Type 1 (Generic OAuth):

1. Desktop app opens browser with authorization URL
2. User authorizes in browser
3. OAuth proxy receives callback via deep link
4. Proxy exchanges code for tokens (injecting secret)
5. Tokens stored, optionally injected as env vars

### Types 2-3 (MCP OAuth):

1. MCP SDK discovers OAuth endpoints via `.well-known`
2. PKCE flow initiated with code verifier
3. OAuth proxy handles token exchange with secret injection
4. Tokens stored in database, passed via Authorization header

### Type 4 (DCR):

1. MCP SDK registers client dynamically
2. Standard OAuth flow without proxy
3. Client credentials stored for reuse

## Common Configuration Patterns

### Environment Variable Injection (Type 1)

Some servers need tokens as environment variables instead of Authorization headers:

```json
{
  "oauth_config": {
    "access_token_env_var": "SLACK_MCP_XOXP_TOKEN"
    // Token will be injected as this env var
  }
}
```

### File-based Credentials

For servers that read credentials from files:

```json
{
  "server": {
    "inject_file": {
      "/home/appuser/.credentials/token.json": "{\"access_token\": \"${access_token}\"}"
    }
  }
}
```

### Scope Discovery

Type 2 servers can discover scopes automatically:

```json
{
  "oauth_config": {
    "supports_resource_metadata": true,
    "well_known_url": "https://accounts.google.com/.well-known/openid-configuration"
  }
}
```

## Debugging and Cleanup

### Container management commands

List all containers (including stopped ones):

```bash
./desktop_app/resources/bin/mac/arm64/podman-remote-static-v5.5.2 container ls --all
```

Remove all containers (force removal):

```bash
./desktop_app/resources/bin/mac/arm64/podman-remote-static-v5.5.2 rm -a -f
```

Access a running container for debugging:

```bash
./desktop_app/resources/bin/mac/arm64/podman-remote-static-v5.5.2 exec -it CONTAINER_ID sh
```

Replace `CONTAINER_ID` with your actual container ID from the `container ls` command.

Check stored tokens in database:

```bash
cd desktop_app
pnpm db:studio  # Open Drizzle Studio, check mcp_servers table
```
