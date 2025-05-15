
import React, { useState, useEffect } from 'react';
import { AccessoryItem } from '@/services/calculations';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaxonomySelect, SubcategorySelect } from '@/components/TaxonomySelect';

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
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('');
  const [filteredAccessories, setFilteredAccessories] = useState<AccessoryItem[]>(accessories);
  
  // Apply filters when category or subcategory changes
  useEffect(() => {
    let filtered = [...accessories];
    
    if (filterCategory) {
      filtered = filtered.filter(acc => acc.category === filterCategory);
      
      if (filterSubcategory) {
        filtered = filtered.filter(acc => acc.subcategory === filterSubcategory);
      }
    }
    
    setFilteredAccessories(filtered);
  }, [accessories, filterCategory, filterSubcategory]);
  
  const handleCategoryChange = (category: string) => {
    setFilterCategory(category);
    setFilterSubcategory(''); // Reset subcategory when category changes
  };
  
  const handleSubcategoryChange = (subcategory: string) => {
    setFilterSubcategory(subcategory);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accessoryCategory" className="mb-2 block">Categorie Accesorii</Label>
          <TaxonomySelect
            type="accessoryCategories"
            value={filterCategory}
            onChange={handleCategoryChange}
            placeholder="Toate categoriile"
          />
        </div>
        
        <div>
          <Label htmlFor="accessorySubcategory" className="mb-2 block">Subcategorie Accesorii</Label>
          <SubcategorySelect
            type="accessoryCategories"
            categoryName={filterCategory}
            value={filterSubcategory}
            onChange={handleSubcategoryChange}
            placeholder={filterCategory ? "Toate subcategoriile" : "Selectați prima dată o categorie"}
            disabled={!filterCategory}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {filteredAccessories.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Nu există accesorii disponibile pentru filtrele selectate
          </div>
        ) : (
          filteredAccessories.map((accessory) => (
            <Card key={accessory.id} className={selectedAccessories[accessory.id] ? 'border-primary' : ''}>
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <Checkbox 
                      id={`accessory-${accessory.id}`} 
                      checked={selectedAccessories[accessory.id] || false}
                      onCheckedChange={(checked) => onToggleAccessory(accessory.id, checked === true)}
                    />
                    <div>
                      <Label 
                        htmlFor={`accessory-${accessory.id}`} 
                        className="font-medium cursor-pointer"
                      >
                        {accessory.name}
                      </Label>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {accessory.category}
                        </Badge>
                        {accessory.subcategory && (
                          <Badge variant="outline" className="text-xs">
                            {accessory.subcategory}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`quantity-${accessory.id}`} className="text-sm whitespace-nowrap">
                        Cantitate:
                      </Label>
                      <Input
                        id={`quantity-${accessory.id}`}
                        type="number"
                        min="1"
                        value={accessoryQuantities[accessory.id] || 1}
                        onChange={(e) => onUpdateQuantity(accessory.id, parseInt(e.target.value) || 1)}
                        className="w-16"
                        disabled={!selectedAccessories[accessory.id]}
                      />
                    </div>
                    <div className="text-right whitespace-nowrap font-medium">
                      {accessory.price} RON / buc
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AccessoriesTab;
