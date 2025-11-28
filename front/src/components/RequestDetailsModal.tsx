import { Request } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar, User, FileText, Clock } from 'lucide-react';
import { requestsApi } from '@/services/api';
import { toast } from 'sonner';

interface RequestDetailsModalProps {
  request: Request | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  open,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!request) return null;

  const canManageRequest = user?.role === 'admin' || user?.role === 'superadmin';
  const isPending = request.status === 'pending' || request.status === 'in_progress';

  const handleStatusChange = async (newStatus: string) => {
    if (!canManageRequest) return;

    setProcessing(true);
    try {
      await requestsApi.updateRequestStatus(
        request.id,
        newStatus,
        newStatus === 'rejected' ? rejectionReason : undefined
      );
      toast.success('Statut mis à jour avec succès');
      onUpdate?.();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setProcessing(false);
    }
  };

  const attachments = Array.isArray(request.attachments)
    ? request.attachments
    : typeof request.attachments === "string"
      ? JSON.parse(request.attachments || "[]")
      : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{request.subject}</DialogTitle>
              <DialogDescription className="mt-1">{request.className}</DialogDescription>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{request.studentName}</p>
                <p className="text-muted-foreground">{request.studentMatricule}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(new Date(request.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(request.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Type de requête */}
          <div>
            <h3 className="font-semibold mb-2">Type de requête</h3>
            <p className="text-sm capitalize">{request.type.replace('_', ' ')}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
              {request.description}
            </p>
          </div>

          {/* Pièces jointes */}
          {attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Pièces jointes ({attachments.length})
              </h3>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm flex-1">{attachment}</span>
                    <Button variant="ghost" size="sm">
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raison de rejet si rejetée */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h3 className="font-semibold text-destructive mb-2">Raison du rejet</h3>
              <p className="text-sm">{request.rejectionReason}</p>
            </div>
          )}

          {/* Actions pour admin */}
          {canManageRequest && isPending && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Actions</h3>
              
              {request.status === 'pending' && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={processing}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Marquer en traitement
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  onClick={() => handleStatusChange('validated')}
                  disabled={processing}
                >
                  Valider
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('transmitted')}
                  disabled={processing}
                >
                  Transmettre
                </Button>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Raison du rejet (obligatoire pour rejeter)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={processing || !rejectionReason.trim()}
                >
                  Rejeter la requête
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
