import constants, { generateMcpCatalogDetailPageUrlFromGitHubDetails } from '@constants';

const {
  website: {
    urls: { base: websiteBaseUrl, mcpCatalog: websiteMcpCatalogUrl },
  },
} = constants;

const _determineGitHubUrlPathSuffix = (githubOwner: string, githubRepo: string, githubPath?: string | null) =>
  githubPath ? `${githubOwner}/${githubRepo}/${githubPath.replace(/\//g, '--')}` : `${githubOwner}/${githubRepo}`;

export const generateBadgeRelativeUrl = (githubOwner: string, githubRepo: string, githubPath?: string | null) =>
  `/mcp-catalog/api/badge/quality/${_determineGitHubUrlPathSuffix(githubOwner, githubRepo, githubPath)}`;

export const generateBadgeAbsoluteUrl = (githubOwner: string, githubRepo: string, githubPath?: string | null) =>
  `${websiteBaseUrl}${generateBadgeRelativeUrl(githubOwner, githubRepo, githubPath)}`;

export const generateBadgeMarkdown = (
  githubOwner: string,
  githubRepo: string,
  githubPath?: string | null,
  serverName?: string
) => {
  const badgeUrl = generateBadgeAbsoluteUrl(githubOwner, githubRepo, githubPath);
  const linkUrl = serverName
    ? `${websiteMcpCatalogUrl}/${serverName}`
    : generateMcpCatalogDetailPageUrlFromGitHubDetails(githubOwner, githubRepo);
  return `[Trust Score](${badgeUrl})](${linkUrl})`;
};
