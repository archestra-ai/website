'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@components/ui/button';

import { generateBadgeMarkdown, generateBadgeRelativeUrl } from './utils';

interface TrustScoreBadgeProps {
  variant: 'large' | 'compact';
  githubOwner?: string;
  githubRepo?: string;
  githubPath?: string | null;
  serverName?: string;
}

const DEFAULT_BADGE_MARKDOWN = generateBadgeMarkdown('your-github-org', 'your-repo-name');

export default function TrustScoreBadge({
  githubOwner,
  githubRepo,
  githubPath,
  serverName,
  variant,
}: TrustScoreBadgeProps) {
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

  const MarkdownArea = ({ children }: React.PropsWithChildren) => {
    if (variant === 'large') {
      return <div className="bg-gray-50 rounded-md p-3 pr-12 font-mono text-sm">{children}</div>;
    } else {
      return <pre className="bg-white p-3 rounded text-xs overflow-x-auto border pr-12">{children}</pre>;
    }
  };

  return (
    <div className="space-y-3">
      {badgeRelativeUrl && <img src={badgeRelativeUrl} alt="Trust Score Badge" className="mb-4" />}
      <div className="relative">
        <MarkdownArea>
          <code>{badgeMarkdown}</code>
        </MarkdownArea>
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
