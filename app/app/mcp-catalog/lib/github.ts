import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

// Helper function to get the display name for an MCP server
export function getMcpServerName({ github_info: { path, repo } }: ArchestraMcpServerManifest): string {
  if (path) {
    // If there's a repository path, use the last part of it
    const pathParts = path.split('/');
    return pathParts[pathParts.length - 1];
  }
  // Otherwise, use the repository name
  return repo;
}

// Helper function to get the GitHub URL for an MCP server
export function getMcpServerGitHubUrl({ github_info: { owner, repo, path } }: ArchestraMcpServerManifest): string {
  const baseUrl = `https://github.com/${owner}/${repo}`;
  if (path) {
    return `${baseUrl}/tree/main/${path}`;
  }
  return baseUrl;
}
