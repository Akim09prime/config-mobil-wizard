
import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
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
import { getTaxonomies, updateTaxonomies, Taxonomies, exportCategoryData, importCategoryData } from '@/services/storage';
import { PlusIcon, TrashIcon, Pencil, Upload, Download, FolderTree, ImageIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Utilizăm nume diferite pentru tipurile de interfață locale pentru a evita conflictele
interface TaxonomySubcategory {
  id: string;
  name: string;
  image?: string;
  subcategories?: TaxonomySubcategory[];
}

interface TaxonomyCategory {
  id: string;
  name: string;
  image?: string;
  subcategories: TaxonomySubcategory[];
}

interface TaxonomyState {
  materialTypes: TaxonomyCategory[];
}

interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'category' | 'subcategory';
}

const TaxonomiesMaterials: React.FC = () => {
  const [taxonomies, setTaxonomies] = useState<TaxonomyState>({ materialTypes: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState<boolean>(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState<boolean>(false);
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState<boolean>(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState<boolean>(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');
  const [editSubcategoryId, setEditSubcategoryId] = useState<string | null>(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState<string>('');
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [subcategoryImage, setSubcategoryImage] = useState<string | null>(null);
  const [editCategoryImage, setEditCategoryImage] = useState<string | null>(null);
  const [editSubcategoryImage, setEditSubcategoryImage] = useState<string | null>(null);
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [currentParent, setCurrentParent] = useState<TaxonomySubcategory | null>(null);
  
  const fileInputCategoryRef = useRef<HTMLInputElement>(null);
  const fileInputSubcategoryRef = useRef<HTMLInputElement>(null);
  const fileInputEditCategoryRef = useRef<HTMLInputElement>(null);
  const fileInputEditSubcategoryRef = useRef<HTMLInputElement>(null);
  const fileInputImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTaxonomies();
  }, []);

  const loadTaxonomies = () => {
    try {
      const data = getTaxonomies();
      if (data && data.materialTypes) {
        setTaxonomies({ materialTypes: data.materialTypes });
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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, setImageCallback: (value: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageCallback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImportData(reader.result as string);
    };
    reader.readAsText(file);
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

    const newCategory: TaxonomyCategory = {
      id: `mat_${Date.now()}`,
      name: categoryName.trim(),
      image: categoryImage || undefined,
      subcategories: [],
    };

    const updatedMaterialTypes = [...taxonomies.materialTypes, newCategory];
    
    // Obținem obiectul complet de taxonomii și actualizăm doar proprietatea materialTypes
    const fullTaxonomies = getTaxonomies();
    const updatedTaxonomies = {
      ...fullTaxonomies,
      materialTypes: updatedMaterialTypes,
    };

    try {
      updateTaxonomies(updatedTaxonomies);
      setTaxonomies({ materialTypes: updatedMaterialTypes });
      setCategoryName('');
      setCategoryImage(null);
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
    if (!subcategoryName.trim()) {
      toast({
        title: 'Eroare',
        description: 'Numele subcategoriei nu poate fi gol',
        variant: 'destructive',
      });
      return;
    }

    const newSubcategory: TaxonomySubcategory = {
      id: `submat_${Date.now()}`,
      name: subcategoryName.trim(),
      image: subcategoryImage || undefined,
      subcategories: [],
    };

    const updatedLocalTaxonomies = { ...taxonomies };
    
    // Adăugarea subcategoriei la categoria selectată sau la subcategoria selectată
    if (currentParentId) {
      // Adaugă subcategoria la o subcategorie existentă
      const addSubcategoryToNested = (subcategories: TaxonomySubcategory[]): TaxonomySubcategory[] => {
        return subcategories.map(subcat => {
          if (subcat.id === currentParentId) {
            return {
              ...subcat,
              subcategories: [...(subcat.subcategories || []), newSubcategory]
            };
          }
          if (subcat.subcategories && subcat.subcategories.length > 0) {
            return {
              ...subcat,
              subcategories: addSubcategoryToNested(subcat.subcategories)
            };
          }
          return subcat;
        });
      };

      // Găsim categoria care conține subcategoria părinte
      const categoryIndex = currentBreadcrumbs[0] ? 
        updatedLocalTaxonomies.materialTypes.findIndex(
          cat => cat.id === currentBreadcrumbs[0].id
        ) : -1;

      if (categoryIndex !== -1) {
        updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories = 
          addSubcategoryToNested(updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories);
      }
    } else if (selectedCategoryId) {
      // Adaugă subcategoria direct la o categorie
      const categoryIndex = updatedLocalTaxonomies.materialTypes.findIndex(
        cat => cat.id === selectedCategoryId
      );
      
      if (categoryIndex !== -1) {
        updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories.push(newSubcategory);
      }
    }

    // Obținem obiectul complet de taxonomii și actualizăm materialTypes
    const fullTaxonomies = getTaxonomies();
    const updatedTaxonomies = {
      ...fullTaxonomies,
      materialTypes: updatedLocalTaxonomies.materialTypes,
    };

    try {
      updateTaxonomies(updatedTaxonomies);
      setTaxonomies(updatedLocalTaxonomies);
      setSubcategoryName('');
      setSubcategoryImage(null);
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
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedLocalTaxonomies = {
      ...taxonomies,
      materialTypes: taxonomies.materialTypes.filter(c => c.id !== categoryId),
    };

    // Obținem obiectul complet de taxonomii și actualizăm materialTypes
    const fullTaxonomies = getTaxonomies();
    const updatedTaxonomies = {
      ...fullTaxonomies,
      materialTypes: updatedLocalTaxonomies.materialTypes,
    };

    try {
      updateTaxonomies(updatedTaxonomies);
      setTaxonomies(updatedLocalTaxonomies);
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

  const handleDeleteSubcategory = (subcategoryId: string) => {
    const updatedLocalTaxonomies = { ...taxonomies };
    
    // Ștergerea unei subcategorii, posibil imbricate
    if (currentBreadcrumbs.length > 0) {
      const deleteNestedSubcategory = (subcategories: TaxonomySubcategory[]): TaxonomySubcategory[] => {
        return subcategories.filter(subcat => subcat.id !== subcategoryId).map(subcat => {
          if (subcat.subcategories && subcat.subcategories.length > 0) {
            return {
              ...subcat,
              subcategories: deleteNestedSubcategory(subcat.subcategories)
            };
          }
          return subcat;
        });
      };

      // Găsim categoria principală
      const categoryId = currentBreadcrumbs[0].id;
      const categoryIndex = updatedLocalTaxonomies.materialTypes.findIndex(
        cat => cat.id === categoryId
      );

      if (categoryIndex !== -1) {
        updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories = 
          deleteNestedSubcategory(updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories);
      }
    } else if (selectedCategoryId) {
      // Ștergere directă din categoria principală
      const categoryIndex = updatedLocalTaxonomies.materialTypes.findIndex(
        cat => cat.id === selectedCategoryId
      );

      if (categoryIndex !== -1) {
        updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories = 
          updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories.filter(
            subcat => subcat.id !== subcategoryId
          );
      }
    }

    // Obținem obiectul complet de taxonomii și actualizăm materialTypes
    const fullTaxonomies = getTaxonomies();
    const updatedTaxonomies = {
      ...fullTaxonomies,
      materialTypes: updatedLocalTaxonomies.materialTypes,
    };

    try {
      updateTaxonomies(updatedTaxonomies);
      setTaxonomies(updatedLocalTaxonomies);
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
  };

  const openEditCategory = (category: TaxonomyCategory) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryImage(category.image || null);
    setIsEditCategoryOpen(true);
  };

  const openEditSubcategory = (subcategory: TaxonomySubcategory) => {
    setEditSubcategoryId(subcategory.id);
    setEditSubcategoryName(subcategory.name);
    setEditSubcategoryImage(subcategory.image || null);
    setIsEditSubcategoryOpen(true);
  };

  const handleEditCategory = () => {
    if (!editCategoryId || !editCategoryName.trim()) return;

    const updatedLocalTaxonomies = { ...taxonomies };
    const categoryIndex = updatedLocalTaxonomies.materialTypes.findIndex(
      c => c.id === editCategoryId
    );

    if (categoryIndex !== -1) {
      updatedLocalTaxonomies.materialTypes[categoryIndex] = {
        ...updatedLocalTaxonomies.materialTypes[categoryIndex],
        name: editCategoryName.trim(),
        image: editCategoryImage || undefined
      };

      // Obținem obiectul complet de taxonomii și actualizăm materialTypes
      const fullTaxonomies = getTaxonomies();
      const updatedTaxonomies = {
        ...fullTaxonomies,
        materialTypes: updatedLocalTaxonomies.materialTypes,
      };

      try {
        updateTaxonomies(updatedTaxonomies);
        setTaxonomies(updatedLocalTaxonomies);
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
    if (!editSubcategoryId || !editSubcategoryName.trim()) return;

    const updatedLocalTaxonomies = { ...taxonomies };
    
    // Actualizarea unei subcategorii, posibil imbricate
    const updateNestedSubcategory = (subcategories: TaxonomySubcategory[]): TaxonomySubcategory[] => {
      return subcategories.map(subcat => {
        if (subcat.id === editSubcategoryId) {
          return {
            ...subcat,
            name: editSubcategoryName.trim(),
            image: editSubcategoryImage || undefined
          };
        }
        if (subcat.subcategories && subcat.subcategories.length > 0) {
          return {
            ...subcat,
            subcategories: updateNestedSubcategory(subcat.subcategories)
          };
        }
        return subcat;
      });
    };

    if (currentBreadcrumbs.length > 0) {
      // Găsim categoria principală
      const categoryId = currentBreadcrumbs[0].id;
      const categoryIndex = updatedLocalTaxonomies.materialTypes.findIndex(
        cat => cat.id === categoryId
      );

      if (categoryIndex !== -1) {
        updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories = 
          updateNestedSubcategory(updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories);
      }
    } else if (selectedCategoryId) {
      // Actualizare directă în categoria principală
      const categoryIndex = updatedLocalTaxonomies.materialTypes.findIndex(
        cat => cat.id === selectedCategoryId
      );

      if (categoryIndex !== -1) {
        updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories = 
          updatedLocalTaxonomies.materialTypes[categoryIndex].subcategories.map(
            subcat => subcat.id === editSubcategoryId ? 
              { ...subcat, name: editSubcategoryName.trim(), image: editSubcategoryImage || undefined } : 
              subcat
          );
      }
    }

    // Obținem obiectul complet de taxonomii și actualizăm materialTypes
    const fullTaxonomies = getTaxonomies();
    const updatedTaxonomies = {
      ...fullTaxonomies,
      materialTypes: updatedLocalTaxonomies.materialTypes,
    };

    try {
      updateTaxonomies(updatedTaxonomies);
      setTaxonomies(updatedLocalTaxonomies);
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
  };

  const handleNavigateToSubcategory = (categoryId: string, subcategoryId: string, subcategoryName: string) => {
    // Actualizăm breadcrumb-urile
    if (currentBreadcrumbs.length === 0) {
      // Prima navigare - adăugăm categoria și subcategoria
      const category = taxonomies.materialTypes.find(cat => cat.id === categoryId);
      if (category) {
        setCurrentBreadcrumbs([
          { id: categoryId, name: category.name, type: 'category' },
          { id: subcategoryId, name: subcategoryName, type: 'subcategory' }
        ]);
      }
    } else {
      // Adăugăm doar subcategoria nouă
      setCurrentBreadcrumbs([
        ...currentBreadcrumbs,
        { id: subcategoryId, name: subcategoryName, type: 'subcategory' }
      ]);
    }

    setCurrentParentId(subcategoryId);
    
    // Găsim subcategoria pentru afișare
    const findNestedSubcategory = (subcats: TaxonomySubcategory[], id: string): TaxonomySubcategory | null => {
      for (const subcat of subcats) {
        if (subcat.id === id) return subcat;
        if (subcat.subcategories && subcat.subcategories.length > 0) {
          const found = findNestedSubcategory(subcat.subcategories, id);
          if (found) return found;
        }
      }
      return null;
    };

    const category = taxonomies.materialTypes.find(cat => cat.id === categoryId);
    if (category) {
      const subcategory = findNestedSubcategory(category.subcategories, subcategoryId);
      if (subcategory) {
        setCurrentParent(subcategory);
      }
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Clic pe categorie - resetăm la nivelul categoriei
      setCurrentBreadcrumbs([]);
      setCurrentParentId(null);
      setCurrentParent(null);
      setSelectedCategoryId(currentBreadcrumbs[0].id);
    } else {
      // Clic pe subcategorie - actualizăm breadcrumb-urile și nivelul curent
      const newBreadcrumbs = currentBreadcrumbs.slice(0, index + 1);
      setCurrentBreadcrumbs(newBreadcrumbs);
      
      const subcategoryId = newBreadcrumbs[index].id;
      setCurrentParentId(subcategoryId);
      
      // Găsim subcategoria pentru afișare
      const findNestedSubcategory = (subcats: TaxonomySubcategory[], id: string): TaxonomySubcategory | null => {
        for (const subcat of subcats) {
          if (subcat.id === id) return subcat;
          if (subcat.subcategories && subcat.subcategories.length > 0) {
            const found = findNestedSubcategory(subcat.subcategories, id);
            if (found) return found;
          }
        }
        return null;
      };

      const categoryId = newBreadcrumbs[0].id;
      const category = taxonomies.materialTypes.find(cat => cat.id === categoryId);
      if (category) {
        const subcategory = findNestedSubcategory(category.subcategories, subcategoryId);
        if (subcategory) {
          setCurrentParent(subcategory);
        }
      }
    }
  };

  const handleSelectCategory = (category: TaxonomyCategory) => {
    setSelectedCategoryId(category.id);
    setCurrentBreadcrumbs([]);
    setCurrentParentId(null);
    setCurrentParent(null);
  };

  const handleExportCategory = () => {
    if (!selectedCategoryId) return;
    
    const category = taxonomies.materialTypes.find(cat => cat.id === selectedCategoryId);
    if (category) {
      try {
        const exportedData = exportCategoryData('materialTypes', category.name);
        setExportData(exportedData);
        toast({
          title: 'Succes',
          description: 'Datele categoriei au fost exportate',
        });
      } catch (error) {
        console.error('Error exporting category:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut exporta datele categoriei',
          variant: 'destructive',
        });
      }
    }
  };

  const handleImportCategory = () => {
    if (!importData) {
      toast({
        title: 'Eroare',
        description: 'Nu există date pentru import',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = importCategoryData(importData);
      if (result) {
        loadTaxonomies(); // Reîncărcăm taxonomiile după import
        setImportData('');
        toast({
          title: 'Succes',
          description: 'Datele categoriei au fost importate',
        });
      } else {
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut importa datele categoriei',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing category:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut importa datele categoriei',
        variant: 'destructive',
      });
    }
  };

  const downloadExportFile = () => {
    if (!exportData) return;
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'category_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderCurrentView = () => {
    if (currentParent) {
      // Afișăm subcategoriile subcategoriei curente
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <Breadcrumb className="overflow-hidden">
              <BreadcrumbList>
                {currentBreadcrumbs.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        onClick={() => handleBreadcrumbClick(index)}
                        className="cursor-pointer"
                      >
                        {item.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < currentBreadcrumbs.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">{currentParent.name}</h2>
            {currentParent.image && (
              <div className="mb-4 w-32 h-32 overflow-hidden rounded-md border">
                <AspectRatio ratio={1/1}>
                  <img 
                    src={currentParent.image} 
                    alt={currentParent.name} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {currentParent.subcategories?.length ? (
              currentParent.subcategories.map((subcategory) => (
                <Card key={subcategory.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">{subcategory.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditSubcategory(subcategory)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 flex-grow">
                    {subcategory.image && (
                      <div className="mb-4 overflow-hidden rounded-md border">
                        <AspectRatio ratio={16/9}>
                          <img 
                            src={subcategory.image} 
                            alt={subcategory.name} 
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                    )}
                    <Badge variant="outline" className="mt-1">
                      {subcategory.subcategories?.length || 0} subcategorii
                    </Badge>
                  </CardContent>
                  <div className="p-4 bg-muted/10 border-t flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSubcategoryId(subcategory.id);
                        setIsAddSubcategoryOpen(true);
                      }}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Adaugă subcategorie
                    </Button>
                    
                    {subcategory.subcategories?.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleNavigateToSubcategory(
                          currentBreadcrumbs[0].id, 
                          subcategory.id, 
                          subcategory.name
                        )}
                      >
                        <FolderTree className="mr-2 h-4 w-4" />
                        Navighează
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nu există subcategorii definite
                </CardContent>
              </Card>
            )}
          </div>
        </>
      );
    } else if (selectedCategoryId) {
      // Afișăm subcategoriile categoriei selectate
      const category = taxonomies.materialTypes.find(cat => cat.id === selectedCategoryId);
      if (!category) return null;

      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExportImportOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export/Import
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openEditCategory(category)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editează
              </Button>
            </div>
          </div>

          {category.image && (
            <div className="mb-4 w-40 h-40 overflow-hidden rounded-md border">
              <AspectRatio ratio={1/1}>
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {category.subcategories.length > 0 ? (
              category.subcategories.map((subcategory) => (
                <Card key={subcategory.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">{subcategory.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditSubcategory(subcategory)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 flex-grow">
                    {subcategory.image && (
                      <div className="mb-4 overflow-hidden rounded-md border">
                        <AspectRatio ratio={16/9}>
                          <img 
                            src={subcategory.image} 
                            alt={subcategory.name} 
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                    )}
                    <Badge variant="outline" className="mt-1">
                      {subcategory.subcategories?.length || 0} subcategorii
                    </Badge>
                  </CardContent>
                  <div className="p-4 bg-muted/10 border-t flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSubcategoryId(subcategory.id);
                        setIsAddSubcategoryOpen(true);
                      }}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Adaugă subcategorie
                    </Button>
                    
                    {subcategory.subcategories?.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleNavigateToSubcategory(
                          category.id, 
                          subcategory.id, 
                          subcategory.name
                        )}
                      >
                        <FolderTree className="mr-2 h-4 w-4" />
                        Navighează
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nu există subcategorii definite
                </CardContent>
              </Card>
            )}
          </div>
        </>
      );
    } else {
      // Afișăm lista de categorii
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taxonomies.materialTypes.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-muted-foreground">
                Nu există categorii definite
              </CardContent>
            </Card>
          ) : (
            taxonomies.materialTypes.map((category) => (
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
                  <Badge variant="outline" className="mt-1">
                    {category.subcategories.length} subcategorii
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4 flex-grow">
                  {category.image && (
                    <div className="mb-4 overflow-hidden rounded-md border">
                      <AspectRatio ratio={16/9}>
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </div>
                  )}
                  
                  {category.subcategories.length === 0 ? (
                    <div className="text-center text-muted-foreground py-2">
                      Nu există subcategorii definite
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {category.subcategories.slice(0, 3).map((subcategory) => (
                        <div 
                          key={subcategory.id} 
                          className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50"
                        >
                          <span>{subcategory.name}</span>
                        </div>
                      ))}
                      {category.subcategories.length > 3 && (
                        <div className="text-center text-muted-foreground text-sm">
                          +{category.subcategories.length - 3} mai multe...
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <div className="p-4 bg-muted/10 border-t">
                  <div className="grid grid-cols-2 gap-2">
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleSelectCategory(category)}
                    >
                      <FolderTree className="mr-2 h-4 w-4" />
                      Detalii
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      );
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
        <h1 className="text-3xl font-bold">Tipuri de Materiale</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddCategoryOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Adaugă Categorie
          </Button>
          <Button 
            onClick={() => setIsAddSubcategoryOpen(true)}
            variant="outline"
            disabled={!selectedCategoryId && !currentParentId}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Adaugă Subcategorie
          </Button>
        </div>
      </div>

      {renderCurrentView()}

      {/* Dialog Adăugare Categorie */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Categorie Nouă</DialogTitle>
            <DialogDescription>
              Introduceți numele și imaginea pentru noua categorie de materiale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nume Categorie</Label>
              <Input
                id="categoryName"
                placeholder="Ex: Pal, MDF, Lemn masiv, etc."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryImage">Imagine Categorie</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="categoryImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputCategoryRef}
                  onChange={(e) => handleImageUpload(e, setCategoryImage)}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputCategoryRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Încarcă Imagine
                </Button>
                {categoryImage && (
                  <div className="w-16 h-16 relative overflow-hidden rounded-md border">
                    <img 
                      src={categoryImage} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full"
                      onClick={() => setCategoryImage(null)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCategoryName('');
              setCategoryImage(null);
              setIsAddCategoryOpen(false);
            }}>
              Anulează
            </Button>
            <Button onClick={handleAddCategory}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adăugare Subcategorie */}
      <Dialog open={isAddSubcategoryOpen} onOpenChange={setIsAddSubcategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Subcategorie</DialogTitle>
            <DialogDescription>
              {currentParentId 
                ? `Adăugați o subcategorie în ${currentParent?.name || ''}`
                : 'Selectați categoria și introduceți numele subcategoriei.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!currentParentId && (
              <div className="space-y-2">
                <Label htmlFor="categorySelect">Categorie</Label>
                <select
                  id="categorySelect"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedCategoryId || ''}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">Selectează categoria</option>
                  {taxonomies.materialTypes.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="subcategoryName">Nume Subcategorie</Label>
              <Input
                id="subcategoryName"
                placeholder="Ex: Standard, Premium, etc."
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                disabled={!selectedCategoryId && !currentParentId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategoryImage">Imagine Subcategorie</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="subcategoryImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputSubcategoryRef}
                  onChange={(e) => handleImageUpload(e, setSubcategoryImage)}
                  disabled={!selectedCategoryId && !currentParentId}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputSubcategoryRef.current?.click()}
                  disabled={!selectedCategoryId && !currentParentId}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Încarcă Imagine
                </Button>
                {subcategoryImage && (
                  <div className="w-16 h-16 relative overflow-hidden rounded-md border">
                    <img 
                      src={subcategoryImage} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full"
                      onClick={() => setSubcategoryImage(null)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSubcategoryName('');
              setSubcategoryImage(null);
              setIsAddSubcategoryOpen(false);
            }}>
              Anulează
            </Button>
            <Button 
              onClick={handleAddSubcategory}
              disabled={!selectedCategoryId && !currentParentId}
            >
              Adaugă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editare Categorie */}
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
            <div className="space-y-2">
              <Label htmlFor="editCategoryImage">Imagine Categorie</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="editCategoryImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputEditCategoryRef}
                  onChange={(e) => handleImageUpload(e, setEditCategoryImage)}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputEditCategoryRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {editCategoryImage ? 'Schimbă Imaginea' : 'Încarcă Imagine'}
                </Button>
                {editCategoryImage && (
                  <div className="w-16 h-16 relative overflow-hidden rounded-md border">
                    <img 
                      src={editCategoryImage} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full"
                      onClick={() => setEditCategoryImage(null)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
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

      {/* Dialog Editare Subcategorie */}
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
            <div className="space-y-2">
              <Label htmlFor="editSubcategoryImage">Imagine Subcategorie</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="editSubcategoryImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputEditSubcategoryRef}
                  onChange={(e) => handleImageUpload(e, setEditSubcategoryImage)}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputEditSubcategoryRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {editSubcategoryImage ? 'Schimbă Imaginea' : 'Încarcă Imagine'}
                </Button>
                {editSubcategoryImage && (
                  <div className="w-16 h-16 relative overflow-hidden rounded-md border">
                    <img 
                      src={editSubcategoryImage} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full"
                      onClick={() => setEditSubcategoryImage(null)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
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

      {/* Dialog Export/Import */}
      <Dialog open={isExportImportOpen} onOpenChange={setIsExportImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export/Import Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Export Date</h3>
              <p className="text-sm text-muted-foreground">
                Exportați categoria curentă și toate elementele asociate acesteia.
              </p>
              <div className="flex justify-end">
                <Button 
                  onClick={handleExportCategory}
                  disabled={!selectedCategoryId}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportă
                </Button>
              </div>
              {exportData && (
                <div className="mt-2">
                  <div className="p-2 bg-muted rounded-md text-xs overflow-auto max-h-32">
                    <code>{exportData}</code>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={downloadExportFile}
                  >
                    Descarcă Fișier
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Import Date</h3>
              <p className="text-sm text-muted-foreground">
                Importați date pentru a crea sau actualiza categorii și elemente.
              </p>
              <div className="flex items-center space-x-4">
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputImportRef}
                  onChange={handleFileImport}
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputImportRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selectează Fișier
                </Button>
                {importData && <span className="text-sm">Fișier încărcat</span>}
              </div>
              {importData && (
                <Button onClick={handleImportCategory}>
                  Import
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default TaxonomiesMaterials;
