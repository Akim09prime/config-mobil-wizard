
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, Subcategory, getTaxonomies, findSubcategoryById } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface TaxonomySelectProps {
  type: 'categories' | 'accessoryCategories' | 'materialTypes' | 'componentCategories';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  includeAllOption?: boolean;
}

export const TaxonomySelect: React.FC<TaxonomySelectProps> = ({
  type,
  value,
  onChange,
  placeholder = 'Selectează...',
  disabled = false,
  includeAllOption = true
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const taxonomiesData = getTaxonomies();
        if (taxonomiesData && taxonomiesData[type]) {
          setCategories(taxonomiesData[type]);
        } else {
          console.warn(`No taxonomies found for type: ${type}`);
          setCategories([]);
        }
        setLoading(false);
      } catch (error) {
        console.error(`Error loading ${type}:`, error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca categoriile",
          variant: "destructive"
        });
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
        {includeAllOption && value !== '' && (
          <SelectItem value="all">Toate categoriile</SelectItem>
        )}
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
  type: 'categories' | 'accessoryCategories' | 'materialTypes' | 'componentCategories';
  categoryName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  parentSubcategoryId?: string;
  includeAllOption?: boolean;
  onSubcategorySelect?: (subcategoryId: string) => void;
}> = ({ 
  type, 
  categoryName, 
  value, 
  onChange, 
  placeholder = 'Selectează...', 
  disabled = false,
  parentSubcategoryId,
  includeAllOption = true,
  onSubcategorySelect
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subcategoryIds, setSubcategoryIds] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSubcategories = async () => {
      if (!categoryName) {
        setSubcategories([]);
        setLoading(false);
        return;
      }

      try {
        const taxonomiesData = getTaxonomies();
        const idMap: Record<string, string> = {};
        
        if (taxonomiesData && taxonomiesData[type]) {
          const category = taxonomiesData[type].find(
            (cat: Category) => cat.name === categoryName
          );
          
          if (category) {
            if (parentSubcategoryId) {
              // Find nested subcategories
              let parent: Subcategory | null = null;
              
              // First check if parentSubcategoryId is directly under the category
              parent = category.subcategories.find(
                sub => sub.id === parentSubcategoryId
              ) || null;
              
              // If not found, search deeper in the hierarchy
              if (!parent) {
                parent = findSubcategoryById(category.subcategories, parentSubcategoryId);
              }
              
              if (parent) {
                const subs = parent.subcategories || [];
                setSubcategories(subs);
                
                // Create name to id mapping
                subs.forEach(sub => {
                  idMap[sub.name] = sub.id;
                });
                setSubcategoryIds(idMap);
              } else {
                setSubcategories([]);
              }
            } else {
              // Get top-level subcategories
              const subs = category.subcategories || [];
              setSubcategories(subs);
              
              // Create name to id mapping
              subs.forEach(sub => {
                idMap[sub.name] = sub.id;
              });
              setSubcategoryIds(idMap);
            }
          } else {
            console.warn(`No subcategories found for category: ${categoryName} in type: ${type}`);
            setSubcategories([]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error(`Error loading subcategories for ${categoryName}:`, error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca subcategoriile",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    loadSubcategories();
  }, [type, categoryName, parentSubcategoryId]);

  const handleValueChange = (newValue: string) => {
    onChange(newValue);
    
    // If there's a subcategory selection handler, send the subcategory ID
    if (onSubcategorySelect && newValue !== 'all' && newValue !== 'no-subcategories') {
      const subcategoryId = subcategoryIds[newValue];
      if (subcategoryId) {
        onSubcategorySelect(subcategoryId);
      }
    }
  };

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
    <Select disabled={disabled} value={value} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && value !== '' && (
          <SelectItem value="all">Toate subcategoriile</SelectItem>
        )}
        {subcategories.length === 0 ? (
          <SelectItem value="no-subcategories" disabled>
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

// New component to display a nested subcategory path with breadcrumbs
export const SubcategoryPath: React.FC<{
  type: 'categories' | 'accessoryCategories' | 'materialTypes' | 'componentCategories';
  categoryName: string;
  subcategoryPath: {id: string; name: string}[];
  onNavigate: (index: number) => void;
}> = ({ type, categoryName, subcategoryPath, onNavigate }) => {
  if (!categoryName) return null;
  
  return (
    <div className="flex items-center flex-wrap gap-1 text-sm mb-4">
      <span 
        className="cursor-pointer hover:underline font-medium"
        onClick={() => onNavigate(-1)}
      >
        {categoryName}
      </span>
      
      {subcategoryPath.map((item, index) => (
        <React.Fragment key={item.id}>
          <span className="text-muted-foreground">/</span>
          <span 
            className={`cursor-pointer hover:underline ${index === subcategoryPath.length - 1 ? 'font-medium' : ''}`}
            onClick={() => onNavigate(index)}
          >
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
