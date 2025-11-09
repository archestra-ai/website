---
title: Setting Up n8n Chat Assistant
category: Archestra Platform
subcategory: Practical Examples
order: 6
description: Step-by-step guide to configure an n8n workflow automation expert using Archestra's chat feature
---

Archestra Platform includes a built-in chat feature that can be configured as an n8n automation expert. This guide walks you through setting up a chat assistant that helps you build, debug, and manage n8n workflows using the n8n MCP server.

## Overview

By the end of this guide, you'll have:

- A dedicated n8n expert chat agent
- Access to all n8n MCP tools directly in the chat
- Pre-configured system prompt with n8n expertise
- Quick-action prompts for common tasks

The chat assistant can help you:

- Design and build n8n workflows
- Debug node configurations
- Understand n8n best practices
- Search through n8n templates
- Validate workflow structure

## Prerequisites

Before you begin, ensure you have:

- A running Archestra Platform instance
- An n8n instance (local or cloud)
- An n8n API key
- An Anthropic API key

## Step 1: Configure Anthropic API Key

The chat feature requires an Anthropic API key to function.

1. Navigate to **Settings → Chat**
2. Enter your Anthropic API key in the "API Key" field
3. Click **Save API Key**
4. Verify the "API key is configured" message appears

> **Note:** This is a one-time setup. The API key is stored securely and used for all chat conversations.

## Step 2: Create n8n Agent

Create a dedicated agent for n8n assistance:

1. Go to the **Agents** page
2. Click **Create Agent**
3. Enter a name like "n8n Assistant" or "Workflow Expert"
4. Click **Save**

Keep this agent dedicated to n8n tasks for better organization.

## Step 3: Add n8n MCP Server

You need to install the n8n MCP server to give your agent access to n8n tools.

1. Go to **MCP Registry → Add MCP Server → Local**
2. Configure the following fields:

   **Name:**

   ```
   n8n
   ```

   **Command:**

   ```
   npx
   ```

   **Arguments:**

   ```
   n8n-mcp
   ```

   **Environment Variables:**

   ```
   MCP_MODE=stdio
   LOG_LEVEL=error
   N8N_API_KEY=<your-n8n-api-key>
   N8N_API_URL=<your-n8n-url>
   DISABLE_CONSOLE_OUTPUT=true
   ```

3. Click **Install**

### Getting Your n8n API Key

To find your n8n API key:

1. Open your n8n instance
2. Click your profile picture or menu
3. Go to **Settings → n8n API**
4. Generate a new API key or copy your existing one

**Example n8n API URL formats:**

- Local: `http://localhost:5678`
- Cloud: `https://your-instance.app.n8n.cloud`
- Self-hosted: `https://n8n.yourdomain.com`

## Step 4: Assign n8n System Prompt

Archestra includes a pre-configured "n8n Expert" system prompt that provides comprehensive n8n knowledge.

1. Go to **Settings → Chat → Prompt Library**
2. Find the **"n8n Expert"** system prompt (it's pre-installed)
3. Review the prompt content to understand what expertise it provides
4. Go back to the **Agents** page
5. Find your n8n agent
6. Click the **message icon (💬)** on the agent card
7. In the dialog, select **"n8n Expert"** from the "System Prompt" dropdown
8. Click **Save Configuration**

### What the n8n Expert Prompt Does

The n8n Expert system prompt includes:

- Deep knowledge of n8n workflow design patterns
- Best practices for node configuration
- Expertise in MCP tool usage
- Validation and debugging strategies
- Understanding of n8n templates and examples
- Knowledge of common n8n integrations

## Step 5: Assign n8n MCP Tools to Agent

Make all n8n MCP tools available to your agent:

1. Go to the **Agents** page
2. Click on your n8n agent to open details
3. Navigate to the **Tools** tab or configuration
4. Find the n8n MCP server in the list
5. Select **all n8n MCP tools**
6. Click **Save Configuration**

Common n8n MCP tools include:

- `search_nodes` - Search for available n8n nodes
- `get_node_essentials` - Get node configuration details
- `search_templates` - Find workflow templates
- `validate_workflow` - Validate workflow structure
- `create_workflow` - Create new workflows
- `list_workflows` - List existing workflows
- And many more...

## Step 6: Add Regular Prompts (Optional)

Archestra includes pre-configured regular prompts for quick n8n actions:

1. Go to the **Agents** page
2. Click the **message icon (💬)** on your n8n agent
3. Under "Regular Prompts", select:
   - **"Check n8n Connectivity"** - Tests connection to your n8n instance
   - **"Create Demo AI Agent Workflow"** - Builds a sample workflow

4. Click **Save Configuration**

These prompts will appear as suggestion buttons when you start a new chat.

## Step 7: Start Using Your n8n Chat Assistant

You're all set! Now you can start chatting with your n8n expert:

1. Navigate to the **Chat** page
2. Click **New Chat** or select the agent dropdown
3. Choose your "n8n Assistant" agent
4. Click on a suggested prompt or type your own message

## Troubleshooting

### Agent Outputs XML Tool Commands Instead of Calling Tools

**Problem:** Agent responds with XML-formatted tool commands instead of actually executing the tools.

**Solution:**

1. Go to **Agents** page
2. Find your n8n agent
3. Verify that n8n MCP tools are assigned to the agent
4. If tools are not assigned, configure them and save
5. Start a new conversation

### "Anthropic API Key Required" Message

**Problem:** Chat page shows a message about missing API key.

**Solution:**

1. Go to **Settings → Chat**
2. Enter your Anthropic API key
3. Click **Save API Key**
4. Return to the Chat page

### Agent Gives Generic Responses

**Problem:** Agent doesn't seem to have n8n expertise.

**Solution:**

1. Confirm the "n8n Expert" system prompt is assigned to your agent
2. Go to **Agents** page → Click message icon → Verify system prompt
3. If not assigned, select it and save
4. Start a new conversation to see the changes

## Next Steps

Now that you have your n8n chat assistant set up:

- **Explore templates**: Ask your assistant to search for workflow templates
- **Learn best practices**: Ask questions about n8n concepts and patterns
- **Build workflows**: Start creating real workflows with step-by-step guidance
- **Share with team**: Create multiple agents for different team members
- **Customize prompts**: Create your own regular prompts for common tasks

## Related Documentation

- [Chat and Prompt Library](/docs/platform-chat-prompt-library) - Learn more about the chat feature and prompt management
- [Agents](/docs/platform-agents) - Understanding agents and their configuration
- [n8n Security Example](/docs/platform-n8n-example) - Using Archestra as a proxy for n8n workflows
