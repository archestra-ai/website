import { NextRequest, NextResponse } from "next/server";
import { loadServers } from "../../lib/server-utils";
import { MCPServer } from "../../data/types";

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search MCP servers
 *     description: Search for MCP servers with filtering and sorting options
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query to filter by name, description, or repository
 *         example: github
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Aggregators, Art & Culture, Healthcare, Browser Automation, Cloud, Development, CLI Tools, Communication, Data, Logistics, Data Science, IoT, File Management, Finance, Gaming, Knowledge, Location, Marketing, Monitoring, Media, AI Tools, Search, Security, Social Media, Sports, Support, Translation, Audio, Travel, Productivity, Utilities]
 *         description: Filter by category
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by programming language
 *         example: TypeScript
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [quality, stars, name]
 *           default: quality
 *         description: Sort results by field
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 servers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MCPServer'
 *                 totalCount:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const language = searchParams.get("language") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "quality"; // quality, stars, name

    // Load all servers
    const allServers = loadServers();

    // Filter servers
    let filteredServers = allServers.filter((server) => {
      // Search query filter
      if (query) {
        const searchQuery = query.toLowerCase();
        const matchesSearch = 
          server.name.toLowerCase().includes(searchQuery) ||
          server.description.toLowerCase().includes(searchQuery) ||
          server.gitHubOrg.toLowerCase().includes(searchQuery) ||
          server.gitHubRepo.toLowerCase().includes(searchQuery);
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (category && server.category !== category) {
        return false;
      }

      // Language filter
      if (language && server.programmingLanguage !== language) {
        return false;
      }

      return true;
    });

    // Sort servers
    filteredServers.sort((a, b) => {
      switch (sortBy) {
        case "quality":
          // Sort by trust score (descending), null values last
          if (a.qualityScore === null && b.qualityScore === null) return 0;
          if (a.qualityScore === null) return 1;
          if (b.qualityScore === null) return -1;
          return b.qualityScore - a.qualityScore;
        
        case "stars":
          // Sort by GitHub stars (descending)
          return (b.gh_stars || 0) - (a.gh_stars || 0);
        
        case "name":
          // Sort alphabetically by name
          return a.name.localeCompare(b.name);
        
        default:
          return 0;
      }
    });

    // Apply pagination
    const totalCount = filteredServers.length;
    const paginatedServers = filteredServers.slice(offset, offset + limit);

    // Return response
    return NextResponse.json({
      servers: paginatedServers,
      totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}