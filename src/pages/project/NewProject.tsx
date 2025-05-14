
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import CabinetConfigurator, { Cabinet } from '@/components/cabinet/CabinetConfigurator';
import { create, StorageKeys } from '@/services/storage';
import { calculateProjectTotal } from '@/services/calculations';

// Project interface
interface Project {
  id: string;
  name: string;
  client: string;
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  cabinets: Cabinet[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed';
  totalCost: number;
}

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showCabinetConfigurator, setShowCabinetConfigurator] = useState<boolean>(false);
  
  // Project data state
  const [project, setProject] = useState<Project>({
    id: `proj_${Date.now()}`,
    name: '',
    client: '',
    roomWidth: 0,
    roomLength: 0,
    roomHeight: 280, // default height 280cm
    cabinets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    totalCost: 0
  });
  
  // Step navigation
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Step validation
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Client & Project Info
        if (!project.name.trim()) {
          toast({
            title: "Câmp obligatoriu",
            description: "Numele proiectului este obligatoriu",
            variant: "destructive"
          });
          return false;
        }
        if (!project.client.trim()) {
          toast({
            title: "Câmp obligatoriu",
            description: "Numele clientului este obligatoriu",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 2: // Room Dimensions
        if (project.roomWidth <= 0) {
          toast({
            title: "Dimensiuni invalide",
            description: "Lățimea camerei trebuie să fie mai mare decât 0",
            variant: "destructive"
          });
          return false;
        }
        if (project.roomLength <= 0) {
          toast({
            title: "Dimensiuni invalide",
            description: "Lungimea camerei trebuie să fie mai mare decât 0",
            variant: "destructive"
          });
          return false;
        }
        if (project.roomHeight <= 0) {
          toast({
            title: "Dimensiuni invalide",
            description: "Înălțimea camerei trebuie să fie mai mare decât 0",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 3: // Cabinet Method
        // This step doesn't require validation
        return true;
      
      case 4: // Cabinets List
        if (project.cabinets.length === 0) {
          toast({
            title: "Niciun corp adăugat",
            description: "Adăugați cel puțin un corp pentru a continua",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 5: // Cabinet Arrangement
        // This step doesn't require validation
        return true;
        
      case 6: // Project Summary
        // Final step - no validation needed
        return true;
        
      default:
        return true;
    }
  };
  
  // Handle cabinet addition
  const handleAddCabinet = (cabinet: Cabinet) => {
    // Validate that the cabinet will fit in the room
    const existingWidth = project.cabinets.reduce((sum, cab) => sum + cab.dimensions.width, 0);
    const newTotalWidth = existingWidth + cabinet.dimensions.width;
    
    if (newTotalWidth > project.roomWidth * 10) { // convert room width from cm to mm
      toast({
        title: "Cabinete prea largi",
        description: `Corpurile depășesc lățimea camerei cu ${((newTotalWidth - project.roomWidth * 10) / 10).toFixed(1)} cm`,
        variant: "destructive"
      });
      return;
    }
    
    // Add cabinet to project
    setProject(prev => ({
      ...prev,
      cabinets: [...prev.cabinets, cabinet],
      updatedAt: new Date().toISOString()
    }));
    
    // Close configurator and proceed to next step
    setShowCabinetConfigurator(false);
    
    // If we're on step 3 (Cabinet Method), automatically go to step 4
    if (currentStep === 3) {
      setCurrentStep(4);
    }
  };
  
  // Handle cabinet removal
  const handleRemoveCabinet = (cabinetId: string) => {
    setProject(prev => ({
      ...prev,
      cabinets: prev.cabinets.filter(cab => cab.id !== cabinetId),
      updatedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Corp eliminat",
      description: "Corpul a fost eliminat din proiect"
    });
  };
  
  // Calculate total project cost
  const calculateTotalCost = () => {
    const materialCost = project.cabinets.reduce((sum, cab) => sum + cab.totalCost, 0);
    const pricingSettings = {
      tva: 19,
      manopera: 15,
      transport: 5,
      adaos: 10,
      currency: 'RON'
    };
    
    return calculateProjectTotal(materialCost, 0, pricingSettings, true);
  };
  
  // Save project
  const saveProject = () => {
    const finalProject = {
      ...project,
      totalCost: calculateTotalCost().total,
      updatedAt: new Date().toISOString()
    };
    
    try {
      create(StorageKeys.PROJECTS, finalProject);
      
      toast({
        title: "Proiect salvat",
        description: "Proiectul a fost salvat cu succes"
      });
      
      // Navigate to projects list
      navigate('/admin/projects');
    } catch (error) {
      toast({
        title: "Eroare la salvare",
        description: "A apărut o eroare la salvarea proiectului",
        variant: "destructive"
      });
    }
  };
  
  // Render functions for each step
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectName">Nume Proiect</Label>
        <Input 
          id="projectName" 
          value={project.name} 
          onChange={(e) => setProject({ ...project, name: e.target.value })}
          placeholder="Bucătărie Apartament 3 Camere"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientName">Nume Client</Label>
        <Input 
          id="clientName" 
          value={project.client} 
          onChange={(e) => setProject({ ...project, client: e.target.value })}
          placeholder="Ion Popescu"
        />
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roomWidth">Lățime Cameră (cm)</Label>
          <Input 
            id="roomWidth" 
            type="number" 
            min="0"
            value={project.roomWidth || ''}
            onChange={(e) => setProject({ ...project, roomWidth: Number(e.target.value) })}
            placeholder="300"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="roomLength">Lungime Cameră (cm)</Label>
          <Input 
            id="roomLength" 
            type="number"
            min="0"
            value={project.roomLength || ''}
            onChange={(e) => setProject({ ...project, roomLength: Number(e.target.value) })}
            placeholder="400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="roomHeight">Înălțime Cameră (cm)</Label>
          <Input 
            id="roomHeight" 
            type="number"
            min="0"
            value={project.roomHeight || ''}
            onChange={(e) => setProject({ ...project, roomHeight: Number(e.target.value) })}
            placeholder="280"
          />
        </div>
      </div>
      
      <div className="mt-4 bg-muted p-4 rounded-md">
        <p className="text-sm">
          Dimensiunile camerei sunt importante pentru:
        </p>
        <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
          <li>Calculul cantității de materiale necesare</li>
          <li>Verificarea dimensiunilor corpurilor de mobilier</li>
          <li>Generarea schiței 3D a proiectului</li>
        </ul>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Alegeți metoda de adăugare a corpurilor de mobilier:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => setShowCabinetConfigurator(true)}>
          <CardHeader>
            <CardTitle>Personalizat</CardTitle>
            <CardDescription>
              Creați corpuri personalizate, configurați toate dimensiunile și materialele
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-5 text-sm space-y-1">
              <li>Specificați toate dimensiunile</li>
              <li>Alegeți materialele și accesoriile</li>
              <li>Control total asupra configurației</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowCabinetConfigurator(true)}>
              Configurare Personalizată
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="cursor-pointer hover:border-primary opacity-50" onClick={() => toast({ title: "În curând", description: "Această funcționalitate va fi disponibilă în curând" })}>
          <CardHeader>
            <CardTitle>Din Șabloane</CardTitle>
            <CardDescription>
              Alegeți din corpuri predefinite pentru bucătărie, dormitor, dressing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-5 text-sm space-y-1">
              <li>Selectați din șabloane predefinite</li>
              <li>Ajustați dimensiunile și materialele</li>
              <li>Adăugare rapidă în proiect</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled>Din Șabloane (În curând)</Button>
          </CardFooter>
        </Card>
      </div>
      
      {showCabinetConfigurator && (
        <CabinetConfigurator 
          open={showCabinetConfigurator}
          onClose={() => setShowCabinetConfigurator(false)}
          onSave={handleAddCabinet}
          maxWidth={project.roomWidth * 10} // Convert from cm to mm
        />
      )}
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Corpuri adăugate ({project.cabinets.length})</h3>
        <Button onClick={() => setShowCabinetConfigurator(true)}>
          + Adaugă Corp
        </Button>
      </div>
      
      {project.cabinets.length === 0 ? (
        <div className="bg-muted p-8 text-center rounded-md">
          <p className="text-muted-foreground">
            Nu există corpuri adăugate. Apăsați butonul "Adaugă Corp" pentru a începe.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {project.cabinets.map((cabinet, index) => (
            <Card key={cabinet.id || index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{cabinet.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs text-destructive"
                    onClick={() => handleRemoveCabinet(cabinet.id || '')}
                  >
                    Elimină
                  </Button>
                </div>
                <CardDescription>
                  {cabinet.category} - {cabinet.subcategory}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dimensiuni:</span> {cabinet.dimensions.width} x {cabinet.dimensions.height} x {cabinet.dimensions.depth} mm
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accesorii:</span> {cabinet.accessories.length}
                  </div>
                  <div className="font-medium">
                    <span className="text-muted-foreground">Cost:</span> {cabinet.totalCost.toFixed(2)} RON
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {showCabinetConfigurator && (
        <CabinetConfigurator 
          open={showCabinetConfigurator}
          onClose={() => setShowCabinetConfigurator(false)}
          onSave={handleAddCabinet}
          maxWidth={project.roomWidth * 10} // Convert from cm to mm
        />
      )}
    </div>
  );
  
  const renderStep5 = () => (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Aranjarea corpurilor va fi implementată în versiunea următoare.
      </p>
      
      <div className="bg-muted rounded-md p-4">
        <h3 className="font-medium mb-2">Corpuri adăugate:</h3>
        <div className="space-y-2">
          {project.cabinets.map((cabinet, index) => (
            <div key={index} className="p-2 bg-card border rounded-md">
              <p className="font-medium">{cabinet.name}</p>
              <p className="text-sm text-muted-foreground">
                Dimensiuni: {cabinet.dimensions.width} x {cabinet.dimensions.height} x {cabinet.dimensions.depth} mm
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderStep6 = () => {
    const costs = calculateTotalCost();
    
    return (
      <div className="space-y-6">
        <div className="bg-muted rounded-md p-4">
          <h3 className="font-medium mb-2">Informații Proiect:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Nume Proiect:</span> {project.name}</div>
            <div><span className="font-medium">Client:</span> {project.client}</div>
            <div><span className="font-medium">Dimensiuni Cameră:</span> {project.roomWidth} x {project.roomLength} x {project.roomHeight} cm</div>
            <div><span className="font-medium">Corpuri:</span> {project.cabinets.length}</div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Rezumat Costuri:</h3>
          <div className="bg-card border rounded-md p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Materiale:</span>
                <span>{costs.materialCost.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Accesorii:</span>
                <span>{costs.accessoryCost.toFixed(2)} RON</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span>Manoperă ({costs.manoperaCost / costs.materialCost * 100}%):</span>
                <span>{costs.manoperaCost.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transport:</span>
                <span>{costs.transportCost.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Adaos:</span>
                <span>{costs.adaosCost.toFixed(2)} RON</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{costs.subtotal.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (19%):</span>
                <span>{costs.tvaCost.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between font-bold mt-3">
                <span>TOTAL:</span>
                <span>{costs.total.toFixed(2)} RON</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };
  
  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Informații Client și Proiect";
      case 2: return "Dimensiuni Cameră";
      case 3: return "Metodă Adăugare Corpuri";
      case 4: return "Lista Corpurilor";
      case 5: return "Aranjare Corpuri";
      case 6: return "Sumar și Salvare";
      default: return "";
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proiect Nou</h1>
          <p className="text-muted-foreground">Urmați pașii pentru a crea un proiect nou.</p>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pasul {currentStep} din 6</span>
            <span>{Math.round((currentStep / 6) * 100)}%</span>
          </div>
          <Progress value={(currentStep / 6) * 100} className="h-2" />
        </div>
        
        {/* Step card */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Introduceți informațiile de bază despre client și proiect."}
              {currentStep === 2 && "Specificați dimensiunile camerei pentru care se realizează proiectul."}
              {currentStep === 3 && "Alegeți metoda de adăugare a corpurilor de mobilier."}
              {currentStep === 4 && "Gestionați lista de corpuri adăugate în proiect."}
              {currentStep === 5 && "Poziționați corpurile în cadrul camerei."}
              {currentStep === 6 && "Verificați sumarul proiectului și salvați."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {renderStepContent()}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                >
                  Înapoi
                </Button>
              )}
            </div>
            
            <div>
              {currentStep < 6 ? (
                <Button onClick={goToNextStep}>
                  Înainte
                </Button>
              ) : (
                <Button onClick={saveProject}>
                  Salvează Proiect
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NewProject;
