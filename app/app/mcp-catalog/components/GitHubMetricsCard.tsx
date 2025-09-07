import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

interface GitHubMetricsCardProps {
  server: ArchestraMcpServerManifest;
  serverCount: number;
}

const GitHubMetricsCard = ({ server, serverCount }: GitHubMetricsCardProps) => {
  // This component should only be rendered for GitHub servers
  if (!server.github_info) {
    return null;
  }

  const {
    stars: gitHubInfoStars,
    contributors: gitHubInfoContributors,
    issues: gitHubInfoIssues,
    releases: gitHubInfoReleases,
    ci_cd: gitHubInfoCiCd,
  } = server.github_info;

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Metrics</CardTitle>
        <CardDescription>
          Repository statistics and activity
          {serverCount > 1 && (
            <span className="block text-xs text-gray-500 mt-1">
              This repository contains {serverCount} MCP servers. Metrics shown are divided.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span>⭐ GitHub Stars:</span>
            <span className="font-mono">
              {gitHubInfoStars}
              {serverCount > 1 && (
                <span className="text-gray-500 ml-1">
                  / {serverCount} = {Math.round(gitHubInfoStars / serverCount)}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>👥 Contributors:</span>
            <span className="font-mono">
              {gitHubInfoContributors}
              {serverCount > 1 && (
                <span className="text-gray-500 ml-1">
                  / {serverCount} = {Math.round(gitHubInfoContributors / serverCount)}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>📋 Total Issues:</span>
            <span className="font-mono">
              {gitHubInfoIssues}
              {serverCount > 1 && (
                <span className="text-gray-500 ml-1">
                  / {serverCount} = {Math.round(gitHubInfoIssues / serverCount)}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>📦 Has Releases:</span>
            <span className={gitHubInfoReleases ? 'text-green-600' : 'text-gray-400'}>
              {gitHubInfoReleases ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>🔧 Has CI/CD Pipeline:</span>
            <span className={gitHubInfoCiCd ? 'text-green-600' : 'text-gray-400'}>{gitHubInfoCiCd ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubMetricsCard;
