import { MCPServer } from "../data/types";

export interface QualityScoreBreakdown {
  mcpProtocol: number;
  githubMetrics: number;
  deploymentMaturity: number;
  documentation: number;
  badgeUsage: number;
  total: number;
}

/**
 * Calculate MCP Protocol Implementation Score (60 points max)
 * Based on implementing various MCP protocol features
 */
export function calculateMCPProtocolScore(server: MCPServer): number {
  // TBD: Give maximum points to all servers for now
  return 60;
}

/**
 * Calculate GitHub Metrics Score (20 points max)
 * Progressive scoring: higher stars, contributors, and issues = higher score
 */
export function calculateGitHubMetricsScore(server: MCPServer): number {
  let score = 0;

  // Stars scoring (0-10 points)
  // 0-10 stars: 0 points, 11-50: 2 points, 51-100: 4 points, 101-500: 6 points, 501-1000: 8 points, >1000: 10 points
  if (server.gh_stars > 1000) score += 10;
  else if (server.gh_stars > 500) score += 8;
  else if (server.gh_stars > 100) score += 6;
  else if (server.gh_stars > 50) score += 4;
  else if (server.gh_stars > 10) score += 2;

  // Contributors scoring (0-6 points)
  // 1 contributor: 0 points, 2-3: 2 points, 4-10: 4 points, >10: 6 points
  if (server.gh_contributors > 10) score += 6;
  else if (server.gh_contributors >= 4) score += 4;
  else if (server.gh_contributors >= 2) score += 2;

  // Issues scoring (0-4 points)
  // 0-5 issues: 0 points, 6-20: 2 points, >20: 4 points
  if (server.gh_issues > 20) score += 4;
  else if (server.gh_issues > 5) score += 2;

  return Math.min(score, 20);
}

/**
 * Calculate Deployment Maturity Score (10 points max)
 * Based on CI/CD, versioning, and release practices
 */
export function calculateDeploymentMaturityScore(server: MCPServer): number {
  let score = 0;

  // Check for CI/CD (GitHub Actions, etc.) - 5 points
  if (server.gh_ci_cd) {
    score += 5;
  }

  // Check for releases - 5 points
  if (server.gh_releases) {
    score += 5;
  }

  return Math.min(score, 10);
}

/**
 * Calculate Documentation Score (8 points max)
 * Based on basic documentation completeness
 */
export function calculateDocumentationScore(server: MCPServer): number {
  let score = 0;

  // Extended documentation - has readme
  if (server.readme && server.readme.length > 100) {
    score += 8;
  }

  return Math.min(score, 8);
}

/**
 * Calculate Badge Usage Score (2 points max)
 * 2 points for using our badge in README.md
 * Note: This would require checking the actual README content from GitHub
 */
export function calculateBadgeUsageScore(
  server: MCPServer,
  readmeContent?: string,
): number {
  if (!readmeContent) {
    return 0;
  }

  // Check for our specific Archestra MCP Quality badge pattern
  const archestraBadgePattern = /\[\!\[MCP Quality\]\(https:\/\/archestra\.ai\/api\/badge\/quality\//i;

  return archestraBadgePattern.test(readmeContent) ? 2 : 0;
}

/**
 * Calculate total quality score with breakdown
 */
export function calculateQualityScore(
  server: MCPServer,
  readmeContent?: string,
): QualityScoreBreakdown {
  const mcpProtocol = calculateMCPProtocolScore(server);
  const githubMetrics = calculateGitHubMetricsScore(server);
  const deploymentMaturity = calculateDeploymentMaturityScore(server);
  const documentation = calculateDocumentationScore(server);
  const badgeUsage = calculateBadgeUsageScore(server, readmeContent);

  const total =
    mcpProtocol +
    githubMetrics +
    deploymentMaturity +
    documentation +
    badgeUsage;

  return {
    mcpProtocol,
    githubMetrics,
    deploymentMaturity,
    documentation,
    badgeUsage,
    total,
  };
}
