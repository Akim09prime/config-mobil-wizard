
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaterialItem } from '@/services/calculations';

interface MaterialsTabProps {
  selectedMaterial: string;
  materials: MaterialItem[];
  onMaterialChange: (materialId: string) => void;
  cabinetDimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({
  selectedMaterial,
  materials,
  onMaterialChange,
  cabinetDimensions
}) => {
  const currentMaterial = materials.find(m => m.id === selectedMaterial);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mainMaterial">Material principal</Label>
        <Select
          value={selectedMaterial}
          onValueChange={onMaterialChange}
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
        {selectedMaterial && currentMaterial && (
          <div className="bg-muted p-4 rounded-md">
            <p><strong>Nume:</strong> {currentMaterial.name}</p>
            <p><strong>Preț:</strong> {currentMaterial.price} RON/m²</p>
            <p><strong>Grosime:</strong> {currentMaterial.thickness} mm</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h3 className="font-medium mb-2">Previzualizare piese:</h3>
        <div className="bg-muted p-4 rounded-md">
          <p>Număr piese: 5 (față, spate, laterale, bază, top)</p>
          <p>Suprafață totală: {((cabinetDimensions.width * cabinetDimensions.depth * 2 + 
            cabinetDimensions.height * cabinetDimensions.depth * 2 + 
            cabinetDimensions.width * cabinetDimensions.height) / 1000000).toFixed(2)} m²</p>
        </div>
      </div>
    </div>
  );
};

export default MaterialsTab;
