
/**
 * Ensures a cabinet object conforms to the Cabinet interface
 * by copying dimension properties to the top level
 */
export const normalizeCabinet = (cabinet: any): Cabinet => {
  if (!cabinet) {
    console.error("Attempted to normalize a null or undefined cabinet");
    return {
      id: `cab_${Date.now()}`,
      name: 'Corp nou',
      width: 600,
      height: 720,
      depth: 560,
      price: 0,
      materials: [],
      accessories: [],
      totalCost: 0,
      pieces: [],
      dimensions: {
        width: 600,
        height: 720,
        depth: 560
      },
      image: null,
      category: '',
      subcategory: ''
    };
  }
  
  // Create a normalized cabinet with all required properties
  const normalizedCabinet: Cabinet = {
    ...cabinet,
    // Ensure width, height, depth exist at top level
    width: cabinet.width || cabinet.dimensions?.width || 0,
    height: cabinet.height || cabinet.dimensions?.height || 0,
    depth: cabinet.depth || cabinet.dimensions?.depth || 0,
    // Ensure all required properties exist
    id: cabinet.id || `cab_${Date.now()}`,
    name: cabinet.name || 'Corp nou',
    category: cabinet.category || '',
    subcategory: cabinet.subcategory || '',
    price: cabinet.price || 0,
    materials: cabinet.materials || [],
    accessories: cabinet.accessories || [],
    totalCost: cabinet.totalCost || 0,
    pieces: cabinet.pieces || [],
    image: cabinet.image || null,
    dimensions: {
      width: cabinet.dimensions?.width || cabinet.width || 0,
      height: cabinet.dimensions?.height || cabinet.height || 0,
      depth: cabinet.dimensions?.depth || cabinet.depth || 0
    }
  };
  
  console.log("Normalizare corp:", { 
    original: cabinet,
    normalized: normalizedCabinet
  });
  
  return normalizedCabinet;
};

/**
 * Normalizes an array of cabinets
 */
export const normalizeCabinets = (cabinets: any[]): Cabinet[] => {
  if (!cabinets || !Array.isArray(cabinets)) {
    console.warn("Attempted to normalize non-array cabinets:", cabinets);
    return [];
  }
  
  try {
    return cabinets.map(cab => normalizeCabinet(cab));
  } catch (error) {
    console.error("Error normalizing cabinets:", error);
    return [];
  }
};
