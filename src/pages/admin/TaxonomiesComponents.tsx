
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StorageKeys, getTaxonomies, updateTaxonomies, exportCategoryData, importCategoryData } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusIcon, TrashIcon, FolderPlus, Upload, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ComponentCategory {
  id: string;
  name: string;
  image?: string;
  subcategories: ComponentSubcategory[];
}

interface ComponentSubcategory {
  id: string;
  name: string;
  image?: string;
  subcategories?: ComponentSubcategory[];
}

const TaxonomiesComponents: React.FC = () => {
  const [componentCategories, setComponentCategories] = useState<ComponentCategory[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedParentSubcategory, setSelectedParentSubcategory] = useState<string | null>(null);
  const [newSubcategory, setNewSubcategory] = useState<string>('');
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ComponentCategory | null>(null);
  const [editingParentPath, setEditingParentPath] = useState<string[]>([]);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [importData, setImportData] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTaxonomies();
  }, []);

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
      image: categoryImage || undefined,
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
      setCategoryImage(null);
    } catch (error) {
      console.error('Error saving component category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva categoria',
        variant: 'destructive'
      });
    }
  };

  const openSubcategoryDialog = (categoryId: string, parentSubcategoryId: string | null = null, path: string[] = []) => {
    setSelectedCategory(categoryId);
    setSelectedParentSubcategory(parentSubcategoryId);
    setNewSubcategory('');
    setShowSubcategoryDialog(true);
    setCategoryImage(null);
    setEditingParentPath(path);
    
    // Find the category to set for context
    const category = componentCategories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategory(category);
    }
  };

  const findSubcategory = (subcategories: ComponentSubcategory[], subcategoryId: string): ComponentSubcategory | null => {
    for (const subcategory of subcategories) {
      if (subcategory.id === subcategoryId) {
        return subcategory;
      }
      if (subcategory.subcategories && subcategory.subcategories.length > 0) {
        const foundSubcategory = findSubcategory(subcategory.subcategories, subcategoryId);
        if (foundSubcategory) {
          return foundSubcategory;
        }
      }
    }
    return null;
  };

  const addSubcategoryToParent = (
    subcategories: ComponentSubcategory[],
    parentId: string | null,
    newSubcategory: ComponentSubcategory
  ): ComponentSubcategory[] => {
    if (parentId === null) {
      return [...subcategories, newSubcategory];
    }

    return subcategories.map(subcategory => {
      if (subcategory.id === parentId) {
        return {
          ...subcategory,
          subcategories: [...(subcategory.subcategories || []), newSubcategory]
        };
      }
      if (subcategory.subcategories && subcategory.subcategories.length > 0) {
        return {
          ...subcategory,
          subcategories: addSubcategoryToParent(subcategory.subcategories, parentId, newSubcategory)
        };
      }
      return subcategory;
    });
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
        const newSubcategoryObj = {
          id: `subcat_${Date.now()}`,
          name: newSubcategory.trim(),
          image: categoryImage || undefined,
          subcategories: []
        };

        return {
          ...category,
          subcategories: addSubcategoryToParent(
            category.subcategories || [],
            selectedParentSubcategory,
            newSubcategoryObj
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
        description: 'Subcategorie adăugată cu succes'
      });
      setShowSubcategoryDialog(false);
      setNewSubcategory('');
      setCategoryImage(null);
      setEditingCategory(null);
      setSelectedParentSubcategory(null);
      setEditingParentPath([]);
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

  const deleteSubcategoryRecursive = (
    subcategories: ComponentSubcategory[],
    subcategoryId: string
  ): ComponentSubcategory[] => {
    return subcategories
      .filter(subcategory => subcategory.id !== subcategoryId)
      .map(subcategory => {
        if (subcategory.subcategories && subcategory.subcategories.length > 0) {
          return {
            ...subcategory,
            subcategories: deleteSubcategoryRecursive(subcategory.subcategories, subcategoryId)
          };
        }
        return subcategory;
      });
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const updatedCategories = componentCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: deleteSubcategoryRecursive(category.subcategories, subcategoryId)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderSubcategories = (
    categoryId: string,
    subcategories: ComponentSubcategory[],
    level: number = 0,
    parentPath: string[] = []
  ) => {
    if (!subcategories.length) return null;

    const toggleExpand = (id: string) => {
      setExpandedCategories(prevState => {
        const newState = new Set(prevState);
        if (newState.has(id)) {
          newState.delete(id);
        } else {
          newState.add(id);
        }
        return newState;
      });
    };

    return (
      <div className={`ml-${level * 4} mt-2`}>
        {subcategories.map(subcategory => {
          const isExpanded = expandedCategories.has(subcategory.id);
          const hasSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;
          const currentPath = [...parentPath, subcategory.name];
          
          return (
            <div key={subcategory.id} className="mb-2">
              <div className="flex items-center p-2 border rounded-md bg-muted/50">
                {hasSubcategories && (
                  <button 
                    onClick={() => toggleExpand(subcategory.id)} 
                    className="mr-2 text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
                <div className="flex-grow flex items-center">
                  {subcategory.image && (
                    <img 
                      src={subcategory.image} 
                      alt={subcategory.name}
                      className="w-8 h-8 object-cover mr-2 rounded"
                    />
                  )}
                  <span className="flex-grow">{subcategory.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {currentPath.join(' > ')}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSubcategoryDialog(categoryId, subcategory.id, currentPath)}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubcategory(categoryId, subcategory.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {isExpanded && hasSubcategories && renderSubcategories(
                categoryId,
                subcategory.subcategories || [],
                level + 1,
                currentPath
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleExportCategory = (categoryId: string) => {
    try {
      const category = componentCategories.find(cat => cat.id === categoryId);
      if (category) {
        const exportData = exportCategoryData('componentCategories', category.name);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `componenta-${category.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Succes',
          description: `Categoria ${category.name} a fost exportată cu succes`
        });
      }
    } catch (error) {
      console.error('Error exporting category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut exporta categoria',
        variant: 'destructive'
      });
    }
  };

  const handleImportData = () => {
    try {
      const success = importCategoryData(importData);
      if (success) {
        toast({
          title: 'Succes',
          description: 'Date importate cu succes'
        });
        loadTaxonomies();
        setShowImportDialog(false);
        setImportData('');
      } else {
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut importa datele',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: 'Eroare',
        description: 'Format invalid al datelor de import',
        variant: 'destructive'
      });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportData(event.target.result as string);
        }
      };
      reader.readAsText(file);
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
        <h1 className="text-3xl font-bold mb-4">Taxonomii - Componente</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowImportDialog(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Adaugă Categorie Nouă</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="category-name">Nume Categorie</Label>
                <Input
                  id="category-name"
                  placeholder="Nume categorie nouă"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="category-image">Imagine (opțional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="category-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setCategoryImage)}
                  />
                  {categoryImage && (
                    <div className="h-10 w-10 rounded border overflow-hidden">
                      <img 
                        src={categoryImage} 
                        alt="Preview" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleAddCategory} className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" />
                Adaugă Categorie
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Categorii de Componente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {componentCategories.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Nu există categorii definite
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {componentCategories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:bg-accent/10 px-3 py-2 rounded-md">
                      <div className="flex items-center">
                        {category.image && (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-8 h-8 object-cover mr-2 rounded"
                          />
                        )}
                        <span>{category.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <div className="flex justify-between mb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSubcategoryDialog(category.id)}
                        >
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Adaugă Subcategorie
                        </Button>
                        <div className="space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportCategory(category.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Șterge
                          </Button>
                        </div>
                      </div>
                      
                      {category.subcategories.length === 0 ? (
                        <div className="text-muted-foreground italic px-4 py-2">
                          Nicio subcategorie
                        </div>
                      ) : (
                        renderSubcategories(category.id, category.subcategories, 0, [category.name])
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Subcategorie</DialogTitle>
            <DialogDescription>
              {editingCategory && (
                <>
                  Adăugați o nouă subcategorie 
                  {selectedParentSubcategory ? " în " : " la categoria "}
                  <strong>
                    {editingParentPath.length ? editingParentPath.join(' > ') : editingCategory.name}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Nume Subcategorie</Label>
              <Input
                id="subcategory-name"
                placeholder="Introduceți numele subcategoriei"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-image">Imagine (opțional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subcategory-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setCategoryImage)}
                />
                {categoryImage && (
                  <div className="h-10 w-10 rounded border overflow-hidden">
                    <img 
                      src={categoryImage} 
                      alt="Preview" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
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

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Categorie</DialogTitle>
            <DialogDescription>
              Selectați un fișier JSON pentru a importa o categorie și datele aferente
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Fișier JSON</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportFile}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Anulează
            </Button>
            <Button onClick={handleImportData} disabled={!importData}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxonomiesComponents;
