import { NextRequest, NextResponse } from 'next/server';

import { loadServers } from '@utils/catalog';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const language = searchParams.get('language') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'quality'; // quality, stars, name

    // Load all servers
    const allServers = loadServers();

    // Filter servers
    let filteredServers = allServers.filter(
      ({
        name,
        description,
        github_info: { owner, repo },
        category: serverCategory,
        programming_language: programmingLanguage,
      }) => {
        // Search query filter
        if (query) {
          const searchQuery = query.toLowerCase();
          const matchesSearch =
            name.toLowerCase().includes(searchQuery) ||
            description.toLowerCase().includes(searchQuery) ||
            owner.toLowerCase().includes(searchQuery) ||
            repo.toLowerCase().includes(searchQuery);

          if (!matchesSearch) return false;
        }

        // Category filter
        if (category && serverCategory !== category) {
          return false;
        }

        // Language filter
        if (language && programmingLanguage !== language) {
          return false;
        }

        return true;
      }
    );

    // Sort servers
    filteredServers.sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          // Sort by trust score (descending), null values last
          if (a.quality_score === null && b.quality_score === null) return 0;
          if (a.quality_score === null) return 1;
          if (b.quality_score === null) return -1;
          return b.quality_score - a.quality_score;

        case 'stars':
          // Sort by GitHub stars (descending)
          return (b.github_info.stars || 0) - (a.github_info.stars || 0);

        case 'name':
          // Sort alphabetically by name
          return a.name.localeCompare(b.name);

        default:
          return 0;
      }
    });

    // Apply pagination
    const totalCount = filteredServers.length;
    const paginatedServers = filteredServers.slice(offset, offset + limit);

    // Return response with CORS headers
    const response = NextResponse.json({
      servers: paginatedServers,
      totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    });

    // Add CORS headers to allow access from any origin
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });

  // Add CORS headers for preflight requests
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}
