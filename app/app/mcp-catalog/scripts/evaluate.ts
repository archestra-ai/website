#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { MCPServer } from "../data/types";
import { calculateQualityScore } from "../lib/quality-calculator";
import { loadServers } from "../lib/server-utils";
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
  raw_dependencies?: string;
}

interface EvaluationOptions {
  updateGithub?: boolean;
  updateCategory?: boolean;
  updateConfigForClients?: boolean;
  updateConfigForArchestra?: boolean;
  updateDependencies?: boolean;
  updateProtocol?: boolean;
  updateScore?: boolean;
  updateAll?: boolean;
  force?: boolean;
  model?: string;
  categories?: string[];
  showOutput?: boolean;
}

// ============= Helper Methods =============

/**
 * Load existing evaluation from file (returns null if not exists)
 */
function loadMCPServerFromFile(filePath: string): MCPServer | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.warn(`Failed to parse ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Save evaluation to file
 */
function saveMCPServerToFile(server: MCPServer, filePath: string): void {
  const outputDir = path.dirname(filePath);

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(server, null, 2));
}

/**
 * Parse GitHub URL and extract all necessary information
 */
function parseGitHubUrl(url: string): {
  owner: string;
  repo: string;
  url: string;
  slug: string;
  gitHubOrg: string;
  gitHubRepo: string;
  repositoryPath: string | null;
} {
  const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
  const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

  if (!match) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  const serverInfo = extractServerInfo(url);

  return {
    owner: match[1],
    repo: match[2],
    url: cleanUrl,
    slug: serverInfo.slug,
    gitHubOrg: serverInfo.gitHubOrg,
    gitHubRepo: serverInfo.gitHubRepo,
    repositoryPath: serverInfo.repositoryPath,
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
  const apiCall = async (endpoint: string, returnHeaders = false) => {
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
    const data = await response.json();
    if (returnHeaders) {
      return { data, headers: response.headers };
    }
    return data;
  };

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // Fetch all data in parallel
      const [repoData, contributorsResponse, releases, workflows] =
        await Promise.all([
          apiCall(`/repos/${owner}/${repo}`),
          apiCall(`/repos/${owner}/${repo}/contributors?per_page=1&anon=true`, true).catch(() => ({ data: [], headers: new Headers() })),
          apiCall(`/repos/${owner}/${repo}/releases`).catch(() => []),
          apiCall(`/repos/${owner}/${repo}/actions/workflows`).catch(() => ({
            total_count: 0,
          })),
        ]);

      // Extract contributor count from Link header or use array length
      let contributorsCount = 1;
      if (contributorsResponse.headers) {
        const linkHeader = contributorsResponse.headers.get('link');
        if (linkHeader) {
          // Parse the last page number from Link header
          const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (lastPageMatch) {
            contributorsCount = parseInt(lastPageMatch[1]);
          } else if (Array.isArray(contributorsResponse.data)) {
            contributorsCount = contributorsResponse.data.length;
          }
        } else if (Array.isArray(contributorsResponse.data)) {
          // If no pagination, use the array length
          contributorsCount = contributorsResponse.data.length;
        }
      }

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

      // Fetch dependency files
      let rawDependencies = "";
      const dependencyFiles = [
        "requirements/requirements.txt",
        "requirements.txt",
        "package.json",
        "go.mod",
        "Cargo.toml",
        "Gemfile",
        "pom.xml",
        "build.gradle",
        "composer.json",
        "Pipfile",
        "poetry.lock",
        "setup.py",
        "pyproject.toml"
      ];

      // Collect ALL dependency files from root and first-level subdirectories
      const collectedDependencyFiles: string[] = [];
      
      try {
        const contentsUrl = repositoryPath
          ? `/repos/${owner}/${repo}/contents/${repositoryPath}`
          : `/repos/${owner}/${repo}/contents`;

        const contents = await apiCall(contentsUrl);

        // Find dependency files in root directory
        const rootDepFiles = contents
          .filter((item: any) => item.type === "file" && dependencyFiles.includes(item.name))
          .map((item: any) => item.name);

        // Fetch all dependency files from root
        for (const depFile of rootDepFiles) {
          try {
            const depFileUrl = repositoryPath
              ? `/repos/${owner}/${repo}/contents/${repositoryPath}/${depFile}`
              : `/repos/${owner}/${repo}/contents/${depFile}`;

            const depFileData = await apiCall(depFileUrl);
            const content = Buffer.from(depFileData.content, "base64").toString("utf-8");
            collectedDependencyFiles.push(`=== ${depFile} ===\n${content}`);
            console.log(`Found dependency file: ${depFile}`);
          } catch (error) {
            // Continue to next file
          }
        }

        // Find subdirectories (first-level only)
        const subdirectories = contents
          .filter((item: any) => item.type === "dir")
          .filter((item: any) => {
            // Skip common non-source directories
            const skipDirs = [
              "node_modules", ".git", "vendor", "dist", "build", 
              "out", "target", ".idea", ".vscode", "__pycache__",
              "coverage", ".pytest_cache", ".tox", "venv", "env"
            ];
            return !skipDirs.includes(item.name);
          });

        // Check each subdirectory for dependency files
        for (const subdir of subdirectories) {
          try {
            const subdirUrl = repositoryPath
              ? `/repos/${owner}/${repo}/contents/${repositoryPath}/${subdir.name}`
              : `/repos/${owner}/${repo}/contents/${subdir.name}`;

            const subdirContents = await apiCall(subdirUrl);
            
            // Find dependency files in subdirectory
            const subdirDepFiles = subdirContents
              .filter((item: any) => item.type === "file" && dependencyFiles.includes(item.name))
              .map((item: any) => item.name);

            // Fetch dependency files from subdirectory
            for (const depFile of subdirDepFiles) {
              try {
                const depFileUrl = repositoryPath
                  ? `/repos/${owner}/${repo}/contents/${repositoryPath}/${subdir.name}/${depFile}`
                  : `/repos/${owner}/${repo}/contents/${subdir.name}/${depFile}`;

                const depFileData = await apiCall(depFileUrl);
                const content = Buffer.from(depFileData.content, "base64").toString("utf-8");
                collectedDependencyFiles.push(`=== ${subdir.name}/${depFile} ===\n${content}`);
                console.log(`Found dependency file: ${subdir.name}/${depFile}`);
              } catch (error) {
                // Continue to next file
              }
            }
          } catch (error) {
            // Continue to next subdirectory
          }
        }

        // Combine all collected dependency files
        if (collectedDependencyFiles.length > 0) {
          rawDependencies = collectedDependencyFiles.join("\n\n");
          console.log(`Collected ${collectedDependencyFiles.length} dependency file(s)`);
        }
      } catch (error) {
        console.warn(`Could not list directory contents`);
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
        total_issues_count: repoData.open_issues_count || 0,
        language: repoData.language || "Unknown",
        has_releases: Array.isArray(releases) && releases.length > 0,
        has_workflows: workflows.total_count > 0,
        contributors_count: contributorsCount,
        readme_content: readmeContent,
        latest_commit_hash: latestCommitHash,
        raw_dependencies: rawDependencies,
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
 * Convert JSON Schema to Gemini's schema format
 */
function convertToGeminiSchema(jsonSchema: any): any {
  if (!jsonSchema) return undefined;

  // Handle primitive types
  if (typeof jsonSchema === 'string') {
    return { type: jsonSchema.toUpperCase() };
  }

  // Extract type, handling various formats
  let schemaType = jsonSchema.type;

  // If type is an array (union types), get the first non-null type
  if (Array.isArray(schemaType)) {
    schemaType = schemaType.find(t => t !== 'null') || schemaType[0];
  }

  // Convert to uppercase if it's a string
  const geminiType = (typeof schemaType === 'string' ? schemaType.toUpperCase() : 'OBJECT');

  if (geminiType === 'OBJECT') {
    // Handle objects with additionalProperties (dynamic keys)
    if (jsonSchema.additionalProperties && typeof jsonSchema.additionalProperties === 'object') {
      // For Gemini, we need to provide example properties since it doesn't support dynamic keys
      const additionalSchema = convertToGeminiSchema(jsonSchema.additionalProperties);
      
      // If this object also has defined properties, include them
      const properties: any = {};
      if (jsonSchema.properties) {
        for (const [key, value] of Object.entries(jsonSchema.properties)) {
          properties[key] = convertToGeminiSchema(value);
        }
      }
      
      // Add example dynamic properties - these will be replaced with actual server names
      properties['server-basic'] = additionalSchema;
      properties['server-docker'] = additionalSchema;
      properties['server-configured'] = additionalSchema;
      
      return {
        type: 'OBJECT',
        properties,
        required: jsonSchema.required || []
      };
    }
    
    // For objects without defined properties, add minimal schema
    if (!jsonSchema.properties || Object.keys(jsonSchema.properties).length === 0) {
      return { 
        type: 'OBJECT',
        properties: {
          '_placeholder': { type: 'STRING' }
        }
      };
    }

    // Convert defined properties
    const properties: any = {};
    for (const [key, value] of Object.entries(jsonSchema.properties)) {
      properties[key] = convertToGeminiSchema(value);
    }

    return {
      type: 'OBJECT',
      properties,
      required: jsonSchema.required || []
    };
  } else if (geminiType === 'ARRAY' && jsonSchema.items) {
    return {
      type: 'ARRAY',
      items: convertToGeminiSchema(jsonSchema.items)
    };
  } else if (geminiType === 'STRING' || geminiType === 'NUMBER' || geminiType === 'BOOLEAN') {
    return { type: geminiType };
  }

  // Default fallback
  return { type: geminiType };
}

/**
 * Call LLM (Ollama or Gemini) for analysis
 */
async function callLLM(
  prompt: string,
  format?: any,
  model = "gemini-2.5-pro",
): Promise<any> {
  try {
    // Check if this is a Gemini model
    if (model.startsWith("gemini-")) {
      // Call Gemini API
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required for Gemini models");
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // Convert format schema to Gemini's response schema format if provided
      let generationConfig: any = {
        temperature: 0.1,
        topP: 0.9,
        candidateCount: 1,
      };

      if (format) {
        generationConfig.responseMimeType = "application/json";
        // Convert JSON Schema to Gemini's schema format
        const convertedSchema = convertToGeminiSchema(format);
        console.log("Converted schema for Gemini:", JSON.stringify(convertedSchema, null, 2));
        generationConfig.responseSchema = convertedSchema;
      }

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!responseText) {
        throw new Error("No response text from Gemini");
      }

      // Debug logging
      console.log("Raw Gemini response:", responseText.substring(0, 200) + "...");

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
          `Invalid JSON response from Gemini: ${parseError.message}`,
        );
      }
    } else {
      // Call Ollama API (existing code)
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
    }
  } catch (error) {
    console.error("Error calling LLM:", error);
    throw error;
  }
}

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
 * Create MCPServer object from GitHub data
 */
function createNewMCPServer(
  githubInfo: ReturnType<typeof parseGitHubUrl>,
  apiData: GitHubApiResponse,
): MCPServer {
  const name =
    apiData.name
      .replace(/-/g, " ")
      .replace(/mcp|server/gi, "")
      .trim() || apiData.name;

  return {
    name,
    slug: githubInfo.slug,
    description:
      apiData.description ||
      `MCP server from ${githubInfo.owner}/${githubInfo.repo}`,
    readme: apiData.readme_content || undefined,
    category: null,
    qualityScore: null, // Will be calculated
    githubUrl: githubInfo.url,
    programmingLanguage: apiData.language,
    framework: undefined,
    gitHubOrg: githubInfo.gitHubOrg,
    gitHubRepo: githubInfo.gitHubRepo,
    repositoryPath: githubInfo.repositoryPath,
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
    rawDependencies: apiData.raw_dependencies || undefined,
  };
}

/**
 * Extract GitHub data for an existing server
 */
async function extractGitHubData(
  server: MCPServer,
  githubInfo: ReturnType<typeof parseGitHubUrl>,
  force: boolean = false
): Promise<MCPServer> {
  // Skip if already exists and not forcing
  if (server.last_scraped_at && !force) {
    console.log(`  ⏭️  GitHub Data: Skipped (last scraped: ${server.last_scraped_at})`);
    return server;
  }
  console.log(`  🔄 GitHub Data: Fetching...`);

  const apiData = await fetchRepoData(
    githubInfo.owner,
    githubInfo.repo,
    githubInfo.repositoryPath,
  );

  const newServer = createNewMCPServer(githubInfo, apiData);

  // Merge GitHub fields
  return {
    ...server,
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
    rawDependencies: newServer.rawDependencies,
  };
}

// ============= Core Extraction Methods =============

/**
 * Extract category classification using AI
 */
async function extractCategory(
  server: MCPServer,
  categories: string[],
  model: string,
  force: boolean = false
): Promise<MCPServer> {
  // Skip if human evaluation (evaluation_model === null)
  if (server.evaluation_model === null && !force) {
    console.log(`  ⏭️  Category: Skipped (human evaluation)`);
    return server;
  }
  // Skip if already exists and not forcing
  if (server.category && !force) {
    console.log(`  ⏭️  Category: Skipped (already exists: "${server.category}")`);
    return server;
  }
  console.log(`  🔄 Category: Extracting...`);

  const content = server.readme || server.description;
  if (!content) {
    console.warn("No content available for category analysis");
    return server;
  }

  const prompt = `Analyze this MCP server and choose the most appropriate category from this list: ${categories.join(", ")}

Content:
${content.substring(0, 8000)}

Respond with JSON: {"category": "..."}`;

  try {
    const result = await callLLM(prompt, null, model);
    if (result.category) {
      return {
        ...server,
        category: result.category as any,
        evaluation_model: model,
      };
    }
  } catch (error) {
    console.warn(`Category analysis failed: ${error.message}`);
  }

  return server;
}

/**
 * Extract client configuration using AI
 */
async function extractClientConfig(
  server: MCPServer,
  model: string,
  force: boolean = false
): Promise<MCPServer> {
  // Skip if human evaluation (evaluation_model === null)
  if (server.evaluation_model === null && !force) {
    console.log(`  ⏭️  Client Config: Skipped (human evaluation)`);
    return server;
  }
  // Skip if already exists and not forcing
  if (server.configForClients && !force) {
    console.log(`  ⏭️  Client Config: Skipped (already exists)`);
    return server;
  }
  console.log(`  🔄 Client Config: Extracting...`);

  const content = server.readme || server.description;
  if (!content) {
    console.warn("No content available for client config analysis");
    return server;
  }

  const prompt = `Find the run configuration for this MCP server. Look for commands that START the server.

Content:
${content.substring(0, 8000)}

Instructions:
- Extract all ways to run the server (npx, docker, node, python, etc.)
- For Docker commands: split "docker run" into command="docker" and args=["run", ...]
- For npx: command="npx", args=["-y", "package-name"]
- Extract environment variables from docker -e flags to env object
- CRITICAL: Server names MUST be derived from the actual package/image names in the content:
  - Look for the EXACT package name in the content
  - For scoped npm packages: "@scope/package-name" → "scope-package-name" 
  - For docker images: extract the image name and append "-docker"
  - For Python packages in uvx/pip: use the exact package name
  - Transform rules:
    * Replace @ with nothing
    * Replace / with hyphen
    * Keep the full package name, don't shorten it
    * Don't use just the last part of the name
  - Add suffixes for variants: "-docker", "-configured", "-stdio", "-with-config"
  - NEVER use generic names like "server-basic", "server-configured", "server-docker"
  - NEVER use single-word names like "agent", "server", "mcp"

Important: 
- For Docker, include the full image name in args
- Environment vars from -e flags go in both args and env
- Create separate entries for different configurations of the same server

Examples of CORRECT output:

If you find "mcp-server-fetch" in uvx command:
{
  "configForClients": {
    "mcpServers": {
      "mcp-server-fetch": {
        "command": "uvx",
        "args": ["mcp-server-fetch"]
      }
    }
  }
}

If you find "@modelcontextprotocol/server-filesystem" in npx and a docker variant:
{
  "configForClients": {
    "mcpServers": {
      "filesystem-server": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]
      },
      "filesystem-server-docker": {
        "command": "docker",
        "args": ["run", "-v", "/path:/data", "mcp/filesystem:latest"]
      }
    }
  }
}

