import { NextRequest } from 'next/server';

import { loadServers } from '@mcpCatalog/lib/catalog';

export async function GET(request: NextRequest, props: { params: Promise<{ params: string[] }> }) {
  const params = await props.params;
  // Expected formats:
  // /api/badge/quality/github-org/repo-name
  // /api/badge/quality/github-org/repo-name/path--to--server
  if (params.params.length < 3 || params.params[0] !== 'quality') {
    return new Response('Invalid format. Use: /api/badge/quality/github-org/repo-name[/path--to--server]', {
      status: 400,
    });
  }

  const [, githubOrg, repoName, ...pathParts] = params.params;

  // Convert path back from URL format (-- becomes /)
  const repositoryPath = pathParts.length > 0 ? pathParts.join('/').replace(/--/g, '/') : null;

  // Construct name to match the format used in loadServers
  const name = repositoryPath
    ? `${githubOrg}__${repoName}__${repositoryPath.replace(/\//g, '__')}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    : `${githubOrg}__${repoName}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  // Find the server by name
  const servers = loadServers(name);
  const server = servers[0];

  if (!server) {
    // Return a "calculating" badge instead of 404
    const label = 'Trust Score';
    const message = 'Calculating...';
    const color = '#9f9f9f'; // gray color for calculating state
    const svg = generateBadgeSVG(label, message, color);

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes (shorter for calculating state)
      },
    });
  }

  const score = server.quality_score;

  if (score === null) {
    // Return a "pending" badge for servers being evaluated
    const label = 'Trust Score';
    const message = 'Pending';
    const color = '#9f9f9f'; // gray color for pending state
    const svg = generateBadgeSVG(label, message, color);

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  }

  const color = getColor(score);
  const label = 'Trust Score';
  const message = getScoreLabel(score);

  const svg = generateBadgeSVG(label, message, color);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

function getScoreLabel(score: number): string {
  if (score >= 80) return `${score}/100`;
  if (score >= 50) return 'Good';
  return 'Developing';
}

function getColor(score: number): string {
  if (score >= 90) return '#059669'; // green-600
  if (score >= 80) return '#10b981'; // green-500
  if (score >= 70) return '#34d399'; // green-400
  if (score >= 60) return '#6ee7b7'; // emerald-400
  if (score >= 50) return '#5eead4'; // teal-400
  if (score >= 40) return '#eab308'; // yellow-500
  if (score >= 30) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function generateBadgeSVG(label: string, message: string, color: string): string {
  const labelWidth = label.length * 6 + 20;
  const messageWidth = message.length * 6 + 20;
  const totalWidth = labelWidth + messageWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${message}">
    <title>${label}: ${message}</title>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
      <rect width="${labelWidth}" height="20" fill="#555"/>
      <rect x="${labelWidth}" width="${messageWidth}" height="20" fill="${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#s)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
      <text aria-hidden="true" x="${
        (labelWidth / 2) * 10
      }" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${label}</text>
      <text x="${(labelWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff">${label}</text>
      <text aria-hidden="true" x="${
        (labelWidth + messageWidth / 2) * 10
      }" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${message}</text>
      <text x="${(labelWidth + messageWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff">${message}</text>
    </g>
  </svg>`;
}
