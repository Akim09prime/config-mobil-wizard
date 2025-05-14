
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTaxonomies } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface TaxonomySelectProps {
  type: 'categories' | 'accessoryCategories' | 'componentCategories';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TaxonomySelect: React.FC<TaxonomySelectProps> = ({
  type,
  value,
  onChange,
  placeholder = 'Selectează...',
  disabled = false
}) => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const taxonomiesData = getTaxonomies();
        if (taxonomiesData && taxonomiesData[type]) {
          setCategories(taxonomiesData[type]);
        }
        setLoading(false);
      } catch (error) {
        console.error(`Error loading ${type}:`, error);
        toast.error("Nu s-au putut încărca categoriile");
        setLoading(false);
      }
    };

    loadTaxonomies();
  }, [type]);

  if (loading) {
    return (
      <Select disabled value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Se încarcă..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select disabled={disabled} value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.length === 0 ? (
          <SelectItem value="no-options" disabled>
            Nu există opțiuni
          </SelectItem>
        ) : (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export const SubcategorySelect: React.FC<{
  type: 'categories' | 'accessoryCategories' | 'componentCategories';
  categoryName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ type, categoryName, value, onChange, placeholder = 'Selectează...', disabled = false }) => {
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (!categoryName) {
        setSubcategories([]);
        setLoading(false);
        return;
      }

      try {
        const taxonomiesData = getTaxonomies();
        if (taxonomiesData && taxonomiesData[type]) {
          const category = taxonomiesData[type].find(
            (cat: { name: string }) => cat.name === categoryName
          );
          
          if (category && category.subcategories) {
            setSubcategories(category.subcategories);
          } else {
            setSubcategories([]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error(`Error loading subcategories for ${categoryName}:`, error);
        toast.error("Nu s-au putut încărca subcategoriile");
        setLoading(false);
      }
    };

    loadSubcategories();
  }, [type, categoryName]);

  if (loading) {
    return (
      <Select disabled value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Se încarcă..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select disabled={disabled} value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {subcategories.length === 0 ? (
          <SelectItem value="no-options" disabled>
            Nu există subcategorii
          </SelectItem>
        ) : (
          subcategories.map((subcategory) => (
            <SelectItem key={subcategory.id} value={subcategory.name}>
              {subcategory.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
