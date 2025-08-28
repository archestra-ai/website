import { ExternalLink, Github } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ArchestraMcpServerManifest } from '@lib/types';

interface ResourcesCardProps {
  server: ArchestraMcpServerManifest;
}

const ResourcesCard = ({
  server: {
    github_info: { url: gitHubRepoUrl },
  },
}: ResourcesCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Resources</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <a
        href={gitHubRepoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border"
      >
        <div className="flex items-center gap-3">
          <Github className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium">GitHub Repository</span>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400" />
      </a>
    </CardContent>
  </Card>
);

export default ResourcesCard;
