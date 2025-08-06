"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { QualityBar } from "../components/quality-bar";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ArchestraMcpServerManifest,
  ArchestraScoreBreakdown,
} from "../../types";

interface QualityScoreCardProps {
  server: ArchestraMcpServerManifest;
  scoreBreakdown: ArchestraScoreBreakdown;
}

export default function QualityScoreCard({
  server,
  scoreBreakdown,
}: QualityScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreDescription = (
    score: number,
    maxScore: number,
    category: string
  ) => {
    const percentage = (score / maxScore) * 100;
    if (category === "GitHub community health") {
      if (percentage === 100)
        return `Strong GitHub community (${score}/${maxScore})`;
      if (percentage >= 75)
        return `GitHub community is developing well (${score}/${maxScore})`;
      if (percentage >= 50)
        return `GitHub community is not mature yet (${score}/${maxScore})`;
      if (percentage >= 25)
        return `Limited GitHub community activity (${score}/${maxScore})`;
      return `Room for improvement in GitHub community`;
    }
    if (category === "documentation quality") {
      return `Documentation (${score}/${maxScore})`;
    }
    if (category === "dependency optimization") {
      // Check if dependencies have been evaluated
      if (!server.dependencies) {
        return `Dependencies not yet evaluated (${score}/${maxScore})`;
      }
      if (percentage === 100)
        return `Optimal dependency management (${score}/${maxScore})`;
      if (percentage >= 75)
        return `Good dependency choices (${score}/${maxScore})`;
      if (percentage >= 50)
        return `Moderate dependency usage (${score}/${maxScore})`;
      if (percentage >= 25)
        return `Heavy dependency usage (${score}/${maxScore})`;
      return `Too many or rare dependencies (${score}/${maxScore})`;
    }
    if (category === "badge adoption") {
      if (percentage > 0)
        return `Archestra MCP Trust badge (${score}/${maxScore})`;
      return `Archestra MCP Trust score badge is missing`;
    }
    if (category === "MCP protocol implementation") {
      // Check if protocol features have been evaluated
      if (server.protocol_features.implementing_tools === null) {
        return `Protocol features not yet evaluated (${score}/${maxScore})`;
      }
      if (percentage === 100)
        return `Full MCP protocol implementation (${score}/${maxScore})`;
      if (percentage >= 75)
        return `Most MCP protocol features implemented (${score}/${maxScore})`;
      if (percentage >= 50)
        return `Core MCP protocol features implemented (${score}/${maxScore})`;
      if (percentage >= 25)
        return `Basic MCP protocol features implemented (${score}/${maxScore})`;
      return `Limited MCP protocol implementation (${score}/${maxScore})`;
    }
    if (percentage === 100)
      return `Full ${category.toLowerCase()} (${score}/${maxScore})`;
    if (percentage >= 75)
      return `Strong ${category.toLowerCase()} (${score}/${maxScore})`;
    if (percentage >= 50)
      return `Moderate ${category.toLowerCase()} (${score}/${maxScore})`;
    if (percentage >= 25)
      return `Basic ${category.toLowerCase()} (${score}/${maxScore})`;
    return `Room for improvement in ${category.toLowerCase()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Trust Score</CardTitle>
        <CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              {server.quality_score !== null
                ? "Based on our comprehensive evaluation criteria"
                : "This server is being evaluated"}
            </span>
            {server.evaluation_model !== undefined && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">
                  {server.evaluation_model === null
                    ? "✨ Human evaluation"
                    : `🤖 Evaluated by ${server.evaluation_model}`}
                </span>
                <a
                  href={`https://github.com/archestra-ai/website/edit/main/app/app/mcp-catalog/data/mcp-evaluations/${server.name}.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  title="Fix evaluation data"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
      <CardContent>
        <QualityBar score={server.quality_score} />

        {server.quality_score !== null && (
          <>
            {/* Mobile: Collapsible Details */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  Score Details
                </span>
                {showDetails ? (
                  <ChevronUp size={16} className="text-gray-500" />
                ) : (
                  <ChevronDown size={16} className="text-gray-500" />
                )}
              </button>

              {showDetails && (
                <div className="mt-3 text-sm text-gray-600">
                  <ul className="space-y-1">
                    <li>
                      •{" "}
                      {getScoreDescription(
                        scoreBreakdown.mcp_protocol,
                        40,
                        "MCP protocol implementation"
                      )}
                    </li>
                    <li>
                      •{" "}
                      {getScoreDescription(
                        scoreBreakdown.github_metrics,
                        20,
                        "GitHub community health"
                      )}
                    </li>
                    <li>
                      •{" "}
                      {getScoreDescription(
                        scoreBreakdown.dependencies,
                        20,
                        "dependency optimization"
                      )}
                    </li>
                    <li>
                      •{" "}
                      {getScoreDescription(
                        scoreBreakdown.deployment_maturity,
                        10,
                        "deployment maturity"
                      )}
                    </li>
                    <li>
                      •{" "}
                      {getScoreDescription(
                        scoreBreakdown.documentation,
                        8,
                        "documentation quality"
                      )}
                    </li>
                    <li>
                      •{" "}
                      {getScoreDescription(
                        scoreBreakdown.badge_usage,
                        2,
                        "badge adoption"
                      )}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Desktop: Always Show Details */}
            <div className="hidden sm:block mt-4 text-sm text-gray-600">
              <ul className="space-y-1">
                <li>
                  •{" "}
                  {getScoreDescription(
                    scoreBreakdown.mcp_protocol,
                    40,
                    "MCP protocol implementation"
                  )}
                </li>
                <li>
                  •{" "}
                  {getScoreDescription(
                    scoreBreakdown.github_metrics,
                    20,
                    "GitHub community health"
                  )}
                </li>
                <li>
                  •{" "}
                  {getScoreDescription(
                    scoreBreakdown.dependencies,
                    20,
                    "dependency optimization"
                  )}
                </li>
                <li>
                  •{" "}
                  {getScoreDescription(
                    scoreBreakdown.deployment_maturity,
                    10,
                    "deployment maturity"
                  )}
                </li>
                <li>
                  •{" "}
                  {getScoreDescription(
                    scoreBreakdown.documentation,
                    8,
                    "documentation quality"
                  )}
                </li>
                <li>
                  •{" "}
                  {getScoreDescription(
                    scoreBreakdown.badge_usage,
                    2,
                    "badge adoption"
                  )}
                </li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
