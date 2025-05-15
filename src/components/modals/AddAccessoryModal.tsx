import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageKeys, getTaxonomies, create } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface AddAccessoryModalProps {
  open: boolean;
  onClose: () => void;
  onAccessoryAdded: () => void;
}

interface AccessoryCategory {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
}

interface Accessory {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  stock: number;
}

const AddAccessoryModal: React.FC<AddAccessoryModalProps> = ({ open, onClose, onAccessoryAdded }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categories, setCategories] = useState<AccessoryCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    const taxonomiesData = getTaxonomies();
    if (taxonomiesData && taxonomiesData.accessoryCategories) {
      setCategories(taxonomiesData.accessoryCategories);
    }
  }, [open]);

  useEffect(() => {
    // Reset subcategory when category changes
    setSubcategoryId('');
    
    // Load subcategories based on selected category
    if (categoryId) {
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      if (selectedCategory && selectedCategory.subcategories) {
        setSubcategories(selectedCategory.subcategories);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [categoryId, categories]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setName('');
      setCategoryId('');
      setSubcategoryId('');
      setPrice('');
      setStock('');
      setSubcategories([]);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !categoryId || !price) {
      toast({
        title: 'Eroare',
        description: 'Numele, categoria și prețul sunt câmpuri obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      const selectedSubcategory = subcategories.find(subcat => subcat.id === subcategoryId);
      
      const newAccessory: Accessory = {
        id: `acc_${Date.now()}`,
        name: name.trim(),
        category: selectedCategory ? selectedCategory.name : '',
        subcategory: selectedSubcategory ? selectedSubcategory.name : undefined,
        price: parseFloat(price),
        stock: parseInt(stock) || 0
      };

      create(StorageKeys.ACCESSORIES, newAccessory);
      
      toast({
        title: 'Succes',
        description: 'Accesoriul a fost adăugat cu succes'
      });
      
      onAccessoryAdded();
      onClose();
    } catch (error) {
      console.error('Error adding accessory:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga accesoriul',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adaugă accesoriu nou</DialogTitle>
          <DialogDescription>
            Completați detaliile pentru a adăuga un accesoriu nou în sistem.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Introduceți numele accesoriului"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categorie</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selectați categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategorie</Label>
            <Select 
              value={subcategoryId} 
              onValueChange={setSubcategoryId} 
              disabled={subcategories.length === 0}
            >
              <SelectTrigger id="subcategory">
                <SelectValue placeholder={subcategories.length === 0 ? "Nicio subcategorie disponibilă" : "Selectați subcategoria"} />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preț (RON)</Label>
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
            <Label htmlFor="stock">Stoc (buc)</Label>
            <Input 
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
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

export default AddAccessoryModal;
