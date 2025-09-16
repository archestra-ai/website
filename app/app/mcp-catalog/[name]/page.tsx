import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Footer from '@components/Footer';
import Header from '@components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import DependenciesCard from '@mcpCatalog/components/DependenciesCard';
import FrameworkCard from '@mcpCatalog/components/FrameworkCard';
import GitHubMetricsCard from '@mcpCatalog/components/GitHubMetricsCard';
import AddNewMCPServerButton from '@mcpCatalog/components/LinkButtons/AddNewMCPServerButton';
import EditThisServerButton from '@mcpCatalog/components/LinkButtons/EditThisServerButton';
import ReportAnIssueButton from '@mcpCatalog/components/LinkButtons/ReportAnIssueButton';
import McpClientConfigurationCard from '@mcpCatalog/components/McpClientConfigurationCard';
import McpProtocolSupportCard from '@mcpCatalog/components/McpProtocolSupportCard';
import QualityScoreCard from '@mcpCatalog/components/QualityScoreCard';
import ReadMeCard from '@mcpCatalog/components/ReadMeCard';
import ResourcesCard from '@mcpCatalog/components/ResourcesCard';
import ServerHeader from '@mcpCatalog/components/ServerHeader';
import TrustScoreBadge from '@mcpCatalog/components/TrustScoreBadge';
import TrustScoreBadgeMarkdown from '@mcpCatalog/components/TrustScoreBadgeMarkdown';
import { countServersInRepo, loadServers } from '@mcpCatalog/lib/catalog';
import { calculateQualityScore } from '@mcpCatalog/lib/quality-calculator';
import { generateMcpCatalogDetailPageUrl } from '@mcpCatalog/lib/urls';

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const servers = loadServers(name);
  const server = servers[0];

  if (!server) {
    return {
      title: 'MCP Server Not Found',
      description: 'The requested MCP server could not be found.',
    };
  }

  const {
    name: serverId,
    display_name: serverName,
    category,
    description,
    programming_language: programmingLanguage,
  } = server;

  const qualityScore = calculateQualityScore(server);
  const mcpCatalogDetailPageUrl = generateMcpCatalogDetailPageUrl(serverId);

  let keywords = ['MCP server', 'Model Context Protocol', serverName];
  if (category) {
    keywords.push(category);
  }

  if (programmingLanguage) {
    keywords.push(programmingLanguage);
  }

  return {
    title: `${serverName} MCP Server | Documentation & Integration`,
    description:
      description ||
      `${serverName} - Model Context Protocol server. Quality score: ${
        qualityScore.total
      }/100. ${category ? `Category: ${category}` : ''}`,
    keywords,
    openGraph: {
      title: `${serverName} MCP Server`,
      description: description || `${serverName} MCP server for AI agents`,
      url: mcpCatalogDetailPageUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${serverName} MCP Server`,
      description: description || `Quality score: ${qualityScore.total}/100`,
    },
    alternates: {
      canonical: mcpCatalogDetailPageUrl,
    },
  };
}

export default async function MCPDetailPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const searchParamsData = await searchParams;

  const servers = loadServers(name);
  const server = servers[0];

  if (!server) {
    notFound();
  }

  // Count servers in the same repo (optimized - only loads same repo servers)
  const serverCount = countServersInRepo(server);

  // Build back URL with preserved state
  const backUrl = (() => {
    const catalogParams = new URLSearchParams();
    const search = typeof searchParamsData.search === 'string' ? searchParamsData.search : undefined;
    const category = typeof searchParamsData.category === 'string' ? searchParamsData.category : undefined;
    const language = typeof searchParamsData.language === 'string' ? searchParamsData.language : undefined;
    const dependency = typeof searchParamsData.dependency === 'string' ? searchParamsData.dependency : undefined;
    const feature = typeof searchParamsData.feature === 'string' ? searchParamsData.feature : undefined;
    const serverType = typeof searchParamsData.serverType === 'string' ? searchParamsData.serverType : undefined;
    const scroll = typeof searchParamsData.scroll === 'string' ? searchParamsData.scroll : undefined;

    if (search) catalogParams.set('search', search);
    if (category) catalogParams.set('category', category);
    if (language) catalogParams.set('language', language);
    if (dependency) catalogParams.set('dependency', dependency);
    if (feature) catalogParams.set('feature', feature);
    if (serverType) catalogParams.set('serverType', serverType);
    if (scroll) catalogParams.set('scroll', scroll);

    return catalogParams.toString() ? `/mcp-catalog?${catalogParams.toString()}` : '/mcp-catalog';
  })();

  const {
    name: serverId,
    display_name: serverName,
    github_info: gitHubInfo,
    quality_score: qualityScore,
    server: serverConfig,
  } = server;
  const gitHubInfoOwner = gitHubInfo?.owner;
  const gitHubInfoRepo = gitHubInfo?.repo;
  const gitHubInfoPath = gitHubInfo?.path;
  // Calculate quality score without all servers (we'll update this client-side if needed)
  // For remote servers, always calculate the score since it's a fixed value
  const qualityScoreBreakdown =
    qualityScore !== null || serverConfig.type === 'remote' ? calculateQualityScore(server) : null;

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
          <Link href={backUrl} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ServerHeader server={server} />
              <QualityScoreCard server={server} scoreBreakdown={qualityScoreBreakdown} />

              {/* Remote Server Info Card */}
              {serverConfig.type === 'remote' && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Remote MCP Server</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800">
                      This is a remote MCP server that can be accessed directly via its endpoint URL. Remote servers are
                      hosted and maintained by their providers, offering direct integration without requiring local
                      installation or source code access.
                    </p>
                    <p className="text-blue-800 mt-2">
                      <strong>Endpoint:</strong>{' '}
                      <code className="bg-blue-100 px-2 py-1 rounded">{serverConfig.url}</code>
                    </p>
                  </CardContent>
                </Card>
              )}

              <GitHubMetricsCard server={server} serverCount={serverCount} />
              {/* Show configuration for all servers, but hide other sections for remote servers */}
              <McpClientConfigurationCard server={server} />
              {serverConfig.type === 'local' && (
                <>
                  <McpProtocolSupportCard server={server} />
                  <DependenciesCard server={server} />
                </>
              )}
              {/* ReadMeCard moved to bottom on mobile, stays here on desktop */}
              <div className="hidden lg:block">
                <ReadMeCard server={server} />
              </div>
            </div>

            <div className="lg:sticky lg:top-8 space-y-6">
              <ResourcesCard server={server} />

              <FrameworkCard server={server} />

              {gitHubInfo && (
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Quality Badge</CardTitle>
                    <CardDescription>Show your MCP trust score in your README</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <TrustScoreBadge gitHubInfo={gitHubInfo} />
                    </div>
                    <TrustScoreBadgeMarkdown serverId={serverId} gitHubInfo={gitHubInfo} variant="compact" />
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <EditThisServerButton serverId={serverId} fullWidth />
                <AddNewMCPServerButton color="grey" fullWidth />
                <ReportAnIssueButton
                  issueUrlParams={`title=Issue with ${encodeURIComponent(serverName)}&body=Server: ${
                    gitHubInfo
                      ? `${gitHubInfoOwner}/${gitHubInfoRepo}${gitHubInfoPath ? `/${gitHubInfoPath}` : ''}`
                      : serverConfig.type === 'remote'
                        ? serverConfig.url
                        : serverName
                  }%0AName: ${serverName}%0A%0APlease describe the issue:`}
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* ReadMeCard shown at bottom on mobile only */}
          <div className="lg:hidden mt-8">
            <ReadMeCard server={server} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
