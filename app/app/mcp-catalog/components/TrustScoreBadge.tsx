import { generateBadgeRelativeUrl } from '@mcpCatalog/lib/trust-score-badge';
import { ArchestraMcpServerGitHubRepoInfo } from '@mcpCatalog/types';

interface TrustScoreBadgeProps {
  gitHubInfo: ArchestraMcpServerGitHubRepoInfo;
}

export default function TrustScoreBadge({ gitHubInfo }: TrustScoreBadgeProps) {
  return <img src={generateBadgeRelativeUrl(gitHubInfo)} alt="Trust Score Badge" />;
}
