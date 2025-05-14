
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Cabinet {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  price: number;
  image: string | null;
}

const CabinetItems: React.FC = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCabinets = async () => {
      try {
        const cabinetsData = getAll<Cabinet>(StorageKeys.CABINETS);
        setCabinets(cabinetsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading cabinets:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca corpurile mobilier',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    loadCabinets();
  }, []);

  const handleAddCabinet = () => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru adăugare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de adăugare va fi implementată în versiunea următoare'
    });
  };

  const handleEditCabinet = (id: string) => {
    // În versiunea completă, aici ar trebui să deschideți un modal pentru editare
    toast({
      title: 'Notă',
      description: 'Funcționalitatea de editare va fi implementată în versiunea următoare'
    });
  };

  const handleDeleteCabinet = (id: string) => {
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
        <h1 className="text-3xl font-bold">Corpuri Mobilier</h1>
        <Button onClick={handleAddCabinet} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Adaugă Corp
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagine</TableHead>
                <TableHead>Nume</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Dimensiuni (mm)</TableHead>
                <TableHead>Preț</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cabinets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nu există corpuri de mobilier definite
                  </TableCell>
                </TableRow>
              ) : (
                cabinets.map((cabinet) => (
                  <TableRow key={cabinet.id}>
                    <TableCell>
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                        {cabinet.image ? (
                          <img 
                            src={cabinet.image} 
                            alt={cabinet.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center">
                            Fără imagine
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{cabinet.name}</TableCell>
                    <TableCell>{cabinet.category} / {cabinet.subcategory}</TableCell>
                    <TableCell>{cabinet.dimensions.width} x {cabinet.dimensions.height} x {cabinet.dimensions.depth}</TableCell>
                    <TableCell>{cabinet.price} RON</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCabinet(cabinet.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCabinet(cabinet.id)}
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

export default CabinetItems;
