import { Request, RequestStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2, CheckCircle2, XCircle, Send, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequestsKanbanProps {
  requests: Request[];
  onSelectRequest: (request: Request) => void;
}

const statusColumns: { status: RequestStatus; label: string; icon: any; color: string }[] = [
  { status: 'pending', label: 'En attente', icon: Clock, color: 'text-warning' },
  { status: 'in_progress', label: 'En traitement', icon: Loader2, color: 'text-info' },
  { status: 'validated', label: 'Validées', icon: CheckCircle2, color: 'text-success' },
  { status: 'transmitted', label: 'Transmises', icon: Send, color: 'text-primary' },
  { status: 'rejected', label: 'Rejetées', icon: XCircle, color: 'text-destructive' },
];

export const RequestsKanban: React.FC<RequestsKanbanProps> = ({ requests, onSelectRequest }) => {
  const getRequestsByStatus = (status: RequestStatus) => {
    return requests.filter((req) => req.status === status);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {statusColumns.map((column) => {
        const columnRequests = getRequestsByStatus(column.status);
        const Icon = column.icon;

        return (
          <div key={column.status} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Icon className={`w-5 h-5 ${column.color} ${column.icon === Loader2 ? 'animate-spin' : ''}`} />
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <Badge variant="secondary" className="ml-auto">
                {columnRequests.length}
              </Badge>
            </div>

            <ScrollArea className="flex-1 max-h-[600px]">
              <div className="space-y-3 pr-4">
                {columnRequests.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 pb-6 text-center">
                      <p className="text-sm text-muted-foreground">Aucune requête</p>
                    </CardContent>
                  </Card>
                ) : (
                  columnRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => onSelectRequest(request)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {request.subject}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span className="truncate">{request.studentName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(new Date(request.createdAt), 'dd MMM', { locale: fr })}
                          </span>
                        </div>

                        <Badge variant="outline" className="text-xs">
                          {request.type.replace('_', ' ')}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};
