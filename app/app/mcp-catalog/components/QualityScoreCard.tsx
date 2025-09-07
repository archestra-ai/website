'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import constants from '@constants';
import { QualityBar } from '@mcpCatalog/components/QualityBar';
import { ArchestraMcpServerManifest, ArchestraScoreBreakdown } from '@mcpCatalog/types';

import EvaluatedByModelInfo from './EvaluatedByModelInfo';

const {
  company: { name: companyName },
} = constants;

interface QualityScoreCardProps {
  server: ArchestraMcpServerManifest;
  scoreBreakdown: ArchestraScoreBreakdown | null;
}

export default function QualityScoreCard({ server, scoreBreakdown }: QualityScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { quality_score: qualityScore, protocol_features: protocolFeatures, dependencies, remote_url: remoteUrl, github_info: githubInfo } = server;
  const isRemoteServer = remoteUrl && !githubInfo;

  const getScoreDescription = (score: number, maxScore: number, category: string) => {
    const percentage = (score / maxScore) * 100;
    if (category === 'GitHub community health') {
      if (percentage === 100) return `Strong GitHub community (${score}/${maxScore})`;
      if (percentage >= 75) return `GitHub community is developing well (${score}/${maxScore})`;
      if (percentage >= 50) return `GitHub community is not mature yet (${score}/${maxScore})`;
      if (percentage >= 25) return `Limited GitHub community activity (${score}/${maxScore})`;
      return `Room for improvement in GitHub community`;
    }
    if (category === 'documentation quality') {
      return `Documentation (${score}/${maxScore})`;
    }
    if (category === 'dependency optimization') {
      // Check if dependencies have been evaluated
      if (!dependencies) {
        return `Dependencies not yet evaluated (${score}/${maxScore})`;
      }
      if (percentage === 100) return `Optimal dependency management (${score}/${maxScore})`;
      if (percentage >= 75) return `Good dependency choices (${score}/${maxScore})`;
      if (percentage >= 50) return `Moderate dependency usage (${score}/${maxScore})`;
      if (percentage >= 25) return `Heavy dependency usage (${score}/${maxScore})`;
      return `Too many or rare dependencies (${score}/${maxScore})`;
    }
    if (category === 'badge adoption') {
      if (percentage > 0) return `${companyName} MCP Trust badge (${score}/${maxScore})`;
      return `${companyName} MCP Trust score badge is missing`;
    }
    if (category === 'MCP protocol implementation') {
      // Check if protocol features have been evaluated
      if (!protocolFeatures || protocolFeatures.implementing_tools === null) {
        return `Protocol features not yet evaluated (${score}/${maxScore})`;
      }
      if (percentage === 100) return `Full MCP protocol implementation (${score}/${maxScore})`;
      if (percentage >= 75) return `Most MCP protocol features implemented (${score}/${maxScore})`;
      if (percentage >= 50) return `Core MCP protocol features implemented (${score}/${maxScore})`;
      if (percentage >= 25) return `Basic MCP protocol features implemented (${score}/${maxScore})`;
      return `Limited MCP protocol implementation (${score}/${maxScore})`;
    }
    if (percentage === 100) return `Full ${category.toLowerCase()} (${score}/${maxScore})`;
    if (percentage >= 75) return `Strong ${category.toLowerCase()} (${score}/${maxScore})`;
    if (percentage >= 50) return `Moderate ${category.toLowerCase()} (${score}/${maxScore})`;
    if (percentage >= 25) return `Basic ${category.toLowerCase()} (${score}/${maxScore})`;
    return `Room for improvement in ${category.toLowerCase()}`;
  };

  if (!scoreBreakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MCP Trust Score</CardTitle>
          <CardDescription>This server is being evaluated</CardDescription>
        </CardHeader>
        <CardContent>
          <QualityBar score={null} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Trust Score</CardTitle>
        <CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              {isRemoteServer 
                ? 'Remote server evaluation'
                : qualityScore !== null
                ? 'Based on our comprehensive evaluation criteria'
                : 'This server is being evaluated'}
            </span>
            {!isRemoteServer && <EvaluatedByModelInfo server={server} />}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QualityBar score={qualityScore} />

        {qualityScore !== null && (
          <>
            {isRemoteServer ? (
              // Remote server explanation
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Remote servers are difficult to evaluate automatically as we cannot analyze their source code 
                  or implementation details. However, these are typically production-ready services from established 
                  providers, so we assign them a high trust score of 80/100.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: Collapsible Details */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="mt-4 w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">Score Details</span>
                    {showDetails ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>

                  {showDetails && (
                    <div className="mt-3 text-sm text-gray-600">
                      <ul className="space-y-1">
                        <li>• {getScoreDescription(scoreBreakdown.mcp_protocol, 40, 'MCP protocol implementation')}</li>
                        <li>• {getScoreDescription(scoreBreakdown.github_metrics, 20, 'GitHub community health')}</li>
                        <li>• {getScoreDescription(scoreBreakdown.dependencies, 20, 'dependency optimization')}</li>
                        <li>• {getScoreDescription(scoreBreakdown.deployment_maturity, 10, 'deployment maturity')}</li>
                        <li>• {getScoreDescription(scoreBreakdown.documentation, 8, 'documentation quality')}</li>
                        <li>• {getScoreDescription(scoreBreakdown.badge_usage, 2, 'badge adoption')}</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Desktop: Always Show Details */}
                <div className="hidden sm:block mt-4 text-sm text-gray-600">
                  <ul className="space-y-1">
                    <li>• {getScoreDescription(scoreBreakdown.mcp_protocol, 40, 'MCP protocol implementation')}</li>
                    <li>• {getScoreDescription(scoreBreakdown.github_metrics, 20, 'GitHub community health')}</li>
                    <li>• {getScoreDescription(scoreBreakdown.dependencies, 20, 'dependency optimization')}</li>
                    <li>• {getScoreDescription(scoreBreakdown.deployment_maturity, 10, 'deployment maturity')}</li>
                    <li>• {getScoreDescription(scoreBreakdown.documentation, 8, 'documentation quality')}</li>
                    <li>• {getScoreDescription(scoreBreakdown.badge_usage, 2, 'badge adoption')}</li>
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
