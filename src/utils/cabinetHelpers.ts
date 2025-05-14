
/**
 * Ensures a cabinet object conforms to the Cabinet interface
 * by copying dimension properties to the top level
 */
export const normalizeCabinet = (cabinet: any): Cabinet => {
  if (!cabinet) return null as unknown as Cabinet;
  
  // Create a normalized cabinet with all required properties
  const normalizedCabinet: Cabinet = {
    ...cabinet,
    // Ensure width, height, depth exist at top level
    width: cabinet.width || cabinet.dimensions?.width || 0,
    height: cabinet.height || cabinet.dimensions?.height || 0,
    depth: cabinet.depth || cabinet.dimensions?.depth || 0,
    // Ensure all required properties exist
    id: cabinet.id || `cab_${Date.now()}`,
    name: cabinet.name || 'Unnamed Cabinet',
    category: cabinet.category || '',
    subcategory: cabinet.subcategory || '',
    price: cabinet.price || 0,
    image: cabinet.image || null,
    dimensions: {
      width: cabinet.dimensions?.width || cabinet.width || 0,
      height: cabinet.dimensions?.height || cabinet.height || 0,
      depth: cabinet.dimensions?.depth || cabinet.depth || 0
    }
  };
  
  return normalizedCabinet;
};

/**
 * Normalizes an array of cabinets
 */
export const normalizeCabinets = (cabinets: any[]): Cabinet[] => {
  if (!cabinets || !Array.isArray(cabinets)) return [];
  return cabinets.map(normalizeCabinet);
};
