import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { getTaxonomies, updateTaxonomies, Category, Subcategory } from '@/services/storage';
import { PlusIcon, TrashIcon, MoveVertical, Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface TaxonomyState {
  accessoryCategories: Category[];
}

const TaxonomiesAccessories: React.FC = () => {
  const [taxonomies, setTaxonomies] = useState<{ accessoryCategories: Category[] }>({ accessoryCategories: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState<boolean>(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState<boolean>(false);
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState<boolean>(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');
  const [editSubcategoryId, setEditSubcategoryId] = useState<string | null>(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState<string>('');

  useEffect(() => {
    loadTaxonomies();
  }, []);

  const loadTaxonomies = () => {
    try {
      const data = getTaxonomies();
      if (data && data.accessoryCategories) {
        setTaxonomies({ accessoryCategories: data.accessoryCategories });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading taxonomies:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca taxonomiile',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      toast({
        title: 'Eroare',
        description: 'Numele categoriei nu poate fi gol',
        variant: 'destructive',
      });
      return;
    }

    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: categoryName.trim(),
      subcategories: [],
    };

    const updatedAccessoryCategories = [...taxonomies.accessoryCategories, newCategory];
    const updatedTaxonomies = {
      ...getTaxonomies(), // Get the full taxonomy object first
      accessoryCategories: updatedAccessoryCategories,
    };

    try {
      updateTaxonomies(updatedTaxonomies);
      setTaxonomies({ ...taxonomies, accessoryCategories: updatedAccessoryCategories });
      setCategoryName('');
      setIsAddCategoryOpen(false);
      toast({
        title: 'Succes',
        description: 'Categoria a fost adăugată',
      });
    } catch (error) {
      console.error('Error saving taxonomy:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva categoria',
        variant: 'destructive',
      });
    }
  };

  const handleAddSubcategory = () => {
    if (!selectedCategoryId) {
      toast({
        title: 'Eroare',
        description: 'Selectați o categorie',
        variant: 'destructive',
      });
      return;
    }

    if (!subcategoryName.trim()) {
      toast({
        title: 'Eroare',
        description: 'Numele subcategoriei nu poate fi gol',
        variant: 'destructive',
      });
      return;
    }

    const updatedTaxonomies = { ...taxonomies };
    const categoryIndex = updatedTaxonomies.accessoryCategories.findIndex(
      (c) => c.id === selectedCategoryId
    );

    if (categoryIndex !== -1) {
      const newSubcategory: Subcategory = {
        id: `subcat_${Date.now()}`,
        name: subcategoryName.trim(),
      };

      updatedTaxonomies.accessoryCategories[categoryIndex].subcategories.push(newSubcategory);

      try {
        updateTaxonomies(updatedTaxonomies);
        setTaxonomies(updatedTaxonomies);
        setSubcategoryName('');
        setIsAddSubcategoryOpen(false);
        toast({
          title: 'Succes',
          description: 'Subcategoria a fost adăugată',
        });
      } catch (error) {
        console.error('Error saving taxonomy:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut salva subcategoria',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedTaxonomies = {
      ...taxonomies,
      accessoryCategories: taxonomies.accessoryCategories.filter((c) => c.id !== categoryId),
    };

    try {
      updateTaxonomies(updatedTaxonomies);
      setTaxonomies(updatedTaxonomies);
      toast({
        title: 'Succes',
        description: 'Categoria a fost ștearsă',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge categoria',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const updatedTaxonomies = { ...taxonomies };
    const categoryIndex = updatedTaxonomies.accessoryCategories.findIndex(
      (c) => c.id === categoryId
    );

    if (categoryIndex !== -1) {
      updatedTaxonomies.accessoryCategories[categoryIndex].subcategories = 
        updatedTaxonomies.accessoryCategories[categoryIndex].subcategories.filter(
          (sc) => sc.id !== subcategoryId
        );

      try {
        updateTaxonomies(updatedTaxonomies);
        setTaxonomies(updatedTaxonomies);
        toast({
          title: 'Succes',
          description: 'Subcategoria a fost ștearsă',
        });
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut șterge subcategoria',
          variant: 'destructive',
        });
      }
    }
  };

  const openEditCategory = (category: Category) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.name);
    setIsEditCategoryOpen(true);
  };

  const openEditSubcategory = (categoryId: string, subcategory: Subcategory) => {
    setSelectedCategoryId(categoryId);
    setEditSubcategoryId(subcategory.id);
    setEditSubcategoryName(subcategory.name);
    setIsEditSubcategoryOpen(true);
  };

  const handleEditCategory = () => {
    if (!editCategoryId || !editCategoryName.trim()) return;

    const updatedTaxonomies = { ...taxonomies };
    const categoryIndex = updatedTaxonomies.accessoryCategories.findIndex(
      (c) => c.id === editCategoryId
    );

    if (categoryIndex !== -1) {
      updatedTaxonomies.accessoryCategories[categoryIndex].name = editCategoryName.trim();

      try {
        updateTaxonomies(updatedTaxonomies);
        setTaxonomies(updatedTaxonomies);
        setIsEditCategoryOpen(false);
        toast({
          title: 'Succes',
          description: 'Categoria a fost actualizată',
        });
      } catch (error) {
        console.error('Error updating category:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut actualiza categoria',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditSubcategory = () => {
    if (!selectedCategoryId || !editSubcategoryId || !editSubcategoryName.trim()) return;

    const updatedTaxonomies = { ...taxonomies };
    const categoryIndex = updatedTaxonomies.accessoryCategories.findIndex(
      (c) => c.id === selectedCategoryId
    );

    if (categoryIndex !== -1) {
      const subcatIndex = updatedTaxonomies.accessoryCategories[categoryIndex].subcategories.findIndex(
        (sc) => sc.id === editSubcategoryId
      );

      if (subcatIndex !== -1) {
        updatedTaxonomies.accessoryCategories[categoryIndex].subcategories[subcatIndex].name = 
          editSubcategoryName.trim();

        try {
          updateTaxonomies(updatedTaxonomies);
          setTaxonomies(updatedTaxonomies);
          setIsEditSubcategoryOpen(false);
          toast({
            title: 'Succes',
            description: 'Subcategoria a fost actualizată',
          });
        } catch (error) {
          console.error('Error updating subcategory:', error);
          toast({
            title: 'Eroare',
            description: 'Nu s-a putut actualiza subcategoria',
            variant: 'destructive',
          });
        }
      }
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
        <h1 className="text-3xl font-bold">Categorii Accesorii</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddCategoryOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Adaugă Categorie
          </Button>
          <Button 
            onClick={() => setIsAddSubcategoryOpen(true)}
            variant="outline"
            disabled={taxonomies.accessoryCategories.length === 0}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Adaugă Subcategorie
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taxonomies.accessoryCategories.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nu există categorii definite
            </CardContent>
          </Card>
        ) : (
          taxonomies.accessoryCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/20 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditCategory(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge variant="outline" className="mt-1">{category.subcategories.length} subcategorii</Badge>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                {category.subcategories.length === 0 ? (
                  <div className="text-center text-muted-foreground py-2">
                    Nu există subcategorii definite
                  </div>
                ) : (
                  <div className="space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <div 
                        key={subcategory.id} 
                        className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50"
                      >
                        <span>{subcategory.name}</span>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditSubcategory(category.id, subcategory)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="p-4 bg-muted/10 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setIsAddSubcategoryOpen(true);
                  }}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Adaugă Subcategorie
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Categorie Nouă</DialogTitle>
            <DialogDescription>
              Introduceți numele pentru noua categorie de accesorii.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nume Categorie</Label>
              <Input
                id="categoryName"
                placeholder="Ex: Balamale, Mânere, etc."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleAddCategory}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubcategoryOpen} onOpenChange={setIsAddSubcategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Subcategorie</DialogTitle>
            <DialogDescription>
              Selectați categoria și introduceți numele subcategoriei.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categorySelect">Categorie</Label>
              <select
                id="categorySelect"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">Selectează categoria</option>
                {taxonomies.accessoryCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategoryName">Nume Subcategorie</Label>
              <Input
                id="subcategoryName"
                placeholder="Ex: Standard, Premium, etc."
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                disabled={!selectedCategoryId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubcategoryOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleAddSubcategory} disabled={!selectedCategoryId}>
              Adaugă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editează Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">Nume Categorie</Label>
              <Input
                id="editCategoryName"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleEditCategory}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubcategoryOpen} onOpenChange={setIsEditSubcategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editează Subcategoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editSubcategoryName">Nume Subcategorie</Label>
              <Input
                id="editSubcategoryName"
                value={editSubcategoryName}
                onChange={(e) => setEditSubcategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubcategoryOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleEditSubcategory}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxonomiesAccessories;
