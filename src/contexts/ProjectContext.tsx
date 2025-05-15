
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  calculateProjectMaterialTotal, 
  calculateProjectAccessoryTotal 
} from '@/services/calculations';
import { normalizeCabinets } from '@/utils/cabinetHelpers';

interface ProjectContextType {
  projectName: string;
  setProjectName: React.Dispatch<React.SetStateAction<string>>;
  clientName: string;
  setClientName: React.Dispatch<React.SetStateAction<string>>;
  cabinets: Cabinet[];
  setCabinets: React.Dispatch<React.SetStateAction<Cabinet[]>>;
  furniturePresets: Cabinet[];
  setFurniturePresets: React.Dispatch<React.SetStateAction<Cabinet[]>>;
  materialTotal: number;
  accessoryTotal: number;
  addCabinet: (cabinet: Cabinet) => void;
  updateCabinet: (id: string, updatedCabinet: Cabinet) => void;
  deleteCabinet: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [furniturePresets, setFurniturePresets] = useState<Cabinet[]>([]);
  const [materialTotal, setMaterialTotal] = useState(0);
  const [accessoryTotal, setAccessoryTotal] = useState(0);

  // Calculate totals when cabinets change
  useEffect(() => {
    if (cabinets && cabinets.length > 0) {
      try {
        const materialTotal = calculateProjectMaterialTotal(cabinets);
        const accessoryTotal = calculateProjectAccessoryTotal(cabinets);
        
        setMaterialTotal(materialTotal);
        setAccessoryTotal(accessoryTotal);
        
        console.log('Project totals calculated:', { materialTotal, accessoryTotal });
      } catch (error) {
        console.error('Error calculating project totals:', error);
        setMaterialTotal(0);
        setAccessoryTotal(0);
      }
    } else {
      setMaterialTotal(0);
      setAccessoryTotal(0);
    }
  }, [cabinets]);

  // Cabinet operations
  const addCabinet = (cabinet: Cabinet) => {
    console.log('Adding cabinet to project:', cabinet);
    setCabinets(prevCabinets => {
      const newCabinets = [...prevCabinets, cabinet];
      console.log('New cabinets state:', newCabinets);
      return newCabinets;
    });
  };

  const updateCabinet = (id: string, updatedCabinet: Cabinet) => {
    console.log('Updating cabinet in project:', { id, cabinet: updatedCabinet });
    setCabinets(prevCabinets => {
      const newCabinets = prevCabinets.map(cabinet => 
        cabinet.id === id ? updatedCabinet : cabinet
      );
      console.log('Updated cabinets state:', newCabinets);
      return newCabinets;
    });
  };

  const deleteCabinet = (id: string) => {
    console.log('Deleting cabinet from project:', id);
    setCabinets(prevCabinets => {
      const newCabinets = prevCabinets.filter(cabinet => cabinet.id !== id);
      console.log('Cabinets after deletion:', newCabinets);
      return newCabinets;
    });
  };

  // When furniture presets are set, ensure they are normalized
  useEffect(() => {
    if (furniturePresets && furniturePresets.length > 0) {
      const normalized = normalizeCabinets(furniturePresets);
      if (JSON.stringify(normalized) !== JSON.stringify(furniturePresets)) {
        console.log('Normalizing furniture presets:', { 
          original: furniturePresets.length, 
          normalized: normalized.length 
        });
        setFurniturePresets(normalized);
      }
    }
  }, [furniturePresets]);

  const value = {
    projectName,
    setProjectName,
    clientName,
    setClientName,
    cabinets,
    setCabinets,
    furniturePresets,
    setFurniturePresets,
    materialTotal,
    accessoryTotal,
    addCabinet,
    updateCabinet,
    deleteCabinet,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