The keys MUST be based on the actual package/image names found in the content.

If no run command found, respond with: {"configForClients": null}`;

  // For Gemini, we need a simpler schema without additionalProperties
  const isGemini = model.startsWith("gemini-");
  const configFormat = isGemini ? undefined : {
    type: "object",
    properties: {
      configForClients: {
        type: ["object", "null"],
        properties: {
          mcpServers: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                command: { type: "string" },
                args: {
                  type: "array",
                  items: { type: "string" }
                },
                env: {
                  type: "object",
                  additionalProperties: { type: "string" }
                }
              },
              required: ["command", "args"]
            }
          }
        },
        required: ["mcpServers"]
      },
    },
    required: ["configForClients"],
  };

  try {
    const result = await callLLM(prompt, configFormat, model);
    if (result.configForClients) {
      return {
        ...server,
        configForClients: result.configForClients,
        evaluation_model: model,
      };
    }
  } catch (error) {
    console.warn(`Client config analysis failed: ${error.message}`);
  }

  return server;
}

/**
 * Extract Archestra configuration using AI
 */
async function extractArchestraConfig(
  server: MCPServer,
  model: string,
  force: boolean = false
): Promise<MCPServer> {
  // Skip if human evaluation (evaluation_model === null)
  if (server.evaluation_model === null && !force) {
    console.log(`  ⏭️  Archestra Config: Skipped (human evaluation)`);
    return server;
  }
  // Skip if already exists and not forcing
  if (server.configForArchestra && !force) {
    console.log(`  ⏭️  Archestra Config: Skipped (already exists)`);
    return server;
  }
  console.log(`  🔄 Archestra Config: Extracting...`);

  const content = server.readme || server.description;
  if (!content) {
    console.warn("No content available for Archestra config analysis");
    return server;
  }

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
- Binary: command="./server", args=["--stdio"] 
- NPX package: command="npx", args=["-y", "@org/package-name"]
- NPX with transport: command="npx", args=["-y", "@org/package", "--transport", "stdio"]
- Python: command="python", args=["server.py", "--stdio"]
- Node: command="node", args=["dist/server.js", "--stdio"]

IMPORTANT: 
- Always include the full args array with all flags and parameters
- For npx, include "-y" flag and the full package name
- If transport is stdio, include transport flags like "--transport", "stdio" in args

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
              env: { 
                type: "object",
                additionalProperties: { type: "string" }
              },
            },
            required: ["transport", "command", "args"]
          },
        },
      },
    },
    required: ["configForArchestra"],
  };

  try {
    const result = await callLLM(prompt, configFormat, model);
    if (result.configForArchestra) {
      return {
        ...server,
        configForArchestra: result.configForArchestra,
        evaluation_model: model,
      };
    }
  } catch (error) {
    console.warn(`Archestra config analysis failed: ${error.message}`);
  }

  return server;
}

/**
 * Extract dependencies using AI
 */
async function extractDependencies(
  server: MCPServer,
  model: string,
  force: boolean = false
): Promise<MCPServer> {
  // Skip if human evaluation (evaluation_model === null)
  if (server.evaluation_model === null && !force) {
    console.log(`  ⏭️  Dependencies: Skipped (human evaluation)`);
    return server;
  }
  // Skip if already exists and not forcing
  if (server.dependencies && !force) {
    console.log(`  ⏭️  Dependencies: Skipped (already exists - ${server.dependencies.length} deps)`);
    return server;
  }
  console.log(`  🔄 Dependencies: Extracting...`);

  const content = server.readme || server.description;
  const rawDeps = server.rawDependencies;

  if (!content && !rawDeps) {
    console.warn("No content available for dependencies analysis");
    return server;
  }

  const prompt = `Analyze this MCP server and identify its library dependencies.

