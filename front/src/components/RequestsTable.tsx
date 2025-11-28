import { Request } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RequestsTableProps {
  requests: Request[];
  onViewDetails: (request: Request) => void;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({ requests, onViewDetails }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune requête à afficher
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Étudiant</TableHead>
            <TableHead>Matricule</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.studentName}</TableCell>
              <TableCell>{request.studentMatricule}</TableCell>
              <TableCell>{request.subject}</TableCell>
              <TableCell className="capitalize">{request.type.replace('_', ' ')}</TableCell>
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              <TableCell>
                {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(request)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
