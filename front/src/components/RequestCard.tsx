import { Request } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RequestCardProps {
  request: Request;
  onViewDetails: (request: Request) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onViewDetails }) => {
  // Ensure attachments is always an array to avoid runtime errors
  const attachments = Array.isArray(request.attachments)
    ? request.attachments
    : request.attachments
      ? [request.attachments]
      : [];
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{request.subject}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{request.className}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-2">{request.description}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(request.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
          </div>
          {attachments && attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{attachments.length} fichier(s)</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewDetails(request)}
        >
          Voir les détails
        </Button>
      </CardContent>
    </Card>
  );
};
