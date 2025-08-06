import { NextResponse } from "next/server";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  ArchestraMcpServerManifestSchema,
  ArchestraMcpServerManifestWithScoreBreakdownSchema,
  McpServerCategorySchema,
} from "../../../schemas";

const registry = new OpenAPIRegistry();

const SearchQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .describe("Search query to filter by name, description, or repository"),
  category: McpServerCategorySchema.optional().describe("Filter by category"),
  language: z.string().optional().describe("Filter by programming language"),
  sortBy: z
    .enum(["quality", "stars", "name"])
    .optional()
    .describe("Sort results by field"),
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
    .optional()
    .describe("Number of results to return"),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .optional()
    .describe("Number of results to skip"),
});

const SearchResponseSchema = z.object({
  servers: z.array(ArchestraMcpServerManifestSchema).optional(),
  totalCount: z.number().int().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
  hasMore: z.boolean().optional(),
});

const ErrorResponseSchema = z.object({
  error: z.string().optional(),
});

registry.registerPath({
  method: "get",
  path: "/search",
  summary: "Search MCP servers",
  description: "Search for MCP servers with filtering and sorting options",
  tags: ["Search"],
  request: {
    query: SearchQuerySchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: SearchResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/server/{name}",
  summary: "Get MCP server by name",
  description:
    "Retrieve detailed information about a specific MCP server by its name identifier",
  tags: ["Server"],
  request: {
    params: z.object({
      name: z
        .string()
        .describe(
          "Server name identifier (format - org__repo or org__repo__path)"
        ),
    }),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: ArchestraMcpServerManifestWithScoreBreakdownSchema,
        },
      },
    },
    404: {
      description: "Server not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/badge/quality/{org}/{repo}",
  summary: "Get quality badge",
  description: "Get an SVG quality badge for an MCP server",
  tags: ["Badges"],
  request: {
    params: z.object({
      org: z.string().describe("GitHub organization"),
      repo: z.string().describe("GitHub repository name"),
    }),
  },
  responses: {
    200: {
      description: "SVG badge image",
      content: {
        "image/svg+xml": {
          schema: z.string().describe("SVG image content"),
        },
      },
    },
    404: {
      description: "Server not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export async function GET() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return NextResponse.json(
    generator.generateDocument({
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
    })
  );
}
