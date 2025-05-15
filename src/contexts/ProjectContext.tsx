
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  calculateProjectMaterialTotal, 
  calculateProjectAccessoryTotal 
} from '@/services/calculations';

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
    const materialTotal = calculateProjectMaterialTotal(cabinets);
    const accessoryTotal = calculateProjectAccessoryTotal(cabinets);

    setMaterialTotal(materialTotal);
    setAccessoryTotal(accessoryTotal);
  }, [cabinets]);

  // Cabinet operations
  const addCabinet = (cabinet: Cabinet) => {
    setCabinets([...cabinets, cabinet]);
  };

  const updateCabinet = (id: string, updatedCabinet: Cabinet) => {
    const updatedCabinets = cabinets.map((cabinet) =>
      cabinet.id === id ? updatedCabinet : cabinet
    );
    setCabinets(updatedCabinets);
  };

  const deleteCabinet = (id: string) => {
    const updatedCabinets = cabinets.filter((cabinet) => cabinet.id !== id);
    setCabinets(updatedCabinets);
  };

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
