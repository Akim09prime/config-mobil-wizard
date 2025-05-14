
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  category: string;
  price: number;
  thickness: number;
  dimensions: {
    width: number;
    height: number;
  };
}

const MaterialItems: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const materialsData = getAll<Material>(StorageKeys.MATERIALS);
        setMaterials(materialsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading materials:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca materialele',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const handleAddMaterial = () => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru adăugare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de adăugare va fi implementată în versiunea următoare'
    });
  };

  const handleEditMaterial = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteMaterial = (id: string) => {
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
        <h1 className="text-3xl font-bold">Materiale</h1>
        <Button onClick={handleAddMaterial} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Adaugă Material
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Grosime (mm)</TableHead>
                <TableHead>Dimensiuni (mm)</TableHead>
                <TableHead>Preț / m²</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nu există materiale definite
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell>{material.thickness}</TableCell>
                    <TableCell>{material.dimensions.width} x {material.dimensions.height}</TableCell>
                    <TableCell>{material.price} RON</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMaterial(material.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
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

export default MaterialItems;
