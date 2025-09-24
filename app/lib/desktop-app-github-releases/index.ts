import constants from '@constants';
import { type PlatformInfo, matchAssetToPattern } from '@lib/platform-detector';

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
}

const {
  github: {
    archestra: {
      orgName: githubOrgName,
      archestra: { repoName: desktopAppRepoName },
    },
  },
} = constants;

const GITHUB_API_URL = `https://api.github.com/repos/${githubOrgName}/${desktopAppRepoName}/releases/latest`;

export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const release: GitHubRelease = await response.json();
    return release;
  } catch (error) {
    console.error('Error fetching latest release:', error);
    return null;
  }
}

export function findMatchingAsset(release: GitHubRelease, platformInfo: PlatformInfo): GitHubAsset | null {
  if (!release.assets || release.assets.length === 0) {
    return null;
  }

  // Try to find a matching asset based on platform patterns
  for (const asset of release.assets) {
    if (matchAssetToPattern(asset.name, platformInfo.filePatterns)) {
      return asset;
    }
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
