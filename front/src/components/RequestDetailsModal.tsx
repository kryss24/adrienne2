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
import { Calendar, User, FileText, Clock, CheckCircle2, XCircle, Send, Loader2, ArrowRight } from 'lucide-react';
import { requestsApi } from '@/services/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

  const statusTimeline = [
    { status: 'pending', label: 'En attente', icon: Clock, active: true },
    { status: 'in_progress', label: 'En traitement', icon: Loader2, active: request.status === 'in_progress' || request.status === 'validated' || request.status === 'transmitted' || request.status === 'rejected' },
    { 
      status: request.status === 'rejected' ? 'rejected' : request.status === 'transmitted' ? 'transmitted' : 'validated', 
      label: request.status === 'rejected' ? 'Rejetée' : request.status === 'transmitted' ? 'Transmise' : 'Validée',
      icon: request.status === 'rejected' ? XCircle : request.status === 'transmitted' ? Send : CheckCircle2,
      active: request.status === 'validated' || request.status === 'transmitted' || request.status === 'rejected'
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{request.subject}</DialogTitle>
              <DialogDescription className="mt-2 text-base">{request.className}</DialogDescription>
            </div>
            <StatusBadge status={request.status} className="text-sm px-3 py-1.5" />
          </div>
        </DialogHeader>

        {/* Timeline de statut */}
        <div className="relative py-6">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          <div className="relative flex justify-between">
            {statusTimeline.map((step, index) => (
              <div key={step.status} className="flex flex-col items-center gap-2">
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  step.active 
                    ? step.status === 'rejected' 
                      ? 'bg-destructive border-destructive text-destructive-foreground shadow-lg'
                      : 'bg-primary border-primary text-primary-foreground shadow-lg' 
                    : 'bg-background border-muted-foreground/30 text-muted-foreground'
                }`}>
                  <step.icon className={`w-5 h-5 ${step.icon === Loader2 && step.active ? 'animate-spin' : ''}`} />
                </div>
                <span className={`text-xs font-medium max-w-[80px] text-center ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Détails de la requête</TabsTrigger>
            <TabsTrigger value="actions">Actions & Gestion</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Informations principales */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Étudiant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{request.studentName}</p>
                  <p className="text-sm text-muted-foreground">{request.studentMatricule}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de soumission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {format(new Date(request.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(request.createdAt), 'HH:mm')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Type de requête */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Type de requête</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  {request.type.replace('_', ' ')}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Description détaillée</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {request.description}
                </p>
              </CardContent>
            </Card>

            {/* Pièces jointes */}
            {request.attachments && request.attachments.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Pièces jointes ({request.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {request.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm flex-1 font-medium">{attachment}</span>
                      <Button variant="ghost" size="sm">
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Raison de rejet si rejetée */}
            {request.status === 'rejected' && request.rejectionReason && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-destructive flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Raison du rejet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{request.rejectionReason}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-6 mt-6">
            {canManageRequest && isPending ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion de la requête</CardTitle>
                    <CardDescription>
                      Choisissez l'action appropriée pour cette requête
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Marquer en traitement */}
                    {request.status === 'pending' && (
                      <div className="p-4 border rounded-lg bg-info/5 border-info/20">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-info/10">
                            <Loader2 className="w-6 h-6 text-info" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">Commencer le traitement</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Indiquer que vous avez pris en charge cette requête
                            </p>
                            <Button
                              variant="secondary"
                              className="w-full"
                              onClick={() => handleStatusChange('in_progress')}
                              disabled={processing}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Marquer en traitement
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions positives */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 border rounded-lg bg-success/5 border-success/20">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Valider</h4>
                              <p className="text-xs text-muted-foreground">Accepter la requête</p>
                            </div>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => handleStatusChange('validated')}
                            disabled={processing}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Valider
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              <Send className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Transmettre</h4>
                              <p className="text-xs text-muted-foreground">Renvoyer au service</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleStatusChange('transmitted')}
                            disabled={processing}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Transmettre
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Rejet avec raison */}
                    <div className="p-4 border rounded-lg bg-destructive/5 border-destructive/20">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                          <XCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-semibold mb-1">Rejeter la requête</h4>
                            <p className="text-sm text-muted-foreground">
                              Veuillez fournir une raison détaillée pour le rejet
                            </p>
                          </div>
                          <Textarea
                            placeholder="Expliquez la raison du rejet (obligatoire)..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleStatusChange('rejected')}
                            disabled={processing || !rejectionReason.trim()}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeter la requête
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                      {request.status === 'validated' && <CheckCircle2 className="w-8 h-8 text-success" />}
                      {request.status === 'rejected' && <XCircle className="w-8 h-8 text-destructive" />}
                      {request.status === 'transmitted' && <Send className="w-8 h-8 text-primary" />}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Requête traitée</h3>
                    <p className="text-muted-foreground">
                      Cette requête a déjà été traitée et ne peut plus être modifiée.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
