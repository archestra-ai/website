---
title: Chat and Prompt Library
category: Archestra Platform
subcategory: Features
order: 4
description: Learn how to use Archestra's chat feature and manage prompts
---

Archestra Platform includes a built-in chat interface that provides conversational access to your AI agents. The chat feature is agent-based, meaning each conversation is tied to a specific agent with its own MCP tools and custom prompts.

## Setting Up Chat

### Configure Anthropic API Key

Before using the chat feature, you need to configure an Anthropic API key:

1. Navigate to **Settings → Chat**
2. Enter your Anthropic API key in the "API Key" field
3. Click **Save API Key**
4. Verify the "API key is configured" message appears

The chat feature uses Anthropic's Claude models through Archestra's LLM proxy, which means all security policies and tool invocation controls still apply.

### Starting a Conversation

Each conversation is tied to a specific agent. To start chatting:

1. Navigate to the **Chat** page
2. Click **New Chat** or use the agent selector dropdown
3. Choose your agent
4. Start your conversation

## MCP Tools in Chat

When MCP tools are assigned to an agent, they automatically become available in chat conversations with that agent.

### How It Works

- Claude can call MCP tools during the conversation to perform actions
- Tools are displayed in the chat interface, grouped by MCP server name
- All tool invocations go through Archestra's security policies
- Tool results are shown in the conversation with collapsible details

### Assigning Tools to Agents

To make MCP tools available in chat:

1. Go to the **Agents** page
2. Click on your agent
3. Navigate to the **Tools** tab or use the tools configuration dialog
4. Select the MCP tools you want to make available
5. Save the configuration

Now when you chat with this agent, it will be able to use these tools to help you.

## Prompts in Chat

Archestra provides two types of prompts that enhance the chat experience:

### System Prompts

**What they are:** System prompts define the agent's behavior, expertise, and personality. They set the context for how the agent responds to all messages.

**Where they appear:** System prompts are not visible in the chat UI, but they influence all of the agent's responses throughout the conversation.

**How to assign:**

1. Go to **Settings → Chat → Prompt Library**
2. Create or find your desired system prompt
3. Go to the **Agents** page
4. Click the message icon (💬) on your agent card
5. Select the system prompt from the "System Prompt" dropdown
6. Click **Save Configuration**

**Example use cases:**

- "You are an expert in n8n automation software"
- "You are a helpful customer support agent"
- "You are a technical documentation writer"

### Regular Prompts

**What they are:** Regular prompts are reusable prompt templates or suggestions that appear as quick-action buttons when starting a conversation.

**Where they appear:** Regular prompts are shown as clickable suggestion buttons on the initial screen of a new conversation, before any messages are sent.

**How to use:** Simply click on a suggestion button to send it as your first message to the agent.

**How to assign:**

1. Go to **Settings → Chat → Prompt Library**
2. Create or find your desired regular prompts
3. Go to the **Agents** page
4. Click the message icon (💬) on your agent card
5. Select multiple regular prompts from the "Regular Prompts" section
6. Click **Save Configuration**

**Example use cases:**

- "Check n8n connectivity"
- "Help me debug my workflow"
- "Create a demo webhook workflow"

## Creating and Managing Prompts

### Accessing the Prompt Library

Navigate to **Settings → Chat → Prompt Library** to manage all your prompts.

### Creating a New Prompt

1. Click the **New Prompt** button
2. Enter a descriptive name
3. Choose the type:
   - **System**: For agent behavior and expertise
   - **Regular**: For quick-action suggestions
4. Write your prompt content
5. Click **Create**

### Editing Prompts

When you edit a prompt, Archestra creates a new version:

1. Find the prompt in the library
2. Click the menu (⋮) and select **Edit**
3. Modify the name or content
4. Click **Update**

This creates a new version while preserving the history. Agents automatically use the latest active version.

### Version History

Each prompt maintains a complete version history:

- View all versions by clicking on a prompt
- See who created each version and when
- Revert to previous versions if needed

### Viewing Prompt Usage

The Prompt Library shows which agents are using each prompt:

- **Agents using: X** - Displays the count of agents using this prompt
- Agent names are shown as badges below the prompt content
- This helps you understand the impact of prompt changes

## Chat Workflow

Here's the typical workflow for using chat:

1. **Configure API Key** (one-time setup)
   - Add your Anthropic API key in Settings → Chat

2. **Create or Select an Agent**
   - Create a specialized agent or use an existing one
   - Assign MCP tools that the agent should have access to

3. **Assign Prompts** (optional but recommended)
   - Assign a system prompt to define the agent's expertise
   - Assign regular prompts for common tasks

4. **Start Chatting**
   - Go to the Chat page
   - Select your agent
   - Use prompt suggestions or type your own message
   - The agent can use assigned MCP tools during the conversation

5. **Manage Conversations**
   - All conversations are saved and can be resumed
   - Rename conversations for better organization
   - Delete old conversations when no longer needed
