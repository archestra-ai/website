'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@components/ui/button';

export default function BadgeCopyMain() {
  const [copied, setCopied] = useState(false);

  const badgeMarkdown = `[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/YOUR-GITHUB-ORG/YOUR-REPO-NAME)](https://archestra.ai/mcp-catalog/your-github-org__your-repo-name)`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="bg-gray-50 rounded-md p-3 pr-12 font-mono text-sm">
          <code className="text-gray-800">{badgeMarkdown}</code>
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
