
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { Slider } from '../../components/ui/slider';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Progress } from '../../components/ui/progress';
import { toast } from '../../components/ui/use-toast';
import { MaterialItem, AccessoryItem, calculatePieceCost, calculateHingeCost, calculateAccessoryCost } from '../../services/calculations';
import { getAll, StorageKeys, getTaxonomies } from '../../services/storage';

export interface Cabinet {
  id?: string;
  name: string;
  category: string;
  subcategory: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  pieces: {
    id: string;
    name: string;
    material: string;
    width: number;
    height: number;
    depth?: number;
    quantity: number;
  }[];
  accessories: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalCost: number;
}

interface CabinetConfiguratorProps {
  open: boolean;
  onClose: () => void;
  onSave: (cabinet: Cabinet) => void;
  onCancel?: () => void; // Added this prop
  initialCabinet?: Partial<Cabinet>;
  maxWidth?: number;
}

// Define an interface for the taxonomies structure
interface Taxonomy {
  categories: {
    id: string;
    name: string;
    subcategories: {
      id: string;
      name: string;
    }[];
  }[];
  materialTypes: {
    id: string;
    name: string;
  }[];
  accessoryCategories: {
    id: string;
    name: string;
  }[];
}

const defaultCabinet: Cabinet = {
  name: 'Corp nou',
  category: '',
  subcategory: '',
  dimensions: {
    width: 600,
    height: 720,
    depth: 560
  },
  pieces: [],
  accessories: [],
  totalCost: 0
};

