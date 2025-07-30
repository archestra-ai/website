#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { MCPServer } from "../data/types";
import { calculateQualityScore } from "../lib/quality-calculator";
import { extractServerInfo } from "../lib/server-utils";

const execAsync = promisify(exec);

interface GitHubRepoInfo {
  owner: string;
  repo: string;
  url: string;
}

interface GitHubApiResponse {
  name: string;
  description: string;
  stargazers_count: number;
  total_issues_count: number;
  language: string;
  has_releases: boolean;
  has_workflows: boolean;
  contributors_count: number;
  readme_content?: string;
  latest_commit_hash?: string;
}


/**
 * Parse GitHub URL to extract owner and repo name
 */
function parseGitHubUrl(url: string): GitHubRepoInfo {
  const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
  const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

  if (!match) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  return {
    owner: match[1],
    repo: match[2],
    url: cleanUrl,
  };
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch repository data from GitHub API with retry logic
 */
async function fetchRepoData(
  owner: string,
  repo: string,
): Promise<GitHubApiResponse> {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.warn("⚠️  Warning: GITHUB_TOKEN not found. This may result in rate limiting.");
    console.warn("   Set GITHUB_TOKEN environment variable to avoid API rate limits.");
  }
  
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Archestra-MCP-Evaluator",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const maxRetries = 50;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
    // Fetch basic repo info
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers,
      },
    );

    if (!repoResponse.ok) {
      throw new Error(
        `GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`,
      );
    }

    const repoData = await repoResponse.json();

    // Fetch contributors count
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      {
        headers,
      },
    );

    let contributorsCount = 1; // Default to 1 if we can't fetch
    if (contributorsResponse.ok) {
      const contributors = await contributorsResponse.json();
      contributorsCount = Array.isArray(contributors) ? contributors.length : 1;
    }

    // Check for releases
    const releasesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      {
        headers,
      },
    );

    let hasReleases = false;
    if (releasesResponse.ok) {
      const releases = await releasesResponse.json();
      hasReleases = Array.isArray(releases) && releases.length > 0;
    }

    // Check for workflows (CI/CD)
    const workflowsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows`,
      {
        headers,
      },
    );

    let hasWorkflows = false;
    if (workflowsResponse.ok) {
      const workflows = await workflowsResponse.json();
      hasWorkflows = workflows.total_count > 0;
    }

    // Fetch total issues count using search API (more reliable)
    const issuesSearchResponse = await fetch(
      `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue&per_page=1`,
      { headers }
    );

    let totalIssuesCount = 0;
    if (issuesSearchResponse.ok) {
      const searchData = await issuesSearchResponse.json();
      totalIssuesCount = searchData.total_count || 0;
    }

    // Fetch README
    let readmeContent = "";
    try {
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers,
        },
      );

      if (readmeResponse.ok) {
        const readme = await readmeResponse.json();
        readmeContent = Buffer.from(readme.content, "base64").toString("utf-8");
      }
    } catch (error) {
      console.warn("Could not fetch README:", error);
    }

    // Fetch latest commit hash
    let latestCommitHash = "";
    try {
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
        {
          headers,
        },
      );

      if (commitsResponse.ok) {
        const commits = await commitsResponse.json();
        if (Array.isArray(commits) && commits.length > 0) {
          latestCommitHash = commits[0].sha;
        }
      }
    } catch (error) {
      console.warn("Could not fetch latest commit:", error);
    }

      return {
        name: repoData.name,
        description: repoData.description || "",
        stargazers_count: repoData.stargazers_count,
        total_issues_count: totalIssuesCount,
        language: repoData.language || "Unknown",
        has_releases: hasReleases,
        has_workflows: hasWorkflows,
        contributors_count: contributorsCount,
        readme_content: readmeContent,
        latest_commit_hash: latestCommitHash,
      };
    } catch (error) {
      const errorMessage = error.toString();
      
      // Check if it's a rate limit error
      if (errorMessage.includes('403') && errorMessage.includes('rate limit')) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.min(60000 * retryCount, 300000); // Max 5 minutes
          console.log(`Rate limited. Waiting ${waitTime/1000}s before retry ${retryCount}/${maxRetries} for ${owner}/${repo}...`);
          await sleep(waitTime);
          continue; // Retry the API call
        }
      }
      
      // If not rate limited or max retries reached, throw error
      throw new Error(`Failed to fetch repository data: ${error}`);
    }
  }
  
  throw new Error(`Failed to fetch repository data after ${maxRetries} retries`);
}

/**
 * Analyze MCP protocol implementation based on the server implementation
 */
function analyzeMCPImplementation(readmeContent: string): {
  implementing_tools: boolean | null;
  implementing_prompts: boolean | null;
  implementing_resources: boolean | null;
  implementing_sampling: boolean | null;
  implementing_roots: boolean | null;
  implementing_logging: boolean | null;
  implementing_stdio: boolean | null;
  implementing_streamable_http: boolean | null;
  implementing_oauth2: boolean | null;
} {
  return {
    implementing_tools: null,
    implementing_prompts: null,
    implementing_resources: null,
    implementing_sampling: null,
    implementing_roots: null,
    implementing_logging: null,
    implementing_stdio: null,
    implementing_streamable_http: null,
    implementing_oauth2: null,
  };
}

/**
 * Detect framework from README content
 */
function detectFramework(content: string): string | undefined {
  return undefined;
}

/**
 * Create MCPServer object from GitHub data
 */
function createMCPServerFromGitHub(
  repoInfo: GitHubRepoInfo,
  apiData: GitHubApiResponse,
  serverInfo: ReturnType<typeof extractServerInfo>
): MCPServer {
  const mcpImplementation = analyzeMCPImplementation(
    apiData.readme_content || "",
  );

  const name = apiData.name
    .replace(/-/g, " ")
    .replace(/mcp|server/gi, "")
    .trim() || apiData.name;

  return {
    name,
    slug: serverInfo.slug,
    description:
      apiData.description ||
      `MCP server from ${repoInfo.owner}/${repoInfo.repo}`,
    readme: apiData.readme_content || undefined,
    category: null,
    qualityScore: null, // Will be calculated
    githubUrl: repoInfo.url,
    programmingLanguage: apiData.language,
    framework: detectFramework(apiData.readme_content || ""),
    gitHubOrg: serverInfo.gitHubOrg,
    gitHubRepo: serverInfo.gitHubRepo,
    repositoryPath: serverInfo.repositoryPath,
    gh_stars: apiData.stargazers_count,
    gh_contributors: apiData.contributors_count,
    gh_issues: apiData.total_issues_count,
    gh_releases: apiData.has_releases,
    gh_ci_cd: apiData.has_workflows,
    gh_latest_commit_hash: apiData.latest_commit_hash,
    last_scraped_at: new Date().toISOString(),
    ...mcpImplementation,
  };
}

/**
 * Save evaluation to file
 */
function saveEvaluation(server: MCPServer): void {
  const outputDir = path.join(
    __dirname,
    "..",
    "app",
    "data",
    "mcp-evaluations",
  );
  const filename = `${server.slug}.json`;
  const filepath = path.join(outputDir, filename);

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(server, null, 2));
}

/**
 * Evaluate a single repository
 */
async function evaluateSingleRepo(githubUrl: string): Promise<void> {
  try {
    console.log(`🔍 Evaluating repository: ${githubUrl}`);

    // Parse GitHub URL
    const repoInfo = parseGitHubUrl(githubUrl);
    const serverInfo = extractServerInfo(githubUrl);
    
    console.log(`📊 Analyzing ${repoInfo.owner}/${repoInfo.repo}...`);

    // Fetch repository data
    const apiData = await fetchRepoData(repoInfo.owner, repoInfo.repo);

    // Create MCP server object
    const mcpServer = createMCPServerFromGitHub(repoInfo, apiData, serverInfo);

    // Calculate quality score
    const scoreBreakdown = calculateQualityScore(
      mcpServer,
      apiData.readme_content,
    );
    mcpServer.qualityScore = scoreBreakdown.total;

    // Display results
    console.log("\n📈 Quality Score Breakdown:");
    console.log(
      `  MCP Protocol Implementation: ${scoreBreakdown.mcpProtocol}/60`,
    );
    console.log(
      `  GitHub Community Health: ${scoreBreakdown.githubMetrics}/20`,
    );
    console.log(
      `  Deployment Maturity: ${scoreBreakdown.deploymentMaturity}/10`,
    );
    console.log(`  Documentation Quality: ${scoreBreakdown.documentation}/8`);
    console.log(`  Badge Adoption: ${scoreBreakdown.badgeUsage}/2`);
    console.log(`  📊 Total Score: ${scoreBreakdown.total}/100`);

    // Save evaluation
    saveEvaluation(mcpServer);

    console.log(`\n✅ Evaluation saved to: ${mcpServer.slug}.json`);
    console.log("🎉 Evaluation completed successfully!");
  } catch (error) {
    console.error("❌ Evaluation failed:", error);
    throw error;
  }
}


/**
 * Evaluate all repositories from mcp-servers.json
 */
async function evaluateAllRepos(newOnly: boolean = false): Promise<void> {
  const evaluationsDir = path.join(__dirname, "../data/mcp-evaluations");
  const serversPath = path.join(__dirname, "../data/mcp-servers.json");
  
  // Check GitHub token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log(`⚠️  GitHub Token Notice:`);
    console.log(`   No GITHUB_TOKEN environment variable found.`);
    console.log(`   You may experience API rate limiting (60 requests/hour).`);
    console.log(`   For better performance, set GITHUB_TOKEN with a personal access token.`);
    console.log(`   Visit: https://github.com/settings/tokens\n`);
  } else {
    console.log(`✅ GitHub token configured - enhanced rate limits available\n`);
  }
  
  // Ensure evaluations directory exists
  if (!fs.existsSync(evaluationsDir)) {
    fs.mkdirSync(evaluationsDir, { recursive: true });
  }
  
  // Read all GitHub URLs from mcp-servers.json
  const githubUrls: string[] = JSON.parse(fs.readFileSync(serversPath, "utf8"));
  
  // Get existing evaluation files
  const existingFiles = fs.readdirSync(evaluationsDir).filter(f => f.endsWith('.json'));
  const existingSlugs = new Set(existingFiles.map(f => f.replace('.json', '')));
  
  console.log(`📊 MCP Server GitHub Scraper`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total servers: ${githubUrls.length}`);
  console.log(`Existing evaluations: ${existingFiles.length}`);
  console.log(`\n🚀 Processing servers...\n`);
  
  let created = 0;
  let updated = 0;
  let failed = 0;
  const startTime = Date.now();
  
  // Process each GitHub URL
  for (let i = 0; i < githubUrls.length; i++) {
    const githubUrl = githubUrls[i];
    
    // Show progress every 10 servers
    if (i % 10 === 0 && i > 0) {
      const percentage = Math.round((i / githubUrls.length) * 100);
      console.log(`\n📊 Progress: ${i}/${githubUrls.length} (${percentage}%)`);
      console.log(`   Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
    }
    
    if (!githubUrl || typeof githubUrl !== 'string') {
      continue;
    }
    
    try {
      // Extract server info from GitHub URL
      const serverInfo = extractServerInfo(githubUrl);
      if (!serverInfo) {
        console.log(`⚠️  [${i}] Invalid URL: ${githubUrl}`);
        continue;
      }
      
      const { gitHubOrg, gitHubRepo, slug } = serverInfo;
      const filePath = path.join(evaluationsDir, `${slug}.json`);
      
      // Check if evaluation already exists
      if (existingSlugs.has(slug)) {
        if (newOnly) {
          // Skip existing evaluations when newOnly is true
          continue;
        }
        
        // Update existing file
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const scoreBreakdown = calculateQualityScore(data);
          const oldScore = data.qualityScore;
          const newScore = scoreBreakdown.total;
          
          if (oldScore !== newScore) {
            data.qualityScore = newScore;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✓ [${i}] Updated ${slug}: ${oldScore} → ${newScore}`);
            updated++;
          }
        } catch (error) {
          console.error(`✗ [${i}] Failed to update ${slug}: ${error.message}`);
          failed++;
        }
      } else {
        // Create new evaluation
        console.log(`📝 [${i}] Creating ${gitHubRepo}...`);
        try {
          await evaluateSingleRepo(githubUrl);
          console.log(`  ✓ Created evaluation for ${slug}`);
          created++;
          
          // Add the new slug to our set
          existingSlugs.add(slug);
        } catch (error) {
          console.error(`  ✗ Failed: ${error.message}`);
          failed++;
        }
        
        // Add delay to avoid rate limiting (only for new creations)
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (error) {
      console.error(`✗ [${i}] Error processing ${githubUrl}: ${error.message}`);
      failed++;
    }
  }
  
  // Final report
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Processing Complete!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Final Statistics:`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total processed: ${created + updated + failed}`);
  
  const duration = Date.now() - startTime;
  const minutes = Math.round(duration / 60000);
  console.log(`   Time taken: ${minutes} minutes`);
}

/**
 * Main function
 */
async function main() {
  const arg = process.argv[2];

  if (!arg) {
    // No argument - scrape all servers
    console.log("📦 Scraping GitHub data for all MCP servers...\n");
    await evaluateAllRepos();
  } else if (arg === "--new-only") {
    // Scrape only non-evaluated servers
    console.log("📦 Scraping GitHub data for only non-evaluated MCP servers...\n");
    await evaluateAllRepos(true);
  } else if (arg.includes("github.com")) {
    // GitHub URL provided - scrape single repository
    await evaluateSingleRepo(arg);
  } else {
    // Invalid argument
    console.error("❌ Invalid argument!\n");
    console.error("Usage:");
    console.error("  npm run scrape-github                    # Scrape all servers");
    console.error("  npm run scrape-github --new-only         # Scrape only non-scraped servers");
    console.error("  npm run scrape-github <github-url>       # Scrape specific server");
    console.error("\nExample:");
    console.error("  npm run scrape-github https://github.com/anthropics/mcp-filesystem");
    console.error("\nTip: Set GITHUB_TOKEN environment variable to avoid rate limiting.");
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { evaluateSingleRepo, evaluateAllRepos };