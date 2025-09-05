import { Metadata } from 'next';
import { Suspense } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';
import constants from '@constants';
import AddNewMCPServerButton from '@mcpCatalog/components/LinkButtons/AddNewMCPServerButton';
import ViewOnGitHubButton from '@mcpCatalog/components/LinkButtons/ViewOnGitHubButton';
import McpCatalogClient from '@mcpCatalog/components/McpCatalogClient';
import ScoringExplanationCard from '@mcpCatalog/components/ScoringExplanationCard';
import TrustScoreBadgeMarkdown from '@mcpCatalog/components/TrustScoreBadgeMarkdown';
import { countServersInRepo, loadServers } from '@mcpCatalog/lib/catalog';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

import ReportAnIssueButton from './components/LinkButtons/ReportAnIssueButton';
import RotatingServerDisplay from './components/RotatingServerDisplay';
import TrustScoreBadge from './components/TrustScoreBadge';

const {
  website: { keywords: websiteKeywords, urls: websiteUrls },
} = constants;

const TITLE = 'MCP Server Catalog | Browse 900+ Model Context Protocol Servers';
const DESCRIPTION =
  'Explore the comprehensive catalog of MCP servers. Find, evaluate, and integrate Model Context Protocol implementations for your AI agents.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['MCP servers', 'Model Context Protocol catalog', ...websiteKeywords],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: websiteUrls.mcpCatalog,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: websiteUrls.mcpCatalog,
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

// Count servers with Archestra mention in their README
function countServersWithArchestraBadge(servers: ArchestraMcpServerManifest[]): number {
  return servers.filter(server => 
    server.readme && server.readme.toLowerCase().includes('archestra.ai')
  ).length;
}

export default function MCPCatalogPage() {
  const mcpServers = loadServers();
  const categories = getCategories(mcpServers);
  const languages = getProgrammingLanguages(mcpServers);
  const dependencies = getTopDependencies(mcpServers);
  const mcpFeatures = getMCPFeatures();
  const serversWithBadge = countServersWithArchestraBadge(mcpServers);

  // Create a map of server counts for multi-server repos
  const serverCounts = new Map<string, number>();
  for (const server of mcpServers) {
    const { owner, repo } = server.github_info;
    const key = `${owner}/${repo}`;
    if (!serverCounts.has(key)) {
      serverCounts.set(key, countServersInRepo(server, mcpServers));
    }
  }

  // Find the highest scoring MCP server for the badge example
  const topScoredServer = mcpServers
    .filter(({ quality_score }) => quality_score !== null)
    .sort((a, b) => b.quality_score! - a.quality_score!)[0];

  const exampleBadgeServerId = 'your-github-org__your-repo-name';
  const exampleBadgeGitHubInfo = {
    owner: 'your-github-org',
    repo: 'your-repo-name',
    path: null,
    url: 'https://github.com/your-github-org/your-repo-name',
    name: 'your-repo-name',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative flex flex-col">
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
                  {mcpServers.length} MCP servers ranked by implementation quality.
                  <br/><br/>
                  1) <a href="https://github.com/archestra-ai/website/tree/main/app/app/mcp-catalog/data/mcp-evaluations" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Catalog data</a> and <a href="https://github.com/archestra-ai/website/blob/main/app/app/mcp-catalog/scripts/evaluate-catalog.ts" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">evaluation script</a> are open source.<br/>
                  2) Official servers equally compete with community servers.<br/>
                  3) Supported by <RotatingServerDisplay servers={mcpServers} />
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mt-6 sm:mt-10 mb-6 max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    {topScoredServer ? (
                      <a
                        href={`/mcp-catalog/${topScoredServer.name}`}
                        className="hover:opacity-80 transition-opacity flex-shrink-0"
                      >
                        <TrustScoreBadge gitHubInfo={topScoredServer?.github_info} />
                      </a>
                    ) : (
                      <TrustScoreBadge gitHubInfo={exampleBadgeGitHubInfo} />
                    )}
                    <span className="text-sm text-gray-600">← Add the badge to your README.md</span>
                  </div>

                  <div className="space-y-3">
                    <TrustScoreBadgeMarkdown
                      serverId={exampleBadgeServerId}
                      gitHubInfo={exampleBadgeGitHubInfo}
                      variant="large"
                    />
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  <AddNewMCPServerButton color="purple" bold />
                  <ReportAnIssueButton bold />
                  <ViewOnGitHubButton bold />
                </div>
              </div>

              <ScoringExplanationCard />
            </div>
          </div>

          <Suspense fallback={<div>Loading catalog...</div>}>
            <McpCatalogClient
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
