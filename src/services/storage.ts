// Storage service for managing data persistence

// Generic interface for all storable items
interface StorableItem {
  id: string;
  [key: string]: any;
}

// Storage keys for different entity types
export enum StorageKeys {
  CABINETS = 'cm_cabinets',
  MATERIALS = 'cm_materials',
  ACCESSORIES = 'cm_accessories',
  COMPONENTS = 'cm_components',
  TAXONOMIES = 'cm_taxonomies',
  SETTINGS = 'cm_settings',
  PROJECTS = 'cm_projects',
}

// Prefill data if empty
const defaultData = {
  [StorageKeys.MATERIALS]: [
    { 
      id: 'mat1', 
      name: 'PAL Alb', 
      category: 'pal',
      price: 120, 
      thickness: 18,
      dimensions: { width: 2800, height: 2070 }
    },
    { 
      id: 'mat2', 
      name: 'MDF Stejar Sonoma', 
      category: 'mdf',
      price: 180, 
      thickness: 18,
      dimensions: { width: 2800, height: 2070 }
    },
    { 
      id: 'mat3', 
      name: 'HDF Alb', 
      category: 'hdf',
      price: 90, 
      thickness: 3,
      dimensions: { width: 2800, height: 2070 }
    },
  ],
  [StorageKeys.ACCESSORIES]: [
    { 
      id: 'acc1', 
      name: 'Balama aplicată', 
      category: 'balamale',
      price: 15, 
      stock: 200
    },
    { 
      id: 'acc2', 
      name: 'Mâner mobilier 128mm', 
      category: 'manere',
      price: 12, 
      stock: 150
    },
    { 
      id: 'acc3', 
      name: 'Sertar metailic 500mm', 
      category: 'sertare',
      price: 95, 
      stock: 40
    },
  ],
  [StorageKeys.CABINETS]: [
    {
      id: 'cab1',
      name: 'Corp Bucătărie Jos 600',
      category: 'bucatarie',
      subcategory: 'jos',
      dimensions: { width: 600, height: 720, depth: 560 },
      materials: [
        { id: 'mat1', name: 'PAL Alb', quantity: 1 }
      ],
      accessories: [
        { id: 'acc1', name: 'Balama aplicată', quantity: 2 }
      ],
      price: 450,
      image: null
    },
    {
      id: 'cab2',
      name: 'Corp Bucătărie Sus 800',
      category: 'bucatarie',
      subcategory: 'sus',
      dimensions: { width: 800, height: 720, depth: 320 },
      materials: [
        { id: 'mat1', name: 'PAL Alb', quantity: 1 }
      ],
      accessories: [
        { id: 'acc1', name: 'Balama aplicată', quantity: 2 }
      ],
      price: 380,
      image: null
    },
  ],
  [StorageKeys.TAXONOMIES]: {
    categories: [
      {
        id: 'cat1',
        name: 'Bucătărie',
        subcategories: [
          { id: 'subcat1', name: 'Corp Jos' },
          { id: 'subcat2', name: 'Corp Sus' },
          { id: 'subcat3', name: 'Coloană' }
        ]
      },
      {
        id: 'cat2',
        name: 'Dormitor',
        subcategories: [
          { id: 'subcat4', name: 'Șifonier' },
          { id: 'subcat5', name: 'Comodă' },
          { id: 'subcat6', name: 'Pat' }
        ]
      },
    ],
    materialTypes: [
      { id: 'pal', name: 'PAL' },
      { id: 'mdf', name: 'MDF' },
      { id: 'hdf', name: 'HDF' },
      { id: 'lemn_masiv', name: 'Lemn masiv' }
    ],
    accessoryCategories: [
      { id: 'balamale', name: 'Balamale' },
      { id: 'manere', name: 'Mânere' },
      { id: 'sertare', name: 'Sisteme sertare' },
      { id: 'polite', name: 'Sisteme polițe' }
    ]
  },
  [StorageKeys.SETTINGS]: {
    tva: 19,
    manopera: 15,
    transport: 5,
    adaos: 10,
    currency: 'RON',
    pdfFooter: 'Configurator Mobila - www.configurator-mobila.ro - Tel: 0712 345 678'
  },
  [StorageKeys.PROJECTS]: []
};

