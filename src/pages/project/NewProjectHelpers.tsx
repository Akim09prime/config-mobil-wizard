
import React from 'react';
import { normalizeCabinet, normalizeCabinets } from '@/utils/cabinetHelpers';

/**
 * Handles adding a cabinet to a project, ensuring it has all required properties
 */
export const addCabinetToProject = (
  existingCabinets: Cabinet[], 
  newCabinet: Cabinet
): Cabinet[] => {
  const normalizedNewCabinet = normalizeCabinet(newCabinet);
  return [...existingCabinets, normalizedNewCabinet];
};

/**
 * Handles updating a project with a new cabinet list
 */
export const updateProjectCabinets = (project: any, cabinets: any[]): any => {
  const normalizedCabinets = normalizeCabinets(cabinets);
  
  return {
    ...project,
    cabinets: normalizedCabinets
  };
};
