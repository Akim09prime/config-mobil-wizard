
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';

const ProjectSummary: React.FC = () => {
  const { materialTotal, accessoryTotal } = useProject();
  
  // Ensure we have valid numbers for the totals
  const materialTotalValue = materialTotal || 0;
  const accessoryTotalValue = accessoryTotal || 0;
  const totalValue = materialTotalValue + accessoryTotalValue;

  return (
    <div>
      <h3 className="text-xl font-semibold">Total Materiale: {materialTotalValue} RON</h3>
      <h3 className="text-xl font-semibold">Total Accesorii: {accessoryTotalValue} RON</h3>
      <h3 className="text-2xl font-bold">
        Total Proiect: {totalValue} RON
      </h3>
    </div>
  );
};

export default ProjectSummary;
