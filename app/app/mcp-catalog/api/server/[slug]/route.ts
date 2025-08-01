import { NextRequest, NextResponse } from "next/server";
import { loadServers } from "../../../lib/server-utils";
import { calculateQualityScore } from "../../../lib/quality-calculator";

/**
 * @swagger
 * /api/server/{slug}:
 *   get:
 *     summary: Get server details
 *     description: Get detailed information about a specific MCP server
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Server slug identifier (format - org__repo or org__repo__path)
 *         example: github__github-mcp-server
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MCPServer'
 *                 - type: object
 *                   properties:
 *                     scoreBreakdown:
 *                       type: object
 *                       properties:
 *                         mcpProtocol:
 *                           type: integer
 *                           description: Points for MCP protocol implementation (max 60)
 *                         githubMetrics:
 *                           type: integer
 *                           description: Points for GitHub community metrics (max 20)
 *                         deploymentMaturity:
 *                           type: integer
 *                           description: Points for CI/CD and releases (max 10)
 *                         documentation:
 *                           type: integer
 *                           description: Points for README quality (max 8)
 *                         badgeUsage:
 *                           type: integer
 *                           description: Points for displaying quality badge (max 2)
 *                         total:
 *                           type: integer
 *                           description: Total quality score (max 100)
 *                     githubUrl:
 *                       type: string
 *                       description: Direct link to GitHub repository
 *                     badgeUrl:
 *                       type: string
 *                       description: URL for the quality badge SVG
 *                     detailPageUrl:
 *                       type: string
 *                       description: URL to the server's detail page on MCP Catalog
 *       404:
 *         description: Server not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: "Server slug is required" },
        { status: 400 }
      );
    }

    // Load servers by slug
    const servers = loadServers(slug);
    const server = servers[0];

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    // Calculate quality score breakdown if score exists
    let scoreBreakdown = null;
    if (server.qualityScore !== null) {
      scoreBreakdown = calculateQualityScore(server, server.readme);
    }

    // Return detailed server information
    return NextResponse.json({
      ...server,
      scoreBreakdown,
      // Add computed fields
      githubUrl: `https://github.com/${server.gitHubOrg}/${server.gitHubRepo}${
        server.repositoryPath ? `/tree/main/${server.repositoryPath}` : ""
      }`,
      badgeUrl: server.repositoryPath
        ? `https://archestra.ai/mcp-catalog/api/badge/quality/${server.gitHubOrg}/${server.gitHubRepo}/${server.repositoryPath.replace(/\//g, "--")}`
        : `https://archestra.ai/mcp-catalog/api/badge/quality/${server.gitHubOrg}/${server.gitHubRepo}`,
      detailPageUrl: `https://archestra.ai/mcp-catalog/${server.slug}`,
    });
  } catch (error) {
    console.error("Server API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}