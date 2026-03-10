import Image from 'next/image';

import { ArchestraMcpApp } from '@mcpCatalog/types';

const PLATFORM_LABELS: Record<string, string> = {
  windows: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  web: 'Web',
};

const PRICING_STYLES: Record<string, string> = {
  free: 'bg-green-100 text-green-800 border-green-200',
  freemium: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-orange-100 text-orange-800 border-orange-200',
};

const PRICING_LABELS: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
};

type MpcFeatureKey = 'tools' | 'resources' | 'prompts' | 'sampling' | 'stdio_transport' | 'http_transport';

const MCP_FEATURE_ENTRIES: { key: MpcFeatureKey; label: string }[] = [
  { key: 'tools', label: 'Tools' },
  { key: 'resources', label: 'Resources' },
  { key: 'prompts', label: 'Prompts' },
  { key: 'sampling', label: 'Sampling' },
  { key: 'stdio_transport', label: 'STDIO' },
  { key: 'http_transport', label: 'HTTP' },
];

function FeaturePill({ active, label }: { active: boolean; label: string }) {
  const activeClass = 'bg-purple-50 text-purple-700 border-purple-200';
  const inactiveClass = 'bg-gray-50 text-gray-400 border-gray-200 line-through';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${active ? activeClass : inactiveClass}`}
    >
      {label}
    </span>
  );
}

export default function McpAppCard({ app }: { app: ArchestraMcpApp }) {
  const pricingClass = PRICING_STYLES[app.pricing] ?? PRICING_STYLES.free;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col p-5 gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          <Image
            src={app.logo_url}
            alt={`${app.display_name} logo`}
            width={48}
            height={48}
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 truncate">{app.display_name}</h3>
            {app.open_source && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Open Source
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-500">{app.category}</span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${pricingClass}`}
            >
              {PRICING_LABELS[app.pricing]}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{app.description}</p>

      {/* Supported Platforms */}
      <div className="flex flex-wrap gap-1">
        {app.supported_platforms.map((platform) => (
          <span
            key={platform}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
          >
            {PLATFORM_LABELS[platform] ?? platform}
          </span>
        ))}
      </div>

      {/* MCP Features */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">MCP Features</p>
        <div className="flex flex-wrap gap-1">
          {MCP_FEATURE_ENTRIES.map(({ key, label }) => (
            <FeaturePill key={key} active={app.mcp_features[key]} label={label} />
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-100">
        <a
          href={app.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          Website ↗
        </a>
        {app.mcp_docs_url && (
          <a
            href={app.mcp_docs_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            MCP Docs ↗
          </a>
        )}
        {app.github_url && (
          <a
            href={app.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors ml-auto"
          >
            GitHub ↗
          </a>
        )}
      </div>
    </div>
  );
}
