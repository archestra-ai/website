# Archestra.ai Website

The official website for [Archestra.ai](https://archestra.ai) - the enterprise MCP platform for AI agents. This repository hosts our main website and the comprehensive MCP (Model Context Protocol) catalog.

## 🌟 Features

- **MCP Catalog**: Browse and discover 900+ Model Context Protocol servers
- **Trust Scores**: Automated quality assessment for MCP servers
- **Search & Filter**: Find servers by category, language, features, and dependencies
- **Badge System**: Display trust scores in your README
- **Community-Driven**: Open-source catalog that anyone can contribute to

## 🏗️ Architecture

Built with modern web technologies:

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Analytics**: PostHog
- **Language**: TypeScript
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 24.4+
- pnpm 10.14.0

### Installation

```bash
# Clone the repository
git clone https://github.com/archestra-ai/website.git
cd website

# Navigate to the app directory
cd app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The site will be available at `http://localhost:3000`.

## 📦 Project Structure

```
website/
├── app/                    # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── data/          # MCP catalog data
│   │   │   ├── mcp-evaluations/  # Individual server JSONs
│   │   │   └── mcp-servers.json  # Main catalog index
│   │   ├── utils/         # Utility functions
│   │   └── constants.ts   # Global constants
│   ├── scripts/           # Build and catalog scripts
│   └── public/           # Static assets
└── .github/              # GitHub Actions workflows
```

## 🤝 Contributing to the MCP Catalog

### Adding a New MCP Server

1. Fork this repository
2. Edit `app/src/data/mcp-servers.json`
3. Add your server entry following the existing format
4. Submit a pull request

### Updating Server Information

Individual server evaluations are stored in `app/src/data/mcp-evaluations/`. To update:

1. Find the JSON file for your server (format: `githubOrg__repoName.json`)
2. Edit the file with updated information
3. Submit a pull request

## 🛠️ Development Commands

```bash
# Development
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm typecheck     # Run TypeScript type checking

# Catalog Management
pnpm catalog:validate    # Validate catalog JSON files
pnpm catalog:evaluate    # Run evaluation on catalog servers
```

## 📊 MCP Trust Score

Our trust score algorithm evaluates servers based on:

- **MCP Protocol Implementation** (25 points)
- **GitHub Metrics** (20 points)
- **Deployment Maturity** (20 points)
- **Documentation Quality** (15 points)
- **Dependency Management** (15 points)
- **Badge Usage** (5 points)

### Adding a Trust Badge

Display your server's trust score in your README:

```markdown
[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/YOUR-ORG/YOUR-REPO)](https://archestra.ai/mcp-catalog/YOUR-ORG__YOUR-REPO)
```

## 🔄 CI/CD

The project uses GitHub Actions for:

- **Linting**: Code formatting with Prettier
- **Type Checking**: TypeScript validation
- **Catalog Validation**: Ensures all MCP server entries are valid
- **Build Testing**: Verifies the application builds successfully

## 🌐 Deployment

The website is automatically deployed when changes are pushed to the `main` branch.

## 📝 Environment Variables

No environment variables are required for basic development. For full functionality:

- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST`: PostHog host URL

## 🤔 FAQ

**Q: How often is the catalog updated?**
A: The catalog is continuously updated through community contributions. Server metrics are refreshed periodically.

**Q: Can I add a private/proprietary MCP server?**
A: The catalog is designed for open-source servers. For enterprise solutions, contact Archestra directly.

**Q: How do I improve my trust score?**
A: Focus on implementing MCP features, maintaining good documentation, having CI/CD, and managing dependencies properly.

## 🔗 Links

- [Archestra.ai](https://archestra.ai)
- [MCP Catalog](https://archestra.ai/mcp-catalog)
- [Documentation](https://archestra.ai/docs)
- [Join our Slack](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/archestra-ai/website/issues)
- **Community**: [Slack Community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg)
- **Twitter**: [@archestra_ai](https://twitter.com/archestra_ai)

---

Built with ❤️ by the Archestra team and contributors
