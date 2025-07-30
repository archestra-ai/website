export interface MCPServer {
  name: string
  description: string
  category: string
  features: string[]
  status: "stable" | "beta" | "experimental"
  qualityScore: number // 0-100
}

export const mcpServers: MCPServer[] = [
  {
    name: "MCP Filesystem",
    description: "File system operations including reading, writing, and searching files",
    category: "Core",
    features: ["File I/O", "Directory Operations", "Search"],
    status: "stable",
    qualityScore: 95
  },
  {
    name: "MCP Git",
    description: "Git repository operations and version control integration",
    category: "Development",
    features: ["Commits", "Branches", "Diffs", "History"],
    status: "stable",
    qualityScore: 92
  },
  {
    name: "MCP Web",
    description: "Web scraping and HTTP request capabilities",
    category: "Network",
    features: ["HTTP Requests", "Web Scraping", "API Calls"],
    status: "stable",
    qualityScore: 88
  },
  {
    name: "MCP Database",
    description: "Database connection and query execution",
    category: "Data",
    features: ["SQL Queries", "Schema Management", "Migrations"],
    status: "beta",
    qualityScore: 78
  },
  {
    name: "MCP Docker",
    description: "Container management and Docker operations",
    category: "Infrastructure",
    features: ["Container Control", "Image Management", "Compose"],
    status: "beta",
    qualityScore: 75
  },
  {
    name: "MCP AWS",
    description: "AWS service integration and cloud operations",
    category: "Cloud",
    features: ["S3", "EC2", "Lambda", "DynamoDB"],
    status: "experimental",
    qualityScore: 65
  },
  {
    name: "MCP Slack",
    description: "Slack workspace integration and messaging",
    category: "Communication",
    features: ["Messages", "Channels", "Users", "Files"],
    status: "stable",
    qualityScore: 86
  },
  {
    name: "MCP GitHub",
    description: "GitHub API integration for repository management",
    category: "Development",
    features: ["Issues", "PRs", "Actions", "Releases"],
    status: "stable",
    qualityScore: 90
  },
  {
    name: "MCP Memory",
    description: "Persistent memory and knowledge management",
    category: "Core",
    features: ["Store", "Retrieve", "Search", "Update"],
    status: "experimental",
    qualityScore: 60
  }
]