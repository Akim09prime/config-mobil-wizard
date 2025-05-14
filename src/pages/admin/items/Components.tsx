
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
}

const ComponentItems: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        // Încercăm să încărcăm componentele, dar s-ar putea să nu existe încă
        const componentsData = getAll<Component>(StorageKeys.COMPONENTS);
        setComponents(componentsData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading components:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca componentele',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    loadComponents();
  }, []);

  const handleAddComponent = () => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru adăugare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de adăugare va fi implementată în versiunea următoare'
    });
  };

  const handleEditComponent = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteComponent = (id: string) => {
    // În versiunea completă, aici ar trebui să confirmați și apoi să ștergeți
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de ștergere va fi implementată în versiunea următoare'
    });
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
        <h1 className="text-3xl font-bold">Componente</h1>
        <Button onClick={handleAddComponent} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Adaugă Componentă
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Preț</TableHead>
                <TableHead>Stoc</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nu există componente definite
                  </TableCell>
                </TableRow>
              ) : (
                components.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell>{component.category}</TableCell>
                    <TableCell>{component.price} RON</TableCell>
                    <TableCell>{component.stock || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditComponent(component.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
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

export default ComponentItems;
