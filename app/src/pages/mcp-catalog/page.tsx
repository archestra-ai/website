import { Metadata } from 'next';
import { Suspense } from 'react';

import { ArchestraMcpServerManifest } from '@archestra/types';
import Footer from '@components/Footer';
import Header from '@components/Header';
import BadgeCopyMain from '@components/McpServer/BadgeCopyMain';
import MCPCatalogClient from '@components/McpServer/MCPCatalogClient';
import ScoringExplanationCard from '@components/McpServer/ScoringExplanationCard';
import { countServersInRepo, loadServers } from '@utils/catalog';

export const metadata: Metadata = {
  title: 'MCP Server Catalog | Browse 900+ Model Context Protocol Servers',
  description:
    'Explore the comprehensive catalog of MCP servers. Find, evaluate, and integrate Model Context Protocol implementations for your AI agents.',
  keywords: [
    'MCP servers',
    'Model Context Protocol catalog',
    'AI tools',
    'MCP implementations',
    'AI agent tools',
    'MCP directory',
  ],
  openGraph: {
    title: 'MCP Server Catalog | 900+ Model Context Protocol Servers',
    description:
      'Browse and discover MCP servers for your AI agents. Comprehensive catalog with quality scores and implementation details.',
    url: 'https://archestra.ai/mcp-catalog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCP Server Catalog | 900+ Servers',
    description: 'Browse and discover Model Context Protocol servers for AI agents',
  },
  alternates: {
    canonical: 'https://archestra.ai/mcp-catalog',
  },
};

// Get unique categories from evaluations, sorted by count
function getCategories(evaluations: ArchestraMcpServerManifest[]): string[] {
  const categoryCounts = new Map<string, number>();
  let uncategorizedCount = 0;

  // Count items per category
  for (const evaluation of evaluations) {
    if (evaluation.category) {
      categoryCounts.set(evaluation.category, (categoryCounts.get(evaluation.category) || 0) + 1);
    } else {
      uncategorizedCount++;
    }
  }

  // Sort categories by count (descending) and then alphabetically
  const sortedCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]; // Sort by count descending
      }
      return a[0].localeCompare(b[0]); // Then alphabetically
    })
    .map(([category]) => category);

  const result = ['All', ...sortedCategories];

  // Add Uncategorized at the end if there are any servers without a category
  if (uncategorizedCount > 0) {
    result.push('Uncategorized');
  }

  return result;
}

// Get unique programming languages from evaluations, sorted by count
function getProgrammingLanguages(evaluations: ArchestraMcpServerManifest[]): string[] {
  const languageCounts = new Map<string, number>();

  // Count items per language
  for (const evaluation of evaluations) {
    if (evaluation.programming_language && evaluation.programming_language !== 'Unknown') {
      languageCounts.set(
        evaluation.programming_language,
        (languageCounts.get(evaluation.programming_language) || 0) + 1
      );
    }
  }

  // Sort languages by count (descending) and then alphabetically
  const sortedLanguages = Array.from(languageCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]; // Sort by count descending
      }
      return a[0].localeCompare(b[0]); // Then alphabetically
    })
    .map(([language]) => language);

  return ['All', ...sortedLanguages];
}

// Get top MCP-related dependencies from evaluations (importance >= 8)
function getTopDependencies(evaluations: ArchestraMcpServerManifest[]): string[] {
  const dependencyCounts = new Map<string, { count: number; totalImportance: number }>();

  // Count dependencies and their importance (only MCP-related)
  for (const evaluation of evaluations) {
    if (evaluation.dependencies) {
      for (const dep of evaluation.dependencies) {
        // Only include dependencies with "mcp" or "modelcontextprotocol" in the name
        const depNameLower = dep.name.toLowerCase();
        if (dep.importance >= 8 && (depNameLower.includes('mcp') || depNameLower.includes('modelcontextprotocol'))) {
          const existing = dependencyCounts.get(dep.name) || {
            count: 0,
            totalImportance: 0,
          };
          dependencyCounts.set(dep.name, {
            count: existing.count + 1,
            totalImportance: existing.totalImportance + dep.importance,
          });
        }
      }
    }
  }

  // Sort by count (descending), then by average importance
  const sortedDependencies = Array.from(dependencyCounts.entries())
    .sort((a, b) => {
      if (b[1].count !== a[1].count) {
        return b[1].count - a[1].count; // Sort by count descending
      }
      // If count is same, sort by average importance
      const avgA = a[1].totalImportance / a[1].count;
      const avgB = b[1].totalImportance / b[1].count;
      return avgB - avgA;
    })
    .slice(0, 15) // Take top 15
    .map(([dependency]) => dependency);

  return ['All', ...sortedDependencies];
}

