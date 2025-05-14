
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CabinetConfigurator from '../../components/cabinet/CabinetConfigurator';
import {
  calculateProjectMaterialTotal,
  calculateProjectAccessoryTotal,
  calculateProjectTotal,
  PricingSettings,
  formatCurrency
} from '../../services/calculations';
import { useToast } from '../../components/ui/use-toast';

type Cabinet = {
  id?: string;
  name: string;
  category: string;
  subcategory: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  pieces: {
    id: string;
    name: string;
    material: string;
    width: number;
    height: number;
    depth?: number;
    quantity: number;
  }[];
  accessories: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalCost: number;
};

type Project = {
  id?: string;
  name: string;
  clientName: string;
  clientEmail: string;
  roomWidth: number;
  roomHeight: number;
  roomDepth: number;
  cabinets: Cabinet[];
  createdAt?: Date;
  updatedAt?: Date;
};

const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [project, setProject] = useState<Project>({
    name: '',
    clientName: '',
    clientEmail: '',
    roomWidth: 0,
    roomHeight: 0,
    roomDepth: 0,
    cabinets: []
  });
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [selectedCabinetMethod, setSelectedCabinetMethod] = useState<string | null>(null);
  const [applyTva, setApplyTva] = useState(true);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    tva: 19,
    manopera: 15,
    transport: 5,
    adaos: 10,
    currency: 'RON'
  });

  // Validation functions for each step
  const isStep1Valid = () => {
    return project.name.trim() !== '' && 
           project.clientName.trim() !== '' && 
           project.clientEmail.trim() !== '';
  };

  const isStep2Valid = () => {
    return project.roomWidth > 0 && 
           project.roomHeight > 0 && 
           project.roomDepth > 0;
  };

  const isStep3Valid = () => {
    return selectedCabinetMethod !== null;
  };

  const isStep4Valid = () => {
    return project.cabinets.length > 0;
  };

  // Always valid, no extra data needed
  const isStep5Valid = () => true;

  // Handle adding a new cabinet
  const handleAddCabinet = (cabinet: Cabinet) => {
    // Calculate the total width of existing cabinets
    const existingWidth = project.cabinets.reduce((total, cab) => total + cab.dimensions.width, 0);
    
    // Check if the new cabinet will fit
    if (existingWidth + cabinet.dimensions.width > project.roomWidth) {
      toast({
        title: "Eroare",
        description: "Nu încape corpul în spațiu",
        variant: "destructive"
      });
      return;
    }
    
    // Add the cabinet to the project
    setProject(prev => ({
      ...prev,
      cabinets: [...prev.cabinets, cabinet]
    }));
    
    // Close the configurator
    setIsConfiguratorOpen(false);
    
    // If we're in step 3, automatically move to step 4
    if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  // Handle saving the project
  const handleSaveProject = () => {
    // Mock saving the project (would normally call an API)
    toast({
      title: "Succes",
      description: "Proiect salvat cu succes!"
    });
    
    // Redirect to the projects page
    navigate('/projects');
  };

  // Navigation functions
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Check if the current step is valid before allowing to proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return isStep3Valid();
      case 4: return isStep4Valid();
      case 5: return isStep5Valid();
      default: return false;
    }
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nume Proiect</Label>
              <Input
                id="projectName"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                placeholder="Apartament Strada Victoriei"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Nume Client</Label>
              <Input
                id="clientName"
                value={project.clientName}
                onChange={(e) => setProject({ ...project, clientName: e.target.value })}
                placeholder="Ion Popescu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email Client</Label>
              <Input
                id="clientEmail"
                type="email"
                value={project.clientEmail}
                onChange={(e) => setProject({ ...project, clientEmail: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomWidth">Lățime Încăpere (mm)</Label>
              <Input
                id="roomWidth"
                type="number"
                value={project.roomWidth || ''}
                onChange={(e) => setProject({ ...project, roomWidth: Number(e.target.value) })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomHeight">Înălțime Încăpere (mm)</Label>
              <Input
                id="roomHeight"
                type="number"
                value={project.roomHeight || ''}
                onChange={(e) => setProject({ ...project, roomHeight: Number(e.target.value) })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomDepth">Adâncime Încăpere (mm)</Label>
              <Input
                id="roomDepth"
                type="number"
                value={project.roomDepth || ''}
                onChange={(e) => setProject({ ...project, roomDepth: Number(e.target.value) })}
                min="0"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-lg font-medium">Alegere Metodă Configurare Corp</div>
            
            <RadioGroup 
              value={selectedCabinetMethod || ''}
              onValueChange={setSelectedCabinetMethod}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="preset" id="preset" />
                <Label htmlFor="preset" className="cursor-pointer">
                  Preset (Șabloane predefinite)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  Custom (Configurare manuală)
                </Label>
              </div>
            </RadioGroup>
            
            {selectedCabinetMethod === 'preset' && (
              <div className="border rounded-md p-4 bg-muted/30">
                <div className="text-sm font-medium mb-2">Șabloane disponibile:</div>
                <div className="text-muted-foreground text-sm">
                  Funcționalitate în dezvoltare. Vă rugăm să utilizați opțiunea Custom.
                </div>
              </div>
            )}
            
            {selectedCabinetMethod === 'custom' && (
              <Button 
                onClick={() => setIsConfiguratorOpen(true)}
                className="mt-4"
              >
                Deschide Configurator
              </Button>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-lg font-medium">Corpuri Adăugate</div>
            
            {project.cabinets.length === 0 ? (
              <div className="text-muted-foreground text-center p-8 border rounded-md">
                Nu există corpuri adăugate încă
              </div>
            ) : (
              <div className="space-y-4">
                {project.cabinets.map((cabinet, index) => (
                  <Card key={cabinet.id || index} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{cabinet.name}</CardTitle>
                      <CardDescription>
                        {cabinet.category} / {cabinet.subcategory}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm">
                        <div>Dimensiuni: {cabinet.dimensions.width}×{cabinet.dimensions.height}×{cabinet.dimensions.depth} mm</div>
                        <div className="font-medium mt-2">Cost: {formatCurrency(cabinet.totalCost, 'RON')}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <Button 
              onClick={() => setIsConfiguratorOpen(true)}
              className="mt-4"
            >
              + Adaugă Corp
            </Button>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-lg font-medium">Aranjare Corpuri</div>
            
            <div className="border rounded-md p-8 bg-muted/30 text-center">
              <div className="text-muted-foreground">
                Funcționalitate în dezvoltare. Aceasta va permite aranjarea vizuală a corpurilor într-un spațiu 3D.
              </div>
            </div>
          </div>
        );
      
      case 6:
        const materialCost = calculateProjectMaterialTotal(project.cabinets);
        const accessoryCost = calculateProjectAccessoryTotal(project.cabinets);
        const finalTotal = calculateProjectTotal(materialCost, accessoryCost, pricingSettings, applyTva);
        
        return (
          <div className="space-y-6">
            <div className="text-lg font-medium">Rezumat Proiect</div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manopera">Manoperă (%)</Label>
                  <Input
                    id="manopera"
                    type="number"
                    value={pricingSettings.manopera}
                    onChange={(e) => setPricingSettings({...pricingSettings, manopera: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="transport">Transport (%)</Label>
                  <Input
                    id="transport"
                    type="number"
                    value={pricingSettings.transport}
                    onChange={(e) => setPricingSettings({...pricingSettings, transport: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="applyTva"
                  type="checkbox"
                  checked={applyTva}
                  onChange={(e) => setApplyTva(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
                <Label htmlFor="applyTva">Aplică TVA ({pricingSettings.tva}%)</Label>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sumar Costuri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Cost Materiale:</div>
                    <div className="text-right">{formatCurrency(finalTotal.materialCost, 'RON')}</div>
                    
                    <div>Cost Accesorii:</div>
                    <div className="text-right">{formatCurrency(finalTotal.accessoryCost, 'RON')}</div>
                    
                    <div>Manoperă:</div>
                    <div className="text-right">{formatCurrency(finalTotal.manoperaCost, 'RON')}</div>
                    
                    <div>Transport:</div>
                    <div className="text-right">{formatCurrency(finalTotal.transportCost, 'RON')}</div>
                    
                    <Separator className="col-span-2 my-2" />
                    
                    <div>Subtotal:</div>
                    <div className="text-right">{formatCurrency(finalTotal.subtotal, 'RON')}</div>
                    
                    {applyTva && (
                      <>
                        <div>TVA ({pricingSettings.tva}%):</div>
                        <div className="text-right">{formatCurrency(finalTotal.tvaCost, 'RON')}</div>
                      </>
                    )}
                    
                    <Separator className="col-span-2 my-2" />
                    
                    <div className="font-medium text-base">Total:</div>
                    <div className="text-right font-medium text-base">{formatCurrency(finalTotal.total, 'RON')}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Proiect Nou</h1>
      
      <div className="mb-8 space-y-2">
        <div className="text-sm font-medium">
          Pasul {currentStep} din 6
        </div>
        <Progress value={(currentStep / 6) * 100} className="h-2" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Informații Proiect"}
            {currentStep === 2 && "Dimensiuni Încăpere"}
            {currentStep === 3 && "Metodă Configurare"}
            {currentStep === 4 && "Corpuri Mobilier"}
            {currentStep === 5 && "Aranjare"}
            {currentStep === 6 && "Rezumat și Salvare"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPrevStep}
            disabled={currentStep === 1}
          >
            Înapoi
          </Button>
          
          {currentStep < 6 ? (
            <Button 
              onClick={goToNextStep}
              disabled={!canProceed()}
            >
              Înainte
            </Button>
          ) : (
            <Button 
              onClick={handleSaveProject}
            >
              Salvează Proiect
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Cabinet Configurator Modal */}
      {isConfiguratorOpen && (
        <CabinetConfigurator
          open={isConfiguratorOpen}
          onClose={() => setIsConfiguratorOpen(false)}
          onSave={handleAddCabinet}
          maxWidth={project.roomWidth}
        />
      )}
    </div>
  );
};

export default NewProject;
