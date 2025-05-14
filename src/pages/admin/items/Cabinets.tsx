
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
import { TaxonomySelect, SubcategorySelect } from '@/components/TaxonomySelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { calculatePieceCost, calculateAccessoryCost, MaterialItem, AccessoryItem } from '@/services/calculations';

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
    image: null,
    pieces: [],
    accessories: []
  });
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedAccessories, setSelectedAccessories] = useState<Record<string, boolean>>({});
  const [accessoryQuantities, setAccessoryQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCabinets();
    loadMaterials();
    loadAccessories();
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

  const loadMaterials = () => {
    try {
      const materialsData = getAll<MaterialItem>(StorageKeys.MATERIALS) || [];
      setMaterials(materialsData);
      if (materialsData.length > 0 && !selectedMaterial) {
        setSelectedMaterial(materialsData[0].id);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const loadAccessories = () => {
    try {
      const accessoriesData = getAll<AccessoryItem>(StorageKeys.ACCESSORIES) || [];
      setAccessories(accessoriesData);
      
      // Initialize selected states for accessories
      const initialSelected: Record<string, boolean> = {};
      const initialQuantities: Record<string, number> = {};
      
      accessoriesData.forEach(acc => {
        initialSelected[acc.id] = false;
        initialQuantities[acc.id] = 1;
      });
      
      setSelectedAccessories(initialSelected);
      setAccessoryQuantities(initialQuantities);
    } catch (error) {
      console.error('Error loading accessories:', error);
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
    
    // Recalculate the price
    if (isEditDialogOpen && editingCabinet) {
      calculateCabinetPrice(editingCabinet);
    } else {
      calculateCabinetPrice(newCabinet as Cabinet);
    }
  };

  const calculateCabinetPrice = (cabinet: Cabinet): number => {
    // Material costs based on cabinet dimensions
    let materialCost = 0;
    const mainMaterial = materials.find(m => m.id === selectedMaterial);
    
    if (mainMaterial) {
      // Simple calculation for example - in real app would calculate each piece
      const { width, height, depth } = cabinet.dimensions;
      
      // Base: bottom, top, left, right, back
      materialCost += calculatePieceCost(mainMaterial, { width, height: depth }, 1); // bottom
      materialCost += calculatePieceCost(mainMaterial, { width, height: depth }, 1); // top
      materialCost += calculatePieceCost(mainMaterial, { width: depth, height }, 2); // sides
      materialCost += calculatePieceCost(mainMaterial, { width, height }, 1); // back
    }
    
    // Accessory costs
    const selectedAccessoriesArray = accessories
      .filter(acc => selectedAccessories[acc.id])
      .map(acc => ({ 
        ...acc, 
        quantity: accessoryQuantities[acc.id] || 1 
      }));
    
    const accessoryCost = calculateAccessoryCost(selectedAccessoriesArray);
    
    // Total cost
    const totalCost = materialCost + accessoryCost;
    
    // Set the price to the cabinet
    if (isEditDialogOpen && editingCabinet) {
      setEditingCabinet({
        ...editingCabinet,
        price: Math.round(totalCost)
      });
    } else {
      setNewCabinet({
        ...newCabinet,
        price: Math.round(totalCost)
      });
    }
    
    return totalCost;
  };

  const handleCategoryChange = (value: string) => {
    if (isEditDialogOpen && editingCabinet) {
      setEditingCabinet({
        ...editingCabinet,
        category: value,
        subcategory: '' // Reset subcategory when category changes
      });
    } else {
      setNewCabinet({
        ...newCabinet,
        category: value,
        subcategory: '' // Reset subcategory when category changes
      });
    }
  };

  const handleSubcategoryChange = (value: string) => {
    if (isEditDialogOpen && editingCabinet) {
      setEditingCabinet({
        ...editingCabinet,
        subcategory: value
      });
    } else {
      setNewCabinet({
        ...newCabinet,
        subcategory: value
      });
    }
  };

  const handleMaterialChange = (materialId: string) => {
    setSelectedMaterial(materialId);
    // Recalculate price after material change
    setTimeout(() => {
      if (isEditDialogOpen && editingCabinet) {
        calculateCabinetPrice(editingCabinet);
      } else if (newCabinet) {
        calculateCabinetPrice(newCabinet as Cabinet);
      }
    }, 0);
  };

  const toggleAccessory = (id: string, checked: boolean) => {
    setSelectedAccessories(prev => ({
      ...prev,
      [id]: checked
    }));
    
    // Recalculate price after accessory toggle
    setTimeout(() => {
      if (isEditDialogOpen && editingCabinet) {
        calculateCabinetPrice(editingCabinet);
      } else if (newCabinet) {
        calculateCabinetPrice(newCabinet as Cabinet);
      }
    }, 0);
  };

  const updateAccessoryQuantity = (id: string, quantity: number) => {
    setAccessoryQuantities(prev => ({
      ...prev,
      [id]: quantity
    }));
    
    // Recalculate price after quantity change
    setTimeout(() => {
      if (isEditDialogOpen && editingCabinet) {
        calculateCabinetPrice(editingCabinet);
      } else if (newCabinet) {
        calculateCabinetPrice(newCabinet as Cabinet);
      }
    }, 0);
  };

  const handleAddCabinet = () => {
    setNewCabinet({
      name: '',
      category: '',
      subcategory: '',
      dimensions: { width: 600, height: 720, depth: 560 },
      width: 600,
      height: 720,
      depth: 560,
      price: 0,
      image: null,
      pieces: [],
      accessories: []
    });
    
    // Set default material if available
    if (materials.length > 0) {
      setSelectedMaterial(materials[0].id);
    }
    
    // Reset accessory selections
    const initialSelected: Record<string, boolean> = {};
    const initialQuantities: Record<string, number> = {};
    
    accessories.forEach(acc => {
      initialSelected[acc.id] = false;
      initialQuantities[acc.id] = 1;
    });
    
    setSelectedAccessories(initialSelected);
    setAccessoryQuantities(initialQuantities);
    
    setIsAddDialogOpen(true);
  };

  const handleEditCabinet = (id: string) => {
    const cabinet = cabinets.find(c => c.id === id);
    if (cabinet) {
      setEditingCabinet(cabinet);
      
      // Set the material for the cabinet
      if (cabinet.materials && cabinet.materials.length > 0) {
        setSelectedMaterial(cabinet.materials[0].id);
      } else if (materials.length > 0) {
        setSelectedMaterial(materials[0].id);
      }
      
      // Set accessory selections
      const selected: Record<string, boolean> = {};
      const quantities: Record<string, number> = {};
      
      accessories.forEach(acc => {
        selected[acc.id] = false;
        quantities[acc.id] = 1;
      });
      
      if (cabinet.accessories && cabinet.accessories.length > 0) {
        cabinet.accessories.forEach(acc => {
          selected[acc.id] = true;
          quantities[acc.id] = acc.quantity;
        });
      }
      
      setSelectedAccessories(selected);
      setAccessoryQuantities(quantities);
      
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
      // Prepare selected accessories
      const selectedAccessoriesArray = accessories
        .filter(acc => selectedAccessories[acc.id])
        .map(acc => ({ 
          id: acc.id, 
          name: acc.name,
          quantity: accessoryQuantities[acc.id] || 1,
          price: acc.price
        }));
      
      // Add the selected material
      const selectedMaterialItem = materials.find(m => m.id === selectedMaterial);
      const materialsArray = selectedMaterialItem 
        ? [{ id: selectedMaterialItem.id, name: selectedMaterialItem.name, quantity: 1 }] 
        : [];
      
      // Use our normalization helper to ensure cabinet has all required properties
      const cabinetToSave = normalizeCabinet({
        ...newCabinet,
        id: `cab_${Date.now()}`,
        accessories: selectedAccessoriesArray,
        materials: materialsArray
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
      // Prepare selected accessories
      const selectedAccessoriesArray = accessories
        .filter(acc => selectedAccessories[acc.id])
        .map(acc => ({ 
          id: acc.id, 
          name: acc.name,
          quantity: accessoryQuantities[acc.id] || 1,
          price: acc.price
        }));
      
      // Add the selected material
      const selectedMaterialItem = materials.find(m => m.id === selectedMaterial);
      const materialsArray = selectedMaterialItem 
        ? [{ id: selectedMaterialItem.id, name: selectedMaterialItem.name, quantity: 1 }] 
        : [];
      
      // Use our normalization helper to ensure cabinet has all required properties
      const updatedCabinet = normalizeCabinet({
        ...editingCabinet,
        accessories: selectedAccessoriesArray,
        materials: materialsArray
      });

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
                <TableHead>Material</TableHead>
                <TableHead>Accesorii</TableHead>
                <TableHead>Preț</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cabinets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
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
                    <TableCell>
                      {cabinet.materials && cabinet.materials.length > 0 
                        ? cabinet.materials.map(m => m.name).join(', ')
                        : 'Nedefinit'}
                    </TableCell>
                    <TableCell>
                      {cabinet.accessories && cabinet.accessories.length > 0 
                        ? `${cabinet.accessories.length} accesorii` 
                        : 'Fără accesorii'}
                    </TableCell>
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <TaxonomySelect
                type="categories"
                value={newCabinet.category || ''}
                onChange={handleCategoryChange}
                placeholder="Selectează categoria"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Subcategorie</Label>
              <SubcategorySelect
                type="categories"
                categoryName={newCabinet.category || ''}
                value={newCabinet.subcategory || ''}
                onChange={handleSubcategoryChange}
                placeholder="Selectează subcategoria"
                disabled={!newCabinet.category}
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
            
            {/* Material selection */}
            <div className="grid gap-2 mt-2">
              <Label>Material</Label>
              <Select
                value={selectedMaterial}
                onValueChange={handleMaterialChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alege material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.price} RON/m²)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Accessories selection */}
            <div className="grid gap-2 mt-2">
              <Label>Accesorii</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                {accessories.length === 0 ? (
                  <div className="col-span-2 text-center text-muted-foreground py-4">
                    Nu există accesorii definite
                  </div>
                ) : (
                  accessories.map((accessory) => (
                    <div key={accessory.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`acc-${accessory.id}`}
                        checked={selectedAccessories[accessory.id] || false}
                        onCheckedChange={(checked) => toggleAccessory(accessory.id, !!checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`acc-${accessory.id}`} className="cursor-pointer">
                          {accessory.name} ({accessory.price} RON)
                        </Label>
                      </div>
                      {selectedAccessories[accessory.id] && (
                        <div className="flex items-center">
                          <Label htmlFor={`qty-${accessory.id}`} className="mr-2">Cant:</Label>
                          <Input
                            id={`qty-${accessory.id}`}
                            type="number"
                            min="1"
                            className="w-16"
                            value={accessoryQuantities[accessory.id] || 1}
                            onChange={(e) => updateAccessoryQuantity(accessory.id, parseInt(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="grid gap-2 mt-4">
              <Label htmlFor="price">Preț calculat (RON)</Label>
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
                <TaxonomySelect
                  type="categories"
                  value={editingCabinet.category}
                  onChange={handleCategoryChange}
                  placeholder="Selectează categoria"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subcategory">Subcategorie</Label>
                <SubcategorySelect
                  type="categories"
                  categoryName={editingCabinet.category}
                  value={editingCabinet.subcategory || ''}
                  onChange={handleSubcategoryChange}
                  placeholder="Selectează subcategoria"
                  disabled={!editingCabinet.category}
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
              
              {/* Material selection */}
              <div className="grid gap-2 mt-2">
                <Label>Material</Label>
                <Select
                  value={selectedMaterial}
                  onValueChange={handleMaterialChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alege material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} ({material.price} RON/m²)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Accessories selection */}
              <div className="grid gap-2 mt-2">
                <Label>Accesorii</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                  {accessories.length === 0 ? (
                    <div className="col-span-2 text-center text-muted-foreground py-4">
                      Nu există accesorii definite
                    </div>
                  ) : (
                    accessories.map((accessory) => (
                      <div key={accessory.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-acc-${accessory.id}`}
                          checked={selectedAccessories[accessory.id] || false}
                          onCheckedChange={(checked) => toggleAccessory(accessory.id, !!checked)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`edit-acc-${accessory.id}`} className="cursor-pointer">
                            {accessory.name} ({accessory.price} RON)
                          </Label>
                        </div>
                        {selectedAccessories[accessory.id] && (
                          <div className="flex items-center">
                            <Label htmlFor={`edit-qty-${accessory.id}`} className="mr-2">Cant:</Label>
                            <Input
                              id={`edit-qty-${accessory.id}`}
                              type="number"
                              min="1"
                              className="w-16"
                              value={accessoryQuantities[accessory.id] || 1}
                              onChange={(e) => updateAccessoryQuantity(accessory.id, parseInt(e.target.value))}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="grid gap-2 mt-4">
                <Label htmlFor="edit-price">Preț calculat (RON)</Label>
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
