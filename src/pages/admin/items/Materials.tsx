
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll, remove } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import AddMaterialModal from '@/components/modals/AddMaterialModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Material {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
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
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
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

  const handleAddMaterial = () => {
    setIsAddModalOpen(true);
  };

  const handleEditMaterial = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterialToDelete(id);
  };

  const confirmDelete = () => {
    if (materialToDelete) {
      try {
        const success = remove(StorageKeys.MATERIALS, materialToDelete);
        if (success) {
          toast({
            title: 'Succes',
            description: 'Materialul a fost șters cu succes'
          });
          loadMaterials();
        } else {
          toast({
            title: 'Eroare',
            description: 'Nu s-a putut șterge materialul',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error deleting material:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut șterge materialul',
          variant: 'destructive'
        });
      }
      setMaterialToDelete(null);
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
                <TableHead>Subcategorie</TableHead>
                <TableHead>Grosime (mm)</TableHead>
                <TableHead>Dimensiuni (mm)</TableHead>
                <TableHead>Preț / m²</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Nu există materiale definite
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell>{material.subcategory || '-'}</TableCell>
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

      <AddMaterialModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onMaterialAdded={loadMaterials}
      />

      <AlertDialog open={materialToDelete !== null} onOpenChange={() => setMaterialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți acest material? Această acțiune nu poate fi anulată.
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

export default MaterialItems;
