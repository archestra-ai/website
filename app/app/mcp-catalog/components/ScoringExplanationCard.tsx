'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@components/ui/card';

const scoringCriteria = [
  {
    name: 'MCP Protocol Implementation',
    points: 40,
    description:
      '9 core MCP features: tools, prompts, resources, sampling, roots, logging, stdio transport, HTTP transport, and OAuth2 authentication.',
  },
  {
    name: 'GitHub Community',
    points: 20,
    description:
      'GitHub stars (popularity), active contributors (community engagement), and issues (development activity).',
  },
  {
    name: 'Dependency Optimization',
    points: 20,
    description: 'Minimal dependencies (≤10 is optimal) and using common libraries shared by 5+ other servers.',
  },
  {
    name: 'Development Maturity',
    points: 10,
    description: 'Automated CI/CD pipelines, semantic versioning, and comprehensive release notes.',
  },
  {
    name: 'Documentation',
    points: 8,
    description: 'Basic README completeness, usage examples, and setup instructions.',
  },
  {
    name: 'Badge Adoption',
    points: 2,
    description: 'For displaying our quality badge in your README.',
  },
];

export default function ScoringExplanationCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  const ScoringContent = () => (
    <div className="space-y-4 text-sm text-blue-800">
      {scoringCriteria.map((criterion) => (
        <div key={criterion.name}>
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium">{criterion.name}</span>
            <span className="font-bold">{criterion.points} pts</span>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">{criterion.description}</p>
        </div>
      ))}
      <div className="border-t border-blue-200 pt-3 mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-blue-600 font-medium">Total: 100 points.</p>
          <a
            href="https://github.com/archestra-ai/website/blob/main/app/app/mcp-catalog/scripts/evaluate-catalog.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Review Evaluation Script, it's Open Source!
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full xl:w-[600px] bg-blue-50 border-blue-200 xl:sticky xl:top-8">
      <div
        className="px-4 py-3 xl:px-6 xl:py-4 cursor-pointer xl:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base xl:text-lg font-semibold text-blue-900">How do we calculate the MCP Trust score?</h3>
          <div className="xl:hidden">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-blue-700 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-700 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
      <div className={`px-4 pb-4 xl:px-6 xl:pb-6 ${!isExpanded ? 'hidden xl:block' : ''}`}>
        <ScoringContent />
      </div>
    </Card>
  );
}
