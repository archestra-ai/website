import { MCPServer } from "../data/types";

export interface QualityScoreBreakdown {
  mcpProtocol: number;
  githubMetrics: number;
  deploymentMaturity: number;
  documentation: number;
  dependencies: number;
  badgeUsage: number;
  total: number;
}

/**
 * Calculate MCP Protocol Implementation Score (40 points max)
 * Based on implementing various MCP protocol features
 */
export function calculateMCPProtocolScore(server: MCPServer): number {
  // If protocol features haven't been analyzed yet, give full points (assume the best)
  if (server.implementing_tools === null || 
      server.implementing_prompts === null ||
      server.implementing_resources === null) {
    return 40;
  }

  let score = 0;

  // Core features (most important) - 8 points each
  if (server.implementing_tools) score += 8;
  if (server.implementing_resources) score += 8;
  
  // Secondary features - 5 points each
  if (server.implementing_prompts) score += 5;
  if (server.implementing_sampling) score += 5;
  
  // Transport features - 4 points each (at least one required)
  if (server.implementing_stdio) score += 4;
  if (server.implementing_streamable_http) score += 4;
  
  // Additional features - 3 points each
  if (server.implementing_roots) score += 3;
  if (server.implementing_logging) score += 3;
  
  // Authentication - 2 points
  if (server.implementing_oauth2) score += 2;
  
  return Math.min(score, 40);
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

  // Check for our specific Archestra Trust Score badge pattern (accepts MCP Quality, MCP Trust, or Trust Score)
  const archestraBadgePattern = /\[\!\[(MCP Quality|MCP Trust|Trust Score)\]\(https:\/\/archestra\.ai\/api\/badge\/quality\//i;

  return archestraBadgePattern.test(readmeContent) ? 2 : 0;
}

/**
 * Calculate Dependencies Score (20 points max)
 * Based on dependency count and rarity of dependencies
 */
export function calculateDependenciesScore(
  server: MCPServer,
  allServers?: MCPServer[],
): number {
  // If dependencies haven't been analyzed yet, give full points (assume the best)
  if (!server.dependencies) {
    return 20;
  }
  
  // If dependencies array is empty (no dependencies), that's ideal - return full points
  if (server.dependencies.length === 0) {
    return 20;
  }

  // Start with full points
  let score = 20;

  // Count significant dependencies (importance >= 5)
  const significantDeps = server.dependencies.filter(dep => dep.importance >= 5);
  const depCount = significantDeps.length;

  // Penalty only if more than 10 dependencies
  if (depCount > 10) {
    // Lose 1 point for each dependency over 10, up to 10 points
    const penalty = Math.min(10, depCount - 10);
    score -= penalty;
  }

  // Additional penalty for using rare dependencies
  if (allServers && allServers.length > 10) {
    // Build frequency map of all dependencies
    const depFrequency = new Map<string, number>();
    for (const otherServer of allServers) {
      if (otherServer.dependencies) {
        for (const dep of otherServer.dependencies.filter(d => d.importance >= 5)) {
          depFrequency.set(dep.name, (depFrequency.get(dep.name) || 0) + 1);
        }
      }
    }

    // Check for rare dependencies (used by fewer than 5 servers)
    let rareDependencyPenalty = 0;
    for (const dep of significantDeps) {
      const frequency = depFrequency.get(dep.name) || 0;
      if (frequency < 5) {
        // Each rare dependency reduces score by 2 points
        rareDependencyPenalty += 2;
      }
    }

    // Apply penalty for rare dependencies (up to 10 points)
    score -= Math.min(10, rareDependencyPenalty);
  }

  return Math.max(0, Math.min(20, score));
}

/**
 * Calculate total trust score with breakdown
 */
export function calculateQualityScore(
  server: MCPServer,
  readmeContent?: string,
  allServers?: MCPServer[],
): QualityScoreBreakdown {
  const mcpProtocol = calculateMCPProtocolScore(server);
  const githubMetrics = calculateGitHubMetricsScore(server);
  const deploymentMaturity = calculateDeploymentMaturityScore(server);
  const documentation = calculateDocumentationScore(server);
  const dependencies = calculateDependenciesScore(server, allServers);
  const badgeUsage = calculateBadgeUsageScore(server, readmeContent);

  const total =
    mcpProtocol +
    githubMetrics +
    deploymentMaturity +
    documentation +
    dependencies +
    badgeUsage;

  return {
    mcpProtocol,
    githubMetrics,
    deploymentMaturity,
    documentation,
    dependencies,
    badgeUsage,
    total,
  };
}
