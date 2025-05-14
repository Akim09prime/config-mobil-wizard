
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageKeys, getTaxonomies, create } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface AddMaterialModalProps {
  open: boolean;
  onClose: () => void;
  onMaterialAdded: () => void;
}

interface MaterialType {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  category: string;
  price: number;
  thickness: number;
  dimensions: {
    width: number;
    height: number;
  };
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ open, onClose, onMaterialAdded }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [thickness, setThickness] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);

  useEffect(() => {
    const taxonomiesData = getTaxonomies();
    if (taxonomiesData && taxonomiesData.materialTypes) {
      setMaterialTypes(taxonomiesData.materialTypes);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !categoryId || !price || !thickness || !width || !height) {
      toast({
        title: 'Eroare',
        description: 'Toate câmpurile sunt obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      const selectedType = materialTypes.find(type => type.id === categoryId);
      
      const newMaterial: Material = {
        id: `mat_${Date.now()}`,
        name: name.trim(),
        category: selectedType ? selectedType.name : '',
        price: parseFloat(price),
        thickness: parseFloat(thickness),
        dimensions: {
          width: parseFloat(width),
          height: parseFloat(height)
        }
      };

      create(StorageKeys.MATERIALS, newMaterial);
      
      toast({
        title: 'Succes',
        description: 'Materialul a fost adăugat cu succes'
      });
      
      onMaterialAdded();
      onClose();
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga materialul',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adaugă material nou</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Introduceți numele materialului"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Tip Material</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selectați tipul materialului" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preț / m² (RON)</Label>
            <Input 
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thickness">Grosime (mm)</Label>
            <Input 
              id="thickness"
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Lățime (mm)</Label>
              <Input 
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Înălțime (mm)</Label>
              <Input 
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
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

export default AddMaterialModal;
