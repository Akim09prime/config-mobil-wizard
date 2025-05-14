
import React from 'react';
import CabinetConfigurator from './CabinetConfigurator';
import { normalizeCabinet } from '@/utils/cabinetHelpers';

interface CabinetWrapperProps {
  open: boolean;
  onClose: () => void;
  onSave: (cabinet: Cabinet) => void;
  onCancel?: () => void;
  initialCabinet?: Partial<Cabinet>;
  maxWidth?: number;
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
  maxWidth
}) => {
  // Normalize initial cabinet if provided
  const normalizedInitialCabinet = initialCabinet ? normalizeCabinet(initialCabinet) : undefined;
  
  // Wrap the onSave callback to normalize the cabinet before passing it up
  const handleSave = (cabinet: any) => {
    const normalizedCabinet = normalizeCabinet(cabinet);
    onSave(normalizedCabinet);
  };

  return (
    <CabinetConfigurator
      open={open}
      onClose={onClose}
      onSave={handleSave}
      onCancel={onCancel}
      initialCabinet={normalizedInitialCabinet}
      maxWidth={maxWidth}
    />
  );
};

export default CabinetWrapper;
