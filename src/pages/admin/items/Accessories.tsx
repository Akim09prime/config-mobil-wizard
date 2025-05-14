
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';

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

  useEffect(() => {
    const loadAccessories = async () => {
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

    loadAccessories();
  }, []);

  const handleAddAccessory = () => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru adăugare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de adăugare va fi implementată în versiunea următoare'
    });
  };

  const handleEditAccessory = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteAccessory = (id: string) => {
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
    </div>
  );
};

export default AccessoryItems;
