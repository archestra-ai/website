---
title: "A Developer's Guide to MCP Authentication"
date: '2026-02-11'
author: 'Joey Orlando'
description: 'The standards, protocols, and patterns behind secure AI tool access — OAuth 2.1, PKCE, CIMD, and more.'
image: '/blog/2026-02-11-mcp-authentication.png'
---

## Every MCP Connection Starts with a 401

You've just installed an MCP server. Your AI assistant connects, and immediately gets rejected — a `401 Unauthorized` response with a cryptic `WWW-Authenticate` header. What happens next involves at least three RFCs, a discovery protocol, and a client registration step your user never sees.

MCP (Model Context Protocol) standardized on OAuth 2.1 for authentication. If you're building MCP clients, servers, or gateways, understanding how these pieces fit together saves hours of debugging. This post breaks down the full authentication landscape — the standards involved, how discovery works, how clients register, and where the sharp edges are.

_This is Part 1 of a two-part series on MCP authentication. [Part 2](/blog/enterprise-mcp-servers-jwks) covers building enterprise MCP servers with JWKS and identity providers._

## Why MCP Chose OAuth 2.1

The MCP specification needed an auth framework that works for a specific class of applications: desktop tools, CLI agents, and browser-based chat interfaces connecting to tool servers. These are all **public clients** — they can't securely store client secrets.

OAuth 2.1 was the natural fit. It mandates two things that matter for MCP:

1. **Authorization Code flow only** — no implicit grant, no resource owner password credentials
2. **PKCE (Proof Key for Code Exchange)** — protects the authorization code exchange without requiring a client secret

This combination gives MCP clients a secure way to authenticate without embedding secrets in desktop apps or CLI tools.

## The Standards Stack

MCP auth relies on a stack of interrelated standards. Here's the full picture:

