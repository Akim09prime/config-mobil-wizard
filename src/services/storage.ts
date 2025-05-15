
import { v4 as uuidv4 } from 'uuid';

export enum StorageKeys {
  CABINETS = 'cabinets',
  MATERIALS = 'materials',
  ACCESSORIES = 'accessories',
  TAXONOMIES = 'taxonomies',
  PROJECTS = 'projects',
  USERS = 'users',
  COMPONENTS = 'components',
}

export function getAll<T>(key: StorageKeys): T[] {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return [];
    }
    return JSON.parse(serializedData) as T[];
  } catch (error) {
    console.error(`Failed to get all ${key}:`, error);
    return [];
  }
}

export function getById<T extends { id: string }>(key: StorageKeys, id: string): T | undefined {
  try {
    const items = getAll<T>(key);
    return items.find(item => item.id === id);
  } catch (error) {
    console.error(`Failed to get ${key} by id:`, error);
    return undefined;
  }
}

export function getByName<T extends { name: string }>(key: StorageKeys, name: string): T | undefined {
  try {
    const items = getAll<T>(key);
    return items.find(item => item.name === name);
  } catch (error) {
    console.error(`Failed to get ${key} by name:`, error);
    return undefined;
  }
}

// Create function with proper type constraints
export function create<T extends Record<string, any>>(key: StorageKeys, item: T): T {
  try {
    const items = getAll<T>(key);
    const newItem = { 
      ...item, 
      id: item.hasOwnProperty('id') ? item.id : uuidv4() 
    };
    localStorage.setItem(key, JSON.stringify([...items, newItem]));
    return newItem;
  } catch (error) {
    console.error(`Failed to create ${key}:`, error);
    throw error;
  }
}

export function save<T extends Record<string, any>>(key: StorageKeys, item: T): T {
  try {
    const items = getAll<T>(key);
    const newItem = { ...item, id: uuidv4() };
    localStorage.setItem(key, JSON.stringify([...items, newItem]));
    return newItem;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    throw error;
  }
}

// Update function with proper typings
export function update<T extends { id: string }>(key: StorageKeys, item: T): T {
  try {
    const items = getAll<T>(key);
    const updatedItems = items.map(existingItem =>
      existingItem.id === item.id ? item : existingItem
    );
    localStorage.setItem(key, JSON.stringify(updatedItems));
    return item;
  } catch (error) {
    console.error(`Failed to update ${key}:`, error);
    throw error;
  }
}

export function remove(key: StorageKeys, id: string): boolean {
  try {
    const items = getAll(key);
    const filteredItems = items.filter(item => (item as any).id !== id);
    localStorage.setItem(key, JSON.stringify(filteredItems));
    return true;
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
    return false;
  }
}

// Updated interface to include proper structure with objects instead of strings
export interface Subcategory {
  id: string;
  name: string;
  image?: string;
  subcategories?: Subcategory[];
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  subcategories: Subcategory[];
}

export interface Taxonomies {
  categories: Category[];
  materialTypes: Category[];
  accessoryCategories: Category[];
  componentCategories: Category[];
}

export function getTaxonomies(): Taxonomies {
  try {
    const taxonomies = localStorage.getItem(StorageKeys.TAXONOMIES);
    return taxonomies ? JSON.parse(taxonomies) : {
      categories: [],
      materialTypes: [],
      accessoryCategories: [],
      componentCategories: []
    };
  } catch (error) {
    console.error('Error getting taxonomies from localStorage:', error);
    return {
      categories: [],
      materialTypes: [],
      accessoryCategories: [],
      componentCategories: []
    };
  }
}

export function saveTaxonomies(taxonomies: Taxonomies): boolean {
  try {
    localStorage.setItem(StorageKeys.TAXONOMIES, JSON.stringify(taxonomies));
    return true;
  } catch (error) {
    console.error('Error saving taxonomies:', error);
    return false;
  }
}

// Add alias for updateTaxonomies
export const updateTaxonomies = saveTaxonomies;

// Recursive function to find a subcategory by ID (for deep nested structures)
export function findSubcategoryById(
  categories: (Category | Subcategory)[],
  subcategoryId: string
): Subcategory | null {
  for (const category of categories) {
    if (category.id === subcategoryId) {
      return category as Subcategory;
    }
    
    if (category.subcategories && category.subcategories.length > 0) {
      const found = findSubcategoryById(category.subcategories, subcategoryId);
      if (found) return found;
    }
  }
  
  return null;
}

// Recursive function to add a subcategory to a parent (category or subcategory)
export function addSubcategoryToParent(
  categories: (Category | Subcategory)[],
  parentId: string,
  newSubcategory: Subcategory
): boolean {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === parentId) {
      if (!categories[i].subcategories) {
        categories[i].subcategories = [];
      }
      categories[i].subcategories.push(newSubcategory);
      return true;
    }
    
    if (categories[i].subcategories && categories[i].subcategories.length > 0) {
      const added = addSubcategoryToParent(
        categories[i].subcategories,
        parentId,
        newSubcategory
      );
      if (added) return true;
    }
  }
  
  return false;
}

// Function to find a category by ID in any taxonomy type
export function findCategoryById(
  taxonomies: Taxonomies,
  categoryId: string
): { category: Category | null; taxonomyType: keyof Taxonomies | null } {
  const taxonomyTypes: (keyof Taxonomies)[] = [
    'categories',
    'materialTypes',
    'accessoryCategories',
    'componentCategories'
  ];
  
  for (const type of taxonomyTypes) {
    const category = taxonomies[type].find(cat => cat.id === categoryId);
    if (category) {
      return { category, taxonomyType: type };
    }
    
    // Search in subcategories
    for (const cat of taxonomies[type]) {
      const subcategory = findSubcategoryById(cat.subcategories || [], categoryId);
      if (subcategory) {
        return { 
          category: subcategory as unknown as Category, 
          taxonomyType: type 
        };
      }
    }
  }
  
  return { category: null, taxonomyType: null };
}

