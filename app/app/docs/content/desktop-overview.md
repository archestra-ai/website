---
title: 🚀 Overview
category: Archestra Desktop Agent
order: 1
---

![Archestra Desktop](/docs/desktop_screenshot.png)

Archestra Desktop Agent is a local AI client that simplifies secure, enterprise-grade AI <-> data interactions through the Model Context Protocol (MCP). It provides a unified interface for both local and cloud-based models, as well as remote and local MCP servers.

## Key Features

🔥 Unique Authentication — No need to toss API keys and config files to run MCP!
🔒 Sandboxed MCP Runtime — Isolated sandbox protecting the host from supply chain attacks.
🔌 Full OSS MCPs Support — Compatible with thousands of existing MCP servers.
💻 Local-First Architecture — Privacy-focused design with local LLM.

## Architecture Overview

The Archestra Desktop Agent architecture consists of several key components working together to provide a seamless experience:

![Archestra Desktop Architecture](/docs/architecture.png)

1. **ChatGPT-like UI**: A familiar, user-friendly interface for interacting with AI models
2. **MCP Orchestrator**: The central hub managing all MCP connections and operations
3. **Authentication Engine**: Handles secure authentication and authorization
4. **Virtual Machine**: Provides isolated execution environments for local MCP servers
5. **MCP Gateway**: Manages connections to local & remote MCP servers
6. **Archestra MCP Server**: Built-in MCP server for dynamic tool management

## Component Details

### 🖥️ ChatGPT-like UI

The user interface is built with modern web technologies to provide a familiar chat experience. It uses React with TanStack Router for navigation, Tailwind CSS for styling, and custom components built on Radix UI primitives. The interface supports multiple chat sessions, real-time streaming responses, and displays tool invocations transparently. It includes features like dark mode, typewriter effects for AI responses, and a sidebar for managing chats and MCP servers.

### 🎯 MCP Orchestrator

The MCP Orchestrator (implemented as `ToolAggregator`) is the central coordination layer that manages all MCP connections and tool availability. It combines tools from multiple sources including sandboxed MCP servers and the built-in Archestra MCP server. The orchestrator handles tool discovery, maintains a unified tool registry, and routes tool invocations to the appropriate MCP servers. It ensures tools are properly namespaced to avoid conflicts between different servers.

### 🔐 Authentication Engine

The Authentication Engine provides secure authentication without exposing API keys or secrets to MCP servers. It features:

- **Browser-based authentication** for services like Slack and LinkedIn, extracting tokens directly from authenticated browser sessions
- **OAuth proxy server** that securely handles OAuth flows, adding client secrets server-side while supporting PKCE
- **Provider registry** system for managing different authentication methods
- Automatic token extraction and refresh mechanisms

### 🛡️ Virtual Machine (Sandbox)

The Virtual Machine component uses Podman to provide isolated execution environments for MCP servers, protecting the host system from potential security risks. Key features include:

- **Podman machine management** for running containers in a lightweight VM
- **Container isolation** with each MCP server running in its own container
- **Resource management** and monitoring of containerized servers
- **Base image system** for efficient deployment of MCP servers
- **Socket-based communication** between the host and containerized services

### 🔌 MCP Gateway

The MCP Gateway manages connections to both local and remote MCP servers, acting as a bridge between the Archestra client and various MCP implementations. It handles:

- **External MCP client integration** with tools like Claude Desktop, Cursor, and VS Code
- **Configuration management** for different MCP client types
- **Server discovery and registration**
- **Connection pooling and lifecycle management**
- **Protocol translation** between different MCP client implementations

### 🏗️ Archestra MCP Server

The built-in Archestra MCP Server provides essential system management capabilities through a set of powerful tools. It connects via HTTP transport to the local MCP endpoint and offers the following tools:

#### Memory Management Tools

- **`list_memories`** - List all stored memory entries with their names and values
- **`set_memory`** - Set or update a memory entry with a specific name and value (persists across chat sessions)
- **`delete_memory`** - Delete a specific memory entry by name

#### Tool Management Tools

- **`list_available_tools`** - List available MCP servers or tools for a specific server
- **`enable_tools`** - Enable specific tools for use in the current chat
- **`disable_tools`** - Disable specific tools from the current chat

These tools enable:

- **Persistent memory storage** across chat sessions for context retention
- **Dynamic tool discovery** to explore available capabilities
- **Fine-grained control** over which tools are accessible in each chat
- **Real-time updates** via WebSocket for memory synchronization

### Releases & Changelog

Available here: https://github.com/archestra-ai/archestra/releases