${rawDeps ? `Dependency File Content:\n${rawDeps}\n` : ""}

README/Description:
${content ? content.substring(0, 8000) : "Not available"}

Instructions:
1. If dependency file is provided (package.json, requirements.txt, etc.), extract dependencies from it FIRST
2. For package.json, look at "dependencies" object (ignore "devDependencies")
3. For requirements.txt, list each package
4. For go.mod, list the required modules
5. For other formats, extract the production dependencies

IMPORTANT - Clean up dependency names:
- Remove "github.com/" prefix from Go modules (e.g., "github.com/mark3labs/mcp-go" → "mark3labs/mcp-go")
- Remove version constraints (e.g., "express@^5.0.0" → "express")
- Use the package name only, not the full URL or path
- Keep scoped npm packages as-is (e.g., "@modelcontextprotocol/sdk")

Look for these types of libraries:
1. Main framework/library (e.g., Express, FastAPI, Hono, Gin, etc.)
2. MCP-specific libraries (e.g., @modelcontextprotocol/sdk, mcp, fastmcp)
3. Database libraries (e.g., mongoose, prisma, sqlalchemy)
4. API client libraries (e.g., axios, octokit, googleapis)
5. Authentication libraries (e.g., passport, oauth2-client)
6. Utility libraries (e.g., lodash, zod, joi)
7. Testing libraries (only if in production dependencies)
8. Build/bundling tools as libraries (only if required at runtime)

