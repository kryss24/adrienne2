import { useState, useEffect } from 'react';
import { Class, User } from '@/types';
import { classesApi } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, GraduationCap, UserCog } from 'lucide-react';
import { toast } from 'sonner';

interface ClassEditModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  admins: User[];
  isCreating?: boolean;
}

export const ClassEditModal = ({
  classItem,
  open,
  onClose,
  onUpdate,
  admins,
  isCreating = false,
}: ClassEditModalProps) => {
  const [name, setName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (classItem) {
      setName(classItem.name);
      setAdminId(classItem.adminId);
    } else if (isCreating) {
      setName('');
      setAdminId('');
    }
  }, [classItem, isCreating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Le nom de la classe est requis');
      return;
    }

    if (!adminId) {
      toast.error('Veuillez sélectionner un administrateur');
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        await classesApi.createClass({ name: name.trim(), adminId });
        toast.success('Classe créée avec succès');
      } else if (classItem) {
        await classesApi.updateClass(classItem.id, { name: name.trim(), adminId });
        toast.success('Classe mise à jour avec succès');
      }
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(isCreating ? 'Erreur lors de la création' : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {isCreating ? 'Nouvelle classe' : 'Modifier la classe'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Créez une nouvelle classe et assignez-lui un administrateur.'
              : 'Modifiez les informations de la classe.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              Nom de la classe
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: L3 Informatique"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminId" className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              Administrateur
            </Label>
            <Select value={adminId} onValueChange={setAdminId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un administrateur" />
              </SelectTrigger>
              <SelectContent>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.firstName} {admin.lastName} ({admin.matricule})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreating ? 'Création...' : 'Enregistrement...'}
                </>
              ) : isCreating ? (
                'Créer'
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
