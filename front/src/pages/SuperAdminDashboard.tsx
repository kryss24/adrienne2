import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Request, DashboardStats, User, Class } from '@/types';
import { requestsApi, statsApi, usersApi, classesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { RequestsTable } from '@/components/RequestsTable';
import { RequestDetailsModal } from '@/components/RequestDetailsModal';
import { UserEditModal } from '@/components/UserEditModal';
import { ClassEditModal } from '@/components/ClassEditModal';
import { StatsCard } from '@/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Users, GraduationCap, TrendingUp, Edit, Trash2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, statsData, usersData, classesData] = await Promise.all([
        requestsApi.getAllRequests(),
        statsApi.getGlobalStats(),
        usersApi.getAllUsers(),
        classesApi.getAllClasses(),
      ]);
      setRequests(requestsData);
      setStats(statsData);
      setUsers(usersData);
      setClasses(classesData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      await usersApi.deleteUser(userToDelete.id);
      toast.success(`${userToDelete.firstName} ${userToDelete.lastName} a été supprimé`);
      setUserToDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    
    setDeleting(true);
    try {
      await classesApi.deleteClass(classToDelete.id);
      toast.success(`La classe "${classToDelete.name}" a été supprimée`);
      setClassToDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
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

  const adminUsers = users.filter((u) => u.role === 'admin');
  const studentUsers = users.filter((u) => u.role === 'student');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Super Administration</h1>
              <p className="text-sm text-muted-foreground">
                Vue globale du système
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Global Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total requêtes"
              value={stats.total}
              icon={FileText}
              iconColor="text-primary"
            />
            <StatsCard
              title="Classes"
              value={classes.length}
              icon={GraduationCap}
              iconColor="text-info"
            />
            <StatsCard
              title="Utilisateurs"
              value={users.length}
              icon={Users}
              iconColor="text-success"
            />
            <StatsCard
              title="Temps moyen"
              value={`${stats.avgProcessingTime}h`}
              icon={TrendingUp}
              iconColor="text-warning"
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="requests">Requêtes</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les requêtes</CardTitle>
                <CardDescription>
                  Vue d'ensemble de toutes les requêtes du système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsTable
                  requests={requests}
                  onViewDetails={setSelectedRequest}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des classes</CardTitle>
                    <CardDescription>
                      {classes.length} classe(s) enregistrée(s)
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingClass(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une classe
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.map((classItem) => {
                    const classAdmin = adminUsers.find(a => a.id === classItem.adminId);
                    return (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold">{classItem.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {classItem.studentCount} étudiant(s)
                            {classAdmin && ` • Admin: ${classAdmin.firstName} ${classAdmin.lastName}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedClass(classItem)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setClassToDelete(classItem)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admins */}
              <Card>
                <CardHeader>
                  <CardTitle>Administrateurs</CardTitle>
                  <CardDescription>
                    {adminUsers.length} administrateur(s) de classe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminUsers.map((adminUser) => (
                      <div
                        key={adminUser.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {adminUser.firstName} {adminUser.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {adminUser.matricule} • {adminUser.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(adminUser)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setUserToDelete(adminUser)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Students */}
              <Card>
                <CardHeader>
                  <CardTitle>Étudiants</CardTitle>
                  <CardDescription>
                    {studentUsers.length} étudiant(s) enregistré(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {studentUsers.map((studentUser) => (
                      <div
                        key={studentUser.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {studentUser.firstName} {studentUser.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {studentUser.matricule}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(studentUser)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setUserToDelete(studentUser)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdate={loadData}
      />

      {/* User Edit Modal */}
      <UserEditModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdate={loadData}
        classes={classes}
      />

      {/* Class Edit Modal */}
      <ClassEditModal
        classItem={selectedClass}
        open={!!selectedClass || isCreatingClass}
        onClose={() => {
          setSelectedClass(null);
          setIsCreatingClass(false);
        }}
        onUpdate={loadData}
        admins={adminUsers}
        isCreating={isCreatingClass}
      />

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold">
                {userToDelete?.firstName} {userToDelete?.lastName}
              </span>{' '}
              ({userToDelete?.role === 'admin' ? 'Administrateur' : 'Étudiant'}) ?
              <br />
              <br />
              Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la classe{' '}
              <span className="font-semibold">"{classToDelete?.name}"</span> ?
              <br />
              <br />
              Cette action est irréversible. Les étudiants de cette classe ne seront pas supprimés mais ne seront plus assignés à cette classe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdminDashboard;
