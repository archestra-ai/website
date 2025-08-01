import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "MCP Catalog API",
      version: "1.0.0",
      description: "API for searching and retrieving MCP server information",
    },
    servers: [
      {
        url: "/mcp-catalog/api",
        description: "MCP Catalog API",
      },
    ],
    paths: {
      "/search": {
        get: {
          summary: "Search MCP servers",
          description: "Search for MCP servers with filtering and sorting options",
          tags: ["Search"],
          parameters: [
            {
              name: "q",
              in: "query",
              description: "Search query to filter by name, description, or repository",
              required: false,
              schema: { type: "string" },
              example: "github",
            },
            {
              name: "category",
              in: "query",
              description: "Filter by category",
              required: false,
              schema: { 
                type: "string",
                enum: [
                  "Aggregators", "Art & Culture", "Healthcare", "Browser Automation",
                  "Cloud", "Development", "CLI Tools", "Communication", "Data",
                  "Logistics", "Data Science", "IoT", "File Management", "Finance",
                  "Gaming", "Knowledge", "Location", "Marketing", "Monitoring",
                  "Media", "AI Tools", "Search", "Security", "Social Media",
                  "Sports", "Support", "Translation", "Audio", "Travel",
                  "Productivity", "Utilities"
                ]
              },
            },
            {
              name: "language",
              in: "query",
              description: "Filter by programming language",
              required: false,
              schema: { type: "string" },
              example: "TypeScript",
            },
            {
              name: "sortBy",
              in: "query",
              description: "Sort results by field",
              required: false,
              schema: {
                type: "string",
                enum: ["quality", "stars", "name"],
                default: "quality",
              },
            },
            {
              name: "limit",
              in: "query",
              description: "Number of results to return",
              required: false,
              schema: {
                type: "integer",
                default: 50,
                minimum: 1,
                maximum: 100,
              },
            },
            {
              name: "offset",
              in: "query",
              description: "Number of results to skip",
              required: false,
              schema: {
                type: "integer",
                default: 0,
                minimum: 0,
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      servers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/MCPServer" },
                      },
                      totalCount: { type: "integer" },
                      limit: { type: "integer" },
                      offset: { type: "integer" },
                      hasMore: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/server/{slug}": {
        get: {
          summary: "Get server details",
          description: "Get detailed information about a specific MCP server",
          tags: ["Servers"],
          parameters: [
            {
              name: "slug",
              in: "path",
              description: "Server slug identifier (format - org__repo or org__repo__path)",
              required: true,
              schema: { type: "string" },
              example: "github__github-mcp-server",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/MCPServer" },
                      {
                        type: "object",
                        properties: {
                          scoreBreakdown: {
                            type: "object",
                            properties: {
                              mcpProtocol: { 
                                type: "integer",
                                description: "Points for MCP protocol implementation (max 60)"
                              },
                              githubMetrics: { 
                                type: "integer",
                                description: "Points for GitHub community metrics (max 20)"
                              },
                              deploymentMaturity: { 
                                type: "integer",
                                description: "Points for CI/CD and releases (max 10)"
                              },
                              documentation: { 
                                type: "integer",
                                description: "Points for README quality (max 8)"
                              },
                              badgeUsage: { 
                                type: "integer",
                                description: "Points for displaying quality badge (max 2)"
                              },
                              total: { 
                                type: "integer",
                                description: "Total quality score (max 100)"
                              },
                            },
                          },
                          githubUrl: { 
                            type: "string",
                            description: "Direct link to GitHub repository"
                          },
                          badgeUrl: { 
                            type: "string",
                            description: "URL for the quality badge SVG"
                          },
                          detailPageUrl: { 
                            type: "string",
                            description: "URL to the server's detail page on MCP Catalog"
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "404": {
              description: "Server not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/badge/quality/{org}/{repo}": {
        get: {
          summary: "Get quality badge",
          description: "Get an SVG quality badge for an MCP server",
          tags: ["Badges"],
          parameters: [
            {
              name: "org",
              in: "path",
              description: "GitHub organization",
              required: true,
              schema: { type: "string" },
              example: "github",
            },
            {
              name: "repo",
              in: "path",
              description: "GitHub repository name",
              required: true,
              schema: { type: "string" },
              example: "github-mcp-server",
            },
          ],
          responses: {
            "200": {
              description: "SVG badge image",
              content: {
                "image/svg+xml": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
      "/badge/quality/{org}/{repo}/{path}": {
        get: {
          summary: "Get quality badge for sub-path",
          description: "Get an SVG quality badge for an MCP server in a repository sub-path",
          tags: ["Badges"],
          parameters: [
            {
              name: "org",
              in: "path",
              description: "GitHub organization",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "repo",
              in: "path",
              description: "GitHub repository name",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "path",
              in: "path",
              description: "Repository sub-path (use -- instead of /)",
              required: true,
              schema: { type: "string" },
              example: "src--servers--mcp",
            },
          ],
          responses: {
            "200": {
              description: "SVG badge image",
              content: {
                "image/svg+xml": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        MCPServer: {
          type: "object",
          description: "MCP Server information",
          properties: {
            slug: { 
              type: "string",
              description: "Unique identifier for the server",
              example: "github__github-mcp-server"
            },
            name: { 
              type: "string",
              description: "Display name of the server",
              example: "GitHub MCP Server"
            },
            description: { 
              type: "string",
              description: "Brief description of the server's functionality"
            },
            category: { 
              type: "string", 
              nullable: true,
              description: "Server category"
            },
            qualityScore: { 
              type: "integer", 
              nullable: true,
              minimum: 0,
              maximum: 100,
              description: "Quality score based on various metrics"
            },
            gitHubOrg: { 
              type: "string",
              description: "GitHub organization name"
            },
            gitHubRepo: { 
              type: "string",
              description: "GitHub repository name"
            },
            repositoryPath: { 
              type: "string", 
              nullable: true,
              description: "Path within the repository where the server is located"
            },
            programmingLanguage: { 
              type: "string",
              description: "Primary programming language"
            },
            gh_stars: { 
              type: "integer",
              description: "Number of GitHub stars"
            },
            gh_contributors: { 
              type: "integer",
              description: "Number of contributors"
            },
            gh_issues: { 
              type: "integer",
              description: "Number of open issues"
            },
            gh_releases: { 
              type: "boolean",
              description: "Whether the repository has releases"
            },
            gh_ci_cd: { 
              type: "boolean",
              description: "Whether CI/CD is configured"
            },
            configForClients: { 
              type: "object", 
              nullable: true,
              description: "Configuration for MCP clients"
            },
            configForArchestra: { 
              type: "object", 
              nullable: true,
              description: "Configuration specific to Archestra"
            },
          },
          required: ["slug", "name", "description", "gitHubOrg", "gitHubRepo", "programmingLanguage"],
        },
      },
    },
    tags: [
      { name: "Search", description: "Search and filter MCP servers" },
      { name: "Servers", description: "Get detailed server information" },
      { name: "Badges", description: "Generate quality badges" },
    ],
  };
  
  return NextResponse.json(spec);
}