'use client';

import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

import EvaluatedByModelInfo from './EvaluatedByModelInfo';
import ReportAnIssueButton from './LinkButtons/ReportAnIssueButton';

hljs.registerLanguage('json', json);

interface McpClientConfigurationCardProps {
  server: ArchestraMcpServerManifest;
}

const McpClientConfigurationCard = ({ server }: McpClientConfigurationCardProps) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const {
    display_name: serverName,
    github_info: { owner: gitHubInfoOwner, repo: gitHubInfoRepo, path: gitHubInfoPath },
  } = server;

  const clientConfigPermutations = server.archestra_config?.client_config_permutations;

  // Check if config exists and has actual server configurations
  const hasValidConfig =
    clientConfigPermutations?.mcpServers && Object.keys(clientConfigPermutations.mcpServers).length > 0;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const jsonString = hasValidConfig ? JSON.stringify(clientConfigPermutations, null, 2) : '';

  useEffect(() => {
    if (codeRef.current && jsonString) {
      hljs.highlightElement(codeRef.current);
    }
  }, [jsonString]);

  if (hasValidConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <span>Configuration example extracted from README.md for Claude Desktop and other clients.</span>
              <EvaluatedByModelInfo server={server} />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader>
        <CardTitle>Configuration Needed</CardTitle>
        <CardDescription>Help improve this catalog by contributing configuration information</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-4">We don't have configuration information for this MCP server yet.</p>
        <ReportAnIssueButton
          variant="suggest-configuration"
          issueUrlParams={`title=Add configuration for ${encodeURIComponent(
            serverName
          )}&body=Please add configForClients information for the MCP server: ${encodeURIComponent(
            serverName
          )}%0A%0AServer: ${gitHubInfoOwner}/${gitHubInfoRepo}${
            gitHubInfoPath ? `/${gitHubInfoPath}` : ''
          }%0AName: ${serverName}%0A%0APlease provide the JSON configuration needed to run this server.`}
        />
      </CardContent>
    </Card>
  );
};

export default McpClientConfigurationCard;
