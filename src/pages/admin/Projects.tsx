
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll, remove, getTaxonomies } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import AddProjectModal from '@/components/modals/AddProjectModal';
import EditProjectModal from '@/components/modals/EditProjectModal';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

// Using the global Cabinet interface defined in vite-env.d.ts
interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
  category?: string;
  subcategory?: string;
  cabinets?: Cabinet[]; // Using the global Cabinet interface
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [taxonomies, setTaxonomies] = useState<{
    categories: {id: string; name: string; subcategories: {id: string; name: string;}[]}[];
  }>({ categories: [] });

  useEffect(() => {
    loadProjects();
    loadTaxonomies();
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

  const loadTaxonomies = () => {
    try {
      const allTaxonomies = getTaxonomies();
      setTaxonomies({ categories: allTaxonomies.categories });
    } catch (error) {
      console.error('Error loading taxonomies:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca taxonomiile',
        variant: 'destructive'
      });
    }
  };

  const handleAddProject = () => {
    setIsAddModalOpen(true);
  };

  const handleEditProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectToEdit(project);
      setIsEditModalOpen(true);
    } else {
      toast({
        title: 'Eroare',
        description: 'Proiectul nu a fost găsit',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      try {
        remove(StorageKeys.PROJECTS, projectToDelete);
        toast({
          title: 'Succes',
          description: 'Proiectul a fost șters cu succes'
        });
        loadProjects();
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
        <div>
          <Button onClick={handleAddProject} className="flex items-center">
            <PlusIcon className="mr-2 h-4 w-4" />
            Proiect Nou
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume Proiect</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Nu există proiecte definite
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      {project.category && (
                        <span>
                          {project.category}
                          {project.subcategory && ` / ${project.subcategory}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{project.date}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      {project.total !== null && project.total !== undefined ? `${project.total} RON` : '0 RON'}
                      {project.cabinets && project.cabinets.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({project.cabinets.length} corpuri)
                        </span>
                      )}
                    </TableCell>
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
        categories={taxonomies.categories}
      />

      <EditProjectModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        onProjectUpdated={loadProjects}
        project={projectToEdit}
        categories={taxonomies.categories}
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
