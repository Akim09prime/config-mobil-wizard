
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

// Added create function that was missing
export function create<T>(key: StorageKeys, item: T): T {
  try {
    const items = getAll<T>(key);
    const newItem = { ...item, id: item.hasOwnProperty('id') ? item.id : uuidv4() };
    localStorage.setItem(key, JSON.stringify([...items, newItem]));
    return newItem;
  } catch (error) {
    console.error(`Failed to create ${key}:`, error);
    throw error;
  }
}

export function save<T>(key: StorageKeys, item: T): T {
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

// Fixed update function to take 2 parameters instead of 3
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
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filteredItems));
    return true;
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
    return false;
  }
}

export function getTaxonomies(): any {
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

export function saveTaxonomies(taxonomies: any): boolean {
  try {
    localStorage.setItem(StorageKeys.TAXONOMIES, JSON.stringify(taxonomies));
    return true;
  } catch (error) {
    console.error('Error saving taxonomies:', error);
    return false;
  }
}

// Adding these aliases to match what's being imported
export const updateTaxonomies = saveTaxonomies;

// Adding missing functions for settings
export function getSettings(): any {
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

export function updateSettings(settings: any): boolean {
  try {
    localStorage.setItem('settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// Adding missing functions for projects and presets
export function getProjects() {
  return getAll(StorageKeys.PROJECTS);
}

export function getFurniturePresets() {
  return getAll(StorageKeys.CABINETS).filter(cabinet => cabinet.isPreset === true);
}

