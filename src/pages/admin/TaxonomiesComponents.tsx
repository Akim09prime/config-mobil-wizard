
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getTaxonomies, updateTaxonomies } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusIcon, TrashIcon, FolderPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ComponentCategory {
  id: string;
  name: string;
  subcategories: ComponentSubcategory[];
}

interface ComponentSubcategory {
  id: string;
  name: string;
}

const TaxonomiesComponents: React.FC = () => {
  const [componentCategories, setComponentCategories] = useState<ComponentCategory[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newSubcategory, setNewSubcategory] = useState<string>('');
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ComponentCategory | null>(null);

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const taxonomiesData = getTaxonomies();
        if (taxonomiesData) {
          // Convert old format to new format with subcategories if needed
          const categories = taxonomiesData.componentCategories || [];
          const updatedCategories = categories.map((category: any) => {
            if (!category.subcategories) {
              return {
                ...category,
                subcategories: []
              };
            }
            return category;
          });
          setComponentCategories(updatedCategories);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading component categories:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca categoriile de componente',
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
      id: `comp_${Date.now()}`,
      name: newCategory.trim(),
      subcategories: []
    };

    const updatedCategories = [...componentCategories, newCategoryObj];
    setComponentCategories(updatedCategories);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        componentCategories: updatedCategories
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Categorie adăugată cu succes'
      });
      setNewCategory('');
    } catch (error) {
      console.error('Error saving component category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva categoria',
        variant: 'destructive'
      });
    }
  };

  const openSubcategoryDialog = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setNewSubcategory('');
    setShowSubcategoryDialog(true);
    
    // Find the category to set for context
    const category = componentCategories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategory(category);
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim() || !selectedCategory) {
      toast({
        title: 'Eroare',
        description: 'Introduceți un nume pentru subcategorie',
        variant: 'destructive'
      });
      return;
    }

    const updatedCategories = componentCategories.map(category => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          subcategories: [
            ...category.subcategories || [],
            {
              id: `subcat_${Date.now()}`,
              name: newSubcategory.trim()
            }
          ]
        };
      }
      return category;
    });

    setComponentCategories(updatedCategories);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        componentCategories: updatedCategories
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Subcategorie adăugată cu succes'
      });
      setShowSubcategoryDialog(false);
      setNewSubcategory('');
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva subcategoria',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = componentCategories.filter(category => category.id !== id);
    setComponentCategories(updatedCategories);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        componentCategories: updatedCategories
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Categorie ștearsă cu succes'
      });
    } catch (error) {
      console.error('Error deleting component category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge categoria',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const updatedCategories = componentCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.filter(
            subcategory => subcategory.id !== subcategoryId
          )
        };
      }
      return category;
    });

    setComponentCategories(updatedCategories);

    try {
      const taxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...taxonomies,
        componentCategories: updatedCategories
      };
      updateTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Subcategorie ștearsă cu succes'
      });
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge subcategoria',
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
      <h1 className="text-3xl font-bold mb-8">Taxonomii - Componente</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Categorii de Componente</CardTitle>
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
                  <TableHead>Subcategorii</TableHead>
                  <TableHead className="w-[180px]">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {componentCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Nu există categorii definite
                    </TableCell>
                  </TableRow>
                ) : (
                  componentCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories && category.subcategories.length === 0 ? (
                            <span className="text-muted-foreground italic">
                              Nicio subcategorie
                            </span>
                          ) : (
                            category.subcategories && category.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center bg-muted rounded-md px-2 py-1">
                                <span className="mr-1">{subcategory.name}</span>
                                <button
                                  onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSubcategoryDialog(category.id)}
                          >
                            <FolderPlus className="h-4 w-4 mr-1" />
                            Adaugă Subcategorie
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Subcategorie</DialogTitle>
            <DialogDescription>
              {editingCategory && (
                <>Adăugați o nouă subcategorie la categoria <strong>{editingCategory.name}</strong>.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="subcategory-name">Nume Subcategorie</Label>
                <Input
                  id="subcategory-name"
                  placeholder="Introduceți numele subcategoriei"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubcategoryDialog(false)}>
              Anulează
            </Button>
            <Button onClick={handleAddSubcategory}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxonomiesComponents;
