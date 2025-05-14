import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StorageKeys, create, update } from '@/services/storage';
import CabinetWrapper from '@/components/cabinet/CabinetWrapper';
import { getFurniturePresets } from '@/services/storage';
import { generateQuotePDF } from '@/services/pdf';
import { toast } from '@/components/ui/use-toast';
import {
  calculateProjectMaterialTotal,
  calculateProjectAccessoryTotal,
} from '@/services/calculations';

interface Cabinet {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  material: string;
  price: number;
  quantity: number;
  accessories: { id: string; name: string; price: number }[];
  notes?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
  cabinets: Cabinet[];
}

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [furniturePresets, setFurniturePresets] = useState<Cabinet[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [materialTotal, setMaterialTotal] = useState(0);
  const [accessoryTotal, setAccessoryTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCabinet, setCurrentCabinet] = useState<Cabinet | null>(null);

  useEffect(() => {
    // Fix: Handle the promise correctly
    const loadPresets = async () => {
      try {
        const presets = await getFurniturePresets();
        setFurniturePresets(presets);
      } catch (error) {
        console.error("Error loading presets:", error);
        setFurniturePresets([]);
      }
    };
    
    loadPresets();
  }, []);

  useEffect(() => {
    // Calculate totals whenever cabinets change
    const materialTotal = calculateProjectMaterialTotal(cabinets);
    const accessoryTotal = calculateProjectAccessoryTotal(cabinets);

    setMaterialTotal(materialTotal);
    setAccessoryTotal(accessoryTotal);
  }, [cabinets]);

  const addCabinet = (cabinet: Cabinet) => {
    setCabinets([...cabinets, cabinet]);
  };

  const updateCabinet = (id: string, updatedCabinet: Cabinet) => {
    const updatedCabinets = cabinets.map((cabinet) =>
      cabinet.id === id ? updatedCabinet : cabinet
    );
    setCabinets(updatedCabinets);
  };

  const deleteCabinet = (id: string) => {
    const updatedCabinets = cabinets.filter((cabinet) => cabinet.id !== id);
    setCabinets(updatedCabinets);
  };

  // Fix type issues with Select - change to use value directly
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

  const handleSubmit = () => {
    if (!projectName || !clientName) {
      toast.error('Numele proiectului și numele clientului sunt obligatorii.');
      return;
    }

    if (cabinets.length === 0) {
      toast.error('Adăugați cel puțin un corp pentru a crea proiectul.');
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${today.getFullYear()}`;

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: projectName.trim(),
      client: clientName.trim(),
      date: formattedDate,
      status: 'draft',
      total: materialTotal + accessoryTotal,
      cabinets: cabinets,
    };

    try {
      create(StorageKeys.PROJECTS, newProject);
      toast.success('Proiectul a fost creat cu succes!');
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Nu s-a putut crea proiectul.');
    }
  };

  const handleGeneratePDF = async () => {
    if (!projectName || !clientName) {
      toast.error('Numele proiectului și numele clientului sunt obligatorii.');
      return;
    }

    if (cabinets.length === 0) {
      toast.error('Adăugați cel puțin un corp pentru a genera oferta.');
      return;
    }

    const projectData = {
      projectName,
      clientName,
      cabinets,
      materialTotal,
      accessoryTotal,
    };

    try {
      await generateQuotePDF(projectData);
      toast.success('Oferta a fost generată cu succes!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Nu s-a putut genera oferta.');
    }
  };

  const handleAddCabinet = () => {
    // Create a placeholder cabinet
    const newCabinet: Cabinet = {
      id: `cab_${Date.now()}`,
      name: 'Corp nou',
      width: 60,
      height: 80,
      depth: 60,
      material: 'PAL',
      price: 0,
      quantity: 1,
      accessories: []
    };
    setCurrentCabinet(newCabinet);
    setIsModalOpen(true);
  };

  const handleEditCabinet = (cabinet: Cabinet) => {
    setCurrentCabinet(cabinet);
    setIsModalOpen(true);
  };

  const handleSaveCabinet = (cabinet: Cabinet) => {
    if (cabinets.some(c => c.id === cabinet.id)) {
      // Update existing cabinet
      setCabinets(cabinets.map(c => c.id === cabinet.id ? cabinet : c));
    } else {
      // Add new cabinet
      setCabinets([...cabinets, cabinet]);
    }
    setIsModalOpen(false);
    setCurrentCabinet(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCabinet(null);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Proiect Nou</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Nume Proiect</Label>
              <Input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clientName">Nume Client</Label>
              <Input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>

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

          <div>
            {cabinets.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Corpuri adăugate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cabinets.map((cabinet) => (
                    <Card key={cabinet.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{cabinet.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p>Dimensiuni: {cabinet.width}x{cabinet.height}x{cabinet.depth} cm</p>
                        <p>Preț: {cabinet.price} RON</p>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCabinet(cabinet)}>
                          Editează
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCabinet(cabinet.id)}>
                          Șterge
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <Button onClick={handleAddCabinet} className="mt-4">
              Adaugă Corp Nou
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Total Materiale: {materialTotal} RON</h3>
            <h3 className="text-xl font-semibold">Total Accesorii: {accessoryTotal} RON</h3>
            <h3 className="text-2xl font-bold">
              Total Proiect: {materialTotal + accessoryTotal} RON
            </h3>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGeneratePDF}>
            Generează Ofertă PDF
          </Button>
          <Button onClick={handleSubmit}>Crează Proiect</Button>
        </CardFooter>
      </Card>

      <CabinetWrapper
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCabinet}
        initialCabinet={currentCabinet || {}}
      />
    </div>
  );
};

export default NewProject;
