const layers = [
  { label: 'Agentic Chat', width: 'w-[45%]' },
  { label: 'Agent Runtime', width: 'w-[55%]' },
  { label: 'MCP Orchestrator & RAG', width: 'w-[65%]' },
  { label: 'LLM & MCP Proxies', width: 'w-[85%]' },
  { label: 'Security & Guardrails · Observability & Cost Tracking', width: 'w-full' },
];

export default function PlatformDiagram() {
  return (
    <div className="flex flex-col gap-3">
      {layers.map((layer) => (
        <div
          key={layer.label}
          className={`${layer.width} bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-semibold text-left shadow-sm`}
        >
          {layer.label}
        </div>
      ))}
    </div>
  );
}
