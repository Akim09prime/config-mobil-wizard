
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { getProjects, StorageKeys, remove, create } from '@/services/storage';

interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
  cabinets?: any[];
}

const statusColorMap = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusTranslations = {
  draft: 'Schiță',
  active: 'Activ',
  completed: 'Finalizat',
  cancelled: 'Anulat',
};

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Nu s-au putut încărca proiectele');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = (id: string) => {
    try {
      const success = remove(StorageKeys.PROJECTS, id);
      if (success) {
        toast.success('Proiectul a fost șters cu succes');
        fetchProjects();
      } else {
        toast.error('Nu s-a putut șterge proiectul');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Nu s-a putut șterge proiectul');
    }
  };

  const handleClone = (project: Project) => {
    try {
      const clonedProject = {
        ...project,
        id: `proj_${Date.now()}`,
        name: `${project.name} (Copie)`,
        date: new Date().toLocaleDateString('ro-RO'),
        status: 'draft' as const,
      };

      create(StorageKeys.PROJECTS, clonedProject);
      toast.success('Proiectul a fost clonat cu succes');
      fetchProjects();
    } catch (error) {
      console.error('Error cloning project:', error);
      toast.error('Nu s-a putut clona proiectul');
    }
  };

  const handleOpen = (id: string) => {
    navigate(`/project/edit/${id}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proiecte</h1>
        <Button onClick={() => navigate('/project/new')}>Proiect Nou</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Nu există proiecte</h2>
          <p className="mb-6 text-muted-foreground">Creați primul proiect pentru a începe.</p>
          <Button onClick={() => navigate('/project/new')}>Creează Proiect Nou</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <Badge className={statusColorMap[project.status]}>
                    {statusTranslations[project.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-medium">{project.client}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{project.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">
                      {project.total !== null && project.total !== undefined
                        ? `${project.total.toLocaleString('ro-RO')} RON`
                        : '0 RON'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button size="sm" variant="outline" onClick={() => handleOpen(project.id)}>
                  Deschide
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleClone(project)}>
                    Clonează
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        Șterge
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmă ștergerea</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sunteți sigur că doriți să ștergeți proiectul "{project.name}"? Această acțiune nu poate fi anulată.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(project.id)}>
                          Șterge
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