DO NOT include:
- Programming languages (Node.js, Python, Go, etc.)
- Runtime environments
- Package managers (npm, pip, cargo)
- Operating systems
- External services (unless it's a client library for that service)

Respond with JSON format:
{
  "dependencies": [
    {"name": "@modelcontextprotocol/sdk", "importance": 10},
    {"name": "express", "importance": 8},
    {"name": "mark3labs/mcp-go", "importance": 9},
    {"name": "axios", "importance": 6}
  ]
}

Note: For Go modules, use "owner/repo" format WITHOUT "github.com/" prefix

Importance scale (1-10):
- 10: Main framework or core MCP library
- 8-9: Essential libraries for core functionality
- 5-7: Important for specific features
- 3-4: Utility libraries
- 1-2: Optional or dev dependencies

If no library dependencies found, respond: {"dependencies": []}`;

  const dependenciesFormat = {
    type: "object",
    properties: {
      dependencies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            importance: { type: "number", minimum: 1, maximum: 10 }
          },
          required: ["name", "importance"]
        }
      }
    },
    required: ["dependencies"]
  };

  try {
    const result = await callLLM(prompt, dependenciesFormat, model);
    if (result.dependencies && result.dependencies.length > 0) {
      return {
        ...server,
        dependencies: result.dependencies,
        evaluation_model: model,
      };
    }
  } catch (error) {
    console.warn(`Dependencies analysis failed: ${error.message}`);
  }

  return server;
}

/**
 * Extract protocol features using AI
 */
async function extractProtocolFeatures(
  server: MCPServer,
  model: string,
  force: boolean = false
): Promise<MCPServer> {
  // Skip if human evaluation (evaluation_model === null)
  if (server.evaluation_model === null && !force) {
    console.log(`  ⏭️  Protocol Features: Skipped (human evaluation)`);
    return server;
  }
  // Skip if already exists and not forcing
  if (server.implementing_tools !== null && !force) {
    console.log(`  ⏭️  Protocol Features: Skipped (already exists)`);
    return server;
  }
  console.log(`  🔄 Protocol Features: Extracting...`);

  const content = server.readme || server.description;
  if (!content) {
    console.warn("No content available for protocol analysis");
    return server;
  }

  const prompt = `Analyze this MCP server README and code to determine which MCP protocol features are implemented.

Content:
${content.substring(0, 8000)}

Look for these MCP protocol features:
1. **Tools** - Server provides tools/functions that can be called (look for "tools", "functions", "methods", tool definitions)
2. **Prompts** - Server provides prompt templates (look for "prompts", "templates", prompt definitions)
3. **Resources** - Server provides resources that can be read (look for "resources", resource definitions, data access)
4. **Sampling** - Server supports completion/sampling requests (look for "sampling", "completion", LLM integration)
5. **Roots** - Server supports roots protocol for directory access (look for "roots", "directories", dynamic directory configuration)
6. **Logging** - Server implements logging features (look for "logging", "log levels", structured logging)
7. **STDIO Transport** - Server supports stdio transport (look for "stdio", command-line interface, standard input/output)
8. **HTTP Transport** - Server supports HTTP/SSE transport (look for "http", "sse", "server-sent events", web server)
9. **OAuth2** - Server implements OAuth2 authentication (look for "oauth", "oauth2", "authentication", "authorization")

Instructions:
- Return true if the feature is clearly implemented based on the README
- Return false if the feature is not mentioned or not implemented
- Look for explicit mentions, code examples, configuration options, or API documentation
- For transports, check if the server mentions how to connect (stdio vs http)
- For OAuth2, look for authentication setup instructions

Respond with JSON format:
{
  "implementing_tools": true/false,
  "implementing_prompts": true/false,
  "implementing_resources": true/false,
  "implementing_sampling": true/false,
  "implementing_roots": true/false,
  "implementing_logging": true/false,
  "implementing_stdio": true/false,
  "implementing_streamable_http": true/false,
  "implementing_oauth2": true/false
}`;

  const protocolFormat = {
    type: "object",
    properties: {
      implementing_tools: { type: "boolean" },
      implementing_prompts: { type: "boolean" },
      implementing_resources: { type: "boolean" },
      implementing_sampling: { type: "boolean" },
      implementing_roots: { type: "boolean" },
      implementing_logging: { type: "boolean" },
      implementing_stdio: { type: "boolean" },
      implementing_streamable_http: { type: "boolean" },
      implementing_oauth2: { type: "boolean" }
    },
    required: [
      "implementing_tools",
      "implementing_prompts",
      "implementing_resources",
      "implementing_sampling",
      "implementing_roots",
      "implementing_logging",
      "implementing_stdio",
      "implementing_streamable_http",
      "implementing_oauth2"
    ]
  };

  try {
    const result = await callLLM(prompt, protocolFormat, model);

    // Update all protocol fields
    return {
      ...server,
      implementing_tools: result.implementing_tools,
      implementing_prompts: result.implementing_prompts,
      implementing_resources: result.implementing_resources,
      implementing_sampling: result.implementing_sampling,
      implementing_roots: result.implementing_roots,
      implementing_logging: result.implementing_logging,
      implementing_stdio: result.implementing_stdio,
      implementing_streamable_http: result.implementing_streamable_http,
      implementing_oauth2: result.implementing_oauth2,
      evaluation_model: model,
    };
  } catch (error) {
    console.warn(`Protocol analysis failed: ${error.message}`);
  }

  return server;
}

/**
 * Extract/calculate quality score
 */
async function extractScore(
  server: MCPServer,
  force: boolean = false
): Promise<MCPServer> {
  // Note: Quality score can be recalculated even for human evaluations
  // Skip if already exists and not forcing
  if (server.qualityScore !== null && !force) {
    console.log(`  ⏭️  Quality Score: Skipped (already exists: ${server.qualityScore}/100)`);
    return server;
  }
  console.log(`  🔄 Quality Score: Calculating...`);

  // Load all servers for dependency commonality calculation
  const allServers = loadServers();
  const scoreBreakdown = calculateQualityScore(server, server.readme, allServers);

  return {
    ...server,
    qualityScore: scoreBreakdown.total,
  };
}

// ============= Main Functions =============

/**
 * Evaluate a single repository
 */
async function evaluateSingleRepo(
  githubUrl: string,
  options: EvaluationOptions = {},
): Promise<MCPServer> {
  try {
    if (options.showOutput !== false) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 Evaluating: ${githubUrl}`);
      console.log(`${'='.repeat(60)}`);
    }

    // 1. Parse GitHub URL
    const githubInfo = parseGitHubUrl(githubUrl);
    const evaluationsDir = path.join(__dirname, "../data/mcp-evaluations");
    const filePath = path.join(evaluationsDir, `${githubInfo.slug}.json`);

    // 2. Load existing or fetch new data
    let server = loadMCPServerFromFile(filePath);
    
    if (options.showOutput !== false) {
      if (server) {
        console.log(`📄 Existing evaluation found: ${githubInfo.slug}.json`);
      } else {
        console.log(`🆕 Creating new evaluation for: ${githubInfo.slug}`);
      }
      console.log(`\n📋 Update Options:`);
      console.log(`  - Force: ${options.force ? 'YES' : 'NO'}`);
      console.log(`  - Model: ${options.model || 'gemini-2.5-pro'}`);
      if (options.updateAll) console.log(`  - Mode: UPDATE ALL`);
      else {
        const updates = [];
        if (options.updateGithub) updates.push('GitHub');
        if (options.updateCategory) updates.push('Category');
        if (options.updateConfigForClients) updates.push('ClientConfig');
        if (options.updateConfigForArchestra) updates.push('ArchestraConfig');
        if (options.updateDependencies) updates.push('Dependencies');
        if (options.updateProtocol) updates.push('Protocol');
        if (options.updateScore) updates.push('Score');
        console.log(`  - Updates: ${updates.length > 0 ? updates.join(', ') : 'Fill missing only'}`);
      }
      console.log(`\n🚀 Processing:`);
    }

    if (!server) {
      // Create new server from GitHub
      const apiData = await fetchRepoData(
        githubInfo.owner,
        githubInfo.repo,
        githubInfo.repositoryPath,
      );
      server = createNewMCPServer(githubInfo, apiData);
    }

    // 3. Apply updates based on options
    if (options.updateGithub || !server.last_scraped_at) {
      server = await extractGitHubData(server, githubInfo, options.force || false);
    }

    if (options.updateCategory) {
      const categories = options.categories || extractCategories();
      server = await extractCategory(server, categories, options.model || "gemini-2.5-pro", options.force || false);
    }

    if (options.updateConfigForClients) {
      server = await extractClientConfig(server, options.model || "gemini-2.5-pro", options.force || false);
    }

    if (options.updateConfigForArchestra) {
      server = await extractArchestraConfig(server, options.model || "gemini-2.5-pro", options.force || false);
    }

    if (options.updateDependencies) {
      server = await extractDependencies(server, options.model || "gemini-2.5-pro", options.force || false);
    }

    if (options.updateProtocol) {
      server = await extractProtocolFeatures(server, options.model || "gemini-2.5-pro", options.force || false);
    }

    if (options.updateScore) {
      server = await extractScore(server, options.force || false);
    }

    // Display results if showOutput
    if (options.showOutput !== false && server.qualityScore !== null) {
      const allServers = loadServers();
      const scoreBreakdown = calculateQualityScore(server, server.readme, allServers);
      console.log("\n📈 Quality Score Breakdown:");
      console.log(`  MCP Protocol Implementation: ${scoreBreakdown.mcpProtocol}/40`);
      console.log(`  GitHub Community Health: ${scoreBreakdown.githubMetrics}/20`);
      console.log(`  Dependency Optimization: ${scoreBreakdown.dependencies}/20`);
      console.log(`  Deployment Maturity: ${scoreBreakdown.deploymentMaturity}/10`);
      console.log(`  Documentation Quality: ${scoreBreakdown.documentation}/8`);
      console.log(`  Badge Adoption: ${scoreBreakdown.badgeUsage}/2`);
      console.log(`  📊 Total Score: ${scoreBreakdown.total}/100`);

      if (server.category || server.configForClients || server.configForArchestra ||
          server.dependencies || server.implementing_tools !== null) {
        console.log(`\n🤖 AI Analysis:`);
        if (server.category) console.log(`  Category: ${server.category}`);
        if (server.configForClients) console.log(`  Client Configuration: Available`);
        if (server.configForArchestra) console.log(`  Archestra Configuration: Available`);
        if (server.dependencies && server.dependencies.length > 0) {
          console.log(`  Dependencies: ${server.dependencies.map(d => `${d.name}(${d.importance})`).join(', ')}`);
        }
        if (server.implementing_tools !== null) {
          const protocolFeatures = [];
          if (server.implementing_tools) protocolFeatures.push("Tools");
          if (server.implementing_prompts) protocolFeatures.push("Prompts");
          if (server.implementing_resources) protocolFeatures.push("Resources");
          if (server.implementing_sampling) protocolFeatures.push("Sampling");
          if (server.implementing_roots) protocolFeatures.push("Roots");
          if (server.implementing_logging) protocolFeatures.push("Logging");
          if (server.implementing_stdio) protocolFeatures.push("STDIO");
          if (server.implementing_streamable_http) protocolFeatures.push("HTTP");
          if (server.implementing_oauth2) protocolFeatures.push("OAuth2");
          console.log(`  Protocol Features: ${protocolFeatures.length > 0 ? protocolFeatures.join(', ') : 'None'}`);
        }
      }
    }

    // 4. Save and return
    saveMCPServerToFile(server, filePath);
    if (options.showOutput !== false) {
      console.log(`\n✅ Evaluation completed: ${githubInfo.slug}.json`);
      console.log(`${'='.repeat(60)}`);
    }

    return server;
  } catch (error) {
    if (error.message && (error.message.startsWith("PATH_NOT_FOUND:") ||
        error.message.startsWith("REPO_NOT_FOUND:"))) {
      if (options.showOutput !== false) console.error(`❌ ${error.message}`);
      removeFromServerList(githubUrl);
      throw error;
    } else {
      if (options.showOutput !== false) console.error("❌ Evaluation failed:", error);
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
    updateDependencies?: boolean;
    updateProtocol?: boolean;
    updateScore?: boolean;
    updateAll?: boolean;
    force?: boolean;
    model?: string;
    concurrency?: number;
    categories?: string[];
    limit?: number;
  } = {},
): Promise<void> {
  const evaluationsDir = path.join(__dirname, "../data/mcp-evaluations");
  const serversPath = path.join(__dirname, "../data/mcp-servers.json");

  // Ensure evaluations directory exists
  if (!fs.existsSync(evaluationsDir)) {
    fs.mkdirSync(evaluationsDir, { recursive: true });
  }

  // Read all GitHub URLs
  let githubUrls: string[] = JSON.parse(fs.readFileSync(serversPath, "utf8"));
  const existingFiles = fs
    .readdirSync(evaluationsDir)
    .filter((f) => f.endsWith(".json"));

  // Apply limit if specified
  if (options.limit && options.limit > 0) {
    githubUrls = githubUrls.slice(0, options.limit);
  }

  // Determine concurrency based on whether we have a token
  const hasToken = !!process.env.GITHUB_TOKEN;
  const concurrency = options.concurrency || (hasToken ? 10 : 3);

  console.log(`📊 Batch Evaluation
Total servers: ${githubUrls.length}${options.limit ? ` (limited from ${JSON.parse(fs.readFileSync(serversPath, "utf8")).length})` : ""}
Existing evaluations: ${existingFiles.length}
Concurrency: ${concurrency} parallel requests
Options: ${Object.entries(options)
    .filter(([k, v]) => v && k !== "concurrency" && k !== "categories" && k !== "limit")
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
        const githubInfo = parseGitHubUrl(url);
        const filePath = path.join(evaluationsDir, `${githubInfo.slug}.json`);
        const exists = fs.existsSync(filePath);

        // Skip if exists and no updates requested
        if (
          exists &&
          !options.updateGithub &&
          !options.updateCategory &&
          !options.updateConfigForClients &&
          !options.updateConfigForArchestra &&
          !options.updateDependencies &&
          !options.updateProtocol &&
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
  --dependencies        Update library dependencies
  --protocol            Update MCP protocol features implementation
  --score               Update quality scores
  --all                 Update everything
  (no flags)            Fill in missing data only

Control Options:
  --force             Force update even if data exists
  --model <name>      LLM model to use (default: gemini-2.5-pro)
                      Supports Ollama models and Gemini models (e.g., gemini-1.5-flash)
  --concurrency <n>   Number of parallel requests (default: 10 with token, 3 without)
  --limit <n>         Process only the first N servers

Examples:
  npm run evaluate https://github.com/org/repo
  npm run evaluate --github --force
  npm run evaluate --category --model llama2
  npm run evaluate --category --model gemini-1.5-flash
  npm run evaluate --all --concurrency 20
  npm run evaluate --dependencies --limit 10

Note: For Gemini models, set GEMINI_API_KEY or GOOGLE_API_KEY environment variable`);
    return;
  }

  // Parse options
  const options = {
    updateGithub: args.includes("--github"),
    updateCategory: args.includes("--category"),
    updateConfigForClients: args.includes("--config-for-clients"),
    updateConfigForArchestra: args.includes("--config-for-archestra"),
    updateDependencies: args.includes("--dependencies"),
    updateProtocol: args.includes("--protocol"),
    updateScore: args.includes("--score"),
    updateAll: args.includes("--all"),
    force: args.includes("--force"),
    model: args.includes("--model")
      ? args[args.indexOf("--model") + 1]
      : "gemini-2.5-pro",
    concurrency: args.includes("--concurrency")
      ? parseInt(args[args.indexOf("--concurrency") + 1]) || undefined
      : undefined,
    limit: args.includes("--limit")
      ? parseInt(args[args.indexOf("--limit") + 1]) || undefined
      : undefined,
  };

  // Apply --all flag
  if (options.updateAll) {
    options.updateGithub = true;
    options.updateCategory = true;
    options.updateConfigForClients = true;
    options.updateConfigForArchestra = true;
    options.updateDependencies = true;
    options.updateProtocol = true;
    options.updateScore = true;
  }

  const githubUrl = args.find((arg) => arg.includes("github.com"));

  // Check GitHub token
  if (!process.env.GITHUB_TOKEN) {
    console.log(`⚠️  No GITHUB_TOKEN found. You may hit rate limits.
   Get a token at: https://github.com/settings/tokens\n`);
  }

  let categories: string[] | undefined;

  if (options.updateCategory) {
    categories = extractCategories();
    console.log(`✅ Found ${categories.length} categories from types.ts`);
  }

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