const CabinetConfigurator: React.FC<CabinetConfiguratorProps> = ({
  open,
  onClose,
  onSave,
  onCancel,
  initialCabinet = {},
  maxWidth
}) => {
  const [cabinet, setCabinet] = useState<Cabinet>({
    ...defaultCabinet,
    ...initialCabinet
  });
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [categories, setCategories] = useState<Taxonomy['categories']>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedAccessories, setSelectedAccessories] = useState<Record<string, boolean>>({});
  const [accessoryQuantities, setAccessoryQuantities] = useState<Record<string, number>>({});
  const [currentTab, setCurrentTab] = useState('dimensions');
  const [errors, setErrors] = useState<string[]>([]);

  // Load data from storage
  useEffect(() => {
    const loadData = () => {
      const materialsData = getAll<MaterialItem>(StorageKeys.MATERIALS);
      const accessoriesData = getAll<AccessoryItem>(StorageKeys.ACCESSORIES);
      const taxonomiesData = getTaxonomies();
      
      if (materialsData?.length > 0) {
        setMaterials(materialsData);
        if (!selectedMaterial && materialsData[0]) {
          setSelectedMaterial(materialsData[0].id);
        }
      }
      
      if (accessoriesData?.length > 0) {
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
        
        // Set selected state for existing accessories in cabinet
        if (initialCabinet.accessories?.length) {
          const selected: Record<string, boolean> = { ...initialSelected };
          const quantities: Record<string, number> = { ...initialQuantities };
          
          initialCabinet.accessories.forEach(acc => {
            selected[acc.id] = true;
            quantities[acc.id] = acc.quantity;
          });
          
          setSelectedAccessories(selected);
          setAccessoryQuantities(quantities);
        }
      }
      
      if (taxonomiesData?.categories?.length > 0) {
        setCategories(taxonomiesData.categories);
      }
    };
    
    loadData();
  }, [initialCabinet]);

  // Update cabinet dimensions
  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    setCabinet(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
    
    // Validate against max width if provided
    if (dimension === 'width' && maxWidth && value > maxWidth) {
      setErrors(prev => [...prev.filter(err => !err.includes('lățimea maximă')), `Corpul depășește lățimea maximă de ${maxWidth}mm!`]);
    } else if (dimension === 'width' && maxWidth && value <= maxWidth) {
      setErrors(prev => prev.filter(err => !err.includes('lățimea maximă')));
    }
  };

  // Handle category or subcategory change
  const handleCategoryChange = (type: 'category' | 'subcategory', value: string) => {
    setCabinet(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Toggle accessory selection
  const toggleAccessory = (id: string, checked: boolean) => {
    setSelectedAccessories(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  // Update accessory quantity
  const updateAccessoryQuantity = (id: string, quantity: number) => {
    setAccessoryQuantities(prev => ({
      ...prev,
      [id]: quantity
    }));
  };

  // Calculate cabinet cost
  const calculateCabinetCost = (): number => {
    // Material costs based on cabinet dimensions
    let materialCost = 0;
    const mainMaterial = materials.find(m => m.id === selectedMaterial);
    
    if (mainMaterial) {
      // Simple calculation for demo - in real app would calculate each piece
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
    
    // Hinges cost
    const hingeCost = calculateHingeCost(cabinet.dimensions.width).cost;
    
    return materialCost + accessoryCost + hingeCost;
  };

  // Handle save
  const handleSave = () => {
    if (cabinet.name.trim() === '') {
      toast({
        title: "Eroare",
        description: "Numele corpului este obligatoriu",
        variant: "destructive"
      });
      return;
    }
    
    if (cabinet.category === '') {
      toast({
        title: "Eroare",
        description: "Selectați o categorie",
        variant: "destructive"
      });
      return;
    }
    
    if (errors.length > 0) {
      toast({
        title: "Eroare",
        description: "Rezolvați erorile înainte de a salva",
        variant: "destructive"
      });
      return;
    }
    
    // Create final cabinet object
    const selectedAccessoriesArray = accessories
      .filter(acc => selectedAccessories[acc.id])
      .map(acc => ({ 
        id: acc.id, 
        name: acc.name,
        quantity: accessoryQuantities[acc.id] || 1,
        price: acc.price
      }));
    
    const finalCabinet: Cabinet = {
      ...cabinet,
      accessories: selectedAccessoriesArray,
      totalCost: calculateCabinetCost()
    };
    
    // Add an ID if this is a new cabinet
    if (!finalCabinet.id) {
      finalCabinet.id = `cab_${Date.now()}`;
    }
    
    onSave(finalCabinet);
    toast({
      title: "Success",
      description: "Corp salvat cu succes"
    });
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurator Corp Mobilier</DialogTitle>
          <DialogDescription>
            Configurați dimensiunile, materialele și accesoriile pentru corpul de mobilier.
          </DialogDescription>
        </DialogHeader>
        
        {errors.length > 0 && (
          <div className="mb-4">
            {errors.map((error, index) => (
              <Alert variant="destructive" key={index}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-3 sm:col-span-1">
              <Label htmlFor="cabName">Nume corp</Label>
              <Input
                id="cabName"
                value={cabinet.name}
                onChange={(e) => setCabinet({ ...cabinet, name: e.target.value })}
                placeholder="Corp bucătărie jos"
              />
            </div>
            
            <div className="space-y-2 col-span-3 sm:col-span-1">
              <Label htmlFor="category">Categorie</Label>
              <Select
                value={cabinet.category}
                onValueChange={(value) => handleCategoryChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selectați categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-3 sm:col-span-1">
              <Label htmlFor="subcategory">Subcategorie</Label>
              <Select
                value={cabinet.subcategory}
                onValueChange={(value) => handleCategoryChange('subcategory', value)}
                disabled={!cabinet.category}
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Selectați subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {cabinet.category && categories
                    .find(cat => cat.id === cabinet.category)?.subcategories
                    .map((subcat) => (
                      <SelectItem key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dimensions">Dimensiuni</TabsTrigger>
              <TabsTrigger value="materials">Materiale</TabsTrigger>
              <TabsTrigger value="accessories">Accesorii</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dimensions" className="space-y-4 pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="width">Lățime (mm): {cabinet.dimensions.width}</Label>
                    <span className="text-sm text-muted-foreground">
                      {maxWidth ? `Max: ${maxWidth}mm` : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="width"
                      type="number"
                      min="100"
                      max={maxWidth || 2000}
                      value={cabinet.dimensions.width}
                      onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
                      className="w-24"
                    />
                    <Slider
                      value={[cabinet.dimensions.width]}
                      min={100}
                      max={maxWidth || 2000}
                      step={10}
                      className="flex-1"
                      onValueChange={([value]) => handleDimensionChange('width', value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Înălțime (mm): {cabinet.dimensions.height}</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="height"
                      type="number"
                      min="100"
                      max="2500"
                      value={cabinet.dimensions.height}
                      onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
                      className="w-24"
                    />
                    <Slider
                      value={[cabinet.dimensions.height]}
                      min={100}
                      max={2500}
                      step={10}
                      className="flex-1"
                      onValueChange={([value]) => handleDimensionChange('height', value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="depth">Adâncime (mm): {cabinet.dimensions.depth}</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="depth"
                      type="number"
                      min="100"
                      max="1000"
                      value={cabinet.dimensions.depth}
                      onChange={(e) => handleDimensionChange('depth', Number(e.target.value))}
                      className="w-24"
                    />
                    <Slider
                      value={[cabinet.dimensions.depth]}
                      min={100}
                      max={1000}
                      step={10}
                      className="flex-1"
                      onValueChange={([value]) => handleDimensionChange('depth', value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="materials" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="mainMaterial">Material principal</Label>
                <Select
                  value={selectedMaterial}
                  onValueChange={setSelectedMaterial}
                >
                  <SelectTrigger id="mainMaterial">
                    <SelectValue placeholder="Selectați materialul" />
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
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Detalii material:</h3>
                {selectedMaterial && materials.find(m => m.id === selectedMaterial) && (
                  <div className="bg-muted p-4 rounded-md">
                    <p><strong>Nume:</strong> {materials.find(m => m.id === selectedMaterial)?.name}</p>
                    <p><strong>Preț:</strong> {materials.find(m => m.id === selectedMaterial)?.price} RON/m²</p>
                    <p><strong>Grosime:</strong> {materials.find(m => m.id === selectedMaterial)?.thickness} mm</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Previzualizare piese:</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p>Număr piese: 5 (față, spate, laterale, bază, top)</p>
                  <p>Suprafață totală: {((cabinet.dimensions.width * cabinet.dimensions.depth * 2 + 
                    cabinet.dimensions.height * cabinet.dimensions.depth * 2 + 
                    cabinet.dimensions.width * cabinet.dimensions.height) / 1000000).toFixed(2)} m²</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="accessories" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accessories.map((accessory) => (
                  <div key={accessory.id} className="flex items-center space-x-2 bg-card border p-3 rounded-md">
                    <Checkbox
                      id={accessory.id}
                      checked={selectedAccessories[accessory.id] || false}
                      onCheckedChange={(checked) => toggleAccessory(accessory.id, checked === true)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={accessory.id} className="cursor-pointer">
                        {accessory.name} ({accessory.price} RON/buc)
                      </Label>
                    </div>
                    {selectedAccessories[accessory.id] && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`quantity-${accessory.id}`}>Cantitate:</Label>
                        <Input
                          id={`quantity-${accessory.id}`}
                          type="number"
                          min="1"
                          max="20"
                          className="w-16"
                          value={accessoryQuantities[accessory.id] || 1}
                          onChange={(e) => updateAccessoryQuantity(accessory.id, Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Alert className="mt-4">
                <AlertDescription>
                  Notă: Balamalele sunt adăugate automat în funcție de dimensiunile corpului.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="bg-muted p-4 rounded-md">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Cost materiale:</div>
              <div className="text-right">{calculateCabinetCost().toFixed(2)} RON</div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Anulează</Button>
          <Button onClick={handleSave}>Salvează Corp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CabinetConfigurator;
