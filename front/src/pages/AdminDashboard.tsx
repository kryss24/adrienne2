import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Request, DashboardStats, RequestStatus } from '@/types';
import { requestsApi, statsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequestsTable } from '@/components/RequestsTable';
import { RequestDetailsModal } from '@/components/RequestDetailsModal';
import { StatsCard } from '@/components/StatsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Clock, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, searchTerm, statusFilter, subjectFilter]);

  const loadData = async () => {
    try {
      const classId = user?.classId || '';
      const [requestsData, statsData] = await Promise.all([
        requestsApi.getRequestsByClass(classId),
        statsApi.getClassStats(classId),
      ]);
      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.studentMatricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter((req) => req.subject === subjectFilter);
    }

    setFilteredRequests(filtered);
  };

  const uniqueSubjects = Array.from(new Set(requests.map((r) => r.subject)));

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
              <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
              <p className="text-sm text-muted-foreground">
                Gestion des requêtes de la classe
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

        {/* Filters */}
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_progress">En traitement</SelectItem>
                <SelectItem value="validated">Validée</SelectItem>
                <SelectItem value="rejected">Rejetée</SelectItem>
                <SelectItem value="transmitted">Transmise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les matières" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Requêtes ({filteredRequests.length})
            </h2>
          </div>
          <RequestsTable
            requests={filteredRequests}
            onViewDetails={setSelectedRequest}
          />
        </div>
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

export default AdminDashboard;
