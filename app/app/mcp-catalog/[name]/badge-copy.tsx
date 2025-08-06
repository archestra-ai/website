"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Copy, Check } from "lucide-react";

interface BadgeCopyProps {
  badgeMarkdown: string;
  badgeUrl: string;
}

export default function BadgeCopy({ badgeMarkdown, badgeUrl }: BadgeCopyProps) {
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

  return (
    <>
      <img 
        src={badgeUrl}
        alt="Trust Score Badge" 
        className="mb-4"
      />
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
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </>
  );
}