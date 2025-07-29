import { MCPServer } from "../data/types";
import fs from "fs";
import path from "path";

// Extract server info and generate slug from GitHub URL
export function extractServerInfo(githubUrl: string): { gitHubOrg: string; gitHubRepo: string; slug: string; repositoryPath: string | null } {
  try {
    const url = githubUrl.replace(/\/$/, ""); // Remove trailing slash
    const parts = url.split("/");

    // Ensure we have enough parts
    if (parts.length < 5) {
      console.warn(`Invalid GitHub URL format: ${githubUrl}`);
      const fallbackName = githubUrl.split("/").pop() || "unknown";
      return {
        gitHubOrg: "unknown",
        gitHubRepo: fallbackName,
        slug: fallbackName.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
        repositoryPath: null,
      };
    }

    const gitHubOrg = parts[3] || "unknown";
    const gitHubRepo = parts[4] || "unknown";

    // Handle different GitHub URL patterns
    if (url.includes("/tree/") || url.includes("/blob/")) {
      // URLs like https://github.com/owner/repo/tree/main/path
      const repoEndIndex = parts.findIndex((p) => p === "tree" || p === "blob");
      const pathParts = parts.slice(repoEndIndex + 2).filter((p) => p);
      const repositoryPath = pathParts.length > 0 ? pathParts.join("/") : null;
      const slug = `${gitHubOrg}__${gitHubRepo}${repositoryPath ? "__" + pathParts.join("__") : ""}`
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");
      return { gitHubOrg, gitHubRepo, slug, repositoryPath };
    } else {
      // Simple URLs like https://github.com/owner/repo
      const slug = `${gitHubOrg}__${gitHubRepo}`
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");
      return { gitHubOrg, gitHubRepo, slug, repositoryPath: null };
    }
  } catch (error) {
    console.error(`Error extracting info from URL ${githubUrl}:`, error);
    const fallbackName = githubUrl.split("/").pop() || "unknown";
    return {
      gitHubOrg: "unknown",
      gitHubRepo: fallbackName,
      slug: fallbackName.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
      repositoryPath: null,
    };
  }
}

// Load all servers from mcp-servers.json and merge with evaluations
export function loadAllServers(): MCPServer[] {
  const servers: MCPServer[] = [];
  const evaluationsMap = new Map<string, MCPServer>();
  const processedSlugs = new Set<string>();

  // First, load all evaluations
  const evaluationsDir = path.join(process.cwd(), "data", "mcp-evaluations");

  if (fs.existsSync(evaluationsDir)) {
    try {
      const files = fs.readdirSync(evaluationsDir);

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const filePath = path.join(evaluationsDir, file);
            const content = fs.readFileSync(filePath, "utf-8");
            const evaluation = JSON.parse(content) as MCPServer;
            // Map by slug instead of trying to reconstruct URL
            evaluationsMap.set(evaluation.slug, evaluation);
          } catch (error) {
            console.warn(`Failed to load evaluation file ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load evaluations:", error);
    }
  }

  // Then, load all servers from mcp-servers.json
  const mcpServersPath = path.join(process.cwd(), "data", "mcp-servers.json");

  try {
    const mcpServersContent = fs.readFileSync(mcpServersPath, "utf-8");
    const mcpServerUrls = JSON.parse(mcpServersContent) as string[];

    for (const url of mcpServerUrls) {
      // Extract info to generate slug for lookup
      const { gitHubOrg, gitHubRepo, slug, repositoryPath } = extractServerInfo(url);
      
      // Skip if we've already processed this slug (avoid duplicates)
      if (processedSlugs.has(slug)) {
        continue;
      }
      processedSlugs.add(slug);
      
      // Check if we have an evaluation for this server using the slug
      const evaluation = evaluationsMap.get(slug);

      if (evaluation) {
        servers.push(evaluation);
      } else {
        // Create a placeholder entry for servers without evaluation
        servers.push({
          slug,
          description: "We're evaluating this MCP server",
          category: null,
          qualityScore: null,
          gitHubOrg,
          gitHubRepo,
          repositoryPath,
          programmingLanguage: "Unknown",
          gh_stars: 0,
          gh_contributors: 0,
          gh_issues: 0,
          gh_releases: false,
          gh_ci_cd: false,
          implementing_tools: false,
          implementing_prompts: false,
          implementing_resources: false,
          implementing_sampling: false,
          implementing_roots: false,
          implementing_logging: false,
          implementing_stdio: false,
          implementing_streamable_http: false,
          implementing_oauth2: false,
        });
      }
    }
  } catch (error) {
    console.error("Failed to load mcp-servers.json:", error);
  }

  // Sort: evaluated servers first (by quality score), then unevaluated servers
  return servers.sort((a, b) => {
    // Get names using the helper function
    const nameA = a.repositoryPath ? a.repositoryPath.split('/').pop() || a.gitHubRepo : a.gitHubRepo;
    const nameB = b.repositoryPath ? b.repositoryPath.split('/').pop() || b.gitHubRepo : b.gitHubRepo;
    
    // Evaluated servers come first
    if (a.qualityScore !== null && b.qualityScore === null) return -1;
    if (a.qualityScore === null && b.qualityScore !== null) return 1;

    // Among evaluated servers, sort by quality score
    if (a.qualityScore !== null && b.qualityScore !== null) {
      if (a.qualityScore !== b.qualityScore) {
        return b.qualityScore - a.qualityScore;
      }
      return b.gh_stars - a.gh_stars;
    }

    // Among unevaluated servers, sort alphabetically
    return nameA.localeCompare(nameB);
  });
}