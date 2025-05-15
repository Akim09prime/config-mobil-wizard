import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StorageKeys, create, getFurniturePresets } from '@/services/storage';
import { generateQuotePDF } from '@/services/pdf';
import { toast } from '@/hooks/use-toast';
import CabinetWrapper from '@/components/cabinet/CabinetWrapper';
import ProjectForm from '@/components/project/ProjectForm';
import PresetSelector from '@/components/project/PresetSelector';
import CabinetList from '@/components/project/CabinetList';
import ProjectSummary from '@/components/project/ProjectSummary';
import { ProjectProvider, useProject } from '@/contexts/ProjectContext';
import ProjectLayout from "../../components/layout/ProjectLayout";

interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total: number;
  cabinets: Cabinet[];
}

const ProjectContent: React.FC = () => {
  const navigate = useNavigate();
  const { 
    projectName, 
    clientName, 
    cabinets, 
    setFurniturePresets, 
    materialTotal, 
    accessoryTotal, 
    addCabinet, 
    updateCabinet 
  } = useProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCabinet, setCurrentCabinet] = useState<Cabinet | null>(null);

  useEffect(() => {
    // Load furniture presets
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
  }, [setFurniturePresets]);

  const handleSubmit = () => {
    if (!projectName || !clientName) {
      toast({
        title: "Eroare",
        description: 'Numele proiectului și numele clientului sunt obligatorii.',
        variant: "destructive"
      });
      return;
    }

    if (cabinets.length === 0) {
      toast({
        title: "Eroare",
        description: 'Adăugați cel puțin un corp pentru a crea proiectul.',
        variant: "destructive"
      });
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
      toast({
        title: "Succes",
        description: 'Proiectul a fost creat cu succes!'
      });
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Eroare",
        description: 'Nu s-a putut crea proiectul.',
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (!projectName || !clientName) {
      toast({
        title: "Eroare",
        description: 'Numele proiectului și numele clientului sunt obligatorii.',
        variant: "destructive"
      });
      return;
    }

    if (cabinets.length === 0) {
      toast({
        title: "Eroare",
        description: 'Adăugați cel puțin un corp pentru a genera oferta.',
        variant: "destructive"
      });
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
      toast({
        title: "Succes",
        description: 'Oferta a fost generată cu succes!'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Eroare",
        description: 'Nu s-a putut genera oferta.',
        variant: "destructive"
      });
    }
  };

  const handleAddCabinet = () => {
    // Create a placeholder cabinet
    const newCabinet: Cabinet = {
      id: `cab_${Date.now()}`,
      name: 'Corp nou',
      width: 600,
      height: 720,
      depth: 560,
      price: 0,
      materials: [],
      accessories: [],
      totalCost: 0,
      pieces: [],
      dimensions: {
        width: 600,
        height: 720,
        depth: 560
      },
      image: null
    };
    
    console.log('Creating new cabinet:', newCabinet);
    setCurrentCabinet(newCabinet);
    setIsModalOpen(true);
  };

  const handleEditCabinet = (cabinet: Cabinet) => {
    console.log('Editing cabinet:', cabinet);
    setCurrentCabinet(cabinet);
    setIsModalOpen(true);
  };

  const handleSaveCabinet = (cabinet: Cabinet) => {
    console.log('Saving cabinet:', cabinet);
    if (cabinets.some(c => c.id === cabinet.id)) {
      // Update existing cabinet
      updateCabinet(cabinet.id, cabinet);
    } else {
      // Add new cabinet
      addCabinet(cabinet);
    }
    setIsModalOpen(false);
    setCurrentCabinet(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCabinet(null);
  };

  // Add console log for debugging
  console.log('Cabinet Modal State:', { isModalOpen, currentCabinet });
  console.log('Current Cabinets:', cabinets);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Proiect Nou</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProjectForm />
          <PresetSelector />
          <CabinetList onAddCabinet={handleAddCabinet} onEditCabinet={handleEditCabinet} />
          <ProjectSummary />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGeneratePDF}>
            Generează Ofertă PDF
          </Button>
          <Button onClick={handleSubmit}>Crează Proiect</Button>
        </CardFooter>
      </Card>

      {isModalOpen && (
        <CabinetWrapper
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCabinet}
          initialCabinet={currentCabinet || {}}
        />
      )}
    </div>
  );
};

const NewProject = () => {
  return (
    <ProjectLayout>
      <ProjectContent />
    </ProjectLayout>
  );
};

export default NewProject;
