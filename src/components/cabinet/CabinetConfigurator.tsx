
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { MaterialItem, AccessoryItem, calculatePieceCost, calculateHingeCost, calculateAccessoryCost } from '@/services/calculations';
import { getAll, StorageKeys, getTaxonomies } from '@/services/storage';
import { normalizeCabinet } from '@/utils/cabinetHelpers';

// Import sub-components
import CabinetConfiguratorHeader from './configurator/CabinetConfiguratorHeader';
import ErrorDisplay from './configurator/ErrorDisplay';
import BasicInfoForm from './configurator/BasicInfoForm';
import DimensionsTab from './configurator/DimensionsTab';
import MaterialsTab from './configurator/MaterialsTab';
import AccessoriesTab from './configurator/AccessoriesTab';
import CostSummary from './configurator/CostSummary';

interface CabinetConfiguratorProps {
  open: boolean;
  onClose: () => void;
  onSave: (cabinet: Cabinet) => void;
  onCancel?: () => void; 
  initialCabinet?: Partial<Cabinet>;
  maxWidth?: number;
  projectId?: string;
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
  id: '',
  name: 'Corp nou',
  category: '',
  subcategory: '',
  dimensions: {
    width: 600,
    height: 720,
    depth: 560
  },
  width: 600,
  height: 720,
  depth: 560,
  pieces: [],
  accessories: [],
  materials: [],
  totalCost: 0,
  price: 0,
  image: null
};

