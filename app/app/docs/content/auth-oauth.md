---
title: OAuth Providers
category: Supporting Your MCP Server
order: 3
tags: [development, setup, quickstart]
lastUpdated: 2025-01-25
---

This guide helps you add new OAuth providers (like Jira, LinkedIn, MS Teams) to Archestra.

## Architecture Overview

Archestra uses a two-tier OAuth system for security:

```
Desktop App (PKCE) → OAuth Proxy (Secrets) → Provider API
```

- **Desktop App**: Initiates OAuth flows, stores tokens as environment variables for MCP servers
- **OAuth Proxy**: Secure service that holds client secrets and exchanges authorization codes for tokens
- **Provider**: The external OAuth service (Google, Slack, Jira, etc.)

The desktop app never sees OAuth client secrets - they're kept secure in the OAuth proxy.

## Developer Environment Quickstart

1. Clone the repo
```bash
git clone https://github.com/archestra/archestra.git
```
2. Set up and start the **OAuth proxy**
```bash
cd oauth_proxy
cp .env.example .env
npm install
npm start
ngrok http 8080  # Optionally use ngrok for https tunneling, as Slack requires
```
3. Start the **Desktop app**
> Note: Make sure OAUTH_PROXY_URL in .env points to the local OAuth proxy's URL http://localhost:8080 or https://ngrok.com/abc123
```bash
cd desktop_app
npm install
npm start
```
4. Desktop app should start automatically. You can now test your OAuth provider
5. You can try to install slack mcp with browser-based tokens or try oauth installation if you have the correct tokens in the .env file
6. Once you successfully installed the mcp server, all the configurations should appear in the `mcp_servers` table in the database (which can be accessed with `pnpm db:studio`)

## Adding a New OAuth Provider

### Step 1: Add an MCP Server to Local Developer Catalog

Instead of running the remote catalog, you can copy the catalog file from the remote catalog to the local catalog `desktop_app/src/ui/catalog_local/`, or create a new catalog file for your MCP server.

Example local catalog file:

```json
// desktop_app/src/ui/catalog_local/my-test-server.json
{
  "dxt_version": "0.1.0",
  "name": "my_company__test_mcp_server",
  "display_name": "Test MCP Server",
  "version": "1.0.0",
  "description": "A test MCP server for development",
  "category": "Development",
  "archestra_config": {
    "oauth": {
      "provider": "jira",
      "required": true
    }
  },
  "server": {
    "type": "python",
    "entry_point": "index.py",
    "mcp_config": {
      "command": "python",
      "args": ["index.py"]
    }
  }
}
```

### Step 2: OAuth Proxy Setup

The OAuth proxy is a separate service that handles the secure parts of OAuth.

#### 2.1 Add Your OAuth Credentials

First, add your OAuth app credentials to the proxy's environment:

```bash
# oauth_proxy/.env
JIRA_CLIENT_ID=your-client-id-from-jira
JIRA_CLIENT_SECRET=your-client-secret-from-jira
```

#### 2.2 Configure the Provider

Add your provider configuration to tell the proxy how to talk to your OAuth service:

```javascript
// oauth_proxy/src/config/index.js
providers: {
  jira: {
    clientId: process.env.JIRA_CLIENT_ID,
    clientSecret: process.env.JIRA_CLIENT_SECRET,
    tokenEndpoint: 'https://auth.atlassian.com/oauth/token',  // Where to exchange codes for tokens
  }
}
```

#### 2.3 Register the Provider

Most providers work with the base OAuth class. Just register it:

```javascript
// oauth_proxy/src/providers/index.js
import { OAuthProvider } from './base.js';

// This creates a 'jira' provider using the standard OAuth flow
if (config.providers.jira.clientId) {
  providers.set('jira', new OAuthProvider(config.providers.jira));
}
```

Only create a custom provider class if your OAuth service has non-standard behavior:

```javascript
// oauth_proxy/src/providers/jira.js (only if needed)
import { OAuthProvider } from './base.js';

export class JiraOAuthProvider extends OAuthProvider {
  // Override only for special cases, like:

  // Non-standard token response format
  async exchangeCode(params) {
    const response = await super.exchangeCode(params);
    // Transform response if Jira returns tokens differently
    return response;
  }

  // No refresh token support
  async refreshToken(params) {
    throw new Error('Jira tokens do not expire');
  }
}
```

