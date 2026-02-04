---
title: 'How to Run OpenClaw Securely'
date: '2026-02-04'
author: 'Joey Orlando'
description: 'OpenClaw is a security nightmare out of the box. Here is how to lock it down with Archestra.'
image: '/blog/2026-02-04-openclaw-secure-hero.png'
---

OpenClaw has taken the world by storm. In a matter of weeks, Peter Steinberger's open-source personal AI agent — originally called Clawdbot, then briefly Moltbot — has racked up over 160,000 GitHub stars, making it one of the fastest-growing open-source projects in history. It can read your email, write code, control your browser, manage your smart home, and even post on social media. All from a single chat interface. All running locally on your machine.

It is genuinely impressive. It is also, out of the box, a **_security nightmare_**.

In this post, we'll walk through what makes OpenClaw so risky, and then show you exactly how to lock it down using [Archestra](https://archestra.ai) — our open-source security platform for AI agents. We'll cover tool permissions, cost caps, and sandboxing. And we'll do it with a real, working setup you can follow along with on your own machine.

## The Problem: Why OpenClaw Needs Guardrails

By default, OpenClaw gives its AI agent access to a staggering set of capabilities: shell commands, full filesystem read/write, browser automation, email, cron jobs, webhooks, and more. This is powerful. It's also exactly the kind of setup that security researchers have been warning about for years — what Simon Willison calls the "Lethal Trifecta": an AI agent with access to private data, exposure to untrusted content, and the ability to communicate externally.

The risks aren't theoretical.

### Prompt Injection in 5 Minutes

