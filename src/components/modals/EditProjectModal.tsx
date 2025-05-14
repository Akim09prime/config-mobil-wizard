
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageKeys, update, getById } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: {
    id: string;
    name: string;
    client: string;
    date: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    total: number;
  } | null;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ open, onClose, onProjectUpdated, project }) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'cancelled'>('draft');
  const [total, setTotal] = useState('');

  useEffect(() => {
    if (open && project) {
      setName(project.name);
      setClient(project.client);
      setStatus(project.status);
      setTotal(project.total.toString());
    }
  }, [open, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !name || !client) {
      toast.error('Numele proiectului și clientul sunt obligatorii');
      return;
    }

    try {
      const updatedProject = {
        name: name.trim(),
        client: client.trim(),
        status: status,
        total: parseFloat(total) || 0
      };

      update(StorageKeys.PROJECTS, project.id, updatedProject);
      
      toast.success('Proiectul a fost actualizat cu succes');
      
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Nu s-a putut actualiza proiectul');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editează proiect</DialogTitle>
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
              Salvează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
