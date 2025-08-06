'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@components/ui/button';
import { generateBadgeMarkdown, generateBadgeRelativeUrl } from '@utils/trustScoreBadge';

interface TrustScoreBadgeProps {
  githubOwner?: string;
  githubRepo?: string;
  githubPath?: string | null;
  serverName?: string;
}

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
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border pr-12">
          <code>{badgeMarkdown}</code>
        </pre>
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