Our CEO, [Matvey Kukuy](https://www.linkedin.com/in/matveykukuy/), demonstrated just how trivial it is to exploit an unprotected OpenClaw instance. He sent an email with an embedded prompt injection, waited for the agent to check its inbox, and received the target machine's SSH private key back — all within five minutes.

![Matvey Kukuy's prompt injection demo — SSH key exfiltrated via email in under 5 minutes](/blog/2026-02-04-openclaw-matvey-prompt-injection.png)

No malware. No privilege escalation. Just a cleverly worded email that the AI treated as a legitimate instruction.

### The Broader Picture

Matvey's demo is far from an isolated case. Security researchers have found a critical remote code execution vulnerability ([CVE-2026-25253](https://nvd.nist.gov/vuln/detail/CVE-2026-25253)) that allows one-click exploitation via a malicious link. Over 10,000 exposed OpenClaw instances have been discovered leaking credentials publicly. Malicious skills on ClawHub — OpenClaw's community extensions marketplace — have been caught deploying credential stealers. And commodity infostealers have already added OpenClaw to their target lists.

The community is paying attention. Industry voices are calling OpenClaw a "security dumpster fire," and even its own documentation acknowledges there is no "perfectly secure" setup.

So what do you do? Stop using it?

No. You add guardrails.

## What is Archestra?

[Archestra](https://archestra.ai) is an open-source platform for securing AI agents. It sits between your AI agent and the outside world — your LLM providers, your tools, your data — and enforces security policies at the LLM proxy level — before requests ever reach the model — rather than relying on the model to "just be smart enough."

We built Archestra for enterprise environments, but it works just as well for personal projects and hobby setups. If you're running OpenClaw on your home machine and you want to make sure a rogue email can't exfiltrate your SSH keys, Archestra is for you too.

Here's what it gives you:

- **Tool-level permissions**: Control exactly which tools your agent can use, and constrain how it uses them
- **LLM cost limits**: Set hard caps on API spend so a runaway agent doesn't drain your wallet
- **Prompt injection defenses**: Dynamic tools and the Dual-LLM pattern that block exfiltration attempts at the LLM proxy (Archestra) level, before they ever reach the LLM
- **Full observability**: See every tool call, every LLM request, and every action your agent takes

## Setting It Up: OpenClaw + Archestra

Let's get both running locally and wire them together. The full setup takes about 10 minutes.

### Step 1: Run Archestra Locally

Make sure Docker is installed and running, then:

```bash
docker pull archestra/platform:latest

docker run -p 9000:9000 -p 3000:3000 \
  -e ARCHESTRA_QUICKSTART=true \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v archestra-postgres-data:/var/lib/postgresql/data \
  -v archestra-app-data:/app/data \
  archestra/platform
```

After a minute or so, open [http://localhost:3000](http://localhost:3000) and log in with the default credentials (`admin@example.com` / `password`). You'll want to change these for anything beyond local experimentation.

### Step 2: Configure Archestra as an LLM Proxy

In the Archestra UI:

1. Go to **Settings > LLM API Keys** and add your Anthropic API key (or whichever provider you use)
2. Navigate to **LLM Proxy** in the sidebar — you'll see a "Default LLM Proxy" already created
3. Click into it and note the **Connection** details. Archestra provides provider-specific proxy URLs (one each for Anthropic, OpenAI, Gemini, etc.). We'll use the Anthropic endpoint since OpenClaw uses Claude

The Anthropic proxy URL will look something like `http://localhost:9000/v1/anthropic/<proxy-uuid>`. This is the endpoint we'll point OpenClaw at.

### Step 3: Install OpenClaw

If you don't already have OpenClaw:

```bash
npm install -g openclaw@2026.2.2-3
openclaw onboard --install-daemon
```

### Step 4: Point OpenClaw at Archestra

Edit your `~/.openclaw/openclaw.json` to add Archestra as a custom model provider. The key insight is that Archestra's proxy speaks the native Anthropic Messages API — so we use `anthropic-messages` as the API type, and pass your real Anthropic API key (which Archestra forwards to the upstream provider):

```json5
{
  models: {
    providers: {
      // Route all LLM traffic through Archestra
      archestra: {
        baseUrl: 'http://127.0.0.1:9000/v1/anthropic/<your-proxy-uuid>',
        apiKey: '${ANTHROPIC_API_KEY}', // Your real Anthropic API key
        api: 'anthropic-messages',
        models: [
          {
            id: 'claude-sonnet-4-5-20250929',
            name: 'Claude Sonnet 4.5 (via Archestra)',
            reasoning: true,
            input: ['text', 'image'],
            cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
            contextWindow: 200000,
            maxTokens: 16384,
          },
        ],
      },
    },
  },
  agents: {
    defaults: {
      model: {
        // Use Archestra-proxied model as the primary
        primary: 'archestra/claude-sonnet-4-5-20250929',
      },
    },
  },
  tools: {
    profile: 'coding', // Start restrictive — we'll tighten further below
  },
}
```

Replace `<your-proxy-uuid>` with the UUID from your LLM Proxy's Connection dialog, and make sure `ANTHROPIC_API_KEY` is set in your environment.

Now every LLM request OpenClaw makes flows through Archestra, where you can observe, control, and limit it.

Verify the connection:

```bash
openclaw models status --probe
```

## Locking It Down: Tool Permissions

Running all traffic through Archestra is a good start, but the real power is in **constraining what your agent can actually do**. An unscoped agent is like giving your house keys to a stranger and hoping they only go where you want.

### Scoping File System Access

Say you're using OpenClaw to help with a hobby project at `~/coding/my-hobby-project`. You probably don't want it reading your `.env` files, your `~/.ssh` directory, or anything outside the project folder. In Archestra's Tool Policies, you can restrict file system tools to specific paths:

- **Allow reads** only from `~/coding/my-hobby-project/src/**`
- **Allow writes** only to `~/coding/my-hobby-project/src/**`
- **Block access** to `**/.env`, `**/.env.*`, `**/.ssh/**`, `**/credentials*`

This means even if a prompt injection tricks the agent into trying to read your API keys or SSH credentials, the tool call is blocked at the LLM proxy (Archestra) level before it ever executes.

### Scoping Communication Tools

Email is one of the most dangerous attack vectors for prompt injection. An attacker sends a message, the agent reads it, and the agent follows the hidden instructions. In Archestra, you can constrain email tools to specific recipients:

- **Allow `send_email`** only to addresses matching `*@archestra.ai` or `*@yourdomain.com`
- **Block all other recipients**

Even if a prompt injection instructs the agent to forward sensitive data to `attacker@evil.com`, the tool call fails. The exfiltration attempt is logged and you can see exactly what happened in Archestra's dashboard.

### Using OpenClaw's Built-in Tool Profiles

OpenClaw itself supports tool profiles (`minimal`, `messaging`, `coding`, `full`) and explicit allow/deny lists in `openclaw.json`. We recommend layering these with Archestra's policies for defense in depth:

```json5
{
  tools: {
    profile: 'coding', // Start restrictive
    deny: ['group:sessions', 'web_fetch'], // Deny what you don't need
  },
}
```

The combination of OpenClaw's client-side restrictions and Archestra's server-side enforcement means you have two independent layers of defense. Even if one is bypassed, the other catches it.

## Setting Hard Caps on LLM Costs

OpenClaw's autonomous capabilities are a double-edged sword. The Heartbeat feature can wake the agent up on a schedule and have it proactively take actions — which is amazing until something goes wrong and it enters a loop of API calls that burns through your credits.

In Archestra, you can set usage limits:

1. Go to **Cost & Limits > Limits** in the sidebar
2. Click **+ Add LLM Limit** and set a **daily spend cap** (e.g., $5/day for a personal project)
3. Set up alerts using Archestra's built-in [Prometheus metrics](https://archestra.ai/docs/platform-observability) and your favorite observability tool (Grafana, Datadog, etc.) so you get notified before you blow your budget

When the cap is hit, Archestra returns an error to OpenClaw instead of forwarding the request to the LLM provider. Your agent stops. Your wallet is safe.

This isn't just about runaway loops. Prompt injection attacks can deliberately trigger expensive operations — requesting maximum-context responses, chaining tool calls, or forcing the agent into recursive reasoning. Cost caps are a critical safety net.

## Sandboxing: Don't Run It on Your Primary Machine

Even with tool permissions and cost caps, you should think carefully about where OpenClaw runs. Giving an AI agent shell access on the same machine where you keep your passwords, financial documents, and personal photos is a risk that no amount of software guardrails can fully eliminate.

Options for isolation:

- **Docker containers**: OpenClaw supports sandbox mode (`agents.defaults.sandbox.mode: "all"`) which runs tool execution in isolated Docker containers
- **Dedicated VM**: Run OpenClaw in a virtual machine with only the data and credentials it needs
- **Separate user account**: At minimum, run it under a restricted OS user with no access to your home directory's sensitive files

Archestra adds another layer here: because all LLM traffic is proxied, your actual API keys never need to exist on the machine running OpenClaw. They live in Archestra's configuration, which can run on a separate host or container entirely.

## Wrapping Up

OpenClaw is a genuinely powerful tool. The community building around it is remarkable, and the pace of development is extraordinary. But power without guardrails is a liability — for your data, your credentials, and your wallet.

The good news is that locking it down doesn't require giving up what makes it useful. With Archestra handling tool permissions, cost limits, and observability, you get the full power of an autonomous AI agent with the confidence that it can't go off the rails.

If you want to try this yourself:

- [Archestra Platform Quickstart](https://archestra.ai/docs/platform-quickstart)
- [OpenClaw Documentation](https://docs.openclaw.ai/)
- [Archestra GitHub](https://github.com/archestra-ai/archestra)

Questions? Join our [Slack community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg) — we're happy to help you get set up.
