
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import CabinetWrapper from '@/components/cabinet/CabinetWrapper';
import { getFurniturePresets } from '@/services/storage';
import { generateQuotePDF } from '@/services/pdf';
import { useToast } from '@/hooks/use-toast';
import {
  calculateProjectMaterialTotal,
  calculateProjectAccessoryTotal,
  calculateProjectTotal,
  PricingSettings,
  ProjectTotalResult
} from '@/services/calculations';
import { normalizeCabinet } from '@/utils/cabinetHelpers';

interface Cabinet {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
}

interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  roomWidth: number;
  roomHeight: number;
  roomDepth: number;
  cabinets: Cabinet[];
  createdAt: Date;
}

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [presets, setPresets] = useState<Cabinet[]>([]);
  const [showCabinetConfigurator, setShowCabinetConfigurator] = useState(false);
  const [showCabinetConfiguratorEdit, setShowCabinetConfiguratorEdit] = useState(false);
  const [cabinetToEdit, setCabinetToEdit] = useState<Cabinet | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [project, setProject] = useState<Project>({
    id: `proj_${Date.now()}`,
    name: '',
    clientName: '',
    clientEmail: '',
    roomWidth: 0,
    roomHeight: 0,
    roomDepth: 0,
    cabinets: [],
    createdAt: new Date(),
  });

  useEffect(() => {
    if (currentStep === 3) {
      // Handle the Promise returned by getFurniturePresets properly
      getFurniturePresets()
        .then(data => setPresets(data.map(normalizeCabinet)))
        .catch(err => console.error('Failed to load presets:', err));
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSaveProject = () => {
    toast({ title: "Proiect salvat", description: "Proiectul a fost salvat cu succes!" });
    navigate('/admin/projects');
  };

  const handleDeleteCabinet = (id: string) => {
    setProject(prev => ({ ...prev, cabinets: prev.cabinets.filter(c => c.id !== id) }));
  };

  const handleEditCabinet = (cab: Cabinet) => {
    setCabinetToEdit(cab);
    setShowCabinetConfiguratorEdit(true);
  };

  const handleAddPreset = (preset: Cabinet) => {
    const norm = normalizeCabinet({ ...preset, id: `cab_${Date.now()}_${Math.random().toString(36).slice(2)}` });
    setProject(prev => ({ ...prev, cabinets: [...prev.cabinets, norm] }));
  };

  const handleConfigurePreset = (preset: Cabinet) => {
    console.log('🔧 handleConfigurePreset called for preset:', preset);
    const norm = normalizeCabinet({
      ...preset,
      id: `cab_${Date.now()}_${Math.random().toString(36).slice(2)}`
    });
    setCabinetToEdit(norm);
    setShowCabinetConfiguratorEdit(true);
  };

  const handleGeneratePDF = async () => {
    try {
      const path = await generateQuotePDF(project);
      toast({ title: "PDF generat", description: `PDF-ul a fost generat: ${path}` });
    } catch {
      toast({ title: "Eroare", description: "Eroare la generarea PDF-ului.", variant: "destructive" });
    }
  };

  const handleCloneProject = () => {
    const clone = { ...project, id: `proj_${Date.now()}`, name: `${project.name} (copie)`, createdAt: new Date() };
    setProject(clone);
    toast({ title: "Proiect clonat", description: "O copie a proiectului a fost creată." });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return !!(project.name && project.clientName && project.clientEmail);
      case 2: return project.roomWidth > 0 && project.roomHeight > 0 && project.roomDepth > 0;
      case 3: return project.cabinets.length > 0;
      case 4: return project.cabinets.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  const materialTotal = calculateProjectMaterialTotal(project.cabinets);
  const accessoryTotal = calculateProjectAccessoryTotal(project.cabinets);
  const projectCosts: ProjectTotalResult = calculateProjectTotal(
    materialTotal,
    accessoryTotal,
    { tva: 19, manopera: 15, transport: 5, adaos: 10, currency: 'RON' } as PricingSettings,
    true
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Proiect Nou</h1>
      <Progress value={(currentStep / 6) * 100} className="mb-6" />
      <p className="text-sm text-gray-500 mb-8">Pasul {currentStep} din 6</p>

      {currentStep === 1 && (
        <Card>
          <CardHeader><CardTitle>Detalii Proiect</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nume Proiect</Label>
              <Input id="name" name="name" value={project.name} onChange={handleInputChange} placeholder="Nume proiect" />
            </div>
            <div>
              <Label htmlFor="clientName">Nume Client</Label>
              <Input id="clientName" name="clientName" value={project.clientName} onChange={handleInputChange} placeholder="Nume client" />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email Client</Label>
              <Input id="clientEmail" name="clientEmail" type="email" value={project.clientEmail} onChange={handleInputChange} placeholder="Email client" />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => navigate('/admin/projects')}>Anulează</Button>
            <Button onClick={nextStep} disabled={!isStepValid(1)}>Înainte</Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader><CardTitle>Dimensiuni Cameră</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="roomWidth">Lățime (cm)</Label>
              <Input id="roomWidth" name="roomWidth" type="number" value={project.roomWidth || ''} onChange={handleNumberInputChange} />
            </div>
            <div>
              <Label htmlFor="roomHeight">Înălțime (cm)</Label>
              <Input id="roomHeight" name="roomHeight" type="number" value={project.roomHeight || ''} onChange={handleNumberInputChange} />
            </div>
            <div>
              <Label htmlFor="roomDepth">Adâncime (cm)</Label>
              <Input id="roomDepth" name="roomDepth" type="number" value={project.roomDepth || ''} onChange={handleNumberInputChange} />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>Înapoi</Button>
            <Button onClick={nextStep} disabled={!isStepValid(2)}>Înainte</Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader><CardTitle>Alegere Corpuri Mobilier</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <Button onClick={() => setShowCabinetConfigurator(true)} className="flex-1">Custom</Button>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Preseturi disponibile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset, i) => (
                  <Card key={i}>
                    <CardHeader><CardTitle>{preset.name}</CardTitle></CardHeader>
                    <CardContent>{preset.width}×{preset.height}×{preset.depth} cm</CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" onClick={() => handleAddPreset(preset)}>Adaugă direct</Button>
                      <Button onClick={() => handleConfigurePreset(preset)}>Configurează</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>Înapoi</Button>
            <Button onClick={nextStep} disabled={!isStepValid(3)}>Înainte</Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader><CardTitle>Configurare Corpuri</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <Button onClick={() => setShowCabinetConfigurator(true)}>+ Adaugă Corp</Button>
            {project.cabinets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {project.cabinets.map(cab => (
                  <Card key={cab.id}>
                    <CardHeader><CardTitle>{cab.name}</CardTitle></CardHeader>
                    <CardContent>{cab.width}×{cab.height}×{cab.depth} cm</CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditCabinet(cab)}>Editează</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteCabinet(cab.id)}>Șterge</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">Nu ați adăugat încă niciun corp.</p>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>Înapoi</Button>
            <Button onClick={nextStep} disabled={!isStepValid(4)}>Înainte</Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 5 && (
        <Card>
          <CardHeader><CardTitle>Aranjare Corpuri</CardTitle></CardHeader>
          <CardContent className="p-8 bg-gray-100 rounded-md text-center">
            <p className="text-gray-500">În curs de implementare: aranjarea vizuală va fi disponibilă curând.</p>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>Înapoi</Button>
            <Button onClick={nextStep}>Înainte</Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 6 && (
        <Card>
          <CardHeader><CardTitle>Rezumat Proiect</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* Project details, cabinets table, cost breakdown */}
            {/* ...omitted for brevity, same as before... */}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>Înapoi</Button>
            <Button onClick={handleSaveProject}>Salvează Proiect</Button>
          </CardFooter>
        </Card>
      )}

      {showCabinetConfigurator && (
        <CabinetWrapper
          open={showCabinetConfigurator}
          onClose={() => setShowCabinetConfigurator(false)}
          onSave={cab => {
            setProject(prev => ({ ...prev, cabinets: [...prev.cabinets, normalizeCabinet(cab)] }));
            setShowCabinetConfigurator(false);
          }}
        />
      )}

      {showCabinetConfiguratorEdit && cabinetToEdit && (
        <CabinetWrapper
          open={showCabinetConfiguratorEdit}
          onClose={() => setShowCabinetConfiguratorEdit(false)}
          onSave={cab => {
            const updated = prev => {
              const list = [...prev.cabinets];
              const idx = list.findIndex(c => c.id === cabinetToEdit.id);
              if (idx >= 0) list[idx] = normalizeCabinet(cab);
              return { ...prev, cabinets: list };
            };
            setProject(updated);
            setShowCabinetConfiguratorEdit(false);
            setCabinetToEdit(null);
          }}
          initialCabinet={cabinetToEdit}
        />
      )}

      {/* Quote & Email modals... unchanged */}
    </div>
  );
};

export default NewProject;