- **[OAuth 2.1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-12)** — Authorization framework. The core auth protocol for MCP.
- **[PKCE (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)** — Proof Key for Code Exchange. Protects code exchange for public clients. Required by the MCP spec.
- **[RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728)** — Protected Resource Metadata. Links a resource server to its authorization server.
- **[RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414)** — Authorization Server Metadata. Endpoint discovery for authorize, token, register, and JWKS URLs.
- **[RFC 7591](https://datatracker.ietf.org/doc/html/rfc7591)** — Dynamic Client Registration (DCR). Allows clients to register at runtime.
- **[CIMD](https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/)** — Client ID Metadata Documents. URL-based client identity. The MCP default since November 2025.
- **[RFC 8628](https://datatracker.ietf.org/doc/html/rfc8628)** — Device Authorization Grant. Auth for headless clients that can't open a browser.
- **[RFC 8707](https://datatracker.ietf.org/doc/html/rfc8707)** — Resource Indicators. Binds tokens to a specific audience/resource server.
- **[RFC 8693](https://datatracker.ietf.org/doc/html/rfc8693)** — OAuth 2.0 Token Exchange. Enables exchanging one token for another — the foundation for the Enterprise-Managed Authorization extension covered below.
- **[RFC 7523](https://datatracker.ietf.org/doc/html/rfc7523)** — JWT Bearer Token Profiles for OAuth 2.0. Lets a signed JWT serve as an authorization grant — how enterprise identity assertions reach MCP servers.
- **[MCP Authorization Spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)** — The MCP specification that ties all of the above together.
- **[Enterprise-Managed Authorization](https://modelcontextprotocol.io/extensions/auth/enterprise-managed-authorization)** — MCP extension for centralized enterprise access control via identity providers. Covered in detail below.

Don't worry if this looks overwhelming — each piece has a specific job, and they chain together in a predictable sequence.

## How MCP Auth Works: Step by Step

### 1. The Initial 401

When an MCP client first connects to a server, the server responds with:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://server.example/.well-known/oauth-protected-resource"
```

This isn't an error — it's the handshake that starts the auth flow. The `resource_metadata` URL tells the client where to find the server's auth configuration.

### 2. Discovery (RFC 9728 then RFC 8414)

The client follows a two-step discovery chain:

**Step 1 — Protected Resource Metadata (RFC 9728):** The client fetches the resource metadata URL from the 401 response:

```json
{
  "resource": "https://server.example/v1/mcp",
  "authorization_servers": ["https://auth.example.com"],
  "scopes_supported": ["mcp:tools", "mcp:resources"]
}
```

This answers: "who is the authorization server for this resource?"

**Step 2 — Authorization Server Metadata (RFC 8414):** The client fetches `/.well-known/oauth-authorization-server` from the authorization server:

```json
{
  "issuer": "https://auth.example.com",
  "authorization_endpoint": "https://auth.example.com/authorize",
  "token_endpoint": "https://auth.example.com/token",
  "registration_endpoint": "https://auth.example.com/register",
  "code_challenge_methods_supported": ["S256"],
  "grant_types_supported": ["authorization_code", "refresh_token", "urn:ietf:params:oauth:grant-type:device_code"]
}
```

Now the client knows every endpoint it needs — no hardcoded URLs required.

### 3. Client Registration

The client needs a `client_id` before it can authorize. Two approaches:

**DCR (Dynamic Client Registration, RFC 7591).** The traditional approach. The client POSTs its metadata to the registration endpoint:

```json
{
  "client_name": "My MCP Client",
  "redirect_uris": ["http://127.0.0.1:34567/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "token_endpoint_auth_method": "none"
}
```

The server responds with a `client_id`. This works well, but creates "client sprawl" at scale — every client registers separately with every server.

**CIMD (Client ID Metadata Documents).** The MCP default since November 2025. Instead of registering, the client uses an HTTPS URL as its `client_id`:

```
client_id=https://cursor.com/.well-known/oauth-client/mcp
```

The authorization server fetches this URL and gets the client's metadata:

```json
{
  "client_id": "https://cursor.com/.well-known/oauth-client/mcp",
  "client_name": "Cursor",
  "redirect_uris": ["https://cursor.com/mcp/callback"],
  "grant_types": ["authorization_code"],
  "token_endpoint_auth_method": "none"
}
```

No registration endpoint needed. The client's identity is its URL. This is decentralized — the client controls its own metadata, and any server can verify it by fetching the document.

### 4. Authorization + PKCE

With a `client_id` in hand, the standard OAuth Authorization Code flow begins — with PKCE:

1. Client generates a random `code_verifier` (43-128 characters)
2. Hashes it to create `code_challenge = BASE64URL(SHA256(code_verifier))`
3. Opens the browser to the authorization endpoint with the challenge
4. User logs in and grants consent
5. Server redirects back with an authorization `code`
6. Client exchanges the code + original `code_verifier` for tokens

```http
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=abc123
&redirect_uri=http://127.0.0.1:34567/callback
&client_id=https://cursor.com/.well-known/oauth-client/mcp
&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

The server verifies `SHA256(code_verifier) == code_challenge` from the original authorization request. This prevents authorization code interception — even if someone steals the code, they can't exchange it without the verifier.

**The PKCE reality check:** The MCP spec requires PKCE, but not all providers support it. GitHub's OAuth implementation, for example, doesn't support PKCE at all. Gateways like [Archestra](https://archestra.ai/docs/mcp-authentication) handle both cases — enforcing PKCE when the provider supports it, gracefully degrading when it doesn't.

### 5. Token Usage

The client receives access and refresh tokens:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dhl3kJo9sE..."
}
```

All subsequent MCP requests include the access token:

```http
POST /v1/mcp
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{"jsonrpc": "2.0", "method": "tools/list", "id": 1}
```

## Device Flow: Auth for Headless Clients

Not every MCP client can open a browser. CLI tools, CI/CD pipelines, and server-side agents need an alternative. The Device Authorization Grant (RFC 8628) handles this:

1. Client requests a device code from the authorization server
2. Server returns a user code and a verification URL
3. Client displays: "Go to https://auth.example.com/device and enter code: ABCD-1234"
4. User opens the URL on any device, enters the code, and authorizes
5. Client polls the token endpoint until authorization completes

This is the same flow you use when logging into a streaming service on a smart TV. It works anywhere — terminals, headless servers, embedded devices.

## Resource Indicators: Audience-Bound Tokens

One nuance that trips up many implementations: the MCP spec recommends using Resource Indicators (RFC 8707) to bind tokens to specific resource servers.

When requesting a token, the client includes a `resource` parameter:

```http
POST /token
...&resource=https://server.example/v1/mcp
```

This tells the authorization server to scope the token to that specific resource. The resulting token (typically a JWT) includes an `aud` (audience) claim matching the resource URL.

Why this matters: when one authorization server protects multiple MCP servers, audience binding prevents a token issued for Server A from working on Server B.

## Enterprise-Managed Authorization

Everything described above assumes a **user-driven** model: each employee individually authorizes each MCP client to access each MCP server. For consumer applications, this is ideal. For enterprises, it breaks down fast.

Think about what happens when your organization adopts MCP across engineering teams. Every developer needs to individually authorize every MCP server they use — your internal code search tool, your CI/CD integration, your documentation server, your database query tool. New hires go through this for each server one by one. When someone leaves, you need to revoke access across every server individually. Security has no centralized view of who has access to what.

If this sounds familiar, it's because it's the exact problem identity providers solved for SaaS applications a decade ago. The MCP [Enterprise-Managed Authorization](https://modelcontextprotocol.io/extensions/auth/enterprise-managed-authorization) extension brings that same model to MCP.

### How It Works

The extension puts your existing identity provider (Okta, Entra ID, Auth0) in the middle of MCP authorization. Instead of each employee authorizing each server, the IdP decides who gets access to what — using the same group memberships, role assignments, and conditional access policies you already manage.

```
  MCP Client          Enterprise IdP           MCP Server
      │                     │                      │
      │  1. SSO login       │                      │
      │  (corporate creds)  │                      │
      │────────────────────>│                      │
      │                     │                      │
      │  2. "Can this user  │                      │
      │   access this       │                      │
      │   MCP server?"      │                      │
      │────────────────────>│                      │
      │                     │                      │
      │  3. Signed grant    │  (IdP checks group   │
      │  (yes, with these   │   memberships,       │
      │   permissions)      │   policies, MFA)     │
      │<────────────────────│                      │
      │                     │                      │
      │  4. Exchange grant for access token        │
      │────────────────────────────────────────────>│
      │                     │                      │
      │  5. Access token                           │
      │<────────────────────────────────────────────│
```

The flow has three stages:

**Stage 1 — Single Sign-On.** The employee logs in with their corporate credentials — the same Okta or Entra ID login they use for email, Slack, and everything else. One login, done.

**Stage 2 — Policy Check.** The MCP client asks the IdP: "can this user access this specific MCP server?" The IdP evaluates your enterprise policies — group membership, role assignments, device compliance, conditional access rules — and returns a signed authorization grant (called an **ID-JAG**). If the employee isn't authorized, the request is denied before it ever reaches the MCP server. This is where your security team's policies are enforced.

**Stage 3 — Token Issuance.** The MCP client presents the signed grant to the MCP server, which validates the IdP's signature (via JWKS — covered in [Part 2](/blog/enterprise-mcp-servers-jwks)) and issues an access token. When tokens expire, the client repeats from Stage 2 — no user interaction needed.

### What This Changes for Platform Teams

If you're running a platform team that's rolling out MCP servers, this extension is significant because it shifts access management from a developer self-service problem to a standard IT operations workflow:

- **Onboarding**: add the employee to the right IdP groups and they instantly have access to the right MCP servers — no per-server setup
- **Offboarding**: disable the employee in the IdP, all MCP access revoked immediately — no per-server cleanup
- **Policy enforcement**: "the engineering team gets read-only access to the source control MCP server via AI code editors" is a policy you configure once in your IdP, not something each developer manages
- **Scope control**: the IdP can grant different permission levels to different groups — marketing gets read-write for the documentation server, while engineering gets read-only
- **Compliance**: every access decision flows through your IdP's audit log, giving security teams a centralized view of who accessed what and when

The extension is currently in draft status and client support is still emerging — check the [MCP client matrix](https://modelcontextprotocol.io/extensions/client-matrix) for the latest. But the direction is clear: MCP access management is converging on the same centralized IdP model that the rest of the enterprise already uses.

## Client Adoption: Where Things Stand

MCP auth is still maturing. Here's where major clients stand as of early 2026:

- **Claude Desktop** — OAuth 2.1 + PKCE, DCR registration. Full spec compliance.
- **Claude Code** — OAuth 2.1 + PKCE, DCR registration. Full spec compliance.
- **Cursor** — OAuth 2.1, DCR registration. PKCE support varies.
- **Windsurf** — OAuth 2.1, DCR registration. Basic OAuth support.
- **Open WebUI** — OAuth 2.1 + PKCE, DCR registration. Full spec compliance.
- **VS Code** — OAuth 2.1 + PKCE, CIMD registration. First major client to ship CIMD.

The MCP spec adopted CIMD as the default registration method in the 2025-11-25 revision. VS Code has shipped CIMD support; other clients are expected to follow. DCR remains important for backwards compatibility and enterprise deployments where admins want to control client registration.

## Common Pitfalls

A few sharp edges from real-world MCP auth implementations:

**PKCE method confusion.** The MCP spec requires S256 (SHA-256). Some implementations default to the `plain` method, which provides no security benefit. Always check `code_challenge_methods_supported` in the server metadata and use S256.

**Redirect URI matching.** MCP clients typically use loopback addresses (`http://127.0.0.1:{port}/callback`) with dynamic ports. The authorization server must support flexible port matching for loopback redirect URIs, as specified in RFC 8252.

**Discovery endpoint paths.** RFC 9728 specifies path-aware resource metadata: `/.well-known/oauth-protected-resource/v1/mcp` (with the path suffix), not just `/.well-known/oauth-protected-resource`. Getting this wrong means clients can't discover the auth server.

**Token type confusion.** MCP servers can issue either opaque tokens (random strings stored server-side) or JWTs (self-contained, verifiable with public keys). Your validation strategy differs significantly between the two. If you're building a gateway, you need to handle both.

## How Archestra Handles This

If you're looking for a concrete implementation of the full auth stack described above, [Archestra's MCP Gateway](https://archestra.ai/docs/mcp-authentication) implements the complete flow.

**Gateway-level authentication.** Archestra acts as both the resource server and the authorization server. MCP clients like Claude Desktop, Claude Code, Cursor, and Open WebUI authenticate automatically using the standard OAuth 2.1 flow — including discovery (RFC 9728 + RFC 8414), client registration (both DCR and CIMD), and Authorization Code + PKCE. For direct API integrations, the gateway also supports static Bearer tokens.

**Upstream credential management.** The gateway separates client-to-gateway auth (Token A) from gateway-to-upstream-server auth (Token B). Clients never handle upstream credentials directly. Archestra resolves them at runtime — supporting static API keys, OAuth tokens with automatic refresh, and per-user credential resolution for multi-tenant setups where each developer uses their own credentials.

**External IdP JWKS.** For enterprises with existing identity providers, Archestra can validate JWTs from external IdPs (Okta, Auth0, Keycloak, Entra ID) and propagate them to upstream MCP servers. The gateway validates the JWT signature via JWKS, matches the caller to an Archestra user, enforces team-based access control, and forwards the original JWT to the upstream server — enabling end-to-end identity verification without any Archestra-specific integration on the server side.

**PKCE everywhere (mostly).** Archestra enforces PKCE when the upstream provider supports it and gracefully degrades when it doesn't — important for providers like GitHub that still lack PKCE support.

**Enterprise-managed access control.** Archestra's team-based access control and external IdP integration align with the Enterprise-Managed Authorization extension described above. You manage MCP server access through your existing IdP — assign teams, set permissions, revoke access in one place. The gateway handles JWT validation, maps IdP identity to Archestra permissions, and logs every tool call for audit. As client support for the Enterprise-Managed Authorization extension matures, Archestra's gateway is positioned to serve as the authorization server in the ID-JAG flow — accepting identity assertions from your IdP and issuing scoped access tokens for upstream MCP servers.

For a deeper look at the gateway's auth architecture, see the [Archestra Authentication docs](https://archestra.ai/docs/mcp-authentication).

In Part 2 of this series, we go deeper into one specific pattern: [building MCP servers that validate JWTs from enterprise identity providers using JWKS](/blog/enterprise-mcp-servers-jwks).
