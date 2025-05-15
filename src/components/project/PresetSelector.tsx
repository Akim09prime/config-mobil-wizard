
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';

const PresetSelector: React.FC = () => {
  const { furniturePresets, cabinets, setCabinets } = useProject();
  const [selectedCategory, setSelectedCategory] = useState<string>("none");
  const [selectedPreset, setSelectedPreset] = useState<string>("none");
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredPresets, setFilteredPresets] = useState<Cabinet[]>([]);

  // Extract unique categories from furniture presets
  useEffect(() => {
    if (furniturePresets && furniturePresets.length > 0) {
      // Get unique categories from presets
      const uniqueCategories = Array.from(
        new Set(furniturePresets.map(preset => preset.category))
      ).filter(category => category); // Filter out empty categories
      
      setCategories(uniqueCategories);
      console.log("Categorii disponibile:", uniqueCategories);
    }
  }, [furniturePresets]);

  // Filter presets when category changes
  useEffect(() => {
    if (selectedCategory === "none") {
      setFilteredPresets([]);
      return;
    }

    const presetsInCategory = furniturePresets.filter(
      preset => preset.category === selectedCategory
    );
    
    setFilteredPresets(presetsInCategory);
    console.log(`Corpuri în categoria ${selectedCategory}:`, presetsInCategory);
    
    // Reset preset selection when changing category
    setSelectedPreset("none");
  }, [selectedCategory, furniturePresets]);

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
  };

  const handlePresetSelect = (value: string) => {
    setSelectedPreset(value);
    if (value === "none") {
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
      
      // Reset the preset selector after adding
      setTimeout(() => {
        setSelectedPreset("none");
      }, 100);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categorySelector">Categorie Mobilier</Label>
        <Select onValueChange={handleCategorySelect} value={selectedCategory}>
          <SelectTrigger id="categorySelector">
            <SelectValue placeholder="Selectează o categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Selectează categorie...</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="furniturePreset">Corpuri Presetate</Label>
        <Select 
          onValueChange={handlePresetSelect} 
          value={selectedPreset}
          disabled={selectedCategory === "none"}
        >
          <SelectTrigger id="furniturePreset">
            <SelectValue placeholder={selectedCategory === "none" ? "Selectează mai întâi o categorie" : "Selectează un corp"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Selectează corp...</SelectItem>
            {filteredPresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PresetSelector;
