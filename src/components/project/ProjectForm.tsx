
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProject } from '@/contexts/ProjectContext';

const ProjectForm: React.FC = () => {
  const { projectName, setProjectName, clientName, setClientName } = useProject();

  return (
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
  );
};

export default ProjectForm;
