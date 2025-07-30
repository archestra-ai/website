# MCP Catalog - Discover the Best Model Context Protocol Servers

Welcome to the **MCP Catalog**, your comprehensive guide to the Model Context Protocol ecosystem! 🚀

## What is the MCP Catalog?

The MCP Catalog is an open-source, community-driven directory that helps developers discover, evaluate, and choose the best MCP servers for their AI applications. With the explosion of MCP servers in the ecosystem, we recognized the need for a curated platform that highlights quality, reliability, and innovation.

### Why We Built This

- **Quality Over Quantity**: Not all MCP servers are created equal. We evaluate each server based on code quality, documentation, community support, and protocol implementation.
- **Save Time**: Stop scrolling through endless GitHub repos. Find the right MCP server for your needs quickly.
- **Community-Driven**: Built by the community, for the community. Anyone can contribute!
- **Transparency**: Our scoring algorithm is open-source and clearly documented.

## 🏆 MCP Quality Score

Each MCP server is evaluated on a 100-point scale across five key dimensions:

### 1. MCP Protocol Implementation (60 points)
- Core MCP features: tools, prompts, resources, sampling, roots, logging
- Transport protocols: STDIO and HTTP support
- Authentication: OAuth2 implementation
- *Currently, all servers receive full points as we develop automated testing*

### 2. GitHub Community Health (20 points)
- **Stars** (10 pts): Popularity and community trust
  - 1000+ stars = 10 pts
  - 501-1000 stars = 8 pts
  - 101-500 stars = 6 pts
  - 51-100 stars = 4 pts
  - 11-50 stars = 2 pts
- **Contributors** (6 pts): Community engagement
  - 10+ contributors = 6 pts
  - 4-10 contributors = 4 pts
  - 2-3 contributors = 2 pts
- **Issues** (4 pts): Development activity
  - 20+ issues = 4 pts
  - 6-20 issues = 2 pts

### 3. Development Maturity (10 points)
- CI/CD pipeline presence (5 pts)
- Published releases (5 pts)

### 4. Documentation Quality (8 points)
- Comprehensive README with setup instructions
- Usage examples and API documentation

### 5. Badge Adoption (2 points)
- Display of MCP Quality badge in README

## 🎯 Features

- **Smart Filtering**: Filter by category, programming language, or search across all fields
- **Real-time Updates**: Automatically scraped GitHub data including latest commits
- **Quality Badges**: Add our badge to your README to showcase your score
- **Detailed Views**: Deep dive into each server with full README, metrics, and configuration
- **Open Source**: Everything is transparent and contributable

## 🤝 Contributing

We welcome contributions from everyone! Here's how you can help:

### Add a New MCP Server

1. Click "Add New MCP Server" on the catalog page
2. Add your GitHub URL to `mcp-servers.json`
3. Submit a pull request
4. Our automated system will evaluate and add your server

### Update Server Information

1. Navigate to any server's detail page
2. Click "Edit This Server"
3. Update the JSON file with corrections
4. Submit a pull request

### Improve the Catalog

- Report issues or suggest features
- Improve our evaluation algorithm
- Add new categories or features
- Help with documentation

## 🛠️ Technical Architecture

The MCP Catalog is built with:

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **GitHub API**: Real-time repository data
- **Automated Scraping**: Regular updates via `scrape-github.ts`

### Key Components

- `page.tsx`: Main catalog page with filtering
- `[slug]/page.tsx`: Detailed server view
- `client.tsx`: Client-side filtering and search
- `quality-calculator.ts`: Scoring algorithm
- `scrape-github.ts`: GitHub data fetcher

## 📊 Data Structure

Each MCP server is stored with comprehensive metadata:

```typescript
interface MCPServer {
  slug: string;
  description: string;
  category: string | null;
  qualityScore: number | null;
  gitHubOrg: string;
  gitHubRepo: string;
  repositoryPath?: string | null;
  programmingLanguage: string;
  // GitHub metrics
  gh_stars: number;
  gh_contributors: number;
  gh_issues: number;
  gh_releases: boolean;
  gh_ci_cd: boolean;
  gh_latest_commit_hash?: string;
  last_scraped_at?: string;
  // MCP features
  implementing_tools: boolean;
  implementing_prompts: boolean;
  implementing_resources: boolean;
  // ... and more
}
```

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Scrape GitHub data
npm run scrape-github

# Scrape specific server
npm run scrape-github https://github.com/owner/repo
```

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with ❤️ by the Archestra.ai team and contributors worldwide. Special thanks to all MCP server developers pushing the boundaries of AI tool integration!

---

**Ready to explore?** [Visit the MCP Catalog](https://archestra.ai/mcp-catalog) and discover your next favorite MCP server!