"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Copy, Check } from "lucide-react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("json", json);

interface ConfigSectionProps {
  config: any;
}

export default function ConfigSection({ config }: ConfigSectionProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const jsonString = JSON.stringify(config, null, 2);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [jsonString]);

  return (
    <div className="relative">
      <pre className="bg-gray-50 border rounded-lg p-4 text-sm pr-12 overflow-x-auto">
        <code ref={codeRef} className="language-json hljs" style={{ background: 'transparent' }}>
          {jsonString}
        </code>
      </pre>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 h-7 w-7 p-0 bg-white hover:bg-gray-50"
        onClick={() => copyToClipboard(jsonString)}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}