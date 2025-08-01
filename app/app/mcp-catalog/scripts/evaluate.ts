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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch repository data from GitHub API with retry logic
 */
async function fetchRepoData(
  owner: string,
  repo: string,
  repositoryPath?: string,
): Promise<GitHubApiResponse> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Archestra-MCP-Evaluator",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Helper for API calls
  const apiCall = async (endpoint: string) => {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers,
    });
    if (!response.ok) {
      if (
        response.status === 403 &&
        response.statusText.includes("rate limit")
      ) {
        throw new Error("RATE_LIMITED");
      }
      if (response.status === 404) {
        throw new Error(`REPO_NOT_FOUND: ${response.status}`);
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }
    return response.json();
  };

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // Fetch all data in parallel
      const [repoData, contributors, releases, workflows, issuesSearch] =
        await Promise.all([
          apiCall(`/repos/${owner}/${repo}`),
          apiCall(`/repos/${owner}/${repo}/contributors`).catch(() => []),
          apiCall(`/repos/${owner}/${repo}/releases`).catch(() => []),
          apiCall(`/repos/${owner}/${repo}/actions/workflows`).catch(() => ({
            total_count: 0,
          })),
          apiCall(
            `/search/issues?q=repo:${owner}/${repo}+type:issue&per_page=1`,
          ).catch(() => ({ total_count: 0 })),
        ]);

      // Check if repository path exists
      if (repositoryPath) {
        try {
          await apiCall(`/repos/${owner}/${repo}/contents/${repositoryPath}`);
        } catch (error) {
          throw new Error(
            `PATH_NOT_FOUND: ${repositoryPath} does not exist in ${owner}/${repo}`,
          );
        }
      }

      // Fetch README
      let readmeContent = "";
      try {
        const readmeUrl = repositoryPath
          ? `/repos/${owner}/${repo}/contents/${repositoryPath}/README.md`
          : `/repos/${owner}/${repo}/readme`;
        const readme = await apiCall(readmeUrl);
        readmeContent = Buffer.from(readme.content, "base64").toString("utf-8");
      } catch (error) {
        // Don't fall back to root README if subdirectory README doesn't exist
        console.warn(
          `No README found at ${repositoryPath ? `${repositoryPath}/README.md` : "root"}`,
        );
      }

      // Fetch latest commit
      let latestCommitHash = "";
      try {
        const commits = await apiCall(
          `/repos/${owner}/${repo}/commits?per_page=1`,
        );
        if (commits[0]) latestCommitHash = commits[0].sha;
      } catch {}

      return {
        name: repoData.name,
        description: repoData.description || "",
        stargazers_count: repoData.stargazers_count,
        total_issues_count: issuesSearch.total_count || 0,
        language: repoData.language || "Unknown",
        has_releases: Array.isArray(releases) && releases.length > 0,
        has_workflows: workflows.total_count > 0,
        contributors_count: Array.isArray(contributors)
          ? contributors.length
          : 1,
        readme_content: readmeContent,
        latest_commit_hash: latestCommitHash,
      };
    } catch (error) {
      if (error.message === "RATE_LIMITED" && retryCount < maxRetries) {
        retryCount++;
        const waitTime = Math.min(60000 * retryCount, 180000);
        console.log(
          `Rate limited. Waiting ${waitTime / 1000}s before retry...`,
        );
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed after ${maxRetries} retries`);
}

/**
 * Create MCPServer object from GitHub data
 */
function createMCPServerFromGitHub(
  repoInfo: GitHubRepoInfo,
  apiData: GitHubApiResponse,
  serverInfo: ReturnType<typeof extractServerInfo>,
): MCPServer {
  const name =
    apiData.name
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
    framework: undefined,
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
 * Save evaluation to file
 */
function saveEvaluation(server: MCPServer): void {
  const outputDir = path.join(__dirname, "..", "data", "mcp-evaluations");
  const filename = `${server.slug}.json`;
  const filepath = path.join(outputDir, filename);

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(server, null, 2));
}

// ============= AI Analysis Functions =============

/**
 * Extract categories from the types.ts file
 */
function extractCategories(): string[] {
  const typesPath = path.join(__dirname, "../data/types.ts");
  const typesContent = fs.readFileSync(typesPath, "utf-8");

  // Find the category type definition
  const categoryMatch = typesContent.match(
    /category:\s*\n\s*\|([\s\S]*?)\s*\|\s*null;/,
  );

  if (!categoryMatch) {
    throw new Error("Could not find category definition in types.ts");
  }

  // Extract all quoted strings from the union type
  const categorySection = categoryMatch[1];
  const categories = categorySection
    .split("|")
    .map((line) => line.trim())
    .filter((line) => line.startsWith('"') && line.endsWith('"'))
    .map((line) => line.slice(1, -1)); // Remove quotes

  return categories;
}

async function callOllama(
  prompt: string,
  format?: any,
  model = "deepseek-r1:14b",
): Promise<any> {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: format || "json",
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.response.trim();

    // Debug logging
    console.log("Raw Ollama response:", responseText.substring(0, 200) + "...");

    try {
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON:", responseText);
      throw new Error(
        `Invalid JSON response from Ollama: ${parseError.message}`,
      );
    }
  } catch (error) {
    console.error("Error calling Ollama:", error);
    throw error;
  }
}

/**
 * Check if Ollama is available and model is installed
 */
async function checkOllamaAvailable(model: string): Promise<boolean> {
  try {
    await fetch("http://localhost:11434/api/tags");
    const { stdout } = await execAsync("ollama list").catch(() => ({
      stdout: "",
    }));
    return stdout.includes(model);
  } catch {
    return false;
  }
}

/**
 * Evaluate a single repository
 */
async function evaluateSingleRepo(
  githubUrl: string,
  options: {
    updateGithub?: boolean;
    updateCategory?: boolean;
    updateConfigForClients?: boolean;
    updateConfigForArchestra?: boolean;
    updateScore?: boolean;
    model?: string;
    categories?: string[];
    showOutput?: boolean;
  } = {},
): Promise<MCPServer> {
  try {
    if (options.showOutput !== false) {
      console.log(`🔍 Evaluating repository: ${githubUrl}`);
    }

    // Parse GitHub info
    const repoInfo = parseGitHubUrl(githubUrl);
    const serverInfo = extractServerInfo(githubUrl);
    const evaluationsDir = path.join(__dirname, "../data/mcp-evaluations");
    const filePath = path.join(evaluationsDir, `${serverInfo.slug}.json`);

    // Load existing data or create new
    let finalServer: MCPServer;
    const exists = fs.existsSync(filePath);

    if (exists) {
      finalServer = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } else {
      // Create new server from GitHub data
      const apiData = await fetchRepoData(
        repoInfo.owner,
        repoInfo.repo,
        serverInfo.repositoryPath,
      );
      finalServer = createMCPServerFromGitHub(repoInfo, apiData, serverInfo);

      // Calculate quality score for new files
      const scoreBreakdown = calculateQualityScore(
        finalServer,
        apiData.readme_content,
      );
      finalServer.qualityScore = scoreBreakdown.total;
    }

    // Update GitHub data if requested or missing
    const needsGithubUpdate =
      options.updateGithub ||
      !exists ||
      (!options.updateCategory &&
        !options.updateConfigForClients &&
        !finalServer.gh_latest_commit_hash);

    if (needsGithubUpdate && exists) {
      const apiData = await fetchRepoData(
        repoInfo.owner,
        repoInfo.repo,
        serverInfo.repositoryPath,
      );
      const newServer = createMCPServerFromGitHub(
        repoInfo,
        apiData,
        serverInfo,
      );

      // Calculate quality score if needed
      if (options.updateScore || !finalServer.qualityScore) {
        const scoreBreakdown = calculateQualityScore(
          newServer,
          apiData.readme_content,
        );
        newServer.qualityScore = scoreBreakdown.total;
      }

      // Merge GitHub fields
      finalServer = {
        ...finalServer,
        name: newServer.name,
        description: newServer.description,
        readme: newServer.readme,
        programmingLanguage: newServer.programmingLanguage,
        gh_stars: newServer.gh_stars,
        gh_contributors: newServer.gh_contributors,
        gh_issues: newServer.gh_issues,
        gh_releases: newServer.gh_releases,
        gh_ci_cd: newServer.gh_ci_cd,
        gh_latest_commit_hash: newServer.gh_latest_commit_hash,
        last_scraped_at: newServer.last_scraped_at,
      };

      if (options.updateScore) {
        finalServer.qualityScore = newServer.qualityScore;
      }
    }

    // Update category if requested or missing
    const needsCategoryUpdate =
      options.updateCategory ||
      (!exists && options.categories) ||
      (!options.updateGithub &&
        !options.updateConfigForClients &&
        !finalServer.category &&
        options.categories);

    if (needsCategoryUpdate && options.categories) {
      if (options.showOutput !== false)
        console.log("Running AI analysis for category...");

      const content = finalServer.readme || finalServer.description;
      if (content) {
        const prompt = `Analyze this MCP server and choose the most appropriate category from this list: ${options.categories.join(", ")}

Content:
${content.substring(0, 8000)}

Respond with JSON: {"category": "..."}`;

        try {
          const result = await callOllama(
            prompt,
            null,
            options.model || "deepseek-r1:14b",
          );
          if (result.category) finalServer.category = result.category as any;
        } catch (error) {
          console.warn(`Category analysis failed: ${error.message}`);
        }
      }
    }

    // Update configForClients if requested or missing
    const needsConfigForClientsUpdate =
      options.updateConfigForClients ||
      (!exists && options.categories) ||
      (!options.updateGithub &&
        !options.updateCategory &&
        !options.updateConfigForArchestra &&
        !finalServer.configForClients);

    if (needsConfigForClientsUpdate) {
      if (options.showOutput !== false)
        console.log("Running AI analysis for client config...");

      const content = finalServer.readme || finalServer.description;
      if (content) {
        const prompt = `Find the run configuration for this MCP server. Look for commands that START the server.

Content:
${content.substring(0, 8000)}

Instructions:
- Extract all ways to run the server (npx, docker, node, python, etc.)
- For Docker commands: split "docker run" into command="docker" and args=["run", ...]
- For npx: command="npx", args=["-y", "package-name"]
- Extract environment variables from docker -e flags to env object
- Use descriptive names: "server-name" for npx/node, "server-name-docker" for docker

Examples:
Docker: docker run -it --rm -e TOKEN=value image:tag
Result: {"command": "docker", "args": ["run", "-i", "--rm", "-e", "TOKEN", "image:tag"], "env": {"TOKEN": "\${input:token}"}}

NPX: npx -y my-server
Result: {"command": "npx", "args": ["-y", "my-server"]}

Important: For Docker, include the image name in args. Environment vars from -e flags go in both args and env.

Respond with JSON: {"configForClients": {"mcpServers": {"name1": {...}, "name2": {...}}}}
If no run command found, respond with: {"configForClients": null}`;

        const configFormat = {
          type: "object",
          properties: {
            configForClients: {
              type: ["object", "null"],
            },
          },
          required: ["configForClients"],
        };

        try {
          const result = await callOllama(
            prompt,
            configFormat,
            options.model || "deepseek-r1:14b",
          );
          if (result.configForClients)
            finalServer.configForClients = result.configForClients;
        } catch (error) {
          console.warn(`Client config analysis failed: ${error.message}`);
        }
      }
    }

    // Update configForArchestra if requested or missing
    const needsConfigForArchestraUpdate =
      options.updateConfigForArchestra ||
      (!exists && options.categories) ||
      (!options.updateGithub &&
        !options.updateCategory &&
        !options.updateConfigForClients &&
        !finalServer.configForArchestra);

    if (needsConfigForArchestraUpdate) {
      if (options.showOutput !== false)
        console.log("Running AI analysis for Archestra config...");

      const content = finalServer.readme || finalServer.description;
      if (content) {
        const prompt = `Extract the configuration needed to run this MCP server in Archestra cloud.

Content:
${content.substring(0, 8000)}

Look for:
1. Native binary executables: paths like ./binary, /path/to/binary, binary-name
2. NPX/NPM commands: npx package-name or npm run commands
3. Python/Node scripts: python script.py, node server.js, uvx package
4. Build instructions: "go build", "cargo build" indicate binary names
5. Environment variables: especially those with TOKEN, KEY, SECRET in the name
6. OAuth mentions: "OAuth", "OAuth2", "OAuth 2.0", "GitHub App", "Google OAuth", "Google Cloud", "gcp-oauth", authentication providers, "Create OAuth 2.0 Credentials", "OAuth client ID"
7. Transport protocol: look for "stdio" command arguments or mode, http URLs

Respond with JSON format:
{
  "configForArchestra": {
    "oauth": {
      "provider": "github|google|slack|etc",
      "required": true
    } or null,
    "server_config": {
      "transport": "stdio",
      "command": "npx|python|node|binary_path",
      "args": ["arg1", "arg2", "..."],
      "env": {
        "ENV_VAR_NAME": ""
      }
    }
  }
}

Examples:
- Binary: command="./server", args=["stdio"] or command="/usr/local/bin/server"
- NPX: command="npx", args=["-y", "package-name"]
- Python: command="python", args=["server.py", "--stdio"]

Rules:
- Set oauth to null if no OAuth/authentication provider is mentioned
- IMPORTANT: Look for OAuth setup instructions, credential creation steps, or authentication flows as indicators
- If the README mentions creating OAuth credentials, obtaining client IDs, or authentication setup, determine the provider from context
- For env object, use empty object {} if no env vars needed, otherwise only include keys (no values)
- Skip Docker commands - extract the native binary/script command instead
- Always prefer "stdio" transport if available, only use "http" if stdio is not supported
- Look for binary paths, executable names, or script commands
- Default transport is "stdio" unless only http is available

If no configuration found, respond: {"configForArchestra": null}`;

        const configFormat = {
          type: "object",
          properties: {
            configForArchestra: {
              type: ["object", "null"],
              properties: {
                oauth: {
                  type: ["object", "null"],
                  properties: {
                    provider: { type: "string" },
                    required: { type: "boolean" },
                  },
                },
                server_config: {
                  type: "object",
                  properties: {
                    transport: { type: "string" },
                    command: { type: "string" },
                    args: { type: "array", items: { type: "string" } },
                    env: { type: "object" },
                  },
                },
              },
            },
          },
          required: ["configForArchestra"],
        };

        try {
          const result = await callOllama(
            prompt,
            configFormat,
            options.model || "deepseek-r1:14b",
          );
          if (result.configForArchestra)
            finalServer.configForArchestra = result.configForArchestra;
        } catch (error) {
          console.warn(`Archestra config analysis failed: ${error.message}`);
        }
      }
    }

    // Display results if showOutput
    if (options.showOutput !== false) {
      const scoreBreakdown = calculateQualityScore(
        finalServer,
        finalServer.readme,
      );
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

      if (
        finalServer.category ||
        finalServer.configForClients ||
        finalServer.configForArchestra
      ) {
        console.log(`\n🤖 AI Analysis:`);
        if (finalServer.category)
          console.log(`  Category: ${finalServer.category}`);
        if (finalServer.configForClients)
          console.log(`  Client Configuration: Available`);
        if (finalServer.configForArchestra)
          console.log(`  Archestra Configuration: Available`);
      }
    }

    // Save evaluation
    saveEvaluation(finalServer);
    if (options.showOutput !== false) {
      console.log(`\n✅ Evaluation saved to: ${finalServer.slug}.json`);
    }

    return finalServer;
  } catch (error) {
    if (
      error.message &&
      (error.message.startsWith("PATH_NOT_FOUND:") ||
        error.message.startsWith("REPO_NOT_FOUND:"))
    ) {
      if (options.showOutput !== false) console.error(`❌ ${error.message}`);
      removeFromServerList(githubUrl);
      throw error;
    } else {
      if (options.showOutput !== false)
        console.error("❌ Evaluation failed:", error);
      throw error;
    }
  }
}

/**
 * Evaluate all repositories from mcp-servers.json
 */
async function evaluateAllRepos(
  options: {
    updateGithub?: boolean;
    updateCategory?: boolean;
    updateConfigForClients?: boolean;
    updateConfigForArchestra?: boolean;
    updateScore?: boolean;
    updateAll?: boolean;
    force?: boolean;
    model?: string;
    concurrency?: number;
    categories?: string[];
  } = {},
): Promise<void> {
  const evaluationsDir = path.join(__dirname, "../data/mcp-evaluations");
  const serversPath = path.join(__dirname, "../data/mcp-servers.json");

  // Ensure evaluations directory exists
  if (!fs.existsSync(evaluationsDir)) {
    fs.mkdirSync(evaluationsDir, { recursive: true });
  }

  // Read all GitHub URLs
  const githubUrls: string[] = JSON.parse(fs.readFileSync(serversPath, "utf8"));
  const existingFiles = fs
    .readdirSync(evaluationsDir)
    .filter((f) => f.endsWith(".json"));

  // Determine concurrency based on whether we have a token
  const hasToken = !!process.env.GITHUB_TOKEN;
  const concurrency = options.concurrency || (hasToken ? 10 : 3);

  console.log(`📊 Batch Evaluation
Total servers: ${githubUrls.length}
Existing evaluations: ${existingFiles.length}
Concurrency: ${concurrency} parallel requests
Options: ${Object.entries(options)
    .filter(([k, v]) => v && k !== "concurrency" && k !== "categories")
    .map(([k]) => k)
    .join(", ")}\n`);

  const stats = { processed: 0, updated: 0, created: 0, failed: 0, removed: 0 };
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < githubUrls.length; i += concurrency) {
    const batch = githubUrls.slice(i, i + concurrency);

    // Show progress
    if (i > 0) {
      const pct = Math.round((i / githubUrls.length) * 100);
      console.log(`\n📊 Progress: ${i}/${githubUrls.length} (${pct}%)`);
      console.log(
        `   Created: ${stats.created}, Updated: ${stats.updated}, Failed: ${stats.failed}, Removed: ${stats.removed}`,
      );
    }

    // Process batch concurrently
    const promises = batch.map(async (url) => {
      if (!url) return;

      try {
        const serverInfo = extractServerInfo(url);
        const filePath = path.join(evaluationsDir, `${serverInfo.slug}.json`);
        const exists = fs.existsSync(filePath);

        // Skip if exists and no updates requested
        if (
          exists &&
          !options.updateGithub &&
          !options.updateCategory &&
          !options.updateConfigForClients &&
          !options.updateConfigForArchestra &&
          !options.updateScore &&
          !options.force
        ) {
          return;
        }

        // Evaluate with output suppressed for batch mode
        await evaluateSingleRepo(url, {
          ...options,
          showOutput: false,
        });

        stats.processed++;
        if (exists) {
          stats.updated++;
        } else {
          stats.created++;
        }
      } catch (error) {
        stats.failed++;
        if (
          error.message &&
          (error.message.startsWith("PATH_NOT_FOUND:") ||
            error.message.startsWith("REPO_NOT_FOUND:"))
        ) {
          stats.removed++;
        } else {
          console.error(`Failed: ${url} - ${error.message}`);
        }
      }
    });

    await Promise.all(promises);

    // Rate limiting between batches
    if (stats.created > 0 && !hasToken) {
      await sleep(1000);
    } else if (stats.created > 0) {
      await sleep(200);
    }
  }

  // Summary
  const duration = Math.round((Date.now() - startTime) / 60000);
  console.log(`
✅ Complete!
   Created: ${stats.created}
   Updated: ${stats.updated}
   Failed: ${stats.failed}
   Removed: ${stats.removed}
   Total processed: ${stats.processed}
   Time: ${duration} minutes`);
}

/**
 * Remove URL from mcp-servers.json
 */
function removeFromServerList(url: string): void {
  const serversPath = path.join(__dirname, "../data/mcp-servers.json");
  const servers: string[] = JSON.parse(fs.readFileSync(serversPath, "utf8"));
  const filteredServers = servers.filter((s) => s !== url);

  if (filteredServers.length < servers.length) {
    fs.writeFileSync(serversPath, JSON.stringify(filteredServers, null, 2));
    console.log(`❌ Removed invalid server: ${url}`);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`🔍 MCP Server Evaluation Script

Usage: npm run evaluate [options] [github-url]

Update Options:
  --github              Update GitHub data (stars, issues, README)
  --category            Update category classification
  --config-for-clients  Update configuration for running the server
  --config-for-archestra Update configuration for Archestra hosting
  --score               Update quality scores
  --all                 Update everything
  (no flags)            Fill in missing data only

Control Options:
  --force             Force update even if data exists
  --model <name>      Ollama model (default: deepseek-r1:14b)
  --concurrency <n>   Number of parallel requests (default: 10 with token, 3 without)

Examples:
  npm run evaluate https://github.com/org/repo
  npm run evaluate --github --force
  npm run evaluate --category --model llama2
  npm run evaluate --all --concurrency 20`);
    return;
  }

  // Parse options
  const options = {
    updateGithub: args.includes("--github"),
    updateCategory: args.includes("--category"),
    updateConfigForClients: args.includes("--config-for-clients"),
    updateConfigForArchestra: args.includes("--config-for-archestra"),
    updateScore: args.includes("--score"),
    updateAll: args.includes("--all"),
    force: args.includes("--force"),
    model: args.includes("--model")
      ? args[args.indexOf("--model") + 1]
      : "deepseek-r1:14b",
    concurrency: args.includes("--concurrency")
      ? parseInt(args[args.indexOf("--concurrency") + 1]) || undefined
      : undefined,
  };

  // Apply --all flag
  if (options.updateAll) {
    options.updateGithub = true;
    options.updateCategory = true;
    options.updateConfigForClients = true;
    options.updateConfigForArchestra = true;
    options.updateScore = true;
  }

  const githubUrl = args.find((arg) => arg.includes("github.com"));

  // Check GitHub token
  if (!process.env.GITHUB_TOKEN) {
    console.log(`⚠️  No GITHUB_TOKEN found. You may hit rate limits.
   Get a token at: https://github.com/settings/tokens\n`);
  }

  let categories: string[] | undefined;

  // Single repo evaluation
  if (githubUrl) {
    await evaluateSingleRepo(githubUrl, {
      ...options,
      categories,
    });
  } else {
    // Batch evaluation
    await evaluateAllRepos({
      ...options,
      categories,
    });
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { evaluateSingleRepo, evaluateAllRepos };