// Get MCP features that servers implement
function getMCPFeatures(): string[] {
  return [
    'All',
    'Tools',
    'Resources',
    'Prompts',
    'Sampling',
    'Roots',
    'Logging',
    'STDIO Transport',
    'Streamable HTTP',
    'OAuth2',
  ];
}

export default function MCPCatalogPage() {
  const mcpServers = loadServers();
  const categories = getCategories(mcpServers);
  const languages = getProgrammingLanguages(mcpServers);
  const dependencies = getTopDependencies(mcpServers);
  const mcpFeatures = getMCPFeatures();

  // Create a map of server counts for multi-server repos
  const serverCounts = new Map<string, number>();
  for (const server of mcpServers) {
    const key = `${server.github_info.owner}/${server.github_info.repo}`;
    if (!serverCounts.has(key)) {
      serverCounts.set(key, countServersInRepo(server, mcpServers));
    }
  }

  // Find the highest scoring MCP server for the badge example
  const topScoredServer = mcpServers
    .filter((server) => server.quality_score !== null)
    .sort((a, b) => b.quality_score! - a.quality_score!)[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="mb-12 relative">
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-start">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                    MCP Catalog <span className="text-2xl sm:text-3xl lg:text-4xl text-gray-600">& Trust Score</span>
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    Beta
                  </span>
                </div>
                <p className="text-base sm:text-lg text-gray-600 mb-6">
                  What if we scraped all {mcpServers.length} MCP servers from GitHub, extracted data about dependencies,
                  protocol features, and community maturity, then calculated a trustworthiness score? Well, we did
                  exactly that—helping you navigate the <b>agentic supply chain</b> with confidence.
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mt-6 sm:mt-10 mb-6 max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    {topScoredServer ? (
                      <a
                        href={`/mcp-catalog/${topScoredServer.name}`}
                        className="hover:opacity-80 transition-opacity flex-shrink-0"
                      >
                        <img
                          src={
                            topScoredServer.github_info.path
                              ? `/mcp-catalog/api/badge/quality/${topScoredServer.github_info.owner}/${
                                  topScoredServer.github_info.repo
                                }/${topScoredServer.github_info.path.replace(/\//g, '--')}`
                              : `/mcp-catalog/api/badge/quality/${topScoredServer.github_info.owner}/${topScoredServer.github_info.repo}`
                          }
                          alt="Trust Score Badge"
                          className="h-5"
                        />
                      </a>
                    ) : (
                      <img
                        src="/mcp-catalog/api/badge/quality/YOUR-GITHUB-ORG/YOUR-REPO-NAME"
                        alt="Trust Score Badge"
                        className="h-5 flex-shrink-0"
                      />
                    )}
                    <span className="text-sm text-gray-600">← Add the badge to your README.md</span>
                  </div>

                  <BadgeCopyMain />
                </div>

                {/* Action Buttons */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  {/* Add New MCP Server Button */}
                  <a
                    href="https://github.com/archestra-ai/website/edit/main/app/app/mcp-catalog/data/mcp-servers.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New MCP Server
                  </a>

                  {/* Report Issue Button */}
                  <a
                    href="https://github.com/archestra-ai/website/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Report an Issue
                  </a>

                  {/* GitHub Repo Button */}
                  <a
                    href="https://github.com/archestra-ai/website/tree/main/app/app/mcp-catalog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>

              {/* Scoring Card - Now responsive and collapsible on mobile */}
              <ScoringExplanationCard />
            </div>
          </div>

          <Suspense fallback={<div>Loading catalog...</div>}>
            <MCPCatalogClient
              mcpServers={mcpServers}
              categories={categories}
              languages={languages}
              dependencies={dependencies}
              mcpFeatures={mcpFeatures}
              serverCounts={serverCounts}
            />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
