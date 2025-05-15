import { v4 as uuidv4 } from 'uuid';

export enum StorageKeys {
  CABINETS = 'cabinets',
  MATERIALS = 'materials',
  ACCESSORIES = 'accessories',
  TAXONOMIES = 'taxonomies',
  PROJECTS = 'projects',
  USERS = 'users',
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

export function remove<T extends { id: string }>(key: StorageKeys, id: string): void {
  try {
    const items = getAll<T>(key);
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filteredItems));
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
  }
}

export function getTaxonomies(): any {
  try {
    const taxonomies = localStorage.getItem('taxonomies');
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
    localStorage.setItem('taxonomies', JSON.stringify(taxonomies));
    return true;
  } catch (error) {
    console.error('Error saving taxonomies:', error);
    return false;
  }
}
