
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getTaxonomies, updateTaxonomies } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface MaterialType {
  id: string;
  name: string;
}

const TaxonomiesMaterials: React.FC = () => {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [newMaterialType, setNewMaterialType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const taxonomiesData = getTaxonomies();
        if (taxonomiesData && taxonomiesData.materialTypes) {
          setMaterialTypes(taxonomiesData.materialTypes);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading material types:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca tipurile de materiale',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    loadTaxonomies();
  }, []);

  const handleAddMaterialType = () => {
    if (!newMaterialType.trim()) {
      toast({
        title: 'Eroare',
        description: 'Introduceți un nume pentru tipul de material',
        variant: 'destructive'
      });
      return;
    }

    const newTypeObj = {
      id: `mat_${Date.now()}`,
      name: newMaterialType.trim()
    };

    const updatedTypes = [...materialTypes, newTypeObj];
    setMaterialTypes(updatedTypes);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        materialTypes: updatedTypes
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Tip de material adăugat cu succes'
      });
      setNewMaterialType('');
    } catch (error) {
      console.error('Error saving material type:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva tipul de material',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMaterialType = (id: string) => {
    const updatedTypes = materialTypes.filter(type => type.id !== id);
    setMaterialTypes(updatedTypes);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        materialTypes: updatedTypes
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Tip de material șters cu succes'
      });
    } catch (error) {
      console.error('Error deleting material type:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge tipul de material',
        variant: 'destructive'
      });
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
      <h1 className="text-3xl font-bold mb-8">Taxonomii - Materiale</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tipuri de Materiale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Nume tip material nou"
                value={newMaterialType}
                onChange={(e) => setNewMaterialType(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAddMaterialType} className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" />
                Adaugă
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume Tip Material</TableHead>
                  <TableHead className="w-24">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      Nu există tipuri de materiale definite
                    </TableCell>
                  </TableRow>
                ) : (
                  materialTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>{type.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMaterialType(type.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxonomiesMaterials;
