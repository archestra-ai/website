---
title: 'Enterprise-Managed Credentials for MCP: Brokering Downstream Tool Access'
date: '2026-03-30'
author: 'Joey Orlando'
description: 'Part III of our MCP authentication series: how to broker downstream MCP credentials from an enterprise identity provider without storing per-user SaaS tokens in your gateway.'
image: '/blog/2026-02-11-mcp-authentication.png'
---

## The Missing Layer in MCP Auth

In the first two posts in this series, we covered two important pieces of MCP authentication:

- [Part 1](/blog/mcp-authentication-guide): how MCP clients authenticate to servers and gateways with OAuth 2.1
- [Part 2](/blog/enterprise-mcp-servers-jwks): how MCP servers can validate enterprise JWTs with JWKS

There is still a separate problem to solve in real enterprise deployments:

> How does a gateway get the **downstream credential** an MCP server needs when the caller is already authenticated?

That problem shows up any time the MCP server ultimately needs to talk to another system on the user's behalf:

- GitHub
- Jira
- ServiceNow
- internal APIs
- databases behind a user-scoped access layer

Authenticating the caller to the gateway is only half of the story. The gateway still needs a second credential for the actual tool call.

This is where **enterprise-managed credentials** come in.

_This is Part 3 of our MCP authentication series. [Part 1](/blog/mcp-authentication-guide) covers the full standards landscape, and [Part 2](/blog/enterprise-mcp-servers-jwks) covers JWT validation and JWKS-based enterprise MCP servers._

## Two Different Authentication Problems

It helps to separate MCP auth into two layers:

### 1. Caller Authentication

This answers:

> Who is allowed to call this Agent or MCP Gateway?

Examples:

- OAuth 2.1
- Bearer tokens
- enterprise JWT validation via JWKS
- ID-JAG based authorization

### 2. Downstream Credential Resolution

This answers:

> What credential should be injected into the upstream MCP request once the caller is already authenticated?

Examples:

- a static API key
- a stored per-user OAuth token
- a credential resolved dynamically at call time
- a credential brokered from an enterprise identity provider

That second layer is what people usually discover late. The gateway auth story looks complete until the first time a remote MCP server says:

> “Thanks, I know who the user is. Now give me the token I actually need to talk to GitHub.”

## Why Static Credentials Break Down

Static credentials are fine for simple setups:

- one shared service account
- one internal tool
- one small team

They break down quickly in enterprise environments:

- different users need different upstream permissions
- audit trails need to reflect the real caller
- security teams do not want hundreds of personal access tokens copied into a gateway
- rotating and revoking tokens becomes operationally painful

The worst version of this is a “shared super-token” pattern, where the MCP server can do everything for everyone because the gateway only knows one upstream credential. It works, but it collapses identity and access control right where you most need them.

## What Enterprise-Managed Credentials Actually Are

Enterprise-managed credentials are a runtime brokerage pattern:

1. The user authenticates to the client or gateway
2. Archestra identifies the user
3. Archestra asks the configured identity provider for a downstream credential for the target MCP server
4. Archestra injects that returned credential into the MCP request
5. The upstream MCP server executes with a user-specific credential

The important point is that Archestra is not inventing a new credential type here. It is brokering whatever the identity provider can issue for that downstream resource.

That might be:

- a bearer token
- a managed secret
- a service-account-style credential
- another provider-specific token format

The exact token format is less important than the architecture:

> the gateway authenticates the caller once, and resolves the downstream credential separately at tool-call time.

## How This Differs from JWKS and ID-JAG

These three concepts are related, but they solve different problems.

### JWKS

JWKS is about **validating an incoming JWT**.

It lets a gateway or MCP server trust tokens issued by an external identity provider without doing token introspection on every request.

### ID-JAG

ID-JAG is about **exchanging an enterprise identity assertion for an MCP access token**.

That is useful when the client already has an enterprise identity and needs a gateway-scoped token for MCP access.

### Enterprise-Managed Credentials

Enterprise-managed credentials are about **the token used for the upstream tool call itself**.

That is the credential the remote MCP server or hosted HTTP MCP server needs in order to do real work on behalf of the caller.

If you compress all three into one mental bucket, the system gets confusing fast. The cleaner model is:

- JWKS or OAuth: authenticate the caller
- ID-JAG: optionally mint a gateway access token from enterprise identity
- enterprise-managed credentials: obtain the downstream credential for the actual MCP tool call

## The Archestra Model

In Archestra, this flow is split across three configuration layers.

### 1. Identity Provider

The Identity Provider defines **how Archestra talks to the IdP** for exchange:

- exchange client ID
- exchange token endpoint
- client authentication method
- which signed-in user token should be exchanged

This is global provider configuration.

### 2. MCP Catalog Item

The MCP catalog item defines **what downstream credential should be requested** for that server:

- the resource or audience identifier
- the requested credential type
- how the returned credential should be injected

This is a property of the MCP server, not of each Agent builder.

### 3. Tool Assignment

The tool assignment stays simple:

- `Resolve at call time`

If the installed server is configured for enterprise-managed credentials, that dynamic resolution path uses the enterprise broker automatically.

This matters a lot operationally. It keeps the hard configuration in the hands of the platform or security team, while keeping Agent and Gateway builders on a much simpler mental model.

## Why This Design Holds Up Better

There are a few practical benefits to splitting the system this way.

### Cleaner Ownership

The identity team owns IdP configuration.

The platform team owns the MCP catalog item and the resource mapping.

Agent builders only decide whether a tool should resolve credentials at runtime.

### Better Security Posture

You avoid copying personal SaaS tokens into Archestra just to make a tool work.

Instead, Archestra asks for the downstream credential when it is needed, for the user who is actually making the call.

### Better Auditability

When the upstream MCP server receives a user-specific exchanged token, it can attribute actions correctly instead of everything looking like one shared service account.

## A Practical Local Test

For local development, we have been validating this pattern with:

- a protected demo MCP server
- an identity provider configured for token exchange
- two users with different seeded downstream claims

The useful property of that test is not the specific provider. It is that the same shared Agent or MCP Gateway can be called by two different users and the upstream server sees two different exchanged credentials.

That is the thing you actually need to prove:

- the gateway is not reusing one shared upstream token
- the downstream credential is resolved per caller
- the upstream MCP server receives the exchanged token, not just the caller's original session token

## The Bigger Point

MCP authentication is often discussed as if there is a single auth problem to solve. In practice there are at least two:

- authenticate the caller to the MCP surface
- resolve the downstream credential needed by the tool execution path

Enterprise-managed credentials are the missing second half.

If you are building MCP infrastructure for real enterprise environments, you will eventually need both layers. The earlier you model them separately, the less painful your architecture will be once you move past toy deployments.

If you want to see the standards and the surrounding patterns in more detail:

- [Part 1: A Developer's Guide to MCP Authentication](/blog/mcp-authentication-guide)
- [Part 2: Building Enterprise-Ready MCP Servers with JWKS and Identity Providers](/blog/enterprise-mcp-servers-jwks)
