'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { generateUrlToEditIndividualMcpCatalogJsonFile } from '@constants';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

interface DependenciesCardProps {
  server: ArchestraMcpServerManifest;
}

export default function DependenciesCard({ server }: DependenciesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { name: serverName, dependencies, evaluation_model: evaluationModel } = server;

  // Group dependencies by importance level
  const mainDeps = dependencies?.filter((d) => d.importance >= 8) || [];
  const mediumDeps = dependencies?.filter((d) => d.importance >= 5 && d.importance < 8) || [];
  const lightDeps = dependencies?.filter((d) => d.importance < 5) || [];
  const totalDeps = (dependencies || []).length;

  const DependenciesContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Dependencies */}
      {mainDeps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Main</h4>
          <div className="space-y-2">
            {mainDeps
              .sort((a, b) => b.importance - a.importance)
              .map((dep, index) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md overflow-hidden"
                  title={`${dep.name} - Importance: ${dep.importance}/10`}
                >
                  <div className="truncate">{dep.name}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Medium Dependencies */}
      {mediumDeps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Medium</h4>
          <div className="space-y-2">
            {mediumDeps
              .sort((a, b) => b.importance - a.importance)
              .map((dep, index) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-sm overflow-hidden"
                  title={`${dep.name} - Importance: ${dep.importance}/10`}
                >
                  <div className="truncate">{dep.name}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Light Dependencies */}
      {lightDeps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Light</h4>
          <div className="space-y-2">
            {lightDeps
              .sort((a, b) => b.importance - a.importance)
              .map((dep, index) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 shadow-sm overflow-hidden"
                  title={`${dep.name} - Importance: ${dep.importance}/10`}
                >
                  <div className="truncate">{dep.name}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="cursor-pointer md:cursor-default" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle>Dependencies</CardTitle>
          {/* Mobile toggle chevron */}
          <div className="md:hidden flex items-center gap-2">
            {totalDeps > 0 && (
              <span className="text-sm text-gray-500">
                {totalDeps} {totalDeps === 1 ? 'dependency' : 'dependencies'}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
        <CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Libraries and frameworks used by this MCP server</span>
            {dependencies && evaluationModel !== undefined && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">
                  {evaluationModel === null ? '✨ Human curated' : `🤖 Analyzed by ${evaluationModel}`}
                </span>
                <a
                  href={generateUrlToEditIndividualMcpCatalogJsonFile(serverName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  title="Fix dependencies"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Fix
                </a>
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className={!isExpanded ? 'hidden md:block' : ''}>
        {dependencies && dependencies.length > 0 ? (
          <DependenciesContent />
        ) : (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Evaluating dependencies...</p>
              <p className="text-gray-400 text-xs mt-2">Check back soon for dependency information</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
