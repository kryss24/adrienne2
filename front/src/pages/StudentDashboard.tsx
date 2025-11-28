import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Request, DashboardStats } from '@/types';
import { requestsApi, statsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { RequestCard } from '@/components/RequestCard';
import { RequestDetailsModal } from '@/components/RequestDetailsModal';
import { StatsCard } from '@/components/StatsCard';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, statsData] = await Promise.all([
        requestsApi.getMyRequests(),
        statsApi.getMyStats(),
      ]);
      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tableau de bord étudiant</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total"
              value={stats.total}
              icon={FileText}
              iconColor="text-primary"
            />
            <StatsCard
              title="En attente"
              value={stats.pending}
              icon={Clock}
              iconColor="text-warning"
            />
            <StatsCard
              title="Validées"
              value={stats.validated}
              icon={CheckCircle}
              iconColor="text-success"
            />
            <StatsCard
              title="Rejetées"
              value={stats.rejected}
              icon={XCircle}
              iconColor="text-destructive"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Mes requêtes</h2>
          <Button onClick={() => navigate('/new-request')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle requête
          </Button>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune requête</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore soumis de requête
            </p>
            <Button onClick={() => navigate('/new-request')}>
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première requête
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onViewDetails={setSelectedRequest}
              />
            ))}
          </div>
        )}
      </main>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdate={loadData}
      />
    </div>
  );
};

export default StudentDashboard;
