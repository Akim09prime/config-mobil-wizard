
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

interface MaterialType {
  id: string;
  name: string;
  subcategories: MaterialSubcategory[];
}

interface MaterialSubcategory {
  id: string;
  name: string;
}

const TaxonomiesMaterials: React.FC = () => {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [newMaterialType, setNewMaterialType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMaterialType, setSelectedMaterialType] = useState<string | null>(null);
  const [newSubcategory, setNewSubcategory] = useState<string>('');
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState<boolean>(false);
  const [editingMaterialType, setEditingMaterialType] = useState<MaterialType | null>(null);

  useEffect(() => {
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
      name: newMaterialType.trim(),
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
    } catch (error) {
      console.error('Error saving material type:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva tipul de material',
        variant: 'destructive'
      });
    }
  };

  const openSubcategoryDialog = (typeId: string) => {
    setSelectedMaterialType(typeId);
    setNewSubcategory('');
    setShowSubcategoryDialog(true);
    
    // Find the material type to set for context
    const materialType = materialTypes.find(type => type.id === typeId);
    if (materialType) {
      setEditingMaterialType(materialType);
    }
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
        return {
          ...type,
          subcategories: [
            ...type.subcategories || [],
            {
              id: `subcat_${Date.now()}`,
              name: newSubcategory.trim()
            }
          ]
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
      setEditingMaterialType(null);
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

  const handleDeleteSubcategory = (typeId: string, subcategoryId: string) => {
    const updatedTypes = materialTypes.map(type => {
      if (type.id === typeId) {
        return {
          ...type,
          subcategories: type.subcategories.filter(
            subcategory => subcategory.id !== subcategoryId
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
                  <TableHead>Subcategorii</TableHead>
                  <TableHead className="w-[180px]">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Nu există tipuri de materiale definite
                    </TableCell>
                  </TableRow>
                ) : (
                  materialTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>{type.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {type.subcategories && type.subcategories.length === 0 ? (
                            <span className="text-muted-foreground italic">
                              Nicio subcategorie
                            </span>
                          ) : (
                            type.subcategories && type.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center bg-muted rounded-md px-2 py-1">
                                <span className="mr-1">{subcategory.name}</span>
                                <button
                                  onClick={() => handleDeleteSubcategory(type.id, subcategory.id)}
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
                            onClick={() => openSubcategoryDialog(type.id)}
                          >
                            <FolderPlus className="h-4 w-4 mr-1" />
                            Adaugă Subcategorie
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMaterialType(type.id)}
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
              {editingMaterialType && (
                <>Adăugați o nouă subcategorie la tipul de material <strong>{editingMaterialType.name}</strong>.</>
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

export default TaxonomiesMaterials;
