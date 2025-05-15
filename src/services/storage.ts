
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
}

export interface Category {
  id: string;
  name: string;
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

// Update getFurniturePresets to accept the Cabinet type
export function getFurniturePresets<T extends { isPreset?: boolean }>(): T[] {
  return getAll<T>(StorageKeys.CABINETS).filter(cabinet => cabinet.isPreset === true);
}