// Get furniture presets for project
export const getFurniturePresets = async (): Promise<any[]> => {
  try {
    // For now, just return cabinets as presets
    return Promise.resolve(getAll(StorageKeys.CABINETS));
  } catch (error) {
    console.error('Error getting furniture presets:', error);
    return Promise.resolve([]);
  }
};

// Get all items of a specific type
export const getAll = <T extends StorableItem>(key: StorageKeys): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      // Initialize with default data if available
      if (defaultData[key]) {
        localStorage.setItem(key, JSON.stringify(defaultData[key]));
        return defaultData[key] as T[];
      }
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting data for ${key}:`, error);
    return [];
  }
};

// Get a single item by ID
export const getById = <T extends StorableItem>(key: StorageKeys, id: string): T | null => {
  try {
    const items = getAll<T>(key);
    return items.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`Error getting item ${id} from ${key}:`, error);
    return null;
  }
};

// Save or create a new item
export const save = <T extends StorableItem>(key: StorageKeys, item: T): T => {
  try {
    const items = getAll<T>(key);
    const updatedItems = [...items, item];
    localStorage.setItem(key, JSON.stringify(updatedItems));
    return item;
  } catch (error) {
    console.error(`Error saving item in ${key}:`, error);
    throw new Error(`Failed to save item in ${key}`);
  }
};

// Create a new item (keeping this for backward compatibility)
export const create = <T extends StorableItem>(key: StorageKeys, item: T): T => {
  return save(key, item);
};

// Update an existing item
export const update = <T extends StorableItem>(key: StorageKeys, id: string, updates: Partial<T>): T => {
  try {
    const items = getAll<T>(key);
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error(`Item with id ${id} not found in ${key}`);
    }
    
    const updatedItem = { ...items[itemIndex], ...updates };
    items[itemIndex] = updatedItem;
    
    localStorage.setItem(key, JSON.stringify(items));
    return updatedItem;
  } catch (error) {
    console.error(`Error updating item ${id} in ${key}:`, error);
    throw error;
  }
};

// Delete an item
export const remove = <T extends StorableItem>(key: StorageKeys, id: string): boolean => {
  try {
    const items = getAll<T>(key);
    const filteredItems = items.filter(item => item.id !== id);
    
    if (items.length === filteredItems.length) {
      return false; // Item not found
    }
    
    localStorage.setItem(key, JSON.stringify(filteredItems));
    return true;
  } catch (error) {
    console.error(`Error deleting item ${id} from ${key}:`, error);
    return false;
  }
};

// Get settings
export const getSettings = (): any => {
  try {
    const settings = localStorage.getItem(StorageKeys.SETTINGS);
    if (!settings) {
      // Initialize with default settings
      localStorage.setItem(
        StorageKeys.SETTINGS, 
        JSON.stringify(defaultData[StorageKeys.SETTINGS])
      );
      return defaultData[StorageKeys.SETTINGS];
    }
    return JSON.parse(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    return defaultData[StorageKeys.SETTINGS];
  }
};

// Update settings
export const updateSettings = (updates: any): any => {
  try {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem(StorageKeys.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Get taxonomies
export const getTaxonomies = (): any => {
  try {
    const taxonomies = localStorage.getItem(StorageKeys.TAXONOMIES);
    if (!taxonomies) {
      // Initialize with default taxonomies
      localStorage.setItem(
        StorageKeys.TAXONOMIES, 
        JSON.stringify(defaultData[StorageKeys.TAXONOMIES])
      );
      return defaultData[StorageKeys.TAXONOMIES];
    }
    return JSON.parse(taxonomies);
  } catch (error) {
    console.error('Error getting taxonomies:', error);
    return defaultData[StorageKeys.TAXONOMIES];
  }
};

// Update taxonomies
export const updateTaxonomies = (updates: any): any => {
  try {
    const currentTaxonomies = getTaxonomies();
    const updatedTaxonomies = { ...currentTaxonomies, ...updates };
    localStorage.setItem(StorageKeys.TAXONOMIES, JSON.stringify(updatedTaxonomies));
    return updatedTaxonomies;
  } catch (error) {
    console.error('Error updating taxonomies:', error);
    throw error;
  }
};
