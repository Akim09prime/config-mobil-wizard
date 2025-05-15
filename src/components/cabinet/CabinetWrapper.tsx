
import React, { useEffect } from 'react';
import CabinetConfigurator from './CabinetConfigurator';
import { normalizeCabinet } from '@/utils/cabinetHelpers';
import { toast } from '@/hooks/use-toast';

interface CabinetWrapperProps {
  open: boolean;
  onClose: () => void;
  onSave: (cabinet: Cabinet) => void;
  onCancel?: () => void;
  initialCabinet?: Partial<Cabinet>;
  maxWidth?: number;
  projectId?: string;
}

/**
 * A wrapper component for CabinetConfigurator that ensures
 * all Cabinet objects are properly normalized before they are used
 */
const CabinetWrapper: React.FC<CabinetWrapperProps> = ({
  open,
  onClose,
  onSave,
  onCancel,
  initialCabinet = {},
  maxWidth,
  projectId
}) => {
  // Add debugging log to verify the open prop value
  console.log('🔧 CabinetWrapper open:', open);
  console.log('🔧 CabinetWrapper initialCabinet:', initialCabinet);
  
  // Log when props change
  useEffect(() => {
    console.log('🔧 CabinetWrapper props changed - open:', open, 'initialCabinet:', initialCabinet);
  }, [open, initialCabinet]);

  // Normalize initial cabinet if provided
  const normalizedInitialCabinet = initialCabinet && Object.keys(initialCabinet).length > 0 
    ? normalizeCabinet(initialCabinet) 
    : undefined;
  
  // Wrap the onSave callback to normalize the cabinet before passing it up
  const handleSave = (cabinet: Cabinet) => {
    console.log('🔧 CabinetWrapper handleSave called with cabinet:', cabinet);
    try {
      const normalizedCabinet = normalizeCabinet(cabinet);
      if (!normalizedCabinet) {
        throw new Error("Cabinet normalization failed");
      }
      onSave(normalizedCabinet);
      toast({
        title: "Succes",
        description: "Corp adăugat în proiect"
      });
    } catch (error) {
      console.error("Eroare la salvarea corpului:", error);
      toast({
        title: "Eroare", 
        description: "Nu s-a putut adăuga corpul în proiect",
        variant: "destructive"
      });
    }
  };

  // If not open, don't render the CabinetConfigurator
  if (!open) {
    return null;
  }

  return (
    <CabinetConfigurator
      open={open}
      onClose={onClose}
      onSave={handleSave}
      onCancel={onCancel}
      initialCabinet={normalizedInitialCabinet}
      maxWidth={maxWidth}
      projectId={projectId}
    />
  );
};

export default CabinetWrapper;
