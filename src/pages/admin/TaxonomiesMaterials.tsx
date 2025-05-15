
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

interface MaterialType {
  id: string;
  name: string;
  image?: string;
  subcategories: MaterialSubcategory[];
}

interface MaterialSubcategory {
  id: string;
  name: string;
  image?: string;
  subcategories?: MaterialSubcategory[];
}

const TaxonomiesMaterials: React.FC = () => {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [newMaterialType, setNewMaterialType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMaterialType, setSelectedMaterialType] = useState<string | null>(null);
  const [selectedParentSubcategory, setSelectedParentSubcategory] = useState<string | null>(null);
  const [newSubcategory, setNewSubcategory] = useState<string>('');
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState<boolean>(false);
  const [editingMaterialType, setEditingMaterialType] = useState<MaterialType | null>(null);
  const [editingParentPath, setEditingParentPath] = useState<string[]>([]);
  const [materialTypeImage, setMaterialTypeImage] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [importData, setImportData] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTaxonomies();
  }, []);

  const loadTaxonomies = async () => {
    try {
      const taxonomiesData = getTaxonomies();
      if (taxonomiesData && taxonomiesData.materialTypes) {
        // Convert old format to new format with subcategories if needed
        const updatedTypes = taxonomiesData.materialTypes.map((type: any) => {
          if (!type.subcategories) {
            return {
              ...type,
              subcategories: []
            };
          }
          return type;
        });
        setMaterialTypes(updatedTypes);
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
      name: newMaterialType.trim(),
      image: materialTypeImage || undefined,
      subcategories: []
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
      setMaterialTypeImage(null);
    } catch (error) {
      console.error('Error saving material type:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva tipul de material',
        variant: 'destructive'
      });
    }
  };

  const openSubcategoryDialog = (typeId: string, parentSubcategoryId: string | null = null, path: string[] = []) => {
    setSelectedMaterialType(typeId);
    setSelectedParentSubcategory(parentSubcategoryId);
    setNewSubcategory('');
    setShowSubcategoryDialog(true);
    setMaterialTypeImage(null);
    setEditingParentPath(path);
    
    // Find the material type to set for context
    const materialType = materialTypes.find(type => type.id === typeId);
    if (materialType) {
      setEditingMaterialType(materialType);
    }
  };

  const findSubcategory = (subcategories: MaterialSubcategory[], subcategoryId: string): MaterialSubcategory | null => {
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
    subcategories: MaterialSubcategory[],
    parentId: string | null,
    newSubcategory: MaterialSubcategory
  ): MaterialSubcategory[] => {
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
    if (!newSubcategory.trim() || !selectedMaterialType) {
      toast({
        title: 'Eroare',
        description: 'Introduceți un nume pentru subcategorie',
        variant: 'destructive'
      });
      return;
    }

    const updatedTypes = materialTypes.map(type => {
      if (type.id === selectedMaterialType) {
        const newSubcategoryObj = {
          id: `subcat_${Date.now()}`,
          name: newSubcategory.trim(),
          image: materialTypeImage || undefined,
          subcategories: []
        };

        return {
          ...type,
          subcategories: addSubcategoryToParent(
            type.subcategories || [],
            selectedParentSubcategory,
            newSubcategoryObj
          )
        };
      }
      return type;
    });

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
        description: 'Subcategorie adăugată cu succes'
      });
      setShowSubcategoryDialog(false);
      setNewSubcategory('');
      setMaterialTypeImage(null);
      setEditingMaterialType(null);
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

  const deleteSubcategoryRecursive = (
    subcategories: MaterialSubcategory[],
    subcategoryId: string
  ): MaterialSubcategory[] => {
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

  const handleDeleteSubcategory = (typeId: string, subcategoryId: string) => {
    const updatedTypes = materialTypes.map(type => {
      if (type.id === typeId) {
        return {
          ...type,
          subcategories: deleteSubcategoryRecursive(type.subcategories, subcategoryId)
        };
      }
      return type;
    });

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
    typeId: string,
    subcategories: MaterialSubcategory[],
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
                    onClick={() => openSubcategoryDialog(typeId, subcategory.id, currentPath)}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubcategory(typeId, subcategory.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {isExpanded && hasSubcategories && renderSubcategories(
                typeId,
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

  const handleExportMaterialType = (typeId: string) => {
    try {
      const materialType = materialTypes.find(type => type.id === typeId);
      if (materialType) {
        const exportData = exportCategoryData('materialTypes', materialType.name);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `material-${materialType.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Succes',
          description: `Tipul de material ${materialType.name} a fost exportat cu succes`
        });
      }
    } catch (error) {
      console.error('Error exporting material type:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut exporta tipul de material',
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
        <h1 className="text-3xl font-bold mb-4">Taxonomii - Materiale</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowImportDialog(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Adaugă Tip Material Nou</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="material-name">Nume Tip Material</Label>
                <Input
                  id="material-name"
                  placeholder="Nume tip material nou"
                  value={newMaterialType}
                  onChange={(e) => setNewMaterialType(e.target.value)}
                />
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="material-image">Imagine (opțional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="material-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setMaterialTypeImage)}
                  />
                  {materialTypeImage && (
                    <div className="h-10 w-10 rounded border overflow-hidden">
                      <img 
                        src={materialTypeImage} 
                        alt="Preview" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleAddMaterialType} className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" />
                Adaugă
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tipuri de Materiale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materialTypes.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Nu există tipuri de materiale definite
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {materialTypes.map((materialType) => (
                  <AccordionItem key={materialType.id} value={materialType.id}>
                    <AccordionTrigger className="hover:bg-accent/10 px-3 py-2 rounded-md">
                      <div className="flex items-center">
                        {materialType.image && (
                          <img 
                            src={materialType.image} 
                            alt={materialType.name}
                            className="w-8 h-8 object-cover mr-2 rounded"
                          />
                        )}
                        <span>{materialType.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <div className="flex justify-between mb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSubcategoryDialog(materialType.id)}
                        >
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Adaugă Subcategorie
                        </Button>
                        <div className="space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportMaterialType(materialType.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMaterialType(materialType.id)}
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Șterge
                          </Button>
                        </div>
                      </div>
                      
                      {materialType.subcategories.length === 0 ? (
                        <div className="text-muted-foreground italic px-4 py-2">
                          Nicio subcategorie
                        </div>
                      ) : (
                        renderSubcategories(materialType.id, materialType.subcategories, 0, [materialType.name])
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
              {editingMaterialType && (
                <>
                  Adăugați o nouă subcategorie 
                  {selectedParentSubcategory ? " în " : " la tipul de material "}
                  <strong>
                    {editingParentPath.length ? editingParentPath.join(' > ') : editingMaterialType.name}
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
                  onChange={(e) => handleImageUpload(e, setMaterialTypeImage)}
                />
                {materialTypeImage && (
                  <div className="h-10 w-10 rounded border overflow-hidden">
                    <img 
                      src={materialTypeImage} 
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
            <DialogTitle>Import Tip Material</DialogTitle>
            <DialogDescription>
              Selectați un fișier JSON pentru a importa un tip de material și datele aferente
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

export default TaxonomiesMaterials;
