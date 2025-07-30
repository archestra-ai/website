import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { MCPServer, getMCPServerName, getMCPServerGitHubUrl } from "../../../data/types";
import { loadServers } from "../../../lib/server-utils";
import { calculateQualityScore } from "../../../lib/quality-calculator";
import { QualityBar } from "../../../components/quality-bar";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import BadgeCopy from "./badge-copy";
import Header from "../../../components/header";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github.css";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MCPDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsData = await searchParams;
  
  const servers = loadServers(slug);
  const server = servers[0];
  
  if (!server) {
    notFound();
  }

  // Build back URL with preserved state
  const backUrl = (() => {
    const catalogParams = new URLSearchParams();
    const search = typeof searchParamsData.search === 'string' ? searchParamsData.search : undefined;
    const category = typeof searchParamsData.category === 'string' ? searchParamsData.category : undefined;
    const language = typeof searchParamsData.language === 'string' ? searchParamsData.language : undefined;
    const scroll = typeof searchParamsData.scroll === 'string' ? searchParamsData.scroll : undefined;
    
    if (search) catalogParams.set('search', search);
    if (category) catalogParams.set('category', category);
    if (language) catalogParams.set('language', language);
    if (scroll) catalogParams.set('scroll', scroll);
    
    return catalogParams.toString() ? `/mcp-catalog?${catalogParams.toString()}` : '/mcp-catalog';
  })();

  const serverName = getMCPServerName(server);
  const githubUrl = getMCPServerGitHubUrl(server);

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
              "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10 px-4 md:px-6 py-16">
          {/* Back Button */}
          <Link href={backUrl} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{serverName}</h1>
                    <div className="text-sm text-gray-500 mb-4 font-mono" style={{overflowWrap: 'break-word', wordBreak: 'keep-all'}}>
                      <span>{server.gitHubOrg}/{server.gitHubRepo}</span>
                      {server.repositoryPath && (
                        <>
                          <span>/</span>
                          <span className="text-blue-600">{server.repositoryPath}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Commit Hash and Last Scraped */}
                    <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
                      {server.gh_latest_commit_hash && (
                        <div className="flex items-center gap-1">
                          <span>🔗 Latest commit:</span>
                          <a 
                            href={`${githubUrl}/commit/${server.gh_latest_commit_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:underline"
                            title={server.gh_latest_commit_hash}
                          >
                            {server.gh_latest_commit_hash.substring(0, 7)}
                          </a>
                        </div>
                      )}
                      {server.last_scraped_at && (
                        <div className="flex items-center gap-1">
                          <span>🕒 Updated:</span>
                          <span className="font-mono">
                            {new Date(server.last_scraped_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {server.programmingLanguage}
                    </Badge>
                    <Badge variant="outline">
                      {server.category || 'Uncategorized'}
                    </Badge>
                  </div>
                </div>
                <p className="text-lg text-gray-600">{server.description}</p>
              </div>

              {/* Quality Score */}
              <Card>
                <CardHeader>
                  <CardTitle>MCP Quality Score</CardTitle>
                  <CardDescription>
                    {server.qualityScore !== null 
                      ? "Based on our comprehensive evaluation criteria" 
                      : "This server is being evaluated"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QualityBar score={server.qualityScore} />
                  
                  {server.qualityScore !== null && (() => {
                    const scoreBreakdown = calculateQualityScore(server, server.readme);
                    
                    const getScoreDescription = (score: number, maxScore: number, category: string) => {
                      const percentage = (score / maxScore) * 100;
                      if (category === "GitHub community health") {
                        if (percentage === 100) return `Strong GitHub community (${score}/${maxScore})`;
                        if (percentage >= 75) return `GitHub community is developing well (${score}/${maxScore})`;
                        if (percentage >= 50) return `GitHub community is not mature yet (${score}/${maxScore})`;
                        if (percentage >= 25) return `Limited GitHub community activity (${score}/${maxScore})`;
                        return `Room for improvement in GitHub community`;
                      }
                      if (category === "documentation quality") {
                        return `Documentation (${score}/${maxScore})`;
                      }
                      if (category === "badge adoption") {
                        if (percentage > 0) return `Archestra MCP Quality badge (${score}/${maxScore})`;
                        return `Archestra MCP Quality score badge is missing`;
                      }
                      if (percentage === 100) return `Full ${category.toLowerCase()} (${score}/${maxScore})`;
                      if (percentage >= 75) return `Strong ${category.toLowerCase()} (${score}/${maxScore})`;
                      if (percentage >= 50) return `Moderate ${category.toLowerCase()} (${score}/${maxScore})`;
                      if (percentage >= 25) return `Basic ${category.toLowerCase()} (${score}/${maxScore})`;
                      return `Room for improvement in ${category.toLowerCase()}`;
                    };
                    
                    return (
                      <div className="mt-4 text-sm text-gray-600">
                        <ul className="space-y-1">
                          <li>• {getScoreDescription(scoreBreakdown.mcpProtocol, 60, "MCP protocol implementation")}</li>
                          <li>• {getScoreDescription(scoreBreakdown.githubMetrics, 20, "GitHub community health")}</li>
                          <li>• {getScoreDescription(scoreBreakdown.deploymentMaturity, 10, "deployment maturity")}</li>
                          <li>• {getScoreDescription(scoreBreakdown.documentation, 8, "documentation quality")}</li>
                          <li>• {getScoreDescription(scoreBreakdown.badgeUsage, 2, "badge adoption")}</li>
                        </ul>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Configuration */}
              {server.configToRun ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>Configuration example extracted from README.md for Claude Desktop and other clients.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(server.configToRun, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardHeader>
                    <CardTitle>Configuration Needed</CardTitle>
                    <CardDescription>Help improve this catalog by contributing configuration information</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">
                      We don't have configuration information for this MCP server yet.
                    </p>
                    <a
                      href={`https://github.com/archestra-ai/website/issues/new?title=Add configuration for ${encodeURIComponent(serverName)}&body=Please add configToRun information for the MCP server: ${encodeURIComponent(serverName)}%0A%0AServer: ${server.gitHubOrg}/${server.gitHubRepo}${server.repositoryPath ? `/${server.repositoryPath}` : ''}%0ASlug: ${server.slug}%0A%0APlease provide the JSON configuration needed to run this server.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Suggest Configuration
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* GitHub Metrics */}
              {server.qualityScore !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>GitHub Metrics</CardTitle>
                    <CardDescription>Repository statistics and activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>⭐ GitHub Stars:</span>
                        <span className="font-mono">{server.gh_stars}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>👥 Contributors:</span>
                        <span className="font-mono">{server.gh_contributors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📋 Total Issues:</span>
                        <span className="font-mono">{server.gh_issues}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📦 Has Releases:</span>
                        <span className={server.gh_releases ? "text-green-600" : "text-gray-400"}>
                          {server.gh_releases ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔧 Has CI/CD Pipeline:</span>
                        <span className={server.gh_ci_cd ? "text-green-600" : "text-gray-400"}>
                          {server.gh_ci_cd ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* MCP Protocol Features */}
              {server.qualityScore !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>MCP Protocol Support</CardTitle>
                    <CardDescription>Implemented MCP protocol features, TBD.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { key: 'implementing_tools', label: 'Tools' },
                        { key: 'implementing_prompts', label: 'Prompts' },
                        { key: 'implementing_resources', label: 'Resources' },
                        { key: 'implementing_sampling', label: 'Sampling' },
                        { key: 'implementing_roots', label: 'Roots' },
                        { key: 'implementing_logging', label: 'Logging' },
                        { key: 'implementing_stdio', label: 'STDIO Transport' },
                        { key: 'implementing_streamable_http', label: 'HTTP Transport' },
                        { key: 'implementing_oauth2', label: 'OAuth2 Auth' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex justify-between items-center">
                          <span>{label}:</span>
                          <span className={server[key as keyof MCPServer] ? "text-green-600 font-medium" : "text-gray-400"}>
                            {server[key as keyof MCPServer] ? "?" : "?"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* README Content */}
              {server.readme && (
                <Card>
                  <CardHeader>
                    <CardTitle>README.md</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="github-markdown">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3" {...props} />
                          ),
                          h4: ({ node, ...props }) => (
                            <h4 className="text-base font-semibold text-gray-900 mt-4 mb-2" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="text-gray-700 leading-relaxed mb-4" {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a className="text-blue-600 hover:underline" {...props} />
                          ),
                          code: ({ node, inline, ...props }) => 
                            inline ? (
                              <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                            ) : (
                              <code {...props} />
                            ),
                          pre: ({ node, ...props }) => (
                            <pre className="bg-gray-50 border rounded-lg p-4 overflow-x-auto text-sm mb-4" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 text-gray-600 italic my-4" {...props} />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-6">
                              <table className="w-full border-collapse border border-gray-300 text-sm" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="bg-gray-50 font-semibold text-left px-3 py-2 border border-gray-300" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-3 py-2 border border-gray-300 align-top" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-gray-700" {...props} />
                          ),
                          img: ({ node, ...props }) => (
                            <img className="max-w-full h-auto rounded-lg shadow-sm my-4" {...props} />
                          ),
                          hr: ({ node, ...props }) => (
                            <hr className="border-gray-300 my-8" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-semibold text-gray-900" {...props} />
                          ),
                        }}
                      >
                        {server.readme}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium">GitHub Repository</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                </CardContent>
              </Card>


              {/* Framework Badge */}
              {server.framework && (
                <Card>
                  <CardHeader>
                    <CardTitle>Framework</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-sm">
                      {server.framework}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Badge */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Add Quality Badge</CardTitle>
                  <CardDescription>Show your MCP quality score in your README</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Create badge URL that includes the path if it exists
                    const badgeUrl = server.repositoryPath 
                      ? `/api/badge/quality/${server.gitHubOrg}/${server.gitHubRepo}/${server.repositoryPath.replace(/\//g, '--')}`
                      : `/api/badge/quality/${server.gitHubOrg}/${server.gitHubRepo}`;
                    
                    const badgeMarkdown = server.repositoryPath
                      ? `[![MCP Quality](https://archestra.ai/api/badge/quality/${server.gitHubOrg}/${server.gitHubRepo}/${server.repositoryPath.replace(/\//g, '--')})](https://archestra.ai/mcp-catalog/${server.slug})`
                      : `[![MCP Quality](https://archestra.ai/api/badge/quality/${server.gitHubOrg}/${server.gitHubRepo})](https://archestra.ai/mcp-catalog/${server.slug})`;
                    
                    return (
                      <BadgeCopy badgeMarkdown={badgeMarkdown} badgeUrl={badgeUrl} />
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Edit This Server Button */}
                <a
                  href={`https://github.com/archestra-ai/website/edit/main/app/data/mcp-evaluations/${server.slug}.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit This Server
                </a>
                
                {/* Add New MCP Server Button */}
                <a
                  href="https://github.com/archestra-ai/website/edit/main/app/data/mcp-servers.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New MCP Server
                </a>
                
                {/* Report Issue Button */}
                <a
                  href={`https://github.com/archestra-ai/website/issues/new?title=Issue with ${encodeURIComponent(serverName)}&body=Server: ${server.gitHubOrg}/${server.gitHubRepo}${server.repositoryPath ? `/${server.repositoryPath}` : ''}%0ASlug: ${server.slug}%0A%0APlease describe the issue:`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Report an Issue
                </a>
                
                {/* GitHub Repo Button */}
                <a
                  href="https://github.com/archestra-ai/website/tree/main/app/app/mcp-catalog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs text-gray-400">© 2025 Archestra.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}