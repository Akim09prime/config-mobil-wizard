
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageKeys, update, getFurniturePresets } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
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

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: Project | null;
  categories: Category[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  open, 
  onClose, 
  onProjectUpdated, 
  project,
  categories 
}) => {
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
  
  // Load project data when project changes
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setClient(project.client || '');
      setStatus(project.status || 'draft');
      setTotal(project.total ? project.total.toString() : '');
      setSelectedCategory(project.category || '');
      setSelectedSubcategory(project.subcategory || '');
    }
  }, [project]);

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
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  // Filter presets by category and subcategory
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
  }, [selectedCategory, selectedSubcategory, furniturePresets]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value !== selectedCategory) {
      setSelectedSubcategory('');
    }
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
  };

  const handleAddPreset = () => {
    if (!selectedPreset || !project) return;
    
    const preset = furniturePresets.find(p => p.id === selectedPreset);
    if (preset) {
      try {
        // Create a deep copy to avoid reference issues
        const presetCopy = JSON.parse(JSON.stringify(preset));
        presetCopy.id = `cab_${Date.now()}`;
        
        const updatedProject = { 
          ...project, 
          cabinets: [...(project.cabinets || []), presetCopy] 
        };
        
        // Update project with new cabinet
        update(StorageKeys.PROJECTS, updatedProject);
        
        toast({
          title: 'Succes',
          description: 'Corp adăugat la proiect'
        });
        
        onProjectUpdated();
        setSelectedPreset('');
      } catch (error) {
        console.error('Error adding preset to project:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut adăuga corpul la proiect',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;
    
    if (!name || !client) {
      toast({
        title: 'Eroare',
        description: 'Numele proiectului și clientul sunt obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      const updatedProject: Project = {
        ...project,
        name: name.trim(),
        client: client.trim(),
        status: status,
        total: parseFloat(total) || 0,
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined
      };

      update(StorageKeys.PROJECTS, updatedProject);
      
      toast({
        title: 'Succes',
        description: 'Proiectul a fost actualizat cu succes'
      });
      
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza proiectul',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editează proiect</DialogTitle>
          <DialogDescription>
            Modificați detaliile proiectului.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nume Proiect</Label>
            <Input 
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Introduceți numele proiectului"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-client">Nume Beneficiar</Label>
            <Input 
              id="edit-client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Introduceți numele clientului"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Categorie</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Selectați categoria" />
              </SelectTrigger>
              <SelectContent>
                {/* Changed from empty string to "none" to avoid the error */}
                <SelectItem value="none">Nicio categorie</SelectItem>
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
              <Label htmlFor="edit-subcategory">Subcategorie</Label>
              <Select 
                value={selectedSubcategory} 
                onValueChange={handleSubcategoryChange}
              >
                <SelectTrigger id="edit-subcategory">
                  <SelectValue placeholder="Selectați subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {/* Changed from empty string to "none" to avoid the error */}
                  <SelectItem value="none">Nicio subcategorie</SelectItem>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-preset">Adaugă Corp Presetat</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={selectedPreset} 
                    onValueChange={handlePresetChange}
                  >
                    <SelectTrigger id="edit-preset" className="flex-1">
                      <SelectValue placeholder="Selectați un corp" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Changed from empty string to "none" to avoid the error */}
                      <SelectItem value="none">Selectează corp...</SelectItem>
                      {filteredPresets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    onClick={handleAddPreset}
                    disabled={!selectedPreset || selectedPreset === "none"}
                  >
                    Adaugă
                  </Button>
                </div>
              </div>
              
              {project?.cabinets && project.cabinets.length > 0 && (
                <div className="border rounded p-2">
                  <Label className="block mb-2">Corpuri în proiect:</Label>
                  <div className="space-y-1 text-sm">
                    {project.cabinets.map((cabinet, index) => (
                      <div key={cabinet.id} className="flex justify-between">
                        <span>• {cabinet.name}</span>
                        <span className="text-muted-foreground">{cabinet.price} RON</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as 'draft' | 'active' | 'completed' | 'cancelled')}
            >
              <SelectTrigger id="edit-status">
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
            <Label htmlFor="edit-total">Total estimat (RON)</Label>
            <Input 
              id="edit-total"
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
              Salvează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
