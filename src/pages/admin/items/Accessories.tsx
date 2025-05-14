
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll, remove } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import AddAccessoryModal from '@/components/modals/AddAccessoryModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Accessory {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const AccessoryItems: React.FC = () => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [accessoryToDelete, setAccessoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadAccessories();
  }, []);

  const loadAccessories = () => {
    try {
      const accessoriesData = getAll<Accessory>(StorageKeys.ACCESSORIES);
      setAccessories(accessoriesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading accessories:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca accesoriile',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleAddAccessory = () => {
    setIsAddModalOpen(true);
  };

  const handleEditAccessory = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteAccessory = (id: string) => {
    setAccessoryToDelete(id);
  };

  const confirmDelete = () => {
    if (accessoryToDelete) {
      try {
        const success = remove(StorageKeys.ACCESSORIES, accessoryToDelete);
        if (success) {
          toast({
            title: 'Succes',
            description: 'Accesoriul a fost șters cu succes'
          });
          loadAccessories();
        } else {
          toast({
            title: 'Eroare',
            description: 'Nu s-a putut șterge accesoriul',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error deleting accessory:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut șterge accesoriul',
          variant: 'destructive'
        });
      }
      setAccessoryToDelete(null);
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
        <h1 className="text-3xl font-bold">Accesorii</h1>
        <Button onClick={handleAddAccessory} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Adaugă Accesoriu
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Preț unitar</TableHead>
                <TableHead>Stoc</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nu există accesorii definite
                  </TableCell>
                </TableRow>
              ) : (
                accessories.map((accessory) => (
                  <TableRow key={accessory.id}>
                    <TableCell className="font-medium">{accessory.name}</TableCell>
                    <TableCell>{accessory.category}</TableCell>
                    <TableCell>{accessory.price} RON</TableCell>
                    <TableCell>{accessory.stock} buc</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccessory(accessory.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAccessory(accessory.id)}
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

      <AddAccessoryModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAccessoryAdded={loadAccessories}
      />

      <AlertDialog open={accessoryToDelete !== null} onOpenChange={() => setAccessoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți acest accesoriu? Această acțiune nu poate fi anulată.
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

export default AccessoryItems;
