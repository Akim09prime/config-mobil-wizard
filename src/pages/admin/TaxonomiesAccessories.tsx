
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getTaxonomies, updateTaxonomies } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface AccessoryCategory {
  id: string;
  name: string;
}

const TaxonomiesAccessories: React.FC = () => {
  const [categories, setCategories] = useState<AccessoryCategory[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const taxonomiesData = getTaxonomies();
        if (taxonomiesData && taxonomiesData.accessoryCategories) {
          setCategories(taxonomiesData.accessoryCategories);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading accessory categories:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca categoriile de accesorii',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    loadTaxonomies();
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: 'Eroare',
        description: 'Introduceți un nume pentru categorie',
        variant: 'destructive'
      });
      return;
    }

    const newCategoryObj = {
      id: `acc_${Date.now()}`,
      name: newCategory.trim()
    };

    const updatedCategories = [...categories, newCategoryObj];
    setCategories(updatedCategories);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        accessoryCategories: updatedCategories
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Categorie adăugată cu succes'
      });
      setNewCategory('');
    } catch (error) {
      console.error('Error saving accessory category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva categoria',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.filter(category => category.id !== id);
    setCategories(updatedCategories);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        accessoryCategories: updatedCategories
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Categorie ștearsă cu succes'
      });
    } catch (error) {
      console.error('Error deleting accessory category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge categoria',
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
      <h1 className="text-3xl font-bold mb-8">Taxonomii - Accesorii</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Categorii de Accesorii</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Nume categorie nouă"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAddCategory} className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" />
                Adaugă
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume Categorie</TableHead>
                  <TableHead className="w-24">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      Nu există categorii definite
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
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

export default TaxonomiesAccessories;
