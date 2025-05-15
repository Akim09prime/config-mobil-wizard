
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MaterialItem, calculatePieceCost } from '@/services/calculations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TaxonomySelect, SubcategorySelect } from '@/components/TaxonomySelect';

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
  
  // Filter materials based on selected category and subcategory
  const handleCategoryChange = (category: string) => {
    setMaterialCategory(category);
    setMaterialSubcategory('');
    
    if (category) {
      setFilteredMaterials(materials.filter(m => m.category === category));
    } else {
      setFilteredMaterials(materials);
    }
  };
  
  const handleSubcategoryChange = (subcategory: string) => {
    setMaterialSubcategory(subcategory);
    
    if (subcategory) {
      setFilteredMaterials(
        materials.filter(m => m.category === materialCategory && m.subcategory === subcategory)
      );
    } else if (materialCategory) {
      setFilteredMaterials(materials.filter(m => m.category === materialCategory));
    } else {
      setFilteredMaterials(materials);
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
          />
        </div>
      </div>
      
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
