# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Archestra.ai website - a Next.js application that hosts the MCP (Model Context Protocol) catalog and company website. The project serves as an enterprise MCP platform for AI agents with security guardrails and compliance features.

## Key Commands

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm typecheck` - Run TypeScript type checking

### Catalog Operations

- `pnpm catalog:evaluate` - Run evaluation script for MCP catalog servers
- `pnpm catalog:validate` - Validate catalog data structure

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Package Manager**: pnpm (v10.14.0)
- **Styling**: Tailwind CSS with tailwindcss-animate
- **UI Components**: Custom components using Radix UI primitives
- **Analytics**: PostHog integration
- **Markdown Processing**: react-markdown with rehype/remark plugins

### Directory Structure

```
/src
├── app/           # Next.js app router pages
│   ├── about/
│   ├── api/
│   ├── blog/
│   ├── mcp-catalog/
│   └── state-of-mcp/
├── components/    # React components
│   ├── McpServer/ # MCP catalog specific components
│   └── ui/        # Reusable UI components
├── data/          # MCP catalog data
│   ├── mcp-evaluations/ # Individual server evaluation JSONs
│   └── mcp-servers.json # Main catalog file
├── providers/     # Context providers (PostHog, etc.)
├── utils/         # Utility functions
└── constants.ts   # Global constants
├── scripts/           # Build and catalog scripts
└── public/           # Static assets
```

### Important Configuration

The project has ESLint and TypeScript build errors disabled in `next.config.mjs`:

```javascript
eslint: {
  ignoreDuringBuilds: true;
}
typescript: {
  ignoreBuildErrors: true;
}
```

This means you should manually run `pnpm typecheck` to check for TypeScript errors.

### MCP Catalog System

The MCP catalog is a core feature that:

1. Stores server metadata in `/src/data/mcp-servers.json`
2. Individual server evaluations in `/src/data/mcp-evaluations/*.json`
3. Provides quality scoring via `utils/qualityCalculator.ts`
4. Generates badges at `/mcp-catalog/api/badge/quality/[org]/[repo]`
5. Server detail pages at `/mcp-catalog/[name]`

### Key Utilities

- **GitHub Integration**: `utils/github.ts` - GitHub API interactions
- **Quality Calculator**: `utils/qualityCalculator.ts` - Scoring algorithm for MCP servers
- **Catalog Utils**: `utils/catalog.ts` - Catalog data handling
- **Blog Utils**: `utils/blog.ts` - Blog post processing

### API Routes

The application includes several API routes:

- Badge generation
- Search functionality
- Server details
- Documentation endpoints

### Deployment Considerations

- Uses PostHog reverse proxy configuration for analytics
- Images are unoptimized (configured in next.config.mjs)
- Lucide React icons are optimized via experimental feature

## Working with the Codebase

When making changes:

1. Follow the existing component structure and patterns
2. Use absolute imports with the configured path aliases (@components, @utils, etc.)
3. Maintain the existing code style (enforced by prettier with import sorting)
4. Test changes with `pnpm dev` before committing
5. Run `pnpm typecheck` to catch type errors

The project uses lint-staged with prettier for automatic formatting on commit.
