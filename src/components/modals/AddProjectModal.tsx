import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageKeys, create } from '@/services/storage';
import { toast } from '@/components/ui/use-toast';

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ open, onClose, onProjectAdded }) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'cancelled'>('draft');
  const [total, setTotal] = useState('');

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
        total: parseFloat(total) || 0
      };

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
            <Label htmlFor="client">Client</Label>
            <Input 
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Introduceți numele clientului"
            />
          </div>

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
