export interface MCPTool {
  name: string;
  description: string;
  parameters?: string[];
}

export interface MCPDependency {
  name: string; // e.g. "Node.js", "Docker", "Python", "API Key"
  importance: number; // 1-10 scale, where 10 is absolutely critical
}

export interface ServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface ClientsConfig {
  mcpServers: Record<string, ServerConfig>;
}

export interface ArchestraServerConfig extends ServerConfig {
  oauth?: {
    provider: string;
    required: boolean;
  };
  transport: "http" | "stdio";
  env: Record<string, string>; // Making env required for Archestra
}

export interface MCPServer {
  slug: string;
  description: string;
  readme?: string;
  category:
    | "Aggregators"
    | "Art & Culture"
    | "Healthcare"
    | "Browser Automation"
    | "Cloud"
    | "Development"
    | "CLI Tools"
    | "Communication"
    | "Data"
    | "Logistics"
    | "Data Science"
    | "IoT"
    | "File Management"
    | "Finance"
    | "Gaming"
    | "Knowledge"
    | "Location"
    | "Marketing"
    | "Monitoring"
    | "Media"
    | "AI Tools"
    | "Search"
    | "Security"
    | "Social Media"
    | "Sports"
    | "Support"
    | "Translation"
    | "Audio"
    | "Travel"
    | "Messengers"
    | "Email"
    | "CRM"
    | "Enterprise"
    | "Job Search"
    | "Local files"
    | null;
  qualityScore: number | null; // 0-100
  gitHubOrg: string; // e.g. "modelcontextprotocol"
  gitHubRepo: string; // e.g. "servers"
  repositoryPath?: string | null; // e.g. "src/filesystem" for monorepo paths
  programmingLanguage: string;
  framework?: string;
  // GitHub Metrics
  gh_stars: number;
  gh_contributors: number;
  gh_issues: number;
  gh_releases: boolean;
  gh_ci_cd: boolean;
  gh_latest_commit_hash?: string;
  last_scraped_at?: string; // ISO date string
  evaluation_model?: string; // Model used for AI evaluation (e.g., "gemini-2.5-pro")
  // MCP Protocol Features
  implementing_tools: boolean;
  implementing_prompts: boolean;
  implementing_resources: boolean;
  implementing_sampling: boolean;
  implementing_roots: boolean;
  implementing_logging: boolean;
  // Transport Support
  implementing_stdio: boolean;
  implementing_streamable_http: boolean;
  // Authorization Support
  implementing_oauth2: boolean;
  // Configuration for Claude and other clients
  configForClients?: ClientsConfig | null;
  // Configuration for Archestra
  configForArchestra?: ArchestraServerConfig | null;
  tools?: MCPTool[];
  scoreBreakdown?: {
    codeQuality: number;
    documentation: number;
    communitySupport: number;
    stability: number;
    performance: number;
  };
  dependencies?: MCPDependency[];
  rawDependencies?: string; // Raw content of package.json, requirements.txt, go.mod, etc.
}

// Helper function to get the display name for an MCP server
export function getMCPServerName(server: MCPServer): string {
  if (server.repositoryPath) {
    // If there's a repository path, use the last part of it
    const pathParts = server.repositoryPath.split("/");
    return pathParts[pathParts.length - 1];
  }
  // Otherwise, use the repository name
  return server.gitHubRepo;
}

// Helper function to get the GitHub URL for an MCP server
export function getMCPServerGitHubUrl(server: MCPServer): string {
  const baseUrl = `https://github.com/${server.gitHubOrg}/${server.gitHubRepo}`;
  if (server.repositoryPath) {
    return `${baseUrl}/tree/main/${server.repositoryPath}`;
  }
  return baseUrl;
}
