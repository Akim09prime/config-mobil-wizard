
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';

const ProjectSummary: React.FC = () => {
  const { materialTotal, accessoryTotal } = useProject();

  return (
    <div>
      <h3 className="text-xl font-semibold">Total Materiale: {materialTotal} RON</h3>
      <h3 className="text-xl font-semibold">Total Accesorii: {accessoryTotal} RON</h3>
      <h3 className="text-2xl font-bold">
        Total Proiect: {materialTotal + accessoryTotal} RON
      </h3>
    </div>
  );
};

export default ProjectSummary;