### Step 3: Desktop App Integration

Now configure the desktop app to use your OAuth provider.

#### 3.1 Create Provider Definition

Create a new file for your provider:

```typescript
// desktop_app/src/backend/server/plugins/oauth/providers/jira.ts
import { OAuthProviderDefinition } from '../provider-interface';

export const jiraProvider: OAuthProviderDefinition = {
  name: 'jira',
  authorizationUrl: 'https://auth.atlassian.com/authorize', // Where users log in
  scopes: ['read:jira-user', 'write:jira-work'], // Permissions your MCP server needs
  usePKCE: true, // Use PKCE for security (recommended)
  clientId: 'your-public-client-id', // Public client ID (not secret!)

  // Map OAuth tokens to environment variable names
  // These will be available to your MCP server
  tokenEnvVarPattern: {
    accessToken: 'JIRA_ACCESS_TOKEN',
    refreshToken: 'JIRA_REFRESH_TOKEN',
  },

  metadata: {
    displayName: 'Jira',
    supportsRefresh: true, // Can tokens be refreshed?
  },
};
```

#### 3.2 Export and Register

Export your provider and add it to the registry:

```typescript
// desktop_app/src/backend/server/plugins/oauth/providers.ts
import { jiraProvider } from './providers/jira';

// desktop_app/src/backend/server/plugins/oauth/providers/index.ts
export { jiraProvider } from './jira';

// Register the provider
oauthProviders['jira'] = jiraProvider;
```

### Step 4: Connect to MCP Server Catalog

Don't forget to move your server from local_catalog to https://github.com/archestra/website

When users install this MCP server:

1. The UI detects `oauth.required: true` and `provider: "jira"`
2. Starts the OAuth flow automatically
3. After successful auth, tokens are stored and passed to the MCP server as environment variables

## Special Cases

### Browser Authentication (No OAuth)

Some services don't support OAuth but you can extract tokens from their web UI:

```typescript
// desktop_app/src/backend/server/plugins/oauth/providers/jira-browser.ts
export const jiraBrowserProvider: OAuthProviderDefinition = {
  name: 'jira-browser',
  authorizationUrl: '', // Not used for browser auth
  scopes: [],
  usePKCE: false,
  clientId: 'browser-auth',

  tokenEnvVarPattern: {
    accessToken: 'JIRA_TOKEN',
  },

  browserAuthConfig: {
    enabled: true,
    loginUrl: 'https://jira.atlassian.net/login', // Where to send users

    // Control which pages the auth window can navigate to
    navigationRules: (url) => url.includes('atlassian.net'),

    // Extract tokens from the page once logged in
    extractTokens: async (window) => {
      const { webContents } = window;
      const url = webContents.getURL();

      // Only extract on the dashboard page
      if (!url.includes('/dashboard')) return null;

      // Try to get token from localStorage
      const token = await webContents.executeJavaScript(`localStorage.getItem('auth_token')`);

      if (token) {
        return { access_token: token };
      }
      return null;
    },
  },
};
```

In the catalog, specify both OAuth and browser options:

```json
{
  "archestra_config": {
    "oauth": {
      "provider": "jira",
      "required": false // OAuth is optional
    },
    "browser_based": {
      "required": false // Browser auth is also available
    }
  }
}
```

### File-Based Credentials

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

### Custom Authorization Parameters

Add extra parameters to the OAuth authorization URL:

```typescript
jiraProvider: OAuthProviderDefinition = {
  // ... other config ...

  authorizationParams: {
    audience: 'api.atlassian.com', // API audience
    prompt: 'consent', // Always show consent screen
    access_type: 'offline', // Request refresh token
  },
};
```

## Debugging and Cleanup

When developing and testing OAuth providers, you may need to inspect or clean up containers.

### Container Management Commands

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
./desktop_app/resources/bin/mac/arm64/podman-remote-static-v5.5.2 exec -it 2ccf5745b083 sh
```

Replace `2ccf5745b083` with your actual container ID from the `container ls` command.