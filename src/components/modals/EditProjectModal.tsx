import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { StorageKeys, update, getAll } from '@/services/storage';
import { toast } from '@/components/ui/toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import CabinetWrapper from '@/components/cabinet/CabinetWrapper';
import { normalizeCabinet } from '@/utils/cabinetHelpers';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: Project | null;
}

interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
  cabinets?: Cabinet[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ open, onClose, onProjectUpdated, project }) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'cancelled'>('draft');
  const [total, setTotal] = useState('');
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [availableCabinets, setAvailableCabinets] = useState<Cabinet[]>([]);
  const [showCabinetConfigurator, setShowCabinetConfigurator] = useState(false);
  const [cabinetToEdit, setCabinetToEdit] = useState<Cabinet | null>(null);
  const [showCabinetConfiguratorEdit, setShowCabinetConfiguratorEdit] = useState(false);

  useEffect(() => {
    // Load available cabinets when modal opens
    if (open) {
      const loadedCabinets = getAll<Cabinet>(StorageKeys.CABINETS);
      setAvailableCabinets(loadedCabinets || []);
    }
  }, [open]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setClient(project.client);
      setStatus(project.status);
      setTotal(project.total.toString());
      setCabinets(project.cabinets || []);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !name || !client) {
      toast({
        title: "Eroare",
        description: "Numele proiectului și clientul sunt obligatorii",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate new total based on cabinets if needed
      let projectTotal = parseFloat(total) || 0;
      if (cabinets.length > 0) {
        projectTotal = cabinets.reduce((sum, cab) => sum + (cab.price || 0), 0);
      }

      const updatedProject: Project = {
        ...project,
        name: name.trim(),
        client: client.trim(),
        status: status,
        total: projectTotal,
        cabinets: cabinets
      };

      update(StorageKeys.PROJECTS, project.id, updatedProject);
      
      toast({
        title: "Succes",
        description: "Proiectul a fost actualizat cu succes"
      });
      
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza proiectul",
        variant: "destructive"
      });
    }
  };

  const handleAddCabinet = (cabinet: Cabinet) => {
    // Create a copy of the cabinet with a new ID to avoid referencing the original
    const cabinetCopy = {
      ...cabinet,
      id: `cab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    setCabinets([...cabinets, cabinetCopy]);
  };

  const handleEditCabinet = (cabinet: Cabinet) => {
    setCabinetToEdit(cabinet);
    setShowCabinetConfiguratorEdit(true);
  };

  const handleDeleteCabinet = (cabinetId: string) => {
    setCabinets(cabinets.filter(cabinet => cabinet.id !== cabinetId));
  };

  if (!project) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editare proiect</DialogTitle>
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

          {/* Cabinets Section */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="text-lg font-medium">Corpuri de mobilier</h3>
            
            <div className="flex gap-2">
              {/* Button to add new custom cabinet */}
              <Button 
                type="button" 
                onClick={() => setShowCabinetConfigurator(true)}
                className="flex items-center gap-1"
              >
                <PlusIcon size={16} />
                Corp Nou
              </Button>
              
              {/* Dropdown to select from existing cabinets */}
              <Select onValueChange={(value) => {
                const selectedCabinet = availableCabinets.find(cab => cab.id === value);
                if (selectedCabinet) handleAddCabinet(selectedCabinet);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Adaugă corp existent" />
                </SelectTrigger>
                <SelectContent>
                  {availableCabinets.map(cabinet => (
                    <SelectItem key={cabinet.id} value={cabinet.id}>{cabinet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Display current cabinets */}
            {cabinets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {cabinets.map(cabinet => (
                  <Card key={cabinet.id} className="overflow-hidden">
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">{cabinet.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-sm">
                      <p>Dimensiuni: {cabinet.width}x{cabinet.height}x{cabinet.depth} cm</p>
                      <p className="font-semibold">Preț: {cabinet.price} RON</p>
                    </CardContent>
                    <CardFooter className="p-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditCabinet(cabinet)}
                        className="mr-2"
                      >
                        <PencilIcon size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteCabinet(cabinet.id)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Nu există corpuri adăugate la acest proiect
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit">
              Actualizează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Cabinet configurator for new cabinets */}
      {showCabinetConfigurator && (
        <CabinetWrapper
          open={showCabinetConfigurator}
          onClose={() => setShowCabinetConfigurator(false)}
          onSave={(cabinet) => {
            handleAddCabinet(normalizeCabinet(cabinet));
            setShowCabinetConfigurator(false);
          }}
        />
      )}
      
      {/* Cabinet configurator for editing cabinets */}
      {showCabinetConfiguratorEdit && cabinetToEdit && (
        <CabinetWrapper
          open={showCabinetConfiguratorEdit}
          onClose={() => {
            setShowCabinetConfiguratorEdit(false);
            setCabinetToEdit(null);
          }}
          onSave={(cabinet) => {
            const updatedCabinets = cabinets.map(cab => 
              cab.id === cabinetToEdit.id ? normalizeCabinet(cabinet) : cab
            );
            setCabinets(updatedCabinets);
            setShowCabinetConfiguratorEdit(false);
            setCabinetToEdit(null);
          }}
          initialCabinet={cabinetToEdit}
        />
      )}
    </Dialog>
  );
};

export default EditProjectModal;
