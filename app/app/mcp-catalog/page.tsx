import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { MCPServer } from "../../data/types";
import { loadAllServers } from "../../lib/server-utils";
import MCPCatalogClient from "./client";
import BadgeCopyMain from "./badge-copy-main";
import Header from "../../components/header";

// Get unique categories from evaluations
function getCategories(evaluations: MCPServer[]): string[] {
  const categories = new Set<string>();

  for (const evaluation of evaluations) {
    if (evaluation.category) {
      categories.add(evaluation.category);
    }
  }

  const sortedCategories = Array.from(categories).sort();
  return ["All", ...sortedCategories];
}

export default function MCPCatalogPage() {
  const mcpServers = loadAllServers();
  const categories = getCategories(mcpServers);
  
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
                  We at Archestra decided to catalog all the servers and
                  calculate a score based on code quality, documentation,
                  community support, stability, and performance.
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-6 mt-10 mb-6 max-w-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    {topScoredServer ? (
                      <img
                        src={topScoredServer.repositoryPath 
                          ? `/api/badge/quality/${topScoredServer.gitHubOrg}/${topScoredServer.gitHubRepo}/${topScoredServer.repositoryPath.replace(/\//g, '--')}`
                          : `/api/badge/quality/${topScoredServer.gitHubOrg}/${topScoredServer.gitHubRepo}`
                        }
                        alt="MCP Quality Badge"
                        className="h-5"
                      />
                    ) : (
                      <img
                        src="/api/badge/quality/YOUR-GITHUB-ORG/YOUR-REPO-NAME"
                        alt="MCP Quality Badge"
                        className="h-5"
                      />
                    )}
                    <span className="text-sm text-gray-500">
                      ← Add the badge to your README.md to get into the catalog
                    </span>
                  </div>

                  <BadgeCopyMain />
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
            <MCPCatalogClient mcpServers={mcpServers} categories={categories} />
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
