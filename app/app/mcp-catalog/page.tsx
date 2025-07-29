import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { MCPServer } from "../../data/types";
import { loadServers } from "../../lib/server-utils";
import MCPCatalogClient from "./client";
import BadgeCopyMain from "./badge-copy-main";
import Header from "../../components/header";

// Get unique categories from evaluations
function getCategories(evaluations: MCPServer[]): string[] {
  const categories = new Set<string>();
  let hasUncategorized = false;

  for (const evaluation of evaluations) {
    if (evaluation.category) {
      categories.add(evaluation.category);
    } else {
      hasUncategorized = true;
    }
  }

  const sortedCategories = Array.from(categories).sort();
  const result = ["All", ...sortedCategories];
  
  // Add Uncategorized at the end if there are any servers without a category
  if (hasUncategorized) {
    result.push("Uncategorized");
  }
  
  return result;
}

// Get unique programming languages from evaluations
function getProgrammingLanguages(evaluations: MCPServer[]): string[] {
  const languages = new Set<string>();

  for (const evaluation of evaluations) {
    if (evaluation.programmingLanguage && evaluation.programmingLanguage !== "Unknown") {
      languages.add(evaluation.programmingLanguage);
    }
  }

  const sortedLanguages = Array.from(languages).sort();
  return ["All", ...sortedLanguages];
}

export default function MCPCatalogPage() {
  const mcpServers = loadServers();
  const categories = getCategories(mcpServers);
  const languages = getProgrammingLanguages(mcpServers);
  
  // Find the highest scoring MCP server for the badge example
  const topScoredServer = mcpServers
    .filter(server => server.qualityScore !== null)
    .sort((a, b) => b.qualityScore! - a.qualityScore!)[0];

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
          <div className="mb-12 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  MCP Catalog
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Too many MCP servers... Let's highlight the best!
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-6 mt-10 mb-6 max-w-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    {topScoredServer ? (
                      <a
                        href={`/mcp-catalog/${topScoredServer.slug}`}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={topScoredServer.repositoryPath 
                            ? `/api/badge/quality/${topScoredServer.gitHubOrg}/${topScoredServer.gitHubRepo}/${topScoredServer.repositoryPath.replace(/\//g, '--')}`
                            : `/api/badge/quality/${topScoredServer.gitHubOrg}/${topScoredServer.gitHubRepo}`
                          }
                          alt="MCP Quality Badge"
                          className="h-5"
                        />
                      </a>
                    ) : (
                      <img
                        src="/api/badge/quality/YOUR-GITHUB-ORG/YOUR-REPO-NAME"
                        alt="MCP Quality Badge"
                        className="h-5"
                      />
                    )}
                    <span className="text-sm text-gray-500">
                      ← Add the badge to your README.md
                    </span>
                  </div>

                  <BadgeCopyMain />
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-4">
                  {/* Add New MCP Server Button */}
                  <a
                    href="https://github.com/archestra-ai/website/blob/main/app/data/mcp-servers.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New MCP Server
                  </a>
                  
                  {/* Report Issue Button */}
                  <a
                    href="https://github.com/archestra-ai/website/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Report an Issue
                  </a>
                  
                  {/* GitHub Repo Button */}
                  <a
                    href="https://github.com/archestra-ai/website/tree/main/app/app/mcp-catalog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>

              <Card className="w-[600px] ml-8 bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-900">
                    How do we calculate the MCP Quality score?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4 text-sm text-blue-800">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">
                          MCP Protocol Implementation
                        </span>
                        <span className="font-bold">60 pts</span>
                      </div>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        9 core MCP features: tools, prompts, resources,
                        sampling, roots, logging, stdio transport, HTTP
                        transport, and OAuth2 authentication.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">GitHub Community</span>
                        <span className="font-bold">20 pts</span>
                      </div>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        GitHub stars (popularity), active contributors
                        (community engagement), and issues (development
                        activity).
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">
                          Development Maturity
                        </span>
                        <span className="font-bold">10 pts</span>
                      </div>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        Automated CI/CD pipelines, semantic versioning, and
                        comprehensive release notes.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">Documentation</span>
                        <span className="font-bold">8 pts</span>
                      </div>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        Basic README completeness, usage examples, and setup
                        instructions.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">Badge Adoption</span>
                        <span className="font-bold">2 pts</span>
                      </div>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        For displaying our quality badge in your README.
                      </p>
                    </div>

                    <div className="border-t border-blue-200 pt-3 mt-4">
                      <p className="text-xs text-blue-600 font-medium">
                        Total: 100 points.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Suspense fallback={<div>Loading catalog...</div>}>
            <MCPCatalogClient mcpServers={mcpServers} categories={categories} languages={languages} />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs text-gray-400">
              © 2025 Archestra.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
