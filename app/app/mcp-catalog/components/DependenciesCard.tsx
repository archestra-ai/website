'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

import EvaluatedByModelInfo from './EvaluatedByModelInfo';

interface DependenciesCardProps {
  server: ArchestraMcpServerManifest;
}

export default function DependenciesCard({ server }: DependenciesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { dependencies } = server;

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
            <EvaluatedByModelInfo server={server} />
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
