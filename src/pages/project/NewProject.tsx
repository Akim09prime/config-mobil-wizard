
import React, { useState } from 'react';
import CabinetConfigurator from '@/components/cabinet/CabinetConfigurator';
import {
  calculateProjectMaterialTotal,
  calculateProjectAccessoryTotal,
  calculateProjectTotal
} from '@/services/calculations';
import { useToast } from '@/components/ui/use-toast';
import { getFurniturePresets } from '@/services/storage';
import { generateQuotePDF } from '@/services/pdf';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Project {
  name: string;
  clientName: string;
  clientEmail: string;
  roomWidth: number;
  roomHeight: number;
  roomDepth: number;
  cabinets: any[]; // Would be better to define a specific type for cabinets
}

const NewProject = () => {
  const [project, setProject] = useState<Project>({
    name: '',
    clientName: '',
    clientEmail: '',
    roomWidth: 0,
    roomHeight: 0,
    roomDepth: 0,
    cabinets: [],
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isCabinetModalOpen, setIsCabinetModalOpen] = useState(false);
  const { toast } = useToast();
  const [presetAdded, setPresetAdded] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [applyTva, setApplyTva] = useState(true);
  const [pricingSettings, setPricingSettings] = useState({
    markup: 0.2,
    transport: 50,
  });

  const handleAddCabinet = (cabinet: any) => {
    // Calculate total width of existing cabinets
    const existingWidth = project.cabinets.reduce(
      (sum, cab) => sum + cab.dimensions.width, 
      0
    );
    
    // Check if new cabinet fits
    if ((existingWidth + cabinet.dimensions.width) <= project.roomWidth) {
      setProject(prevProject => ({
        ...prevProject,
        cabinets: [...prevProject.cabinets, cabinet],
      }));
      setIsCabinetModalOpen(false);
      setPresetAdded(true);
    } else {
      toast({
        title: "Eroare",
        description: "Nu încape corpul în spațiu",
        variant: "destructive",
      });
    }
  };

  const handleSaveProject = () => {
    // Save project logic would go here
    console.log('Project saved:', project);
    window.location.href = '/projects';
  };

  const goToNextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prevStep => Math.max(1, prevStep - 1));
  };

  const handleCloneProject = () => {
    const clonedProject = {
      ...project,
      name: `${project.name} (Clone)`,
    };
    setProject(clonedProject);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!project.name && !!project.clientName && !!project.clientEmail;
      case 2:
        return project.roomWidth > 0 && project.roomHeight > 0 && project.roomDepth > 0;
      case 3:
        return presetAdded || project.cabinets.length > 0;
      case 4:
        return project.cabinets.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="mb-4">
              <Label htmlFor="projectName">Nume Proiect</Label>
              <Input
                id="projectName"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="clientName">Nume Client</Label>
              <Input
                id="clientName"
                value={project.clientName}
                onChange={(e) => setProject({ ...project, clientName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="clientEmail">Email Client</Label>
              <Input
                id="clientEmail"
                type="email"
                value={project.clientEmail}
                onChange={(e) => setProject({ ...project, clientEmail: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="mb-4">
              <Label htmlFor="roomWidth">Lățime Cameră (cm)</Label>
              <Input
                id="roomWidth"
                type="number"
                value={project.roomWidth || ''}
                onChange={(e) => setProject({ ...project, roomWidth: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="roomHeight">Înălțime Cameră (cm)</Label>
              <Input
                id="roomHeight"
                type="number"
                value={project.roomHeight || ''}
                onChange={(e) => setProject({ ...project, roomHeight: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="roomDepth">Adâncime Cameră (cm)</Label>
              <Input
                id="roomDepth"
                type="number"
                value={project.roomDepth || ''}
                onChange={(e) => setProject({ ...project, roomDepth: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <Button onClick={() => setIsCabinetModalOpen(true)} className="mb-4">
              Custom
            </Button>
            
            <Dialog open={isCabinetModalOpen} onOpenChange={setIsCabinetModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurare Corp</DialogTitle>
                </DialogHeader>
                <CabinetConfigurator 
                  onSave={handleAddCabinet} 
                  onCancel={() => setIsCabinetModalOpen(false)} 
                />
              </DialogContent>
            </Dialog>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {getFurniturePresets().map((preset, index) => (
                <div key={index} className="border rounded-md p-4">
                  <p className="font-medium">{preset.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setProject(prevProject => ({
                          ...prevProject,
                          cabinets: [...prevProject.cabinets, { ...preset, isPreset: true }],
                        }));
                        setPresetAdded(true);
                      }}
                    >
                      Adaugă direct
                    </Button>
                    <Button 
                      onClick={() => {
                        // Open configurator with preset data
                        setIsCabinetModalOpen(true);
                      }}
                    >
                      Configurează
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="mb-4">
              <Button onClick={() => setIsCabinetModalOpen(true)}>
                + Adaugă Corp
              </Button>
              <Dialog open={isCabinetModalOpen} onOpenChange={setIsCabinetModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurare Corp</DialogTitle>
                  </DialogHeader>
                  <CabinetConfigurator 
                    onSave={handleAddCabinet} 
                    onCancel={() => setIsCabinetModalOpen(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            {project.cabinets.length > 0 ? (
              <Table>
                <TableCaption>Lista Corpuri Adăugate</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categorie</TableHead>
                    <TableHead>Subcategorie</TableHead>
                    <TableHead>Lățime</TableHead>
                    <TableHead>Înălțime</TableHead>
                    <TableHead>Adâncime</TableHead>
                    <TableHead>Cost Materiale</TableHead>
                    <TableHead>Cost Accesorii</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.cabinets.map((cabinet, index) => (
                    <TableRow key={index}>
                      <TableCell>{cabinet.category}</TableCell>
                      <TableCell>{cabinet.subcategory}</TableCell>
                      <TableCell>{cabinet.dimensions?.width} cm</TableCell>
                      <TableCell>{cabinet.dimensions?.height} cm</TableCell>
                      <TableCell>{cabinet.dimensions?.depth} cm</TableCell>
                      <TableCell>{cabinet.materialCost || 0} lei</TableCell>
                      <TableCell>{cabinet.accessoryCost || 0} lei</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">Nu există corpuri adăugate.</p>
            )}
          </div>
        );
      case 5:
        return (
          <div>
            <p>În curs de implementare: aranjarea vizuală va fi disponibilă curând.</p>
          </div>
        );
      case 6:
        const materialCost = calculateProjectMaterialTotal(project.cabinets);
        const accessoryCost = calculateProjectAccessoryTotal(project.cabinets);
        const finalTotal = calculateProjectTotal(materialCost, accessoryCost, pricingSettings, applyTva);
        
        return (
          <div>
            <Table>
              <TableCaption>Rezumat Proiect</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Descriere</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Cost Materiale</TableCell>
                  <TableCell>{materialCost.toFixed(2)} lei</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cost Accesorii</TableCell>
                  <TableCell>{accessoryCost.toFixed(2)} lei</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>{(materialCost + accessoryCost).toFixed(2)} lei</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Manoperă ({(pricingSettings.markup * 100).toFixed(0)}%)</TableCell>
                  <TableCell>{((materialCost + accessoryCost) * pricingSettings.markup).toFixed(2)} lei</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Transport</TableCell>
                  <TableCell>{pricingSettings.transport} lei</TableCell>
                </TableRow>
                {applyTva && (
                  <TableRow>
                    <TableCell>TVA (19%)</TableCell>
                    <TableCell>
                      {(((materialCost + accessoryCost) * (1 + pricingSettings.markup) + pricingSettings.transport) * 0.19).toFixed(2)} lei
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-bold">Cost Final</TableCell>
                  <TableCell className="font-bold">{finalTotal.toFixed(2)} lei</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
                <DialogTrigger asChild>
                  <Button>Cere Ofertă</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ofertă Proiect</DialogTitle>
                  </DialogHeader>
                  <Table>
                    <TableCaption>Detalii Ofertă</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descriere</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Cost Materiale</TableCell>
                        <TableCell>{materialCost.toFixed(2)} lei</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cost Accesorii</TableCell>
                        <TableCell>{accessoryCost.toFixed(2)} lei</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Subtotal</TableCell>
                        <TableCell>{(materialCost + accessoryCost).toFixed(2)} lei</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Manoperă ({(pricingSettings.markup * 100).toFixed(0)}%)</TableCell>
                        <TableCell>{((materialCost + accessoryCost) * pricingSettings.markup).toFixed(2)} lei</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Transport</TableCell>
                        <TableCell>{pricingSettings.transport} lei</TableCell>
                      </TableRow>
                      {applyTva && (
                        <TableRow>
                          <TableCell>TVA (19%)</TableCell>
                          <TableCell>
                            {(((materialCost + accessoryCost) * (1 + pricingSettings.markup) + pricingSettings.transport) * 0.19).toFixed(2)} lei
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell className="font-bold">Cost Final</TableCell>
                        <TableCell className="font-bold">{finalTotal.toFixed(2)} lei</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <DialogFooter>
                    <Button onClick={() => setIsQuoteModalOpen(false)}>Închide</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => generateQuotePDF(project)}>
                Generează PDF
              </Button>
              
              <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogTrigger asChild>
                  <Button>Trimite Email</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Trimite Email</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Către:
                      </Label>
                      <Input id="email" value={project.clientEmail} className="col-span-3" readOnly />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subject" className="text-right">
                        Subiect:
                      </Label>
                      <Input id="subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="body" className="text-right">
                        Mesaj:
                      </Label>
                      <Textarea id="body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>Închide</Button>
                    <Button>Trimite</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button onClick={handleCloneProject}>
                Clonează Proiect
              </Button>
              
              <Button onClick={handleSaveProject}>
                Salvează Proiect
              </Button>
            </div>
          </div>
        );
      default:
        return <p>Pas necunoscut</p>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="text-sm font-medium mb-2">
          Pasul {currentStep} din 6
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {renderStepContent(currentStep)}
      
      <div className="flex justify-between mt-6">
        <Button 
          onClick={goToPrevStep} 
          disabled={currentStep === 1}
          variant="outline"
        >
          Înapoi
        </Button>
        
        {currentStep === 6 ? (
          <Button onClick={handleSaveProject}>
            Salvează Proiect
          </Button>
        ) : (
          <Button 
            onClick={goToNextStep} 
            disabled={!isStepValid(currentStep)}
          >
            Înainte
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewProject;
