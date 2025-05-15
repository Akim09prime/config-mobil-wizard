
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '@/contexts/ProjectContext';

const PresetSelector: React.FC = () => {
  const { furniturePresets, cabinets, setCabinets } = useProject();
  const [selectedPreset, setSelectedPreset] = React.useState<string>('');

  const handlePresetSelect = (value: string) => {
    setSelectedPreset(value);
    if (value === '') {
      return;
    }
    
    const preset = furniturePresets.find((p) => p.id === value);
    if (preset) {
      setCabinets([...cabinets, preset]);
    }
  };

  return (
    <div>
      <Label htmlFor="furniturePreset">Corpuri Presetate</Label>
      <Select onValueChange={handlePresetSelect} value={selectedPreset}>
        <SelectTrigger id="furniturePreset">
          <SelectValue placeholder="Selectează un corp presetat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Niciunul</SelectItem>
          {furniturePresets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PresetSelector;
