import { Badge } from '@components/ui/badge';
import McpServerImage from '@mcpCatalog/components/McpServerImage';
import { getUrlToLatestGitHubCommit } from '@mcpCatalog/lib/urls';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

interface ServerHeaderProps {
  server: ArchestraMcpServerManifest;
}

const ServerHeader = ({ server }: ServerHeaderProps) => {
  const {
    display_name: serverName,
    github_info: {
      owner: gitHubInfoOwner,
      repo: gitHubInfoRepo,
      path: gitHubInfoPath,
      latest_commit_hash: gitHubInfoLatestCommitHash,
    },
    last_scraped_at: lastScrapedAt,
    programming_language: programmingLanguage,
    category,
    description,
  } = server;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-2">
            <McpServerImage 
              server={server}
              width={64}
              height={64}
              className="rounded-lg flex-shrink-0"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words flex-1">{serverName}</h1>
          </div>
          <div
            className="text-sm text-gray-500 mb-4 font-mono"
            style={{
              overflowWrap: 'break-word',
              wordBreak: 'keep-all',
            }}
          >
            <span>
              {gitHubInfoOwner}/{gitHubInfoRepo}
            </span>
            {gitHubInfoPath && (
              <>
                <span>/</span>
                <span className="text-blue-600">{gitHubInfoPath}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
            {gitHubInfoLatestCommitHash && (
              <div className="flex items-center gap-1">
                <span>🔗 Latest commit:</span>
                <a
                  href={getUrlToLatestGitHubCommit(server)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-600 hover:underline"
                  title={gitHubInfoLatestCommitHash}
                >
                  {gitHubInfoLatestCommitHash.substring(0, 7)}
                </a>
              </div>
            )}
            {lastScrapedAt && (
              <div className="flex items-center gap-1">
                <span>🕒 Updated:</span>
                <span className="font-mono">
                  {new Date(lastScrapedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs sm:text-sm">
            {programmingLanguage}
          </Badge>
          <Badge variant="outline" className="text-xs sm:text-sm">
            {category || 'Uncategorized'}
          </Badge>
        </div>
      </div>
      <p className="text-base sm:text-lg text-gray-600">{description}</p>
    </div>
  );
};

export default ServerHeader;
