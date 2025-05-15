
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CabinetConfiguratorHeaderProps {
  projectId?: string;
}

const CabinetConfiguratorHeader: React.FC<CabinetConfiguratorHeaderProps> = ({ projectId }) => {
  return (
    <DialogHeader>
      <DialogTitle>Configurator Corp Mobilier</DialogTitle>
      <DialogDescription>
        Configurați dimensiunile, materialele și accesoriile pentru corpul de mobilier.
        {projectId && <span className="text-xs ml-1">(Proiect: {projectId})</span>}
      </DialogDescription>
    </DialogHeader>
  );
};

export default CabinetConfiguratorHeader;
