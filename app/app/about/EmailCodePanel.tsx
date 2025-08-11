'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@components/ui/button';

export default function EmailCodePanel({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email: ', err);
    }
  };

  return (
    <div className="relative mt-3">
      <div className="bg-gray-50 rounded-md p-2 pr-10 font-mono text-xs">
        <code>{email}</code>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-1.5 right-1.5 h-6 w-6 p-0 bg-white hover:bg-gray-50"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}