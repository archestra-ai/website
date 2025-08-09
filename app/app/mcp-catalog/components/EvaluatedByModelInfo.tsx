import { generateUrlToIndividualMcpCatalogJsonFile } from '@mcpCatalog/lib/urls';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

interface EvaluatedByModelInfoProps {
  server: ArchestraMcpServerManifest;
}

const EvaluatedByModelInfo = ({
  server: { name: serverId, evaluation_model: evaluationModel },
}: EvaluatedByModelInfoProps) => {
  if (!evaluationModel) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500">
        {evaluationModel === null ? '✨ Human evaluation' : `🤖 Evaluated by ${evaluationModel}`}
      </span>
      <a
        href={generateUrlToIndividualMcpCatalogJsonFile(serverId, true)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        title="Fix evaluation data"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};

export default EvaluatedByModelInfo;
