
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll, remove } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AddProjectModal from '@/components/modals/AddProjectModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    try {
      const projectsData = getAll<Project>(StorageKeys.PROJECTS);
      setProjects(projectsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca proiectele',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setIsAddModalOpen(true);
  };

  const handleEditProject = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      try {
        const success = remove(StorageKeys.PROJECTS, projectToDelete);
        if (success) {
          toast({
            title: 'Succes',
            description: 'Proiectul a fost șters cu succes'
          });
          loadProjects();
        } else {
          toast({
            title: 'Eroare',
            description: 'Nu s-a putut șterge proiectul',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut șterge proiectul',
          variant: 'destructive'
        });
      }
      setProjectToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Schița</Badge>;
      case 'active':
        return <Badge variant="default">Activ</Badge>;
      case 'completed':
        return <Badge variant="success">Finalizat</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Anulat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Proiecte</h1>
        <Button onClick={handleAddProject} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Adaugă Proiect
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume Proiect</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nu există proiecte definite
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>{project.date}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{project.total} RON</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddProjectModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onProjectAdded={loadProjects}
      />

      <AlertDialog open={projectToDelete !== null} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți acest proiect? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulare</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
