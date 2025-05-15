
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageKeys, create, getFurniturePresets } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
  categories: Category[];
}

interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
  category?: string;
  subcategory?: string;
  cabinets?: Cabinet[];
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ open, onClose, onProjectAdded, categories }) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'cancelled'>('draft');
  const [total, setTotal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [furniturePresets, setFurniturePresets] = useState<Cabinet[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [filteredPresets, setFilteredPresets] = useState<Cabinet[]>([]);

  useEffect(() => {
    // Load furniture presets
    const presets = getFurniturePresets<Cabinet>();
    setFurniturePresets(presets || []);
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category && category.subcategories) {
        setSubcategories(category.subcategories);
      } else {
        setSubcategories([]);
      }
      setSelectedSubcategory('');
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory, categories]);

  // Filter presets by category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = furniturePresets.filter(preset => 
        preset.category === selectedCategory &&
        (!selectedSubcategory || preset.subcategory === selectedSubcategory)
      );
      setFilteredPresets(filtered);
    } else {
      setFilteredPresets([]);
    }
    setSelectedPreset('');
  }, [selectedCategory, selectedSubcategory, furniturePresets]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !client) {
      toast({
        title: 'Eroare',
        description: 'Numele proiectului și clientul sunt obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
      
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: name.trim(),
        client: client.trim(),
        date: formattedDate,
        status: status,
        total: parseFloat(total) || 0,
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        cabinets: []
      };

      // Add selected preset if any
      if (selectedPreset) {
        const preset = furniturePresets.find(p => p.id === selectedPreset);
        if (preset) {
          // Create a deep copy to avoid reference issues
          const presetCopy = JSON.parse(JSON.stringify(preset));
          presetCopy.id = `cab_${Date.now()}`;
          newProject.cabinets = [presetCopy];
          
          // Update total if needed
          if (!total || parseFloat(total) === 0) {
            newProject.total = preset.price || 0;
          }
        }
      }

      create(StorageKeys.PROJECTS, newProject);
      
      toast({
        title: 'Succes',
        description: 'Proiectul a fost adăugat cu succes'
      });
      
      onProjectAdded();
      onClose();
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga proiectul',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adaugă proiect nou</DialogTitle>
          <DialogDescription>
            Completați detaliile pentru a crea un proiect nou.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume Proiect</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Introduceți numele proiectului"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Nume Beneficiar</Label>
            <Input 
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Introduceți numele clientului"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categorie</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selectați categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nicio categorie</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && subcategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategorie</Label>
              <Select 
                value={selectedSubcategory} 
                onValueChange={handleSubcategoryChange}
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Selectați subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nicio subcategorie</SelectItem>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.name}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filteredPresets.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="preset">Corp Presetat</Label>
              <Select 
                value={selectedPreset} 
                onValueChange={handlePresetChange}
              >
                <SelectTrigger id="preset">
                  <SelectValue placeholder="Selectați un corp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Niciun corp</SelectItem>
                  {filteredPresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as 'draft' | 'active' | 'completed' | 'cancelled')}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selectați statusul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Schiță</SelectItem>
                <SelectItem value="active">Activ</SelectItem>
                <SelectItem value="completed">Finalizat</SelectItem>
                <SelectItem value="cancelled">Anulat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total estimat (RON)</Label>
            <Input 
              id="total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit">
              Adaugă
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
