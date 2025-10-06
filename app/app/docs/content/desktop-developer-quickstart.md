---
title: Developer Quickstart
category: Archestra Desktop Agent
order: 10
---

> **Note:** The development environment currently supports **macOS only**. Windows and Linux support is coming soon.

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`
- **Git**

## Clone the Repository

```bash
git clone https://github.com/archestra-ai/archestra.git
cd archestra/desktop_app
```

## Install Dependencies

Use pnpm to install all required dependencies:

```bash
pnpm install
```

## Start Development

Run the application in development mode:

```bash
pnpm start
```

This will launch the Archestra desktop application with hot-reload enabled for development.

## Project Structure

```
archestra/
├── desktop_app/          # Electron desktop application
├── oauth_proxy/          # OAuth authentication proxy
├── mcp_server_docker_image/  # Docker runtime for MCP servers
└── mcp_catalog/          # MCP server catalog
```

## Development Commands

### Desktop Application

Navigate to the desktop app directory:

```bash
cd desktop_app
```

Available commands:

- `pnpm start` - Start the application in development mode
- `pnpm build` - Build the application for production
- `pnpm test` - Run tests
- `pnpm lint` - Run linting
- `pnpm db:studio` - Open Drizzle Studio GUI to view and manage the database

## Getting Help

- Join our [Slack Community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg)
- Check out the [GitHub Issues](https://github.com/archestra-ai/archestra/issues)
