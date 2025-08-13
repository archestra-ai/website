import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

import EvaluatedByModelInfo from './EvaluatedByModelInfo';

interface McpProtocolSupportCardProps {
  server: ArchestraMcpServerManifest;
}

const PROTOCOL_FEATURE_KEYS: { key: keyof ArchestraMcpServerManifest['protocol_features']; label: string }[] = [
  { key: 'implementing_tools', label: 'Tools' },
  { key: 'implementing_prompts', label: 'Prompts' },
  { key: 'implementing_resources', label: 'Resources' },
  { key: 'implementing_sampling', label: 'Sampling' },
  { key: 'implementing_roots', label: 'Roots' },
  { key: 'implementing_logging', label: 'Logging' },
  { key: 'implementing_stdio', label: 'STDIO Transport' },
  {
    key: 'implementing_streamable_http',
    label: 'HTTP Transport',
  },
  { key: 'implementing_oauth2', label: 'OAuth2 Auth' },
];

const McpProtocolSupportCard = ({ server }: McpProtocolSupportCardProps) => {
  const { protocol_features: protocolFeatures } = server;

  // If protocol features haven't been evaluated yet, show a message
  if (!protocolFeatures) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MCP Protocol Support</CardTitle>
          <CardDescription>Protocol features not yet evaluated</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">This server's protocol features are being evaluated.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Protocol Support</CardTitle>
        <CardDescription>
          <div className="flex items-center justify-between">
            <span>Implemented MCP protocol features</span>
            <EvaluatedByModelInfo server={server} />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {PROTOCOL_FEATURE_KEYS.map(({ key, label }) => (
            <div key={key} className="flex justify-between items-center">
              <span>{label}:</span>
              <span className={protocolFeatures[key] ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {protocolFeatures[key] === null ? '?' : protocolFeatures[key] ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default McpProtocolSupportCard;
