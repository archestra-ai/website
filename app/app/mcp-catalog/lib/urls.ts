import constants from '@constants';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

const {
  website: {
    urls: { mcpCatalog: mcpCatalogUrl },
  },
  github: {
    archestra: {
      website: { repoUrl, mainBranchName, mcpCatalogDirectoryPath },
    },
  },
} = constants;

export const generateMcpCatalogDetailPageUrl = (serverId: string) => `${mcpCatalogUrl}/${serverId}`;

export const generateUrlToIndividualMcpCatalogJsonFile = (serverId: string, edit: boolean) =>
  `${repoUrl}/${edit ? 'edit' : 'tree'}/${mainBranchName}/${mcpCatalogDirectoryPath}/mcp-evaluations/${serverId}.json`;

export const getUrlToLatestGitHubCommit = (server: ArchestraMcpServerManifest) => {
  if (!server.github_info) return '#';
  const { owner, repo, latest_commit_hash } = server.github_info;
  return `https://github.com/${owner}/${repo}/commit/${latest_commit_hash}`;
};
