import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

/**
 * Generate the image URL for an MCP server by attempting to fetch from the GitHub repository
 */
export function getMcpServerImageUrl(server: ArchestraMcpServerManifest): string {
  const { owner, repo, path } = server.github_info;
  
  // Try different common image locations in the GitHub repository
  const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main`;
  
  if (path) {
    // For monorepo servers, look in the specific path directory
    return `${baseUrl}/${path}/icon.png`;
  } else {
    // For root-level servers, look in common locations
    return `${baseUrl}/icon.png`;
  }
}

/**
 * Generate fallback image URLs to try if the primary image fails
 */
export function getMcpServerImageFallbacks(server: ArchestraMcpServerManifest): string[] {
  const { owner, repo, path } = server.github_info;
  const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main`;
  
  const fallbacks: string[] = [];
  
  if (path) {
    // For monorepo servers, try different common names in the path
    fallbacks.push(
      `${baseUrl}/${path}/icon.svg`,
      `${baseUrl}/${path}/logo.png`,
      `${baseUrl}/${path}/logo.svg`,
      `${baseUrl}/${path}/assets/icon.png`,
      `${baseUrl}/${path}/assets/logo.png`,
    );
  }
  
  // Always try root-level images as fallback
  fallbacks.push(
    `${baseUrl}/icon.svg`,
    `${baseUrl}/logo.png`,
    `${baseUrl}/logo.svg`,
    `${baseUrl}/assets/icon.png`,
    `${baseUrl}/assets/logo.png`,
    `${baseUrl}/.github/icon.png`,
    `${baseUrl}/.github/logo.png`,
  );
  
  return fallbacks;
}

/**
 * Generate alt text for the MCP server image
 */
export function getMcpServerImageAlt(server: ArchestraMcpServerManifest): string {
  return `${server.display_name} MCP server icon`;
}

/**
 * Check if a server likely has an image by checking common conventions
 */
export function serverLikelyHasImage(server: ArchestraMcpServerManifest): boolean {
  // This could be extended with actual HTTP checks, but for now we'll assume
  // servers from certain popular organizations or with certain characteristics
  // are more likely to have images
  const { owner } = server.github_info;
  
  // Popular organizations that typically have good branding
  const wellKnownOrgs = [
    'modelcontextprotocol',
    'anthropic',
    'openai',
    'microsoft',
    'google',
    'cloudflare',
    'github',
    'gitlab',
    'docker',
    'kubernetes',
  ];
  
  // Check if it's from a well-known organization
  if (wellKnownOrgs.includes(owner.toLowerCase())) {
    return true;
  }
  
  // Check if it's a server with high quality score (likely more polished)
  if (server.quality_score && server.quality_score > 70) {
    return true;
  }
  
  // Check if it has many GitHub stars (popular projects often have branding)
  if (server.github_info.stars > 100) {
    return true;
  }
  
  return false;
}