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
- `pnpm prettier --write .` - Format all files with Prettier

### Testing

- `pnpm test` - Run all tests
- `pnpm test --watch` - Run tests in watch mode
- `pnpm test src/app/mcp-catalog/api/search/route.test.ts` - Run specific test file
- `pnpm test -t "should filter servers"` - Run tests matching description
- `pnpm test --coverage` - Run tests with coverage report

### Catalog Operations

- `pnpm catalog:evaluate` - Run evaluation script for MCP catalog servers
- `pnpm catalog:validate` - Validate catalog data structure

### API Documentation

- `pnpm openapi:generate` - Generate OpenAPI specification and format with prettier
  - **IMPORTANT**: Run this command whenever you modify API endpoints, schemas, or documentation in the MCP catalog API to regenerate the OpenAPI schema

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Package Manager**: pnpm (v10.14.0)
- **Testing**: Vitest with React Testing Library
- **Styling**: Tailwind CSS with tailwindcss-animate
- **UI Components**: Custom components using Radix UI primitives
- **Analytics**: PostHog integration
- **API Documentation**: Swagger UI with OpenAPI 3.0
- **Validation**: Zod schemas with zod-to-openapi
- **Markdown Processing**: react-markdown with rehype/remark plugins

### Directory Structure

```
/app
├── app/           # Next.js app router pages
│   ├── about/
│   ├── blog/
│   │   ├── [slug]/    # Dynamic blog post pages
│   │   ├── page.tsx   # Blog listing page
│   │   └── utils.ts   # Blog utilities (reads from /content/blog)
│   ├── mcp-catalog/
│   │   ├── api/       # API routes with OpenAPI generation
│   │   ├── api-docs/  # Swagger UI documentation
│   │   ├── components/# Catalog-specific components
│   │   ├── data/      # MCP catalog data
│   │   │   ├── mcp-evaluations/ # Individual server evaluation JSONs
│   │   │   └── mcp-servers.json # Main catalog file
│   │   ├── lib/       # Catalog utilities
│   │   │   ├── catalog.ts
│   │   │   ├── quality-calculator/
│   │   │   └── trust-score-badge/
│   │   └── scripts/   # Build and catalog scripts
│   └── state-of-mcp/
├── components/    # Shared React components
│   └── ui/        # Reusable UI components
├── content/       # Content directory (gitignored)
│   └── blog/      # Blog posts in markdown format
├── lib/           # Global utilities
└── public/        # Static assets
```

### Important Configuration

The project has ESLint and TypeScript build errors disabled in `next.config.mjs`:

```javascript
eslint: {
  ignoreDuringBuilds: true,
}
typescript: {
  ignoreBuildErrors: true,
}
```

This means you should manually run `pnpm typecheck` to check for TypeScript errors.

CORS headers are centrally configured in `next.config.mjs` for all `/mcp-catalog/api/*` routes.

### MCP Catalog System

The MCP catalog is a core feature that:

1. Stores server metadata in `/app/app/mcp-catalog/data/mcp-servers.json`
2. Individual server evaluations in `/app/app/mcp-catalog/data/mcp-evaluations/*.json`
3. Provides quality scoring via `app/mcp-catalog/lib/quality-calculator/index.ts`
4. Generates badges at `/mcp-catalog/api/badge/quality/[org]/[repo]`
5. Server detail pages at `/mcp-catalog/[name]`

#### Quality Scoring Algorithm

The MCP servers are scored on a 0-100 scale based on:

- **MCP Protocol Implementation** (40 points max) - Tools, resources, prompts, sampling features
- **GitHub Metrics** (20 points max) - Stars, contributors, issues (adjusted for multi-server repos)
- **Documentation Quality** (20 points max)
- **Code Quality** (20 points max)

### API Routes and OpenAPI Workflow

The MCP Catalog API provides:

- `/mcp-catalog/api/search` - Search servers with filtering and pagination
- `/mcp-catalog/api/server/[name]` - Get individual server details
- `/mcp-catalog/api/category` - List available categories
- `/mcp-catalog/api/badge/quality/[org]/[repo]` - SVG quality badges
- `/mcp-catalog/api/docs` - OpenAPI specification endpoint
- `/mcp-catalog/api-docs` - Swagger UI documentation

**OpenAPI Generation Workflow:**

1. API schemas defined with Zod in `/app/app/mcp-catalog/api/schemas.ts`
2. Endpoints registered in `/app/app/mcp-catalog/api/openapi.ts`
3. Run `pnpm openapi:generate` to generate `/app/app/mcp-catalog/api/docs/openapi.json`
4. CI validates that OpenAPI spec is up-to-date

All API routes use Zod validation for request parameters and response data.

### Blog System

The blog system:

- Reads markdown files from `/content/blog/*.md` (content directory is gitignored)
- Uses gray-matter for front matter parsing
- Calculates reading time automatically
- Supports author profiles and dates
- Renders markdown with react-markdown and syntax highlighting

### CI/CD Pipeline

GitHub Actions workflows enforce:

- PR title linting (conventional commits)
- Prettier formatting
- TypeScript type checking
- Unit test execution
- Production build validation
- Catalog data validation
- OpenAPI schema consistency
- Security analysis with Zizmor

### Deployment Considerations

- Uses PostHog reverse proxy configuration for analytics
- Images are unoptimized (configured in next.config.mjs)
- Lucide React icons are optimized via experimental feature

## Working with the Codebase

When making changes:

1. Follow the existing component structure and patterns
2. Use absolute imports with the configured path aliases (@components, @lib, @mcpCatalog, @constants)
3. Maintain the existing code style (enforced by prettier with import sorting via @trivago plugin)
4. Test changes with `pnpm dev` before committing
5. Run `pnpm typecheck` to catch type errors
6. Update OpenAPI spec with `pnpm openapi:generate` when modifying API endpoints
7. Write tests for new functionality, mock external dependencies
8. The project uses lint-staged with prettier for automatic formatting on commit
9. When working with the catalog data, ensure JSON validity with `pnpm catalog:validate`
