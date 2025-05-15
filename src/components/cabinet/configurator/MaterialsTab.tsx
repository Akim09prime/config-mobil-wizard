
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MaterialItem, calculatePieceCost } from '@/services/calculations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TaxonomySelect, SubcategorySelect, SubcategoryPath } from '@/components/TaxonomySelect';
import { findSubcategoryById, getTaxonomies } from '@/services/storage';

interface MaterialsTabProps {
  selectedMaterial: string;
  materials: MaterialItem[];
  onMaterialChange: (materialId: string) => void;
  cabinetDimensions: {
    width: number;
    height: number;
    depth: number;
  };
  selectedMaterials?: {id: string, name: string, quantity: number}[];
  onAddMaterial?: (materialId: string, quantity: number) => void;
  onRemoveMaterial?: (materialId: string) => void;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ 
  selectedMaterial, 
  materials, 
  onMaterialChange, 
  cabinetDimensions,
  selectedMaterials = [],
  onAddMaterial,
  onRemoveMaterial
}) => {
  const [materialCategory, setMaterialCategory] = useState<string>('');
  const [materialSubcategory, setMaterialSubcategory] = useState<string>('');
  const [materialQuantity, setMaterialQuantity] = useState<string>('1');
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialItem[]>(materials);
  const [subcategoryPath, setSubcategoryPath] = useState<{id: string; name: string}[]>([]);
  const [currentSubcategoryId, setCurrentSubcategoryId] = useState<string | undefined>(undefined);
  
  // Reset filtered materials when materials change
  useEffect(() => {
    if (materialCategory) {
      filterMaterialsByCategory(materialCategory);
    } else {
      setFilteredMaterials(materials);
    }
  }, [materials]);
  
  // Filter materials based on selected category and subcategory
  const handleCategoryChange = (category: string) => {
    setMaterialCategory(category);
    setMaterialSubcategory('');
    setSubcategoryPath([]);
    setCurrentSubcategoryId(undefined);
    
    filterMaterialsByCategory(category);
  };
  
  const filterMaterialsByCategory = (category: string) => {
    if (category && category !== 'all') {
      setFilteredMaterials(materials.filter(m => m.category === category));
    } else {
      setFilteredMaterials(materials);
    }
  }
  
  const handleSubcategoryChange = (subcategory: string) => {
    setMaterialSubcategory(subcategory);
    
    if (subcategory && subcategory !== 'all') {
      setFilteredMaterials(
        materials.filter(m => {
          if (materialCategory && m.category !== materialCategory) {
            return false;
          }
          return m.subcategory === subcategory;
        })
      );
    } else if (materialCategory && materialCategory !== 'all') {
      filterMaterialsByCategory(materialCategory);
    } else {
      setFilteredMaterials(materials);
    }
  };
  
  const handleSubcategorySelect = (subcategoryId: string) => {
    // Find the subcategory to add it to the path
    const taxonomies = getTaxonomies();
    const category = taxonomies.materialTypes.find(cat => cat.name === materialCategory);
    
    if (category) {
      let subcategory;
      
      if (currentSubcategoryId) {
        // Find the parent subcategory first
        const parentSubcategory = findSubcategoryById(category.subcategories, currentSubcategoryId);
        if (parentSubcategory && parentSubcategory.subcategories) {
          subcategory = parentSubcategory.subcategories.find(sub => sub.id === subcategoryId);
        }
      } else {
        // Look for the subcategory at the top level
        subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      }
      
      if (subcategory) {
        // Add to the subcategory path
        setSubcategoryPath([
          ...subcategoryPath,
          { id: subcategoryId, name: subcategory.name }
        ]);
        setCurrentSubcategoryId(subcategoryId);
      }
    }
  };
  
  const navigateSubcategoryPath = (index: number) => {
    if (index === -1) {
      // Navigate to category root
      setSubcategoryPath([]);
      setCurrentSubcategoryId(undefined);
      setMaterialSubcategory('');
      filterMaterialsByCategory(materialCategory);
    } else {
      // Navigate to specific subcategory in the path
      const newPath = subcategoryPath.slice(0, index + 1);
      setSubcategoryPath(newPath);
      setCurrentSubcategoryId(newPath[newPath.length - 1].id);
      
      // Update the filter to show materials in this subcategory
      const subcategoryName = newPath[newPath.length - 1].name;
      setMaterialSubcategory(subcategoryName);
      
      setFilteredMaterials(
        materials.filter(m => {
          if (materialCategory && m.category !== materialCategory) {
            return false;
          }
          return m.subcategory === subcategoryName;
        })
      );
    }
  };
  
  const handleAddMaterial = () => {
    if (onAddMaterial && selectedMaterial) {
      onAddMaterial(selectedMaterial, parseInt(materialQuantity) || 1);
      setMaterialQuantity('1');
    }
  };
  
  const calculateMaterialCost = (material: MaterialItem) => {
    const { width, height, depth } = cabinetDimensions;
    
    // Simple calculation - a real implementation would be more sophisticated
    const estimatedArea = (width * height * 2 + width * depth * 2 + height * depth * 2) / 1000000; // m²
    return material ? (material.price * estimatedArea).toFixed(2) : '0.00';
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="materialCategory" className="mb-2 block">Categorie Material</Label>
          <TaxonomySelect
            type="materialTypes"
            value={materialCategory}
            onChange={handleCategoryChange}
            placeholder="Toate categoriile"
          />
        </div>
        
        <div>
          <Label htmlFor="materialSubcategory" className="mb-2 block">Subcategorie Material</Label>
          <SubcategorySelect
            type="materialTypes"
            categoryName={materialCategory}
            value={materialSubcategory}
            onChange={handleSubcategoryChange}
            placeholder={materialCategory ? "Toate subcategoriile" : "Selectați prima dată o categorie"}
            disabled={!materialCategory}
            parentSubcategoryId={currentSubcategoryId}
            onSubcategorySelect={handleSubcategorySelect}
          />
        </div>
      </div>
      
      {materialCategory && subcategoryPath.length > 0 && (
        <SubcategoryPath
          type="materialTypes"
          categoryName={materialCategory}
          subcategoryPath={subcategoryPath}
          onNavigate={navigateSubcategoryPath}
        />
      )}
      
      <div className="space-y-2">
        <Label htmlFor="material" className="mb-2 block">Selectare Material</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedMaterial} onValueChange={onMaterialChange}>
            <SelectTrigger id="material">
              <SelectValue placeholder="Selectează material" />
            </SelectTrigger>
            <SelectContent>
              {filteredMaterials.length === 0 ? (
                <SelectItem value="none" disabled>Nu există materiale disponibile</SelectItem>
              ) : (
                filteredMaterials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name} ({material.price} RON/m²)
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Input 
            type="number" 
            value={materialQuantity} 
            onChange={e => setMaterialQuantity(e.target.value)}
            min="1" 
            placeholder="Cantitate"
          />
          
          <Button 
            onClick={handleAddMaterial}
            disabled={!selectedMaterial || !onAddMaterial}
            className="flex items-center"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Adaugă Material
          </Button>
        </div>
      </div>
      
      {selectedMaterials && selectedMaterials.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Materiale adăugate</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Cantitate</TableHead>
                <TableHead className="w-16">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMaterials.map(material => (
                <TableRow key={material.id}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>
                    {onRemoveMaterial && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onRemoveMaterial(material.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Detalii material curent</h3>
          {selectedMaterial && materials && materials.find(m => m.id === selectedMaterial) ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium">
                  {materials.find(m => m.id === selectedMaterial)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Categorie:</span>
                <span>
                  <Badge variant="outline">
                    {materials.find(m => m.id === selectedMaterial)?.category || 'N/A'}
                  </Badge>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cost estimat:</span>
                <span className="font-medium">
                  {calculateMaterialCost(materials.find(m => m.id === selectedMaterial) as MaterialItem)} RON
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-2">
              Selectați un material pentru a vedea detalii
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsTab;
