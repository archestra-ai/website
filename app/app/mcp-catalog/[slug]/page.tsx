import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { MCPServer, getMCPServerName, getMCPServerGitHubUrl } from "../../../data/types";
import { loadAllServers } from "../../../lib/server-utils";
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
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function MCPDetailPage({ params, searchParams }: PageProps) {
  const servers = loadAllServers();
  const server = servers.find(s => s.slug === params.slug);
  
  if (!server) {
    notFound();
  }

  // Build back URL with preserved state
  const backUrl = (() => {
    const catalogParams = new URLSearchParams();
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
    const scroll = typeof searchParams.scroll === 'string' ? searchParams.scroll : undefined;
    
    if (search) catalogParams.set('search', search);
    if (category) catalogParams.set('category', category);
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
                  <CardTitle>Archestra MCP Quality Score</CardTitle>
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