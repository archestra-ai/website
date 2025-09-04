---
title: OAuth Providers
category: Supporting Your MCP Server
order: 2
tags: [development, setup, quickstart]
lastUpdated: 2025-01-25
---

This guide shows you how to add OAuth providers (like Jira, LinkedIn, MS Teams) to Archestra using standard OAuth 2.0 flows with PKCE security.

## Architecture Overview

Archestra uses a secure two-tier OAuth system with automatic endpoint discovery:

```
Desktop App (Discovery + PKCE) → OAuth Proxy (Secret Injection) → Provider API
```

**How it works:**

1. **Desktop App** performs OAuth discovery, manages provider-specific logic, initiates PKCE flows, and stores tokens as environment variables for MCP servers
2. **OAuth Proxy** acts as a generic service that injects client secrets into token requests for any endpoint specified by the desktop app
3. **Provider** is the external OAuth service (Google, Slack, Jira, etc.)

**Security benefits:**

- Desktop app never sees OAuth client secrets - they're kept secure in the OAuth proxy
- All OAuth complexity is handled by the desktop app
- The proxy is a simple ~400-line generic service

### OAuth Discovery (RFC 8414)

The desktop app automatically discovers OAuth endpoints using standard `.well-known` endpoints:

- `/.well-known/oauth-authorization-server` (preferred)
- `/.well-known/openid_configuration` (fallback)

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

## Add a new OAuth provider

Here's how to add a new OAuth provider to Archestra using Jira as an example:

### 1. Create a local MCP server for testing

Find the MCP server JSON in the catalog, e.g. https://github.com/archestra-ai/website/blob/main/app/app/mcp-catalog/data/mcp-evaluations/korotovsky__slack-mcp-server.json

Copy the file (or create a new one) to `desktop_app/src/ui/catalog_local`. The MCP server will appear on the "Connections" page with a purple "Developer" tag, allowing you to modify and work with it without running the catalog

### 2. Configure the OAuth proxy

The OAuth proxy injects client secrets into token requests for any endpoint specified by the desktop app.

#### Add provider to allowlist

> **Note**: The OAuth proxy validates endpoints against a provider allowlist to prevent SSRF attacks.

Add your provider to the OAuth proxy's provider configuration:

```javascript
// oauth_proxy/src/config/providers.js
export const TRUSTED_PROVIDERS = {
  google: ['oauth2.googleapis.com', 'accounts.google.com'],
  slack: ['slack.com', 'api.slack.com'],
  jira: ['auth.atlassian.com'], // Add your new provider
  // ... other providers
};
```

#### Add your OAuth credentials

Add your OAuth app credentials to the proxy's environment (use pattern `PROVIDER_CLIENT_ID` and `PROVIDER_CLIENT_SECRET`):

```bash
# oauth_proxy/.env
JIRA_CLIENT_ID=your-client-id-from-jira
JIRA_CLIENT_SECRET=your-client-secret-from-jira
```

> **Note**: The provider name in the allowlist must match the provider name used in your MCP server catalog configuration. The proxy will only accept token endpoints from the allowed hostnames for each provider, preventing SSRF attacks.

### 3. Create desktop app provider definition

All OAuth logic is handled in the desktop app.

#### Create the provider definition

Create a new file for your provider with OAuth discovery configuration:

```typescript
// desktop_app/src/backend/server/plugins/oauth/providers/jira.ts
import { OAuthProviderDefinition } from '../provider-interface';

export const jiraProvider: OAuthProviderDefinition = {
  name: 'jira',
  scopes: ['read:jira-user', 'write:jira-work'], // Permissions your MCP server needs
  usePKCE: true, // Use PKCE for security (recommended)
  clientId: 'your-public-client-id', // Public client ID (not secret!)

  // Map OAuth tokens to environment variable names
  // These will be available to your MCP server
  tokenEnvVarPattern: {
    accessToken: 'JIRA_ACCESS_TOKEN',
    refreshToken: 'JIRA_REFRESH_TOKEN',
    expiryDate: 'JIRA_TOKEN_EXPIRY',
  },

  // Additional authorization parameters
  authorizationParams: {
    audience: 'api.atlassian.com', // API audience
    prompt: 'consent', // Always show consent screen
    access_type: 'offline', // Request refresh token
  },

  // OAuth discovery configuration
  discoveryConfig: {
    baseUrl: 'https://auth.atlassian.com',
    enabled: true,
    fallbackEndpoints: {
      authorization: 'https://auth.atlassian.com/authorize',
      token: 'https://auth.atlassian.com/oauth/token',
      revocation: 'https://auth.atlassian.com/oauth/revoke',
    },
  },

  metadata: {
    displayName: 'Jira',
    documentationUrl: 'https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/',
    supportsRefresh: true,
    notes: 'Uses OAuth discovery with fallback endpoints. Supports automatic endpoint discovery per RFC 8414.',
  },
};
```

#### Register the provider

Add your provider to the registry:

```typescript
// desktop_app/src/backend/server/plugins/oauth/providers.ts
import { jiraProvider } from './providers/jira';

export const oauthProviders: OAuthProviderRegistry = {
  google: googleProvider,
  slack: slackProvider,
  'slack-browser': slackBrowserProvider,
  'linkedin-browser': linkedinBrowserProvider,
  jira: jiraProvider, // Add your new provider
};
```

Also export it from the index:

```typescript
// desktop_app/src/backend/server/plugins/oauth/index.ts
export {
  // ... existing exports
  jiraProvider,
} from './providers';
```

### 4. Test the OAuth flow

When users install your MCP server:

1. The UI detects `oauth.required: true` and `provider: "jira"`
2. Desktop app performs OAuth discovery for Jira's endpoints
3. Starts the OAuth flow with discovered or fallback endpoints
4. OAuth proxy receives the discovered `token_endpoint` and makes the token exchange
5. After successful authentication, tokens are stored and passed to the MCP server as environment variables

You're all set! Your MCP server should now appear in Settings → Servers with OAuth authentication working.

## Advanced Configuration

### File-based credentials

Some MCP servers need credentials written to a file instead of environment variables:

```typescript
// In your provider definition
tokenHandler: async (tokens, serverId) => {
  // Create a credentials file format your MCP server expects
  const credentials = {
    type: 'authorized_user',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry: tokens.expires_at,
  };

  // Write to a specific path in the container
  await writeFileToContainer(serverId, '/home/appuser/.jira/credentials.json', JSON.stringify(credentials, null, 2));

  // Don't return env vars since we're using a file
  return {};
};
```

### Provider-specific token parameters

The desktop app can pass provider-specific parameters to the OAuth proxy:

```typescript
// Desktop app automatically includes provider-specific authorization parameters
// in the token exchange request to the OAuth proxy

authorizationParams: {
  audience: 'api.atlassian.com',
  prompt: 'consent',
  access_type: 'offline',
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
