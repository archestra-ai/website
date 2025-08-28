import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ArchestraMcpServerManifest } from '@lib/types';

interface FrameworkCardProps {
  server: ArchestraMcpServerManifest;
}

const FrameworkCard = ({ server: { framework } }: FrameworkCardProps) => {
  if (!framework) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Framework</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary" className="text-sm">
          {framework}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default FrameworkCard;
