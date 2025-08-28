import { generateBadgeRelativeUrl } from '@lib/trust-score-badge';
import { ArchestraMcpServerGitHubRepoInfo } from '@lib/types';

interface TrustScoreBadgeProps {
  gitHubInfo: ArchestraMcpServerGitHubRepoInfo;
}

export default function TrustScoreBadge({ gitHubInfo }: TrustScoreBadgeProps) {
  return <img src={generateBadgeRelativeUrl(gitHubInfo)} alt="Trust Score Badge" />;
}
