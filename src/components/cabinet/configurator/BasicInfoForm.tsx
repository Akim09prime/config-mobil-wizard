
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Taxonomy {
  categories: {
    id: string;
    name: string;
    subcategories: {
      id: string;
      name: string;
    }[];
  }[];
}

interface BasicInfoFormProps {
  cabinetName: string;
  onNameChange: (name: string) => void;
  category: string;
  subcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  categories: Taxonomy['categories'];
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  cabinetName,
  onNameChange,
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  categories
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2 col-span-3 sm:col-span-1">
        <Label htmlFor="cabName">Nume corp</Label>
        <Input
          id="cabName"
          value={cabinetName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Corp bucătărie jos"
        />
      </div>
      
      <div className="space-y-2 col-span-3 sm:col-span-1">
        <Label htmlFor="category">Categorie</Label>
        <Select
          value={category}
          onValueChange={onCategoryChange}
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
          value={subcategory}
          onValueChange={onSubcategoryChange}
          disabled={!category}
        >
          <SelectTrigger id="subcategory">
            <SelectValue placeholder="Selectați subcategoria" />
          </SelectTrigger>
          <SelectContent>
            {category && categories
              .find(cat => cat.id === category)?.subcategories
              .map((subcat) => (
                <SelectItem key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicInfoForm;
