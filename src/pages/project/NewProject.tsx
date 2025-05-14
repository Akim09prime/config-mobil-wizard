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
  // Add other cabinet properties as needed
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
  // Add other project properties as needed
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
    const loadPresets = async () => {
      try {
        const presetsData = await getFurniturePresets();
        // Ensure all preset cabinets have required properties
        const normalizedPresets = presetsData?.map(preset => normalizeCabinet(preset)) || [];
        setPresets(normalizedPresets);
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    };
    
    if (currentStep === 3) {
      loadPresets();
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSaveProject = () => {
    // Logic to save the project
    toast({
      title: "Proiect salvat",
      description: "Proiectul a fost salvat cu succes!",
    });
    // Navigate to projects page or where needed
    navigate('/admin/projects');
  };

  const handleDeleteCabinet = (cabinetId: string) => {
    setProject(prev => ({
      ...prev,
      cabinets: prev.cabinets.filter(cabinet => cabinet.id !== cabinetId)
    }));
  };

  const handleEditCabinet = (cabinet: Cabinet) => {
    setCabinetToEdit(cabinet);
    setShowCabinetConfiguratorEdit(true);
  };

  const handleAddPreset = (preset: Cabinet) => {
    // Normalize the preset to ensure it has all required properties
    const normalizedCabinet = normalizeCabinet({
      ...preset,
      id: `cab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    });
    
    setProject(prev => ({
      ...prev,
      cabinets: [...prev.cabinets, normalizedCabinet]
    }));
  };

   const handleConfigurePreset = (preset: Cabinet) => {
 const handleConfigurePreset = (preset: Cabinet) => {
     // Normalize the preset to ensure it has all required properties
     const normalizedCabinet = normalizeCabinet({
       ...preset,
       id: `cab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
     });
     setCabinetToEdit(normalizedCabinet);
   setShowCabinetConfigurator(true);
    setShowCabinetConfiguratorEdit(true);
   };


  const handleGeneratePDF = async () => {
    try {
      const pdfPath = await generateQuotePDF(project);
      toast({
        title: "PDF generat",
        description: `PDF-ul a fost generat cu succes: ${pdfPath}`,
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare la generarea PDF-ului.",
        variant: "destructive",
      });
    }
  };

  const handleCloneProject = () => {
    const clonedProject = {
      ...project,
      id: `proj_${Date.now()}`,
      name: `${project.name} (copie)`,
      createdAt: new Date(),
    };
    
    setProject(clonedProject);
    toast({
      title: "Proiect clonat",
      description: "O copie a proiectului a fost creată.",
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(project.name && project.clientName && project.clientEmail);
      case 2:
        return project.roomWidth > 0 && project.roomHeight > 0 && project.roomDepth > 0;
      case 3:
        return project.cabinets.length > 0;
      case 4:
        return project.cabinets.length > 0;
      case 5:
        return true; // Step 5 is always valid
      default:
        return false;
    }
  };

  // Calculate project totals
  const materialTotal = calculateProjectMaterialTotal(project.cabinets);
  const accessoryTotal = calculateProjectAccessoryTotal(project.cabinets);
  
  const projectCosts: ProjectTotalResult = calculateProjectTotal(
    materialTotal,
    accessoryTotal,
    {
      tva: 19,                // Default Romanian TVA rate
      manopera: 15,           // Default labor cost percentage
      transport: 5,           // Default transport percentage
      adaos: 10,              // Default markup percentage
      currency: 'RON'         // Default currency
    } as PricingSettings,
    true
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Proiect Nou</h1>
      
      <Progress 
        value={(currentStep / 6) * 100} 
        className="mb-6" 
      />
      <p className="text-sm text-gray-500 mb-8">Pasul {currentStep} din 6</p>
      
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalii Proiect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nume Proiect</Label>
              <Input 
                id="name" 
                name="name" 
                value={project.name} 
                onChange={handleInputChange} 
                placeholder="Introduceți numele proiectului" 
              />
            </div>
            <div>
              <Label htmlFor="clientName">Nume Client</Label>
              <Input 
                id="clientName" 
                name="clientName" 
                value={project.clientName} 
                onChange={handleInputChange} 
                placeholder="Introduceți numele clientului" 
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email Client</Label>
              <Input 
                id="clientEmail" 
                name="clientEmail" 
                type="email" 
                value={project.clientEmail} 
                onChange={handleInputChange} 
                placeholder="Introduceți email-ul clientului" 
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => navigate('/admin/projects')}>
              Anulează
            </Button>
            <Button 
              onClick={nextStep} 
              disabled={!isStepValid(1)}
            >
              Înainte
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Dimensiuni Cameră</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="roomWidth">Lățime (cm)</Label>
              <Input 
                id="roomWidth" 
                name="roomWidth" 
                type="number" 
                value={project.roomWidth || ''} 
                onChange={handleNumberInputChange} 
                placeholder="Introduceți lățimea camerei" 
              />
            </div>
            <div>
              <Label htmlFor="roomHeight">Înălțime (cm)</Label>
              <Input 
                id="roomHeight" 
                name="roomHeight" 
                type="number" 
                value={project.roomHeight || ''} 
                onChange={handleNumberInputChange} 
                placeholder="Introduceți înălțimea camerei" 
              />
            </div>
            <div>
              <Label htmlFor="roomDepth">Adâncime (cm)</Label>
              <Input 
                id="roomDepth" 
                name="roomDepth" 
                type="number" 
                value={project.roomDepth || ''} 
                onChange={handleNumberInputChange} 
                placeholder="Introduceți adâncimea camerei" 
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>
              Înapoi
            </Button>
            <Button 
              onClick={nextStep}
              disabled={!isStepValid(2)}
            >
              Înainte
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Alegere Corpuri Mobilier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowCabinetConfigurator(true)}
                className="flex-1"
              >
                Custom
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Preseturi disponibile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-md">{preset.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm">
                        {preset.width}×{preset.height}×{preset.depth} cm
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddPreset(preset)}
                        className="flex-1"
                      >
                        Adaugă direct
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleConfigurePreset(preset)}
                        className="flex-1"
                      >
                        Configurează
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>
              Înapoi
            </Button>
            <Button 
              onClick={nextStep}
              disabled={!isStepValid(3)}
            >
              Înainte
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Configurare Corpuri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button onClick={() => setShowCabinetConfigurator(true)}>
              + Adaugă Corp
            </Button>
            
            {project.cabinets.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Corpuri adăugate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.cabinets.map((cabinet) => (
                    <Card key={cabinet.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-md">{cabinet.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm">
                          {cabinet.width}×{cabinet.height}×{cabinet.depth} cm
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditCabinet(cabinet)}
                        >
                          Editează
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteCabinet(cabinet.id)}
                        >
                          Șterge
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">
                Nu ați adăugat încă niciun corp de mobilier.
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>
              Înapoi
            </Button>
            <Button 
              onClick={nextStep}
              disabled={!isStepValid(4)}
            >
              Înainte
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Aranjare Corpuri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-100 p-8 rounded-md text-center">
              <p className="text-gray-500">
                În curs de implementare: aranjarea vizuală va fi disponibilă curând.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>
              Înapoi
            </Button>
            <Button onClick={nextStep}>
              Înainte
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Rezumat Proiect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Detalii Proiect</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nume Proiect:</span>
                    <span>{project.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nume Client:</span>
                    <span>{project.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email Client:</span>
                    <span>{project.clientEmail}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Dimensiuni Cameră</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lățime:</span>
                    <span>{project.roomWidth} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Înălțime:</span>
                    <span>{project.roomHeight} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adâncime:</span>
                    <span>{project.roomDepth} cm</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Corpuri de Mobilier</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Nume</th>
                      <th className="p-2 text-left">Dimensiuni (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.cabinets.map((cabinet) => (
                      <tr key={cabinet.id} className="border-b">
                        <td className="p-2">{cabinet.name}</td>
                        <td className="p-2">{cabinet.width}×{cabinet.height}×{cabinet.depth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Cost Estimat</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost Materiale:</span>
                  <span>{projectCosts.materialCost.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost Accesorii:</span>
                  <span>{projectCosts.accessoryCost.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Manoperă:</span>
                  <span>{projectCosts.manoperaCost.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transport:</span>
                  <span>{projectCosts.transportCost.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Subtotal:</span>
                  <span>{projectCosts.subtotal.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TVA (19%):</span>
                  <span>{projectCosts.tvaCost.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4">
                  <span>Total:</span>
                  <span>{projectCosts.total.toFixed(2)} RON</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Button onClick={() => setShowQuoteModal(true)}>
                Cere Ofertă
              </Button>
              <Button onClick={handleGeneratePDF}>
                Generează PDF
              </Button>
              <Button onClick={() => setShowEmailModal(true)}>
                Trimite Email
              </Button>
              <Button onClick={handleCloneProject}>
                Clonează Proiect
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}>
              Înapoi
            </Button>
            <Button onClick={handleSaveProject}>
              Salvează Proiect
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {showCabinetConfigurator && (
        <CabinetWrapper
          open={showCabinetConfigurator}
          onClose={() => setShowCabinetConfigurator(false)}
          onSave={(cabinet) => {
            const normalizedCabinet = normalizeCabinet(cabinet);
            setProject(prev => ({
              ...prev,
              cabinets: [...prev.cabinets, normalizedCabinet]
            }));
            setShowCabinetConfigurator(false);
          }}
        />
      )}
      
      {showCabinetConfiguratorEdit && cabinetToEdit && (
        <CabinetWrapper
          open={showCabinetConfiguratorEdit}
          onClose={() => setShowCabinetConfiguratorEdit(false)}
          onSave={(cabinet) => {
            // Normalize the cabinet to ensure it has all required properties
            const normalizedCabinet = normalizeCabinet(cabinet);
            const updatedCabinets = [...project.cabinets];
            const index = updatedCabinets.findIndex(c => c.id === cabinetToEdit.id);
            if (index !== -1) {
              updatedCabinets[index] = normalizedCabinet;
            }
            setProject(prev => ({
              ...prev,
              cabinets: updatedCabinets
            }));
            setShowCabinetConfiguratorEdit(false);
            setCabinetToEdit(null);
          }}
          initialCabinet={cabinetToEdit}
        />
      )}
      
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ofertă de Preț</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Quote content would go here */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Descriere</th>
                  <th className="p-2 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Materiale</td>
                  <td className="p-2 text-right">{projectCosts.materialCost.toFixed(2)} RON</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Accesorii</td>
                  <td className="p-2 text-right">{projectCosts.accessoryCost.toFixed(2)} RON</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Manoperă</td>
                  <td className="p-2 text-right">{projectCosts.manoperaCost.toFixed(2)} RON</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Transport</td>
                  <td className="p-2 text-right">{projectCosts.transportCost.toFixed(2)} RON</td>
                </tr>
                <tr className="border-b font-semibold">
                  <td className="p-2">Subtotal</td>
                  <td className="p-2 text-right">{projectCosts.subtotal.toFixed(2)} RON</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">TVA (19%)</td>
                  <td className="p-2 text-right">{projectCosts.tvaCost.toFixed(2)} RON</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-2">Total</td>
                  <td className="p-2 text-right">{projectCosts.total.toFixed(2)} RON</td>
                </tr>
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQuoteModal(false)}>
              Închide
            </Button>
            <Button onClick={handleGeneratePDF}>
              Generează PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trimite Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailTo">Către</Label>
              <Input 
                id="emailTo" 
                value={project.clientEmail} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="emailSubject">Subiect</Label>
              <Input 
                id="emailSubject" 
                defaultValue={`Ofertă pentru proiectul ${project.name}`} 
              />
            </div>
            <div>
              <Label htmlFor="emailBody">Mesaj</Label>
              <textarea 
                id="emailBody" 
                className="w-full min-h-[100px] p-2 border rounded"
                defaultValue={`Stimată/Stimate ${project.clientName},\n\nAtașat găsiți oferta de preț pentru proiectul "${project.name}".\n\nCu stimă,\nEchipa noastră`} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Anulează
            </Button>
            <Button onClick={() => {
              // Here you would actually send the email
              toast({
                title: "Email trimis",
                description: "Email-ul a fost trimis cu succes!",
              });
              setShowEmailModal(false);
            }}>
              Trimite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewProject;
