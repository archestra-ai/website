import { ArchestraMcpServerManifest } from "../../types";

// Helper function to get the display name for an MCP server
export function getMcpServerName({
  github_info,
}: ArchestraMcpServerManifest): string {
  if (github_info.path) {
    // If there's a repository path, use the last part of it
    const pathParts = github_info.path.split("/");
    return pathParts[pathParts.length - 1];
  }
  // Otherwise, use the repository name
  return github_info.repo;
}

// Helper function to get the GitHub URL for an MCP server
export function getMcpServerGitHubUrl({
  github_info,
}: ArchestraMcpServerManifest): string {
  const baseUrl = `https://github.com/${github_info.owner}/${github_info.repo}`;
  if (github_info.path) {
    return `${baseUrl}/tree/main/${github_info.path}`;
  }
  return baseUrl;
}
