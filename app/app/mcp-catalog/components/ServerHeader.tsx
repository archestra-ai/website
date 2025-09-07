import { Badge } from '@components/ui/badge';
import { getUrlToLatestGitHubCommit } from '@mcpCatalog/lib/urls';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

interface ServerHeaderProps {
  server: ArchestraMcpServerManifest;
}

const ServerHeader = ({ server }: ServerHeaderProps) => {
  const {
    display_name: serverName,
    github_info,
    remote_url,
    last_scraped_at: lastScrapedAt,
    programming_language: programmingLanguage,
    category,
    description,
  } = server;

  const gitHubInfoOwner = github_info?.owner;
  const gitHubInfoRepo = github_info?.repo;
  const gitHubInfoPath = github_info?.path;
  const gitHubInfoLatestCommitHash = github_info?.latest_commit_hash;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words">{serverName}</h1>
          {github_info ? (
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
          ) : remote_url ? (
            <div
              className="text-sm text-gray-500 mb-4 font-mono"
              style={{
                overflowWrap: 'break-word',
                wordBreak: 'keep-all',
              }}
            >
              <span className="text-blue-600">{remote_url}</span>
            </div>
          ) : null}

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
          {remote_url && !github_info ? (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm">Remote Server</Badge>
          ) : (
            <Badge variant="outline" className="text-xs sm:text-sm">
              {programmingLanguage}
            </Badge>
          )}
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
