---
title: Authentication Overview
category: Archestra Desktop Agent
subcategory: Authentication
order: 3
---

![Archestra Development](/docs/a-scientific-discussion.png)

# The elephant in the MCP usability room

Here it is: 🐘

But seriously, MCP is a great protocol to connect AI and data. Unfortunately, the usability of this protocol is a massive challenge for non-technical users. The majority of servers require a comprehensive multi-step API key extraction process if you want to run them locally and not share your sensitive data with a third-party MCP server hosting platform.

For example, the amazing [google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp) (611 GitHub stars at the moment of writing this doc) asks its users to _"paste your Google OAuth credentials,"_ which sounds like something you wouldn't ask a non-technical person to do. Even for a technical person, it takes about 20 minutes to register in Google Cloud, create an application there, and put the file in the right place.

We believe that:

1. End-users should be able to use MCP **without messing with API keys**.
2. Archestra should work with existing **open source MCP servers** (not rewriting or running in a third-party cloud like other providers do)

In order to support any open source MCP server **and** provide the best UX to end-users, we developed a few options for authenticating users in Archestra and the subsequent MCP server.

## Option One: Updating Your MCP Server

If you own the MCP server code, that's great! To make it work in Archestra, we ask you to comply with the [MCP specification's authorization flow](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization), which was introduced in version 2025-06-18.

(This section is under construction and will be updated, [issue for this](https://github.com/archestra-ai/archestra/issues/281))

## Option Two: Configuring Archestra to Support Third-Party MCP

For existing MCP servers that cannot be modified, Archestra provides two authentication methods:

### Browser-Based Authentication

Archestra includes a built-in browser that can automatically extract authentication tokens from web services.

See [Browser-Based Authentication](/docs/auth-browser-auth) for implementation details.

### OAuth Integration

For services that support OAuth 2.0, Archestra provides a standardized OAuth flow with PKCE security.

See [OAuth Providers](/docs/auth-oauth) for setup instructions.