const CabinetConfigurator: React.FC<CabinetConfiguratorProps> = ({
  open,
  onClose,
  onSave,
  onCancel,
  initialCabinet = {},
  maxWidth,
  projectId
}) => {
  const [cabinet, setCabinet] = useState<Cabinet>({
    ...defaultCabinet,
    ...initialCabinet,
    materials: initialCabinet.materials || [],
    accessories: initialCabinet.accessories || []
  });
  const [allMaterials, setAllMaterials] = useState<MaterialItem[]>([]);
  const [allAccessories, setAllAccessories] = useState<AccessoryItem[]>([]);
  const [categories, setCategories] = useState<Taxonomy['categories']>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedAccessories, setSelectedAccessories] = useState<Record<string, boolean>>({});
  const [accessoryQuantities, setAccessoryQuantities] = useState<Record<string, number>>({});
  const [currentTab, setCurrentTab] = useState('dimensions');
  const [errors, setErrors] = useState<string[]>([]);

  // Log projectId when it changes for debugging
  useEffect(() => {
    if (projectId) {
      console.log('🔧 CabinetConfigurator received projectId:', projectId);
    }
  }, [projectId]);

  // Load data from storage
  useEffect(() => {
    const loadData = () => {
      const materialsData = getAll<MaterialItem>(StorageKeys.MATERIALS);
      const accessoriesData = getAll<AccessoryItem>(StorageKeys.ACCESSORIES);
      const taxonomiesData = getTaxonomies();
      
      if (materialsData?.length > 0) {
        setAllMaterials(materialsData);
        if (!selectedMaterial && materialsData[0]) {
          setSelectedMaterial(materialsData[0].id);
        }
      }
      
      if (accessoriesData?.length > 0) {
        setAllAccessories(accessoriesData);
        
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
            quantities[acc.id] = acc.quantity || 1;
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
      },
      [dimension]: value // Update the top-level property as well
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

  // Add material to cabinet
  const addMaterial = (id: string, quantity: number) => {
    const material = allMaterials.find(m => m.id === id);
    if (!material) return;

    setCabinet(prev => {
      // Check if material already exists
      const existingMaterialIndex = prev.materials ? 
        prev.materials.findIndex(m => m.id === id) : -1;

      let updatedMaterials = prev.materials ? [...prev.materials] : [];
      
      if (existingMaterialIndex >= 0) {
        // Update quantity if material already exists
        updatedMaterials[existingMaterialIndex] = {
          ...updatedMaterials[existingMaterialIndex],
          quantity: (updatedMaterials[existingMaterialIndex].quantity || 0) + quantity
        };
      } else {
        // Add new material
        updatedMaterials.push({
          id: material.id,
          name: material.name,
          quantity
        });
      }

      return {
        ...prev,
        materials: updatedMaterials
      };
    });

    toast({
      title: 'Material adăugat',
      description: `${material.name} a fost adăugat la corp`
    });
  };

  // Remove material from cabinet
  const removeMaterial = (id: string) => {
    setCabinet(prev => ({
      ...prev,
      materials: prev.materials ? prev.materials.filter(m => m.id !== id) : []
    }));
  };

  // Calculate cabinet cost
  const calculateCabinetCost = (): number => {
    // Material costs based on cabinet dimensions
    let materialCost = 0;
    
    // Calculate cost for all selected materials
    if (cabinet.materials && cabinet.materials.length > 0) {
      cabinet.materials.forEach(cabMaterial => {
        const material = allMaterials.find(m => m.id === cabMaterial.id);
        if (material) {
          const { width, height, depth } = cabinet.dimensions;
          const qty = cabMaterial.quantity || 1;
          
          // Simple cost calculation for demonstration
          const areaCost = calculatePieceCost(material, { width, height: depth }, qty);
          materialCost += areaCost;
        }
      });
    } else {
      // Fallback to selected material if no materials in cabinet
      const mainMaterial = allMaterials.find(m => m.id === selectedMaterial);
      if (mainMaterial) {
        const { width, height, depth } = cabinet.dimensions;
        materialCost += calculatePieceCost(mainMaterial, { width, height: depth }, 1); // bottom
        materialCost += calculatePieceCost(mainMaterial, { width, height: depth }, 1); // top
        materialCost += calculatePieceCost(mainMaterial, { width: depth, height }, 2); // sides
        materialCost += calculatePieceCost(mainMaterial, { width, height }, 1); // back
      }
    }
    
    // Accessory costs
    const selectedAccessoriesArray = allAccessories
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
    
    // Create final cabinet object with normalized values
    const selectedAccessoriesArray = allAccessories
      .filter(acc => selectedAccessories[acc.id])
      .map(acc => ({ 
        id: acc.id, 
        name: acc.name,
        quantity: accessoryQuantities[acc.id] || 1,
        price: acc.price
      }));
    
    // Use existing materials or create from selected material
    let finalMaterials = cabinet.materials && cabinet.materials.length > 0 ? cabinet.materials : [];
    if (finalMaterials.length === 0 && selectedMaterial) {
      const material = allMaterials.find(m => m.id === selectedMaterial);
      if (material) {
        finalMaterials = [{
          id: material.id,
          name: material.name,
          quantity: 1
        }];
      }
    }
    
    let finalCabinet: Cabinet = {
      ...cabinet,
      accessories: selectedAccessoriesArray,
      materials: finalMaterials,
      totalCost: calculateCabinetCost(),
      // Ensure top-level dimension properties
      width: cabinet.dimensions.width,
      height: cabinet.dimensions.height,
      depth: cabinet.dimensions.depth
    };
    
    // Add an ID if this is a new cabinet
    if (!finalCabinet.id) {
      finalCabinet.id = `cab_${Date.now()}`;
    }
    
    // Normalize before saving to ensure all required properties are set
    finalCabinet = normalizeCabinet(finalCabinet);
    
    onSave(finalCabinet);
    toast({
      title: "Succes",
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
        <CabinetConfiguratorHeader projectId={projectId} />
        
        <ErrorDisplay errors={errors} />
        
        <div className="space-y-4">
          <BasicInfoForm
            cabinetName={cabinet.name}
            onNameChange={(name) => setCabinet(prev => ({ ...prev, name }))}
            category={cabinet.category}
            subcategory={cabinet.subcategory}
            onCategoryChange={(value) => handleCategoryChange('category', value)}
            onSubcategoryChange={(value) => handleCategoryChange('subcategory', value)}
            categories={categories}
          />
          
          <Separator />
          
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dimensions">Dimensiuni</TabsTrigger>
              <TabsTrigger value="materials">Materiale</TabsTrigger>
              <TabsTrigger value="accessories">Accesorii</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dimensions" className="space-y-4 pt-4">
              <DimensionsTab
                dimensions={cabinet.dimensions}
                maxWidth={maxWidth}
                onDimensionChange={handleDimensionChange}
              />
            </TabsContent>
            
            <TabsContent value="materials" className="space-y-4 pt-4">
              <MaterialsTab
                selectedMaterial={selectedMaterial}
                materials={allMaterials}
                onMaterialChange={setSelectedMaterial}
                cabinetDimensions={cabinet.dimensions}
                selectedMaterials={cabinet.materials}
                onAddMaterial={addMaterial}
                onRemoveMaterial={removeMaterial}
              />
            </TabsContent>
            
            <TabsContent value="accessories" className="space-y-4 pt-4">
              <AccessoriesTab
                accessories={allAccessories}
                selectedAccessories={selectedAccessories}
                accessoryQuantities={accessoryQuantities}
                onToggleAccessory={toggleAccessory}
                onUpdateQuantity={updateAccessoryQuantity}
              />
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <CostSummary cost={calculateCabinetCost()} />
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
