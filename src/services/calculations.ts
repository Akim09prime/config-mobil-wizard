// Calculation service for furniture costs

export interface Dimensions {
  width: number;  // mm
  height: number; // mm
  depth: number;  // mm
}

export interface MaterialItem {
  id: string;
  name: string;
  price: number; // price per square meter
  thickness?: number; // mm
}

export interface AccessoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PricingSettings {
  tva: number;        // percentage, e.g. 19
  manopera: number;   // percentage, e.g. 15
  transport: number;  // percentage, e.g. 5
  adaos: number;      // percentage, e.g. 10
  currency: string;   // e.g. "RON"
}

export interface PieceConfig {
  material: MaterialItem;
  width: number;
  height: number;
  quantity?: number;
}

// Calculate the cost of a single piece of material based on dimensions
export const calculatePieceCost = (
  material: MaterialItem,
  dimensions: Dimensions | { width: number; height: number },
  quantity: number = 1
): number => {
  if (!material || !dimensions) {
    return 0;
  }
  
  // Convert dimensions from mm to m and calculate area in square meters
  const width = dimensions.width / 1000;
  const height = dimensions.height / 1000;
  const area = width * height;
  
  // Calculate cost: price per m² × area × quantity
  return material.price * area * quantity;
};

// Calculate the cost of all pieces in a cabinet
export const calculateCabinetPieceCosts = (
  pieces: PieceConfig[]
): number => {
  if (!pieces || !pieces.length) {
    return 0;
  }
  
  return pieces.reduce((total, piece) => {
    const quantity = piece.quantity || 1;
    return total + calculatePieceCost(
      piece.material,
      { width: piece.width, height: piece.height },
      quantity
    );
  }, 0);
};

// Calculate the cost of hinges based on cabinet dimensions
export const calculateHingeCost = (
  width: number,
  hingePrice: number = 15
): { cost: number; quantity: number } => {
  // Rule: 2 hinges for cabinets up to 600mm width, +1 hinge per additional 600mm
  const baseHinges = 2;
  const additionalHinges = Math.max(0, Math.floor((width - 600) / 600));
  const totalHinges = baseHinges + additionalHinges;
  
  return { 
    quantity: totalHinges,
    cost: totalHinges * hingePrice 
  };
};

// Calculate the cost of all accessories
export const calculateAccessoryCost = (
  accessories: AccessoryItem[]
): number => {
  if (!accessories || !accessories.length) {
    return 0;
  }
  
  return accessories.reduce((total, accessory) => {
    return total + (accessory.price * accessory.quantity);
  }, 0);
};

// Calculate the total material cost of all cabinets in a project
export const calculateProjectMaterialTotal = (cabinets: any[]): number => {
  if (!cabinets || !cabinets.length) {
    return 0;
  }
  
  // Sum up material costs from all cabinets
  return cabinets.reduce((total, cabinet) => {
    // If the cabinet already has a calculated materialCost property, use that
    if (cabinet.materialCost !== undefined) {
      return total + cabinet.materialCost;
    }
    
    // Otherwise, if it has pieces, calculate from them
    if (cabinet.pieces && cabinet.pieces.length) {
      return total + calculateCabinetPieceCosts(cabinet.pieces);
    }
    
    return total;
  }, 0);
};

// Calculate the total accessory cost of all cabinets in a project
export const calculateProjectAccessoryTotal = (cabinets: any[]): number => {
  if (!cabinets || !cabinets.length) {
    return 0;
  }
  
  // Sum up accessory costs from all cabinets
  return cabinets.reduce((total, cabinet) => {
    // If the cabinet already has a calculated accessoryCost property, use that
    if (cabinet.accessoryCost !== undefined) {
      return total + cabinet.accessoryCost;
    }
    
    // Otherwise, if it has accessories, calculate from them
    if (cabinet.accessories && cabinet.accessories.length) {
      return total + calculateAccessoryCost(cabinet.accessories);
    }
    
    return total;
  }, 0);
};

// Calculate the total cost of a project including all settings
export const calculateProjectTotal = (
  rawMaterialCost: number,
  accessoryCost: number,
  pricingSettings: PricingSettings,
  includeTVA: boolean = true
): { 
  materialCost: number;
  accessoryCost: number;
  manoperaCost: number;
  transportCost: number;
  adaosCost: number;
  tvaCost: number;
  subtotal: number;
  total: number;
} => {
  // Base cost of materials and accessories
  const baseCost = rawMaterialCost + accessoryCost;
  
  // Calculate additional costs
  const manoperaCost = baseCost * (pricingSettings.manopera / 100);
  const transportCost = baseCost * (pricingSettings.transport / 100);
  const adaosCost = baseCost * (pricingSettings.adaos / 100);
  
  // Subtotal without TVA
  const subtotal = baseCost + manoperaCost + transportCost + adaosCost;
  
  // TVA
  const tvaCost = includeTVA ? subtotal * (pricingSettings.tva / 100) : 0;
  
  // Total with TVA
  const total = subtotal + tvaCost;
  
  return {
    materialCost: rawMaterialCost,
    accessoryCost,
    manoperaCost,
    transportCost,
    adaosCost,
    tvaCost,
    subtotal,
    total
  };
};

// Format currency amount
export const formatCurrency = (
  amount: number,
  currency: string = "RON",
  locale: string = "ro-RO"
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};
