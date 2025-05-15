
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccessoryItem } from '@/services/calculations';

interface AccessoriesTabProps {
  accessories: AccessoryItem[];
  selectedAccessories: Record<string, boolean>;
  accessoryQuantities: Record<string, number>;
  onToggleAccessory: (id: string, checked: boolean) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const AccessoriesTab: React.FC<AccessoriesTabProps> = ({
  accessories,
  selectedAccessories,
  accessoryQuantities,
  onToggleAccessory,
  onUpdateQuantity
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accessories.map((accessory) => (
          <div key={accessory.id} className="flex items-center space-x-2 bg-card border p-3 rounded-md">
            <Checkbox
              id={accessory.id}
              checked={selectedAccessories[accessory.id] || false}
              onCheckedChange={(checked) => onToggleAccessory(accessory.id, checked === true)}
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
                  onChange={(e) => onUpdateQuantity(accessory.id, Number(e.target.value))}
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
    </div>
  );
};

export default AccessoriesTab;
