'use client';

import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';

export default function MermaidDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderChart = async () => {
      if (!ref.current) return;

      try {
        mermaid.initialize({ 
          startOnLoad: false,
          theme: 'default',
          themeVariables: {
            primaryColor: '#e6f3ff',
            primaryTextColor: '#333',
            primaryBorderColor: '#0066cc',
            lineColor: '#333',
            secondaryColor: '#fff2cc',
            tertiaryColor: '#f9f9f9'
          }
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const chart = `graph TB
    subgraph K8S["Kubernetes Cluster"]
        subgraph Archestra["Archestra Platform"]
            Gateway["MCP Gateway"]
            Orchestrator["MCP Orchestrator"]

            Gateway --> Orchestrator
        end

        Orchestrator --> Pod1["Pod 1<br/>GitHub MCP"]
        Orchestrator --> Pod2["Pod 2<br/>Jira MCP"]
        Orchestrator --> Pod3["Pod 3<br/>Slack MCP"]
    end

    style K8S fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Archestra fill:#e6f3ff,stroke:#0066cc,stroke-width:2px
    style Gateway fill:#fff,stroke:#0066cc,stroke-width:2px
    style Orchestrator fill:#fff,stroke:#0066cc,stroke-width:2px
    style Pod1 fill:#fff2cc,stroke:#d6b656,stroke-width:1px
    style Pod2 fill:#fff2cc,stroke:#d6b656,stroke-width:1px
    style Pod3 fill:#fff2cc,stroke:#d6b656,stroke-width:1px`;
        
        const { svg } = await mermaid.render(id, chart);
        const scaledSvg = svg.replace(/(<svg[^>]*)(>)/, (match, p1, p2) => {
          return (
            p1.replace(/width="[^"]*"/, '').replace(/height="[^"]*"/, '') +
            ' width="100%" style="min-height: 300px; max-width: 800px; margin: 0 auto;"' +
            p2
          );
        });
        setSvg(scaledSvg);
      } catch (error) {
        console.error('Mermaid rendering failed:', error);
        setSvg('<div class="text-red-600">Failed to render diagram</div>');
      }
    };

    renderChart();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
        <div className="flex justify-center items-center">
          <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} className="w-full" />
        </div>
      </div>
    </div>
  );
}
