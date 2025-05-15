
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';

interface CabinetListProps {
  onAddCabinet: () => void;
  onEditCabinet: (cabinet: Cabinet) => void;
}

const CabinetList: React.FC<CabinetListProps> = ({ onAddCabinet, onEditCabinet }) => {
  const { cabinets, deleteCabinet } = useProject();

  return (
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
                  <Button size="sm" variant="outline" onClick={() => onEditCabinet(cabinet)}>
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
      
      <Button onClick={onAddCabinet} className="mt-4">
        Adaugă Corp Nou
      </Button>
    </div>
  );
};

export default CabinetList;
