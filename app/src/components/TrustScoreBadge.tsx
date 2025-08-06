'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@components/ui/button';
import constants, { generateMcpCatalogDetailPageUrlFromGitHubDetails } from '@constants';

interface TrustScoreBadgeProps {
  githubOwner?: string;
  githubRepo?: string;
  githubPath?: string | null;
  serverName?: string;
}

const BADGE_URL_BASE_PATH = '/mcp-catalog/api/badge/quality';

const _determineGitHubUrlPathSuffix = (githubOwner: string, githubRepo: string, githubPath?: string | null) =>
  githubPath ? `${githubOwner}/${githubRepo}/${githubPath.replace(/\//g, '--')}` : `${githubOwner}/${githubRepo}`;

const generateBadgeRelativeUrl = (githubOwner: string, githubRepo: string, githubPath?: string | null) =>
  `${BADGE_URL_BASE_PATH}/${_determineGitHubUrlPathSuffix(githubOwner, githubRepo, githubPath)}`;

const generateBadgeMarkdown = (
  githubOwner: string,
  githubRepo: string,
  githubPath?: string | null,
  serverName?: string
) => {
  const badgeUrl = `${constants.website.urls.mcpCatalog}${generateBadgeRelativeUrl(githubOwner, githubRepo, githubPath)}`;
  const linkUrl = serverName
    ? `${constants.website.urls.mcpCatalog}/${serverName}`
    : generateMcpCatalogDetailPageUrlFromGitHubDetails(githubOwner, githubRepo);
  return `[![Trust Score](${badgeUrl})](${linkUrl})`;
};

const DEFAULT_BADGE_MARKDOWN = generateBadgeMarkdown('YOUR-GITHUB-ORG', 'YOUR-REPO-NAME');

export default function TrustScoreBadge({ githubOwner, githubRepo, githubPath, serverName }: TrustScoreBadgeProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const badgeRelativeUrl =
    githubOwner && githubRepo ? generateBadgeRelativeUrl(githubOwner, githubRepo, githubPath) : undefined;
  const badgeMarkdown =
    githubOwner && githubRepo && serverName
      ? generateBadgeMarkdown(githubOwner, githubRepo, githubPath, serverName)
      : DEFAULT_BADGE_MARKDOWN;

  return (
    <div className="space-y-3">
      {badgeRelativeUrl && <img src={badgeRelativeUrl} alt="Trust Score Badge" className="mb-4" />}
      <div className="relative">
        <div className={badgeRelativeUrl ? 'bg-white rounded p-3 pr-12 border' : 'bg-gray-50 rounded-md p-3 pr-12'}>
          <code className={badgeRelativeUrl ? 'text-xs' : 'font-mono text-sm text-gray-800'}>{badgeMarkdown}</code>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 h-7 w-7 p-0 bg-white hover:bg-gray-50"
          onClick={() => copyToClipboard(badgeMarkdown)}
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}
