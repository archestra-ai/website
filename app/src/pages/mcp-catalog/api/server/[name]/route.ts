import { NextRequest, NextResponse } from 'next/server';

import { loadServers } from '@utils/catalog';
import { calculateQualityScore } from '@utils/qualityCalculator';

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name } = params;

    if (!name) {
      return NextResponse.json({ error: 'Server name is required' }, { status: 400 });
    }

    // Load servers by name
    const servers = loadServers(name);
    const server = servers[0];

    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // Calculate trust score breakdown if score exists
    let scoreBreakdown = null;
    if (server.quality_score !== null) {
      // Load all servers for dependency commonality calculation
      const allServers = loadServers();
      scoreBreakdown = calculateQualityScore(server, allServers);
    }

    // Return detailed server information
    return NextResponse.json({
      ...server,
      scoreBreakdown,
      // Add computed fields
      githubUrl: `https://github.com/${server.github_info.owner}/${server.github_info.repo}${
        server.github_info.path ? `/tree/main/${server.github_info.path}` : ''
      }`,
      badgeUrl: server.github_info.path
        ? `https://archestra.ai/mcp-catalog/api/badge/quality/${
            server.github_info.owner
          }/${server.github_info.repo}/${server.github_info.path.replace(/\//g, '--')}`
        : `https://archestra.ai/mcp-catalog/api/badge/quality/${server.github_info.owner}/${server.github_info.repo}`,
      detailPageUrl: `https://archestra.ai/mcp-catalog/${server.name}`,
    });
  } catch (error) {
    console.error('Server API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
