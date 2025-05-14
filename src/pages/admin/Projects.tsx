
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon, FileIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  useEffect(() => {
    const loadProjects = async () => {
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

    loadProjects();
  }, []);

  const handleAddProject = () => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru adăugare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de adăugare va fi implementată în versiunea următoare'
    });
  };

  const handleEditProject = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteProject = (id: string) => {
    // În versiunea completă, aici ar trebui să confirmați și apoi să ștergeți
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de ștergere va fi implementată în versiunea următoare'
    });
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
    </div>
  );
};

export default Projects;
