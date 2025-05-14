import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll, save, update, remove } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { normalizeCabinet } from '@/utils/cabinetHelpers';

// Cabinet interface is now defined in vite-env.d.ts globally

const CabinetItems: React.FC = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [cabinetToDelete, setCabinetToDelete] = useState<string | null>(null);
  const [newCabinet, setNewCabinet] = useState<Partial<Cabinet>>({
    name: '',
    category: '',
    subcategory: '',
    dimensions: { width: 0, height: 0, depth: 0 },
    width: 0,
    height: 0,
    depth: 0,
    price: 0,
    image: null
  });
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);

  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = () => {
    try {
      const cabinetsData = getAll<Cabinet>(StorageKeys.CABINETS) || [];
      // Ensure all cabinets have width, height and depth at top level
      const updatedCabinets = cabinetsData.map(cabinet => ({
        ...cabinet,
        width: cabinet.dimensions.width,
        height: cabinet.dimensions.height,
        depth: cabinet.dimensions.depth
      }));
      setCabinets(updatedCabinets);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (isEditDialogOpen && editingCabinet) {
      if (name.startsWith('dimension_')) {
        const dimension = name.split('_')[1] as 'width' | 'height' | 'depth';
        const dimensionValue = parseFloat(value);
        setEditingCabinet({
          ...editingCabinet,
          dimensions: {
            ...editingCabinet.dimensions,
            [dimension]: dimensionValue
          },
          [dimension]: dimensionValue // Update the direct property as well
        });
      } else {
        setEditingCabinet({
          ...editingCabinet,
          [name]: name === 'price' ? parseFloat(value) : value
        });
      }
    } else {
      if (name.startsWith('dimension_')) {
        const dimension = name.split('_')[1] as 'width' | 'height' | 'depth';
        const dimensionValue = parseFloat(value);
        setNewCabinet({
          ...newCabinet,
          dimensions: {
            ...newCabinet.dimensions!,
            [dimension]: dimensionValue
          },
          [dimension]: dimensionValue // Update the direct property as well
        });
      } else {
        setNewCabinet({
          ...newCabinet,
          [name]: name === 'price' ? parseFloat(value) : value
        });
      }
    }
  };

  const handleAddCabinet = () => {
    setNewCabinet({
      name: '',
      category: '',
      subcategory: '',
      dimensions: { width: 0, height: 0, depth: 0 },
      width: 0,
      height: 0,
      depth: 0,
      price: 0,
      image: null
    });
    setIsAddDialogOpen(true);
  };

  const handleEditCabinet = (id: string) => {
    const cabinet = cabinets.find(c => c.id === id);
    if (cabinet) {
      setEditingCabinet(cabinet);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteCabinet = (id: string) => {
    setCabinetToDelete(id);
  };

  const confirmDelete = () => {
    if (cabinetToDelete) {
      try {
        const success = remove(StorageKeys.CABINETS, cabinetToDelete);
        if (success) {
          toast({
            title: 'Succes',
            description: 'Corpul de mobilier a fost șters cu succes'
          });
          loadCabinets();
        } else {
          toast({
            title: 'Eroare',
            description: 'Nu s-a putut șterge corpul de mobilier',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error deleting cabinet:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut șterge corpul de mobilier',
          variant: 'destructive'
        });
      }
      setCabinetToDelete(null);
    }
  };

  const saveNewCabinet = () => {
    if (!newCabinet.name || !newCabinet.category || newCabinet.price === undefined) {
      toast({
        title: 'Eroare',
        description: 'Completați toate câmpurile obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Use our normalization helper to ensure cabinet has all required properties
      const cabinetToSave = normalizeCabinet({
        ...newCabinet,
        id: `cab_${Date.now()}`,
      });

      save(StorageKeys.CABINETS, cabinetToSave);
      toast({
        title: 'Succes',
        description: 'Corpul de mobilier a fost adăugat cu succes'
      });
      setIsAddDialogOpen(false);
      loadCabinets();
    } catch (error) {
      console.error('Error adding cabinet:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga corpul de mobilier',
        variant: 'destructive'
      });
    }
  };

  const saveEditedCabinet = () => {
    if (!editingCabinet || !editingCabinet.name || !editingCabinet.category) {
      toast({
        title: 'Eroare',
        description: 'Completați toate câmpurile obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Use our normalization helper to ensure cabinet has all required properties
      const updatedCabinet = normalizeCabinet(editingCabinet);

      update(StorageKeys.CABINETS, updatedCabinet.id, updatedCabinet);
      toast({
        title: 'Succes',
        description: 'Corpul de mobilier a fost actualizat cu succes'
      });
      setIsEditDialogOpen(false);
      loadCabinets();
    } catch (error) {
      console.error('Error updating cabinet:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza corpul de mobilier',
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

      {/* Dialog pentru adăugare corp nou */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Corp Mobilier</DialogTitle>
            <DialogDescription>
              Completați detaliile pentru noul corp de mobilier
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nume</Label>
              <Input
                id="name"
                name="name"
                value={newCabinet.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categorie</Label>
              <Input
                id="category"
                name="category"
                value={newCabinet.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Subcategorie</Label>
              <Input
                id="subcategory"
                name="subcategory"
                value={newCabinet.subcategory}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dimension_width">Lățime (mm)</Label>
                <Input
                  id="dimension_width"
                  name="dimension_width"
                  type="number"
                  value={newCabinet.dimensions?.width}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dimension_height">Înălțime (mm)</Label>
                <Input
                  id="dimension_height"
                  name="dimension_height"
                  type="number"
                  value={newCabinet.dimensions?.height}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dimension_depth">Adâncime (mm)</Label>
                <Input
                  id="dimension_depth"
                  name="dimension_depth"
                  type="number"
                  value={newCabinet.dimensions?.depth}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preț (RON)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={newCabinet.price}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={saveNewCabinet}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru editare corp */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editează Corp Mobilier</DialogTitle>
            <DialogDescription>
              Modificați detaliile corpului de mobilier
            </DialogDescription>
          </DialogHeader>
          {editingCabinet && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nume</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingCabinet.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Categorie</Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={editingCabinet.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subcategory">Subcategorie</Label>
                <Input
                  id="edit-subcategory"
                  name="subcategory"
                  value={editingCabinet.subcategory}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dimension_width">Lățime (mm)</Label>
                  <Input
                    id="edit-dimension_width"
                    name="dimension_width"
                    type="number"
                    value={editingCabinet.dimensions.width}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dimension_height">Înălțime (mm)</Label>
                  <Input
                    id="edit-dimension_height"
                    name="dimension_height"
                    type="number"
                    value={editingCabinet.dimensions.height}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dimension_depth">Adâncime (mm)</Label>
                  <Input
                    id="edit-dimension_depth"
                    name="dimension_depth"
                    type="number"
                    value={editingCabinet.dimensions.depth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Preț (RON)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={editingCabinet.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={saveEditedCabinet}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru confirmare ștergere */}
      <AlertDialog open={cabinetToDelete !== null} onOpenChange={() => setCabinetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți acest corp de mobilier? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulare</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CabinetItems;