// Function to get all items in a specific category (including subcategories)
export function getAllItemsInCategory(
  taxonomyType: keyof Taxonomies,
  categoryName: string,
  includeSubcategories: boolean = true
): any[] {
  const taxonomies = getTaxonomies();
  const category = taxonomies[taxonomyType].find(cat => cat.name === categoryName);
  
  if (!category) {
    return [];
  }
  
  let storageKey: StorageKeys;
  
  if (taxonomyType === 'materialTypes') {
    storageKey = StorageKeys.MATERIALS;
  } else if (taxonomyType === 'accessoryCategories') {
    storageKey = StorageKeys.ACCESSORIES;
  } else if (taxonomyType === 'componentCategories') {
    storageKey = StorageKeys.COMPONENTS;
  } else {
    storageKey = StorageKeys.CABINETS;
  }
  
  const items = getAll(storageKey);
  
  // Get top-level category items
  const directItems = items.filter(
    (item: any) => item.category === categoryName
  );
  
  if (!includeSubcategories || !category.subcategories) {
    return directItems;
  }
  
  // Get subcategory items recursively
  const subcategoryItems = getSubcategoryItems(
    category.subcategories,
    items,
    []
  );
  
  return [...directItems, ...subcategoryItems];
}

// Helper function to get items from subcategories recursively
function getSubcategoryItems(
  subcategories: Subcategory[],
  allItems: any[],
  result: any[] = []
): any[] {
  subcategories.forEach(subcategory => {
    const subcategoryItems = allItems.filter(
      (item: any) => item.subcategory === subcategory.name
    );
    
    result.push(...subcategoryItems);
    
    if (subcategory.subcategories && subcategory.subcategories.length > 0) {
      getSubcategoryItems(subcategory.subcategories, allItems, result);
    }
  });
  
  return result;
}

// Export/import functions for category-specific data
export function exportCategoryData(taxonomyType: keyof Taxonomies, categoryName: string): string {
  try {
    const taxonomies = getTaxonomies();
    const category = taxonomies[taxonomyType].find(cat => cat.name === categoryName);
    
    if (!category) {
      throw new Error(`Category ${categoryName} not found`);
    }
    
    // Find all items with this category and its subcategories
    const items = getAllItemsInCategory(taxonomyType, categoryName, true);
    
    return JSON.stringify({
      category,
      items
    });
  } catch (error) {
    console.error(`Failed to export data for category ${categoryName}:`, error);
    throw error;
  }
}

export function importCategoryData(data: string): boolean {
  try {
    const parsedData = JSON.parse(data);
    const { category, items } = parsedData;
    
    if (!category || !category.name || !category.id) {
      throw new Error('Invalid category data');
    }
    
    // Determine storage key based on category type
    let storageKey: StorageKeys;
    let taxonomyType: keyof Taxonomies;
    
    if (category.id.startsWith('mat_')) {
      storageKey = StorageKeys.MATERIALS;
      taxonomyType = 'materialTypes';
    } else if (category.id.startsWith('acc_')) {
      storageKey = StorageKeys.ACCESSORIES;
      taxonomyType = 'accessoryCategories';
    } else if (category.id.startsWith('comp_')) {
      storageKey = StorageKeys.COMPONENTS;
      taxonomyType = 'componentCategories';
    } else {
      taxonomyType = 'categories';
      storageKey = StorageKeys.CABINETS;
    }
    
    // Update or create the category
    const taxonomies = getTaxonomies();
    const categoryIndex = taxonomies[taxonomyType].findIndex(cat => cat.id === category.id);
    
    if (categoryIndex >= 0) {
      taxonomies[taxonomyType][categoryIndex] = category;
    } else {
      taxonomies[taxonomyType].push(category);
    }
    
    updateTaxonomies(taxonomies);
    
    // Import items if any
    if (items && items.length) {
      const existingItems = getAll(storageKey);
      const existingIds = new Set(existingItems.map((item: any) => item.id));
      
      // Filter out items that already exist
      const newItems = items.filter((item: any) => !existingIds.has(item.id));
      
      if (newItems.length) {
        localStorage.setItem(
          storageKey,
          JSON.stringify([...existingItems, ...newItems])
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import category data:', error);
    return false;
  }
}

// Settings interface
export interface Settings {
  tva: number;
  manopera: number;
  transport: number;
  adaos: number;
  currency: string;
  pdfFooter: string;
}

// Settings functions with proper typings
export function getSettings(): Settings {
  try {
    const settings = localStorage.getItem('settings');
    return settings ? JSON.parse(settings) : {
      tva: 19,
      manopera: 15,
      transport: 5,
      adaos: 10,
      currency: 'RON',
      pdfFooter: ''
    };
  } catch (error) {
    console.error('Error getting settings from localStorage:', error);
    return {
      tva: 19,
      manopera: 15,
      transport: 5,
      adaos: 10,
      currency: 'RON',
      pdfFooter: ''
    };
  }
}

export function updateSettings(settings: Settings): boolean {
  try {
    localStorage.setItem('settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// Projects and presets functions with proper typings
export function getProjects<T>(): T[] {
  return getAll<T>(StorageKeys.PROJECTS);
}

// Get furniture presets
export function getFurniturePresets<T>(): T[] {
  return getAll<T>(StorageKeys.CABINETS).filter(cabinet => (cabinet as any).isPreset === true);
}
