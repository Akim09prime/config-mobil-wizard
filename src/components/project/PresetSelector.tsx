
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';

const PresetSelector: React.FC = () => {
  const { furniturePresets, cabinets, setCabinets } = useProject();
  const [selectedPreset, setSelectedPreset] = React.useState<string>('none');

  const handlePresetSelect = (value: string) => {
    setSelectedPreset(value);
    if (value === 'none') {
      return;
    }
    
    const preset = furniturePresets.find((p) => p.id === value);
    if (preset) {
      // Add a deep copy of the preset to avoid reference issues
      const presetCopy = JSON.parse(JSON.stringify(preset));
      presetCopy.id = `cab_${Date.now()}`; // Ensure unique ID
      setCabinets([...cabinets, presetCopy]);
      
      // Show success toast
      toast({
        title: "Corp adăugat",
        description: `${preset.name} a fost adăugat în proiect`
      });
      
      // Reset the selector after adding
      setTimeout(() => {
        setSelectedPreset('none');
      }, 100);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="furniturePreset">Corpuri Presetate</Label>
      <Select onValueChange={handlePresetSelect} value={selectedPreset}>
        <SelectTrigger id="furniturePreset">
          <SelectValue placeholder="Selectează un corp presetat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Selectează...</SelectItem>
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
